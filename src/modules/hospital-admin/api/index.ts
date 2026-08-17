// Hospital Admin's mock data/API layer — split by domain so no single file
// holds the whole module. Every consumer keeps importing from this one
// barrel (`import * as api from "@modules/hospital-admin/api"`), so which
// physical file a symbol lives in is an internal detail, not part of the
// public surface.
//
// Files are listed in dependency order (each may import from any file above
// it, never below — core.ts has no internal dependencies at all). Note this
// ordering is documentation only — `export *` doesn't enforce or depend on
// it at runtime, since each file imports directly from its specific
// dependency, never through this barrel — but keeping the list honest
// matters for anyone tracing what depends on what:
//   core          — TODAY/DEFAULT_ACTOR/PersonName, no dependencies
//   facilities    — Organization/Facility, Department config, physical
//                   hierarchy (Floor/Ward/Room/Bed), Bed Types
//   staff         — Practitioner/PractitionerRole/StaffMember, attendance, roster
//   facilityOps   — Facilities Operations update: Work Orders/Maintenance,
//                   Equipment (infrastructure only), Incidents, Overview
//                   dashboard — see FacilityList.tsx's new tabs
//   patients      — Patient registry, identifiers, MPI duplicate/merge
//   beds          — Bed Management: ward/room/bed views, admit/transfer/
//                   discharge, requests, audit, dashboard
//   appointments  — Schedules, blocked time, doctor leave, booking, queue
//   billing       — Billing & Revenue Cycle Management, all 4 phases
//   departments   — Department directory/detail views and CRUD (the
//                   Organization Hierarchy Department Management phase)
//   laboratory    — Laboratory oversight: orders, specimens, results,
//                   critical alerts, test catalog, analytics, audit
//   radiology     — Radiology oversight, full module per RADIOLOGY_MODULE_SPEC.md
//   ot            — OT/Surgery, full module per OT_MODULE_SPEC.md
//   pharmacy      — Pharmacy, full module per PHARMACY_MODULE_SPEC.md
//   inventory     — Inventory Management, full module per
//                   INVENTORY_MODULE_SPEC.md
//   emergency     — Emergency Department, MVP scope per
//                   EMERGENCY_MODULE_SPEC.md
//   reports       — Reports & Analytics, MVP scope (thin read-only
//                   aggregation layer over every module above)
//   audit         — Audit & Security, full module per AUDIT_MODULE_SPEC.md
//   configuration — Configuration, full module per
//                   CONFIGURATION_MODULE_SPEC.md
//   alerts        — Alerts & Notifications, full module per
//                   ALERTS_NOTIFICATIONS_MODULE_SPEC.md
//   dashboard     — real cross-module aggregation for the two top-level
//                   dashboard pages (Admin/Reception) — depends on nearly
//                   every module above, so it sits last, not second
export * from "./core";
export * from "./facilities";
export * from "./staff";
export * from "./facilityOps";
export * from "./patients";
export * from "./beds";
export * from "./appointments";
export * from "./billing";
export * from "./departments";
export * from "./laboratory";
export * from "./radiology";
export * from "./ot";
export * from "./pharmacy";
export * from "./inventory";
export * from "./emergency";
export * from "./reports";
export * from "./audit";
export * from "./configuration";
export * from "./alerts";
export * from "./dashboard";
