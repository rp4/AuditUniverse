/**
 * Welcome Screen Component
 *
 * Initial screen for file upload and sample data loading
 */

import { DragDropZone } from './DragDropZone';
import { useFileUpload } from '@/hooks/useFileUpload';
import { formatValidationErrors } from '@/lib/dataValidator';
import type { GraphData } from '@/types';

interface WelcomeScreenProps {
  onDataLoaded: (data: GraphData) => void;
}

export function WelcomeScreen({ onDataLoaded }: WelcomeScreenProps) {
  const {
    data,
    isLoading,
    error,
    validationResult,
    uploadFile,
    loadSample
  } = useFileUpload();

  // Call onDataLoaded when data is successfully loaded
  if (data && !error) {
    onDataLoaded(data);
  }

  return (
    <div className="min-h-screen bg-av-background flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-av-primary mb-4">
            AuditVerse
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            3D Force-Directed Graph Visualization
          </p>
          <p className="text-sm text-gray-500">
            Visualize enterprise risk & audit data with visual encoding
          </p>
        </div>

        {/* Main Upload Area */}
        <div className="glass rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Get Started
          </h2>

          {/* Drag & Drop Zone */}
          <DragDropZone
            onFileSelect={uploadFile}
            disabled={isLoading}
          />

          {/* Or Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-av-panel-dark text-gray-400">or</span>
            </div>
          </div>

          {/* Load Sample Data Button */}
          <button
            onClick={loadSample}
            disabled={isLoading}
            className="w-full btn-primary py-4 px-6 rounded-lg font-semibold text-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Load Sample Data
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Includes 20 risks, 15 controls, 6 audits, and temporal events
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-dark rounded-lg p-6 mb-6 border-2 border-red-500/50">
            <div className="flex items-start gap-3">
              <svg
                className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-400 font-semibold mb-2">Error Loading Data</h3>
                <p className="text-gray-300 text-sm mb-3">{error}</p>

                {validationResult && !validationResult.isValid && (
                  <pre className="text-xs text-gray-400 bg-black/30 p-3 rounded overflow-x-auto">
                    {formatValidationErrors(validationResult)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Validation Warnings */}
        {validationResult && validationResult.isValid && validationResult.warnings.length > 0 && (
          <div className="glass-dark rounded-lg p-6 mb-6 border-2 border-yellow-500/50">
            <div className="flex items-start gap-3">
              <svg
                className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-yellow-400 font-semibold mb-2">
                  Data Loaded with Warnings
                </h3>
                <p className="text-xs text-gray-400">
                  {validationResult.warnings.length} warning(s) found - data is usable but may have issues
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-dark rounded-lg p-4 text-center">
            <div className="text-av-primary text-3xl mb-2">📊</div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">Visual Encoding</h3>
            <p className="text-xs text-gray-500">
              Color = Likelihood<br />
              Size = Severity<br />
              Opacity = Age
            </p>
          </div>

          <div className="glass-dark rounded-lg p-4 text-center">
            <div className="text-av-accent text-3xl mb-2">🔗</div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">Relationships</h3>
            <p className="text-xs text-gray-500">
              Controls mitigate risks<br />
              Audits assess coverage<br />
              Natural clustering
            </p>
          </div>

          <div className="glass-dark rounded-lg p-4 text-center">
            <div className="text-av-success text-3xl mb-2">⏱️</div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">Timeline</h3>
            <p className="text-xs text-gray-500">
              Temporal playback<br />
              Event-driven changes<br />
              Historical analysis
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-600">
          <p>Built with Three.js, React, and D3 • Visual encoding over positional encoding</p>
        </div>
      </div>
    </div>
  );
}
