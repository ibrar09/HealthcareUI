import { useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { ConfigurationExportBundle } from "@modules/hospital-admin/api";

interface ExportImportDialogProps {
  mode: "export" | "import" | null;
  exportBundle: ConfigurationExportBundle | null;
  onClose: () => void;
  onImport: (json: string) => void;
}

/** Module-local — Import / Export (spec §41): secrets are always excluded from the export, never in plain text. */
export function ExportImportDialog({ mode, exportBundle, onClose, onImport }: ExportImportDialogProps) {
  const [importText, setImportText] = useState("");

  return (
    <Drawer
      open={mode !== null}
      onClose={onClose}
      title={mode === "export" ? "Export Configuration" : "Import Configuration"}
      subtitle={mode === "export" ? "API keys, client secrets, and credential references are excluded." : "Paste a previously exported configuration JSON bundle."}
      footer={
        mode === "import" ? (
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => { onImport(importText); onClose(); }} disabled={!importText.trim()}>Import</Button>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        )
      }
    >
      {mode === "export" && exportBundle && (
        <pre className="rounded-card bg-surface-container-low p-4 text-xs font-mono text-on-surface overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(exportBundle, null, 2)}
        </pre>
      )}
      {mode === "import" && (
        <textarea className={formInputClass} rows={16} placeholder="Paste configuration JSON here..." value={importText} onChange={(e) => setImportText(e.target.value)} />
      )}
    </Drawer>
  );
}
