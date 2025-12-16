import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

const workOrderItemSchema = z.object({
  group_number: z.number().int().min(1, "Número de grupo debe ser mayor a 0"),
  type_planning_id: requiredStringId("Tipo de planificación es requerido"),
  description: z.string().min(0, "Descripción es requerida"),
});

export const workOrderSchemaCreate = z
  .object({
    has_appointment: z.boolean().default(false),
    appointment_planning_id: z.string().optional(),
    vehicle_id: requiredStringId("Vehículo es requerido"),
    sede_id: requiredStringId("Sede es requerida"),
    opening_date: z.union([z.literal(""), z.date()]),
    estimated_delivery_date: z
      .union([z.literal(""), z.date()])
      .refine((val) => val !== "", {
        message: "Fecha estimada de entrega es requerida",
      }),
    diagnosis_date: z
      .union([z.literal(""), z.date()])
      .refine((val) => val !== "", {
        message: "Fecha de diagnóstico es requerida",
      }),
    observations: z.string().max(250),
    items: z.array(workOrderItemSchema).optional(),
  })
  .refine(
    (data) => {
      // Si has_appointment es true, appointment_planning_id es requerido
      if (data.has_appointment) {
        return (
          !!data.appointment_planning_id &&
          data.appointment_planning_id.length > 0
        );
      }
      return true;
    },
    {
      message:
        "Cita de planificación es requerida cuando 'Tiene cita' está activo",
      path: ["appointment_planning_id"],
    }
  );

export const workOrderSchemaUpdate = workOrderSchemaCreate.partial();

export type WorkOrderSchema = z.infer<typeof workOrderSchemaCreate>;
export type WorkOrderItemSchema = z.infer<typeof workOrderItemSchema>;
