// Nursing Portal's mock data/API layer — split by domain so no single file
// holds the whole module (same convention as Doctor Portal). Every consumer
// keeps importing from this one barrel
// (`import * as api from "@modules/nursing-ipd/api"`), so which physical
// file a symbol lives in is an internal detail, not part of the public
// surface.
//
// Dependency order: patients (core — patients, shift, ward, no internal
// dependencies) → medications (imports patients' syncNextMedication) →
// assessments (imports patients' getMyPatients + syncAssessmentDue) → tasks
// (imports patients' syncPendingTasks). Each file imports directly from its
// specific dependency, never through this barrel, so there's no circular import.
export * from "./patients";
export * from "./medications";
export * from "./assessments";
export * from "./tasks";
export * from "./notes";
export * from "./carePlans";
export * from "./alerts";
export * from "./handover";
export * from "./discharge";
export * from "./rounds";
export * from "./safety";
export * from "./procedures";
export * from "./orders";
export * from "./transfers";
export * from "./beds";
export * from "./careTeam";
export * from "./documents";
export * from "./messages";
export * from "./notifications";
export * from "./settings";
