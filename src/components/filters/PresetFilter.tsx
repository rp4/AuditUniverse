/**
 * Preset Filter Component
 *
 * Dropdown for selecting predefined analytical views.
 * 13 presets grouped by category: Coverage, Hotspots, Planning.
 */

import { useState } from 'react';
import { useGraphStore } from '@/store/graphStore';
import type { PresetId } from '@/types';

interface PresetOption {
  id: PresetId;
  label: string;
  description: string;
}

interface PresetGroup {
  category: string;
  presets: PresetOption[];
}

const PRESET_GROUPS: PresetGroup[] = [
  {
    category: 'Coverage Analysis',
    presets: [
      { id: 'uncontrolled-risks', label: 'Uncontrolled Risks', description: 'Risks with no mitigating controls' },
      { id: 'unaudited-risks', label: 'Unaudited Risks', description: 'Risks with no audit coverage' },
      { id: 'unmonitored-standards', label: 'Unmonitored Standards', description: 'Standards without monitoring' },
      { id: 'audit-blind-spots', label: 'Audit Blind Spots', description: 'Business units without audits' }
    ]
  },
  {
    category: 'Hotspot Detection',
    presets: [
      { id: 'high-issue-risks', label: 'High Issue Risks', description: 'Risks with most reported issues' },
      { id: 'high-incident-risks', label: 'High Incident Risks', description: 'Risks with incident history' },
      { id: 'failed-controls', label: 'Failed Controls', description: 'Controls with low effectiveness' },
      { id: 'high-residual-risk', label: 'High Residual Risk', description: 'Critical risks (rating > 49)' }
    ]
  },
  {
    category: 'Planning & Compliance',
    presets: [
      { id: 'standard-violations', label: 'Standard Violations', description: 'Standards with most risks' },
      { id: 'regulatory-exposure', label: 'Regulatory Exposure', description: 'High regulatory compliance risks' },
      { id: 'enterprise-risk-profile', label: 'Enterprise Risk Profile', description: 'Top 20 risks by rating' },
      { id: 'audit-coverage', label: 'Audit Universe Coverage', description: 'Full audit coverage view' }
    ]
  }
];

export function PresetFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const activePreset = useGraphStore(state => state.activePreset);
  const setActivePreset = useGraphStore(state => state.setActivePreset);

  const handlePresetSelect = (presetId: PresetId) => {
    setActivePreset(presetId);
    setIsOpen(false);
  };

  const activePresetLabel = PRESET_GROUPS
    .flatMap(g => g.presets)
    .find(p => p.id === activePreset)?.label || 'Default View';

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="panel-outset w-full flex items-center justify-between px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
      >
        <span>{activePresetLabel}</span>
        <svg
          className={`w-3 h-3 ml-2 text-av-primary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 max-h-96 overflow-y-auto z-50 min-w-[300px]" style={{
            background: 'linear-gradient(135deg, #2a2a2f 0%, #1a1a1f 100%)',
            border: '2px solid #4a4a4f',
            borderStyle: 'inset',
            borderRadius: '3px',
            boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.6), inset -1px -1px 2px rgba(60,60,60,0.3), 0 4px 12px rgba(0,0,0,0.8)'
          }}>
            {/* Default View */}
            <button
              onClick={() => handlePresetSelect('default')}
              className={`w-full text-left px-3 py-2 hover:bg-gray-700/30 transition-colors border-b-2 border-gray-700/50 ${
                activePreset === 'default' ? 'bg-gray-700/40' : ''
              }`}
            >
              <div className="font-medium text-sm text-gray-300">Default View</div>
              <div className="text-xs text-gray-500 mt-0.5">All entities and relationships</div>
            </button>

            {/* Preset Groups */}
            {PRESET_GROUPS.map(group => (
              <div key={group.category}>
                <div className="px-3 py-2 border-b-2 border-gray-700/50" style={{
                  background: 'linear-gradient(135deg, #252528 0%, #1f1f22 100%)'
                }}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider" style={{
                    fontFamily: 'Orbitron, monospace',
                    color: '#8ab4f8',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {group.category}
                  </h4>
                </div>
                {group.presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700/30 transition-colors border-b border-gray-700/30 last:border-b-0 ${
                      activePreset === preset.id ? 'bg-gray-700/40' : ''
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-300">{preset.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{preset.description}</div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
