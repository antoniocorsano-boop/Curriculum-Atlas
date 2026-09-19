import { create } from 'zustand'
import type { AtlasView, StatusFilter } from '../types'

type AtlasState = {
  view: AtlasView
  previousView: AtlasView
  selectedId: string | null
  query: string
  statusFilter: StatusFilter
  setView: (view: AtlasView) => void
  select: (id: string | null) => void
  back: () => void
  setQuery: (query: string) => void
  setStatusFilter: (filter: StatusFilter) => void
}

export const useAtlasStore = create<AtlasState>((set, get) => ({
  view: 'universe',
  previousView: 'universe',
  selectedId: null,
  query: '',
  statusFilter: 'all',
  setView: (view) => set((state) => ({
    view,
    previousView: state.view === 'focus' ? state.previousView : state.view,
  })),
  select: (id) => {
    if (!id) return set({ selectedId: null })
    const { view, previousView } = get()
    set({
      selectedId: id,
      previousView: view === 'focus' ? previousView : view,
      view: 'focus',
    })
  },
  back: () => set((state) => ({ view: state.previousView, selectedId: null })),
  setQuery: (query) => set({ query }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}))
