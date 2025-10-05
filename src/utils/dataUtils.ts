/**
 * Data Utilities
 *
 * Helper functions for data transformation and processing
 */

import type { GraphData, TemporalEvent, TemporalDataset } from '@/types';

/**
 * Transform raw JSON data to GraphData format
 * Handles the conversion from the upload format to the internal format
 */
export function transformRawData(rawData: any): GraphData {
  const nodes = [];
  const links = rawData.relationships || [];

  // Collect all node arrays
  const nodeArrays = [
    'risks',
    'controls',
    'audits',
    'issues',
    'incidents',
    'standards',
    'businessUnits'
  ];

  for (const arrayKey of nodeArrays) {
    if (rawData[arrayKey] && Array.isArray(rawData[arrayKey])) {
      nodes.push(...rawData[arrayKey]);
    }
  }

  return { nodes, links };
}

/**
 * Extract temporal dataset from raw data
 */
export function extractTemporalDataset(rawData: any): TemporalDataset {
  const graphData = transformRawData(rawData);
  const events: TemporalEvent[] = rawData.events || [];

  return {
    nodes: graphData.nodes,
    links: graphData.links,
    events: events
  };
}

/**
 * Load sample data from public folder
 */
export async function loadSampleData(): Promise<any> {
  const response = await fetch('/sample-data.json');
  if (!response.ok) {
    throw new Error('Failed to load sample data');
  }
  return response.json();
}

/**
 * Parse uploaded file as JSON
 */
export function parseJSONFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Calculate statistics from graph data
 */
export function calculateStats(data: GraphData) {
  const stats = {
    totalNodes: data.nodes.length,
    totalLinks: data.links.length,
    nodesByType: {} as Record<string, number>,
    linksByType: {} as Record<string, number>,
    riskMetrics: {
      totalRisks: 0,
      highResidualRisks: 0,
      uncontrolledRisks: 0,
      unauditedRisks: 0,
      averageResidualRating: 0
    }
  };

  // Count nodes by type
  data.nodes.forEach(node => {
    stats.nodesByType[node.type] = (stats.nodesByType[node.type] || 0) + 1;
  });

  // Count links by type
  data.links.forEach(link => {
    stats.linksByType[link.type] = (stats.linksByType[link.type] || 0) + 1;
  });

  // Calculate risk metrics
  const risks = data.nodes.filter(n => n.type === 'risk');
  stats.riskMetrics.totalRisks = risks.length;

  if (risks.length > 0) {
    let totalRating = 0;
    const controlledRiskIds = new Set(
      data.links
        .filter(l => l.type === 'mitigates')
        .map(l => typeof l.target === 'string' ? l.target : l.target.id)
    );

    const auditedRiskIds = new Set(
      data.links
        .filter(l => l.type === 'assessed_by')
        .map(l => typeof l.target === 'string' ? l.target : l.target.id)
    );

    risks.forEach((risk: any) => {
      totalRating += risk.residual_rating || 0;

      if (risk.residual_rating > 7) {
        stats.riskMetrics.highResidualRisks++;
      }

      if (!controlledRiskIds.has(risk.id)) {
        stats.riskMetrics.uncontrolledRisks++;
      }

      if (!auditedRiskIds.has(risk.id)) {
        stats.riskMetrics.unauditedRisks++;
      }
    });

    stats.riskMetrics.averageResidualRating = totalRating / risks.length;
  }

  return stats;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
