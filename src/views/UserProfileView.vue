<script setup lang="ts">
import Card from 'primevue/card'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <Card class="shadow-lg">
      <template #title>
        <div class="flex items-center gap-3">
          <i class="pi pi-user text-2xl text-blue-600"></i>
          <h2 class="text-2xl font-bold text-gray-900">Meu Perfil</h2>
        </div>
      </template>

      <template #content>
        <div v-if="authStore.user" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {{ authStore.user.name }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {{ authStore.user.email }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <i class="pi pi-user text-4xl mb-2"></i>
          <p>Nenhuma informação disponível</p>
        </div>
      </template>
    </Card>
  </div>
</template>

