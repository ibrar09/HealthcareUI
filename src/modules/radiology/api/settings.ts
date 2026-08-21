import { mockRequest } from "@shared/lib/api/client";

export interface RadiologyConfig {
  requireMriScreening: boolean;
  requireContrastRenalCheck: boolean;
  criticalFindingEscalationMinutes: number;
  autoNotifyOrderingDoctor: boolean;
}

let config: RadiologyConfig = { requireMriScreening: true, requireContrastRenalCheck: true, criticalFindingEscalationMinutes: 30, autoNotifyOrderingDoctor: true };

export const getRadiologyConfig = () => mockRequest({ ...config });

export function updateRadiologyConfig(fields: Partial<RadiologyConfig>) {
  config = { ...config, ...fields };
  return mockRequest({ ...config });
}
