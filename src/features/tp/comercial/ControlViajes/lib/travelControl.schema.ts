import { z } from "zod";

const ControlTravelStatusEnum = z.enum(["pending", "in_progress", "completed", "fuel_pending"]);
const FuelTypeEnum = z.enum(["diesel", "gasoline", "gas"]);

const driverSchema = z.object({
  id: z.string().min(1, "Selecciona un conductor"),
  name: z.string().min(1, "Nombre del conductor es requerido"),
});

const additionalDriverSchema = z.object({
  id: z.string().min(1, "ID del conductor adicional requerido"),
  name: z.string().min(1, "Nombre del conductor adicional requerido"),
});

const ControlTravelBaseSchema = z.object({
  tripNumber: z.string()
    .min(1, "El número de viaje es requerido")
    .regex(/^[A-Z]{2}-\d{4}-\d{3}$/, "Formato inválido. Use: VJ-2024-001"),
  
  plate: z.string()
    .min(1, "La placa es requerida")
    .regex(/^[A-Z]{3}-\d{3}$/, "Formato de placa inválido. Use: ABC-123"),
  
  driver: driverSchema,
  
  additionalDrivers: z.array(additionalDriverSchema).optional(),
  
  route: z.string()
    .min(1, "La ruta es requerida")
    .max(200, "La ruta no puede exceder 200 caracteres"),
  
  client: z.string()
    .min(1, "El cliente es requerido")
    .max(200, "El nombre del cliente no puede exceder 200 caracteres"),
  
  status: ControlTravelStatusEnum,
  
  initialKm: z.number()
    .min(0, "El kilometraje inicial debe ser mayor o igual a 0")
    .optional(),
  
  finalKm: z.number()
    .min(0, "El kilometraje final debe ser mayor o igual a 0")
    .optional(),
  
  previousFinalKm: z.number()
    .min(0, "El kilometraje final anterior debe ser mayor o igual a 0")
    .optional(),
  
  startTime: z.coerce.date()
    .optional(),
  
  endTime: z.coerce.date()
    .optional(),
  
  totalHours: z.number()
    .min(0, "El total de horas debe ser mayor o igual a 0")
    .max(744, "El total de horas no puede exceder 744 horas (31 días)")
    .optional(),
  
  totalKm: z.number()
    .min(0, "El total de kilómetros debe ser mayor o igual a 0")
    .optional(),
  
  fuelGallons: z.number()
    .min(0, "Los galones de combustible deben ser mayor o igual a 0")
    .optional(),
  
  factorKm: z.number()
    .min(0, "El factor KM debe ser mayor o igual a 0")
    .optional(),
  
  fuelAmount: z.number()
    .min(0, "El monto de combustible debe ser mayor o igual a 0")
    .optional(),
  
 
  tonnage: z.number()
    .min(0, "La tonelaje debe ser mayor o igual a 0")
    .max(100, "La tonelaje no puede exceder 100 toneladas")
    .optional(),
  
  hasEmptySegment: z.boolean().default(false),
  
  observations: z.string()
    .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
    .optional()
    .or(z.literal("")),
  
  invoiceNumber: z.string()
    .max(100, "El número de factura no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
  
  waybillNumber: z.string()
    .max(100, "El número de guía no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
});

export const ControlTravelSchemaCreate = ControlTravelBaseSchema.superRefine((data, ctx) => {
  if (data.finalKm !== undefined && data.initialKm !== undefined && data.finalKm <= data.initialKm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El kilometraje final debe ser mayor al inicial",
      path: ["finalKm"],
    });
  }
  
  if (data.endTime && data.startTime && data.endTime <= data.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["endTime"],
    });
  }
  
  if (data.startTime && data.startTime > new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de inicio no puede ser futura",
      path: ["startTime"],
    });
  }
  
  if (data.endTime && data.endTime > new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de fin no puede ser futura",
      path: ["endTime"],
    });
  }
});

export const ControlTravelSchemaUpdate = ControlTravelBaseSchema.partial().extend({
  id: z.string().min(1, "ID del viaje es requerido"),
});

export const ControlTravelFuelSchema = z.object({
  ControlViajesId: z.string().min(1, "ID del viaje es requerido"),
  fuelGallons: z.number()
    .min(0.1, "Debe ingresar al menos 0.1 galones")
    .max(1000, "No puede exceder 1000 galones"),
  fuelAmount: z.number()
    .min(0.1, "El monto debe ser mayor a 0"),
  factorKm: z.number()
    .min(0.1, "El factor KM debe ser mayor a 0")
    .max(10, "El factor KM no puede exceder 10"),
  fuelDate: z.coerce.date()
    .max(new Date(), "La fecha no puede ser futura"),
  odometerReading: z.number()
    .min(0, "La lectura del odómetro debe ser mayor o igual a 0"),
  stationName: z.string()
    .min(1, "El nombre de la estación es requerido")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  fuelType: FuelTypeEnum,
  receiptNumber: z.string()
    .max(100, "El número de recibo no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
});

export const ControlTravelStatusSchema = z.object({
  ControlViajesId: z.string().min(1, "ID del viaje es requerido"),
  status: ControlTravelStatusEnum,
  statusReason: z.string()
    .max(500, "La razón no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ControlTravelSchema = z.infer<typeof ControlTravelSchemaCreate>;
export type ControlTravelUpdateSchema = z.infer<typeof ControlTravelSchemaUpdate>;
export type ControlTravelFuelSchema = z.infer<typeof ControlTravelFuelSchema>;
export type ControlTravelStatusSchema = z.infer<typeof ControlTravelStatusSchema>;
export type DriverSchema = z.infer<typeof driverSchema>;
export { ControlTravelStatusEnum, FuelTypeEnum };