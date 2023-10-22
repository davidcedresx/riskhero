import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API
})

api.interceptors.request.use(
    (config) => {
        const jwt = localStorage.getItem('jwt')
        if (jwt === null) return config

        config.headers['Authorization'] = `Bearer ${jwt.slice(1, -1)}`
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api
