import {
    Anchor,
    Badge,
    Button,
    Loader,
    Stack,
    Table,
    Text,
    Title
} from '@mantine/core'
import { format } from 'date-fns'
import { IconEye } from '@tabler/icons-react'
import { Report } from '../../api/interfaces'
import { useQuery } from 'react-query'
import api from '../../api/api'
import es from 'date-fns/locale/es'
import Relaxed from '../../components/Relaxed'
import { useContext } from 'react'
import { SessionContext } from '../../utils/useSession'

const Reports = () => {
    // hooks
    const session = useContext(SessionContext)

    // queries
    const query = useQuery(['FetchReports'], () =>
        api.get<Report[]>('/reports')
    )

    const reports = query.data?.data ?? []

    const emptyMessage =
        session.role === 'EMPLOYEE'
            ? 'Parece que aún no has escrito ningun informe, realiza una inspección primero.'
            : 'Parece que aún no hay informes, asigna nuevas inspecciones.'

    if (query.isFetched === false) return <Loader />

    return (
        <Stack>
            <Title order={1}>Informes</Title>

            {reports.length > 0 && (
                <Table verticalSpacing="lg">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Area</Table.Th>
                            <Table.Th>Inspección</Table.Th>
                            <Table.Th>Inspector</Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {reports.map((report) => (
                            <Table.Tr key={report.id}>
                                <Table.Td>
                                    <Text>{report.inspection.area.name}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light">
                                        {format(
                                            new Date(report.inspection.date),
                                            'MMMM dd,  h:mm bbb',
                                            {
                                                locale: es
                                            }
                                        )}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Text>
                                        {report.inspection.inspector.name}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    {report.url ? (
                                        <Anchor
                                            href={report.url}
                                            target="_blank"
                                            referrerPolicy="no-referrer"
                                        >
                                            <Button
                                                rightSection={
                                                    <IconEye size={14} />
                                                }
                                            >
                                                PDF
                                            </Button>
                                        </Anchor>
                                    ) : (
                                        <Loader size="sm" />
                                    )}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}

            {reports.length === 0 && (
                <Stack align="center" pt="lg">
                    <Relaxed />
                    <Text>{emptyMessage}</Text>
                </Stack>
            )}
        </Stack>
    )
}

export default Reports
