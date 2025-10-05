/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AuditVerse design system
        'av-background': '#0c0c1a',
        'av-primary': '#00ffcc',      // Cyan
        'av-accent': '#ff6600',       // Orange
        'av-success': '#00ff99',      // Green
        'av-warning': '#ffcc00',      // Yellow
        'av-danger': '#ff0044',       // Red
        'av-purple': '#9966ff',       // Purple
        'av-pink': '#ff0099',         // Pink
        'av-panel-dark': '#1a1a2e',
        'av-panel-medium': '#2a2a2f',
        'av-border': '#4a4a4f',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
