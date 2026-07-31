"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { EMPRESA_AP } from "@/core/core.constants";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { useStoreHistoricalShippingGuide } from "../lib/shippingGuides.hook";
import {
  historicalShippingGuideSchema,
  HistoricalShippingGuideSchema,
} from "../lib/historicalShippingGuide.schema";

interface HistoricalShippingGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HistoricalShippingGuideDialog({
  open,
  onOpenChange,
}: HistoricalShippingGuideDialogProps) {
  const form = useForm<HistoricalShippingGuideSchema>({
    resolver: zodResolver(historicalShippingGuideSchema) as any,
    defaultValues: {
      vin: "",
      series: "",
      correlativo: "",
      sede_transmitter_id: "",
      advisor_id: "",
      client_id: "",
      notes: "",
    },
    mode: "onChange",
  });

  const { data: mySedes = [], isLoading: isLoadingMySedes } =
    useWarehousesByCompany({
      my: 1,
      is_received: 1,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_COMERCIAL_ID,
      enabled: open,
      ap_class_article_id: "3",
    });

  const storeMutation = useStoreHistoricalShippingGuide();

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (data: HistoricalShippingGuideSchema) => {
    storeMutation.mutate(data, {
      onSuccess: () => handleClose(),
    });
  };

  return (
    <GeneralSheet
      title="Regularización de Guía Histórica"
      subtitle="Registra una guía de remisión de manera histórica"
      open={open}
      onClose={handleClose}
      icon="FileClock"
      size="2xl"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput
              name="vin"
              label="VIN"
              placeholder="Ingrese el VIN del vehículo"
              control={form.control}
              uppercase
              required
            />
            <FormSelect
              name="sede_transmitter_id"
              label="Sede Emisor"
              placeholder="Selecciona sede"
              options={mySedes.map((item) => ({
                label: item.sede,
                description: item.description,
                value: item.sede_id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={isLoadingMySedes}
            />
            <FormInput
              name="series"
              label="Serie"
              placeholder="Ej: EG07"
              control={form.control}
              uppercase
              required
            />
            <FormInput
              name="correlativo"
              label="Correlativo"
              placeholder="Ej: 68"
              control={form.control}
              required
            />
            <DatePickerFormField
              control={form.control}
              name="issue_date"
              label="Fecha de Emisión"
            />
            <FormSelectAsync
              name="advisor_id"
              label="Asesor"
              placeholder="Selecciona un asesor"
              control={form.control}
              useQueryHook={useWorkers}
              mapOptionFn={(item) => ({
                label: item.name,
                value: item.id.toString(),
              })}
            />
            <FormSelectAsync
              name="client_id"
              label="Cliente"
              placeholder="Selecciona un cliente"
              control={form.control}
              useQueryHook={useCustomers}
              mapOptionFn={(item: CustomersResource) => ({
                label: `${item.full_name} - ${item.num_doc}`,
                value: item.id.toString(),
              })}
              perPage={10}
              debounceMs={500}
            />
          </div>

          <FormTextArea
            name="notes"
            label="Notas"
            placeholder="Ej: Regularización histórica"
            control={form.control}
            uppercase
          />

          <div className="flex gap-3 w-full justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={storeMutation.isPending}>
              <Loader
                className={`mr-2 h-4 w-4 animate-spin ${
                  !storeMutation.isPending ? "hidden" : ""
                }`}
              />
              {storeMutation.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
}
