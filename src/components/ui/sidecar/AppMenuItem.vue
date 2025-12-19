<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Item } from '@/components/ui/sidecar/interfaces/menu.ts'

const route = useRoute()

const props = defineProps<{
  item: Item
  index: number
  root: boolean
  parentItemKey?: number | null
}>()

const expandedItems = reactive<Record<number, boolean>>({})
const emit = defineEmits(['expand-parent'])

const toggleExpand = (index: number) => {
  expandedItems[index] = !expandedItems[index]
}

const checkActiveRoute = (item: Item) => {
  return route.path === item.to
}

const expandParentIfNeeded = () => {
  if (props.parentItemKey && props.item.items?.some((subItem) => subItem.to === route.path)) {
    emit('expand-parent', props.parentItemKey)
  }
}

const handleExpandParent = (parentKey: number) => {
  expandedItems[parentKey] = true
}
onMounted(expandParentIfNeeded)
watch(() => route.path, expandParentIfNeeded)
</script>

<template>
  <li class="text-base text-gray-600">
    <div
      v-ripple
      v-if="item.label && root"
      class="p-2 flex items-center justify-between cursor-pointer p-ripple mt-2 ml-1 text-gray-500"
    >
      <div>
        <i v-if="item.icon" :class="item.icon" class="mr-2"></i>
        <span> {{ item.label }}</span>
      </div>
    </div>

    <ul class="p-0 m-0 overflow-hidden">
      <li v-for="(subItem, i) in item.items" :key="i" :class="{ 'ml-3': item.label }">
        <router-link
          v-if="subItem.to"
          :to="subItem.to"
          :class="[
            'flex items-center justify-between p-2 cursor-pointer hover:bg-gray-200',
            { 'text-primary-500': checkActiveRoute(subItem) },
          ]"
        >
          <div class="flex items-center">
            <i :class="subItem.icon" class="mr-2"></i>
            <span>{{ subItem.label }}</span>
          </div>
        </router-link>

        <a
          v-else-if="subItem.url"
          :href="subItem.url"
          :target="subItem.target"
          :class="[
            'flex items-center justify-between p-2 cursor-pointer hover:bg-gray-200',
            { 'text-primary-500': checkActiveRoute(subItem) },
          ]"
        >
          <div class="flex items-center">
            <i :class="subItem.icon" class="mr-2"></i>
            <span class="text-sm">{{ subItem.label }}</span>
          </div>
        </a>

        <div
          v-if="subItem.items"
          v-ripple
          @click="toggleExpand(i)"
          class="p-2 flex items-center justify-between cursor-pointer p-ripple"
        >
          <div class="flex items-center">
            <i :class="subItem.icon" class="mr-2"></i>
            <span>{{ subItem.label }}</span>
          </div>
          <i
            :class="expandedItems[i] ? 'pi pi-chevron-down ' : 'pi pi-chevron-right'"
            style="font-size: 0.6rem"
          ></i>
        </div>

        <transition name="fade" v-if="subItem.items">
          <ul v-show="expandedItems[i]" :ref="'menuitem-' + i" class="mt-2">
            <app-menu-item
              :item="subItem"
              :parentItemKey="i"
              @expand-parent="handleExpandParent"
              :root="false"
              :index="1"
            />
          </ul>
        </transition>
      </li>
    </ul>
  </li>
</template>
