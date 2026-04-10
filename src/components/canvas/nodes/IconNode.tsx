import { memo } from 'react'
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react'
import type { IconNodeData } from '../../../store/diagramStore'

function IconNode({ data, selected }: NodeProps) {
  const d = data as IconNodeData

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: d.backgroundColor || 'transparent',
        borderRadius: 4,
        padding: 4,
        boxSizing: 'border-box',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <NodeResizer
        minWidth={40}
        minHeight={40}
        isVisible={selected}
        lineStyle={{ borderColor: '#3b82f6' }}
        handleStyle={{ borderColor: '#3b82f6', backgroundColor: 'white' }}
      />

      {/* Each side acts as both source and target so connections can go in any direction */}
      <Handle type="target" position={Position.Top} id="top-t" className="icon-handle" />
      <Handle type="source" position={Position.Top} id="top-s" className="icon-handle" />
      <Handle type="target" position={Position.Left} id="left-t" className="icon-handle" />
      <Handle type="source" position={Position.Left} id="left-s" className="icon-handle" />

      <div
        style={{ width: '70%', flex: 1 }}
        dangerouslySetInnerHTML={{ __html: d.svgContent || '' }}
      />

      {d.labelPosition !== 'hidden' && d.label && (
        <div
          style={{
            fontSize: d.fontSize ?? 10,
            color: '#1e293b',
            textAlign: 'center',
            marginTop: 2,
            lineHeight: 1.3,
            maxWidth: '100%',
            overflow: 'hidden',
            ...(d.textWrap
              ? { whiteSpace: 'normal', wordBreak: 'break-word' }
              : { textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
            order: d.labelPosition === 'top' ? -1 : 1,
          }}
        >
          {d.label}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} id="bottom-s" className="icon-handle" />
      <Handle type="target" position={Position.Bottom} id="bottom-t" className="icon-handle" />
      <Handle type="source" position={Position.Right} id="right-s" className="icon-handle" />
      <Handle type="target" position={Position.Right} id="right-t" className="icon-handle" />
    </div>
  )
}

export default memo(IconNode)
