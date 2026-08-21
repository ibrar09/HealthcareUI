import { mockRequest } from "@shared/lib/api/client";

export interface LabConfig {
  requireTwoIdentifierVerification: boolean;
  requireTechnicalAndClinicalValidation: boolean;
  autoNotifyOrderingDoctorOnRelease: boolean;
  criticalResultEscalationMinutes: number;
}

let config: LabConfig = { requireTwoIdentifierVerification: true, requireTechnicalAndClinicalValidation: true, autoNotifyOrderingDoctorOnRelease: true, criticalResultEscalationMinutes: 15 };

export const getLabConfig = () => mockRequest({ ...config });

export function updateLabConfig(fields: Partial<LabConfig>) {
  config = { ...config, ...fields };
  return mockRequest({ ...config });
}
