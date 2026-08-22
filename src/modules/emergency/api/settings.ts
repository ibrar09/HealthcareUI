import { mockRequest } from "@shared/lib/api/client";

export interface EDConfig {
  requireTwoIdentifierVerification: boolean;
  autoNotifyOnCriticalResult: boolean;
  reassessmentIntervalMinutes: number;
  criticalAlertEscalationMinutes: number;
}

let config: EDConfig = { requireTwoIdentifierVerification: true, autoNotifyOnCriticalResult: true, reassessmentIntervalMinutes: 30, criticalAlertEscalationMinutes: 10 };

export const getEDConfig = () => mockRequest({ ...config });

export function updateEDConfig(fields: Partial<EDConfig>) {
  config = { ...config, ...fields };
  return mockRequest({ ...config });
}
