import { useState, useRef, useEffect } from 'react'
import { useUIStore, type ActiveTool } from '../../store/uiStore'
import { useDiagramStore } from '../../store/diagramStore'
import styles from './Toolbar.module.css'

const tools: { id: ActiveTool; label: string; icon: string; title: string }[] = [
  { id: 'select', label: 'Select', icon: '↖', title: 'Select & Move (V)' },
  { id: 'text', label: 'Text', icon: 'T', title: 'Add Text Label (T)' },
  { id: 'group', label: 'Group', icon: '⬚', title: 'Add Bounding Box (G)' },
]

const shapeTools: { id: ActiveTool; icon: string; label: string; title: string }[] = [
  { id: 'rect', icon: '▭', label: 'Rectangle', title: 'Rectangle (R)' },
  { id: 'ellipse', icon: '⬭', label: 'Ellipse', title: 'Ellipse (E)' },
  { id: 'diamond', icon: '◇', label: 'Diamond', title: 'Diamond (D)' },
  { id: 'cylinder', icon: '⬬', label: 'Cylinder', title: 'Cylinder' },
  { id: 'parallelogram', icon: '▱', label: 'Parallelogram', title: 'Parallelogram' },
  { id: 'hexagon', icon: '⬡', label: 'Hexagon', title: 'Hexagon' },
]

const shapeIds = new Set(shapeTools.map((s) => s.id))

function ShapeDropdown() {
  const { activeTool, setActiveTool } = useUIStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeShape = shapeTools.find((s) => s.id === activeTool) ?? shapeTools[0]
  const isShapeActive = shapeIds.has(activeTool)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className={styles.shapeDropdownWrap}>
      <button
        className={`${styles.toolBtn} ${isShapeActive ? styles.active : ''}`}
        onClick={() => setOpen((v) => !v)}
        title="Shapes"
      >
        <span className={styles.toolIcon}>{activeShape.icon}</span>
        <span className={styles.toolLabel}>{isShapeActive ? activeShape.label : 'Shapes'}</span>
        <span className={styles.dropArrow}>▾</span>
      </button>

      {open && (
        <div className={styles.shapeMenu}>
          {shapeTools.map((s) => (
            <button
              key={s.id}
              className={`${styles.shapeMenuItem} ${activeTool === s.id ? styles.shapeMenuItemActive : ''}`}
              onClick={() => { setActiveTool(s.id); setOpen(false) }}
              title={s.title}
            >
              <span className={styles.shapeMenuIcon}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Toolbar() {
  const { activeTool, setActiveTool, toggleLeftSidebar, toggleRightSidebar, openSettings } = useUIStore()
  const { isDirty, filePath } = useDiagramStore()

  const title = filePath
    ? `${filePath.split('/').pop()}${isDirty ? ' •' : ''}`
    : `Untitled${isDirty ? ' •' : ''}`

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <button className={styles.sidebarToggle} onClick={toggleLeftSidebar} title="Toggle Icon Library">
          ☰
        </button>

        <div className={styles.separator} />

        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`${styles.toolBtn} ${activeTool === tool.id ? styles.active : ''}`}
            onClick={() => setActiveTool(tool.id)}
            title={tool.title}
          >
            <span className={styles.toolIcon}>{tool.icon}</span>
            <span className={styles.toolLabel}>{tool.label}</span>
          </button>
        ))}

        <div className={styles.separator} />

        <ShapeDropdown />
      </div>

      <div className={styles.center}>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.right}>
        <button className={styles.sidebarToggle} onClick={toggleRightSidebar} title="Toggle Properties Panel">
          ▤
        </button>
        <button className={styles.sidebarToggle} onClick={openSettings} title="Settings">
          ⚙
        </button>
      </div>
    </div>
  )
}
