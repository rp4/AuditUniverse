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
    <div className="bg-gray-900/95 border-t border-av-border/50 px-6 py-3">
      <div className="flex items-center gap-6">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={reset}
            className="p-2 hover:bg-av-panel-dark rounded transition-colors"
            title="Reset to start"
            disabled={!hasTemporalData}
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>

          <button
            onClick={isPlaying ? pause : play}
            className="p-2 bg-av-primary hover:bg-av-primary/80 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="p-2 hover:bg-av-panel-dark rounded transition-colors"
            title="Fast forward"
            disabled={!hasTemporalData}
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
            </svg>
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1 max-w-2xl">
          <input
            type="range"
            min={hasTemporalData ? minDate.getTime() : 0}
            max={hasTemporalData ? maxDate.getTime() : 100}
            value={hasTemporalData ? currentDate.getTime() : 0}
            onChange={handleDateChange}
            disabled={!hasTemporalData}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-thumb disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Date Display */}
        <div className="bg-black/40 border border-av-border/30 rounded px-4 py-2 min-w-[120px] text-center">
          <div className="text-lg font-bold text-av-primary">
            {hasTemporalData
              ? `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`
              : '01/2023'
            }
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 mr-1">Speed:</span>
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              disabled={!hasTemporalData}
              className={`px-2 py-1 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                speed === s
                  ? 'bg-av-primary text-black font-bold'
                  : 'bg-av-panel-dark text-gray-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Export Button */}
        <button
          onClick={onExportClick}
          className="bg-av-primary hover:bg-av-primary/80 text-black font-bold px-6 py-2 rounded uppercase tracking-wider text-sm transition-colors"
        >
          Export
        </button>
      </div>
    </div>
  );
}
