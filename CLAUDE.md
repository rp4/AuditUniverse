# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AuditVerse is a web application that visualizes enterprise risk and audit data as an interactive 3D force-directed graph using Three.js. The application helps auditors, risk managers, and executives understand risk landscapes, control coverage, audit gaps, and relationship patterns through visual encoding rather than traditional positional encoding.

## Core Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **3D Visualization**: react-force-graph-3d, Three.js, d3-force-3d
- **State Management**: Zustand
- **Build Tool**: Vite
- **Testing**: Vitest, @testing-library/react
- **Styling**: Tailwind CSS

## Critical Architecture Principles

### Visual Encoding Paradigm (DO NOT DEVIATE)

**The fundamental design principle is visual encoding over positional encoding:**

- **DO**: Encode risk metrics in visual properties (color, size, opacity, shape) and let force simulation position nodes based on relationships
- **DO NOT**: Position nodes at (x,y) coordinates based on likelihood/severity (this fights the force simulation)

**Visual Encoding Mapping:**
- Risk Likelihood → Node Color (blue = low, yellow = medium, red = high)
- Risk Severity → Node Size (small to large)
- Data Age/Confidence → Node Opacity (opaque to faded)
- Entity Type → Node Shape (sphere, cube, octahedron, etc.)
- Relationship Type → Link Color
- Relationship Strength → Link Width

### Key Implementation Files

**Visual Encoding Core** (`src/lib/visualEncoding.ts`):
- `getLikelihoodColor(likelihood: number): string` - Uses d3-scale-chromatic interpolateRdYlBu (reversed)
- `getSeveritySize(severity: number): number` - Exponential scaling for visual impact
- `getConfidenceOpacity(node: Node): number` - Age-based or confidence-based opacity

**Node Shapes** (`src/lib/nodeShapes.ts`):
- `createNodeShape(node: Node): THREE.Object3D` - Creates distinct Three.js shapes for each entity type
- Risk = Sphere, Control = Cube, Audit = Octahedron, Issue = Cone, etc.

**Temporal Filtering** (`src/lib/temporalFilter.ts`):
- `applyEventsUpTo(dataset: TemporalDataset, targetDate: Date): GraphData`
- Processes events chronologically: risk_assessment, audit_completed, control_added, etc.

**Preset Views** (`src/lib/presetViews.ts`):
- 13 preset analytical views: Uncontrolled Risks, Unaudited Risks, High Residual Risk, Failed Controls, etc.
- Each returns filtered nodes/links with explanatory message

## Project Structure

```
src/
├── components/
│   ├── graph/           # Main 3D graph, legend, tooltips
│   ├── filters/         # Preset views, multi-select filters
│   ├── panels/          # Header, sidebar, details panel
│   ├── timeline/        # Playback controls, scrubber
│   ├── upload/          # File upload, welcome screen
│   └── shared/          # Reusable UI components
├── hooks/               # useGraphData, useTemporalFilter, useFilters
├── store/               # Zustand store with slices
├── lib/                 # Visual encoding, shapes, filters, exporters
├── types/               # TypeScript definitions
├── utils/               # Date, color, math utilities
└── styles/              # Global CSS, theme tokens
```

## Development Commands

**Install dependencies:**
```bash
npm install
```

**Start dev server:**
```bash
npm run dev
```

**Run tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

**Type checking:**
```bash
npm run type-check
```

**Linting:**
```bash
npm run lint
```

## Data Structures

### Core Entity Types

**Node types**: `risk`, `control`, `audit`, `issue`, `incident`, `standard`, `businessUnit`

**Link types**: `mitigates`, `assessed_by`, `owned_by`, `requires`, `causes`, `reports`, `temporal`

**Risk Node** has both inherent (before controls) and residual (after controls) ratings with likelihood and severity dimensions (1-10 scale).

### Sample Data Format

See `public/sample-data.json` for the complete data structure including:
- `risks[]` - Risk entities with inherent/residual metrics
- `controls[]` - Control entities with effectiveness ratings
- `audits[]` - Audit entities with dates and status
- `relationships[]` - Links between entities
- `events[]` - Temporal events for timeline playback

## Performance Requirements

**Target performance:**
- 1000 nodes: 30+ FPS minimum
- Filter updates: < 100ms
- Node selection: < 50ms
- Timeline tick: < 500ms

**Optimization strategies if needed:**
- Enable viewport culling: `nodeVisibility={node => isInViewport(node, camera)}`
- Use InstancedMesh for shared geometry
- Reduce link quality: `linkResolution={2}`
- Throttle/debounce filter updates

## Testing Requirements

- Unit tests for all visual encoding functions
- Integration tests for filter → graph update flows
- Performance benchmarks for temporal filtering with 1000+ nodes
- Target: 80%+ test coverage

## Critical Implementation Notes

### Force Simulation Configuration

In `ForceGraph3D.tsx`:
```typescript
graphRef.current.d3Force('charge').strength(-200);
graphRef.current.d3Force('link')
  .distance((link) => {
    const distances = {
      mitigates: 50,
      assessed_by: 100,
      owned_by: 80,
      requires: 120
    };
    return distances[link.type] || 100;
  })
  .strength((link) => link.strength || 0.5);
```

### Common Pitfalls to Avoid

1. **Never mutate D3 force node objects directly** - Always return new objects
2. **Always memoize expensive computations** - Use `useMemo` for filtering/transformations
3. **Never block the render loop** - Use `requestIdleCallback` for heavy computation
4. **Fix all TypeScript errors** - Use strict mode, explicit return types

### Filter Combination Logic

Multiple filters combine with AND logic:
1. Entity layer toggles (show/hide by type)
2. Audit filter (risks assessed by selected audits)
3. Business unit filter (risks owned by selected units)
4. Risk threshold (residual rating minimum)
5. Links are filtered to only connect visible nodes

## Preset Views

13 preset analytical views provide domain-specific insights:
- **Coverage Analysis**: Uncontrolled Risks, Unaudited Risks, Unmonitored Standards, Audit Blind Spots
- **Hotspot Detection**: High Issue Risks, High Incident Risks, Failed Controls, High Residual Risk
- **Planning**: Standard Violations, Regulatory Exposure, Enterprise Risk Profile, Audit Universe Coverage

Each preset returns filtered data with an explanatory message.

## Timeline Playback

Temporal filtering applies events chronologically:
- Events: risk_assessment, audit_completed, control_added/removed, incident_occurred, risk_mitigated
- Playback controls: Play/Pause, Reset, Speed (0.5x-10x)
- Date scrubber for manual navigation

## Browser Requirements

- **Minimum**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL 2.0 required** - Show error if unsupported

## Implementation Checklist Reference

See [REBUILD_SPEC_AI_AGENT.md](REBUILD_SPEC_AI_AGENT.md) for the complete 15-phase implementation checklist covering:
1. Project Setup
2. Visual Encoding Library
3. State Management
4. Data Loading & Validation
5. Core Graph Component
6. Graph Legend
7. Interactions & Selection
8. Details Panel
9. Filtering System
10. Preset Views
11. Temporal Filtering
12. Timeline Playback
13. Header & Stats
14. Export Functionality
15. Polish & UX

## Design System

**Color Palette:**
- Background: `#0c0c1a` (dark blue-black)
- Primary: `#00ffcc` (cyan)
- Accent: `#ff6600` (orange)
- Success: `#00ff99` (green)
- Warning: `#ffcc00` (yellow)
- Danger: `#ff0044` (red)

**UI Components** use glassmorphism style:
- `bg-black/80 backdrop-blur-sm`
- `border border-cyan-500/30`
- Metallic gradients for panels

## Success Criteria

- ✅ 1000+ nodes render at 30+ FPS
- ✅ All 13 preset views work correctly
- ✅ Timeline playback is smooth
- ✅ Visual encoding is intuitive
- ✅ 80%+ test coverage
- ✅ Bundle size < 1MB gzipped
