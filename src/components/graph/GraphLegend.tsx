/**
 * Graph Legend Component
 *
 * Displays visual encoding legend for the 3D graph:
 * - Color scale (likelihood)
 * - Size scale (severity)
 * - Shape key (entity types)
 * - Link colors (relationship types)
 */

import { useState } from 'react';
import { ENTITY_COLORS, RELATIONSHIP_COLORS } from '@/lib/nodeShapes';
import { getLikelihoodColor } from '@/lib/visualEncoding';

interface GraphLegendProps {
  className?: string;
}

export function GraphLegend({ className = '' }: GraphLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Generate likelihood color samples
  const likelihoodSamples = [1, 3, 5, 7, 10].map(value => ({
    value,
    color: getLikelihoodColor(value),
    label: value === 1 ? 'Low' : value === 10 ? 'High' : ''
  }));

  // Generate severity size samples
  const severitySamples = [
    { value: 1, size: 6, label: 'Low' },
    { value: 3, size: 8, label: '' },
    { value: 5, size: 10, label: 'Med' },
    { value: 7, size: 12, label: '' },
    { value: 10, size: 16, label: 'High' }
  ];

  // Entity shapes with labels
  const entityShapes = [
    { type: 'risk', label: 'Risk', shape: 'sphere', color: '#ff0000' },
    { type: 'control', label: 'Control', shape: 'cube', color: ENTITY_COLORS.control },
    { type: 'audit', label: 'Audit', shape: 'octahedron', color: ENTITY_COLORS.audit },
    { type: 'issue', label: 'Issue', shape: 'cone', color: ENTITY_COLORS.issue },
    { type: 'incident', label: 'Incident', shape: 'dodecahedron', color: ENTITY_COLORS.incident },
    { type: 'standard', label: 'Standard', shape: 'torus', color: ENTITY_COLORS.standard },
    { type: 'businessUnit', label: 'Business Unit', shape: 'icosahedron', color: ENTITY_COLORS.businessUnit }
  ];

  // Relationship types
  const relationships = [
    { type: 'mitigates', label: 'Control → Risk', color: RELATIONSHIP_COLORS.mitigates },
    { type: 'assessed_by', label: 'Audit → Risk', color: RELATIONSHIP_COLORS.assessed_by },
    { type: 'owned_by', label: 'Business Unit → Risk', color: RELATIONSHIP_COLORS.owned_by },
    { type: 'requires', label: 'Standard → Risk', color: RELATIONSHIP_COLORS.requires },
    { type: 'causes', label: 'Incident → Risk', color: RELATIONSHIP_COLORS.causes },
    { type: 'reports', label: 'Issue → Control/Risk', color: RELATIONSHIP_COLORS.reports }
  ];

  if (!isExpanded) {
    return (
      <div className={`glass-panel p-3 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="text-sm text-av-primary hover:text-white transition-colors font-semibold"
        >
          Show Legend ▼
        </button>
      </div>
    );
  }

  return (
    <div className={`glass-panel p-4 max-w-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-av-primary font-bold text-sm">Visual Encoding</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white text-xs"
        >
          Hide ▲
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* Color Scale - Likelihood */}
        <div>
          <h4 className="text-gray-400 font-semibold mb-2">Color = Likelihood</h4>
          <div className="flex items-center space-x-1">
            {likelihoodSamples.map((sample, idx) => (
              <div key={idx} className="flex-1">
                <div
                  className="w-full h-6 rounded"
                  style={{ backgroundColor: sample.color }}
                />
                {sample.label && (
                  <div className="text-center text-gray-500 mt-1 text-[10px]">
                    {sample.label}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-gray-500 mt-1 text-[10px]">
            Blue (unlikely) → Red (likely)
          </div>
        </div>

        {/* Size Scale - Severity */}
        <div>
          <h4 className="text-gray-400 font-semibold mb-2">Size = Severity</h4>
          <div className="flex items-end justify-between px-2">
            {severitySamples.map((sample, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className="rounded-full bg-av-accent"
                  style={{
                    width: `${sample.size}px`,
                    height: `${sample.size}px`
                  }}
                />
                {sample.label && (
                  <div className="text-gray-500 mt-1 text-[10px]">
                    {sample.label}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-gray-500 mt-2 text-[10px] text-center">
            Small (minor) → Large (critical)
          </div>
        </div>

        {/* Shape Key - Entity Types */}
        <div>
          <h4 className="text-gray-400 font-semibold mb-2">Shape = Entity Type</h4>
          <div className="space-y-1.5">
            {entityShapes.map((entity) => (
              <div key={entity.type} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: entity.color }}
                />
                <span className="text-gray-300 capitalize text-[11px]">
                  {entity.label}
                </span>
                <span className="text-gray-600 text-[10px]">
                  ({entity.shape})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Link Colors - Relationships */}
        <div>
          <h4 className="text-gray-400 font-semibold mb-2">Link = Relationship</h4>
          <div className="space-y-1.5">
            {relationships.map((rel) => (
              <div key={rel.type} className="flex items-center space-x-2">
                <div
                  className="w-8 h-0.5 flex-shrink-0"
                  style={{ backgroundColor: rel.color }}
                />
                <span className="text-gray-300 text-[11px]">
                  {rel.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Opacity Note */}
        <div className="pt-2 border-t border-av-border">
          <h4 className="text-gray-400 font-semibold mb-1">Opacity</h4>
          <p className="text-gray-500 text-[10px] leading-relaxed">
            Faded nodes indicate older assessments or lower confidence. Links inherit opacity from connected nodes.
          </p>
        </div>
      </div>
    </div>
  );
}
