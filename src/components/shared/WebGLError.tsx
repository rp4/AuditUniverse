import { getWebGLInstructions } from '../../utils/webglDetection';

interface WebGLErrorProps {
  message: string;
}

export function WebGLError({ message }: WebGLErrorProps): JSX.Element {
  const instructions = getWebGLInstructions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-black/80 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">
              WebGL Not Available
            </h1>
            <p className="text-gray-300 text-lg">{message}</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-cyan-400 mb-3">
            How to Enable WebGL
          </h2>
          <p className="text-gray-300 mb-4">{instructions}</p>
          <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
            <li>Ensure your graphics drivers are up to date</li>
            <li>Try using a different browser (Chrome, Firefox, or Edge recommended)</li>
            <li>Check if hardware acceleration is enabled in your browser settings</li>
            <li>Disable any browser extensions that might block WebGL</li>
          </ul>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            System Requirements
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+</li>
            <li>• WebGL 2.0 support (WebGL 1.0 may work with limitations)</li>
            <li>• Hardware acceleration enabled</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 px-6 py-3 rounded-lg font-medium transition-all"
          >
            Retry
          </button>
          <a
            href="https://get.webgl.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600 text-gray-300 px-6 py-3 rounded-lg font-medium transition-all text-center"
          >
            Test WebGL
          </a>
        </div>
      </div>
    </div>
  );
}
