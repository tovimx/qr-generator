export function generateShortCode(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Resolve the app base URL safely in both client and server contexts
export function getAppBaseUrl(): string {
  // Prefer the browser origin when rendering on the client
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // Fallback to public env vars available to the client bundle
  const envUrl =
    (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  if (envUrl) return envUrl;

  // Last resort for local development
  return 'http://localhost:3000';
}

export function getQRCodeUrl(shortCode: string, opts?: { host?: string }): string {
  const baseUrl = opts?.host
    ? opts.host.replace(/\/$/, '')
    : getAppBaseUrl()
  return `${baseUrl}/q/${shortCode}`
}
