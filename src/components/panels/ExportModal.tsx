/**
 * Export Modal Component
 *
 * Modal for exporting graph data in various formats
 */

import { useState } from 'react';
import { exportJSON, exportCSV, exportGraphML } from '@/lib/exporters';
import type { GraphData } from '@/types';

interface ExportModalProps {
  data: GraphData;
  onClose: () => void;
}

export function ExportModal({ data, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'csv' | 'graphml'>('json');

  const handleExport = () => {
    switch (format) {
      case 'json':
        exportJSON(data);
        break;
      case 'csv':
        exportCSV(data);
        break;
      case 'graphml':
        exportGraphML(data);
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="glass-panel p-6 border border-av-border max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-av-primary">Export Data</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Export Format</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 rounded border border-av-border hover:bg-av-panel-dark cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  className="text-av-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-300">JSON</div>
                  <div className="text-xs text-gray-600">Complete graph data</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded border border-av-border hover:bg-av-panel-dark cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="text-av-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-300">CSV</div>
                  <div className="text-xs text-gray-600">Nodes only (spreadsheet)</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded border border-av-border hover:bg-av-panel-dark cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="graphml"
                  checked={format === 'graphml'}
                  onChange={() => setFormat('graphml')}
                  className="text-av-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-300">GraphML</div>
                  <div className="text-xs text-gray-600">For Gephi/Cytoscape</div>
                </div>
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="p-3 bg-av-panel-dark rounded border border-av-border">
            <div className="text-xs text-gray-500 mb-1">Export will include:</div>
            <div className="text-sm text-gray-300">
              {data.nodes.length} nodes, {data.links.length} links
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="flex-1 btn-primary py-2 rounded font-semibold"
            >
              Export
            </button>
            <button
              onClick={onClose}
              className="flex-1 btn-secondary py-2 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
