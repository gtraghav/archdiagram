import { useEffect } from 'react'
import { useDiagramStore } from '../store/diagramStore'
import { getIcon } from '../registry/iconRegistry'
import type { MenuAction } from '../types/electronAPI'
import type { Node } from '@xyflow/react'
import type { IconNodeData } from '../store/diagramStore'

export function useDiagramFile() {
  const { loadDiagram, newDiagram, exportDiagram, markSaved, isDirty } = useDiagramStore()

  const openFile = async () => {
    const result = await window.electronAPI.openFile()
    if (!result) return

    // Re-hydrate svgContent for icon nodes from registry
    const nodes = (result.content.nodes as Node[]).map((n) => {
      if (n.type === 'iconNode') {
        const d = n.data as Omit<IconNodeData, 'svgContent'>
        const icon = getIcon(String(d.iconId))
        return { ...n, data: { ...d, svgContent: icon?.svgContent || '' } }
      }
      return n
    })

    loadDiagram({ ...result.content, nodes }, result.filePath)
  }

  const saveFile = async (saveAs = false) => {
    const { filePath } = useDiagramStore.getState()
    const diagram = exportDiagram()
    const path = await window.electronAPI.saveFile(diagram, saveAs ? undefined : filePath ?? undefined)
    if (path) markSaved(path)
  }

  // Listen for native menu actions
  useEffect(() => {
    const cleanup = window.electronAPI.onMenuAction(async (action: MenuAction) => {
      switch (action.type) {
        case 'new':
          if (isDirty && !confirm('Discard unsaved changes?')) return
          newDiagram()
          break
        case 'open':
          if (isDirty && !confirm('Discard unsaved changes?')) return
          await openFile()
          break
        case 'save':
          await saveFile(false)
          break
        case 'save-as':
          await saveFile(true)
          break
      }
    })
    return cleanup
  }, [isDirty, newDiagram])

  return { openFile, saveFile }
}
