/**
 * Temporal Filtering Library
 *
 * Applies temporal events to graph data up to a specific date.
 * Processes events chronologically to show graph state at any point in time.
 */

import type { GraphData, TemporalDataset, TemporalEvent } from '@/types';
import { logger } from './logger';

/**
 * Apply all events up to the target date
 * Returns graph snapshot at that point in time
 */
export function applyEventsUpTo(dataset: TemporalDataset, targetDate: Date): GraphData {
  const nodes = [...dataset.nodes];
  const links = [...dataset.links];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // If no events, return as is
  if (!dataset.events || dataset.events.length === 0) {
    return { nodes, links };
  }

  // Filter events up to target date and sort chronologically
  const relevantEvents = dataset.events
    .filter(event => new Date(event.date) <= targetDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Process each event with error recovery
  relevantEvents.forEach(event => {
    try {
      switch (event.type) {
        case 'risk_assessment':
          handleRiskAssessment(event, nodeMap);
          break;
        case 'audit_completed':
          handleAuditCompleted(event, nodes, links);
          break;
        case 'control_added':
          handleControlAdded(event, nodes, links);
          break;
        case 'control_removed':
          handleControlRemoved(event, nodes, links);
          break;
        case 'incident_occurred':
          handleIncidentOccurred(event, nodes, links);
          break;
        case 'risk_mitigated':
          handleRiskMitigated(event, nodes);
          break;
        default:
          logger.warn('Unknown event type encountered', {
            component: 'temporalFilter',
            eventType: event.type,
            eventId: event.entityId,
          });
      }
    } catch (error) {
      logger.error('Failed to process temporal event', error as Error, {
        component: 'temporalFilter',
        eventType: event.type,
        eventId: event.entityId,
        eventDate: event.date,
      });
      // Continue processing other events
    }
  });

  return { nodes, links };
}

/**
 * Update risk likelihood/severity based on assessment
 */
function handleRiskAssessment(event: TemporalEvent, nodeMap: Map<string, any>) {
  const risk = nodeMap.get(event.entityId);
  if (risk && risk.type === 'risk' && event.changes) {
    if (event.changes.residual_likelihood !== undefined) {
      risk.residual_likelihood = event.changes.residual_likelihood;
    }
    if (event.changes.residual_severity !== undefined) {
      risk.residual_severity = event.changes.residual_severity;
    }
    if (event.changes.inherent_likelihood !== undefined) {
      risk.inherent_likelihood = event.changes.inherent_likelihood;
    }
    if (event.changes.inherent_severity !== undefined) {
      risk.inherent_severity = event.changes.inherent_severity;
    }
  }
}

/**
 * Add audit node and create assessment links
 */
function handleAuditCompleted(event: TemporalEvent, nodes: any[], links: any[]) {
  // Check if audit already exists
  if (nodes.find(n => n.id === event.entityId)) return;

  const auditNode = {
    id: event.entityId,
    type: 'audit',
    name: event.description || 'Audit',
    date: event.date,
    status: 'completed',
    description: event.description
  };

  nodes.push(auditNode);

  // Create links to assessed risks if specified
  if (event.relatedIds) {
    event.relatedIds.forEach((riskId: string) => {
      links.push({
        source: event.entityId,
        target: riskId,
        type: 'assessed_by'
      });
    });
  }
}

/**
 * Add control node and mitigation links
 */
function handleControlAdded(event: TemporalEvent, nodes: any[], links: any[]) {
  if (nodes.find(n => n.id === event.entityId)) return;

  const controlNode = {
    id: event.entityId,
    type: 'control',
    name: event.description || 'Control',
    effectiveness: event.changes?.effectiveness || 0.7,
    description: event.description
  };

  nodes.push(controlNode);

  // Create mitigation links if specified
  if (event.relatedIds) {
    event.relatedIds.forEach((riskId: string) => {
      links.push({
        source: event.entityId,
        target: riskId,
        type: 'mitigates'
      });
    });
  }
}

/**
 * Remove control node and its links
 */
function handleControlRemoved(event: TemporalEvent, nodes: any[], links: any[]) {
  const index = nodes.findIndex(n => n.id === event.entityId);
  if (index !== -1) {
    nodes.splice(index, 1);
  }

  // Remove all links involving this control
  for (let i = links.length - 1; i >= 0; i--) {
    const link = links[i];

    // Validate link structure
    if (!link || !link.source || !link.target) {
      logger.warn('Malformed link encountered during control removal', {
        component: 'temporalFilter',
        linkIndex: i,
        eventId: event.entityId,
      });
      continue;
    }

    const sourceId = typeof link.source === 'string' ? link.source : link.source?.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target?.id;

    if (!sourceId || !targetId) {
      logger.warn('Link with missing IDs', {
        component: 'temporalFilter',
        linkIndex: i,
      });
      continue;
    }

    if (sourceId === event.entityId || targetId === event.entityId) {
      links.splice(i, 1);
    }
  }
}

/**
 * Add incident node and causation link
 */
function handleIncidentOccurred(event: TemporalEvent, nodes: any[], links: any[]) {
  if (nodes.find(n => n.id === event.entityId)) return;

  const incidentNode = {
    id: event.entityId,
    type: 'incident',
    name: event.description || 'Incident',
    date: event.date,
    impact: event.changes?.impact || 5,
    description: event.description
  };

  nodes.push(incidentNode);

  // Create causation links
  if (event.relatedIds) {
    event.relatedIds.forEach((riskId: string) => {
      links.push({
        source: event.entityId,
        target: riskId,
        type: 'causes'
      });
    });
  }
}

/**
 * Remove risk (fully mitigated)
 */
function handleRiskMitigated(event: TemporalEvent, nodes: any[]) {
  const index = nodes.findIndex(n => n.id === event.entityId);
  if (index !== -1) {
    nodes.splice(index, 1);
  }
}

/**
 * Extract date range from temporal dataset
 */
export function getDateRange(dataset: TemporalDataset): { min: Date; max: Date } {
  if (!dataset.events || dataset.events.length === 0) {
    const now = new Date();
    return { min: now, max: now };
  }

  const dates = dataset.events.map(e => new Date(e.date));
  return {
    min: new Date(Math.min(...dates.map(d => d.getTime()))),
    max: new Date(Math.max(...dates.map(d => d.getTime())))
  };
}
