import { PrismaClient } from '@prisma/client'
import { Queue, Worker } from 'bullmq'
import express from 'express'
import { Request } from 'express-jwt'
import { nanoid } from 'nanoid'
import puppeteer, { Browser } from 'puppeteer'

import { User } from '../interfaces.js'
import { minioClient, s3 } from '../s3.js'

const prismaClient = new PrismaClient()
const reports = express.Router()

const connection = {
    host: process.env.REDISHOST,
    port: Number(process.env.REDISPORT),
    username: process.env.REDISUSER,
    password: process.env.REDISPASSWORD
}

const queue = new Queue('reports', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    }
})

reports.get('/', async (req: Request<User>, res) => {
    const session = req.auth!

    const reports = await prismaClient.report.findMany({
        where: {
            inspection: {
                ...(session.role !== 'ADMIN' && {
                    area: {
                        organizationId: session.organizationId
                    }
                }),
                ...(session.role === 'EMPLOYEE' && {
                    inspector: {
                        id: session.id
                    }
                })
            }
        },
        include: {
            inspection: {
                include: {
                    inspector: true,
                    area: true
                }
            }
        }
    })

    res.json(reports)
})

reports.get('/:id', async (req: Request<User>, res) => {
    const session = req.auth!

    const report = await prismaClient.report.findFirstOrThrow({
        where: {
            id: Number(req.params.id),
            inspection: {
                ...(session.role !== 'ADMIN' && {
                    area: {
                        organizationId: session.organizationId
                    }
                }),
                ...(session.role === 'EMPLOYEE' && {
                    inspector: {
                        id: session.id
                    }
                })
            }
        },
        include: {
            inspection: {
                include: {
                    inspector: true,
                    area: true
                }
            }
        }
    })

    res.json(report)
})

reports.post(
    '/',
    // validateRequest({
    //     body: z.object({
    //         inspectionId: z.number(),
    //         conclusion: z.string()
    //     })
    // }),
    async (req: Request<User>, res) => {
        const session = req.auth!
        if (session.role !== 'EMPLOYEE') return res.status(401)

        await prismaClient.inspection.findFirstOrThrow({
            where: {
                id: req.body.inspectionId,
                status: 'DONE', // previous action
                inspector: {
                    id: session.id
                },
                area: {
                    organizationId: session.organizationId
                }
            }
        })

        const report = await prismaClient.report.create({
            data: {
                inspectionId: req.body.inspectionId,
                conclusion: req.body.conclusion,
                createdAt: new Date()
            }
        })

        queue.add('generate-pdf', {
            reportId: report.id
        })

        res.status(200).send()
    }
)

new Worker(
    'reports',
    async (job) => {
        console.log('executing job', job.name, job.data)

        const reportId = job.data.reportId

        let browser: Browser | null = null
        let error: unknown | null = null

        try {
            browser = await puppeteer.connect({
                browserWSEndpoint:
                    'wss://chrome.browserless.io?token=' +
                    process.env.BROWSERLESS_TOKEN
            })

            const page = await browser.newPage()

            await page.goto('https://ssst.io/start', {
                waitUntil: 'networkidle0'
            })

            await page.type('input[name="email"]', process.env.ADMIN_USER!)
            await page.type(
                'input[name="password"]',
                process.env.ADMIN_PASSWORD!
            )
            await page.click('button[type="submit"]')
            await page.waitForNetworkIdle()

            await page.goto('https://ssst.io/reports/' + reportId, {
                waitUntil: 'networkidle0'
            })

            const pdf = await page.pdf({
                margin: {
                    left: 32,
                    top: 32,
                    right: 32,
                    bottom: 32
                },
                printBackground: true
            })

            const key = `${nanoid()}.pdf`

            await s3.putObject({
                Bucket: 'reports',
                Key: key,
                Body: pdf,
                ContentType: 'application/pdf'
            })

            const url = await minioClient.presignedGetObject('reports', key)

            await prismaClient.report.update({
                where: {
                    id: reportId
                },
                data: {
                    url
                }
            })
        } catch (e) {
            error = e
            console.log(e)
        } finally {
            if (browser) browser.close()
        }

        // make the job fail
        if (error !== null) throw new Error()
    },
    {
        connection
    }
)

export default reports
