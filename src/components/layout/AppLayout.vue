<script setup lang="ts">
import AppTopbar from '@/components/layout/AppTopbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <AppTopbar class="app-topbar" />

    <div class="flex-grow flex">
      <main class="layout-main-container flex flex-col w-full">
        <div class="layout-main p-4 m-4 flex-grow shadow-xl bg-white rounded-2xl">
          <router-view />
        </div>
        <AppFooter />
      </main>
    </div>
  </div>
</template>
