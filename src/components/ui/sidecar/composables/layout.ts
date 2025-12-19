import { reactive, computed, toRefs } from 'vue'

// Tipagem para o layoutConfig
interface LayoutConfig {
  ripple: boolean
  menuMode: 'static' | 'overlay'
  activeMenuItem: string | null
}

// Tipagem para o layoutState
interface LayoutState {
  staticMenuDesktopInactive: boolean
  menuActive: boolean
  profileSidebarVisible: boolean
  configSidebarVisible: boolean
  staticMenuMobileActive: boolean
  menuHoverActive: boolean
}

// Configurações reativas do layout
const layoutConfig = reactive<LayoutConfig>({
  ripple: true,
  menuMode: 'static', // Pode ser 'static' ou 'overlay'
  activeMenuItem: null,
})

// Estado reativo do layout
const layoutState = reactive<LayoutState>({
  staticMenuDesktopInactive: false,
  menuActive: true,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
})

// Função para manipular o layout
export function useLayout() {
  const setActiveMenuItem = (item: string | { value?: string }) => {
    layoutConfig.activeMenuItem = typeof item === 'string' ? item : item.value || null
  }

  const onMenuToggle = () => {
    layoutState.menuActive = !layoutState.menuActive
  }

  const isMobileActive = computed(
    () => layoutState.menuActive && layoutConfig.menuMode === 'overlay',
  )

  return {
    layoutConfig: toRefs(layoutConfig),
    layoutState: toRefs(layoutState),
    setActiveMenuItem,
    onMenuToggle,
    isMobileActive,
  }
}
