import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// PrimeVue e Componentes
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Ripple from 'primevue/ripple'
import StyleClass from 'primevue/styleclass'

// Tema
import Aura from '@primeuix/themes/aura'

// Inicialização da aplicação
const app = createApp(App)

// Injeção de variáveis globais
app.config.globalProperties.appName = 'Moderated Chat'
app.provide('appName', 'Moderated Chat') // Disponível via inject()

// Registro dos plugins principais
app.use(createPinia())
app.use(router)

// Configuração do PrimeVue e seus serviços
app.use(ToastService)
app.use(ConfirmationService)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'light',
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue',
      },
    },
  },
  locale: {
    passwordPrompt: 'Insira uma senha',
    weak: 'Fraca',
    medium: 'Média',
    strong: 'Forte',
  },
})

// Registro de diretivas
app.directive('ripple', Ripple)
app.directive('styleclass', StyleClass)
app.directive('tooltip', Tooltip)

// Montagem da aplicação
app.mount('#app')
