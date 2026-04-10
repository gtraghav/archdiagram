import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { v4 as uuidv4 } from 'uuid'

import { useDiagramStore } from '../../store/diagramStore'
import { useUIStore } from '../../store/uiStore'
import { getIcon } from '../../registry/iconRegistry'

import IconNode from './nodes/IconNode'
import GroupNode from './nodes/GroupNode'
import TextNode from './nodes/TextNode'
import ShapeNode from './nodes/ShapeNode'
import ArrowEdge from './edges/ArrowEdge'
import LineEdge from './edges/LineEdge'

// MUST be outside component or in useMemo to avoid React Flow re-render issues
const nodeTypes = {
  iconNode: IconNode,
  groupNode: GroupNode,
  textNode: TextNode,
  shapeNode: ShapeNode,
}

const edgeTypes = {
  arrowEdge: ArrowEdge,
  lineEdge: LineEdge,
}

const defaultEdgeOptions = {
  type: 'arrowEdge',
}

export default function DiagramCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, deleteSelected } =
    useDiagramStore()
  const { activeTool } = useUIStore()
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Drag-drop from sidebar
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const iconId = e.dataTransfer.getData('application/archdoc-icon')
      if (!iconId || !rfInstanceRef.current || !canvasRef.current) return

      const bounds = canvasRef.current.getBoundingClientRect()
      const position = rfInstanceRef.current.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      })

      const icon = getIcon(iconId)
      if (!icon) return

      addNode({
        id: uuidv4(),
        type: 'iconNode',
        position,
        data: {
          iconId: icon.id,
          svgContent: icon.svgContent,
          label: icon.name,
          labelPosition: 'bottom',
          textWrap: true,
        },
        style: { width: 80, height: 80 },
      })
    },
    [addNode]
  )

  // Click on canvas to add nodes depending on active tool
  const onPaneClick = useCallback(
    (e: React.MouseEvent) => {
      if (!rfInstanceRef.current || !canvasRef.current) return
      if (!['text', 'group', 'rect', 'ellipse', 'diamond', 'cylinder', 'parallelogram', 'hexagon'].includes(activeTool)) return

      const bounds = canvasRef.current.getBoundingClientRect()
      const position = rfInstanceRef.current.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      })

      if (activeTool === 'text') {
        addNode({
          id: uuidv4(),
          type: 'textNode',
          position,
          data: { text: 'Label', fontSize: 14, color: '#1e293b' },
        })
      } else if (activeTool === 'group') {
        addNode({
          id: uuidv4(),
          type: 'groupNode',
          position,
          data: { label: 'Group', backgroundColor: 'rgba(59,130,246,0.05)', borderColor: '#3b82f6' },
          style: { width: 240, height: 160 },
        })
      } else {
        addNode({
          id: uuidv4(),
          type: 'shapeNode',
          position,
          data: {
            shape: activeTool,
            fill: 'rgba(255,255,255,0.9)',
            stroke: '#64748b',
            strokeWidth: 1.5,
            strokeDasharray: activeTool === 'parallelogram' ? '6 3' : undefined,
            label: '',
            fontSize: 13,
            labelColor: '#1e293b',
          },
          style: { width: 160, height: 80 },
        })
      }
    },
    [activeTool, addNode]
  )

  // Delete key
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.defaultPrevented) {
        deleteSelected()
      }
    },
    [deleteSelected]
  )

  return (
    <div
      ref={canvasRef}
      style={{ flex: 1, height: '100%' }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => { rfInstanceRef.current = instance }}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[8, 8]}
        connectionMode={activeTool === 'arrow' ? ConnectionMode.Loose : ConnectionMode.Strict}
        panOnDrag={activeTool === 'select'}
        selectionOnDrag={activeTool === 'select'}
        deleteKeyCode={null} // handle ourselves above
        style={{ background: '#f8fafc' }}
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'groupNode') return 'rgba(59,130,246,0.1)'
            return '#cbd5e1'
          }}
          style={{ background: '#f1f5f9' }}
        />
      </ReactFlow>
    </div>
  )
}
