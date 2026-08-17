/**
 * Base mock client. Each module's api/ folder wraps this with its own
 * domain functions (e.g. modules/doctor-portal/api/schedule.ts).
 *
 * WHEN THE REAL BACKEND IS READY: this is the only file that changes.
 * Swap `mockRequest` internals for real fetch() against the API Gateway —
 * every module's api/ file keeps working unchanged since they only call
 * this shared helper, never fetch() directly.
 */
const LATENCY = 250;

export function mockRequest<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), LATENCY));
}

// Later:
// const API_BASE = import.meta.env.VITE_API_BASE_URL;
// export async function apiRequest<T>(path: string, opts?: RequestInit): Promise<T> {
//   const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: authHeaders() });
//   if (!res.ok) throw new ApiError(res.status, await res.text());
//   return res.json();
// }
