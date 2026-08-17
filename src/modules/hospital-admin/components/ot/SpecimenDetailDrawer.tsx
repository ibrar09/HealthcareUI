import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import * as api from "@modules/hospital-admin/api";
import type { SpecimenRow, SpecimenLabelStatus, SpecimenPathologyStatus } from "@modules/hospital-admin/api";

const labelStatuses: SpecimenLabelStatus[] = ["pending", "labeled"];
const pathologyStatuses: SpecimenPathologyStatus[] = ["pending", "sent", "in-progress", "resulted"];

interface SpecimenDetailDrawerProps {
  specimen: SpecimenRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Specimen detail (spec §20): container/destination/label/pathology-status capture. Result content itself, if any, is pathology's own output — view-only, never authored here. */
export function SpecimenDetailDrawer({ specimen, onClose, onComplete }: SpecimenDetailDrawerProps) {
  const [container, setContainer] = useState("");
  const [collectionSite, setCollectionSite] = useState("");
  const [destination, setDestination] = useState("");
  const [labelStatus, setLabelStatus] = useState<SpecimenLabelStatus>("pending");
  const [pathologyStatus, setPathologyStatus] = useState<SpecimenPathologyStatus>("pending");

  useEffect(() => {
    if (specimen) {
      setContainer(specimen.container ?? "");
      setCollectionSite(specimen.collectionSite ?? "");
      setDestination(specimen.destination ?? "");
      setLabelStatus(specimen.labelStatus);
      setPathologyStatus(specimen.pathologyStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specimen?.id]);

  async function handleSave() {
    if (!specimen) return;
    await api.updateSpecimen(specimen.id, {
      container: container || undefined,
      collectionSite: collectionSite || undefined,
      destination: destination || undefined,
      labelStatus,
      pathologyStatus,
    });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(specimen)}
      onClose={onClose}
      title={specimen?.specimenId ?? ""}
      subtitle={specimen ? `${specimen.caseNumber} · ${specimen.patientName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      }
    >
      {specimen && (
        <FormSection title="Specimen">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Type</p>
            <p className="text-sm font-semibold text-on-surface">{specimen.type}</p>
          </div>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Collected</p>
            <p className="text-sm font-semibold text-on-surface">{formatDateTime(specimen.collectionTime)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Collection Site">
              <input className={formInputClass} value={collectionSite} onChange={(e) => setCollectionSite(e.target.value)} placeholder="e.g. Right lower quadrant" />
            </FormField>
            <FormField label="Container">
              <input className={formInputClass} value={container} onChange={(e) => setContainer(e.target.value)} placeholder="e.g. Formalin jar" />
            </FormField>
          </div>
          <div className="mb-4">
            <FormField label="Destination">
              <input className={formInputClass} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Pathology Lab" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Label Status">
              <select className={formInputClass} value={labelStatus} onChange={(e) => setLabelStatus(e.target.value as SpecimenLabelStatus)}>
                {labelStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Pathology Status">
              <select className={formInputClass} value={pathologyStatus} onChange={(e) => setPathologyStatus(e.target.value as SpecimenPathologyStatus)}>
                {pathologyStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("-", " ")}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </FormSection>
      )}
    </Drawer>
  );
}
