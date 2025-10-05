/**
 * Selection Slice
 *
 * State management for node selection and hover:
 * - Selected node (for details panel)
 * - Hovered node (for tooltip)
 * - Selection history (for navigation)
 */

import type { StateCreator } from 'zustand';
import type { Node } from '@/types';

export interface SelectionSlice {
  // Currently selected node
  selectedNode: Node | null;

  // Currently hovered node (for tooltip)
  hoveredNode: Node | null;

  // Selection history (for back/forward navigation)
  selectionHistory: Node[];
  historyIndex: number;

  // Actions
  setSelectedNode: (node: Node | null) => void;
  selectNodeById: (nodeId: string, allNodes: Node[]) => void;
  clearSelection: () => void;

  setHoveredNode: (node: Node | null) => void;

  // History navigation
  goBack: () => void;
  goForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
}

const MAX_HISTORY = 50; // Limit history to prevent memory issues

export const createSelectionSlice: StateCreator<SelectionSlice> = (set, get) => ({
  // Initial state
  selectedNode: null,
  hoveredNode: null,
  selectionHistory: [],
  historyIndex: -1,

  // Set selected node
  setSelectedNode: (node) => {
    const { selectedNode, selectionHistory, historyIndex } = get();

    // Don't add to history if selecting the same node
    if (node && selectedNode && node.id === selectedNode.id) {
      return;
    }

    set({ selectedNode: node });

    // Add to history if node is selected (not null)
    if (node) {
      // Remove any forward history when selecting new node
      const newHistory = selectionHistory.slice(0, historyIndex + 1);
      newHistory.push(node);

      // Trim history if too long
      const trimmedHistory =
        newHistory.length > MAX_HISTORY
          ? newHistory.slice(-MAX_HISTORY)
          : newHistory;

      set({
        selectionHistory: trimmedHistory,
        historyIndex: trimmedHistory.length - 1
      });
    }
  },

  // Select node by ID (helper for when you have ID but not full node)
  selectNodeById: (nodeId, allNodes) => {
    const node = allNodes.find((n) => n.id === nodeId);
    if (node) {
      get().setSelectedNode(node);
    }
  },

  // Clear selection
  clearSelection: () => set({ selectedNode: null }),

  // Set hovered node
  setHoveredNode: (node) => set({ hoveredNode: node }),

  // Navigate back in history
  goBack: () => {
    const { selectionHistory, historyIndex } = get();

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        selectedNode: selectionHistory[newIndex],
        historyIndex: newIndex
      });
    }
  },

  // Navigate forward in history
  goForward: () => {
    const { selectionHistory, historyIndex } = get();

    if (historyIndex < selectionHistory.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        selectedNode: selectionHistory[newIndex],
        historyIndex: newIndex
      });
    }
  },

  // Check if can go back
  canGoBack: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  // Check if can go forward
  canGoForward: () => {
    const { selectionHistory, historyIndex } = get();
    return historyIndex < selectionHistory.length - 1;
  }
});
