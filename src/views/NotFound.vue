<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary mb-4">404</h1>
      <p class="text-2xl text-gray-700 mb-8">Página não encontrada</p>
      <p class="text-gray-500 mb-8">A página que você está procurando não existe ou foi movida.</p>
      <router-link
        to="/"
        class="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
      >
        Voltar para a página inicial
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'Página não encontrada | Moderated Chat'
})
</script>

<style scoped>
.bg-primary-dark {
  filter: brightness(0.9);
}
</style>
