
interface OptionItemValue {
  label: string
  value: string
}

interface ApiParams {
  query?: string[]
  body?: string[]
}

interface PackageModel {
  name: string
  // Production domain
  baseUrl?: string
  // Debug domain
  debugBase?: string
  scriptUrl: string
  cssUrl: string
  description?: string
}