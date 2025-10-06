/**
 * WebGL capability detection utility
 * Detects WebGL support and provides user-friendly error messages
 */

export interface WebGLSupport {
  supported: boolean;
  version: number;
  message?: string;
  renderer?: string;
}

/**
 * Detects WebGL support in the current browser
 * @returns WebGLSupport object with detection results
 */
export function detectWebGLSupport(): WebGLSupport {
  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (gl2) {
      const debugInfo = gl2.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo
        ? gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : 'Unknown';

      return {
        supported: true,
        version: 2,
        renderer,
      };
    }

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : 'Unknown';

      return {
        supported: true,
        version: 1,
        renderer,
        message: 'WebGL 1.0 detected. Some features may not work optimally. WebGL 2.0 is recommended.',
      };
    }

    return {
      supported: false,
      version: 0,
      message: 'WebGL is not supported or has been disabled in your browser. Please enable WebGL or use a modern browser like Chrome, Firefox, or Edge.',
    };
  } catch (error) {
    return {
      supported: false,
      version: 0,
      message: 'WebGL detection failed. Your browser may not support 3D graphics or WebGL may be disabled.',
    };
  }
}

/**
 * Returns user-friendly instructions for enabling WebGL
 */
export function getWebGLInstructions(): string {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('chrome')) {
    return 'In Chrome: Go to chrome://settings/system and enable "Use hardware acceleration when available"';
  } else if (userAgent.includes('firefox')) {
    return 'In Firefox: Type about:config in the address bar, search for webgl.disabled, and set it to false';
  } else if (userAgent.includes('safari')) {
    return 'In Safari: Go to Preferences > Advanced and enable "Show Develop menu", then check Develop > Experimental Features > WebGL 2.0';
  } else if (userAgent.includes('edge')) {
    return 'In Edge: Go to edge://settings/system and enable "Use hardware acceleration when available"';
  }

  return 'Please check your browser settings to enable hardware acceleration and WebGL support.';
}
