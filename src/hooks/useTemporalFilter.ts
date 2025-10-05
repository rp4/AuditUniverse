/**
 * useTemporalFilter Hook
 *
 * Applies temporal filtering based on current timeline date
 */

import { useMemo } from 'react';
import { useGraphStore } from '@/store/graphStore';
import { applyEventsUpTo } from '@/lib/temporalFilter';
import type { GraphData, TemporalDataset } from '@/types';

export function useTemporalFilter(dataset: TemporalDataset | null): GraphData {
  const currentDate = useGraphStore(state => state.currentDate);

  return useMemo(() => {
    if (!dataset) {
      return { nodes: [], links: [] };
    }

    if (!dataset.events || dataset.events.length === 0) {
      // No temporal data, return as-is
      return { nodes: dataset.nodes, links: dataset.links };
    }

    return applyEventsUpTo(dataset, currentDate);
  }, [dataset, currentDate]);
}
