<template>
  <div class="p-3 rounded-lg mb-4">
    <div class="flex flex-row justify-between items-center gap-4">
      <Breadcrumb
        :model="primeBreadcrumbs"
        :home="homeItem"
        class="text-sm bg-transparent p-0 border-0"
      >
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a
              :href="href"
              v-bind="props.action"
              @click="navigate"
              class="text-primary hover:text-primary-600"
            >
              <span v-if="item.icon" :class="[item.icon, 'mr-2']" />
              <span>{{ item.label }}</span>
            </a>
          </router-link>
          <span v-else class="text-surface-600">
            <span v-if="item.icon" :class="[item.icon, 'mr-2']" />
            <span>{{ item.label }}</span>
          </span>
        </template>
      </Breadcrumb>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumb from 'primevue/breadcrumb'

const router = useRouter()

import type { BreadcrumbItem } from '@/types/breadcrumb'

// Propriedades
const props = defineProps({
  breadcrumbs: {
    type: Array as () => BreadcrumbItem[],
    required: true,
  },
})

// Item home separado para o PrimeVue Breadcrumb
const homeItem = computed(() => {
  const homeItemData = props.breadcrumbs?.[0]
  if (homeItemData?.url) {
    return {
      icon: homeItemData.icon || 'pi pi-home',
      route: homeItemData.url,
    }
  }
  return {
    icon: 'pi pi-home',
    route: '/home',
  }
})

const primeBreadcrumbs = computed(() => {
  // Remover o primeiro item (home) já que ele é tratado separadamente
  const items = props.breadcrumbs?.slice(1) || []

  return items.map((item) => ({
    label: item.label,
    icon: item.icon,
    // Usar 'route' para navegação interna ou 'url' para externa
    ...(item.url && {
      route: item.url.startsWith('/') ? item.url : undefined,
      url: item.url.startsWith('/') ? undefined : item.url,
    }),
  }))
})
</script>
