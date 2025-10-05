/**
 * Filter Types
 *
 * Types for managing filter state and preset views
 */

import type { Node, Link, NodeType } from './graph.types';

export type PresetId =
  | 'default'
  | 'uncontrolled-risks'
  | 'unaudited-risks'
  | 'unmonitored-standards'
  | 'audit-blind-spots'
  | 'high-issue-risks'
  | 'high-incident-risks'
  | 'failed-controls'
  | 'high-residual-risk'
  | 'standard-violations'
  | 'regulatory-exposure'
  | 'enterprise-risk-profile'
  | 'audit-coverage';

export interface PresetView {
  id: PresetId;
  name: string;
  description: string;
  category: 'coverage' | 'hotspots' | 'planning' | 'overview';
}

export interface PresetResult {
  nodes: Node[];
  links: Link[];
  message: string;
}

export interface FilterState {
  // Selected filters
  selectedAudits: Set<string>;
  selectedUnits: Set<string>;
  selectedStandards: Set<string>;
  selectedRiskTypes: Set<string>;

  // Entity layer visibility
  activeEntityLayers: Set<NodeType>;

  // Risk threshold
  riskThreshold: number;  // 0-10

  // Active preset
  activePreset: PresetId | null;

  // Search query
  searchQuery: string;
}

export interface FilterActions {
  setSelectedAudits: (audits: Set<string>) => void;
  setSelectedUnits: (units: Set<string>) => void;
  setSelectedStandards: (standards: Set<string>) => void;
  setSelectedRiskTypes: (types: Set<string>) => void;
  setActiveEntityLayers: (layers: Set<NodeType>) => void;
  setRiskThreshold: (threshold: number) => void;
  setActivePreset: (preset: PresetId | null) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}
