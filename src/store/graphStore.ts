/**
 * Graph Store
 *
 * Main Zustand store combining all slices:
 * - FilterSlice: Filtering and preset views
 * - TimelineSlice: Temporal navigation and playback
 * - SelectionSlice: Node selection and hover
 *
 * Usage:
 * ```tsx
 * const selectedNode = useGraphStore(state => state.selectedNode);
 * const setSelectedNode = useGraphStore(state => state.setSelectedNode);
 * ```
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createFilterSlice, type FilterSlice } from './slices/filterSlice';
import { createTimelineSlice, type TimelineSlice } from './slices/timelineSlice';
import { createSelectionSlice, type SelectionSlice } from './slices/selectionSlice';

/**
 * Combined store type
 */
export type GraphStore = FilterSlice & TimelineSlice & SelectionSlice;

/**
 * Main graph store
 *
 * Combines all slices into a single store with devtools support
 */
export const useGraphStore = create<GraphStore>()(
  devtools(
    (...args) => ({
      ...createFilterSlice(...args),
      ...createTimelineSlice(...args),
      ...createSelectionSlice(...args)
    }),
    {
      name: 'AuditVerse Graph Store',
      // Only enable devtools if extension is available
      enabled: process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && !!(window as any).__REDUX_DEVTOOLS_EXTENSION__
    }
  )
);

/**
 * Note: Convenience hooks are available but most components use useGraphStore directly.
 * These are kept for backward compatibility and future use.
 * If you need to access specific state, consider using useGraphStore(state => state.property) directly.
 */
