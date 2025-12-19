<script setup lang="ts">
import { reactive, onMounted, inject, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const appName = inject<string>('appName', 'Moderated Chat')
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  try {
    await authStore.login(form.email, form.password)
    const redirectTo = (route.query.redirect as string) || '/home'
    await router.push(redirectTo)
  } catch (error) {
    console.error('Erro no login:', error)
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    const redirectTo = (route.query.redirect as string) || '/home'
    router.push(redirectTo)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-10 text-center">
          <div
            class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="pi pi-comments text-3xl"></i>
          </div>
          <h1 class="text-2xl font-semibold mb-2">{{ appName }}</h1>
          <p class="text-blue-100 opacity-90">Sistema de Chat com Moderação</p>
        </div>

        <div class="px-8 py-10">
          <div class="text-center mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Bem-vindo!</h2>
            <p class="text-gray-600 text-sm">Faça login para acessar o chat</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div class="relative">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Digite seu email"
                  :disabled="authStore.isLoading"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <i class="pi pi-envelope text-gray-400"></i>
                </div>
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Digite sua senha"
                  :disabled="authStore.isLoading"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  @click="showPassword = !showPassword"
                >
                  <i
                    :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  ></i>
                </button>
              </div>
            </div>

            <div
              v-if="authStore.error"
              class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="pi pi-exclamation-triangle text-red-400"></i>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-700">
                    {{ authStore.error }}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="authStore.isLoading || !form.email || !form.password"
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:hover:transform-none disabled:hover:shadow-none"
              >
                <span v-if="authStore.isLoading" class="flex items-center justify-center">
                  <i class="pi pi-spinner pi-spin mr-2"></i>
                  Entrando...
                </span>
                <span v-else>Entrar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

