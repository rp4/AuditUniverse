/**
 * Preset Views Library
 *
 * 13 predefined analytical views for common audit/risk scenarios.
 * Each preset returns filtered graph data with an explanatory message.
 */

import type { GraphData, PresetId } from '@/types';

export interface PresetViewResult {
  data: GraphData;
  message: string;
}

/**
 * Apply a preset view to graph data
 */
export function applyPresetView(presetId: PresetId, rawData: GraphData): PresetViewResult {
  switch (presetId) {
    case 'uncontrolled-risks':
      return getUncontrolledRisks(rawData);
    case 'unaudited-risks':
      return getUnauditedRisks(rawData);
    case 'unmonitored-standards':
      return getUnmonitoredStandards(rawData);
    case 'audit-blind-spots':
      return getAuditBlindSpots(rawData);
    case 'high-issue-risks':
      return getHighIssueRisks(rawData);
    case 'high-incident-risks':
      return getHighIncidentRisks(rawData);
    case 'failed-controls':
      return getFailedControls(rawData);
    case 'high-residual-risk':
      return getHighResidualRisk(rawData);
    case 'standard-violations':
      return getStandardViolations(rawData);
    case 'regulatory-exposure':
      return getRegulatoryExposure(rawData);
    case 'enterprise-risk-profile':
      return getEnterpriseRiskProfile(rawData);
    case 'audit-coverage':
      return getAuditCoverage(rawData);
    case 'default':
    default:
      return { data: rawData, message: 'Showing all entities and relationships' };
  }
}

/**
 * Uncontrolled Risks: Risks with no mitigating controls
 */
function getUncontrolledRisks(rawData: GraphData): PresetViewResult {
  const mitigatedRiskIds = new Set<string>();

  rawData.links.forEach(link => {
    if (link.type === 'mitigates') {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      mitigatedRiskIds.add(targetId);
    }
  });

  const uncontrolledRisks = rawData.nodes.filter(
    node => node.type === 'risk' && !mitigatedRiskIds.has(node.id)
  );

  const visibleNodeIds = new Set(uncontrolledRisks.map(n => n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes: uncontrolledRisks, links },
    message: `Found ${uncontrolledRisks.length} uncontrolled risks with no mitigating controls. These require immediate attention.`
  };
}

/**
 * Unaudited Risks: Risks with no audit assessment
 */
function getUnauditedRisks(rawData: GraphData): PresetViewResult {
  const auditedRiskIds = new Set<string>();

  rawData.links.forEach(link => {
    if (link.type === 'assessed_by') {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      auditedRiskIds.add(targetId);
    }
  });

  const unauditedRisks = rawData.nodes.filter(
    node => node.type === 'risk' && !auditedRiskIds.has(node.id)
  );

  const visibleNodeIds = new Set(unauditedRisks.map(n => n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes: unauditedRisks, links },
    message: `Found ${unauditedRisks.length} unaudited risks. Consider scheduling audit assessments for these areas.`
  };
}

/**
 * Unmonitored Standards: Standards with few associated risks
 */
function getUnmonitoredStandards(rawData: GraphData): PresetViewResult {
  const standardRiskCounts = new Map<string, number>();

  rawData.links.forEach(link => {
    if (link.type === 'requires') {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const source = rawData.nodes.find(n => n.id === sourceId);
      if (source?.type === 'standard') {
        standardRiskCounts.set(sourceId, (standardRiskCounts.get(sourceId) || 0) + 1);
      }
    }
  });

  // Standards with 0 or 1 risks
  const unmonitoredStandards = rawData.nodes.filter(
    node => node.type === 'standard' && (standardRiskCounts.get(node.id) || 0) <= 1
  );

  const visibleNodeIds = new Set(unmonitoredStandards.map(n => n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes: unmonitoredStandards, links },
    message: `Found ${unmonitoredStandards.length} standards without monitoring controls. Compliance gaps detected.`
  };
}

/**
 * Audit Blind Spots: Business units whose risks have low audit coverage
 */
function getAuditBlindSpots(rawData: GraphData): PresetViewResult {
  // Find business units and their risks
  const unitRiskMap = new Map<string, Set<string>>();
  const auditedRiskIds = new Set<string>();

  rawData.links.forEach(link => {
    if (link.type === 'owned_by') {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      if (!unitRiskMap.has(sourceId)) {
        unitRiskMap.set(sourceId, new Set());
      }
      unitRiskMap.get(sourceId)!.add(targetId);
    }
    if (link.type === 'assessed_by') {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      auditedRiskIds.add(targetId);
    }
  });

  // Find units with < 50% audit coverage
  const blindSpotUnits = rawData.nodes.filter(node => {
    if (node.type !== 'businessUnit') return false;
    const ownedRisks = unitRiskMap.get(node.id);
    if (!ownedRisks || ownedRisks.size === 0) return false;

    const auditedCount = Array.from(ownedRisks).filter(riskId => auditedRiskIds.has(riskId)).length;
    const coverage = auditedCount / ownedRisks.size;
    return coverage < 0.5;
  });

  // Also include risks owned by these units
  const blindSpotUnitIds = new Set(blindSpotUnits.map(n => n.id));
  const ownedRiskIds = new Set<string>();

  rawData.links.forEach(link => {
    if (link.type === 'owned_by') {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      if (blindSpotUnitIds.has(sourceId)) {
        ownedRiskIds.add(targetId);
      }
    }
  });

  const risks = rawData.nodes.filter(n => ownedRiskIds.has(n.id));
  const nodes = [...blindSpotUnits, ...risks];
  const visibleNodeIds = new Set(nodes.map(n => n.id));

  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes, links },
    message: `Found ${blindSpotUnits.length} business units with no audit coverage, managing ${risks.length} risks.`
  };
}

/**
 * High Issue Risks: Risks with most reported issues
 */
function getHighIssueRisks(rawData: GraphData): PresetViewResult {
  const riskIssueCounts = new Map<string, number>();

  rawData.links.forEach(link => {
    if (link.type === 'reports') {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      const target = rawData.nodes.find(n => n.id === targetId);
      if (target?.type === 'risk') {
        riskIssueCounts.set(targetId, (riskIssueCounts.get(targetId) || 0) + 1);
      }
    }
  });

  const highIssueRisks = Array.from(riskIssueCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([riskId]) => rawData.nodes.find(n => n.id === riskId)!)
    .filter(Boolean);

  const visibleNodeIds = new Set(highIssueRisks.map(n => n.id));

  // Add issues
  rawData.links.forEach(link => {
    if (link.type === 'reports') {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      if (visibleNodeIds.has(targetId)) {
        visibleNodeIds.add(sourceId);
      }
    }
  });

  const nodes = rawData.nodes.filter(n => visibleNodeIds.has(n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes, links },
    message: `Top ${highIssueRisks.length} risks by reported issues. Focus on root cause analysis.`
  };
}

/**
 * High Incident Risks: Risks with incident history
 */
function getHighIncidentRisks(rawData: GraphData): PresetViewResult {
  const incidentRiskIds = new Set<string>();

  rawData.links.forEach(link => {
    if (link.type === 'causes') {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      incidentRiskIds.add(targetId);
    }
  });

  const risks = rawData.nodes.filter(n => incidentRiskIds.has(n.id));
  const visibleNodeIds = new Set(risks.map(n => n.id));

  // Add incidents
  rawData.links.forEach(link => {
    if (link.type === 'causes') {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      visibleNodeIds.add(sourceId);
    }
  });

  const nodes = rawData.nodes.filter(n => visibleNodeIds.has(n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes, links },
    message: `Found ${risks.length} risks with incident history. Review control effectiveness.`
  };
}

/**
 * Failed Controls: Controls with low effectiveness
 */
function getFailedControls(rawData: GraphData): PresetViewResult {
  const failedControls = rawData.nodes.filter(
    node => node.type === 'control' && (node as any).effectiveness < 0.5
  );

  const visibleNodeIds = new Set(failedControls.map(n => n.id));

  // Add risks mitigated by failed controls
  rawData.links.forEach(link => {
    if (link.type === 'mitigates') {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      if (visibleNodeIds.has(sourceId)) {
        visibleNodeIds.add(targetId);
      }
    }
  });

  const nodes = rawData.nodes.filter(n => visibleNodeIds.has(n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes, links },
    message: `Found ${failedControls.length} controls with effectiveness < 50%. Control remediation needed.`
  };
}

/**
 * High Residual Risk: Risks with rating > 49 (7x7+)
 */
function getHighResidualRisk(rawData: GraphData): PresetViewResult {
  const highRisks = rawData.nodes.filter(node => {
    if (node.type !== 'risk') return false;
    const rating = (node as any).residual_likelihood * (node as any).residual_severity;
    return rating > 49;
  });

  const visibleNodeIds = new Set(highRisks.map(n => n.id));

  // Add connected controls and audits
  rawData.links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

    if (link.type === 'mitigates' && visibleNodeIds.has(targetId)) {
      visibleNodeIds.add(sourceId);
    }
    if (link.type === 'assessed_by' && visibleNodeIds.has(targetId)) {
      visibleNodeIds.add(sourceId);
    }
  });

  const nodes = rawData.nodes.filter(n => visibleNodeIds.has(n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes, links },
    message: `Found ${highRisks.length} high residual risks (rating > 49). Executive attention required.`
  };
}

/**
 * Standard Violations: Standards with many non-compliant risks
 */
function getStandardViolations(rawData: GraphData): PresetViewResult {
  const standardRiskCounts = new Map<string, number>();

  rawData.links.forEach(link => {
    if (link.type === 'requires') {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      standardRiskCounts.set(sourceId, (standardRiskCounts.get(sourceId) || 0) + 1);
    }
  });

  const topStandards = Array.from(standardRiskCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([standardId]) => rawData.nodes.find(n => n.id === standardId)!)
    .filter(Boolean);

  const visibleNodeIds = new Set(topStandards.map(n => n.id));

  // Add required risks
  rawData.links.forEach(link => {
    if (link.type === 'requires') {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      if (visibleNodeIds.has(sourceId)) {
        visibleNodeIds.add(targetId);
      }
    }
  });

  const nodes = rawData.nodes.filter(n => visibleNodeIds.has(n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes, links },
    message: `Top ${topStandards.length} standards by risk exposure. Compliance focus areas.`
  };
}

/**
 * Regulatory Exposure: High-severity risks in compliance/regulatory categories
 */
function getRegulatoryExposure(rawData: GraphData): PresetViewResult {
  const regulatoryCategories = ['compliance', 'regulatory', 'legal'];

  const regulatoryRisks = rawData.nodes.filter(node => {
    if (node.type !== 'risk') return false;
    const category = ((node as any).category || '').toLowerCase();
    const severity = (node as any).residual_severity || 0;
    return regulatoryCategories.some(cat => category.includes(cat)) && severity >= 7;
  });

  const visibleNodeIds = new Set(regulatoryRisks.map(n => n.id));

  // Add standards and controls
  rawData.links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

    if ((link.type === 'requires' || link.type === 'mitigates') && visibleNodeIds.has(targetId)) {
      visibleNodeIds.add(sourceId);
    }
  });

  const nodes = rawData.nodes.filter(n => visibleNodeIds.has(n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes, links },
    message: `Found ${regulatoryRisks.length} high-severity regulatory risks. Prioritize compliance activities.`
  };
}

/**
 * Enterprise Risk Profile: Top 20 risks by residual rating
 */
function getEnterpriseRiskProfile(rawData: GraphData): PresetViewResult {
  const risks = rawData.nodes
    .filter(n => n.type === 'risk')
    .map(n => ({
      node: n,
      rating: (n as any).residual_likelihood * (n as any).residual_severity
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20)
    .map(r => r.node);

  const visibleNodeIds = new Set(risks.map(n => n.id));

  // Add all connected entities
  rawData.links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

    if (visibleNodeIds.has(sourceId) || visibleNodeIds.has(targetId)) {
      visibleNodeIds.add(sourceId);
      visibleNodeIds.add(targetId);
    }
  });

  const nodes = rawData.nodes.filter(n => visibleNodeIds.has(n.id));
  const links = rawData.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  return {
    data: { nodes, links },
    message: `Top 20 enterprise risks with their controls and audit coverage. Executive dashboard view.`
  };
}

/**
 * Audit Coverage: All entities with coverage metrics
 */
function getAuditCoverage(rawData: GraphData): PresetViewResult {
  const totalRisks = rawData.nodes.filter(n => n.type === 'risk').length;
  const auditedRiskIds = new Set<string>();

  rawData.links.forEach(link => {
    if (link.type === 'assessed_by') {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      auditedRiskIds.add(targetId);
    }
  });

  const coverage = totalRisks > 0 ? ((auditedRiskIds.size / totalRisks) * 100).toFixed(1) : '0';

  return {
    data: rawData,
    message: `Audit universe: ${totalRisks} total risks, ${auditedRiskIds.size} audited. Coverage: ${coverage}%`
  };
}
