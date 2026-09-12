// lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "error1";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}
