/**
 * Centralized API base URL — controlled by NEXT_PUBLIC_API_BASE_URL env var.
 * To switch backends, update the value in .env (and on Vercel dashboard).
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || '';
