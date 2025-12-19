<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'

const router = useRouter()
const featuresSection = ref<HTMLElement | null>(null)

const navigateToLogin = () => {
  router.push({ name: 'login' })
}

const scrollToFeatures = () => {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Moderated Chat
            </span>
          </h1>
          <p class="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema de chat colaborativo com moderação automática de mensagens em tempo real
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              label="Entrar na Plataforma"
              icon="pi pi-sign-in"
              @click="navigateToLogin"
              size="large"
              class="px-8 py-3 text-lg"
              severity="info"
            />
            <Button
              label="Saiba Mais"
              icon="pi pi-info-circle"
              @click="scrollToFeatures"
              size="large"
              class="px-8 py-3 text-lg"
              outlined
            />
          </div>
        </div>
      </div>
    </div>

    <div class="py-16 lg:py-24 bg-white" ref="featuresSection">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">O que é o Moderated Chat?</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma plataforma de comunicação em tempo real onde todas as mensagens passam por um
            processo de moderação automática antes de serem entregues aos destinatários.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 class="text-2xl font-semibold text-gray-900 mb-4">Comunicação Segura</h3>
            <p class="text-gray-600 text-lg leading-relaxed mb-6">
              Nosso sistema utiliza moderação assíncrona via Celery para garantir que todas as
              mensagens sejam verificadas antes de chegarem aos destinatários, mantendo um
              ambiente de comunicação saudável e seguro.
            </p>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-700">
                <i class="pi pi-check-circle text-green-600 mr-3"></i>
                Moderação automática em segundo plano
              </li>
              <li class="flex items-center text-gray-700">
                <i class="pi pi-check-circle text-green-600 mr-3"></i>
                Comunicação em tempo real via WebSocket
              </li>
              <li class="flex items-center text-gray-700">
                <i class="pi pi-check-circle text-green-600 mr-3"></i>
                Salas públicas e privadas
              </li>
            </ul>
          </div>
          <div class="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
            <i class="pi pi-comments text-6xl text-blue-600 mb-4"></i>
            <h4 class="text-xl font-semibold text-gray-900 mb-2">Chat em Tempo Real</h4>
            <p class="text-gray-600">
              Troca de mensagens instantânea com moderação transparente
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="py-16 lg:py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Funcionalidades
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Recursos projetados para uma comunicação eficiente e segura
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card class="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md">
            <template #content>
              <div class="text-center p-6">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="pi pi-lock text-blue-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Autenticação JWT</h3>
                <p class="text-gray-600 text-sm">
                  Autenticação segura via JWT tanto para API quanto para conexões WebSocket
                </p>
              </div>
            </template>
          </Card>

          <Card class="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md">
            <template #content>
              <div class="text-center p-6">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="pi pi-users text-purple-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Salas de Chat</h3>
                <p class="text-gray-600 text-sm">
                  Crie salas públicas ou privadas e gerencie participantes
                </p>
              </div>
            </template>
          </Card>

          <Card class="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md">
            <template #content>
              <div class="text-center p-6">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="pi pi-shield text-green-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Moderação</h3>
                <p class="text-gray-600 text-sm">
                  Mensagens moderadas automaticamente via Celery antes da entrega
                </p>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <footer class="bg-gray-900 text-white py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-gray-400">
          &copy; {{ new Date().getFullYear() }} Moderated Chat.
        </p>
      </div>
    </footer>
  </div>
</template>

