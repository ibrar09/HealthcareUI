import { mockRequest } from "@shared/lib/api/client";

export interface RadiologyProcedure {
  id: string;
  name: string;
  modality: string;
  bodyPart: string;
  durationMin: number;
  contrastRequired: boolean;
  prepInstructions: string;
}

const procedures: RadiologyProcedure[] = [
  { id: "proc-1", name: "CT Chest with Contrast", modality: "CT", bodyPart: "Chest", durationMin: 20, contrastRequired: true, prepInstructions: "NPO 4 hours prior. Check renal function before contrast." },
  { id: "proc-2", name: "MRI Brain", modality: "MRI", bodyPart: "Brain", durationMin: 40, contrastRequired: false, prepInstructions: "MRI safety screening required. Remove all metal objects." },
  { id: "proc-3", name: "X-Ray Chest", modality: "X-Ray", bodyPart: "Chest", durationMin: 10, contrastRequired: false, prepInstructions: "Remove jewelry and metal from chest area." },
  { id: "proc-4", name: "Ultrasound Abdomen", modality: "Ultrasound", bodyPart: "Abdomen", durationMin: 25, contrastRequired: false, prepInstructions: "NPO 6 hours prior for gallbladder evaluation." },
  { id: "proc-5", name: "MRI Spine with Contrast", modality: "MRI", bodyPart: "Spine", durationMin: 45, contrastRequired: true, prepInstructions: "MRI safety screening required. Check renal function before gadolinium." },
  { id: "proc-6", name: "Mammography", modality: "Mammography", bodyPart: "Breast", durationMin: 15, contrastRequired: false, prepInstructions: "No deodorant or powder on exam day." },
];

export const getProcedures = () => mockRequest([...procedures]);
