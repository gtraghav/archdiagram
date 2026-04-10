import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import { useDiagramStore } from '../store/diagramStore'

export function useKeyboardShortcuts() {
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const deleteSelected = useDiagramStore((s) => s.deleteSelected)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).contentEditable === 'true'
      )
        return

      switch (e.key) {
        case 'v': case 'V': setActiveTool('select'); break
        case 't': case 'T': setActiveTool('text'); break
        case 'g': case 'G': setActiveTool('group'); break
        case 'r': case 'R': setActiveTool('rect'); break
        case 'e': case 'E': setActiveTool('ellipse'); break
        case 'd': case 'D': setActiveTool('diamond'); break
        case 'Delete': case 'Backspace': deleteSelected(); break
        case 'Escape': setActiveTool('select'); break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setActiveTool, deleteSelected])
}
