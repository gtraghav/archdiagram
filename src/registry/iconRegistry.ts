import type { IconEntry, IconWithSvg, ProviderManifest } from './types'

// Load all manifests and SVGs at build time via Vite's import.meta.glob
const manifestModules = import.meta.glob('../assets/icons/*/manifest.json', {
  eager: true,
}) as Record<string, { default: ProviderManifest }>

const svgModules = import.meta.glob('../assets/icons/**/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function sanitizeSvg(svg: string): string {
  // Strip fixed width/height from root <svg> element, keep viewBox
  // Remove embedded <title> so the browser shows the outer div's title (icon.name) on hover
  return svg
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<svg([^>]*)>/, (match, attrs: string) => {
      const cleanedAttrs = attrs
        .replace(/\s+width="[^"]*"/g, '')
        .replace(/\s+height="[^"]*"/g, '')
      const hasViewBox = /viewBox/.test(cleanedAttrs)
      const viewBoxAttr = hasViewBox ? '' : ' viewBox="0 0 64 64"'
      return `<svg${cleanedAttrs}${viewBoxAttr} width="100%" height="100%">`
    })
}

function buildRegistry(): Map<string, IconWithSvg> {
  const registry = new Map<string, IconWithSvg>()

  for (const [manifestPath, module] of Object.entries(manifestModules)) {
    const manifest = module.default
    const providerDir = manifestPath.replace('/manifest.json', '')

    for (const cat of manifest.categories) {
      for (const icon of cat.icons) {
        // Build the glob key used by svgModules
        const svgKey = `${providerDir}/${icon.svgPath}`
        const rawSvg = svgModules[svgKey]

        if (rawSvg) {
          registry.set(icon.id, {
            ...icon,
            svgContent: sanitizeSvg(rawSvg),
          })
        }
      }
    }
  }

  return registry
}

export const iconRegistry = buildRegistry()

export function getIcon(id: string): IconWithSvg | undefined {
  return iconRegistry.get(id)
}

export function getAllIcons(): IconWithSvg[] {
  return Array.from(iconRegistry.values())
}

export function getIconsByProvider(provider: string): IconWithSvg[] {
  return Array.from(iconRegistry.values()).filter((i) => i.provider === provider)
}

export function addCustomIcons(svgs: Record<string, string>, manifest: ProviderManifest): void {
  for (const cat of manifest.categories) {
    for (const icon of cat.icons) {
      const svgContent = svgs[icon.id]
      if (svgContent) {
        iconRegistry.set(icon.id, {
          ...icon,
          svgContent: sanitizeSvg(svgContent),
        })
      }
    }
  }
}
