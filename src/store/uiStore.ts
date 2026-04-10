import { create } from 'zustand'

export type ActiveTool =
  | 'select'
  | 'group'
  | 'text'
  | 'arrow'
  | 'rect'
  | 'ellipse'
  | 'diamond'
  | 'cylinder'
  | 'parallelogram'
  | 'hexagon'

interface UIStore {
  activeTool: ActiveTool
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  settingsOpen: boolean
  setActiveTool: (tool: ActiveTool) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  openSettings: () => void
  closeSettings: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeTool: 'select',
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  settingsOpen: false,
  setActiveTool: (tool) => set({ activeTool: tool }),
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
}))
