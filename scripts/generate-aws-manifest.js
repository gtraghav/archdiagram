const fs = require('fs')
const path = require('path')

const awsDir = path.join(__dirname, '../src/assets/icons/aws')
const outFile = path.join(awsDir, 'manifest.json')

function titleCase(s) {
  return s
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function buildManifest() {
  const manifest = {
    provider: 'aws',
    version: '1.0',
    filesGlob: '**/*.svg',
    categories: []
  }

  const children = fs.readdirSync(awsDir, { withFileTypes: true })
  const resDirs = children.filter(d => d.isDirectory() && d.name.startsWith('Res_')).map(d => d.name)

  resDirs.forEach(dirName => {
    const dirPath = path.join(awsDir, dirName)
    const files = fs.readdirSync(dirPath).filter(f => f.toLowerCase().endsWith('.svg'))
    if (files.length === 0) return

    const categoryName = titleCase(dirName.replace(/^Res_/, ''))
    const categorySlug = slugify(categoryName)

    const icons = files.map(file => {
      const base = file.replace(/^Res_/, '')
      const name = titleCase(base.replace(/_48\.svg$/i, '').replace(/\s+_/g, ' '))
      const fileSlug = slugify(name)
      const id = `aws-${categorySlug}-${fileSlug}`
      return {
        id,
        name,
        provider: 'aws',
        category: categoryName,
        tags: [],
        svgPath: `${dirName}/${file}`
      }
    })

    manifest.categories.push({ name: categoryName, icons })
  })

  return manifest
}

function main() {
  const manifest = buildManifest()
  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n')
  console.log('Wrote', outFile)
}

main()
