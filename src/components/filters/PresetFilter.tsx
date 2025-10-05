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
        className="w-full flex items-center justify-between p-3 bg-av-panel-dark border border-av-border rounded hover:border-av-primary transition-colors"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-av-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-sm font-medium text-gray-300">{activePresetLabel}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-panel border border-av-border rounded max-h-96 overflow-y-auto z-20">
          {/* Default View */}
          <button
            onClick={() => handlePresetSelect('default')}
            className={`w-full text-left p-3 border-b border-av-border hover:bg-av-panel-dark transition-colors ${
              activePreset === 'default' ? 'bg-av-primary/10 border-l-2 border-l-av-primary' : ''
            }`}
          >
            <div className="font-medium text-sm text-gray-300">Default View</div>
            <div className="text-xs text-gray-600 mt-0.5">All entities and relationships</div>
          </button>

          {/* Preset Groups */}
          {PRESET_GROUPS.map(group => (
            <div key={group.category}>
              <div className="px-3 py-2 bg-av-panel-dark border-b border-av-border">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {group.category}
                </h4>
              </div>
              {group.presets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`w-full text-left p-3 border-b border-av-border last:border-b-0 hover:bg-av-panel-dark transition-colors ${
                    activePreset === preset.id ? 'bg-av-primary/10 border-l-2 border-l-av-primary' : ''
                  }`}
                >
                  <div className="font-medium text-sm text-gray-300">{preset.label}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{preset.description}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
