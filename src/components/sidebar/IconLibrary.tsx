import { useState } from 'react'
import { useIconSearch } from '../../registry/useIconSearch'
import IconTile from './IconTile'
import styles from './IconLibrary.module.css'

type Provider = 'azure' | 'aws' | 'custom'

const providers: { id: Provider; label: string; color: string }[] = [
  { id: 'azure', label: 'Azure', color: '#0078d4' },
  { id: 'aws', label: 'AWS', color: '#FF9900' },
  { id: 'custom', label: 'Custom', color: '#6366f1' },
]

export default function IconLibrary() {
  const [activeProvider, setActiveProvider] = useState<Provider>('azure')
  const { query, setQuery, results, byCategory, isSearching } = useIconSearch(activeProvider)

  return (
    <div className={styles.library}>
      <div className={styles.header}>
        <div className={styles.providerTabs}>
          {providers.map((p) => (
            <button
              key={p.id}
              className={`${styles.tab} ${activeProvider === p.id ? styles.activeTab : ''}`}
              onClick={() => setActiveProvider(p.id)}
              style={activeProvider === p.id ? { borderBottomColor: p.color, color: p.color } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>

        <input
          className={styles.search}
          type="text"
          placeholder="Search icons..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className={styles.scroll}>
        {isSearching ? (
          <div className={styles.flatGrid}>
            {results.map((icon) => (
              <IconTile key={icon.id} icon={icon} />
            ))}
            {results.length === 0 && (
              <div className={styles.empty}>No icons found</div>
            )}
          </div>
        ) : (
          Array.from(byCategory.entries()).map(([category, icons]) => (
            <div key={category} className={styles.category}>
              <div className={styles.categoryLabel}>{category}</div>
              <div className={styles.grid}>
                {icons.map((icon) => (
                  <IconTile key={icon.id} icon={icon} />
                ))}
              </div>
            </div>
          ))
        )}

        {!isSearching && byCategory.size === 0 && (
          <div className={styles.empty}>
            {activeProvider === 'custom'
              ? 'Drop SVGs into ~/Library/Application Support/ArchDiagram/custom-icons/ and restart.'
              : 'No icons available'}
          </div>
        )}
      </div>
    </div>
  )
}
