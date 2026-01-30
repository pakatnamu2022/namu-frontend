import { z } from "zod";

export const vehicleAssignmentSchemaCreate = z.object({
  vehicle: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .refine((value) => value > 0, {
      message: "El Vehiculo es necesario",
    }),

  driver: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .refine((value) => value > 0, {
      message: "El Conductor es necesario",
    }),
});

export const vehicleAssignmentSchemaUpdate =
  vehicleAssignmentSchemaCreate.extend({
    id: z.number().optional(),
  });

export type VehicleAssignmentSchema = z.infer<
  typeof vehicleAssignmentSchemaCreate
>;
