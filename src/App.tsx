import { useUIStore } from './store/uiStore'
import Toolbar from './components/toolbar/Toolbar'
import IconLibrary from './components/sidebar/IconLibrary'
import DiagramCanvas from './components/canvas/DiagramCanvas'
import PropertiesPanel from './components/properties/PropertiesPanel'
import SettingsPanel from './components/settings/SettingsPanel'
import { useDiagramFile } from './hooks/useDiagramFile'
import { useExport } from './hooks/useExport'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export default function App() {
  const { leftSidebarOpen, rightSidebarOpen, settingsOpen, closeSettings } = useUIStore()

  // Wire up all IPC hooks
  useDiagramFile()
  useExport()
  useKeyboardShortcuts()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {leftSidebarOpen && <IconLibrary />}
        <DiagramCanvas />
        {rightSidebarOpen && <PropertiesPanel />}
      </div>
      {settingsOpen && <SettingsPanel onClose={closeSettings} />}
    </div>
  )
}
