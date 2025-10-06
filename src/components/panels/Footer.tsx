/**
 * Footer Component
 *
 * Bottom bar containing:
 * - Timeline playback controls (play/pause, scrubber, date, speed)
 * - Export button (bottom-right corner)
 */

import { useGraphStore } from '@/store/graphStore';

interface FooterProps {
  hasTemporalData: boolean;
  onExportClick: () => void;
}

export function Footer({ hasTemporalData, onExportClick }: FooterProps) {
  const {
    currentDate,
    minDate,
    maxDate,
    isPlaying,
    speed,
    play,
    pause,
    reset,
    setSpeed,
    setCurrentDate
  } = useGraphStore();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timestamp = parseInt(e.target.value);
    setCurrentDate(new Date(timestamp));
  };

  const progress = maxDate.getTime() === minDate.getTime()
    ? 0
    : ((currentDate.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;

  return (
    <div className="relative metal-panel px-6 py-3" style={{
      borderTop: '8px solid #4a4a4f',
      borderTopStyle: 'groove',
      boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.8), inset 0 -3px 10px rgba(80,80,80,0.3), 0 -5px 15px rgba(0,0,0,0.6)'
    }}>
      {/* Corner rivets (15px) */}
      <div className="absolute top-2 left-2 w-[15px] h-[15px] rivet" />
      <div className="absolute top-2 right-2 w-[15px] h-[15px] rivet" />
      <div className="absolute bottom-2 left-2 w-[15px] h-[15px] rivet" />
      <div className="absolute bottom-2 right-2 w-[15px] h-[15px] rivet" />

      {/* Bottom label */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full text-[10px] uppercase tracking-widest font-bold mt-1" style={{
        fontFamily: 'Orbitron, monospace',
        color: '#00ffcc',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        letterSpacing: '1.5px'
      }}>
        Likelihood
      </div>

      <div className="flex items-center gap-4 w-full">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={reset}
            className="p-2 btn-outset rounded disabled:opacity-50"
            title="Reset to start"
            disabled={!hasTemporalData}
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>

          <button
            onClick={isPlaying ? pause : play}
            className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: '#00ffcc',
              border: '3px solid #00aa99',
              borderStyle: 'outset',
              boxShadow: '3px 3px 6px rgba(0,0,0,0.6), -1px -1px 3px rgba(80,80,80,0.3), 0 0 8px rgba(0,255,204,0.4)'
            }}
            title={isPlaying ? 'Pause' : 'Play'}
            disabled={!hasTemporalData}
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            className="p-2 btn-outset rounded disabled:opacity-50"
            title="Fast forward"
            disabled={!hasTemporalData}
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
            </svg>
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1">
          <input
            type="range"
            min={hasTemporalData ? minDate.getTime() : 0}
            max={hasTemporalData ? maxDate.getTime() : 100}
            value={hasTemporalData ? currentDate.getTime() : 0}
            onChange={handleDateChange}
            disabled={!hasTemporalData}
            className="slider-industrial w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: '#1a1a1f',
              border: '1px solid #2a2a2f',
              borderStyle: 'inset',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
            }}
          />
        </div>

        {/* Date Display */}
        <div className="relative panel-outset px-4 py-2 min-w-[120px] text-center flex-shrink-0">
          {/* Corner rivets (6px) */}
          <div className="absolute top-0.5 left-0.5 w-[6px] h-[6px] rivet" />
          <div className="absolute top-0.5 right-0.5 w-[6px] h-[6px] rivet" />
          <div className="absolute bottom-0.5 left-0.5 w-[6px] h-[6px] rivet" />
          <div className="absolute bottom-0.5 right-0.5 w-[6px] h-[6px] rivet" />

          <div className="text-lg font-bold" style={{
            fontFamily: 'Orbitron, monospace',
            color: '#00ffdd',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            letterSpacing: '0.5px'
          }}>
            {hasTemporalData
              ? `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`
              : '01/2023'
            }
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <span className="text-xs text-gray-500 mr-1">Speed:</span>
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              disabled={!hasTemporalData}
              className={`px-2 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                speed === s ? '' : 'btn-outset'
              }`}
              style={speed === s ? {
                background: '#00ffcc',
                border: '3px solid #00aa99',
                borderStyle: 'inset',
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.6), inset -1px -1px 2px rgba(80,80,80,0.3), 0 0 6px rgba(0,255,204,0.6)',
                color: '#000',
                fontWeight: 'bold',
                fontFamily: 'Orbitron, monospace'
              } : {
                color: '#9ca3af'
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Export Button */}
        <button
          onClick={onExportClick}
          className="relative font-bold px-6 py-2 uppercase tracking-wider text-sm flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #3a3a3f 0%, #2a2a2f 100%)',
            border: '3px solid #4a4a4f',
            borderStyle: 'outset',
            borderRadius: '3px',
            boxShadow: '3px 3px 6px rgba(0,0,0,0.6), -1px -1px 3px rgba(80,80,80,0.3), inset 0 0 2px rgba(0,0,0,0.2)',
            fontFamily: 'Orbitron, monospace',
            letterSpacing: '2px',
            color: '#00ffdd'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.borderStyle = 'inset';
            e.currentTarget.style.transform = 'translateY(1px)';
            e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,0.6), inset -1px -1px 2px rgba(80,80,80,0.3)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.borderStyle = 'outset';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0,0,0,0.6), -1px -1px 3px rgba(80,80,80,0.3), inset 0 0 2px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderStyle = 'outset';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0,0,0,0.6), -1px -1px 3px rgba(80,80,80,0.3), inset 0 0 2px rgba(0,0,0,0.2)';
          }}
        >
          Export
        </button>
      </div>
    </div>
  );
}
