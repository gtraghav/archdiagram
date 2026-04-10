export interface IconEntry {
  id: string
  name: string
  provider: 'azure' | 'aws' | 'custom'
  category: string
  tags: string[]
  svgPath: string
}

export interface ProviderManifest {
  provider: 'azure' | 'aws' | 'custom'
  version: string
  categories: Array<{
    name: string
    icons: IconEntry[]
  }>
}

export interface IconWithSvg extends IconEntry {
  svgContent: string
}

export interface IconRegistry {
  icons: Map<string, IconWithSvg>
  byProvider: Map<string, IconWithSvg[]>
  byCategory: Map<string, IconWithSvg[]>
}
