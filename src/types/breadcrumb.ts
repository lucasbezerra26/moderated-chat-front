export interface BreadcrumbItem {
  icon?: string
  label: string
  url?: string | null
}

export interface BreadcrumbConfig {
  [key: string]: BreadcrumbItem[]
}
