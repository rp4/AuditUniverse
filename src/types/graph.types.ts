/**
 * Core Graph Data Structures
 *
 * These types define the fundamental data structures for the force-directed graph.
 * All nodes and links follow these interfaces.
 */

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export type NodeType =
  | 'risk'
  | 'control'
  | 'audit'
  | 'issue'
  | 'incident'
  | 'standard'
  | 'businessUnit';

export interface BaseNode {
  id: string;
  name: string;
  type: NodeType;
  description?: string;
  owner?: string;
  last_assessment?: string;
  confidence?: number;
  // D3 force simulation properties (added at runtime)
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number;
  fy?: number;
  fz?: number;
}

export interface RiskNode extends BaseNode {
  type: 'risk';
  inherent_likelihood: number;      // 1-10
  inherent_severity: number;        // 1-10
  inherent_rating: number;          // Calculated score
  residual_likelihood: number;      // 1-10 (after controls)
  residual_severity: number;        // 1-10 (after controls)
  residual_rating: number;          // Calculated score
  category?: string;
  business_unit?: string;
}

export interface ControlNode extends BaseNode {
  type: 'control';
  effectiveness: number;  // 0-1 scale
}

export interface AuditNode extends BaseNode {
  type: 'audit';
  date: string;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface IssueNode extends BaseNode {
  type: 'issue';
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
}

export interface IncidentNode extends BaseNode {
  type: 'incident';
  date: string;
  impact: number;  // 1-10
}

export interface StandardNode extends BaseNode {
  type: 'standard';
  framework: string;  // e.g., "GDPR", "SOX", "ISO 27001"
}

export interface BusinessUnitNode extends BaseNode {
  type: 'businessUnit';
  department?: string;
}

export type Node =
  | RiskNode
  | ControlNode
  | AuditNode
  | IssueNode
  | IncidentNode
  | StandardNode
  | BusinessUnitNode;

export type LinkType =
  | 'mitigates'      // Control → Risk
  | 'assessed_by'    // Audit → Risk
  | 'owned_by'       // BusinessUnit → Risk
  | 'requires'       // Standard → Risk
  | 'causes'         // Incident → Risk
  | 'reports'        // Issue → Control
  | 'temporal';      // Time-based connection

export interface Link {
  source: string | Node;  // Node ID or node object (d3-force mutates)
  target: string | Node;
  type: LinkType;
  strength?: number;  // 0-1 scale (for force simulation)
}
