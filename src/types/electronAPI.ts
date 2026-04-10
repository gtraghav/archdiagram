export interface DiagramFile {
  version: string
  viewport: { x: number; y: number; zoom: number }
  nodes: unknown[]
  edges: unknown[]
  metadata: {
    title: string
    createdAt: string
    updatedAt: string
  }
}

export interface OpenFileResult {
  filePath: string
  content: DiagramFile
}

export type MenuActionType = 'new' | 'open' | 'save' | 'save-as' | 'export-pdf' | 'export-png' | 'delete-selected'

export interface MenuAction {
  type: MenuActionType
}

export interface AppSettings {
  customIconsDir: string | null
}

export interface ElectronAPI {
  openFile: () => Promise<OpenFileResult | null>
  saveFile: (content: DiagramFile, filePath?: string) => Promise<string | null>
  exportPNG: (dataUrl: string, outputPath: string) => Promise<void>
  exportRawFile: (base64: string, outputPath: string) => Promise<void>
  getSavePNGPath: () => Promise<string | null>
  getSavePDFPath: () => Promise<string | null>
  loadCustomIcons: () => Promise<{ manifest: ProviderManifest; svgs: Record<string, string> } | null>
  onMenuAction: (callback: (action: MenuAction) => void) => () => void
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  pickIconsDir: () => Promise<string | null>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

// Icon registry types
export interface IconEntry {
  id: string
  name: string
  provider: 'azure' | 'aws' | 'custom'
  category: string
  tags: string[]
  svgPath: string
}

export interface ProviderManifest {
  provider: string
  version: string
  categories: Array<{
    name: string
    icons: IconEntry[]
  }>
}
