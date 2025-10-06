/**
 * AuditVerse Application Root
 *
 * Main application component that handles:
 * - Data loading (WelcomeScreen)
 * - Graph visualization (coming in Phase 5)
 */

import { useState, useEffect, useMemo } from 'react';
import { WelcomeScreen } from './components/upload/WelcomeScreen';
import { ForceGraph3DComponent } from './components/graph/ForceGraph3D';
import { NodeTooltip } from './components/graph/NodeTooltip';
import { Header } from './components/panels/Header';
import { LeftSidebar } from './components/panels/LeftSidebar';
import { RightSidebar } from './components/panels/RightSidebar';
import { Footer } from './components/panels/Footer';
import { ExportModal } from './components/panels/ExportModal';
import { useFilters } from './hooks/useFilters';
import { useTemporalFilter } from './hooks/useTemporalFilter';
import { applyPresetView } from './lib/presetViews';
import { getDateRange } from './lib/temporalFilter';
import { useGraphStore } from './store/graphStore';
import type { Node, TemporalDataset } from './types';

function App() {
  const [rawGraphData, setRawGraphData] = useState<TemporalDataset | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showExportModal, setShowExportModal] = useState(false);

  const activePreset = useGraphStore(state => state.activePreset);
  const setDateRange = useGraphStore(state => state.setDateRange);

  // Initialize timeline date range when data loads
  useEffect(() => {
    if (rawGraphData?.events && rawGraphData.events.length > 0) {
      const { min, max } = getDateRange(rawGraphData);
      setDateRange(min, max);
    }
  }, [rawGraphData, setDateRange]);

  // Apply temporal filtering first
  const temporalData = useTemporalFilter(rawGraphData);

  // Then apply preset view
  const presetData = useMemo(() => {
    if (!activePreset || activePreset === 'default') return temporalData;
    const result = applyPresetView(activePreset, temporalData);
    return result.data;
  }, [temporalData, activePreset]);

  // Finally apply user filters
  const graphData = useFilters(presetData);

  // Get preset message (unused for now - can be used for status display)
  // const presetMessage = useMemo(() => {
  //   if (!activePreset || activePreset === 'default') return null;
  //   return applyPresetView(activePreset, temporalData).message;
  // }, [temporalData, activePreset]);

  const hasTemporalData = !!(rawGraphData?.events && rawGraphData.events.length > 0);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard support - ESC to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedNode) {
        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  if (!rawGraphData) {
    return <WelcomeScreen onDataLoaded={setRawGraphData} />;
  }

  // Main graph view with 3D visualization - Starship control panel layout
  return (
    <div className="h-screen bg-av-background flex flex-col overflow-hidden">
      {/* Header - Full width */}
      <div className="relative z-30">
        <Header
          rawData={rawGraphData || { nodes: [], links: [] }}
          filteredData={graphData}
        />
      </div>

      {/* Main content area - Contains sidebars and graph viewport */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Flush with header/footer */}
        <div className="relative z-20 flex-shrink-0 w-56 h-full overflow-y-auto">
          <LeftSidebar rawData={rawGraphData || { nodes: [], links: [] }} />
        </div>

        {/* Center - 3D Graph "Viewport into space" */}
        <div className="flex-1 relative z-0 h-full overflow-hidden">
          <ForceGraph3DComponent
            data={graphData}
            onNodeClick={setSelectedNode}
            onNodeHover={setHoveredNode}
            selectedNodeId={selectedNode?.id || null}
          />

          {/* Hover tooltip */}
          <NodeTooltip
            node={hoveredNode}
            x={mousePosition.x}
            y={mousePosition.y}
          />
        </div>

        {/* Right Sidebar - Flush with header/footer - Always visible */}
        <div className="relative z-20 flex-shrink-0 w-64 h-full overflow-y-auto">
          <RightSidebar
            node={selectedNode}
            graphData={rawGraphData || { nodes: [], links: [] }}
            onClose={() => setSelectedNode(null)}
            onNodeNavigate={(nodeId) => {
              const node = rawGraphData?.nodes.find(n => n.id === nodeId);
              if (node) setSelectedNode(node);
            }}
          />
        </div>
      </div>

      {/* Footer - Full width */}
      <div className="relative z-30">
        <Footer
          hasTemporalData={hasTemporalData}
          onExportClick={() => setShowExportModal(true)}
        />
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          data={graphData}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;
