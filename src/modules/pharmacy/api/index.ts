// Pharmacy Portal api layer — split by domain, pure barrel re-export.
// Dependency order: patients, orders, inventory (no internal deps) →
// dispensing (imports inventory + orders), recalls (imports inventory),
// procurement (imports inventory) → everything else (no internal deps).
// Each file imports directly from its dependency, never through this
// barrel, so there's no circular import.
export * from "./patients";
export * from "./orders";
export * from "./inventory";
export * from "./dispensing";
export * from "./interventions";
export * from "./adr";
export * from "./reconciliation";
export * from "./formulary";
export * from "./controlledMeds";
export * from "./recalls";
export * from "./procurement";
export * from "./compounding";
export * from "./audit";
export * from "./settings";
