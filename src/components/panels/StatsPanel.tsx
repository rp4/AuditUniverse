/**
 * Stats Panel Component
 *
 * Displays key metrics and statistics
 */

import type { GraphData } from '@/types';

interface StatsPanelProps {
  rawData: GraphData;
  filteredData: GraphData;
}

export function StatsPanel({ rawData, filteredData }: StatsPanelProps) {
  // Calculate stats
  const totalRisks = rawData.nodes.filter(n => n.type === 'risk').length;
  const visibleRisks = filteredData.nodes.filter(n => n.type === 'risk').length;

  const highRisks = filteredData.nodes.filter(n => {
    if (n.type !== 'risk') return false;
    const rating = (n as any).residual_likelihood * (n as any).residual_severity;
    return rating > 49;
  }).length;

  const auditedRiskIds = new Set<string>();
  rawData.links.forEach(link => {
    if (link.type === 'assessed_by') {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      auditedRiskIds.add(targetId);
    }
  });

  const coverage = totalRisks > 0 ? ((auditedRiskIds.size / totalRisks) * 100).toFixed(0) : '0';

  return (
    <div className="flex items-center space-x-4">
      {/* Total Risks */}
      <div className="text-center">
        <div className="text-xs text-gray-500">Risks</div>
        <div className="text-lg font-bold text-gray-300">
          {visibleRisks}
          {visibleRisks !== totalRisks && (
            <span className="text-xs text-gray-600">/{totalRisks}</span>
          )}
        </div>
      </div>

      {/* High Risks */}
      <div className="text-center">
        <div className="text-xs text-gray-500">High Risk</div>
        <div className="text-lg font-bold text-av-accent">{highRisks}</div>
      </div>

      {/* Coverage */}
      <div className="text-center">
        <div className="text-xs text-gray-500">Coverage</div>
        <div className="text-lg font-bold text-av-success">{coverage}%</div>
      </div>

      {/* Total Nodes */}
      <div className="text-center">
        <div className="text-xs text-gray-500">Nodes</div>
        <div className="text-lg font-bold text-av-primary">
          {filteredData.nodes.length}
        </div>
      </div>
    </div>
  );
}
