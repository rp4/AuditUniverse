/**
 * Right Sidebar Component
 *
 * Displays details about the selected node:
 * - Node name and type
 * - Risk metrics (for risks)
 * - Connected entities list
 */

import type { Node, Link, GraphData } from '@/types';

interface RightSidebarProps {
  node: Node | null;
  graphData: GraphData;
  onClose: () => void;
  onNodeNavigate: (nodeId: string) => void;
}

export function RightSidebar({ node, graphData, onClose, onNodeNavigate }: RightSidebarProps) {
  // Find all links connected to this node (if a node is selected)
  const connectedLinks = node ? graphData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return sourceId === node.id || targetId === node.id;
  }) : [];

  // Group connections by relationship type
  const connectionsByType = new Map<string, Array<{ node: Node; link: Link; direction: 'incoming' | 'outgoing' }>>();

  if (node) {
    connectedLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

      const isSource = sourceId === node.id;
      const connectedNodeId = isSource ? targetId : sourceId;
      const connectedNode = graphData.nodes.find(n => n.id === connectedNodeId);

      if (connectedNode) {
        if (!connectionsByType.has(link.type)) {
          connectionsByType.set(link.type, []);
        }
        connectionsByType.get(link.type)!.push({
          node: connectedNode,
          link,
          direction: isSource ? 'outgoing' : 'incoming'
        });
      }
    });
  }

  const getRelationshipLabel = (type: string): string => {
    const labels: Record<string, string> = {
      mitigates: 'MITIGATED BY',
      assessed_by: 'ASSESSED BY',
      owned_by: 'OWNED BY',
      requires: 'REQUIRES',
      causes: 'CAUSES',
      reports: 'REPORTS',
      temporal: 'TEMPORAL'
    };
    return labels[type] || type.toUpperCase().replace(/_/g, ' ');
  };

  const getEntityColor = (entityType: string): string => {
    const colors: Record<string, string> = {
      risk: 'bg-pink-500',
      control: 'bg-cyan-500',
      audit: 'bg-orange-500',
      issue: 'bg-yellow-500',
      incident: 'bg-pink-500',
      standard: 'bg-purple-500',
      businessUnit: 'bg-teal-500'
    };
    return colors[entityType] || 'bg-gray-500';
  };

  return (
    <div className="relative w-64 h-full metal-panel overflow-y-auto p-4 flex-shrink-0" style={{
      borderLeft: '5px solid #4a4a4f',
      borderLeftStyle: 'groove',
      boxShadow: 'inset 3px 0 10px rgba(0,0,0,0.8), inset -3px 0 10px rgba(80,80,80,0.3), -5px 0 15px rgba(0,0,0,0.6)'
    }}>
      {/* Corner rivets (12px) */}
      <div className="absolute top-2 left-2 w-[12px] h-[12px] rivet" />
      <div className="absolute top-2 right-2 w-[12px] h-[12px] rivet" />
      <div className="absolute bottom-2 left-2 w-[12px] h-[12px] rivet" />
      <div className="absolute bottom-2 right-2 w-[12px] h-[12px] rivet" />
      {/* Header */}
      {node ? (
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-base" style={{
              fontFamily: 'Orbitron, monospace',
              color: '#00ffdd',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}>{node.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="text-sm uppercase tracking-wider" style={{
            color: '#8ab4f8',
            fontFamily: 'Orbitron, monospace'
          }}>{node.type}</div>
        </div>
      ) : (
        <div className="mb-4">
          <h3 className="font-bold text-base" style={{
            fontFamily: 'Orbitron, monospace',
            color: '#00ffdd',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}>Node Details</h3>
          <div className="text-xs text-gray-500 mt-2">Select a node to view details</div>
        </div>
      )}

      {/* Risk-specific metrics */}
      {node && node.type === 'risk' && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <MetricBox
              label="Inherent Likelihood"
              value={(node as any).inherent_likelihood}
              color="text-cyan-500"
            />
            <MetricBox
              label="Residual Likelihood"
              value={(node as any).residual_likelihood}
              color="text-cyan-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MetricBox
              label="Inherent Severity"
              value={(node as any).inherent_severity}
              color="text-orange-500"
            />
            <MetricBox
              label="Residual Severity"
              value={(node as any).residual_severity}
              color="text-orange-500"
            />
          </div>
        </div>
      )}

      {/* Connected Entities */}
      <div className="border-t border-av-border/30 pt-4">
        <h4 className="text-sm font-bold uppercase tracking-widest mb-3" style={{
          fontFamily: 'Orbitron, monospace',
          color: '#8ab4f8',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          letterSpacing: '1.5px'
        }}>
          Connected Entities
        </h4>
        {!node ? (
          <div className="text-center py-4 text-gray-600 text-xs">
            Select a node to view connections
          </div>
        ) : connectedLinks.length === 0 ? (
          <div className="text-center py-4 text-gray-600 text-xs">
            No connections
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from(connectionsByType.entries()).map(([relType, connections]) => (
              <div key={relType}>
                <div className="text-[10px] text-cyan-500 uppercase tracking-wider mb-1.5">
                  {getRelationshipLabel(relType)}
                </div>
                <div className="space-y-1">
                  {connections.map(({ node: connectedNode }) => (
                    <button
                      key={connectedNode.id}
                      onClick={() => onNodeNavigate(connectedNode.id)}
                      className="w-full text-left px-2 py-1.5 rounded bg-gray-800/40 border border-av-border/20 hover:border-av-primary/50 hover:bg-gray-700/50 transition-all group flex items-center gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full ${getEntityColor(connectedNode.type)} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-300 group-hover:text-av-primary transition-colors truncate">
                          {connectedNode.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Metric box component
interface MetricBoxProps {
  label: string;
  value: number;
  color: string;
}

function MetricBox({ label, value }: MetricBoxProps) {
  return (
    <div className="relative panel-outset p-2">
      {/* Corner rivets (4px) */}
      <div className="absolute top-0.5 left-0.5 w-[4px] h-[4px] rivet" />
      <div className="absolute top-0.5 right-0.5 w-[4px] h-[4px] rivet" />
      <div className="absolute bottom-0.5 left-0.5 w-[4px] h-[4px] rivet" />
      <div className="absolute bottom-0.5 right-0.5 w-[4px] h-[4px] rivet" />

      <div className="text-[10px] text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{
        fontFamily: 'Orbitron, monospace',
        color: '#00ffdd',
        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        letterSpacing: '0.5px'
      }}>
        {value}
      </div>
    </div>
  );
}
