export type ColumnKey = "encounter" | "diagnosis" | "allergy" | "vitals" | "results" | "pending" | "lastVisit" | "nextAppointment" | "phone" | "location";

export const DEFAULT_COLUMNS: Record<ColumnKey, boolean> = {
  encounter: true, diagnosis: true, allergy: true, vitals: true, results: true,
  pending: true, lastVisit: true, nextAppointment: true, phone: false, location: false,
};

const COLUMN_LABELS: Record<ColumnKey, string> = {
  encounter: "Encounter", diagnosis: "Diagnosis", allergy: "Allergy", vitals: "Latest Vitals",
  results: "Latest Results", pending: "Pending", lastVisit: "Last Visit", nextAppointment: "Next Appointment",
  phone: "Phone", location: "Location",
};

interface PatientColumnsMenuProps {
  columns: Record<ColumnKey, boolean>;
  onChange: (columns: Record<ColumnKey, boolean>) => void;
}

/** Module-local — column visibility toggle for the My Patients table. "Patient" and "MRN/Age-Sex" always show, so aren't listed here. */
export function PatientColumnsMenu({ columns, onChange }: PatientColumnsMenuProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
      <h2 className="text-sm font-bold text-slate-800 mb-3">Columns</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((key) => (
          <label key={key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={columns[key]}
              onChange={() => onChange({ ...columns, [key]: !columns[key] })}
              className="accent-blue-600"
            />
            {COLUMN_LABELS[key]}
          </label>
        ))}
      </div>
    </div>
  );
}
