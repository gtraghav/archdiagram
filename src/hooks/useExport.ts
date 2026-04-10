import { useEffect } from 'react'
import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { useDiagramStore } from '../store/diagramStore'
import type { MenuAction } from '../types/electronAPI'

const PADDING = 60

/**
 * Captures ONLY the React Flow viewport (nodes + edges) to a PNG data URL.
 * The sidebar, toolbar, and properties panel are excluded because we target
 * .react-flow__viewport directly, not the whole document.
 */
async function captureViewport(width: number, height: number, pixelRatio = 3): Promise<string> {
  const { nodes } = useDiagramStore.getState()

  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement
  if (!viewport) throw new Error('React Flow viewport not found')

  let x = 0, y = 0, zoom = 1
  if (nodes.length > 0) {
    const bounds = getNodesBounds(nodes)
    ;({ x, y, zoom } = getViewportForBounds(bounds, width, height, 0.05, 4, PADDING))
  }

  return toPng(viewport, {
    width,
    height,
    pixelRatio,
    backgroundColor: '#f8fafc',
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${x}px, ${y}px) scale(${zoom})`,
      transformOrigin: 'top left',
    },
  })
}

export async function exportAsPNG(): Promise<void> {
  const outputPath = await window.electronAPI.getSavePNGPath()
  if (!outputPath) return

  // 3840×2560 logical px × pixelRatio 3 = ~11520×7680 physical — crisp at any zoom
  const dataUrl = await captureViewport(3840, 2560, 3)
  await window.electronAPI.exportPNG(dataUrl, outputPath)
}

export async function exportAsPDF(): Promise<void> {
  const outputPath = await window.electronAPI.getSavePDFPath()
  if (!outputPath) return

  // A3 landscape: 420×297 mm at 200dpi
  const PX_W = Math.round(420 * 200 / 25.4)
  const PX_H = Math.round(297 * 200 / 25.4)

  const dataUrl = await captureViewport(PX_W, PX_H, 2)

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' })
  pdf.addImage(dataUrl, 'PNG', 0, 0, 420, 297)

  // pdf.output('arraybuffer') returns ArrayBuffer; convert to base64 for IPC
  const arrayBuffer = pdf.output('arraybuffer')
  // Convert ArrayBuffer to base64 without Node.js Buffer (browser-safe)
  const uint8 = new Uint8Array(arrayBuffer)
  let binary = ''
  uint8.forEach((b) => (binary += String.fromCharCode(b)))
  const base64 = btoa(binary)
  await window.electronAPI.exportRawFile(base64, outputPath)
}

export function useExport() {
  useEffect(() => {
    const cleanup = window.electronAPI.onMenuAction(async (action: MenuAction) => {
      if (action.type === 'export-png') exportAsPNG().catch(console.error)
      if (action.type === 'export-pdf') exportAsPDF().catch(console.error)
    })
    return cleanup
  }, [])

  return { exportAsPNG, exportAsPDF }
}
