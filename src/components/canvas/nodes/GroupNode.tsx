import { memo } from 'react'
import { NodeResizer, type NodeProps } from '@xyflow/react'
import type { GroupNodeData } from '../../../store/diagramStore'

function GroupNode({ data, selected }: NodeProps) {
  const d = data as GroupNodeData

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: d.backgroundColor || 'rgba(59, 130, 246, 0.05)',
        border: `2px dashed ${d.borderColor || '#3b82f6'}`,
        borderRadius: 8,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <NodeResizer
        minWidth={100}
        minHeight={60}
        isVisible={selected}
        lineStyle={{ borderColor: d.borderColor || '#3b82f6' }}
        handleStyle={{ borderColor: d.borderColor || '#3b82f6', backgroundColor: 'white' }}
      />

      {d.label && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 10,
            fontSize: 11,
            fontWeight: 600,
            color: d.borderColor || '#3b82f6',
            pointerEvents: 'none',
          }}
        >
          {d.label}
        </div>
      )}
    </div>
  )
}

export default memo(GroupNode)
