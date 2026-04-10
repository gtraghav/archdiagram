/**
 * Script to auto-generate manifest.json from a directory of downloaded SVG icons.
 *
 * Usage (after downloading official icon packs):
 *   npx tsx scripts/generate-manifest.ts azure /path/to/extracted/azure-icons src/assets/icons/azure
 *   npx tsx scripts/generate-manifest.ts aws /path/to/extracted/aws-icons src/assets/icons/aws
 *
 * The script:
 *  1. Walks the source directory for .svg files
 *  2. Groups them by subdirectory (= category)
 *  3. Generates a manifest.json in the output directory
 *  4. Copies the SVG files to the output directory
 *
 * Official icon download links:
 *  - Azure: https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V21.zip
 *  - AWS:   https://aws.amazon.com/architecture/icons/ → Download SVG Pack
 */

import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync, existsSync } from 'fs'
import { join, basename, extname, dirname, relative } from 'path'

type Provider = 'azure' | 'aws' | 'custom'

interface IconEntry {
  id: string
  name: string
  provider: Provider
  category: string
  tags: string[]
  svgPath: string
}

interface Category {
  name: string
  icons: IconEntry[]
}

function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function walkSvgs(dir: string): { file: string; category: string }[] {
  const results: { file: string; category: string }[] = []

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      for (const svgFile of readdirSync(fullPath)) {
        if (extname(svgFile).toLowerCase() === '.svg') {
          results.push({ file: join(fullPath, svgFile), category: entry })
        }
      }
    } else if (extname(entry).toLowerCase() === '.svg') {
      results.push({ file: fullPath, category: 'General' })
    }
  }

  return results
}

function main(): void {
  const [,, provider, sourceDir, outputDir] = process.argv

  if (!provider || !sourceDir || !outputDir) {
    console.error('Usage: npx tsx scripts/generate-manifest.ts <provider> <sourceDir> <outputDir>')
    process.exit(1)
  }

  if (!['azure', 'aws', 'custom'].includes(provider)) {
    console.error('Provider must be azure, aws, or custom')
    process.exit(1)
  }

  if (!existsSync(sourceDir)) {
    console.error(`Source directory does not exist: ${sourceDir}`)
    process.exit(1)
  }

  mkdirSync(outputDir, { recursive: true })

  const svgs = walkSvgs(sourceDir)
  const categoryMap = new Map<string, IconEntry[]>()

  for (const { file, category } of svgs) {
    const fileName = basename(file, extname(file))
    const categorySlug = toKebabCase(category)
    const categoryDir = join(outputDir, categorySlug)
    mkdirSync(categoryDir, { recursive: true })

    const destFile = join(categoryDir, basename(file).toLowerCase().replace(/\s+/g, '-'))
    copyFileSync(file, destFile)

    const svgRelPath = relative(outputDir, destFile)
    const iconName = toTitleCase(fileName)
    const iconId = `${provider}-${categorySlug}-${toKebabCase(fileName)}`

    const entry: IconEntry = {
      id: iconId,
      name: iconName,
      provider: provider as Provider,
      category: toTitleCase(category),
      tags: [toKebabCase(fileName), categorySlug, provider],
      svgPath: svgRelPath,
    }

    const list = categoryMap.get(toTitleCase(category)) ?? []
    list.push(entry)
    categoryMap.set(toTitleCase(category), list)
  }

  const categories: Category[] = Array.from(categoryMap.entries()).map(([name, icons]) => ({
    name,
    icons: icons.sort((a, b) => a.name.localeCompare(b.name)),
  }))

  const manifest = {
    provider,
    version: new Date().toISOString().split('T')[0],
    categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
  }

  const manifestPath = join(outputDir, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

  const totalIcons = categories.reduce((sum, c) => sum + c.icons.length, 0)
  console.log(`✓ Generated manifest with ${totalIcons} icons in ${categories.length} categories`)
  console.log(`  → ${manifestPath}`)
}

main()
