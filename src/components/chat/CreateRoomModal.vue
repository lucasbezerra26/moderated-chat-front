<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { chatService, type CreateRoomData } from '@/services/chatService'
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

const resetForm = () => {
  form.value = {
    name: '',
    is_private: false,
  }
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
    await chatService.createRoom(form.value)
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

const handleHide = () => {
  resetForm()
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
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

