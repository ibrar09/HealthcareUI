import { mockRequest } from "@shared/lib/api/client";

// Doctor Portal's Product & Stock module — deliberately scoped to a
// read-only medication availability lookup, not inventory management.
// Adding/removing stock, reorder points, and suppliers belong to Pharmacy's
// or Hospital Admin's Inventory module — an individual doctor doesn't manage
// hospital procurement, so building that CRUD here would both duplicate
// those modules and misrepresent a doctor's actual role.

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface MedicationStock {
  id: string;
  name: string;
  genericName: string;
  category: string;
  form: string;
  strength: string;
  stockStatus: StockStatus;
  quantityAvailable?: number;
  alternatives?: string[];
}

// Medication names deliberately reuse the ones already prescribed to
// patients elsewhere in this module (Patient History, Encounter Workspace)
// rather than inventing a second, disconnected drug list.
const formulary: MedicationStock[] = [
  { id: "med-1", name: "Omeprazole", genericName: "Omeprazole", category: "Antacid / PPI", form: "Capsule", strength: "20mg", stockStatus: "In Stock", quantityAvailable: 480 },
  { id: "med-2", name: "Pantoprazole", genericName: "Pantoprazole", category: "Antacid / PPI", form: "Tablet", strength: "40mg", stockStatus: "In Stock", quantityAvailable: 320 },
  { id: "med-3", name: "Sumatriptan", genericName: "Sumatriptan Succinate", category: "Antimigraine", form: "Tablet", strength: "50mg", stockStatus: "Low Stock", quantityAvailable: 18, alternatives: ["Rizatriptan 10mg"] },
  { id: "med-4", name: "Losartan", genericName: "Losartan Potassium", category: "Antihypertensive", form: "Tablet", strength: "50mg", stockStatus: "In Stock", quantityAvailable: 610 },
  { id: "med-5", name: "Amlodipine", genericName: "Amlodipine Besylate", category: "Antihypertensive", form: "Tablet", strength: "10mg", stockStatus: "In Stock", quantityAvailable: 540 },
  { id: "med-6", name: "Metformin", genericName: "Metformin HCl", category: "Antidiabetic", form: "Tablet", strength: "1000mg", stockStatus: "In Stock", quantityAvailable: 720 },
  { id: "med-7", name: "Glimepiride", genericName: "Glimepiride", category: "Antidiabetic", form: "Tablet", strength: "2mg", stockStatus: "Low Stock", quantityAvailable: 25, alternatives: ["Gliclazide 80mg"] },
  { id: "med-8", name: "Insulin Glargine", genericName: "Insulin Glargine", category: "Antidiabetic", form: "Injection", strength: "100 units/mL", stockStatus: "In Stock", quantityAvailable: 90 },
  { id: "med-9", name: "Furosemide", genericName: "Furosemide", category: "Diuretic", form: "Tablet", strength: "20mg", stockStatus: "In Stock", quantityAvailable: 400 },
  { id: "med-10", name: "Levothyroxine", genericName: "Levothyroxine Sodium", category: "Thyroid Hormone", form: "Tablet", strength: "75mcg", stockStatus: "In Stock", quantityAvailable: 350 },
  { id: "med-11", name: "Atorvastatin", genericName: "Atorvastatin Calcium", category: "Statin", form: "Tablet", strength: "40mg", stockStatus: "In Stock", quantityAvailable: 460 },
  { id: "med-12", name: "Aspirin", genericName: "Acetylsalicylic Acid", category: "Antiplatelet", form: "Tablet", strength: "75mg", stockStatus: "In Stock", quantityAvailable: 900 },
  { id: "med-13", name: "Clopidogrel", genericName: "Clopidogrel Bisulfate", category: "Antiplatelet", form: "Tablet", strength: "75mg", stockStatus: "Out of Stock", quantityAvailable: 0, alternatives: ["Aspirin 75mg", "Ticagrelor 90mg (external order)"] },
  { id: "med-14", name: "Paracetamol", genericName: "Acetaminophen", category: "Analgesic", form: "Tablet", strength: "1g", stockStatus: "In Stock", quantityAvailable: 1200 },
  { id: "med-15", name: "Ibuprofen", genericName: "Ibuprofen", category: "NSAID", form: "Tablet", strength: "400mg", stockStatus: "In Stock", quantityAvailable: 380 },
  { id: "med-16", name: "Cetirizine", genericName: "Cetirizine HCl", category: "Antihistamine", form: "Tablet", strength: "10mg", stockStatus: "In Stock", quantityAvailable: 500 },
  { id: "med-17", name: "Azithromycin", genericName: "Azithromycin", category: "Antibiotic", form: "Tablet", strength: "500mg", stockStatus: "Low Stock", quantityAvailable: 22, alternatives: ["Amoxicillin 500mg"] },
  { id: "med-18", name: "Salbutamol", genericName: "Salbutamol Sulfate", category: "Bronchodilator", form: "Inhaler", strength: "100mcg/dose", stockStatus: "Out of Stock", quantityAvailable: 0, alternatives: ["Levosalbutamol Inhaler (external order)"] },
];

export const getFormulary = () => mockRequest([...formulary]);
