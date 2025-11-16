import { z } from "zod";

export const optionalNumericId = (message: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const parsed = Number(val);
      return isNaN(parsed) ? val : parsed;
    },
    z
      .number()
      .optional()
      .refine((val) => val !== undefined, { message })
  );

export const optionalStringId = (message: string) =>
  z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().min(1, message).optional()
  );

export const requiredStringId = (message: string) =>
  z
    .string()
    .min(1, message)
    .max(100, message)
    .refine((val) => val !== undefined, { message });

export function requiredNumber(object: string, minValue: number = 0) {
  return z.preprocess(
    (val) => (val !== null && val !== undefined ? String(val) : ""),
    z
      .string()
      .min(1, `${object} es requerido`)
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val), {
        message: `${object} debe ser un número válido`,
      })
      .refine((val) => val >= minValue, {
        message: `${object} debe ser mayor o igual a ${minValue}`,
      })
  );
}
