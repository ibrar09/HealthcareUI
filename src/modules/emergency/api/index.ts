// Emergency Portal api layer — split by domain, pure barrel re-export.
// Dependency order: patients, encounters (core, no internal deps) →
// beds, triage, criticalResults (import encounters) → orders (imports
// encounters + criticalResults), disposition (imports encounters + beds)
// → procedures, monitoring, consultations, ambulance, audit, settings
// (no internal deps). Each file imports directly from its dependency,
// never through this barrel.
export * from "./patients";
export * from "./encounters";
export * from "./beds";
export * from "./triage";
export * from "./criticalResults";
export * from "./orders";
export * from "./disposition";
export * from "./procedures";
export * from "./monitoring";
export * from "./consultations";
export * from "./ambulance";
export * from "./audit";
export * from "./settings";
