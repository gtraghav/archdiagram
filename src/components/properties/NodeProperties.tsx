import type { Node } from '@xyflow/react'
import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'
import { useDiagramStore } from '../../store/diagramStore'
import type { IconNodeData, GroupNodeData, TextNodeData, ShapeNodeData, ShapeType } from '../../store/diagramStore'
import styles from './PropertiesPanel.module.css'

interface Props {
  node: Node
}

export default function NodeProperties({ node }: Props) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData)
  const deleteSelected = useDiagramStore((s) => s.deleteSelected)
  const bringToFront = useDiagramStore((s) => s.bringToFront)
  const bringForward = useDiagramStore((s) => s.bringForward)
  const sendBackward = useDiagramStore((s) => s.sendBackward)
  const sendToBack = useDiagramStore((s) => s.sendToBack)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorTarget, setColorTarget] = useState<'fill' | 'stroke' | 'label' | 'main'>('main')

  const layering = (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>Layer Order</div>
      <div className={styles.layerRow}>
        <button className={styles.layerBtn} title="Send to Back" onClick={() => sendToBack(node.id)}>⬇⬇</button>
        <button className={styles.layerBtn} title="Send Backward" onClick={() => sendBackward(node.id)}>⬇</button>
        <button className={styles.layerBtn} title="Bring Forward" onClick={() => bringForward(node.id)}>⬆</button>
        <button className={styles.layerBtn} title="Bring to Front" onClick={() => bringToFront(node.id)}>⬆⬆</button>
      </div>
      <div className={styles.layerHints}>
        <span>Back</span><span>Bwd</span><span>Fwd</span><span>Front</span>
      </div>
    </div>
  )

  if (node.type === 'iconNode') {
    const d = node.data as IconNodeData
    return (
      <div className={styles.panel}>
        <div className={styles.header}>Icon Properties</div>

        <Field label="Label">
          <input
            className={styles.input}
            value={d.label}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
          />
        </Field>

        <Field label="Label Position">
          <select
            className={styles.select}
            value={d.labelPosition}
            onChange={(e) =>
              updateNodeData(node.id, { labelPosition: e.target.value as IconNodeData['labelPosition'] })
            }
          >
            <option value="bottom">Bottom</option>
            <option value="top">Top</option>
            <option value="hidden">Hidden</option>
          </select>
        </Field>

        <Field label="Font Size">
          <input
            className={styles.input}
            type="number"
            min={6}
            max={48}
            value={d.fontSize ?? 10}
            onChange={(e) => updateNodeData(node.id, { fontSize: Number(e.target.value) })}
          />
        </Field>

        <Field label="Text Wrap">
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={!!d.textWrap}
              onChange={(e) => updateNodeData(node.id, { textWrap: e.target.checked })}
            />
            <span>Wrap long labels</span>
          </label>
        </Field>

        <Field label="Background">
          <div className={styles.colorRow}>
            <div
              className={styles.colorSwatch}
              style={{ background: d.backgroundColor || 'transparent' }}
              onClick={() => setShowColorPicker((v) => !v)}
            />
            <span className={styles.colorValue}>{d.backgroundColor || 'None'}</span>
          </div>
          {showColorPicker && (
            <div className={styles.colorPickerWrap}>
              <HexColorPicker
                color={d.backgroundColor || '#ffffff'}
                onChange={(color) => updateNodeData(node.id, { backgroundColor: color })}
              />
              <button className={styles.clearBtn} onClick={() => updateNodeData(node.id, { backgroundColor: undefined })}>
                Clear
              </button>
            </div>
          )}
        </Field>

        <Field label="Icon ID">
          <span className={styles.hint}>{d.iconId}</span>
        </Field>

        {layering}
        <DeleteButton onDelete={deleteSelected} />
      </div>
    )
  }

  if (node.type === 'shapeNode') {
    const d = node.data as ShapeNodeData
    const activeColor = colorTarget === 'fill' ? d.fill : colorTarget === 'stroke' ? d.stroke : d.labelColor || '#1e293b'

    return (
      <div className={styles.panel}>
        <div className={styles.header}>Shape Properties</div>

        <Field label="Shape">
          <select
            className={styles.select}
            value={d.shape}
            onChange={(e) => updateNodeData(node.id, { shape: e.target.value as ShapeType })}
          >
            <option value="rect">Rectangle</option>
            <option value="ellipse">Ellipse</option>
            <option value="diamond">Diamond</option>
            <option value="cylinder">Cylinder</option>
            <option value="parallelogram">Parallelogram</option>
            <option value="hexagon">Hexagon</option>
          </select>
        </Field>

        <Field label="Label">
          <input
            className={styles.input}
            value={d.label}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
          />
        </Field>

        <Field label="Font Size">
          <input
            className={styles.input}
            type="number"
            min={8}
            max={72}
            value={d.fontSize || 13}
            onChange={(e) => updateNodeData(node.id, { fontSize: Number(e.target.value) })}
          />
        </Field>

        <Field label="Border Style">
          <select
            className={styles.select}
            value={d.strokeDasharray ? 'dashed' : 'solid'}
            onChange={(e) =>
              updateNodeData(node.id, { strokeDasharray: e.target.value === 'dashed' ? '6 3' : undefined })
            }
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
          </select>
        </Field>

        <Field label="Border Width">
          <input
            className={styles.input}
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={d.strokeWidth}
            onChange={(e) => updateNodeData(node.id, { strokeWidth: Number(e.target.value) })}
          />
        </Field>

        <Field label="Colors">
          <div className={styles.colorTabs}>
            <button
              className={`${styles.colorTab} ${colorTarget === 'fill' ? styles.colorTabActive : ''}`}
              onClick={() => setColorTarget('fill')}
            >
              <span className={styles.colorTabSwatch} style={{ background: d.fill }} />
              Fill
            </button>
            <button
              className={`${styles.colorTab} ${colorTarget === 'stroke' ? styles.colorTabActive : ''}`}
              onClick={() => setColorTarget('stroke')}
            >
              <span className={styles.colorTabSwatch} style={{ background: d.stroke }} />
              Border
            </button>
            <button
              className={`${styles.colorTab} ${colorTarget === 'label' ? styles.colorTabActive : ''}`}
              onClick={() => setColorTarget('label')}
            >
              <span className={styles.colorTabSwatch} style={{ background: d.labelColor || '#1e293b' }} />
              Text
            </button>
          </div>
          <HexColorPicker
            color={activeColor}
            onChange={(color) => {
              if (colorTarget === 'fill') updateNodeData(node.id, { fill: color })
              else if (colorTarget === 'stroke') updateNodeData(node.id, { stroke: color })
              else updateNodeData(node.id, { labelColor: color })
            }}
          />
        </Field>

        {layering}
        <DeleteButton onDelete={deleteSelected} />
      </div>
    )
  }

  if (node.type === 'groupNode') {
    const d = node.data as GroupNodeData
    return (
      <div className={styles.panel}>
        <div className={styles.header}>Group Properties</div>

        <Field label="Label">
          <input
            className={styles.input}
            value={d.label || ''}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
          />
        </Field>

        <Field label="Border Color">
          <div className={styles.colorRow}>
            <div
              className={styles.colorSwatch}
              style={{ background: d.borderColor || '#3b82f6' }}
              onClick={() => setShowColorPicker((v) => !v)}
            />
            <span className={styles.colorValue}>{d.borderColor || '#3b82f6'}</span>
          </div>
          {showColorPicker && (
            <HexColorPicker
              color={d.borderColor || '#3b82f6'}
              onChange={(color) => updateNodeData(node.id, { borderColor: color })}
            />
          )}
        </Field>

        <Field label="Fill Color">
          <input
            className={styles.input}
            type="text"
            value={d.backgroundColor || 'rgba(59,130,246,0.05)'}
            onChange={(e) => updateNodeData(node.id, { backgroundColor: e.target.value })}
            placeholder="e.g. rgba(59,130,246,0.05)"
          />
        </Field>

        {layering}
        <DeleteButton onDelete={deleteSelected} />
      </div>
    )
  }

  if (node.type === 'textNode') {
    const d = node.data as TextNodeData
    return (
      <div className={styles.panel}>
        <div className={styles.header}>Text Properties</div>

        <Field label="Text">
          <textarea
            className={styles.textarea}
            value={d.text}
            onChange={(e) => updateNodeData(node.id, { text: e.target.value })}
            rows={3}
          />
        </Field>

        <Field label="Font Size">
          <input
            className={styles.input}
            type="number"
            min={8}
            max={72}
            value={d.fontSize}
            onChange={(e) => updateNodeData(node.id, { fontSize: Number(e.target.value) })}
          />
        </Field>

        <Field label="Color">
          <div className={styles.colorRow}>
            <div
              className={styles.colorSwatch}
              style={{ background: d.color || '#1e293b' }}
              onClick={() => setShowColorPicker((v) => !v)}
            />
            <span className={styles.colorValue}>{d.color || '#1e293b'}</span>
          </div>
          {showColorPicker && (
            <HexColorPicker
              color={d.color || '#1e293b'}
              onChange={(color) => updateNodeData(node.id, { color })}
            />
          )}
        </Field>

        {layering}
        <DeleteButton onDelete={deleteSelected} />
      </div>
    )
  }

  return null
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      {children}
    </div>
  )
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      onClick={onDelete}
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
  )
}
