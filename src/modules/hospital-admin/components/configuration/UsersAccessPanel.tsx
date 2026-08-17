import { useState } from "react";
import { Card } from "@shared/design-system/components";
import type { RoleDefinition, PermissionDefinition } from "@modules/hospital-admin/api";

interface UsersAccessPanelProps {
  roles: RoleDefinition[];
  permissions: PermissionDefinition[];
  onUpdateRolePermissions: (roleId: string, permissionIds: string[]) => void;
}

/** Module-local — Users & Access Configuration (spec §5): Roles + fine-grained Permissions, real RBAC never a bare "ADMIN = EVERYTHING." */
export function UsersAccessPanel({ roles, permissions, onUpdateRolePermissions }: UsersAccessPanelProps) {
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  function togglePermission(role: RoleDefinition, permissionId: string) {
    const has = role.permissionIds.includes(permissionId);
    onUpdateRolePermissions(role.id, has ? role.permissionIds.filter((p) => p !== permissionId) : [...role.permissionIds, permissionId]);
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Roles</h2>
        <div className="flex flex-col divide-y divide-line">
          {roles.map((role) => (
            <div key={role.id} className="py-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedRoleId(expandedRoleId === role.id ? null : role.id)}>
                <div>
                  <p className="text-sm font-bold text-on-surface">{role.name} {role.isSystemRole && <span className="text-[10px] uppercase text-on-surface-variant/60 ml-1">System Role</span>}</p>
                  <p className="text-xs text-on-surface-variant">{role.description}</p>
                </div>
                <span className="text-xs text-on-surface-variant">{role.permissionIds.length} permission(s)</span>
              </div>
              {expandedRoleId === role.id && (
                <div className="mt-3 flex flex-col gap-3">
                  {categories.map((cat) => (
                    <div key={cat}>
                      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold mb-1.5">{cat}</p>
                      <div className="flex flex-wrap gap-2">
                        {permissions.filter((p) => p.category === cat).map((p) => {
                          const checked = role.permissionIds.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => togglePermission(role, p.id)}
                              title={p.description}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold font-mono border transition-all ${checked ? "bg-signal-indigo text-white border-signal-indigo" : "bg-white text-on-surface-variant border-line"}`}
                            >
                              {p.id}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Permission Catalog</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Permission</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Category</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {permissions.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pr-3 font-mono text-xs font-bold text-on-surface">{p.id}</td>
                  <td className="py-2 pr-3 text-on-surface-variant">{p.category}</td>
                  <td className="py-2 text-on-surface-variant">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
