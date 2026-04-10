import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  type Node,
  type Edge,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
  addEdge,
} from '@xyflow/react'
import { v4 as uuidv4 } from 'uuid'
import type { DiagramFile } from '../types/electronAPI'

export interface IconNodeData extends Record<string, unknown> {
  iconId: string
  svgContent: string
  label: string
  labelPosition: 'bottom' | 'top' | 'hidden'
  fontSize?: number
  textWrap?: boolean
  backgroundColor?: string
}

export interface GroupNodeData extends Record<string, unknown> {
  label: string
  backgroundColor: string
  borderColor: string
}

export interface TextNodeData extends Record<string, unknown> {
  text: string
  fontSize: number
  color: string
}

export type ShapeType = 'rect' | 'ellipse' | 'diamond' | 'cylinder' | 'parallelogram' | 'hexagon'

export interface ShapeNodeData extends Record<string, unknown> {
  shape: ShapeType
  fill: string
  stroke: string
  strokeWidth: number
  strokeDasharray?: string
  label: string
  fontSize: number
  labelColor: string
}

interface DiagramStore {
  nodes: Node[]
  edges: Edge[]
  filePath: string | null
  isDirty: boolean

  // Node/edge updates from React Flow
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  // Mutations
  addNode: (node: Node) => void
  updateNodeData: (id: string, data: Partial<IconNodeData & GroupNodeData & TextNodeData & ShapeNodeData>) => void
  updateEdgeData: (id: string, data: Partial<{ style: Record<string, unknown>; markerEnd: unknown | null; markerStart: unknown | null; animated: boolean }>) => void
  deleteSelected: () => void

  // Layering
  bringToFront: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  sendToBack: (id: string) => void

  // File operations
  loadDiagram: (file: DiagramFile, filePath: string) => void
  newDiagram: () => void
  markSaved: (filePath: string) => void
  exportDiagram: (title?: string) => DiagramFile
}

export const useDiagramStore = create<DiagramStore>()(
  immer((set, get) => ({
    nodes: [],
    edges: [],
    filePath: null,
    isDirty: false,

    onNodesChange: (changes) => {
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes)
        state.isDirty = true
      })
    },

    onEdgesChange: (changes) => {
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges)
        state.isDirty = true
      })
    },

    onConnect: (connection) => {
      set((state) => {
        state.edges = addEdge(
          {
            ...connection,
            type: 'arrowEdge',
            id: uuidv4(),
            markerStart: { type: 'arrowclosed', width: 16, height: 16, color: '#64748b' },
          },
          state.edges
        )
        state.isDirty = true
      })
    },

    addNode: (node) => {
      set((state) => {
        state.nodes.push(node)
        state.isDirty = true
      })
    },

    updateNodeData: (id, data) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === id)
        if (node) {
          node.data = { ...node.data, ...data }
          state.isDirty = true
        }
      })
    },

    updateEdgeData: (id, data) => {
      set((state) => {
        const edge = state.edges.find((e) => e.id === id)
        if (edge) {
          for (const [k, v] of Object.entries(data)) {
            (edge as Record<string, unknown>)[k] = v ?? null
          }
          state.isDirty = true
        }
      })
    },

    deleteSelected: () => {
      set((state) => {
        const selectedNodeIds = new Set(
          state.nodes.filter((n) => n.selected).map((n) => n.id)
        )
        state.nodes = state.nodes.filter((n) => !n.selected)
        state.edges = state.edges.filter(
          (e) => !e.selected && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
        )
        state.isDirty = true
      })
    },

    bringToFront: (id) => {
      set((state) => {
        const idx = state.nodes.findIndex((n) => n.id === id)
        if (idx === -1 || idx === state.nodes.length - 1) return
        const [node] = state.nodes.splice(idx, 1)
        state.nodes.push(node)
        state.isDirty = true
      })
    },

    bringForward: (id) => {
      set((state) => {
        const idx = state.nodes.findIndex((n) => n.id === id)
        if (idx === -1 || idx === state.nodes.length - 1) return
        const tmp = state.nodes[idx + 1]
        state.nodes[idx + 1] = state.nodes[idx]
        state.nodes[idx] = tmp
        state.isDirty = true
      })
    },

    sendBackward: (id) => {
      set((state) => {
        const idx = state.nodes.findIndex((n) => n.id === id)
        if (idx <= 0) return
        const tmp = state.nodes[idx - 1]
        state.nodes[idx - 1] = state.nodes[idx]
        state.nodes[idx] = tmp
        state.isDirty = true
      })
    },

    sendToBack: (id) => {
      set((state) => {
        const idx = state.nodes.findIndex((n) => n.id === id)
        if (idx <= 0) return
        const [node] = state.nodes.splice(idx, 1)
        state.nodes.unshift(node)
        state.isDirty = true
      })
    },

    loadDiagram: (file, filePath) => {
      set((state) => {
        state.nodes = file.nodes as Node[]
        state.edges = file.edges as Edge[]
        state.filePath = filePath
        state.isDirty = false
      })
    },

    newDiagram: () => {
      set((state) => {
        state.nodes = []
        state.edges = []
        state.filePath = null
        state.isDirty = false
      })
    },

    markSaved: (filePath) => {
      set((state) => {
        state.filePath = filePath
        state.isDirty = false
      })
    },

    exportDiagram: (title = 'My Architecture') => {
      const { nodes, edges } = get()
      // Strip svgContent from nodes before saving (re-hydrated from iconId on load)
      const cleanNodes = nodes.map((n) => {
        if (n.type === 'iconNode') {
          const { svgContent: _svg, ...restData } = n.data as IconNodeData
          return { ...n, data: restData }
        }
        return n
      })
      return {
        version: '1.0',
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: cleanNodes,
        edges,
        metadata: {
          title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    },
  }))
)
