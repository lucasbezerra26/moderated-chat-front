<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import type { Item } from '@/components/ui/sidecar/interfaces/menu.ts'
import type { BreadcrumbItem } from '@/types/breadcrumb'

const route = useRoute()

const itemsSidecar = computed<Item[]>(() => [
  {
    items: [
      { label: 'Chat', icon: 'pi pi-fw pi-comments', to: '/home' },
    ],
  },
])

const breadcrumbsConfig: Record<string, BreadcrumbItem[]> = {
  '/home': [{ icon: 'pi pi-comments', label: 'Chat' }],
  '/profile': [{ icon: 'pi pi-user', label: 'Meu Perfil' }],
}

const breadcrumbs = computed(() => {
  return breadcrumbsConfig[route.path] || [{ icon: 'pi pi-home', label: 'Início' }]
})
</script>

<template>
  <AppLayout :items-sidecar="itemsSidecar" :breadcrumbs="breadcrumbs" />
</template>

