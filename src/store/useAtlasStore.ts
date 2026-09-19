import { create } from 'zustand'
import type { AtlasSection, AtlasView, StatusFilter } from '../types'

type AtlasState = {
  section: AtlasSection
  view: AtlasView
  previousView: AtlasView
  selectedId: string | null
  selectedLearningObjectId: string | null
  query: string
  statusFilter: StatusFilter
  setSection: (section: AtlasSection) => void
  setView: (view: AtlasView) => void
  select: (id: string | null) => void
  selectLearningObject: (id: string | null) => void
  back: () => void
  setQuery: (query: string) => void
  setStatusFilter: (filter: StatusFilter) => void
}

export const useAtlasStore = create<AtlasState>((set, get) => ({
  section: 'home',
  view: 'universe',
  previousView: 'universe',
  selectedId: null,
  selectedLearningObjectId: null,
  query: '',
  statusFilter: 'all',
  setSection: (section) => set({
    section,
    selectedLearningObjectId: section === 'materials' ? get().selectedLearningObjectId : null,
  }),
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
  selectLearningObject: (selectedLearningObjectId) => set({ selectedLearningObjectId }),
  back: () => set((state) => ({ view: state.previousView, selectedId: null })),
  setQuery: (query) => set({ query }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}))
