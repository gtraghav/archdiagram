import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { getAllIcons, getIconsByProvider } from './iconRegistry'
import type { IconWithSvg } from './types'

const fuseOptions = {
  keys: ['name', 'tags', 'category'],
  threshold: 0.4,
  includeScore: true,
}

export function useIconSearch(provider: 'azure' | 'aws' | 'custom' | 'all' = 'all') {
  const [query, setQuery] = useState('')

  const icons = useMemo(() => {
    return provider === 'all' ? getAllIcons() : getIconsByProvider(provider)
  }, [provider])

  const fuse = useMemo(() => new Fuse(icons, fuseOptions), [icons])

  const results = useMemo<IconWithSvg[]>(() => {
    if (!query.trim()) return icons
    return fuse.search(query).map((r) => r.item)
  }, [query, fuse, icons])

  // Group by category when no query
  const byCategory = useMemo<Map<string, IconWithSvg[]>>(() => {
    const source = query.trim() ? results : icons
    const map = new Map<string, IconWithSvg[]>()
    for (const icon of source) {
      const list = map.get(icon.category) ?? []
      list.push(icon)
      map.set(icon.category, list)
    }
    return map
  }, [query, results, icons])

  return { query, setQuery, results, byCategory, isSearching: !!query.trim() }
}
