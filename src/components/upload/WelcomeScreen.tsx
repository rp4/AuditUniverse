/**
 * Welcome Screen Component
 *
 * Glassmorphic landing page with privacy-first messaging
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { GraphData } from '@/types';

interface WelcomeScreenProps {
  onDataLoaded: (data: GraphData) => void;
}

export function WelcomeScreen({ onDataLoaded }: WelcomeScreenProps) {
  const {
    data,
    isLoading,
    error,
    uploadFile,
    loadSample
  } = useFileUpload();

  const [isDragOver, setIsDragOver] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const popupTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Call onDataLoaded when data is successfully loaded
  useEffect(() => {
    if (data && !error) {
      setIsExiting(true);
      setTimeout(() => {
        onDataLoaded(data);
      }, 300);
    }
  }, [data, error, onDataLoaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragOver(true);
    }
  }, [isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isLoading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.json')) {
        uploadFile(file);
      } else {
        alert('Please upload a JSON file');
      }
    }
  }, [isLoading, uploadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  const handleInfoEnter = useCallback(() => {
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    setShowPopup(true);
  }, []);

  const handleInfoLeave = useCallback(() => {
    popupTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full h-screen flex items-center justify-center z-[1000] transition-all duration-300 ${
        isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'url(/Auditverse.png) center/cover no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <div
        ref={containerRef}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="w-[90%] max-w-[42rem] p-12 transition-all duration-300"
        style={{
          border: isDragOver ? '1px solid rgba(99, 102, 241, 0.8)' : '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '1.5rem',
          background: isDragOver ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDragOver
            ? '0 8px 32px 0 rgba(99, 102, 241, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
            : '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Title Section */}
        <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          <span className="text-6xl">🚀</span>
          AuditVerse
        </h2>

        <p className="text-xl text-[#e5e7eb] text-center mb-8"
           style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
          A new, <span className="relative inline-block">
            <span>private</span>
            <button
              className="ml-1 inline-flex items-center justify-center"
              onMouseEnter={handleInfoEnter}
              onMouseLeave={handleInfoLeave}
              style={{ cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                <path d="M8 7V11M8 5H8.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
              </svg>
            </button>

            {/* Privacy Popup */}
            {showPopup && (
              <div
                onMouseEnter={handleInfoEnter}
                onMouseLeave={handleInfoLeave}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[400px] max-w-[90vw] z-[10000]"
                style={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '1.5rem',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <h3 className="text-xl font-semibold text-[#111827]">Your Privacy Matters</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#6b7280" strokeWidth="2"/>
                      <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="#6b7280" strokeWidth="2"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-[#374151]">Local Processing Only</h4>
                      <p className="text-sm text-[#6b7280]">All processing happens in your browser. Your data never leaves your device.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                      <ellipse cx="12" cy="5" rx="9" ry="3" stroke="#6b7280" strokeWidth="2"/>
                      <path d="M21 12C21 13.66 16.97 15 12 15C7.03 15 3 13.66 3 12" stroke="#6b7280" strokeWidth="2"/>
                      <path d="M3 5V19C3 20.66 7.03 22 12 22C16.97 22 21 20.66 21 19V5" stroke="#6b7280" strokeWidth="2"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-[#374151]">No Data Collection</h4>
                      <p className="text-sm text-[#6b7280]">We don't collect, store, or transmit any of your data. Period.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </span> way to visualize risk assessment
        </p>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/50"
               style={{
                 background: 'rgba(239, 68, 68, 0.1)',
                 backdropFilter: 'blur(10px)'
               }}>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          id="file-input"
          accept=".json,application/json"
          onChange={handleFileInput}
          disabled={isLoading}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <label
            htmlFor="file-input"
            className="flex-1 min-w-[13rem] px-8 py-4 text-lg font-medium rounded-xl text-white text-center cursor-pointer transition-all duration-300"
            style={{
              background: 'rgba(99, 102, 241, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(79, 70, 229, 0.9)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.8)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
            }}
          >
            Choose JSON File
          </label>

          <button
            onClick={loadSample}
            disabled={isLoading}
            className="flex-1 min-w-[13rem] px-8 py-4 text-lg font-medium rounded-xl text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
            }}
          >
            {isLoading ? 'Loading...' : 'Try Demo'}
          </button>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-center gap-6">
          <a
            href="https://github.com/rp4/AuditUniverse"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>

          {/* Hidden ChatGPT icon - can be enabled later */}
          {/* <a
            href="https://chat.openai.com/g/g-example"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
            </svg>
          </a> */}

          {/* Hidden trophy emoji - can be enabled later */}
          {/* <span className="text-3xl transition-all duration-300 cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
            🏆
          </span> */}

          <a
            href="https://audittoolbox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-3xl transition-all duration-300 cursor-pointer inline-block"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🧰
          </a>
        </div>
      </div>
    </div>
  );
}
