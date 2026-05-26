const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// Ensure the base URL always ends with /api/v1 regardless of what the env provides
const API_BASE_URL = RAW_BASE.endsWith('/api/v1') ? RAW_BASE : `${RAW_BASE.replace(/\/$/, '')}/api/v1`;

export class APIError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'APIError';
  }
}

interface FetchOptions extends RequestInit {
  token?: string | null;
}

/**
 * A robust fetch wrapper that automatically grabs the Clerk JWT and injects it into the headers.
 * 
 * In Server Components/Actions: You can call this directly without passing a token, it will use `auth().getToken()`.
 * In Client Components: You MUST pass the token explicitly obtained via `useAuth().getToken()`.
 */
export async function fetchAPI<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers: customHeaders, ...restOptions } = options;
  
  let authToken = token;

  // If no token is provided and we are on the server, dynamically import Clerk's server auth
  if (!authToken && typeof window === 'undefined') {
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const authObj = await auth();
      authToken = await authObj.getToken();
    } catch (error) {
      console.warn("Could not retrieve Clerk token on the server:", error);
    }
  }

  const headers = new Headers(customHeaders);
  
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  if (!headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    headers,
    ...restOptions,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    throw new APIError(errorData.detail || errorData.message || 'API request failed', response.status, errorData);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
