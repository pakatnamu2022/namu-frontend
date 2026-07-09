"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { History } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import {
  HistoricalFinalSaleSchema,
  type HistoricalFinalSaleSchema as HistoricalFinalSaleSchemaType,
} from "../lib/electronicDocument.schema";
import { registerHistoricalFinalSale } from "../lib/electronicDocument.actions";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useVehicles } from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";
import { EMPRESA_AP } from "@/core/core.constants";

interface HistoricalFinalSaleSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultValues: HistoricalFinalSaleSchemaType = {
  vin: "",
  client_id: "",
  sunat_concept_document_type_id: "",
  serie: "",
  numero: 0,
  area_id: AREA_COMERCIAL.toString(),
  sede_id: "",
  sunat_concept_currency_id: "",
  doc_type_currency_id: "",
  type_currency_id: "",
  total: 0,
  descripcion: "",
};

export default function HistoricalFinalSaleSheet({
  open,
  onClose,
  onSuccess,
}: HistoricalFinalSaleSheetProps) {
  const form = useForm<HistoricalFinalSaleSchemaType>({
    resolver: zodResolver(HistoricalFinalSaleSchema) as any,
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { data: documentTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE],
  });
  const { data: currencyTypesSunat = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY],
  });
  const { data: sedes = [] } = useAllSedes({ empresa_id: EMPRESA_AP.id });
  const { data: currencyTypes = [] } = useAllCurrencyTypes();

  const registerMutation = useMutation({
    mutationFn: registerHistoricalFinalSale,
    onSuccess: (response) => {
      successToast(
        response.message || "Venta final histórica registrada correctamente",
      );
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al registrar venta final histórica: ${msg}`);
    },
  });

  const onSubmit = (data: HistoricalFinalSaleSchemaType) => {
    registerMutation.mutate(data);
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Registrar Venta Final Histórica"
      subtitle="Registra una factura antigua de venta de vehículo Stock Inicial ya emitida físicamente, no enviada por Nubefact."
      icon="History"
      size="5xl"
      childrenFooter={
        <div className="flex gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={registerMutation.isPending}
            className="flex-1"
          >
            Registrar
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <GroupFormSection
            title="Venta Final Histórica"
            icon={History}
            color="amber"
            cols={{ sm: 1, md: 3 }}
          >
            {/* Referencia: vehículo y cliente */}
            <div className="md:col-span-3">
              <FormSelectAsync
                control={form.control}
                name="vin"
                useQueryHook={useVehicles}
                mapOptionFn={(vehicle: VehicleResource) => ({
                  value: vehicle.vin,
                  label: `${vehicle.vin} - ${vehicle.model?.version || ""} (${vehicle.plate || "Sin placa"})`,
                })}
                label="Vehículo (VIN) *"
                description="Vehículo Stock Inicial vendido. Si no tiene una Solicitud de Compra previa, se creará automáticamente"
                placeholder="Buscar por VIN"
                onValueChange={(_, vehicle) => {
                  const v = vehicle as VehicleResource | undefined;
                  if (v?.owner) {
                    form.setValue("client_id", v.owner.id.toString());
                  }
                }}
              />
            </div>

            <div className="md:col-span-3">
              <FormSelectAsync
                control={form.control}
                name="client_id"
                label="Cliente *"
                placeholder="Seleccionar cliente"
                useQueryHook={useCustomers}
                mapOptionFn={(customer) => ({
                  value: customer.id.toString(),
                  label: `${customer.full_name} - ${customer.num_doc || "S/N"}`,
                })}
                description="Cliente asignado desde el vehículo (puede modificarlo)"
                useFindByIdHook={useCustomersById}
              />
            </div>

            {/* Identificación del comprobante */}
            <FormSelect
              control={form.control}
              name="sunat_concept_document_type_id"
              options={documentTypes.map((type) => ({
                value: type.id.toString(),
                label: type.description,
              }))}
              label="Tipo de Comprobante *"
              placeholder="Seleccionar tipo"
            />

            <FormInput
              control={form.control}
              name="serie"
              label="Serie *"
              placeholder="Ej: F001"
            />

            <FormInput
              control={form.control}
              name="numero"
              label="Número *"
              type="number"
              min="1"
              placeholder="Ej: 2891"
            />

            <FormSelect
              control={form.control}
              name="sede_id"
              options={sedes.map((sede) => ({
                value: sede.id.toString(),
                label: sede.description,
              }))}
              label="Sede *"
              placeholder="Seleccionar sede"
            />

            {/* Datos financieros */}
            <FormSelect
              control={form.control}
              name="sunat_concept_currency_id"
              options={currencyTypesSunat.map((type) => ({
                value: type.id.toString(),
                label: type.description,
              }))}
              label="Moneda del Documento *"
              placeholder="Seleccionar moneda"
            />

            <FormSelect
              control={form.control}
              name="doc_type_currency_id"
              options={currencyTypes.map((type) => ({
                value: type.id.toString(),
                label: `${type.name} (${type.symbol})`,
              }))}
              label="Tipo de Moneda del Documento *"
              placeholder="Seleccionar moneda"
            />

            <FormSelect
              control={form.control}
              name="type_currency_id"
              options={currencyTypes.map((type) => ({
                value: type.id.toString(),
                label: `${type.name} (${type.symbol})`,
              }))}
              label="Moneda de la Cotización *"
              placeholder="Seleccionar moneda"
            />

            <FormInput
              control={form.control}
              name="total"
              label="Total (con IGV) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 45000.00"
              description="Monto total de la venta, con IGV incluido"
            />

            {/* Descripción */}
            <div className="md:col-span-3">
              <FormTextArea
                control={form.control}
                name="descripcion"
                label="Descripción *"
                placeholder="Ej: Venta de vehículo VW Golf 2004 - Stock Inicial"
              />
            </div>
          </GroupFormSection>
        </form>
      </Form>
    </GeneralSheet>
  );
}
