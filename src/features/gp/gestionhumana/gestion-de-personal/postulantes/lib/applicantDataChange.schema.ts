import { z } from "zod";

export const applicantDataChangeRejectSchema = z.object({
  motivo: z.string().min(1, "El motivo es obligatorio").max(500),
});

export type ApplicantDataChangeRejectSchema = z.infer<
  typeof applicantDataChangeRejectSchema
>;
