/**
 * Timeline Controls Component
 *
 * Play/pause/reset controls for temporal playback
 * Date display and scrubber
 * Speed selector
 */

import { useGraphStore } from '@/store/graphStore';

export function TimelineControls() {
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
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass-panel p-4 border border-av-border w-96">
      {/* Date Display */}
      <div className="text-center mb-3">
        <div className="text-2xl font-bold text-av-primary">
          {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
        <div className="text-xs text-gray-500">
          {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="mb-3">
        <input
          type="range"
          min={minDate.getTime()}
          max={maxDate.getTime()}
          value={currentDate.getTime()}
          onChange={handleDateChange}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
        <div className="relative h-1 -mt-1">
          <div
            className="absolute h-1 bg-av-primary rounded-l-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={reset}
            className="p-2 hover:bg-av-panel-dark rounded transition-colors"
            title="Reset to start"
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>

          <button
            onClick={isPlaying ? pause : play}
            className="p-2 bg-av-primary hover:bg-av-primary/80 rounded transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-av-background" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-av-background" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 mr-2">Speed:</span>
          {[0.5, 1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                speed === s
                  ? 'bg-av-primary text-av-background'
                  : 'bg-av-panel-dark text-gray-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
