import { app } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'

export interface AppSettings {
  customIconsDir: string | null
}

const DEFAULT_ICONS_DIR =
  '/Users/rvenkat/Downloads/Icon-package_01302026.31b40d126ed27079b708594940ad577a86150582/Resource-Icons_01302026/Res_Containers'

export { DEFAULT_ICONS_DIR }

const defaultSettings: AppSettings = {
  customIconsDir: null,
}

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export async function readSettings(): Promise<AppSettings> {
  const path = settingsPath()
  if (!existsSync(path)) return { ...defaultSettings }
  try {
    const raw = await readFile(path, 'utf-8')
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSettings }
  }
}

export async function writeSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await readSettings()
  const merged: AppSettings = { ...current, ...settings }
  await writeFile(settingsPath(), JSON.stringify(merged, null, 2), 'utf-8')
  return merged
}
