"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelect } from "@/shared/components/FormSelect";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { createInternalShippingGuide } from "../../envios-recepciones/lib/shipmentsReceptions.actions";
import { SHIPMENTS_RECEPTIONS } from "../../envios-recepciones/lib/shipmentsReceptions.constants";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { EMPRESA_AP } from "@/core/core.constants";

const schema = z.object({
  sede_receiver_id: z.string().min(1, "Requerido"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  vehicleId: number;
  vehicleVin?: string;
}

export default function ChangeLocationModal({ vehicleId, vehicleVin }: Props) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sede_receiver_id: "",
    },
    mode: "onChange",
  });

  const { data: destSedes = [], isLoading: isLoadingDestSedes } =
    useWarehousesByCompany({
      my: 0,
      is_received: 0,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_COMERCIAL_ID,
      ap_class_article_id: undefined,
    });

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await createInternalShippingGuide({
        ap_vehicle_id: vehicleId,
        sede_receiver_id: Number(values.sede_receiver_id),
      });
      toast.success("Guía interna creada exitosamente");
      queryClient.invalidateQueries({
        queryKey: [SHIPMENTS_RECEPTIONS.QUERY_KEY],
      });
      handleClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Error al crear la guía interna de traslado",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        tooltip="Cambiar Ubicación"
        onClick={() => setOpen(true)}
      >
        <MapPin className="size-4" />
      </Button>

      <GeneralModal
        open={open}
        onClose={handleClose}
        title="Cambiar Ubicación"
        subtitle={vehicleVin ? `Vehículo: ${vehicleVin}` : undefined}
        icon="MapPin"
        size="md"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              control={form.control}
              name="sede_receiver_id"
              label="Sede Destino"
              placeholder="Selecciona sede destino"
              options={destSedes.map((item) => ({
                label: item.sede,
                description: item.description,
                value: item.sede_id.toString(),
              }))}
              disabled={isLoadingDestSedes}
              strictFilter
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting && (
                  <Loader className="mr-2 size-4 animate-spin" />
                )}
                {isSubmitting ? "Guardando..." : "Cambiar Ubicación"}
              </Button>
            </div>
          </form>
        </Form>
      </GeneralModal>
    </>
  );
}
