/**
 * Helper utility to determine the correct target backend URL dynamically.
 * Helps keep front-end logic robust across absolute, relative, native,
 * and third-party hosting deployments (like Vercel).
 */
export function getApiUrl(path: string): string {
  // If path already starts with http/https, return it
  if (path.startsWith('http')) return path;

  // Ensure path starts with a slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Check if running on localhost or the native Cloud Run deployment
  const hostname = window.location.hostname;
  const isNative = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('run.app');

  if (isNative) {
    return cleanPath;
  }

  // If a custom API URL is provided in the build environment, use it
  const customApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (customApiUrl) {
    const cleanBase = customApiUrl.endsWith('/') ? customApiUrl.slice(0, -1) : customApiUrl;
    return `${cleanBase}${cleanPath}`;
  }

  // Fallback directly to the live container endpoint for this applet
  const fallbackBase = "https://ais-pre-sfmibnnqnbsnb3cvrwir6j-158126767579.europe-west2.run.app";
  return `${fallbackBase}${cleanPath}`;
}
