/**
 * Loading Spinner Component
 *
 * Displays a loading spinner with optional message
 */

interface LoadingSpinnerProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({ message = 'Loading...', fullscreen = false }: LoadingSpinnerProps) {
  const containerClass = fullscreen
    ? 'fixed inset-0 flex items-center justify-center bg-av-background z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-av-primary border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-gray-400">{message}</div>
      </div>
    </div>
  );
}
