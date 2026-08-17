import { Card } from "@shared/design-system/components";
import type { WorkflowConfig, ApprovalRuleConfig, QueueConfig } from "@modules/hospital-admin/api";

interface WorkflowApprovalsPanelProps {
  workflows: WorkflowConfig[];
  approvalRules: ApprovalRuleConfig[];
  queues: QueueConfig[];
}

/** Module-local — Workflow (spec §31) + Approval (spec §32) + Queue (spec §33) Configuration, combined: hospitals shouldn't have every process hard-coded. */
export function WorkflowApprovalsPanel({ workflows, approvalRules, queues }: WorkflowApprovalsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {workflows.map((wf) => (
        <Card hero key={wf.id}>
          <h2 className="text-lg font-bold text-on-surface mb-4">{wf.name}</h2>
          <div className="flex flex-col gap-1.5">
            {wf.steps.map((step) => (
              <div key={step.order} className="flex items-center gap-3 text-sm py-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-indigo/10 text-signal-indigo text-xs font-bold flex-shrink-0">{step.order}</span>
                <span className="font-semibold text-on-surface">{step.step}</span>
                <span className="text-xs text-on-surface-variant">{step.responsibleRole}</span>
                {step.requiresApproval && <span className="rounded-full bg-caution-amber/14 text-caution-amber px-2 py-0.5 text-[10px] font-bold">Requires Approval</span>}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Approval Rules</h2>
        <div className="flex flex-col divide-y divide-line">
          {approvalRules.map((r) => (
            <div key={r.id} className="py-2.5">
              <p className="text-sm font-bold text-on-surface">{r.processName}</p>
              <p className="text-xs text-on-surface-variant">{r.triggerCondition} → {r.approverChain.join(" → ")}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Queues</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Queue</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Department</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Max Wait</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {queues.map((q) => (
                <tr key={q.id}>
                  <td className="py-2 pr-3 font-semibold text-on-surface">{q.name}</td>
                  <td className="py-2 pr-3 text-on-surface-variant">{q.department}</td>
                  <td className="py-2 pr-3 text-on-surface-variant">{q.maxWaitMinutes} min</td>
                  <td className="py-2 text-on-surface-variant">{q.escalationEnabled ? "Enabled" : "Disabled"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
