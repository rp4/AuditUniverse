/**
 * Graph Store Tests
 *
 * Tests for Zustand store slices and combined store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGraphStore } from '../graphStore';
import type { Node } from '@/types';

// Helper to reset store between tests
const resetStore = () => {
  useGraphStore.setState({
    // Filter state
    selectedAudits: new Set(),
    selectedUnits: new Set(),
    selectedStandards: new Set(),
    selectedRiskTypes: new Set(),
    activeEntityLayers: new Set(['risk', 'control', 'audit', 'issue', 'incident', 'standard', 'businessUnit']),
    likelihoodThreshold: 0,
    severityThreshold: 0,
    activePreset: null,
    searchQuery: '',
    riskViewMode: 'residual',

    // Timeline state
    currentDate: new Date(new Date().getFullYear(), 0, 1),
    isPlaying: false,
    speed: 1,
    playbackIntervalId: null,

    // Selection state
    selectedNode: null,
    hoveredNode: null,
    selectionHistory: [],
    historyIndex: -1
  });
};

describe('FilterSlice', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Audit filters', () => {
    it('adds an audit to selection', () => {
      const { addSelectedAudit } = useGraphStore.getState();
      addSelectedAudit('audit1');

      expect(useGraphStore.getState().selectedAudits.has('audit1')).toBe(true);
    });

    it('removes an audit from selection', () => {
      const { addSelectedAudit, removeSelectedAudit } = useGraphStore.getState();
      addSelectedAudit('audit1');
      removeSelectedAudit('audit1');

      expect(useGraphStore.getState().selectedAudits.has('audit1')).toBe(false);
    });

    it('clears all audits', () => {
      const { addSelectedAudit, clearSelectedAudits } = useGraphStore.getState();
      addSelectedAudit('audit1');
      addSelectedAudit('audit2');
      clearSelectedAudits();

      expect(useGraphStore.getState().selectedAudits.size).toBe(0);
    });

    it('sets audits from Set', () => {
      const { setSelectedAudits } = useGraphStore.getState();
      setSelectedAudits(new Set(['audit1', 'audit2', 'audit3']));

      const { selectedAudits } = useGraphStore.getState();
      expect(selectedAudits.size).toBe(3);
      expect(selectedAudits.has('audit1')).toBe(true);
      expect(selectedAudits.has('audit2')).toBe(true);
      expect(selectedAudits.has('audit3')).toBe(true);
    });
  });

  describe('Entity layer toggles', () => {
    it('toggles entity layer on', () => {
      const { hideAllEntityLayers, toggleEntityLayer } = useGraphStore.getState();
      hideAllEntityLayers();
      toggleEntityLayer('risk');

      expect(useGraphStore.getState().activeEntityLayers.has('risk')).toBe(true);
    });

    it('toggles entity layer off', () => {
      const { toggleEntityLayer } = useGraphStore.getState();
      toggleEntityLayer('risk');

      expect(useGraphStore.getState().activeEntityLayers.has('risk')).toBe(false);
    });

    it('shows all entity layers', () => {
      const { hideAllEntityLayers, showAllEntityLayers } = useGraphStore.getState();
      hideAllEntityLayers();
      showAllEntityLayers();

      const { activeEntityLayers } = useGraphStore.getState();
      expect(activeEntityLayers.size).toBe(7);
    });

    it('hides all entity layers', () => {
      const { hideAllEntityLayers } = useGraphStore.getState();
      hideAllEntityLayers();

      expect(useGraphStore.getState().activeEntityLayers.size).toBe(0);
    });
  });

  describe('Risk thresholds', () => {
    it('sets likelihood threshold', () => {
      const { setLikelihoodThreshold } = useGraphStore.getState();
      setLikelihoodThreshold(7);

      expect(useGraphStore.getState().likelihoodThreshold).toBe(7);
    });

    it('sets severity threshold', () => {
      const { setSeverityThreshold } = useGraphStore.getState();
      setSeverityThreshold(8);

      expect(useGraphStore.getState().severityThreshold).toBe(8);
    });
  });

  describe('Preset views', () => {
    it('sets active preset', () => {
      const { setActivePreset } = useGraphStore.getState();
      setActivePreset('high-residual-risk');

      expect(useGraphStore.getState().activePreset).toBe('high-residual-risk');
    });

    it('clears active preset', () => {
      const { setActivePreset } = useGraphStore.getState();
      setActivePreset('high-residual-risk');
      setActivePreset(null);

      expect(useGraphStore.getState().activePreset).toBe(null);
    });
  });

  describe('Search', () => {
    it('sets search query', () => {
      const { setSearchQuery } = useGraphStore.getState();
      setSearchQuery('security');

      expect(useGraphStore.getState().searchQuery).toBe('security');
    });
  });

  describe('Reset filters', () => {
    it('resets all filters to defaults', () => {
      const store = useGraphStore.getState();

      // Set various filters
      store.addSelectedAudit('audit1');
      store.setLikelihoodThreshold(5);
      store.setSeverityThreshold(6);
      store.setActivePreset('high-residual-risk');
      store.setSearchQuery('test');

      // Reset
      store.resetFilters();

      const state = useGraphStore.getState();
      expect(state.selectedAudits.size).toBe(0);
      expect(state.likelihoodThreshold).toBe(0);
      expect(state.severityThreshold).toBe(0);
      expect(state.activePreset).toBe(null);
      expect(state.searchQuery).toBe('');
      expect(state.activeEntityLayers.size).toBe(7);
    });
  });
});

describe('TimelineSlice', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Date management', () => {
    it('sets current date within range', () => {
      const { setDateRange, setCurrentDate } = useGraphStore.getState();
      // Set range first
      setDateRange(new Date(2024, 0, 1), new Date(2024, 11, 31));

      const date = new Date(2024, 5, 15);
      setCurrentDate(date);

      expect(useGraphStore.getState().currentDate.getTime()).toBe(date.getTime());
    });

    it('clamps date to valid range', () => {
      const { setDateRange, setCurrentDate } = useGraphStore.getState();
      setDateRange(new Date(2024, 0, 1), new Date(2024, 11, 31));

      // Try to set date before min
      setCurrentDate(new Date(2023, 0, 1));
      expect(useGraphStore.getState().currentDate.getFullYear()).toBe(2024);

      // Try to set date after max
      setCurrentDate(new Date(2025, 0, 1));
      expect(useGraphStore.getState().currentDate.getFullYear()).toBe(2024);
    });

    it('sets date range', () => {
      const { setDateRange } = useGraphStore.getState();
      const min = new Date(2023, 0, 1);
      const max = new Date(2024, 11, 31);

      setDateRange(min, max);

      const { minDate, maxDate } = useGraphStore.getState();
      expect(minDate.getTime()).toBe(min.getTime());
      expect(maxDate.getTime()).toBe(max.getTime());
    });
  });

  describe('Playback control', () => {
    it('starts playback', () => {
      const { play } = useGraphStore.getState();
      play();

      expect(useGraphStore.getState().isPlaying).toBe(true);
      expect(useGraphStore.getState().playbackIntervalId).not.toBe(null);
    });

    it('pauses playback', () => {
      const { play, pause } = useGraphStore.getState();
      play();
      pause();

      expect(useGraphStore.getState().isPlaying).toBe(false);
      expect(useGraphStore.getState().playbackIntervalId).toBe(null);
    });

    it('resets to start', () => {
      const { setCurrentDate, minDate, reset } = useGraphStore.getState();
      setCurrentDate(new Date(2024, 6, 1));
      reset();

      expect(useGraphStore.getState().currentDate.getTime()).toBe(minDate.getTime());
      expect(useGraphStore.getState().isPlaying).toBe(false);
    });

    it('toggles play/pause', () => {
      const { togglePlayPause } = useGraphStore.getState();

      togglePlayPause();
      expect(useGraphStore.getState().isPlaying).toBe(true);

      togglePlayPause();
      expect(useGraphStore.getState().isPlaying).toBe(false);
    });
  });

  describe('Speed control', () => {
    it('sets playback speed', () => {
      const { setSpeed } = useGraphStore.getState();
      setSpeed(2);

      expect(useGraphStore.getState().speed).toBe(2);
    });
  });

  describe('Date advancement', () => {
    it('advances by one month', () => {
      const { setCurrentDate, advanceDate } = useGraphStore.getState();
      const start = new Date(2024, 0, 1); // Jan 1
      setCurrentDate(start);

      advanceDate();

      const current = useGraphStore.getState().currentDate;
      expect(current.getMonth()).toBe(1); // Feb
    });

    it('loops back to start when reaching end', () => {
      const { setDateRange, setCurrentDate, advanceDate } = useGraphStore.getState();
      const min = new Date(2024, 0, 1);
      const max = new Date(2024, 11, 31);

      setDateRange(min, max);
      setCurrentDate(max);
      advanceDate();

      const current = useGraphStore.getState().currentDate;
      expect(current.getTime()).toBe(min.getTime());
    });
  });
});

describe('SelectionSlice', () => {
  beforeEach(() => {
    resetStore();
  });

  const mockNode: Node = {
    id: 'risk1',
    name: 'Test Risk',
    type: 'risk',
    inherent_likelihood: 8,
    inherent_severity: 7,
    inherent_rating: 7.5,
    residual_likelihood: 4,
    residual_severity: 5,
    residual_rating: 4.5
  };

  const mockNode2: Node = {
    id: 'risk2',
    name: 'Test Risk 2',
    type: 'risk',
    inherent_likelihood: 6,
    inherent_severity: 8,
    inherent_rating: 7,
    residual_likelihood: 3,
    residual_severity: 6,
    residual_rating: 4.5
  };

  describe('Node selection', () => {
    it('selects a node', () => {
      const { setSelectedNode } = useGraphStore.getState();
      setSelectedNode(mockNode);

      expect(useGraphStore.getState().selectedNode?.id).toBe('risk1');
    });

    it('clears selection', () => {
      const { setSelectedNode, clearSelection } = useGraphStore.getState();
      setSelectedNode(mockNode);
      clearSelection();

      expect(useGraphStore.getState().selectedNode).toBe(null);
    });

    it('selects node by ID', () => {
      const { selectNodeById } = useGraphStore.getState();
      selectNodeById('risk1', [mockNode, mockNode2]);

      expect(useGraphStore.getState().selectedNode?.id).toBe('risk1');
    });
  });

  describe('Node hover', () => {
    it('sets hovered node', () => {
      const { setHoveredNode } = useGraphStore.getState();
      setHoveredNode(mockNode);

      expect(useGraphStore.getState().hoveredNode?.id).toBe('risk1');
    });

    it('clears hovered node', () => {
      const { setHoveredNode } = useGraphStore.getState();
      setHoveredNode(mockNode);
      setHoveredNode(null);

      expect(useGraphStore.getState().hoveredNode).toBe(null);
    });
  });

  describe('Selection history', () => {
    it('adds to history when selecting', () => {
      const { setSelectedNode } = useGraphStore.getState();
      setSelectedNode(mockNode);
      setSelectedNode(mockNode2);

      const { selectionHistory } = useGraphStore.getState();
      expect(selectionHistory.length).toBe(2);
      expect(selectionHistory[0].id).toBe('risk1');
      expect(selectionHistory[1].id).toBe('risk2');
    });

    it('navigates back in history', () => {
      const { setSelectedNode, goBack } = useGraphStore.getState();
      setSelectedNode(mockNode);
      setSelectedNode(mockNode2);

      goBack();

      expect(useGraphStore.getState().selectedNode?.id).toBe('risk1');
    });

    it('navigates forward in history', () => {
      const { setSelectedNode, goBack, goForward } = useGraphStore.getState();
      setSelectedNode(mockNode);
      setSelectedNode(mockNode2);
      goBack();
      goForward();

      expect(useGraphStore.getState().selectedNode?.id).toBe('risk2');
    });

    it('checks if can go back', () => {
      const { setSelectedNode, canGoBack } = useGraphStore.getState();

      expect(canGoBack()).toBe(false);

      setSelectedNode(mockNode);
      setSelectedNode(mockNode2);

      expect(canGoBack()).toBe(true);
    });

    it('checks if can go forward', () => {
      const { setSelectedNode, goBack, canGoForward } = useGraphStore.getState();
      setSelectedNode(mockNode);
      setSelectedNode(mockNode2);

      expect(canGoForward()).toBe(false);

      goBack();

      expect(canGoForward()).toBe(true);
    });

    it('does not add same node twice to history', () => {
      const { setSelectedNode } = useGraphStore.getState();
      setSelectedNode(mockNode);
      setSelectedNode(mockNode); // Select same node again

      expect(useGraphStore.getState().selectionHistory.length).toBe(1);
    });
  });
});
