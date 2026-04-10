import { memo, useRef, useState } from 'react'
import { type NodeProps } from '@xyflow/react'
import { useDiagramStore } from '../../../store/diagramStore'
import type { TextNodeData } from '../../../store/diagramStore'

function TextNode({ id, data, selected }: NodeProps) {
  const d = data as TextNodeData
  const updateNodeData = useDiagramStore((s) => s.updateNodeData)
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleDoubleClick = () => {
    setEditing(true)
    setTimeout(() => ref.current?.focus(), 0)
  }

  const handleBlur = () => {
    setEditing(false)
    if (ref.current) {
      updateNodeData(id, { text: ref.current.innerText })
    }
  }

  return (
    <div
      style={{
        outline: selected ? '1px dashed #3b82f6' : 'none',
        padding: 4,
        borderRadius: 2,
        minWidth: 60,
        cursor: editing ? 'text' : 'grab',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        ref={ref}
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        style={{
          fontSize: d.fontSize || 14,
          color: d.color || '#1e293b',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          minWidth: 40,
        }}
      >
        {d.text || 'Label'}
      </div>
    </div>
  )
}

export default memo(TextNode)
