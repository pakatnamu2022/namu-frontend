"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { ScheduledDeliveryPicker } from "./ScheduledDeliveryPicker";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSwitch } from "@/shared/components/FormSwitch";
import {
  VehicleDeliveryRescheduleSchema,
  vehicleDeliveryRescheduleSchema,
} from "../lib/vehicleDelivery.schema";
import { VehiclesDeliveryResource } from "../lib/vehicleDelivery.interface";
import { EMPRESA_AP } from "@/core/core.constants";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { GeneralModal } from "@/shared/components/GeneralModal";

interface RescheduleDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: VehiclesDeliveryResource | null;
  onSubmit: (
    id: number,
    data: {
      scheduled_delivery_date: string;
      observations?: string;
      is_extraordinary?: boolean;
    },
  ) => void;
  isSubmitting?: boolean;
}

export function RescheduleDeliveryModal({
  open,
  onOpenChange,
  delivery,
  onSubmit,
  isSubmitting = false,
}: RescheduleDeliveryModalProps) {
  const form = useForm({
    resolver: zodResolver(vehicleDeliveryRescheduleSchema),
    defaultValues: {
      scheduled_delivery_date: undefined,
      observations: "",
      is_extraordinary: false,
    },
  });

  useEffect(() => {
    if (delivery && open) {
      form.reset({
        scheduled_delivery_date: undefined,
        observations: "",
        is_extraordinary: false,
      });
    }
  }, [delivery, open]);

  const watchIsExtraordinary = form.watch("is_extraordinary");

  const { data: warehouses = [] } = useAllWarehouse(
    {
      sede_id: delivery?.sede_id,
      empresa_id: EMPRESA_AP.id,
    },
    !!delivery?.sede_id && open,
  );

  const shopId = warehouses[0]?.shop_id;

  const minDate = (() => {
    const min = new Date();
    if (!watchIsExtraordinary) {
      min.setDate(min.getDate() + 1);
    }
    min.setHours(0, 0, 0, 0);
    return min;
  })();

  const handleSubmit = (data: VehicleDeliveryRescheduleSchema) => {
    if (!delivery) return;
    onSubmit(delivery.id, {
      scheduled_delivery_date: format(
        data.scheduled_delivery_date,
        "yyyy-MM-dd HH:mm:ss",
      ),
      observations: data.observations,
      is_extraordinary: data.is_extraordinary,
    });
  };

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Reprogramar Entrega"
      icon="Truck"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormSwitch
            control={form.control}
            name="is_extraordinary"
            label="Entrega extraordinaria"
            text="Permite programar la entrega en un horario ya tomado."
            description="Esta opción requiere aprobación y enviará un email de confirmación al responsable."
            autoHeight
          />

          <ScheduledDeliveryPicker
            control={form.control}
            name="scheduled_delivery_date"
            label="Nueva Fecha y Hora de Entrega"
            placeholder="Selecciona la fecha y hora de entrega"
            description="Lun-Vie: 9, 10, 11, 12, 15, 16 y 17h · Sáb: 10, 11 y 12h"
            minDate={minDate}
            shopId={shopId}
            allowUnavailableSlots={!!watchIsExtraordinary}
          />

          <FormTextArea
            name="observations"
            label="Observaciones"
            placeholder="Motivo de la reprogramación (opcional)"
            control={form.control}
            maxLength={500}
            uppercase
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Loader
                className={`mr-2 h-4 w-4 animate-spin ${!isSubmitting ? "hidden" : ""}`}
              />
              {isSubmitting ? "Guardando…" : "Reprogramar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
