<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import AutoComplete from 'primevue/autocomplete'
import { chatService, type CreateRoomData, type Author } from '@/services/chatService'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  created: []
}>()

const toast = useToast()
const isLoading = ref(false)
const form = ref<CreateRoomData>({
  name: '',
  is_private: false,
})
const selectedParticipants = ref<Author[]>([])
const users = ref<Author[]>([])
const userQuery = ref('')

const loadUsers = async (query: string) => {
  const allUsers = await chatService.getUsers()
  users.value = allUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase()))
}

const searchUsers = (event: { query: string }) => {
  loadUsers(event.query)
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'O nome da sala é obrigatório',
      life: 3000,
    })
    return
  }
  isLoading.value = true
  try {
    const room = await chatService.createRoom(form.value)
    for (const user of selectedParticipants.value) {
      await chatService.addParticipant(room.id, user.id)
    }
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Sala criada com sucesso',
      life: 3000,
    })
    emit('created')
    emit('update:visible', false)
    resetForm()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível criar a sala',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    is_private: false,
  }
  selectedParticipants.value = []
  userQuery.value = ''
}

const handleHide = () => {
  resetForm()
  emit('update:visible', false)
}

onMounted(() => {
  loadUsers('')
})
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    header="Nova Sala"
    :style="{ width: '28rem' }"
    @hide="handleHide"
  >
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="name" class="font-medium text-gray-700">Nome da Sala *</label>
        <InputText
          id="name"
          v-model="form.name"
          placeholder="Ex: Equipe de Desenvolvimento"
          class="w-full"
          :disabled="isLoading"
        />
      </div>
      <div class="flex items-center gap-2">
        <Checkbox
          id="is_private"
          v-model="form.is_private"
          :binary="true"
          :disabled="isLoading"
        />
        <label for="is_private" class="text-gray-700 cursor-pointer">
          <span class="font-medium">Sala Privada</span>
          <span class="block text-sm text-gray-500">
            Apenas membros convidados podem participar
          </span>
        </label>
      </div>
      <div class="flex flex-col gap-2">
        <label class="font-medium text-gray-700">Participantes</label>
        <AutoComplete
          v-model="selectedParticipants"
          :suggestions="users"
          field="name"
          multiple
          :forceSelection="true"
          :dropdown="true"
          :disabled="isLoading"
          placeholder="Buscar e adicionar participantes..."
          @complete="searchUsers"
          class="w-full"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2 p-2">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs">{{ slotProps.option.name.charAt(0).toUpperCase() }}</span>
              <span class="text-gray-900">{{ slotProps.option.name }}</span>
              <span class="text-xs text-gray-400 ml-2">{{ slotProps.option.email }}</span>
            </div>
          </template>
          <template #chip="slotProps">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white font-bold">{{ slotProps.value.name.charAt(0).toUpperCase() }}</span>
              {{ slotProps.value.name }}
            </span>
          </template>
        </AutoComplete>
      </div>
    </form>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancelar"
          severity="secondary"
          @click="handleHide"
          :disabled="isLoading"
        />
        <Button
          label="Criar Sala"
          icon="pi pi-plus"
          @click="handleSubmit"
          :loading="isLoading"
        />
      </div>
    </template>
  </Dialog>
</template>

