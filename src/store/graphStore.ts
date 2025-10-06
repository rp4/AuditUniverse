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
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

/**
 * Typed selectors for common access patterns
 *
 * These provide convenient access to frequently used state
 */
export const useSelectedNode = () =>
  useGraphStore((state) => state.selectedNode);

export const useHoveredNode = () =>
  useGraphStore((state) => state.hoveredNode);

export const useCurrentDate = () =>
  useGraphStore((state) => state.currentDate);

export const useIsPlaying = () =>
  useGraphStore((state) => state.isPlaying);

export const useActivePreset = () =>
  useGraphStore((state) => state.activePreset);

export const useActiveEntityLayers = () =>
  useGraphStore((state) => state.activeEntityLayers);

export const useRiskThreshold = () =>
  useGraphStore((state) => ({
    likelihood: state.likelihoodThreshold,
    severity: state.severityThreshold
  }));

/**
 * Action hooks for common operations
 */
export const useSelectionActions = () =>
  useGraphStore((state) => ({
    setSelectedNode: state.setSelectedNode,
    clearSelection: state.clearSelection,
    setHoveredNode: state.setHoveredNode,
    goBack: state.goBack,
    goForward: state.goForward,
    canGoBack: state.canGoBack(),
    canGoForward: state.canGoForward()
  }));

export const useTimelineActions = () =>
  useGraphStore((state) => ({
    play: state.play,
    pause: state.pause,
    reset: state.reset,
    togglePlayPause: state.togglePlayPause,
    setCurrentDate: state.setCurrentDate,
    setSpeed: state.setSpeed
  }));

export const useFilterActions = () =>
  useGraphStore((state) => ({
    setActivePreset: state.setActivePreset,
    setLikelihoodThreshold: state.setLikelihoodThreshold,
    setSeverityThreshold: state.setSeverityThreshold,
    toggleEntityLayer: state.toggleEntityLayer,
    resetFilters: state.resetFilters,
    setSearchQuery: state.setSearchQuery
  }));

/**
 * Get full filter state (useful for filter combination logic)
 */
export const useFilterState = () =>
  useGraphStore((state) => ({
    selectedAudits: state.selectedAudits,
    selectedUnits: state.selectedUnits,
    selectedStandards: state.selectedStandards,
    selectedRiskTypes: state.selectedRiskTypes,
    activeEntityLayers: state.activeEntityLayers,
    likelihoodThreshold: state.likelihoodThreshold,
    severityThreshold: state.severityThreshold,
    activePreset: state.activePreset,
    searchQuery: state.searchQuery
  }));

/**
 * Get full timeline state
 */
export const useTimelineState = () =>
  useGraphStore((state) => ({
    currentDate: state.currentDate,
    minDate: state.minDate,
    maxDate: state.maxDate,
    isPlaying: state.isPlaying,
    speed: state.speed
  }));
