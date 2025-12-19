<script setup lang="ts">
import AppMenuItem from './AppMenuItem.vue'
import { useLayout } from '@/components/ui/sidecar/composables/layout.ts'
import type { Item } from '@/components/ui/sidecar/interfaces/menu.ts'

const { onMenuToggle } = useLayout()
const { isMobileActive } = useLayout()

const props = defineProps<{
  items: Item[]
}>()
</script>

<template>
  <div class="flex flex-col justify-between h-dvh mt-5 bg-white w-full">
    <ul class="w-full rounded-sm text-gray-600 p-2 overflow-auto">
      <!-- Renderiza os itens do menu -->
      <template v-for="(item, i) in props.items" :key="i">
        <app-menu-item v-if="!item.separator" :item="item" :index="i" :root="true" />
        <li v-if="item.separator" class="border-t border-gray-700 my-2"></li>
      </template>
    </ul>

    <!-- Botão para alternar o menu no modo mobile -->
    <div class="button-close-sidecar flex align-center justify-center w-full" v-if="isMobileActive">
      <Button
        @click="onMenuToggle()"
        icon="pi pi-times"
        severity="danger"
        rounded
        aria-label="Cancel"
      />
    </div>
  </div>
</template>
