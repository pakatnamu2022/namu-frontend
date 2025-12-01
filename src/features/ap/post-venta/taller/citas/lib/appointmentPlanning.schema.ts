import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const appointmentPlanningSchemaCreate = z.object({
  description: z
    .string()
    .max(500)
    .refine((value) => value.trim() !== "", {
      message: "Descripci�n es requerida",
    }),
  delivery_date: z.string().refine((value) => value.trim() !== "", {
    message: "Fecha de entrega es requerida",
  }),
  delivery_time: z.string().refine((value) => value.trim() !== "", {
    message: "Hora de entrega es requerida",
  }),
  date_appointment: z.string().refine((value) => value.trim() !== "", {
    message: "Fecha de cita es requerida",
  }),
  time_appointment: z.string().refine((value) => value.trim() !== "", {
    message: "Hora de cita es requerida",
  }),
  full_name_client: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Nombre del cliente es requerido",
    }),
  email_client: z.string().email({
    message: "Email inv�lido",
  }),
  phone_client: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Tel�fono del cliente es requerido",
    }),
  type_operation_appointment_id: requiredStringId(
    "Tipo de operaci�n de cita es requerido"
  ),
  type_planning_id: requiredStringId("Tipo de planificaci�n es requerido"),
  ap_vehicle_id: requiredStringId("Vehículo es requerido"),
});

export const appointmentPlanningSchemaUpdate =
  appointmentPlanningSchemaCreate.partial();

export type AppointmentPlanningSchema = z.infer<
  typeof appointmentPlanningSchemaCreate
>;
