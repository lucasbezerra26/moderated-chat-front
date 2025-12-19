<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppSidebar from '@/components/ui/sidecar/AppSidebar.vue'
import { useLayout } from '@/components/ui/sidecar/composables/layout.ts'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import type { Item } from '@/components/ui/sidecar/interfaces/menu.ts'
import AppPageHeader from '@/components/layout/AppPageHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const { layoutConfig, layoutState, isMobileActive } = useLayout()

const outsideClickListener = ref<EventListener | null>(null)
import type { BreadcrumbItem } from '@/types/breadcrumb'

const props = defineProps({
  breadcrumbs: {
    type: Array as () => BreadcrumbItem[],
    required: true,
  },
  itemsSidecar: {
    type: Array as () => Item[],
    required: true,
  },
})

watch(isMobileActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener()
  } else {
    unbindOutsideClickListener()
  }
})

// Classes dinâmicas para o container principal
const containerClass = computed(() => ({
  'layout-overlay': layoutConfig.menuMode.value === 'overlay',
  'layout-static': layoutConfig.menuMode.value === 'static',
}))

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event: Event) => {
      if (isOutsideClicked(event) && isMobileActive.value) {
        layoutState.menuActive.value = false
      }
    }
    document.addEventListener('click', outsideClickListener.value)
  }
}

// Remove o listener de cliques fora do menu
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value)
    outsideClickListener.value = null
  }
}

const isOutsideClicked = (event: Event): boolean => {
  const sidebarEl = document.querySelector('.layout-sidebar')
  const topbarEl = document.querySelector('.layout-menu-button')

  return !(
    sidebarEl?.isSameNode(event.target as Node) ||
    sidebarEl?.contains(event.target as Node) ||
    topbarEl?.isSameNode(event.target as Node) ||
    topbarEl?.contains(event.target as Node)
  )
}

const onResize = () => {
  if (window.innerWidth <= 767) {
    layoutConfig.menuMode.value = 'overlay'
    layoutState.menuActive.value = false
  } else {
    layoutConfig.menuMode.value = 'static'
  }
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  onResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <AppTopbar class="app-topbar"></AppTopbar>

    <div class="flex-grow flex">
      <!-- Sidebar com transição -->
      <div class="grid md:grid-cols-6 grid-cols-1 flex-grow w-full">
        <transition
          name="sidebar"
          @enter="layoutState.menuActive.value = true"
          @leave="layoutState.menuActive.value = false"
        >
          <aside
            v-show="layoutState.menuActive.value"
            :class="['layout-sidebar', 'bg-white', containerClass]"
          >
            <app-sidebar :items="props.itemsSidecar" />
          </aside>
        </transition>

        <!-- Main content -->
        <main
          class="layout-main-container flex flex-col"
          :class="layoutState.menuActive.value ? 'col-span-5' : 'col-span-6'"
        >
          <AppPageHeader :breadcrumbs="props.breadcrumbs" class="page-header" />
          <div class="layout-main p-4 m-4 flex-grow shadow-xl bg-white rounded-2xl">
            <router-view />
          </div>
          <AppFooter />
        </main>
      </div>
    </div>

    <!-- Overlay mask -->
    <transition name="mask">
      <div class="layout-mask p-overlay-mask-enter" v-show="isMobileActive"></div>
    </transition>
  </div>
</template>
<style lang="scss" scoped>
/* Sidebar animation */
.sidebar-enter-active,
.sidebar-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.sidebar-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.sidebar-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.sidebar-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Mask animation */
.mask-enter-active,
.mask-leave-active {
  transition: opacity 0.3s ease;
}

.mask-enter-from {
  opacity: 0;
}

.mask-enter-to {
  opacity: 1;
}

.mask-leave-from {
  opacity: 1;
}

.mask-leave-to {
  opacity: 0;
}

/* Sidebar styling */
.layout-sidebar {
  min-width: 16rem;
  min-height: 100vh;
  top: 0;
  left: 0;
  z-index: 10;
}

.layout-mask {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  position: fixed;
}

.layout-overlay {
  position: fixed;
  z-index: 1000;
}

//TODO: Refatorar o sidecr no mobile, retirar fixed de layout-overlay e usar grid-col-6
</style>
