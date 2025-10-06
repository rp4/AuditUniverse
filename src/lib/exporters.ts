/**
 * Export Functions
 *
 * Export graph data in various formats
 */

import type { GraphData } from '@/types';

/**
 * Export graph data as JSON
 */
export function exportJSON(data: GraphData, filename = 'audit-graph.json') {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

/**
 * Helper: Escape CSV special characters
 */
function escapeCSV(value: string): string {
  // Convert to string and escape quotes by doubling them
  const str = String(value);
  const escaped = str.replace(/"/g, '""');

  // Always quote fields containing commas, quotes, or newlines
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
    return `"${escaped}"`;
  }

  // Quote the field anyway for consistency
  return `"${escaped}"`;
}

/**
 * Export nodes as CSV
 */
export function exportCSV(data: GraphData, filename = 'audit-nodes.csv') {
  const headers = ['ID', 'Type', 'Name', 'Description'];
  const rows = data.nodes.map(node => [
    escapeCSV(node.id),
    escapeCSV(node.type),
    escapeCSV(node.name),
    escapeCSV(node.description || '')
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export as GraphML for Gephi/Cytoscape
 */
export function exportGraphML(data: GraphData, filename = 'audit-graph.graphml') {
  const nodes = data.nodes.map(node => `
    <node id="${node.id}">
      <data key="type">${node.type}</data>
      <data key="name">${escapeXML(node.name)}</data>
    </node>`).join('');

  const edges = data.links.map((link, idx) => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return `
    <edge id="e${idx}" source="${sourceId}" target="${targetId}">
      <data key="type">${link.type}</data>
    </edge>`;
  }).join('');

  const graphml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="name" for="node" attr.name="name" attr.type="string"/>
  <key id="type" for="edge" attr.name="type" attr.type="string"/>
  <graph id="G" edgedefault="directed">
    ${nodes}
    ${edges}
  </graph>
</graphml>`;

  downloadFile(graphml, filename, 'application/xml');
}

/**
 * Helper: Download file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper: Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
