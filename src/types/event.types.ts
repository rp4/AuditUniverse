/**
 * Event Types for Temporal Filtering
 *
 * Events represent changes to the risk landscape over time.
 * They are applied chronologically to create snapshots at specific dates.
 */

import type { GraphData } from './graph.types';

export type EventType =
  | 'risk_assessment'
  | 'audit_completed'
  | 'control_added'
  | 'control_removed'
  | 'incident_occurred'
  | 'issue_raised'
  | 'issue_resolved'
  | 'risk_mitigated';

export interface BaseEvent {
  date: string;  // ISO date string
  type: EventType;
}

export interface RiskAssessmentEvent extends BaseEvent {
  type: 'risk_assessment';
  risk_id: string;
  new_likelihood?: number;
  new_severity?: number;
}

export interface AuditCompletedEvent extends BaseEvent {
  type: 'audit_completed';
  audit_id: string;
  assessed_risks: string[];  // Risk IDs
  findings?: string[];
}

export interface ControlEvent extends BaseEvent {
  type: 'control_added' | 'control_removed';
  control_id: string;
  affects_risks: string[];
}

export interface IncidentEvent extends BaseEvent {
  type: 'incident_occurred';
  incident_id: string;
  related_risk: string;
}

export interface IssueEvent extends BaseEvent {
  type: 'issue_raised' | 'issue_resolved';
  issue_id: string;
  related_control: string;
}

export interface RiskMitigatedEvent extends BaseEvent {
  type: 'risk_mitigated';
  risk_id: string;
}

export type Event =
  | RiskAssessmentEvent
  | AuditCompletedEvent
  | ControlEvent
  | IncidentEvent
  | IssueEvent
  | RiskMitigatedEvent;

export interface TemporalEvent {
  date: string;
  type: EventType;
  entityId: string;
  description?: string;
  relatedIds?: string[];
  changes?: Record<string, any>;
}

export interface TemporalDataset extends GraphData {
  events?: TemporalEvent[];
}
