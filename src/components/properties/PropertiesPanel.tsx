import { useDiagramStore } from '../../store/diagramStore'
import NodeProperties from './NodeProperties'
import EdgeProperties from './EdgeProperties'
import styles from './PropertiesPanel.module.css'

export default function PropertiesPanel() {
  const { nodes, edges } = useDiagramStore()

  const selectedNodes = nodes.filter((n) => n.selected)
  const selectedEdges = edges.filter((e) => e.selected)

  const total = selectedNodes.length + selectedEdges.length

  if (total === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>Select an element to edit its properties</div>
      </div>
    )
  }

  if (total > 1) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>Selection</div>
        <div className={styles.row}>
          <span className={styles.label}>{total} items selected</span>
        </div>
        <DeleteButton />
      </div>
    )
  }

  if (selectedNodes.length === 1) {
    return <NodeProperties node={selectedNodes[0]} />
  }

  if (selectedEdges.length === 1) {
    return <EdgeProperties edge={selectedEdges[0]} />
  }

  return null
}

function DeleteButton() {
  const deleteSelected = useDiagramStore((s) => s.deleteSelected)
  return (
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
      Delete Selected
    </button>
  )
}
