/**
 * Data Validator
 *
 * Validates uploaded JSON data to ensure it meets AuditVerse requirements:
 * - Required fields present
 * - Correct data types
 * - Valid relationships (no orphan links)
 * - Reasonable value ranges
 */

import type { GraphData, Node, Link, NodeType, LinkType } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  data?: GraphData;
}

/**
 * Validate uploaded data
 *
 * @param rawData - Raw JSON data from file upload
 * @returns Validation result with errors/warnings
 */
export function validateGraphData(rawData: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check top-level structure
  if (!rawData || typeof rawData !== 'object') {
    errors.push({
      field: 'root',
      message: 'Data must be a valid JSON object',
      severity: 'error'
    });
    return { isValid: false, errors, warnings };
  }

  // Extract node arrays
  const nodes: Node[] = [];
  const nodeArrays = [
    { key: 'risks', type: 'risk' as const },
    { key: 'controls', type: 'control' as const },
    { key: 'audits', type: 'audit' as const },
    { key: 'issues', type: 'issue' as const },
    { key: 'incidents', type: 'incident' as const },
    { key: 'standards', type: 'standard' as const },
    { key: 'businessUnits', type: 'businessUnit' as const }
  ];

  for (const { key, type } of nodeArrays) {
    if (rawData[key]) {
      if (!Array.isArray(rawData[key])) {
        errors.push({
          field: key,
          message: `${key} must be an array`,
          severity: 'error'
        });
        continue;
      }

      for (const [index, node] of rawData[key].entries()) {
        const validationErrors = validateNode(node, type, `${key}[${index}]`);
        errors.push(...validationErrors.filter(e => e.severity === 'error'));
        warnings.push(...validationErrors.filter(e => e.severity === 'warning'));

        if (validationErrors.length === 0) {
          nodes.push({ ...node, type });
        }
      }
    }
  }

  // Validate we have at least some nodes
  if (nodes.length === 0) {
    errors.push({
      field: 'nodes',
      message: 'No valid nodes found. Data must contain at least one risk, control, or audit.',
      severity: 'error'
    });
    return { isValid: false, errors, warnings };
  }

  // Validate relationships
  const links: Link[] = [];
  if (rawData.relationships) {
    if (!Array.isArray(rawData.relationships)) {
      errors.push({
        field: 'relationships',
        message: 'relationships must be an array',
        severity: 'error'
      });
    } else {
      const nodeIds = new Set(nodes.map(n => n.id));

      for (const [index, link] of rawData.relationships.entries()) {
        const linkErrors = validateLink(link, nodeIds, `relationships[${index}]`);
        errors.push(...linkErrors.filter(e => e.severity === 'error'));
        warnings.push(...linkErrors.filter(e => e.severity === 'warning'));

        if (linkErrors.length === 0) {
          links.push(link);
        }
      }
    }
  }

  // Check for isolated nodes (warning only)
  const connectedNodeIds = new Set<string>();
  links.forEach(link => {
    connectedNodeIds.add(typeof link.source === 'string' ? link.source : link.source.id);
    connectedNodeIds.add(typeof link.target === 'string' ? link.target : link.target.id);
  });

  const isolatedNodes = nodes.filter(n => !connectedNodeIds.has(n.id));
  if (isolatedNodes.length > 0) {
    warnings.push({
      field: 'nodes',
      message: `${isolatedNodes.length} node(s) have no connections: ${isolatedNodes.slice(0, 3).map(n => n.name).join(', ')}${isolatedNodes.length > 3 ? '...' : ''}`,
      severity: 'warning'
    });
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    data: isValid ? { nodes, links } : undefined
  };
}

/**
 * Validate a single node
 */
function validateNode(node: any, type: NodeType, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!node.id || typeof node.id !== 'string') {
    errors.push({
      field: `${path}.id`,
      message: 'Missing or invalid id',
      severity: 'error'
    });
  }

  if (!node.name || typeof node.name !== 'string') {
    errors.push({
      field: `${path}.name`,
      message: 'Missing or invalid name',
      severity: 'error'
    });
  }

  // Type-specific validation
  if (type === 'risk') {
    validateRiskNode(node, path, errors);
  } else if (type === 'control') {
    validateControlNode(node, path, errors);
  } else if (type === 'audit') {
    validateAuditNode(node, path, errors);
  }

  return errors;
}

/**
 * Validate risk node specific fields
 */
function validateRiskNode(node: any, path: string, errors: ValidationError[]): void {
  const requiredFields = [
    'inherent_likelihood',
    'inherent_severity',
    'residual_likelihood',
    'residual_severity'
  ];

  for (const field of requiredFields) {
    if (node[field] === undefined) {
      errors.push({
        field: `${path}.${field}`,
        message: `Risk node missing required field: ${field}`,
        severity: 'error'
      });
    } else if (typeof node[field] !== 'number') {
      errors.push({
        field: `${path}.${field}`,
        message: `${field} must be a number`,
        severity: 'error'
      });
    } else if (node[field] < 1 || node[field] > 10) {
      errors.push({
        field: `${path}.${field}`,
        message: `${field} must be between 1 and 10`,
        severity: 'warning'
      });
    }
  }

  // Calculate ratings if missing
  if (!node.inherent_rating && node.inherent_likelihood && node.inherent_severity) {
    node.inherent_rating = (node.inherent_likelihood + node.inherent_severity) / 2;
  }

  if (!node.residual_rating && node.residual_likelihood && node.residual_severity) {
    node.residual_rating = (node.residual_likelihood + node.residual_severity) / 2;
  }
}

/**
 * Validate control node specific fields
 */
function validateControlNode(node: any, path: string, errors: ValidationError[]): void {
  if (node.effectiveness !== undefined) {
    if (typeof node.effectiveness !== 'number') {
      errors.push({
        field: `${path}.effectiveness`,
        message: 'effectiveness must be a number',
        severity: 'error'
      });
    } else if (node.effectiveness < 0 || node.effectiveness > 1) {
      errors.push({
        field: `${path}.effectiveness`,
        message: 'effectiveness must be between 0 and 1',
        severity: 'warning'
      });
    }
  }
}

/**
 * Validate audit node specific fields
 */
function validateAuditNode(node: any, path: string, errors: ValidationError[]): void {
  if (node.date && !isValidDate(node.date)) {
    errors.push({
      field: `${path}.date`,
      message: 'date must be a valid ISO date string',
      severity: 'warning'
    });
  }

  if (node.status && !['planned', 'in_progress', 'completed'].includes(node.status)) {
    errors.push({
      field: `${path}.status`,
      message: 'status must be one of: planned, in_progress, completed',
      severity: 'warning'
    });
  }
}

/**
 * Validate a link/relationship
 */
function validateLink(link: any, validNodeIds: Set<string>, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!link.source) {
    errors.push({
      field: `${path}.source`,
      message: 'Missing source',
      severity: 'error'
    });
  } else if (!validNodeIds.has(link.source)) {
    errors.push({
      field: `${path}.source`,
      message: `Source node '${link.source}' does not exist`,
      severity: 'error'
    });
  }

  if (!link.target) {
    errors.push({
      field: `${path}.target`,
      message: 'Missing target',
      severity: 'error'
    });
  } else if (!validNodeIds.has(link.target)) {
    errors.push({
      field: `${path}.target`,
      message: `Target node '${link.target}' does not exist`,
      severity: 'error'
    });
  }

  if (!link.type) {
    errors.push({
      field: `${path}.type`,
      message: 'Missing link type',
      severity: 'error'
    });
  } else {
    const validTypes: LinkType[] = [
      'mitigates',
      'assessed_by',
      'owned_by',
      'requires',
      'causes',
      'reports',
      'temporal'
    ];

    if (!validTypes.includes(link.type)) {
      errors.push({
        field: `${path}.type`,
        message: `Invalid link type: ${link.type}`,
        severity: 'warning'
      });
    }
  }

  return errors;
}

/**
 * Helper: Check if string is valid ISO date
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push('❌ Errors:');
    result.errors.forEach(error => {
      lines.push(`  • ${error.field}: ${error.message}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('⚠️  Warnings:');
    result.warnings.forEach(warning => {
      lines.push(`  • ${warning.field}: ${warning.message}`);
    });
  }

  return lines.join('\n');
}
