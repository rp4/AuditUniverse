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
import { logger } from '@/lib/logger';
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
      const connectedNodeIds = new Set<string>();

      // Add selected audits
      selectedAudits.forEach(id => connectedNodeIds.add(id));

      // Find all nodes directly connected to selected audits
      links.forEach(link => {
        // Validate link structure
        if (!link || !link.source || !link.target) {
          logger.warn('Malformed link in audit filter', {
            component: 'useFilters',
            link,
          });
          return;
        }

        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any)?.id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any)?.id;

        if (!sourceId || !targetId) {
          logger.warn('Link with missing IDs in audit filter', {
            component: 'useFilters',
          });
          return;
        }

        // If source is a selected audit, add target
        if (selectedAudits.has(sourceId)) {
          connectedNodeIds.add(targetId);
        }
        // If target is a selected audit, add source
        if (selectedAudits.has(targetId)) {
          connectedNodeIds.add(sourceId);
        }
      });

      nodes = nodes.filter(node => connectedNodeIds.has(node.id));
    }

    // 4. Business unit filter (risks owned by selected units)
    if (selectedUnits.size > 0) {
      const connectedNodeIds = new Set<string>();

      // Add selected units
      selectedUnits.forEach(id => connectedNodeIds.add(id));

      // Find all nodes directly connected to selected units
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

        // If source is a selected unit, add target
        if (selectedUnits.has(sourceId)) {
          connectedNodeIds.add(targetId);
        }
        // If target is a selected unit, add source
        if (selectedUnits.has(targetId)) {
          connectedNodeIds.add(sourceId);
        }
      });

      nodes = nodes.filter(node => connectedNodeIds.has(node.id));
    }

    // 5. Standard filter (risks requiring selected standards)
    if (selectedStandards.size > 0) {
      const connectedNodeIds = new Set<string>();

      // Add selected standards
      selectedStandards.forEach(id => connectedNodeIds.add(id));

      // Find all nodes directly connected to selected standards
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

        // If source is a selected standard, add target
        if (selectedStandards.has(sourceId)) {
          connectedNodeIds.add(targetId);
        }
        // If target is a selected standard, add source
        if (selectedStandards.has(targetId)) {
          connectedNodeIds.add(sourceId);
        }
      });

      nodes = nodes.filter(node => connectedNodeIds.has(node.id));
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
      if (!link || !link.source || !link.target) {
        return false;
      }

      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any)?.id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any)?.id;

      if (!sourceId || !targetId) {
        return false;
      }

      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    // 9. Remove orphaned nodes only if filters are active
    // (Don't remove orphaned nodes if no filters are applied, as preset views may return nodes without links)
    const anyFilterActive = selectedAudits.size > 0 || selectedUnits.size > 0 || selectedStandards.size > 0;
    if (anyFilterActive) {
      const connectedNodeIds = new Set<string>();
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any)?.id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any)?.id;
        if (sourceId) connectedNodeIds.add(sourceId);
        if (targetId) connectedNodeIds.add(targetId);
      });
      nodes = nodes.filter(node => connectedNodeIds.has(node.id));
    }

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
