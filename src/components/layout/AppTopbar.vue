<script setup lang="ts">
import Popover from 'primevue/popover'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import { ref, inject } from 'vue'
import { useLayout } from '@/components/ui/sidecar/composables/layout'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const { onMenuToggle } = useLayout()
const authStore = useAuthStore()
const router = useRouter()
const popoverRef = ref()

// Usar a variável global do sistema
const appName = inject<string>('appName', 'Moderated Chat')

const togglePopover = (event: Event) => {
  popoverRef.value.toggle(event)
}

const handleLogout = async () => {
  try {
    // Fechar o popover primeiro
    if (popoverRef.value) {
      popoverRef.value.hide()
    }

    // Executar logout na store (isso já limpa o storage)
    await authStore.logout()

    // Redirecionar para login
    await router.push({ name: 'login' })
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    // Mesmo com erro, forçar redirecionamento
    await router.push({ name: 'login' })
  }
}

const handleProfileClick = () => {
  popoverRef.value.hide()
  router.push({ name: 'profile' })
}

const handleLogoutClick = () => {
  popoverRef.value.hide()
  handleLogout()
}

const getUserInitials = () => {
  if (!authStore.user) return 'U'

  const name = authStore.user.name
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  return authStore.user.email.charAt(0).toUpperCase()
}
</script>

<template>
  <div class="shadow-sm bg-white top-0 z-10">
    <Toolbar class="border-0 p-4">
      <template #start>
        <div class="flex items-center justify-center gap-2">
          <img src="/src/assets/img/logo.png" alt="Logo" class="h-6" />
          <span class="font-semibold text-2xl text-primary-500">{{ appName }}</span>
        </div>
        <div class="flex items-center justify-center gap-2 ml-5">
          <button
            class="ml-2 transition-colors layout-menu-button flex items-center justify-center"
            @click="onMenuToggle()"
          >
            <i class="pi pi-bars text-primary-500 text-2xl flex items-center justify-center"></i>
          </button>
        </div>
      </template>

      <template #end>
        <div class="flex items-center gap-4">
          <!-- Informações do usuário -->
          <div class="hidden md:flex flex-col items-end">
            <span class="text-sm font-medium text-gray-900">
              {{ authStore.userDisplayName }}
            </span>
            <span class="text-xs text-gray-500">
              {{ authStore.user?.email }}
            </span>
          </div>

          <!-- Avatar e menu dropdown -->
          <Button
            ref="buttonRef"
            type="button"
            class="p-0"
            @click="togglePopover"
            rounded
            variant="text"
          >
            <Avatar
              size="large"
              shape="circle"
              class="bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              style="max-height: 40px; max-width: 40px"
              :label="getUserInitials()"
            />
          </Button>

          <!-- Popover com opções do usuário -->
          <Popover ref="popoverRef" id="popover-profile">
            <div class="p-4 w-64">
              <!-- Cabeçalho do perfil -->
              <div class="flex items-center gap-3 pb-4 border-b border-gray-200">
                <Avatar
                  size="normal"
                  shape="circle"
                  class="bg-primary-500 text-white"
                  :label="getUserInitials()"
                />
                <div class="flex-1">
                  <p class="font-medium text-gray-900">
                    {{ authStore.userDisplayName }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ authStore.user?.email }}
                  </p>
                </div>
              </div>

              <!-- Opções do menu -->
              <div class="mt-4 space-y-2">
                <Button
                  variant="text"
                  class="w-full justify-start p-2 text-gray-700 hover:bg-gray-100"
                  @click="handleProfileClick"
                >
                  <i class="pi pi-user mr-2"></i>
                  Meu Perfil
                </Button>

                <hr class="my-2" />

                <Button
                  variant="text"
                  class="w-full justify-start p-2 text-red-600 hover:bg-red-50"
                  @click="handleLogoutClick"
                >
                  <i class="pi pi-sign-out mr-2"></i>
                  Sair
                </Button>
              </div>
            </div>
          </Popover>
        </div>
      </template>
    </Toolbar>
  </div>
</template>

<style scoped>
.layout-menu-button {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.layout-menu-button:hover {
  background-color: rgb(var(--p-primary-500) / 0.1);
}
</style>
