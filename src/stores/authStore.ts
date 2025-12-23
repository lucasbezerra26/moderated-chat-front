import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { authService } from '@/services/authService'
import { jwtDecode } from 'jwt-decode'

export interface User {
  id: string
  email: string
  name: string
}

interface JWTPayload {
  exp: number
  iat: number
  user_id: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshTokenValue = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  const userDisplayName = computed(() => {
    if (!user.value) return ''
    return user.value.name || user.value.email
  })

  const isTokenExpired = computed(() => {
    if (!accessToken.value) return true

    try {
      const decoded = jwtDecode<JWTPayload>(accessToken.value)
      const now = Date.now() / 1000
      return decoded.exp < now
    } catch {
      return true
    }
  })

  const checkTokenValidity = (): boolean => {
    if (!accessToken.value) return false

    try {
      const decoded = jwtDecode<JWTPayload>(accessToken.value)
      const now = Date.now() / 1000
      const bufferTime = 60
      return decoded.exp > now + bufferTime
    } catch {
      return false
    }
  }

  const hasRefreshToken = computed(() => !!refreshTokenValue.value)

  watch(
    [accessToken, refreshTokenValue, user],
    () => {
      if (accessToken.value && refreshTokenValue.value) {
        const dataToStore = {
          accessToken: accessToken.value,
          refreshToken: refreshTokenValue.value,
          user: user.value,
        }
        localStorage.setItem('auth-store', JSON.stringify(dataToStore))
      } else {
        localStorage.removeItem('auth-store')
      }
    },
    { deep: true },
  )

  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access
    refreshTokenValue.value = refresh
  }

  const setUser = (userData: User) => {
    user.value = userData
  }

  const clearAuthData = () => {
    accessToken.value = null
    refreshTokenValue.value = null
    user.value = null
    error.value = null
    localStorage.removeItem('auth-store')
  }

  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      const authResponse = await authService.login(email, password)

      if (authResponse) {
        setTokens(authResponse.access, authResponse.refresh)

        const decoded = jwtDecode<JWTPayload & { email?: string; name?: string }>(authResponse.access)
        setUser({
          id: decoded.user_id,
          email: decoded.email || email,
          name: decoded.name || email.split('@')[0],
        })

        return true
      }

      error.value = 'Falha ao fazer login'
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao fazer login'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      clearAuthData()
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshTokenValue.value) return false

    try {
      const newAccessToken = await authService.refreshToken(refreshTokenValue.value)

      if (newAccessToken) {
        accessToken.value = newAccessToken
        return true
      }

      return false
    } catch {
      return false
    }
  }

  const initializeAuth = async () => {
    try {
      const storedData = localStorage.getItem('auth-store')
      if (storedData) {
        const parsed = JSON.parse(storedData)
        accessToken.value = parsed.accessToken
        refreshTokenValue.value = parsed.refreshToken
        user.value = parsed.user

        if (isTokenExpired.value && refreshTokenValue.value) {
          const success = await refreshAccessToken()
          if (!success) {
            clearAuthData()
          }
        }
      }
    } catch {
      clearAuthData()
    }
  }

  return {
    accessToken,
    user,
    isLoading,
    error,
    isAuthenticated,
    userDisplayName,
    isTokenExpired,
    hasRefreshToken,
    checkTokenValidity,
    login,
    logout,
    refreshToken: refreshAccessToken,
    initializeAuth,
    setUser,
    clearAuthData,
  }
})

