/**
 * Single place that reads Vite env vars. Modules import from here,
 * never call `import.meta.env` directly — keeps env var names
 * consistent and makes it obvious what's configurable.
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API !== "false", // default true until backend Phase 1 is live
  ENVIRONMENT: import.meta.env.MODE, // "development" | "production"
};
