"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { ASSETS } from "../lib/assets.constants";
import { AssetSchema, assetSchemaCreate } from "../lib/assets.schema";
import { useEligibleVehicles, useEligibleVehicleDetail } from "../lib/assets.hook";
import { EligibleVehicle } from "../lib/assets.interface";
import { AssetVehicleDetailPanel } from "./AssetVehicleDetailPanel";

interface Props {
  onSubmit: (data: AssetSchema) => void;
  isSubmitting?: boolean;
}

export const AssetForm = ({ onSubmit, isSubmitting = false }: Props) => {
  const { ABSOLUTE_ROUTE } = ASSETS;
  const [selectedVehicle, setSelectedVehicle] = useState<EligibleVehicle | null>(
    null,
  );

  const form = useForm<AssetSchema>({
    resolver: zodResolver(assetSchemaCreate),
    defaultValues: {
      ap_vehicle_id: "",
      worker_id: "",
      assigned_date: "",
      observation: "",
    },
    mode: "onChange",
  });

  const selectedVehicleId = form.watch("ap_vehicle_id");
  const { data: detail, isFetching: isLoadingDetail } = useEligibleVehicleDetail(
    selectedVehicleId ? Number(selectedVehicleId) : null,
  );

  // Fecha mínima = fecha de recepción del vehículo (guía de recepción de compra).
  const minDate = useMemo(() => {
    const received = detail?.reception?.received_date;
    if (!received) return undefined;
    const d = new Date(received);
    return isNaN(d.getTime())
      ? undefined
      : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, [detail?.reception?.received_date]);

  // Fecha máxima = hoy.
  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  // Al cargar el detalle, precargar la fecha con la fecha de recepción.
  useEffect(() => {
    if (!minDate) return;
    const y = minDate.getFullYear();
    const m = String(minDate.getMonth() + 1).padStart(2, "0");
    const day = String(minDate.getDate()).padStart(2, "0");
    form.setValue("assigned_date", `${y}-${m}-${day}`, {
      shouldValidate: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDate]);

  const hasAssetAccount = detail
    ? detail.has_asset_account
    : (selectedVehicle?.has_asset_account ?? true);
  const missingAssetAccount = !!selectedVehicleId && !hasAssetAccount;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelectAsync
            name="ap_vehicle_id"
            label="VIN"
            placeholder="Buscar por VIN o placa"
            control={form.control}
            required
            withValue={false}
            perPage={20}
            debounceMs={400}
            useQueryHook={useEligibleVehicles as any}
            mapOptionFn={(item: EligibleVehicle) => ({
              value: item.id.toString(),
              label: `${item.vin}${item.plate ? " · " + item.plate : ""}`,
              description: [item.brand, item.model, item.sede]
                .filter(Boolean)
                .join(" · "),
            })}
            onValueChange={(_value, item?: EligibleVehicle) =>
              setSelectedVehicle(item ?? null)
            }
          />

          <FormSelectAsync
            name="worker_id"
            label="Responsable"
            placeholder="Buscar trabajador"
            control={form.control}
            required
            useQueryHook={useWorkers}
            additionalParams={{ status_id: 22 }}
            mapOptionFn={(item: any) => ({
              value: item.id.toString(),
              label: item.name,
            })}
          />

          <DatePickerFormField
            control={form.control}
            name="assigned_date"
            label="Fecha de asignación"
            disabled={!selectedVehicleId || isLoadingDetail}
            disabledRange={[
              ...(minDate ? [{ before: minDate }] : []),
              { after: today },
            ]}
            startMonth={minDate}
            endMonth={today}
            description={
              minDate
                ? "Entre la fecha de recepción del vehículo y hoy."
                : "No puede ser posterior a hoy."
            }
          />

          {missingAssetAccount && (
            <div className="md:col-span-2 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <TriangleAlert className="size-4 mt-0.5 shrink-0" />
              <span>
                El almacén de este vehículo no tiene configurada la{" "}
                <strong>Cuenta de Activos</strong>. Configúrela en Almacenes
                antes de registrar el activo.
              </span>
            </div>
          )}

          {selectedVehicleId && (
            <div className="md:col-span-2">
              <AssetVehicleDetailPanel
                detail={detail}
                isLoading={isLoadingDetail}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="observation"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Observación (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Detalle del activo..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE!}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={
              isSubmitting || !form.formState.isValid || missingAssetAccount
            }
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : "animate-spin"}`}
            />
            {isSubmitting ? "Guardando" : "Registrar Activo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
