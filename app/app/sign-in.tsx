import { router } from 'expo-router'
import { Image, StyleSheet, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useStore } from '../state/store'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '../api/api'
import Button from '../components/Button'
import Input from '../components/Input'
import Typography from '../components/Typography'
import VStack from '../components/VStack'
import { User } from '../state/interfaces'

const schema = z.object({
    email: z.string().min(1, { message: 'Required' }),
    password: z.string().min(1, { message: 'Required' })
})

type Form = {
    email: string
    password: string
}

const Signin = () => {
    const { login } = useStore()
    const [loading, setLoading] = useState(false)
    const { control, handleSubmit } = useForm<Form>({
        resolver: zodResolver(schema)
    })

    const handleLogin = async (payload: Form) => {
        try {
            setLoading(true)

            const response = await api.post<{
                jwt: string
                user: User
                client: 'app'
            }>('/sessions', payload)

            login(response.data.jwt)
            router.replace('/inspections')
        } catch (error) {
            setLoading(false)
        }
    }

    const handleError = () => {
        setLoading(false)
    }

    return (
        <View style={styles.root}>
            <VStack>
                <Image
                    source={require('../assets/ssst.png')}
                    style={styles.logo}
                />
                <Typography variant="title">SSST ULA</Typography>
                <Input
                    spellCheck={false}
                    autoCapitalize="none"
                    textContentType="emailAddress"
                    placeholder="usuario"
                    name="email"
                    control={control}
                />

                <Input
                    secureTextEntry={true}
                    passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
                    placeholder="contraseña"
                    name="password"
                    control={control}
                />

                <Button
                    loading={loading}
                    onPress={handleSubmit(handleLogin, handleError)}
                >
                    Entrar
                </Button>
            </VStack>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        justifyContent: 'center',
        flex: 1,
        padding: 32
    },
    logo: {
        height: 96,
        width: 96
    }
})

export default Signin
