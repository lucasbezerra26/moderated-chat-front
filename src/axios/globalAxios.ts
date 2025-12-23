import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router'

const axiosInstance = axios.create({
  baseURL: '/api/',
  timeout: 30000,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('auth/login') &&
      !originalRequest.url?.includes('auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        if (authStore.hasRefreshToken) {
          const success = await authStore.refreshToken()

          if (success && authStore.accessToken) {
            processQueue(null, authStore.accessToken)
            originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
            return axiosInstance(originalRequest)
          }
        }

        processQueue(new Error('Token refresh failed'), null)
        await authStore.logout()
        await router.push({ name: 'login' })
        return Promise.reject(error)
      } catch (refreshError) {
        processQueue(refreshError, null)
        await authStore.logout()
        await router.push({ name: 'login' })
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance

