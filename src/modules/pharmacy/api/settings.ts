import { mockRequest } from "@shared/lib/api/client";

export interface PharmacyConfig {
  enforceFefo: boolean;
  requireFormularyApproval: boolean;
  requireDoubleCheckHighRisk: boolean;
  lowStockNotifications: boolean;
}

let config: PharmacyConfig = { enforceFefo: true, requireFormularyApproval: true, requireDoubleCheckHighRisk: true, lowStockNotifications: true };

export const getPharmacyConfig = () => mockRequest({ ...config });

export function updatePharmacyConfig(fields: Partial<PharmacyConfig>) {
  config = { ...config, ...fields };
  return mockRequest({ ...config });
}
