import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { addCustomIcons } from './registry/iconRegistry'
import type { ProviderManifest } from './registry/types'

async function init() {
  // Load user-added custom icons from Electron userData directory
  try {
    const custom = await window.electronAPI.loadCustomIcons()
    if (custom) {
      addCustomIcons(custom.svgs, custom.manifest as ProviderManifest)
    }
  } catch {
    // Not in Electron context (dev) or no custom icons
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

init()
