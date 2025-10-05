# AuditVerse Rebuild Specification for AI Agents

> **Audience:** Claude Code, AI development agents, and autonomous coding systems
>
> **Purpose:** Complete technical specification to rebuild AuditVerse from scratch using Three.js with visual encoding
>
> **Context:** This document contains ALL necessary information to understand and build the application. No prior knowledge of the existing codebase is required.

---

## Table of Contents

1. [Project Context](#project-context)
2. [Core Concept](#core-concept)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Visual Encoding System](#visual-encoding-system)
6. [Implementation Checklist](#implementation-checklist)
7. [Complete Component Specifications](#complete-component-specifications)
8. [Data Structures](#data-structures)
9. [Business Logic](#business-logic)
10. [Testing Requirements](#testing-requirements)
11. [Performance Targets](#performance-targets)
12. [Implementation Notes](#implementation-notes)

---

## Project Context

### What is AuditVerse?

AuditVerse is a web application that visualizes enterprise risk and audit data as an interactive 3D force-directed graph. It helps auditors, risk managers, and executives understand:

- **Which risks exist** in the organization
- **How risks are controlled** (mitigation strategies)
- **What has been audited** (coverage analysis)
- **Relationships between entities** (risks, controls, audits, business units, standards)
- **How risk landscape changes over time** (temporal analysis)

### Key Use Cases

1. **Risk Coverage Analysis:** Identify risks without controls or audits
2. **Audit Planning:** Find high-residual-risk areas needing assessment
3. **Compliance Monitoring:** Track standard compliance across business units
4. **Relationship Discovery:** Reveal patterns (e.g., single control protecting many risks)
5. **Temporal Trends:** Watch how risks evolve over months/years

### Domain Concepts

**Risk:** A potential negative event that could impact the organization
- Has **inherent** ratings (before controls) and **residual** ratings (after controls)
- Measured on two dimensions: **Likelihood** (1-10) and **Severity** (1-10)

**Control:** A process/system that mitigates risk
- Has **effectiveness** rating (0-1 scale)

**Audit:** An assessment activity that evaluates risks/controls
- Has **date** and **findings**

**Business Unit:** Department/division that owns risks

**Standard:** Regulatory/compliance requirement (e.g., GDPR, SOX, ISO 27001)

**Issue:** Control weakness discovered during audit

**Incident:** Actual risk event that occurred (realized risk)

**Relationships:**
- Control **mitigates** Risk
- Audit **assesses** Risk/Control
- Risk is **owned by** Business Unit
- Risk **requires** Standard (compliance)
- Incident **causes** Risk reassessment
- Issue **reports** Control weakness

---

## Core Concept

### The Paradigm Shift

**Traditional Approach (OLD - do NOT implement):**
- Position nodes at (x, y) coordinates where x = likelihood, y = severity
- Creates a 2D "risk matrix" grid
- Problem: Fights force simulation, no clustering insights

**New Approach (IMPLEMENT THIS):**
- Encode risk metrics in **visual properties** (color, size, opacity, shape)
- Let **force simulation** position nodes based on relationships
- Result: Natural clustering reveals hidden patterns

### Visual Encoding Mapping

| Data Property | Visual Property | Mapping |
|--------------|-----------------|---------|
| Risk Likelihood | Node Color | Blue (low) → Cyan → Yellow → Red (high) |
| Risk Severity | Node Size | Small (3px) → Medium (8px) → Large (13px) |
| Data Confidence/Age | Node Opacity | Opaque (1.0) → Faded (0.3) |
| Entity Type | Node Shape | Sphere, Cube, Cone, Diamond, Torus, etc. |
| Relationship Type | Link Color | Cyan (mitigates), Orange (assesses), etc. |
| Relationship Strength | Link Width | Thin (1px) → Thick (4px) |

### Why This Works

**Force-directed layout reveals:**
- Risks cluster around shared audits
- Controls act as hubs connecting multiple risks
- Isolated nodes = gaps in coverage
- Communities = related risk domains

**Visual encoding allows:**
- Multiple metrics visible simultaneously (4+ dimensions)
- Intuitive understanding (big red = high risk)
- Rich data density without clutter

---

## Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-force-graph-3d": "^1.24.0",
    "three": "^0.160.0",
    "d3-force-3d": "^3.0.0",
    "d3-scale": "^4.0.2",
    "d3-scale-chromatic": "^3.0.0",
    "zustand": "^4.5.0",
    "date-fns": "^3.0.0",
    "file-saver": "^2.0.5",
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/three": "^0.160.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### Why These Technologies?

**react-force-graph-3d:**
- Wrapper around Three.js for force-directed graphs
- Handles WebGL rendering, camera controls, force simulation
- Optimized for 10,000+ nodes
- Provides high-level API while allowing Three.js access

**Zustand:**
- Lightweight state management (1KB)
- Better TypeScript support than Context API
- Less boilerplate than Redux
- Can be used outside React components

**Tailwind CSS:**
- Utility-first CSS framework
- Rapid UI development
- Consistent design system
- Purges unused styles (small bundle)

**Vite:**
- Fast dev server (10x faster than Webpack)
- Native ESM support
- Built-in TypeScript
- Simple configuration

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                  React Application                       │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │              App.tsx (Root)                        │ │
│  │  • Layout grid                                     │ │
│  │  • Zustand providers                               │ │
│  └──┬───────────────────────┬────────────────────┬───┘ │
│     │                       │                    │     │
│  ┌──▼──────┐         ┌──────▼──────┐      ┌─────▼────┐│
│  │ Header  │         │   Graph      │      │ Details  ││
│  │         │         │  Container   │      │  Panel   ││
│  │ Filters │         │              │      │          ││
│  │ Stats   │         │              │      │ Metrics  ││
│  └─────────┘         │              │      │ Links    ││
│                      │              │      └──────────┘│
│  ┌─────────┐         │              │                  │
│  │ Sidebar │         │ ForceGraph3D │                  │
│  │         │         │  (Three.js)  │                  │
│  │ Entity  │         │              │                  │
│  │ Toggles │         └──────────────┘                  │
│  │ Sliders │                │                          │
│  └─────────┘         ┌──────▼──────┐                  │
│                      │  D3 Force   │                   │
│  ┌─────────┐         │ Simulation  │                   │
│  │Timeline │         └─────────────┘                   │
│  │         │                                            │
│  │ Controls│                                            │
│  └─────────┘                                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
                         │
              ┌──────────▼───────────┐
              │   Zustand Store      │
              │  ─────────────────   │
              │  • graphData         │
              │  • selectedNode      │
              │  • filters           │
              │  • currentDate       │
              │  • isPlaying         │
              └──────────────────────┘
```

### Directory Structure

**IMPORTANT:** Create this exact structure

```
src/
├── components/
│   ├── graph/
│   │   ├── ForceGraph3D.tsx          # Main 3D graph component
│   │   ├── GraphLegend.tsx           # Visual encoding legend
│   │   ├── GraphTooltip.tsx          # Hover tooltip
│   │   └── CameraControls.tsx        # Camera position UI
│   ├── filters/
│   │   ├── PresetFilter.tsx          # Preset views dropdown
│   │   ├── MultiSelectFilter.tsx     # Reusable multi-select component
│   │   ├── AuditsFilter.tsx          # Audits filter instance
│   │   ├── UnitsFilter.tsx           # Business units filter
│   │   ├── StandardsFilter.tsx       # Standards filter
│   │   └── RiskTypeFilter.tsx        # Risk type filter
│   ├── panels/
│   │   ├── Header.tsx                # Top header with filters & stats
│   │   ├── Sidebar.tsx               # Left sidebar with entity toggles
│   │   ├── DetailsPanel.tsx          # Right panel with node details
│   │   └── StatsCards.tsx            # Statistics display
│   ├── timeline/
│   │   ├── TimelineControls.tsx      # Main timeline component
│   │   ├── PlaybackControls.tsx      # Play/pause/reset buttons
│   │   ├── TimelineSlider.tsx        # Date scrubber
│   │   └── SpeedControl.tsx          # Speed selector
│   ├── upload/
│   │   ├── WelcomeScreen.tsx         # Initial file upload screen
│   │   ├── DragDropZone.tsx          # Drag & drop area
│   │   └── SampleDataLoader.tsx      # Load sample data button
│   └── shared/
│       ├── Button.tsx                # Reusable button
│       ├── Dropdown.tsx              # Reusable dropdown
│       └── Slider.tsx                # Reusable slider
├── hooks/
│   ├── useGraphData.ts               # Transform data for graph
│   ├── useTemporalFilter.ts          # Apply time-based filtering
│   ├── usePresetViews.ts             # Preset view logic
│   ├── useNodeSelection.ts           # Selection state management
│   ├── useFilters.ts                 # Combine all filters
│   └── useExport.ts                  # Export functionality
├── store/
│   ├── graphStore.ts                 # Main Zustand store
│   ├── slices/
│   │   ├── filterSlice.ts            # Filter state
│   │   ├── timelineSlice.ts          # Timeline state
│   │   └── selectionSlice.ts         # Selection state
├── lib/
│   ├── visualEncoding.ts             # Color/size/opacity functions
│   ├── nodeShapes.ts                 # Three.js shape creators
│   ├── temporalFilter.ts             # Temporal filtering logic
│   ├── presetViews.ts                # Preset view algorithms
│   ├── dataValidator.ts              # Input validation
│   └── exporters.ts                  # JSON/CSV/PNG export
├── types/
│   ├── graph.types.ts                # Graph data types
│   ├── entity.types.ts               # Risk/audit types
│   ├── filter.types.ts               # Filter types
│   └── index.ts                      # Barrel exports
├── styles/
│   ├── globals.css                   # Global styles
│   └── theme.css                     # Design tokens
├── utils/
│   ├── dateUtils.ts                  # Date helpers
│   ├── colorUtils.ts                 # Color interpolation
│   └── mathUtils.ts                  # Math helpers
├── App.tsx                           # Root component
├── main.tsx                          # Entry point
└── vite-env.d.ts                     # Vite types
```

---

## Visual Encoding System

### Color Encoding (Likelihood)

```typescript
// src/lib/visualEncoding.ts

import { scaleSequential } from 'd3-scale';
import { interpolateRdYlBu } from 'd3-scale-chromatic';

/**
 * Maps risk likelihood (1-10) to color (blue → red)
 *
 * @param likelihood - Risk likelihood value (1 = very low, 10 = very high)
 * @returns Hex color string
 *
 * Examples:
 *   getLikelihoodColor(1)  → '#0044ff' (deep blue)
 *   getLikelihoodColor(5)  → '#ffcc00' (yellow)
 *   getLikelihoodColor(10) → '#ff0044' (red)
 */
export function getLikelihoodColor(likelihood: number): string {
  // Reverse the interpolation (RdYlBu goes red→yellow→blue, we want blue→yellow→red)
  const scale = scaleSequential()
    .domain([10, 1])  // Reversed: high values = red
    .interpolator(interpolateRdYlBu);

  return scale(likelihood);
}

// Discrete color mapping (alternative approach)
export const LIKELIHOOD_COLORS = {
  1: '#0044ff',   // Deep Blue - Very Low
  2: '#0088ff',   // Blue
  3: '#00aaff',   // Light Blue
  4: '#00ccff',   // Cyan - Low
  5: '#00ffaa',   // Teal
  6: '#88ff00',   // Yellow-Green
  7: '#ffcc00',   // Yellow - Medium
  8: '#ff8800',   // Orange
  9: '#ff4400',   // Red-Orange
  10: '#ff0044'   // Red - Very High
} as const;
```

### Size Encoding (Severity)

```typescript
/**
 * Maps risk severity (1-10) to node radius
 * Uses exponential scaling for visual impact
 *
 * @param severity - Risk severity value (1 = minor, 10 = catastrophic)
 * @returns Node radius in pixels
 *
 * Examples:
 *   getSeveritySize(1)  → ~3px  (tiny)
 *   getSeveritySize(5)  → ~8px  (medium)
 *   getSeveritySize(10) → ~13px (large)
 */
export function getSeveritySize(severity: number): number {
  const baseSize = 3;
  const scaleFactor = 1.3;

  // Exponential scaling: size = base * (severity/10)^scaleFactor * 10
  return baseSize * Math.pow(severity / 10, scaleFactor) * 10;
}
```

### Opacity Encoding (Confidence/Age)

```typescript
/**
 * Maps data confidence or age to node opacity
 *
 * @param node - Node with confidence or last_assessment date
 * @returns Opacity value (0.3 to 1.0)
 *
 * Option 1: By confidence score (if available)
 * Option 2: By age of last assessment (fade over time)
 */
export function getConfidenceOpacity(node: Node): number {
  // Option 1: Direct confidence score
  if (node.confidence !== undefined) {
    return Math.max(0.3, Math.min(1.0, node.confidence));
  }

  // Option 2: Age-based opacity
  if (node.last_assessment) {
    const daysSince = getDaysSince(node.last_assessment);
    const ageInYears = daysSince / 365;

    // Fade over 2 years: year 0 = 1.0 opacity, year 2 = 0.3 opacity
    return Math.max(0.3, 1 - (ageInYears / 2) * 0.7);
  }

  return 1.0; // Default: fully opaque
}

function getDaysSince(date: string | Date): number {
  const past = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
}
```

### Shape Encoding (Entity Types)

```typescript
// src/lib/nodeShapes.ts

import * as THREE from 'three';
import { getLikelihoodColor, getSeveritySize, getConfidenceOpacity } from './visualEncoding';

/**
 * Creates a Three.js 3D object for a node based on its type
 * Each entity type has a distinct shape
 *
 * @param node - Node data with type, likelihood, severity, etc.
 * @returns Three.js Object3D (mesh)
 */
export function createNodeShape(node: Node): THREE.Object3D {
  const size = node.type === 'risk'
    ? getSeveritySize(node.severity)
    : 8; // Default size for non-risk entities

  const color = node.type === 'risk'
    ? getLikelihoodColor(node.likelihood)
    : ENTITY_COLORS[node.type];

  const opacity = getConfidenceOpacity(node);

  let geometry: THREE.BufferGeometry;

  switch (node.type) {
    case 'risk':
      // Sphere - smooth, represents potential (not yet realized)
      geometry = new THREE.SphereGeometry(size, 32, 32);
      break;

    case 'control':
      // Cube - solid, structured, represents protective barrier
      geometry = new THREE.BoxGeometry(size, size, size);
      break;

    case 'audit':
      // Octahedron (diamond) - represents inspection/review
      geometry = new THREE.OctahedronGeometry(size);
      break;

    case 'issue':
      // Cone (warning triangle in 3D) - represents problem/finding
      geometry = new THREE.ConeGeometry(size, size * 2, 4);
      break;

    case 'incident':
      // Dodecahedron (spiky) - represents actual negative event
      geometry = new THREE.DodecahedronGeometry(size);
      break;

    case 'standard':
      // Torus (ring) - represents compliance boundary
      geometry = new THREE.TorusGeometry(size, size * 0.3, 16, 32);
      break;

    case 'businessUnit':
      // Icosahedron - represents organizational unit
      geometry = new THREE.IcosahedronGeometry(size);
      break;

    default:
      geometry = new THREE.SphereGeometry(size);
  }

  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.2,  // Subtle glow
    transparent: opacity < 1.0,
    opacity: opacity,
    shininess: 100
  });

  return new THREE.Mesh(geometry, material);
}

// Entity type color constants
export const ENTITY_COLORS = {
  risk: '#ff0044',         // Red
  control: '#00ccff',      // Cyan
  audit: '#ff6600',        // Orange
  issue: '#ffff00',        // Yellow
  incident: '#ff0099',     // Pink
  standard: '#9966ff',     // Purple
  businessUnit: '#00ff99'  // Green
} as const;
```

### Link Visual Encoding

```typescript
// Link colors by relationship type
export const LINK_COLORS = {
  mitigates: '#00ccff',       // Control → Risk (cyan)
  assessed_by: '#ff6600',     // Audit → Risk (orange)
  owned_by: '#00ff99',        // Business Unit → Risk (green)
  requires: '#9966ff',        // Standard → Risk (purple)
  causes: '#ff0099',          // Incident → Risk (pink)
  reports: '#ffff00',         // Issue → Control (yellow)
  temporal: '#333333'         // Time-based connection (gray)
} as const;

/**
 * Get link color based on relationship type and selection state
 */
export function getLinkColor(
  link: Link,
  selectedNode: Node | null
): string {
  // Highlight connected links when node selected
  if (selectedNode) {
    const isConnected =
      link.source.id === selectedNode.id ||
      link.target.id === selectedNode.id;

    return isConnected ? '#00ffcc' : '#111111';
  }

  return LINK_COLORS[link.type] || '#666666';
}

/**
 * Get link width based on strength and selection
 */
export function getLinkWidth(
  link: Link,
  selectedNode: Node | null
): number {
  if (selectedNode) {
    const isConnected =
      link.source.id === selectedNode.id ||
      link.target.id === selectedNode.id;

    return isConnected ? 4 : 0.3;
  }

  return (link.strength || 0.5) * 2;
}

/**
 * Get link opacity based on selection
 */
export function getLinkOpacity(
  link: Link,
  selectedNode: Node | null
): number {
  if (selectedNode) {
    const isConnected =
      link.source.id === selectedNode.id ||
      link.target.id === selectedNode.id;

    return isConnected ? 0.9 : 0.05;
  }

  return 0.5;
}
```

---

## Implementation Checklist

Use this as your implementation roadmap. Each item should be implemented in order.

### Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install all dependencies from package.json
- [ ] Configure Tailwind CSS
- [ ] Create directory structure exactly as specified
- [ ] Set up TypeScript paths in tsconfig.json
- [ ] Create base type definitions in types/
- [ ] Verify project builds without errors

### Phase 2: Visual Encoding Library
- [ ] Implement `src/lib/visualEncoding.ts`
  - [ ] `getLikelihoodColor(likelihood: number): string`
  - [ ] `getSeveritySize(severity: number): number`
  - [ ] `getConfidenceOpacity(node: Node): number`
- [ ] Implement `src/lib/nodeShapes.ts`
  - [ ] `createNodeShape(node: Node): THREE.Object3D`
  - [ ] Export `ENTITY_COLORS` constant
  - [ ] Export `LINK_COLORS` constant
- [ ] Write unit tests for visual encoding functions
- [ ] Verify color gradient blue → yellow → red

### Phase 3: State Management
- [ ] Create Zustand store structure `src/store/graphStore.ts`
- [ ] Implement slices:
  - [ ] Filter slice (selectedAudits, selectedUnits, etc.)
  - [ ] Timeline slice (currentDate, isPlaying, speed)
  - [ ] Selection slice (selectedNode, hoveredNode)
- [ ] Create typed selectors and actions
- [ ] Test state updates in isolation

### Phase 4: Data Loading & Validation
- [ ] Implement `src/lib/dataValidator.ts`
  - [ ] JSON schema validation
  - [ ] Required field checks
  - [ ] Relationship validation (no orphan links)
  - [ ] Return helpful error messages
- [ ] Create sample data file `public/sample-data.json`
  - [ ] 20+ risks with various likelihood/severity
  - [ ] 10+ controls
  - [ ] 5+ audits
  - [ ] Realistic relationships
- [ ] Implement `src/components/upload/WelcomeScreen.tsx`
  - [ ] Drag & drop file upload
  - [ ] Sample data loading button
  - [ ] Validation error display
- [ ] Test with valid and invalid JSON files

### Phase 5: Core Graph Component
- [ ] Implement `src/components/graph/ForceGraph3D.tsx`
  - [ ] Render react-force-graph-3d
  - [ ] Use `nodeThreeObject` for custom shapes
  - [ ] Configure link colors/widths/opacity
  - [ ] Add directional arrows
  - [ ] Add particle effects on "mitigates" links
  - [ ] Set up camera (backgroundColor, initial position)
- [ ] Implement `src/hooks/useGraphData.ts`
  - [ ] Transform raw data to graph format
  - [ ] Apply visual encoding
  - [ ] Memoize result
- [ ] Test graph renders with sample data
- [ ] Verify all entity shapes display correctly
- [ ] Verify color encoding (blue → red gradient)

### Phase 6: Graph Legend
- [ ] Implement `src/components/graph/GraphLegend.tsx`
  - [ ] Color legend (likelihood)
    - Show 4 color stops: Low (blue), Medium (yellow), High (orange), Critical (red)
  - [ ] Size legend (severity)
    - Show 3 size examples: Small, Medium, Large
  - [ ] Shape legend (entity types)
    - List all 7 entity types with colored icons
  - [ ] Position in top-right corner
  - [ ] Style with glassmorphism (backdrop-blur, semi-transparent)
- [ ] Verify legend matches actual graph visuals

### Phase 7: Interactions & Selection
- [ ] Implement `src/hooks/useNodeSelection.ts`
  - [ ] Track selectedNode in Zustand
  - [ ] Track hoveredNode in Zustand
  - [ ] Provide select/deselect actions
- [ ] Add onClick handler to ForceGraph3D
  - [ ] Update selectedNode on click
  - [ ] Highlight selected node (increase emissive)
  - [ ] Highlight connected links (bright cyan)
  - [ ] Dim unconnected nodes (opacity 0.2)
- [ ] Add onHover handler
  - [ ] Show tooltip near cursor
  - [ ] Display node name and key metrics
- [ ] Add keyboard support
  - [ ] ESC = deselect
- [ ] Test interaction feel (should be snappy)

### Phase 8: Details Panel
- [ ] Implement `src/components/panels/DetailsPanel.tsx`
  - [ ] Show "Select a node" placeholder when nothing selected
  - [ ] Display node header (name, type badge)
  - [ ] Show 4 metric cards for risks:
    - Inherent Likelihood
    - Residual Likelihood
    - Inherent Severity
    - Residual Severity
  - [ ] Display metadata (owner, last assessment, description)
  - [ ] List connected entities (clickable)
  - [ ] Style with same theme as legend
- [ ] Position on right side of screen (350px width)
- [ ] Make scrollable for long content
- [ ] Test with different node types

### Phase 9: Filtering System
- [ ] Create `src/hooks/useFilters.ts`
  - [ ] Combine all active filters
  - [ ] Return filtered node/link arrays
  - [ ] Memoize expensive operations
- [ ] Implement `src/components/filters/MultiSelectFilter.tsx`
  - [ ] Searchable dropdown
  - [ ] Checkbox list
  - [ ] Select All / Deselect All buttons
  - [ ] Show count of selected items
- [ ] Create filter instances:
  - [ ] `AuditsFilter.tsx` (filters by audit)
  - [ ] `UnitsFilter.tsx` (filters by business unit)
  - [ ] `StandardsFilter.tsx` (filters by standard)
  - [ ] `RiskTypeFilter.tsx` (filters by risk category)
- [ ] Implement entity layer toggles in Sidebar
  - [ ] Show/hide Controls
  - [ ] Show/hide Issues
  - [ ] Show/hide Incidents
  - [ ] Show/hide Business Units
  - [ ] Show/hide Standards
- [ ] Wire filters to graph data
- [ ] Test: Graph updates immediately when filter changes
- [ ] Test: Multiple filters combine correctly (AND logic)

### Phase 10: Preset Views
- [ ] Implement `src/lib/presetViews.ts`
  - [ ] `applyPresetView(presetId, data): FilteredData`
- [ ] Implement all 13 preset algorithms:
  - [ ] **Uncontrolled Risks:** Risks with no "mitigates" links
  - [ ] **Unaudited Risks:** Risks with no "assessed_by" links
  - [ ] **Unmonitored Standards:** Standards with no audit links
  - [ ] **Audit Blind Spots:** Business units with no audit coverage
  - [ ] **High Issue Risks:** Risks with most "reports" links (issues)
  - [ ] **High Incident Risks:** Risks with most "causes" links (incidents)
  - [ ] **Failed Controls:** Controls with effectiveness < 0.5
  - [ ] **High Residual Risk:** Risks with residual_rating > 7
  - [ ] **Standard Violations:** Standards with most non-compliance issues
  - [ ] **Regulatory Exposure:** High-severity risks in regulated areas
  - [ ] **Enterprise Risk Profile:** Top 20 risks by residual rating
  - [ ] **Audit Universe Coverage:** Show all entities, highlight coverage %
  - [ ] **Default View:** All entities, all links
- [ ] Implement `src/components/filters/PresetFilter.tsx`
  - [ ] Dropdown with all 13 presets
  - [ ] Group by category (Coverage, Hotspots, Planning, etc.)
  - [ ] Apply preset on selection
  - [ ] Show preset description message
- [ ] Test each preset with sample data
- [ ] Verify preset message displays correctly

### Phase 11: Temporal Filtering
- [ ] Implement `src/lib/temporalFilter.ts`
  - [ ] `applyEventsUpTo(data, date): Snapshot`
  - [ ] Process event types:
    - `risk_assessment` → Update risk likelihood/severity
    - `audit_completed` → Add audit node, create links
    - `control_added` → Add control node
    - `incident_occurred` → Add incident node
    - `risk_mitigated` → Remove risk node
  - [ ] Return filtered nodes/links for specific date
- [ ] Create `src/hooks/useTemporalFilter.ts`
  - [ ] Wrap temporalFilter logic
  - [ ] Memoize by currentDate
- [ ] Test temporal filtering with synthetic events
- [ ] Verify nodes appear/disappear at correct dates

### Phase 12: Timeline Playback
- [ ] Implement `src/components/timeline/TimelineControls.tsx`
  - [ ] Play/Pause/Reset buttons
  - [ ] Date display (large, prominent)
  - [ ] Timeline slider (scrubber)
  - [ ] Speed selector (0.5x, 1x, 2x, 5x, 10x)
- [ ] Implement playback logic in Zustand timeline slice
  - [ ] Play: setInterval that increments currentDate
  - [ ] Pause: clearInterval
  - [ ] Reset: set to minDate
  - [ ] Speed: adjust interval duration
- [ ] Wire timeline to graph
  - [ ] Graph updates on currentDate change
  - [ ] Nodes/links fade in/out smoothly (library handles this)
- [ ] Test timeline:
  - [ ] Play advances date
  - [ ] Graph updates at each tick
  - [ ] Speed control works
  - [ ] Can scrub manually
  - [ ] Loops back to start at end

### Phase 13: Header & Stats
- [ ] Implement `src/components/panels/Header.tsx`
  - [ ] App title/logo
  - [ ] Filter dropdowns (in header, not sidebar)
  - [ ] Stats cards
- [ ] Implement `src/components/panels/StatsCards.tsx`
  - [ ] Total Audits (count from data)
  - [ ] Total Risks (filtered count)
  - [ ] Coverage % (risks with audits / total risks)
  - [ ] Update in real-time when filters/timeline change
- [ ] Style with metallic theme (borders, gradients)
- [ ] Make header sticky on scroll

### Phase 14: Export Functionality
- [ ] Implement `src/lib/exporters.ts`
  - [ ] `exportJSON(data)` → Download filtered graph as JSON
  - [ ] `exportCSV(data)` → Download nodes as CSV
  - [ ] `exportGraphML(data)` → GraphML format for Gephi
  - [ ] `exportPNG()` → Screenshot via canvas.toDataURL()
- [ ] Add Export button to footer/timeline area
- [ ] Create export modal with format selector
- [ ] Test all export formats
- [ ] Verify exported data includes only visible nodes

### Phase 15: Polish & UX
- [ ] Add loading states
  - [ ] File upload spinner
  - [ ] Graph rendering spinner
  - [ ] Filter update loading (if > 100ms)
- [ ] Add smooth transitions
  - [ ] Panel slide-in animations
  - [ ] Button hover effects
  - [ ] Filter dropdown transitions
- [ ] Add error boundaries
  - [ ] Catch rendering errors
  - [ ] Show friendly error message
- [ ] Add empty states
  - [ ] "No data loaded" state
  - [ ] "No results" when all nodes filtered out
- [ ] Optimize bundle size
  - [ ] Lazy load heavy components
  - [ ] Code split routes if needed
- [ ] Final testing pass
  - [ ] All features work
  - [ ] No console errors
  - [ ] Smooth at 30+ fps with 1000 nodes

---

## Complete Component Specifications

### ForceGraph3D Component

**File:** `src/components/graph/ForceGraph3D.tsx`

```typescript
import { useRef, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { useGraphStore } from '@/store/graphStore';
import { createNodeShape } from '@/lib/nodeShapes';
import {
  getLinkColor,
  getLinkWidth,
  getLinkOpacity
} from '@/lib/visualEncoding';
import type { GraphData, Node, Link } from '@/types';

interface Props {
  data: GraphData;
}

export function AuditVerseGraph({ data }: Props) {
  const graphRef = useRef<any>();
  const selectedNode = useGraphStore(state => state.selectedNode);
  const setSelectedNode = useGraphStore(state => state.setSelectedNode);
  const setHoveredNode = useGraphStore(state => state.setHoveredNode);

  // Configure force simulation on mount
  useEffect(() => {
    if (!graphRef.current) return;

    // Adjust forces for better layout
    graphRef.current.d3Force('charge').strength(-200);
    graphRef.current.d3Force('link')
      .distance((link: Link) => {
        // Different distances for different relationship types
        const distances: Record<string, number> = {
          mitigates: 50,
          assessed_by: 100,
          owned_by: 80,
          requires: 120
        };
        return distances[link.type] || 100;
      })
      .strength((link: Link) => link.strength || 0.5);
  }, []);

  return (
    <ForceGraph3D
      ref={graphRef}
      graphData={data}

      // Node rendering
      nodeThreeObject={(node: Node) => createNodeShape(node)}
      nodeThreeObjectExtend={true}

      // Node labels
      nodeLabel={(node: Node) => `
        <div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px;">
          <div style="font-weight: bold; color: #00ffcc;">${node.name}</div>
          <div style="font-size: 12px; color: #999;">${node.type}</div>
          ${node.type === 'risk' ? `
            <div style="margin-top: 4px; font-size: 11px;">
              <div>Likelihood: ${node.likelihood}/10</div>
              <div>Severity: ${node.severity}/10</div>
              <div>Rating: ${node.rating}</div>
            </div>
          ` : ''}
        </div>
      `}

      // Link rendering
      linkColor={(link: Link) => getLinkColor(link, selectedNode)}
      linkWidth={(link: Link) => getLinkWidth(link, selectedNode)}
      linkOpacity={(link: Link) => getLinkOpacity(link, selectedNode)}
      linkDirectionalArrowLength={6}
      linkDirectionalArrowRelPos={1}
      linkDirectionalParticles={(link: Link) =>
        link.type === 'mitigates' ? 2 : 0
      }
      linkDirectionalParticleSpeed={0.005}

      // Interactions
      onNodeClick={(node: Node) => {
        setSelectedNode(selectedNode?.id === node.id ? null : node);
      }}
      onNodeHover={(node: Node | null) => {
        setHoveredNode(node);
      }}
      onBackgroundClick={() => setSelectedNode(null)}

      // Enable controls
      enableNodeDrag={true}
      enableNavigationControls={true}

      // Camera & appearance
      backgroundColor="#0c0c1a"
      showNavInfo={false}
    />
  );
}
```

### GraphLegend Component

**File:** `src/components/graph/GraphLegend.tsx`

```typescript
export function GraphLegend() {
  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 max-w-xs shadow-2xl">

      {/* Color Legend */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-cyan-400 uppercase tracking-wider">
          Likelihood
        </h3>
        <div className="space-y-2">
          {[
            { range: '1-3', color: '#0088ff', label: 'Low' },
            { range: '4-6', color: '#ffcc00', label: 'Medium' },
            { range: '7-8', color: '#ff8800', label: 'High' },
            { range: '9-10', color: '#ff0044', label: 'Critical' }
          ].map(item => (
            <div key={item.range} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shadow-lg"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-300">
                {item.label} ({item.range})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Size Legend */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-cyan-400 uppercase tracking-wider">
          Severity
        </h3>
        <div className="flex items-end gap-4 mb-2">
          <div className="w-2 h-2 rounded-full bg-white" title="Low" />
          <div className="w-4 h-4 rounded-full bg-white" title="Medium" />
          <div className="w-8 h-8 rounded-full bg-white" title="High" />
        </div>
        <div className="text-xs text-gray-400">
          Larger size = Higher severity
        </div>
      </div>

      {/* Shape Legend */}
      <div>
        <h3 className="text-sm font-bold mb-3 text-cyan-400 uppercase tracking-wider">
          Entity Types
        </h3>
        <div className="space-y-2">
          {[
            { shape: '●', color: '#ff0044', label: 'Risk' },
            { shape: '■', color: '#00ccff', label: 'Control' },
            { shape: '◆', color: '#ff6600', label: 'Audit' },
            { shape: '▲', color: '#ffff00', label: 'Issue' },
            { shape: '⬟', color: '#ff0099', label: 'Incident' },
            { shape: '○', color: '#9966ff', label: 'Standard' },
            { shape: '⬢', color: '#00ff99', label: 'Business Unit' }
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-lg w-4 text-center" style={{ color: item.color }}>
                {item.shape}
              </span>
              <span className="text-xs text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Link Legend */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-sm font-bold mb-3 text-cyan-400 uppercase tracking-wider">
          Relationships
        </h3>
        <div className="space-y-2">
          {[
            { type: 'mitigates', color: '#00ccff', label: 'Control → Risk' },
            { type: 'assessed_by', color: '#ff6600', label: 'Audit → Risk' },
            { type: 'owned_by', color: '#00ff99', label: 'Unit → Risk' }
          ].map(item => (
            <div key={item.type} className="flex items-center gap-3">
              <div
                className="w-8 h-0.5"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### TimelineControls Component

**File:** `src/components/timeline/TimelineControls.tsx`

```typescript
import { useTimelineStore } from '@/store/graphStore';
import { format } from 'date-fns';

export function TimelineControls() {
  const {
    currentDate,
    minDate,
    maxDate,
    isPlaying,
    speed,
    play,
    pause,
    reset,
    setCurrentDate,
    setSpeed
  } = useTimelineStore();

  // Calculate slider position (0-100)
  const totalDuration = maxDate.getTime() - minDate.getTime();
  const currentPosition =
    ((currentDate.getTime() - minDate.getTime()) / totalDuration) * 100;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2a2a2f] to-[#1a1a2e] border-t-4 border-[#4a4a4f] p-6 shadow-2xl">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-6">

        {/* Playback Controls */}
        <div className="flex gap-3">
          {!isPlaying ? (
            <button
              onClick={play}
              className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400
                         flex items-center justify-center transition-all
                         hover:scale-110 shadow-lg shadow-cyan-500/50"
              aria-label="Play"
            >
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={pause}
              className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400
                         flex items-center justify-center transition-all
                         hover:scale-110 shadow-lg shadow-cyan-500/50"
              aria-label="Pause"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
            </button>
          )}

          <button
            onClick={reset}
            className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500
                       flex items-center justify-center transition-all
                       hover:scale-110"
            aria-label="Reset"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" />
            </svg>
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={currentPosition}
            onChange={(e) => {
              const pos = parseFloat(e.target.value) / 100;
              const newTime = minDate.getTime() + (totalDuration * pos);
              setCurrentDate(new Date(newTime));
            }}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-6
                       [&::-webkit-slider-thumb]:h-6
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-cyan-500
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:shadow-cyan-500/50"
          />

          {/* Date Display */}
          <div className="min-w-[200px] text-center bg-black/50 px-6 py-3
                          rounded-lg border border-cyan-500/30">
            <div className="text-xl font-bold text-cyan-400 font-mono">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {format(currentDate, 'MMM d, yyyy')}
            </div>
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-3 bg-black/50 px-4 py-2
                        rounded-lg border border-gray-700">
          <span className="text-sm text-gray-400">Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="bg-transparent text-cyan-400 text-sm outline-none
                       cursor-pointer font-mono"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="5">5x</option>
            <option value="10">10x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

### DetailsPanel Component

**File:** `src/components/panels/DetailsPanel.tsx`

```typescript
import { useGraphStore } from '@/store/graphStore';
import { getLikelihoodColor } from '@/lib/visualEncoding';
import { ENTITY_COLORS } from '@/lib/nodeShapes';

export function DetailsPanel() {
  const selectedNode = useGraphStore(state => state.selectedNode);
  const setSelectedNode = useGraphStore(state => state.setSelectedNode);

  if (!selectedNode) {
    return (
      <div className="w-[350px] bg-gradient-to-br from-[#2a2a2f] to-[#1a1a2e]
                      border-l-4 border-[#4a4a4f] p-6">
        <div className="text-center mt-20">
          <div className="text-6xl mb-4 opacity-20">📊</div>
          <h3 className="text-lg text-gray-400 mb-2">Select a Node</h3>
          <p className="text-sm text-gray-500">
            Click on any risk or entity to view detailed information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[350px] bg-gradient-to-br from-[#2a2a2f] to-[#1a1a2e]
                    border-l-4 border-[#4a4a4f] overflow-y-auto">

      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl text-cyan-400 leading-tight flex-1">
            {selectedNode.name}
          </h3>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="inline-block px-3 py-1 bg-cyan-500/20
                        border border-cyan-500/50 rounded text-xs
                        text-cyan-400 uppercase">
          {selectedNode.type}
        </div>
      </div>

      {/* Metrics (for risks only) */}
      {selectedNode.type === 'risk' && (
        <div className="p-6 border-b border-gray-700/50">
          <h4 className="text-sm text-gray-400 uppercase mb-4">
            Risk Metrics
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Inherent Likelihood"
              value={selectedNode.inherent_likelihood}
              color={getLikelihoodColor(selectedNode.inherent_likelihood)}
            />
            <MetricCard
              label="Residual Likelihood"
              value={selectedNode.residual_likelihood}
              color={getLikelihoodColor(selectedNode.residual_likelihood)}
            />
            <MetricCard
              label="Inherent Severity"
              value={selectedNode.inherent_severity}
              color="#ff6600"
            />
            <MetricCard
              label="Residual Severity"
              value={selectedNode.residual_severity}
              color="#ff6600"
            />
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="p-6 border-b border-gray-700/50">
        <h4 className="text-sm text-gray-400 uppercase mb-4">Details</h4>
        <div className="space-y-3 text-sm">
          {selectedNode.owner && (
            <div>
              <div className="text-gray-500 text-xs mb-1">Owner</div>
              <div className="text-white">{selectedNode.owner}</div>
            </div>
          )}
          {selectedNode.last_assessment && (
            <div>
              <div className="text-gray-500 text-xs mb-1">Last Assessment</div>
              <div className="text-white">
                {new Date(selectedNode.last_assessment).toLocaleDateString()}
              </div>
            </div>
          )}
          {selectedNode.description && (
            <div>
              <div className="text-gray-500 text-xs mb-1">Description</div>
              <div className="text-gray-300 text-xs leading-relaxed">
                {selectedNode.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connected Entities */}
      {selectedNode.connections && selectedNode.connections.length > 0 && (
        <div className="p-6">
          <h4 className="text-sm text-gray-400 uppercase mb-4">
            Connected ({selectedNode.connections.length})
          </h4>
          <div className="space-y-2">
            {selectedNode.connections.map((conn: any) => (
              <button
                key={conn.id}
                onClick={() => setSelectedNode(conn)}
                className="w-full flex items-center gap-3 p-3 bg-white/5
                           hover:bg-white/10 rounded border border-transparent
                           hover:border-cyan-500/30 transition-all text-left"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ENTITY_COLORS[conn.type] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">
                    {conn.name}
                  </div>
                  <div className="text-xs text-gray-500">{conn.type}</div>
                </div>
                <div className="text-gray-500">→</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: any) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: `${color}10`,
        borderColor: `${color}30`
      }}
    >
      <div className="text-xs text-gray-400 mb-2">{label}</div>
      <div
        className="text-3xl font-bold"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
```

---

## Data Structures

### Core Types

**File:** `src/types/graph.types.ts`

```typescript
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
```

### Event Types (for Temporal Filtering)

**File:** `src/types/event.types.ts`

```typescript
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

export interface TemporalDataset {
  initialState: GraphData;
  events: Event[];
  minDate: Date;
  maxDate: Date;
}
```

### Sample Data Structure

**File:** `public/sample-data.json`

```json
{
  "risks": [
    {
      "id": "R001",
      "name": "Data Breach Risk",
      "type": "risk",
      "inherent_likelihood": 8,
      "inherent_severity": 9,
      "inherent_rating": 8.5,
      "residual_likelihood": 4,
      "residual_severity": 7,
      "residual_rating": 5.5,
      "category": "Cybersecurity",
      "owner": "CISO",
      "business_unit": "IT",
      "last_assessment": "2024-03-15",
      "description": "Risk of unauthorized access to customer PII"
    },
    {
      "id": "R002",
      "name": "Regulatory Compliance Risk",
      "type": "risk",
      "inherent_likelihood": 6,
      "inherent_severity": 8,
      "inherent_rating": 7.0,
      "residual_likelihood": 3,
      "residual_severity": 6,
      "residual_rating": 4.5,
      "category": "Compliance",
      "owner": "Compliance Officer",
      "business_unit": "Legal",
      "last_assessment": "2024-02-20"
    }
  ],
  "controls": [
    {
      "id": "C001",
      "name": "Multi-Factor Authentication",
      "type": "control",
      "effectiveness": 0.85,
      "owner": "IT Security",
      "description": "MFA required for all system access"
    },
    {
      "id": "C002",
      "name": "Data Encryption at Rest",
      "type": "control",
      "effectiveness": 0.90,
      "owner": "IT Security"
    }
  ],
  "audits": [
    {
      "id": "A001",
      "name": "Q1 Cybersecurity Audit",
      "type": "audit",
      "date": "2024-01-15",
      "status": "completed",
      "owner": "Internal Audit"
    }
  ],
  "standards": [
    {
      "id": "S001",
      "name": "GDPR Article 32",
      "type": "standard",
      "framework": "GDPR",
      "description": "Security of processing"
    }
  ],
  "businessUnits": [
    {
      "id": "BU001",
      "name": "IT Department",
      "type": "businessUnit",
      "department": "Technology"
    }
  ],
  "relationships": [
    {
      "source": "C001",
      "target": "R001",
      "type": "mitigates",
      "strength": 0.8
    },
    {
      "source": "A001",
      "target": "R001",
      "type": "assessed_by"
    },
    {
      "source": "BU001",
      "target": "R001",
      "type": "owned_by"
    },
    {
      "source": "S001",
      "target": "R001",
      "type": "requires"
    }
  ],
  "events": [
    {
      "date": "2024-01-15",
      "type": "audit_completed",
      "audit_id": "A001",
      "assessed_risks": ["R001", "R002"]
    },
    {
      "date": "2024-02-01",
      "type": "risk_assessment",
      "risk_id": "R001",
      "new_likelihood": 4,
      "new_severity": 7
    }
  ]
}
```

---

## Business Logic

### Temporal Filter Logic

**File:** `src/lib/temporalFilter.ts`

```typescript
import type { GraphData, Event, TemporalDataset } from '@/types';

/**
 * Apply all events up to a specific date
 * Returns a snapshot of the graph at that point in time
 *
 * @param dataset - Full temporal dataset
 * @param targetDate - Date to filter to
 * @returns Graph snapshot at targetDate
 */
export function applyEventsUpTo(
  dataset: TemporalDataset,
  targetDate: Date
): GraphData {
  // Start with initial state
  let nodes = [...dataset.initialState.nodes];
  let links = [...dataset.initialState.links];

  // Filter events up to target date
  const relevantEvents = dataset.events.filter(
    event => new Date(event.date) <= targetDate
  );

  // Apply events in chronological order
  relevantEvents.forEach(event => {
    switch (event.type) {
      case 'risk_assessment':
        nodes = nodes.map(node => {
          if (node.id === event.risk_id && node.type === 'risk') {
            return {
              ...node,
              residual_likelihood: event.new_likelihood ?? node.residual_likelihood,
              residual_severity: event.new_severity ?? node.residual_severity,
              residual_rating: calculateRating(
                event.new_likelihood ?? node.residual_likelihood,
                event.new_severity ?? node.residual_severity
              )
            };
          }
          return node;
        });
        break;

      case 'audit_completed':
        // Audit node should already exist, just add links
        event.assessed_risks.forEach(riskId => {
          if (!links.find(l =>
            l.source === event.audit_id &&
            l.target === riskId &&
            l.type === 'assessed_by'
          )) {
            links.push({
              source: event.audit_id,
              target: riskId,
              type: 'assessed_by'
            });
          }
        });
        break;

      case 'control_added':
        // Control node should be in dataset, add mitigation links
        event.affects_risks.forEach(riskId => {
          links.push({
            source: event.control_id,
            target: riskId,
            type: 'mitigates',
            strength: 0.7
          });
        });
        break;

      case 'control_removed':
        // Remove mitigation links
        links = links.filter(link =>
          !(link.source === event.control_id && link.type === 'mitigates')
        );
        break;

      case 'risk_mitigated':
        // Remove risk node and all its links
        nodes = nodes.filter(n => n.id !== event.risk_id);
        links = links.filter(l =>
          l.source !== event.risk_id && l.target !== event.risk_id
        );
        break;

      case 'incident_occurred':
        // Incident node should exist, add causal link
        links.push({
          source: event.incident_id,
          target: event.related_risk,
          type: 'causes'
        });
        break;
    }
  });

  return { nodes, links };
}

function calculateRating(likelihood: number, severity: number): number {
  // Simple average, or use your org's formula
  return (likelihood + severity) / 2;
}
```

### Preset View Algorithms

**File:** `src/lib/presetViews.ts`

```typescript
import type { GraphData, Node, Link } from '@/types';

export type PresetId =
  | 'default'
  | 'uncontrolled-risks'
  | 'unaudited-risks'
  | 'unmonitored-standards'
  | 'audit-blind-spots'
  | 'high-issue-risks'
  | 'high-incident-risks'
  | 'failed-controls'
  | 'high-residual-risk'
  | 'standard-violations'
  | 'regulatory-exposure'
  | 'enterprise-risk-profile'
  | 'audit-universe-coverage';

export interface PresetResult {
  nodes: Node[];
  links: Link[];
  message: string;
}

/**
 * Apply a preset view filter
 */
export function applyPresetView(
  presetId: PresetId,
  data: GraphData
): PresetResult {
  switch (presetId) {
    case 'default':
      return {
        nodes: data.nodes,
        links: data.links,
        message: 'Showing all entities and relationships'
      };

    case 'uncontrolled-risks':
      // Risks with no "mitigates" links
      const controlledRiskIds = new Set(
        data.links
          .filter(l => l.type === 'mitigates')
          .map(l => typeof l.target === 'string' ? l.target : l.target.id)
      );

      const uncontrolledRisks = data.nodes.filter(
        n => n.type === 'risk' && !controlledRiskIds.has(n.id)
      );

      return {
        nodes: uncontrolledRisks,
        links: [],
        message: `Found ${uncontrolledRisks.length} risks without any controls`
      };

    case 'unaudited-risks':
      // Risks with no "assessed_by" links
      const auditedRiskIds = new Set(
        data.links
          .filter(l => l.type === 'assessed_by')
          .map(l => typeof l.target === 'string' ? l.target : l.target.id)
      );

      const unauditedRisks = data.nodes.filter(
        n => n.type === 'risk' && !auditedRiskIds.has(n.id)
      );

      return {
        nodes: unauditedRisks,
        links: [],
        message: `Found ${unauditedRisks.length} risks never audited`
      };

    case 'high-residual-risk':
      // Risks with residual_rating > 7
      const highResidualRisks = data.nodes.filter(
        n => n.type === 'risk' && n.residual_rating > 7
      );

      // Include their controls and audits
      const relatedNodeIds = new Set(highResidualRisks.map(n => n.id));
      const relatedLinks = data.links.filter(l => {
        const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
        const targetId = typeof l.target === 'string' ? l.target : l.target.id;
        return relatedNodeIds.has(sourceId) || relatedNodeIds.has(targetId);
      });

      relatedLinks.forEach(l => {
        const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
        const targetId = typeof l.target === 'string' ? l.target : l.target.id;
        relatedNodeIds.add(sourceId);
        relatedNodeIds.add(targetId);
      });

      const relatedNodes = data.nodes.filter(n => relatedNodeIds.has(n.id));

      return {
        nodes: relatedNodes,
        links: relatedLinks,
        message: `${highResidualRisks.length} high-residual-risk areas need attention`
      };

    case 'failed-controls':
      // Controls with effectiveness < 0.5
      const failedControls = data.nodes.filter(
        n => n.type === 'control' && n.effectiveness < 0.5
      );

      // Get risks they (poorly) mitigate
      const failedControlIds = new Set(failedControls.map(c => c.id));
      const affectedLinks = data.links.filter(l =>
        l.type === 'mitigates' &&
        failedControlIds.has(typeof l.source === 'string' ? l.source : l.source.id)
      );

      const affectedRiskIds = new Set(
        affectedLinks.map(l => typeof l.target === 'string' ? l.target : l.target.id)
      );
      const affectedRisks = data.nodes.filter(n => affectedRiskIds.has(n.id));

      return {
        nodes: [...failedControls, ...affectedRisks],
        links: affectedLinks,
        message: `${failedControls.length} controls with low effectiveness`
      };

    case 'enterprise-risk-profile':
      // Top 20 risks by residual rating
      const allRisks = data.nodes
        .filter(n => n.type === 'risk')
        .sort((a, b) => b.residual_rating - a.residual_rating)
        .slice(0, 20);

      return {
        nodes: allRisks,
        links: [],
        message: `Top ${allRisks.length} risks by residual rating`
      };

    // ... implement remaining presets similarly

    default:
      return {
        nodes: data.nodes,
        links: data.links,
        message: 'Unknown preset'
      };
  }
}
```

### Filter Combination Logic

**File:** `src/hooks/useFilters.ts`

```typescript
import { useMemo } from 'use';
import { useGraphStore } from '@/store/graphStore';
import type { GraphData } from '@/types';

/**
 * Combine all active filters and return filtered graph data
 */
export function useFilters(baseData: GraphData): GraphData {
  const {
    selectedAudits,
    selectedUnits,
    selectedStandards,
    selectedRiskTypes,
    activeEntityLayers,
    riskThreshold
  } = useGraphStore();

  return useMemo(() => {
    let nodes = baseData.nodes;
    let links = baseData.links;

    // Filter by entity layers (show/hide entity types)
    nodes = nodes.filter(node => activeEntityLayers.has(node.type));

    // Filter by audits (show only risks assessed by selected audits)
    if (selectedAudits.size > 0) {
      const relevantRiskIds = new Set(
        links
          .filter(l =>
            l.type === 'assessed_by' &&
            selectedAudits.has(typeof l.source === 'string' ? l.source : l.source.id)
          )
          .map(l => typeof l.target === 'string' ? l.target : l.target.id)
      );

      nodes = nodes.filter(n =>
        n.type !== 'risk' || relevantRiskIds.has(n.id)
      );
    }

    // Filter by business units
    if (selectedUnits.size > 0) {
      const relevantRiskIds = new Set(
        links
          .filter(l =>
            l.type === 'owned_by' &&
            selectedUnits.has(typeof l.source === 'string' ? l.source : l.source.id)
          )
          .map(l => typeof l.target === 'string' ? l.target : l.target.id)
      );

      nodes = nodes.filter(n =>
        n.type !== 'risk' || relevantRiskIds.has(n.id)
      );
    }

    // Filter by risk threshold (residual rating)
    nodes = nodes.filter(n =>
      n.type !== 'risk' || n.residual_rating >= riskThreshold
    );

    // Filter links to only include those connecting visible nodes
    const visibleNodeIds = new Set(nodes.map(n => n.id));
    links = links.filter(l => {
      const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
      const targetId = typeof l.target === 'string' ? l.target : l.target.id;
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    return { nodes, links };
  }, [
    baseData,
    selectedAudits,
    selectedUnits,
    selectedStandards,
    selectedRiskTypes,
    activeEntityLayers,
    riskThreshold
  ]);
}
```

---

## Testing Requirements

### Unit Tests

**All visual encoding functions must be tested:**

```typescript
// src/lib/__tests__/visualEncoding.test.ts

import { describe, it, expect } from 'vitest';
import { getLikelihoodColor, getSeveritySize, getConfidenceOpacity } from '../visualEncoding';

describe('getLikelihoodColor', () => {
  it('returns blue for low likelihood', () => {
    const color = getLikelihoodColor(1);
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    // Should be bluish (high R value in inverted RdYlBu)
  });

  it('returns red for high likelihood', () => {
    const color = getLikelihoodColor(10);
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    // Should be reddish
  });

  it('returns continuous gradient', () => {
    const colors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(getLikelihoodColor);
    // No duplicates (continuous)
    expect(new Set(colors).size).toBe(10);
  });
});

describe('getSeveritySize', () => {
  it('returns small size for low severity', () => {
    expect(getSeveritySize(1)).toBeLessThan(5);
  });

  it('returns large size for high severity', () => {
    expect(getSeveritySize(10)).toBeGreaterThan(10);
  });

  it('scales monotonically', () => {
    const sizes = [1, 5, 10].map(getSeveritySize);
    expect(sizes[0]).toBeLessThan(sizes[1]);
    expect(sizes[1]).toBeLessThan(sizes[2]);
  });
});
```

### Integration Tests

**Test filter → graph update flow:**

```typescript
// src/__tests__/filtering.integration.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App';

describe('Filtering Integration', () => {
  it('filters graph when preset view selected', async () => {
    render(<App />);

    // Load sample data
    fireEvent.click(screen.getByText('Load Sample Data'));

    await waitFor(() => {
      expect(screen.getByTestId('node-count')).toHaveTextContent(/\d+/);
    });

    const initialCount = parseInt(
      screen.getByTestId('node-count').textContent || '0'
    );

    // Select "Uncontrolled Risks" preset
    fireEvent.click(screen.getByLabelText('Preset Views'));
    fireEvent.click(screen.getByText('Uncontrolled Risks'));

    // Count should decrease
    await waitFor(() => {
      const newCount = parseInt(
        screen.getByTestId('node-count').textContent || '0'
      );
      expect(newCount).toBeLessThan(initialCount);
    });
  });
});
```

### Performance Benchmarks

**Ensure performance targets met:**

```typescript
// tests/performance/rendering.bench.ts

import { describe, bench } from 'vitest';
import { applyEventsUpTo } from '@/lib/temporalFilter';
import { generateTestData } from './helpers';

describe('Temporal Filtering Performance', () => {
  bench('filter 1000 nodes, 100 events', () => {
    const dataset = generateTestData(1000, 100);
    const result = applyEventsUpTo(dataset, new Date('2024-06-01'));
    expect(result.nodes.length).toBeGreaterThan(0);
  });
});
```

---

## Performance Targets

### Rendering Performance

| Nodes | Target FPS | Minimum Acceptable |
|-------|-----------|-------------------|
| 100 | 60 | 50 |
| 500 | 60 | 40 |
| 1000 | 45 | 30 |
| 2000 | 30 | 20 |
| 5000 | 20 | 15 |

### Interaction Latency

| Action | Target | Maximum Acceptable |
|--------|--------|-------------------|
| Filter update | < 50ms | < 100ms |
| Node click | < 16ms | < 50ms |
| Timeline tick | < 300ms | < 500ms |
| File load | < 2s | < 5s |

### Optimization Strategies

**If performance degrades:**

1. **Enable viewport culling**
   ```typescript
   // Only render nodes within camera view
   nodeVisibility={node => isInViewport(node, camera)}
   ```

2. **Use InstancedMesh**
   ```typescript
   // Share geometry across all risk nodes
   const sharedGeometry = new THREE.SphereGeometry(1);
   ```

3. **Reduce link quality**
   ```typescript
   linkResolution={2}  // Lower polygon count
   linkDirectionalParticles={0}  // Disable particles
   ```

4. **Throttle updates**
   ```typescript
   // Debounce filter changes
   const debouncedFilter = useMemo(
     () => debounce(applyFilter, 100),
     []
   );
   ```

---

## Implementation Notes

### Critical Success Factors

1. **Visual encoding must be intuitive**
   - Test color gradients with users
   - Ensure legend is always visible
   - Make size differences obvious

2. **Performance must not degrade**
   - Test with 1000+ nodes early
   - Profile render loop
   - Monitor memory usage

3. **Temporal filtering must be accurate**
   - Write comprehensive tests
   - Validate event application order
   - Handle edge cases (simultaneous events)

4. **Preset views must be useful**
   - Work with domain experts to validate algorithms
   - Ensure messages explain what's shown
   - Test with real audit data

### Common Pitfalls

**Avoid these mistakes:**

1. **Don't mutate D3 force node objects**
   ```typescript
   // BAD
   node.x = 100;

   // GOOD
   return { ...node, x: 100 };
   ```

2. **Don't forget to memoize expensive computations**
   ```typescript
   // BAD
   const filtered = applyFilters(data);  // Runs every render

   // GOOD
   const filtered = useMemo(() => applyFilters(data), [data, filters]);
   ```

3. **Don't block the render loop**
   ```typescript
   // BAD
   data.forEach(node => {
     // 100ms of synchronous work
   });

   // GOOD
   requestIdleCallback(() => {
     // Heavy computation in idle time
   });
   ```

4. **Don't ignore TypeScript errors**
   - Fix all type errors before proceeding
   - Use strict mode
   - Add explicit return types

### Development Workflow

**Recommended approach:**

1. **Build features incrementally**
   - Get each phase working before moving on
   - Test immediately after implementation
   - Commit working code frequently

2. **Use feature flags for experimentation**
   ```typescript
   const ENABLE_EXPERIMENTAL_FEATURE = false;

   if (ENABLE_EXPERIMENTAL_FEATURE) {
     // New code
   } else {
     // Stable code
   }
   ```

3. **Profile early and often**
   - Use Chrome DevTools Performance tab
   - Monitor FPS counter
   - Check memory usage

4. **Write tests as you go**
   - Unit tests for utilities
   - Integration tests for user flows
   - Performance benchmarks for critical paths

### Browser Support

**Target browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**WebGL 2.0 required** - Show error message if not available:

```typescript
// Detect WebGL support
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
  // Show error message
  showError('WebGL 2.0 is required but not supported by your browser');
}
```

### Deployment

**Build for production:**

```bash
npm run build
```

**Verify bundle size:**
```bash
# Target: < 1MB gzipped
du -h dist/*.js
```

**Optimize if needed:**
- Enable tree-shaking
- Use dynamic imports
- Compress images
- Minify code

---

## Conclusion

This specification provides complete technical details to rebuild AuditVerse with Three.js and visual encoding. Follow the implementation checklist sequentially, referring to component specifications and business logic as needed.

**Key Principles:**
1. Visual encoding over positional encoding
2. Force simulation reveals patterns
3. Performance is critical (30+ fps)
4. Temporal filtering enables trend analysis
5. Multiple filters combine via AND logic

**Next Steps:**
1. Set up project structure
2. Implement visual encoding library
3. Build core graph component
4. Add interactions and filters
5. Implement timeline playback
6. Polish and optimize

**Success Criteria:**
- ✅ 1000+ nodes render smoothly (30+ fps)
- ✅ All 13 preset views work correctly
- ✅ Timeline playback is smooth
- ✅ Visual encoding is intuitive (user testing)
- ✅ 80%+ test coverage
- ✅ Bundle size < 1MB gzipped

---

*This specification is complete and ready for AI agent implementation.*
*All necessary context, types, algorithms, and examples are included.*
*No prior knowledge of the existing codebase is required.*
