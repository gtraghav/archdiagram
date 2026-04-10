import { memo, useState, useRef } from 'react'
import { NodeResizer, type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { useDiagramStore } from '../../../store/diagramStore'
import type { ShapeNodeData } from '../../../store/diagramStore'

function renderShape(shape: string, fill: string, stroke: string, strokeWidth: number, strokeDasharray?: string) {
  const dash = strokeDasharray || 'none'
  const props = { fill, stroke, strokeWidth, strokeDasharray: dash === 'none' ? undefined : dash }

  switch (shape) {
    case 'ellipse':
      return <ellipse cx="50%" cy="50%" rx="49%" ry="49%" {...props} />

    case 'diamond':
      return <polygon points="50,2 98,50 50,98 2,50" {...props} />

    case 'cylinder':
      return (
        <g>
          <rect x="2%" y="12%" width="96%" height="76%" {...props} />
          <ellipse cx="50%" cy="12%" rx="48%" ry="10%" {...props} />
          <ellipse cx="50%" cy="88%" rx="48%" ry="10%" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </g>
      )

    case 'parallelogram':
      return <polygon points="15,2 98,2 85,98 2,98" {...props} />

    case 'hexagon':
      return <polygon points="25,2 75,2 98,50 75,98 25,98 2,50" {...props} />

    case 'rect':
    default:
      return <rect x="1%" y="1%" width="98%" height="98%" rx="4" {...props} />
  }
}

function ShapeNode({ id, data, selected }: NodeProps) {
  const d = data as ShapeNodeData
  const updateNodeData = useDiagramStore((s) => s.updateNodeData)
  const [editing, setEditing] = useState(false)
  const labelRef = useRef<HTMLDivElement>(null)

  const handles = [Position.Top, Position.Bottom, Position.Left, Position.Right]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', userSelect: 'none' }}>
      <NodeResizer
        minWidth={40}
        minHeight={40}
        isVisible={selected}
        lineStyle={{ borderColor: d.stroke || '#64748b' }}
        handleStyle={{ borderColor: d.stroke || '#64748b', backgroundColor: 'white' }}
      />

      {handles.map((pos) => (
        <Handle key={`t-${pos}`} type="target" position={pos} id={`t-${pos}`} className="icon-handle" />
      ))}
      {handles.map((pos) => (
        <Handle key={`s-${pos}`} type="source" position={pos} id={`s-${pos}`} className="icon-handle" />
      ))}

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {renderShape(d.shape, d.fill, d.stroke, d.strokeWidth, d.strokeDasharray)}
      </svg>

      {/* Label overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          cursor: editing ? 'text' : 'grab',
        }}
        onDoubleClick={() => {
          setEditing(true)
          setTimeout(() => labelRef.current?.focus(), 0)
        }}
      >
        <div
          ref={labelRef}
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={() => {
            setEditing(false)
            if (labelRef.current) {
              updateNodeData(id, { label: labelRef.current.innerText })
            }
          }}
          style={{
            fontSize: d.fontSize || 13,
            color: d.labelColor || '#1e293b',
            textAlign: 'center',
            outline: 'none',
            maxWidth: '100%',
            wordBreak: 'break-word',
            pointerEvents: editing ? 'all' : 'none',
          }}
        >
          {d.label}
        </div>
      </div>
    </div>
  )
}

export default memo(ShapeNode)
