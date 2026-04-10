import type { Edge } from '@xyflow/react'
import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'
import { MarkerType } from '@xyflow/react'
import { useDiagramStore } from '../../store/diagramStore'
import styles from './PropertiesPanel.module.css'

interface Props {
  edge: Edge
}

type Direction = 'forward' | 'backward' | 'both' | 'none'

function getDirection(edge: Edge): Direction {
  const hasEnd = !!edge.markerEnd
  const hasStart = !!edge.markerStart
  if (hasEnd && hasStart) return 'both'
  if (hasEnd) return 'backward'
  if (hasStart) return 'forward'
  return 'none'
}

function markersForDirection(direction: Direction, color: string) {
  const marker = { type: MarkerType.ArrowClosed, color, width: 16, height: 16 }
  return {
    markerEnd: direction === 'backward' || direction === 'both' ? marker : null,
    markerStart: direction === 'forward' || direction === 'both' ? marker : null,
  }
}

export default function EdgeProperties({ edge }: Props) {
  const { updateEdgeData, deleteSelected } = useDiagramStore()
  const [showColorPicker, setShowColorPicker] = useState(false)

  const currentStyle = (edge.style as Record<string, unknown>) || {}
  const strokeColor = (currentStyle.stroke as string) || '#64748b'
  const strokeDash = (currentStyle.strokeDasharray as string) || ''
  const direction = getDirection(edge)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>Edge Properties</div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Direction</div>
        <select
          className={styles.select}
          value={direction}
          onChange={(e) => {
            updateEdgeData(edge.id, markersForDirection(e.target.value as Direction, strokeColor))
          }}
        >
          <option value="forward">→ Forward</option>
          <option value="backward">← Backward</option>
          <option value="both">↔ Both</option>
          <option value="none">— None</option>
        </select>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Line Style</div>
        <select
          className={styles.select}
          value={strokeDash ? 'dashed' : 'solid'}
          onChange={(e) => {
            updateEdgeData(edge.id, {
              style: {
                ...currentStyle,
                strokeDasharray: e.target.value === 'dashed' ? '6 3' : undefined,
              },
            })
          }}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
        </select>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Color</div>
        <div className={styles.colorRow}>
          <div
            className={styles.colorSwatch}
            style={{ background: strokeColor }}
            onClick={() => setShowColorPicker((v) => !v)}
          />
          <span className={styles.colorValue}>{strokeColor}</span>
        </div>
        {showColorPicker && (
          <HexColorPicker
            color={strokeColor}
            onChange={(color) => {
              updateEdgeData(edge.id, {
                style: { ...currentStyle, stroke: color },
                // update marker colors too
                ...markersForDirection(direction, color),
              })
            }}
          />
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Animation</div>
        <select
          className={styles.select}
          value={edge.animated ? 'yes' : 'no'}
          onChange={(e) => updateEdgeData(edge.id, { animated: e.target.value === 'yes' })}
        >
          <option value="no">None</option>
          <option value="yes">Animated</option>
        </select>
      </div>

      <button
        onClick={deleteSelected}
        style={{
          margin: '12px',
          padding: '6px 12px',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: 6,
          color: '#b91c1c',
          fontSize: 12,
          cursor: 'pointer',
          width: 'calc(100% - 24px)',
        }}
      >
        Delete
      </button>
    </div>
  )
}
