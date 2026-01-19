/**
 * Utility to get the correct API URL for both client-side and server-side fetching.
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  }
  
  // Server-side: use internal API_URL (e.g. http://api:3000/api)
  // If not provided, fallback to NEXT_PUBLIC_API_URL
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3000/api';
}
