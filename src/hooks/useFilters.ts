/**
 * useFilters Hook
 *
 * Combines all active filters to produce filtered graph data.
 * Filters are combined with AND logic:
 * - Entity layer toggles (show/hide by type)
 * - Selected audits (risks assessed by these audits)
 * - Selected business units (risks owned by these units)
 * - Selected standards (risks requiring these standards)
 * - Risk types (operational, financial, etc.)
 * - Likelihood threshold (minimum likelihood based on view mode)
 * - Severity threshold (minimum severity based on view mode)
 * - Search query (name contains)
 */

import { useMemo } from 'react';
import { useGraphStore } from '@/store/graphStore';
import type { GraphData } from '@/types';

export function useFilters(rawData: GraphData): GraphData {
  const {
    selectedAudits,
    selectedUnits,
    selectedStandards,
    selectedRiskTypes,
    activeEntityLayers,
    likelihoodThreshold,
    severityThreshold,
    riskViewMode,
    searchQuery
  } = useGraphStore();

  const filteredData = useMemo(() => {
    let nodes = [...rawData.nodes];
    let links = [...rawData.links];

    // 1. Entity layer filter (show/hide by type)
    if (activeEntityLayers.size > 0 && activeEntityLayers.size < 7) {
      nodes = nodes.filter(node => activeEntityLayers.has(node.type));
    }

    // 2. Search filter (name contains query, case-insensitive)
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(node => node.name.toLowerCase().includes(query));
    }

    // 3. Audit filter (risks assessed by selected audits)
    if (selectedAudits.size > 0) {
      const auditedRiskIds = new Set<string>();

      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

        if (link.type === 'assessed_by') {
          // audit → risk
          if (selectedAudits.has(sourceId)) {
            auditedRiskIds.add(targetId);
          }
        }
      });

      nodes = nodes.filter(node => {
        // Keep audits if they're selected
        if (node.type === 'audit' && selectedAudits.has(node.id)) {
          return true;
        }
        // Keep risks if they're audited by selected audits
        if (node.type === 'risk' && auditedRiskIds.has(node.id)) {
          return true;
        }
        // Keep non-risks/non-audits (controls, etc.) if connected to filtered risks
        if (node.type !== 'risk' && node.type !== 'audit') {
          return true; // Will be filtered by link connectivity later
        }
        return false;
      });
    }

    // 4. Business unit filter (risks owned by selected units)
    if (selectedUnits.size > 0) {
      const ownedRiskIds = new Set<string>();

      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

        if (link.type === 'owned_by') {
          // businessUnit → risk
          if (selectedUnits.has(sourceId)) {
            ownedRiskIds.add(targetId);
          }
        }
      });

      nodes = nodes.filter(node => {
        if (node.type === 'businessUnit' && selectedUnits.has(node.id)) {
          return true;
        }
        if (node.type === 'risk' && ownedRiskIds.has(node.id)) {
          return true;
        }
        if (node.type !== 'risk' && node.type !== 'businessUnit') {
          return true;
        }
        return false;
      });
    }

    // 5. Standard filter (risks requiring selected standards)
    if (selectedStandards.size > 0) {
      const requiredRiskIds = new Set<string>();

      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

        if (link.type === 'requires') {
          // standard → risk
          if (selectedStandards.has(sourceId)) {
            requiredRiskIds.add(targetId);
          }
        }
      });

      nodes = nodes.filter(node => {
        if (node.type === 'standard' && selectedStandards.has(node.id)) {
          return true;
        }
        if (node.type === 'risk' && requiredRiskIds.has(node.id)) {
          return true;
        }
        if (node.type !== 'risk' && node.type !== 'standard') {
          return true;
        }
        return false;
      });
    }

    // 6. Risk type filter (category match)
    if (selectedRiskTypes.size > 0) {
      nodes = nodes.filter(node => {
        if (node.type === 'risk') {
          const category = (node as any).category || 'unknown';
          return selectedRiskTypes.has(category);
        }
        return true; // Keep non-risks
      });
    }

    // 7. Risk threshold filter (minimum likelihood and severity based on view mode)
    if (likelihoodThreshold > 0 || severityThreshold > 0) {
      nodes = nodes.filter(node => {
        if (node.type === 'risk') {
          const riskNode = node as any;

          // Apply filter based on risk view mode
          const likelihood = riskViewMode === 'residual'
            ? riskNode.residual_likelihood
            : riskNode.inherent_likelihood;
          const severity = riskViewMode === 'residual'
            ? riskNode.residual_severity
            : riskNode.inherent_severity;

          return likelihood >= likelihoodThreshold && severity >= severityThreshold;
        }
        return true; // Keep non-risks
      });
    }

    // 8. Filter links to only connect visible nodes
    const visibleNodeIds = new Set(nodes.map(n => n.id));
    links = links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    return { nodes, links };
  }, [
    rawData,
    selectedAudits,
    selectedUnits,
    selectedStandards,
    selectedRiskTypes,
    activeEntityLayers,
    likelihoodThreshold,
    severityThreshold,
    riskViewMode,
    searchQuery
  ]);

  return filteredData;
}
