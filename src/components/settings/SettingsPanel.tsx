import { useState, useEffect } from 'react'
import { addCustomIcons } from '../../registry/iconRegistry'
import type { ProviderManifest } from '../../registry/types'
import type { AppSettings } from '../../types/electronAPI'
import styles from './SettingsPanel.module.css'

interface Props {
  onClose: () => void
}

const DEFAULT_LABEL = 'Default (…/Resource-Icons_01302026/Res_Containers)'

export default function SettingsPanel({ onClose }: Props) {
  const [settings, setSettings] = useState<AppSettings>({ customIconsDir: null })
  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    window.electronAPI.getSettings().then((s) => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  const handleBrowse = async () => {
    const picked = await window.electronAPI.pickIconsDir()
    if (!picked) return
    const updated = await window.electronAPI.setSettings({ customIconsDir: picked })
    setSettings(updated)
    setStatus(null)
  }

  const handleReset = async () => {
    const updated = await window.electronAPI.setSettings({ customIconsDir: null })
    setSettings(updated)
    setStatus(null)
  }

  const handleReload = async () => {
    setReloading(true)
    setStatus(null)
    try {
      const custom = await window.electronAPI.loadCustomIcons()
      if (custom) {
        addCustomIcons(custom.svgs, custom.manifest as ProviderManifest)
        setStatus({ type: 'success', message: `Loaded ${Object.keys(custom.svgs).length} icon(s) successfully.` })
      } else {
        setStatus({ type: 'error', message: 'No manifest.json found in the selected directory.' })
      }
    } catch {
      setStatus({ type: 'error', message: 'Failed to load icons. Check that the directory contains a valid manifest.json.' })
    } finally {
      setReloading(false)
    }
  }

  const displayPath = settings.customIconsDir ?? DEFAULT_LABEL

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Settings">
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.loadingText}>Loading…</div>
          ) : (
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Custom Icons Directory</div>
              <div className={styles.sectionDesc}>
                Icons are loaded from all SVG files in this folder when you click "Reload Icons".
                No manifest file is needed — icons are discovered automatically.
              </div>

              <div className={styles.pathRow}>
                <div className={styles.pathDisplay} title={displayPath}>
                  {displayPath}
                </div>
                <button className={styles.browseBtn} onClick={handleBrowse}>
                  Browse…
                </button>
              </div>

              {status && (
                <div className={`${styles.status} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
                  {status.message}
                </div>
              )}

              <div className={styles.actionRow}>
                <button
                  className={styles.reloadBtn}
                  onClick={handleReload}
                  disabled={reloading}
                >
                  {reloading ? 'Loading…' : 'Reload Icons'}
                </button>
                <button
                  className={styles.resetBtn}
                  onClick={handleReset}
                  disabled={settings.customIconsDir === null}
                >
                  Reset to Default
                </button>
              </div>

              <div className={styles.hint}>
                Select any folder containing SVG files. Icons will be grouped by service name
                derived from the file names (e.g. <code>Res_Amazon-ECS_Task_48.svg</code> → category
                "Amazon ECS", icon "Task").
              </div>
            </section>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.doneBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
