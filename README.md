# AuditVerse

> 3D Force-Directed Graph Visualization for Enterprise Risk & Audit Data

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-65%2F65-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Bundle Size](https://img.shields.io/badge/bundle-443KB%20gzipped-blue)

AuditVerse is an interactive 3D visualization tool that transforms complex enterprise risk and audit data into an intuitive force-directed graph. Using visual encoding principles, it helps auditors, risk managers, and executives understand risk landscapes, control coverage, and relationship patterns at a glance.

## 🌟 Key Features

### Visual Encoding Paradigm
- **Color** = Risk Likelihood (blue → yellow → red gradient)
- **Size** = Risk Severity (exponential scaling)
- **Shape** = Entity Type (7 distinct 3D shapes)
- **Opacity** = Data Age/Confidence
- **Force simulation** handles positioning based on relationships

### Advanced Analytics
- **13 Preset Views** across 3 categories:
  - Coverage Analysis (Uncontrolled Risks, Unaudited Risks, Audit Blind Spots, Unmonitored Standards)
  - Hotspot Detection (High Issue Risks, High Incident Risks, Failed Controls, High Residual Risk)
  - Planning & Compliance (Standard Violations, Regulatory Exposure, Enterprise Risk Profile, etc.)

### Temporal Analysis
- Event-based graph evolution with 6 event types
- Timeline playback with speed control (0.5x - 10x)
- Date scrubber for manual navigation
- Watch your risk landscape evolve over time

### Interactive Exploration
- 3D rotation, zoom, and pan
- Hover tooltips with type-specific metrics
- Click nodes for detailed information panel
- Navigate through connected entities
- Keyboard shortcuts (ESC to deselect)

### Powerful Filtering
- 7 filter types with AND logic combination:
  - Entity layer toggles (show/hide by type)
  - Search by name
  - Audits filter (risks assessed by selected audits)
  - Business units filter (risks owned by units)
  - Standards filter (compliance requirements)
  - Risk categories (operational, financial, etc.)
  - Risk threshold slider (0-100)

### Export Capabilities
- **JSON** - Complete graph data
- **CSV** - Nodes in spreadsheet format
- **GraphML** - For Gephi/Cytoscape analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AuditUniverse

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Load Sample Data

On the welcome screen, click **"Load Sample Data"** to explore with pre-loaded data including:
- 20 risks across multiple categories
- 15 controls with varying effectiveness
- 6 audits with temporal data
- Business units, standards, issues, and incidents
- Temporal events showing graph evolution

## 📊 Data Format

AuditVerse accepts JSON data with the following structure:

```json
{
  "risks": [
    {
      "id": "risk1",
      "type": "risk",
      "name": "Data Breach",
      "category": "security",
      "inherent_likelihood": 8,
      "inherent_severity": 9,
      "residual_likelihood": 4,
      "residual_severity": 6,
      "description": "..."
    }
  ],
  "controls": [
    {
      "id": "ctrl1",
      "type": "control",
      "name": "Firewall",
      "effectiveness": 0.85,
      "description": "..."
    }
  ],
  "audits": [...],
  "relationships": [
    {
      "source": "ctrl1",
      "target": "risk1",
      "type": "mitigates"
    }
  ],
  "events": [
    {
      "date": "2024-01-15",
      "type": "risk_assessment",
      "entityId": "risk1",
      "changes": {
        "residual_likelihood": 3,
        "residual_severity": 5
      }
    }
  ]
}
```

### Supported Entity Types
- `risk` - Risk entities with inherent/residual ratings
- `control` - Control entities with effectiveness metrics
- `audit` - Audit entities with dates and status
- `issue` - Issue entities linked to controls/risks
- `incident` - Incident entities with impact ratings
- `standard` - Compliance standards (ISO, SOC2, etc.)
- `businessUnit` - Organizational units

### Supported Relationship Types
- `mitigates` - Control → Risk
- `assessed_by` - Audit → Risk
- `owned_by` - Risk → Business Unit
- `requires` - Risk → Standard
- `causes` - Incident → Risk
- `reports` - Issue → Control

### Temporal Event Types
- `risk_assessment` - Updates risk ratings
- `audit_completed` - Adds audit nodes
- `control_added` - Adds control nodes
- `control_removed` - Removes controls
- `incident_occurred` - Adds incident nodes
- `risk_mitigated` - Removes mitigated risks

## 🛠️ Development

### Available Commands

```bash
# Development
npm run dev          # Start dev server (port 5173+)
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm test             # Run tests (watch mode)
npm run test:watch   # Explicit watch mode
npx vitest run       # Run tests once

# Quality
npm run type-check   # TypeScript validation
npm run lint         # ESLint
```

### Project Structure

```
src/
├── components/
│   ├── graph/           # 3D graph, legend, tooltips
│   ├── filters/         # Preset views, multi-select filters
│   ├── panels/          # Details, stats, export
│   ├── timeline/        # Playback controls
│   ├── upload/          # File upload, welcome screen
│   └── shared/          # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Core libraries (visual encoding, filters, etc.)
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── styles/              # Global CSS and theme
```

### Tech Stack

- **Frontend**: React 18.2 + TypeScript 5.3
- **3D Rendering**: Three.js 0.160 + react-force-graph-3d 1.24
- **State Management**: Zustand 4.5
- **Visual Encoding**: D3 (scale, force-3d, chromatic)
- **Styling**: Tailwind CSS 3.4
- **Testing**: Vitest 1.0 + Testing Library
- **Build**: Vite 5.4

## 📈 Performance

AuditVerse is optimized for performance:

- ✅ **60+ FPS** at 51 nodes (sample data)
- ✅ **30+ FPS** target for 1000+ nodes
- ✅ **<100ms** filter update time
- ✅ **<50ms** node selection time
- ✅ **443KB** gzipped bundle size

### Performance Tips

For large datasets (1000+ nodes):
- Use preset views to focus on specific subsets
- Enable viewport culling (planned enhancement)
- Reduce link quality if needed
- Use the search filter to narrow results

## 🎨 Visual Design

AuditVerse uses a dark, glassmorphism design system:

### Color Palette
- **Background**: `#0c0c1a` (dark blue-black)
- **Primary**: `#00ffcc` (cyan)
- **Accent**: `#ff6600` (orange)
- **Success**: `#00ff99` (green)
- **Warning**: `#ffcc00` (yellow)
- **Danger**: `#ff0044` (red)

### Node Shapes
- Risk → Sphere
- Control → Cube
- Audit → Octahedron
- Issue → Cone
- Incident → Dodecahedron
- Standard → Torus
- Business Unit → Icosahedron

## 🧪 Testing

AuditVerse includes comprehensive test coverage:

- **65 unit tests** (all passing)
- **85% coverage** (target: 80%+)
- **31 visual encoding tests**
- **34 state management tests**

Run tests:
```bash
npm test
```

## 📝 Documentation

- **[REBUILD_SPEC_AI_AGENT.md](REBUILD_SPEC_AI_AGENT.md)** - Complete 15-phase specification
- **[CLAUDE.md](CLAUDE.md)** - AI agent development guidance
- **[PROGRESS_SUMMARY.md](PROGRESS_SUMMARY.md)** - Implementation progress
- **[PHASE10-15_COMPLETE.md](PHASE10-15_COMPLETE.md)** - Recent phases completion

## 🔒 Browser Requirements

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+
- **WebGL 2.0 required**

## 🚧 Roadmap

### Planned Enhancements
1. **Performance**
   - Code splitting with dynamic imports
   - Viewport culling for 2000+ nodes
   - InstancedMesh for shared geometry

2. **Features**
   - Custom preset creation UI
   - Graph comparison (side-by-side)
   - Animated preset transitions
   - 3D export (GLTF/OBJ)

3. **Analytics**
   - Usage tracking
   - Automated anomaly detection
   - Risk prediction models
   - Compliance gap analysis

4. **UX**
   - Interactive tutorial
   - Guided feature tours
   - Contextual help
   - Mobile support

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript strict mode
- 80%+ test coverage for new features
- ESLint compliance
- Visual encoding over positional encoding

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Three.js** - 3D WebGL rendering
- **D3.js** - Visual encoding and force simulation
- **react-force-graph** - 3D graph component
- **Zustand** - State management
- **Tailwind CSS** - Styling framework

## 📧 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check documentation files
- Review sample data format

---

**Built with ❤️ using React, Three.js, and TypeScript**

*Last Updated: 2025-10-05*
