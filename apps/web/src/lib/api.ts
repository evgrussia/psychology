/**
 * Utility to get the correct API URL for both client-side and server-side fetching.
 */
export function getApiUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return publicUrl || 'http://localhost:8080/api';
  }
  
  // Server-side: use internal API_URL (e.g. http://api:3000/api)
  // If not provided, fallback to NEXT_PUBLIC_API_URL
  if (publicUrl && process.env.NODE_ENV !== 'production') {
    return publicUrl;
  }
  return process.env.API_URL || publicUrl || 'http://api:3000/api';
}
