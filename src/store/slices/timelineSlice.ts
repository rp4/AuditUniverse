/**
 * Timeline Slice
 *
 * State management for temporal filtering and playback:
 * - Current date (timeline position)
 * - Date range (min/max)
 * - Playback state (playing/paused)
 * - Playback speed
 */

import type { StateCreator } from 'zustand';
import { logger } from '../../lib/logger';

export interface TimelineSlice {
  // Current timeline position
  currentDate: Date;

  // Date range
  minDate: Date;
  maxDate: Date;

  // Playback state
  isPlaying: boolean;
  speed: number; // Multiplier: 0.5x, 1x, 2x, 5x, 10x

  // Playback interval ID (for cleanup)
  playbackIntervalId: number | null;

  // Actions
  setCurrentDate: (date: Date) => void;
  setDateRange: (minDate: Date, maxDate: Date) => void;
  setSpeed: (speed: number) => void;

  play: () => void;
  pause: () => void;
  reset: () => void;
  togglePlayPause: () => void;

  // Internal: advance to next date
  advanceDate: () => void;
}

// Default date range (current year)
const now = new Date();
const DEFAULT_MIN_DATE = new Date(now.getFullYear(), 0, 1); // Jan 1
const DEFAULT_MAX_DATE = new Date(now.getFullYear(), 11, 31); // Dec 31

export const createTimelineSlice: StateCreator<TimelineSlice> = (set, get) => ({
  // Initial state
  currentDate: new Date(DEFAULT_MIN_DATE),
  minDate: DEFAULT_MIN_DATE,
  maxDate: DEFAULT_MAX_DATE,
  isPlaying: false,
  speed: 1,
  playbackIntervalId: null,

  // Set current date
  setCurrentDate: (date) => {
    const { minDate, maxDate } = get();
    // Clamp to valid range
    const clamped = new Date(
      Math.max(minDate.getTime(), Math.min(maxDate.getTime(), date.getTime()))
    );
    set({ currentDate: clamped });
  },

  // Set date range
  setDateRange: (minDate, maxDate) => {
    set({ minDate, maxDate });

    // Ensure current date is within new range
    const { currentDate } = get();
    if (currentDate < minDate) {
      set({ currentDate: new Date(minDate) });
    } else if (currentDate > maxDate) {
      set({ currentDate: new Date(maxDate) });
    }
  },

  // Set playback speed
  setSpeed: (speed) => {
    set({ speed });

    // If playing, restart with new speed
    const { isPlaying, pause, play } = get();
    if (isPlaying) {
      pause();
      play();
    }
  },

  // Start playback
  play: () => {
    const { isPlaying, speed, playbackIntervalId } = get();

    // Clear any existing interval first to prevent leaks
    if (playbackIntervalId !== null) {
      window.clearInterval(playbackIntervalId);
    }

    // Don't start if already playing
    if (isPlaying) return;

    // Calculate interval based on speed
    // Base: 1 month per 1000ms at 1x speed
    const baseInterval = 1000;
    const interval = baseInterval / speed;

    // Start interval with error handling
    const id = window.setInterval(() => {
      try {
        get().advanceDate();
      } catch (error) {
        logger.error('Timeline advance failed', error as Error, {
          component: 'timelineSlice',
        });
        // Stop playback on error
        get().pause();
      }
    }, interval);

    set({ isPlaying: true, playbackIntervalId: id });
  },

  // Pause playback
  pause: () => {
    const { playbackIntervalId } = get();

    if (playbackIntervalId !== null) {
      window.clearInterval(playbackIntervalId);
    }

    set({ isPlaying: false, playbackIntervalId: null });
  },

  // Reset to start
  reset: () => {
    const { pause, minDate } = get();
    pause();
    set({ currentDate: new Date(minDate) });
  },

  // Toggle play/pause
  togglePlayPause: () => {
    const { isPlaying, play, pause } = get();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },

  // Advance to next date (internal)
  advanceDate: () => {
    const { currentDate, minDate, maxDate } = get();

    // Advance by 1 month
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);

    // Check if reached end
    if (next > maxDate) {
      // Loop back to start
      set({ currentDate: new Date(minDate) });
    } else {
      set({ currentDate: next });
    }
  }
});
