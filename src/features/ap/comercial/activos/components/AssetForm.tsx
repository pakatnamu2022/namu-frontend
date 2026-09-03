"use client";

import { useState } from "react";
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
import { Car, Loader, PackageCheck, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { ASSETS } from "../lib/assets.constants";
import { AssetSchema, assetSchemaCreate } from "../lib/assets.schema";
import { useEligibleVehicles } from "../lib/assets.hook";
import { EligibleVehicle } from "../lib/assets.interface";

interface Props {
  onSubmit: (data: AssetSchema) => void;
  isSubmitting?: boolean;
}

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || "—"}</p>
  </div>
);

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
      observation: "",
    },
    mode: "onChange",
  });

  const missingAssetAccount =
    !!selectedVehicle && !selectedVehicle.has_asset_account;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormSelectAsync
              name="ap_vehicle_id"
              label="Vehículo (INVENTARIO VN, sin cotización)"
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
          </div>

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

          {selectedVehicle && (
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4 shadow-sm">
              <div className="sm:col-span-2 flex items-center gap-2 text-sm font-semibold">
                <Car className="size-4 text-muted-foreground" />
                Información del vehículo
              </div>
              <Field label="VIN" value={selectedVehicle.vin} />
              <Field label="Placa" value={selectedVehicle.plate} />
              <Field
                label="Marca / Modelo"
                value={[selectedVehicle.brand, selectedVehicle.model]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <Field
                label="Año"
                value={selectedVehicle.year ? String(selectedVehicle.year) : null}
              />
              <Field label="Color" value={selectedVehicle.color} />
              <Field
                label="Almacén / Sede"
                value={[selectedVehicle.warehouse, selectedVehicle.sede]
                  .filter(Boolean)
                  .join(" · ")}
              />

              <div className="sm:col-span-2 flex items-center gap-2 text-sm font-semibold pt-2">
                <PackageCheck className="size-4 text-muted-foreground" />
                Recepción de compra
              </div>
              {selectedVehicle.reception ? (
                <>
                  <Field
                    label="Guía de recepción"
                    value={selectedVehicle.reception.number}
                  />
                  <Field
                    label="Fecha de emisión (fecha de asignación)"
                    value={selectedVehicle.reception.issue_date}
                  />
                  <Field
                    label="Fecha de recepción"
                    value={selectedVehicle.reception.received_date}
                  />
                </>
              ) : (
                <p className="sm:col-span-2 text-sm text-muted-foreground">
                  Sin guía de recepción de compra registrada. Se usará la fecha
                  actual como fecha de asignación.
                </p>
              )}
            </div>
          )}

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
