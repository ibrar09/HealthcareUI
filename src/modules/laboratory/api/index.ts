// Laboratory Portal api layer — split by domain, pure barrel re-export.
// Dependency order: patients, tests (no internal deps) → orders (no
// internal deps) → specimens (imports orders), results (imports tests +
// orders) → criticalResults, analyzers, qc, inventory, rejections,
// billing, audit, settings (no internal deps). Each file imports
// directly from its dependency, never through this barrel.
export * from "./patients";
export * from "./tests";
export * from "./orders";
export * from "./specimens";
export * from "./results";
export * from "./criticalResults";
export * from "./analyzers";
export * from "./qc";
export * from "./inventory";
export * from "./rejections";
export * from "./billing";
export * from "./audit";
export * from "./settings";
