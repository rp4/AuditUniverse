/**
 * Filter Slice
 *
 * State management for all filtering operations:
 * - Selected audits, business units, standards, risk types
 * - Entity layer visibility toggles
 * - Risk threshold slider
 * - Active preset view
 * - Search query
 */

import type { StateCreator } from 'zustand';
import type { NodeType, PresetId } from '@/types';

export interface FilterSlice {
  // Filter selections
  selectedAudits: Set<string>;
  selectedUnits: Set<string>;
  selectedStandards: Set<string>;
  selectedRiskTypes: Set<string>;

  // Entity layer visibility (which node types to show)
  activeEntityLayers: Set<NodeType>;

  // Risk thresholds (minimum likelihood and severity to display)
  likelihoodThreshold: number;
  severityThreshold: number;

  // Active preset view
  activePreset: PresetId | null;

  // Search query
  searchQuery: string;

  // Risk view mode (residual vs inherent)
  riskViewMode: 'residual' | 'inherent';

  // Link strength filter
  linkStrength: number;

  // Actions
  setSelectedAudits: (audits: Set<string>) => void;
  addSelectedAudit: (auditId: string) => void;
  removeSelectedAudit: (auditId: string) => void;
  clearSelectedAudits: () => void;

  setSelectedUnits: (units: Set<string>) => void;
  addSelectedUnit: (unitId: string) => void;
  removeSelectedUnit: (unitId: string) => void;
  clearSelectedUnits: () => void;

  setSelectedStandards: (standards: Set<string>) => void;
  addSelectedStandard: (standardId: string) => void;
  removeSelectedStandard: (standardId: string) => void;
  clearSelectedStandards: () => void;

  setSelectedRiskTypes: (types: Set<string>) => void;
  addSelectedRiskType: (typeId: string) => void;
  removeSelectedRiskType: (typeId: string) => void;
  clearSelectedRiskTypes: () => void;

  setActiveEntityLayers: (layers: Set<NodeType>) => void;
  toggleEntityLayer: (layer: NodeType) => void;
  showAllEntityLayers: () => void;
  hideAllEntityLayers: () => void;

  setLikelihoodThreshold: (threshold: number) => void;
  setSeverityThreshold: (threshold: number) => void;

  setActivePreset: (preset: PresetId | null) => void;

  setSearchQuery: (query: string) => void;

  setRiskViewMode: (mode: 'residual' | 'inherent') => void;

  setLinkStrength: (strength: number) => void;

  resetFilters: () => void;
}

const DEFAULT_ENTITY_LAYERS: Set<NodeType> = new Set([
  'risk',
  'control',
  'audit',
  'issue',
  'incident',
  'standard',
  'businessUnit'
]);

export const createFilterSlice: StateCreator<FilterSlice> = (set) => ({
  // Initial state
  selectedAudits: new Set(),
  selectedUnits: new Set(),
  selectedStandards: new Set(),
  selectedRiskTypes: new Set(),
  activeEntityLayers: new Set(DEFAULT_ENTITY_LAYERS),
  likelihoodThreshold: 0,
  severityThreshold: 0,
  activePreset: null,
  searchQuery: '',
  riskViewMode: 'residual',
  linkStrength: 0.5,

  // Audit actions
  setSelectedAudits: (audits) => set({ selectedAudits: audits }),
  addSelectedAudit: (auditId) =>
    set((state) => ({
      selectedAudits: new Set([...state.selectedAudits, auditId])
    })),
  removeSelectedAudit: (auditId) =>
    set((state) => {
      const newSet = new Set(state.selectedAudits);
      newSet.delete(auditId);
      return { selectedAudits: newSet };
    }),
  clearSelectedAudits: () => set({ selectedAudits: new Set() }),

  // Business unit actions
  setSelectedUnits: (units) => set({ selectedUnits: units }),
  addSelectedUnit: (unitId) =>
    set((state) => ({
      selectedUnits: new Set([...state.selectedUnits, unitId])
    })),
  removeSelectedUnit: (unitId) =>
    set((state) => {
      const newSet = new Set(state.selectedUnits);
      newSet.delete(unitId);
      return { selectedUnits: newSet };
    }),
  clearSelectedUnits: () => set({ selectedUnits: new Set() }),

  // Standards actions
  setSelectedStandards: (standards) => set({ selectedStandards: standards }),
  addSelectedStandard: (standardId) =>
    set((state) => ({
      selectedStandards: new Set([...state.selectedStandards, standardId])
    })),
  removeSelectedStandard: (standardId) =>
    set((state) => {
      const newSet = new Set(state.selectedStandards);
      newSet.delete(standardId);
      return { selectedStandards: newSet };
    }),
  clearSelectedStandards: () => set({ selectedStandards: new Set() }),

  // Risk type actions
  setSelectedRiskTypes: (types) => set({ selectedRiskTypes: types }),
  addSelectedRiskType: (typeId) =>
    set((state) => ({
      selectedRiskTypes: new Set([...state.selectedRiskTypes, typeId])
    })),
  removeSelectedRiskType: (typeId) =>
    set((state) => {
      const newSet = new Set(state.selectedRiskTypes);
      newSet.delete(typeId);
      return { selectedRiskTypes: newSet };
    }),
  clearSelectedRiskTypes: () => set({ selectedRiskTypes: new Set() }),

  // Entity layer actions
  setActiveEntityLayers: (layers) => set({ activeEntityLayers: layers }),
  toggleEntityLayer: (layer) =>
    set((state) => {
      const newSet = new Set(state.activeEntityLayers);
      if (newSet.has(layer)) {
        newSet.delete(layer);
      } else {
        newSet.add(layer);
      }
      return { activeEntityLayers: newSet };
    }),
  showAllEntityLayers: () =>
    set({ activeEntityLayers: new Set(DEFAULT_ENTITY_LAYERS) }),
  hideAllEntityLayers: () => set({ activeEntityLayers: new Set() }),

  // Risk threshold actions
  setLikelihoodThreshold: (threshold) => set({ likelihoodThreshold: threshold }),
  setSeverityThreshold: (threshold) => set({ severityThreshold: threshold }),

  // Preset action
  setActivePreset: (preset) => set({ activePreset: preset }),

  // Search action
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Risk view mode action
  setRiskViewMode: (mode) => set({ riskViewMode: mode }),

  // Link strength action
  setLinkStrength: (strength) => set({ linkStrength: strength }),

  // Reset all filters
  resetFilters: () =>
    set({
      selectedAudits: new Set(),
      selectedUnits: new Set(),
      selectedStandards: new Set(),
      selectedRiskTypes: new Set(),
      activeEntityLayers: new Set(DEFAULT_ENTITY_LAYERS),
      likelihoodThreshold: 0,
      severityThreshold: 0,
      activePreset: null,
      searchQuery: '',
      riskViewMode: 'residual',
      linkStrength: 0.5
    })
});
