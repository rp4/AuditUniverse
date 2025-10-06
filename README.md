# AuditVerse

AuditVerse is an interactive 3D visualization tool that transforms complex enterprise risk and audit data into an intuitive force-directed graph. Using visual encoding principles, it helps auditors, risk managers, and executives understand risk landscapes, control coverage, and relationship patterns at a glance.

## 🌟 Key Features

### Advanced Analytics
- ** Preset Views** across 3 categories:
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


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.


---

<p align="center">
  Made with ❤️ by <a href="https://www.audittoolbox.com/">AuditToolbox</a> • 
</p>
