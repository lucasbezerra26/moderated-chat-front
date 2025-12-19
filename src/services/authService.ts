import axiosInstance from '@/axios/globalAxios'
import type { User } from '@/stores/authStore'
import axios from 'axios'

export interface AuthResponse {
  access: string
  refresh: string
}

export interface UserDataResponse {
  user: User
}

const authService = {
  async login(email: string, password: string): Promise<AuthResponse | null> {
    try {
      const response = await axiosInstance.post('auth/login/', { email, password })

      if (response.status === 200 && response.data.access && response.data.refresh) {
        return {
          access: response.data.access,
          refresh: response.data.refresh,
        }
      }

      return null
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status
        const errorData = error.response.data

        if (statusCode === 401) {
          throw new Error('Credenciais inválidas. Verifique seu email e senha.')
        } else if (statusCode === 400) {
          const message =
            errorData?.detail || errorData?.non_field_errors?.[0] || 'Dados de login inválidos'
          throw new Error(message)
        } else if (statusCode === 500) {
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.')
        } else if (statusCode === 429) {
          throw new Error('Muitas tentativas de login. Aguarde alguns minutos.')
        }
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
    }
  },

  async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await axiosInstance.post('auth/refresh/', {
        refresh: refreshToken,
      })

      if (response.status === 200 && response.data.access) {
        return response.data.access
      }

      return null
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      return null
    }
  },

  async logout(): Promise<void> {
    console.log('Logout realizado com sucesso')
  },
}

export { authService }

