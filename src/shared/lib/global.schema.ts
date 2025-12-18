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
  return z.coerce
    .number({
      error: `${object} es requerido`,
    })
    .min(minValue, `${object} debe ser al menos ${minValue}`);
}

export const requiredDecimalNumber = (object: string, minValue: number = 0) => {
  return z
    .string()
    .min(1, `${object} es requerido`)
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0.1;
      },
      { message: `${object} debe ser un número mayor o igual a ${minValue}` }
    );
};

export const requiredText = (
  object: string,
  minLength: number = 3,
  maxLength: number = 255
) => {
  return z
    .string()
    .min(minLength, `${object} debe tener al menos ${minLength} caracteres`)
    .max(maxLength, `${object} no puede exceder ${maxLength} caracteres`);
};
