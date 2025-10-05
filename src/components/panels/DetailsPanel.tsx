/**
 * Details Panel Component
 *
 * Displays comprehensive information about the selected node:
 * - All node properties
 * - Connected entities (clickable)
 * - Relationship information
 * - Type-specific metrics
 */

import type { Node, Link, GraphData } from '@/types';

interface DetailsPanelProps {
  node: Node | null;
  graphData: GraphData;
  onClose: () => void;
  onNodeNavigate: (nodeId: string) => void;
}

export function DetailsPanel({ node, graphData, onClose, onNodeNavigate }: DetailsPanelProps) {
  if (!node) return null;

  // Find all links connected to this node
  const connectedLinks = graphData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return sourceId === node.id || targetId === node.id;
  });

  // Group connections by relationship type
  const connectionsByType = new Map<string, Array<{ node: Node; link: Link; direction: 'incoming' | 'outgoing' }>>();

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

  return (
    <div className="absolute bottom-4 left-4 glass-panel p-4 w-96 max-h-[80vh] overflow-y-auto border border-av-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-av-border">
        <div className="flex-1">
          <h3 className="text-av-primary font-bold text-lg mb-1">{node.name}</h3>
          <span className="text-gray-500 text-xs uppercase tracking-wide">{node.type}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors ml-2"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Risk-specific details */}
        {node.type === 'risk' && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Inherent Likelihood"
                value={(node as any).inherent_likelihood}
                max={10}
                color="likelihood"
              />
              <MetricCard
                label="Inherent Severity"
                value={(node as any).inherent_severity}
                max={10}
                color="severity"
              />
              <MetricCard
                label="Residual Likelihood"
                value={(node as any).residual_likelihood}
                max={10}
                color="likelihood"
              />
              <MetricCard
                label="Residual Severity"
                value={(node as any).residual_severity}
                max={10}
                color="severity"
              />
            </div>

            {/* Risk Rating */}
            <div className="p-3 bg-av-panel-dark rounded border border-av-border">
              <div className="text-xs text-gray-500 mb-1">Risk Rating</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-av-accent">
                  {((node as any).residual_likelihood * (node as any).residual_severity).toFixed(0)}
                </span>
                <span className="text-sm text-gray-400">/ 100</span>
              </div>
            </div>

            {/* Additional Properties */}
            {(node as any).category && (
              <PropertyRow label="Category" value={(node as any).category} />
            )}
            {(node as any).owner && (
              <PropertyRow label="Owner" value={(node as any).owner} />
            )}
          </>
        )}

        {/* Control-specific details */}
        {node.type === 'control' && (
          <>
            <div className="p-3 bg-av-panel-dark rounded border border-av-border">
              <div className="text-xs text-gray-500 mb-1">Effectiveness</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-av-success">
                  {((node as any).effectiveness * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            {(node as any).type_detail && (
              <PropertyRow label="Control Type" value={(node as any).type_detail} />
            )}
            {(node as any).frequency && (
              <PropertyRow label="Frequency" value={(node as any).frequency} />
            )}
          </>
        )}

        {/* Audit-specific details */}
        {node.type === 'audit' && (
          <>
            {(node as any).status && (
              <PropertyRow label="Status" value={(node as any).status} />
            )}
            {(node as any).date && (
              <PropertyRow
                label="Date"
                value={new Date((node as any).date).toLocaleDateString()}
              />
            )}
            {(node as any).scope && (
              <PropertyRow label="Scope" value={(node as any).scope} />
            )}
          </>
        )}

        {/* Description */}
        {node.description && (
          <div className="p-3 bg-av-panel-dark rounded border border-av-border">
            <div className="text-xs text-gray-500 mb-2">Description</div>
            <p className="text-sm text-gray-300 leading-relaxed">{node.description}</p>
          </div>
        )}

        {/* Connected Entities */}
        {connectedLinks.length > 0 && (
          <div className="pt-4 border-t border-av-border">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">
              Connected Entities ({connectedLinks.length})
            </h4>
            <div className="space-y-3">
              {Array.from(connectionsByType.entries()).map(([relType, connections]) => (
                <div key={relType} className="space-y-2">
                  <div className="text-xs text-gray-600 uppercase tracking-wide">
                    {relType.replace(/_/g, ' ')} ({connections.length})
                  </div>
                  {connections.map(({ node: connectedNode, direction }) => (
                    <button
                      key={connectedNode.id}
                      onClick={() => onNodeNavigate(connectedNode.id)}
                      className="w-full text-left p-2 rounded border border-av-border hover:border-av-primary hover:bg-av-panel-dark transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-300 group-hover:text-av-primary transition-colors">
                            {connectedNode.name}
                          </div>
                          <div className="text-xs text-gray-600 capitalize">
                            {connectedNode.type}
                            {direction === 'incoming' && ' →'}
                            {direction === 'outgoing' && ' ←'}
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 text-gray-600 group-hover:text-av-primary transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No connections message */}
        {connectedLinks.length === 0 && (
          <div className="text-center py-6 text-gray-600 text-sm">
            No connected entities
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for metric cards
function MetricCard({ label, value, max, color }: { label: string; value: number; max: number; color: 'likelihood' | 'severity' }) {
  const percentage = (value / max) * 100;
  const colorClass = color === 'likelihood'
    ? value <= 3 ? 'bg-blue-500' : value <= 7 ? 'bg-yellow-500' : 'bg-red-500'
    : 'bg-av-accent';

  return (
    <div className="p-3 bg-av-panel-dark rounded border border-av-border">
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      <div className="flex items-baseline space-x-2 mb-2">
        <span className="text-xl font-bold text-gray-300">{value}</span>
        <span className="text-xs text-gray-600">/ {max}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Helper component for property rows
function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-av-border last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-300 capitalize">{value}</span>
    </div>
  );
}
