import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { categoryLabels } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { NewInventoryItemInput, ItemCategory, UnitOfMeasure } from "@modules/hospital-admin/api";

const categories: ItemCategory[] = ["medical-supply", "surgical", "laboratory", "ppe", "implant", "consumable", "equipment", "general"];
const units: UnitOfMeasure[] = ["piece", "box", "pack", "carton", "bottle", "vial", "ampoule", "tube", "kit", "liter", "milliliter", "kilogram", "gram"];

function emptyValues(): NewInventoryItemInput {
  return {
    name: "",
    category: "medical-supply",
    baseUnit: "piece",
    isSerialTracked: false,
    isBatchTracked: true,
    isImplant: false,
    reorderLevel: 10,
    reorderQuantity: 30,
    maxStockLevel: 100,
    unitCost: 0,
  };
}

interface ItemFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewInventoryItemInput) => void;
  initialValues?: NewInventoryItemInput;
}

/** Module-local — add/edit an Item Master record (spec §3-8): configurable category/UOM/identifiers, never free text. */
export function ItemFormDrawer({ open, onClose, onSubmit, initialValues }: ItemFormDrawerProps) {
  const [values, setValues] = useState<NewInventoryItemInput>(initialValues ?? emptyValues());
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues());
  }, [open, initialValues]);

  function set<K extends keyof NewInventoryItemInput>(key: K, value: NewInventoryItemInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Item" : "Add Item"}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(values);
              onClose();
            }}
            disabled={!values.name.trim()}
          >
            {isEdit ? "Save Changes" : "Add Item"}
          </Button>
        </div>
      }
    >
      <FormSection title="Identity">
        <div className="mb-4">
          <FormField label="Item Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Surgical Gloves (Sterile)" />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Description (optional)">
            <input className={formInputClass} value={values.description ?? ""} onChange={(e) => set("description", e.target.value || undefined)} placeholder="Short description" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category">
            <select className={formInputClass} value={values.category} onChange={(e) => set("category", e.target.value as ItemCategory)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Subcategory (optional)">
            <input className={formInputClass} value={values.subcategory ?? ""} onChange={(e) => set("subcategory", e.target.value || undefined)} placeholder="e.g. Wound Care" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Manufacturer & Identification">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Manufacturer">
            <input className={formInputClass} value={values.manufacturer ?? ""} onChange={(e) => set("manufacturer", e.target.value || undefined)} placeholder="e.g. Ansell" />
          </FormField>
          <FormField label="Brand (optional)">
            <input className={formInputClass} value={values.brand ?? ""} onChange={(e) => set("brand", e.target.value || undefined)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Manufacturer Code (optional)">
            <input className={formInputClass} value={values.manufacturerCode ?? ""} onChange={(e) => set("manufacturerCode", e.target.value || undefined)} />
          </FormField>
          <FormField label="Barcode (optional)">
            <input className={formInputClass} value={values.barcode ?? ""} onChange={(e) => set("barcode", e.target.value || undefined)} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Units & Costing">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Base Unit">
            <select className={formInputClass} value={values.baseUnit} onChange={(e) => set("baseUnit", e.target.value as UnitOfMeasure)}>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Unit Cost ($)">
            <input type="number" min={0} step={0.01} className={formInputClass} value={values.unitCost} onChange={(e) => set("unitCost", Number(e.target.value))} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Reorder Rules">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Reorder Level">
            <input type="number" min={0} className={formInputClass} value={values.reorderLevel} onChange={(e) => set("reorderLevel", Number(e.target.value))} />
          </FormField>
          <FormField label="Reorder Quantity">
            <input type="number" min={0} className={formInputClass} value={values.reorderQuantity} onChange={(e) => set("reorderQuantity", Number(e.target.value))} />
          </FormField>
          <FormField label="Max Stock Level">
            <input type="number" min={0} className={formInputClass} value={values.maxStockLevel} onChange={(e) => set("maxStockLevel", Number(e.target.value))} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Tracking">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.isBatchTracked} onChange={(e) => set("isBatchTracked", e.target.checked)} />
            Batch / expiry tracked
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.isSerialTracked} onChange={(e) => set("isSerialTracked", e.target.checked)} />
            Serial-number tracked
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.isImplant} onChange={(e) => set("isImplant", e.target.checked)} />
            Implant (patient traceability)
          </label>
        </div>
      </FormSection>
    </Drawer>
  );
}
