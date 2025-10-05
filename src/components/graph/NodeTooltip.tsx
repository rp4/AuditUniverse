/**
 * Node Tooltip Component
 *
 * Shows node details on hover with proper positioning
 */

import { useEffect, useState } from 'react';
import type { Node } from '@/types';

interface NodeTooltipProps {
  node: Node | null;
  x: number;
  y: number;
}

export function NodeTooltip({ node, x, y }: NodeTooltipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (node) {
      // Position tooltip offset from cursor
      setPosition({
        x: x + 15,
        y: y + 15
      });
    }
  }, [node, x, y]);

  if (!node) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="glass-panel p-3 max-w-xs border border-av-border shadow-lg">
        <div className="space-y-2">
          {/* Node name */}
          <div>
            <h4 className="text-av-primary font-semibold text-sm">
              {node.name}
            </h4>
            <p className="text-gray-500 text-xs capitalize">{node.type}</p>
          </div>

          {/* Risk-specific metrics */}
          {node.type === 'risk' && (
            <div className="text-xs space-y-1 pt-2 border-t border-av-border">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Likelihood:</span>
                  <span className="ml-1 text-gray-300">
                    {(node as any).residual_likelihood}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Severity:</span>
                  <span className="ml-1 text-gray-300">
                    {(node as any).residual_severity}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-1 text-gray-300 capitalize">
                  {(node as any).category || 'N/A'}
                </span>
              </div>
            </div>
          )}

          {/* Control-specific metrics */}
          {node.type === 'control' && (
            <div className="text-xs pt-2 border-t border-av-border">
              <span className="text-gray-500">Effectiveness:</span>
              <span className="ml-1 text-gray-300">
                {((node as any).effectiveness * 100).toFixed(0)}%
              </span>
            </div>
          )}

          {/* Audit-specific info */}
          {node.type === 'audit' && (
            <div className="text-xs space-y-1 pt-2 border-t border-av-border">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-1 text-gray-300 capitalize">
                  {(node as any).status || 'N/A'}
                </span>
              </div>
              {(node as any).date && (
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-1 text-gray-300">
                    {new Date((node as any).date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Interaction hint */}
          <div className="text-[10px] text-gray-600 pt-1">
            Click for details
          </div>
        </div>
      </div>
    </div>
  );
}
