"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, Users } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { assignBulkWorkSchedule } from "../lib/work-schedule.actions";
import {
  workScheduleAssignBulkSchema,
  type WorkScheduleAssignBulkSchema,
} from "../lib/work-schedule.schema";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import { WORK_SCHEDULE } from "../lib/work-schedule.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import { CompanyResource } from "@/features/gp/maestro-general/empresa/lib/company.interface";
import { useSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { usePositions } from "../../../gestion-de-personal/posiciones/lib/position.hook";
import { PositionResource } from "../../../gestion-de-personal/posiciones/lib/position.interface";
import { useAreas } from "../../../gestion-de-personal/areas/lib/area.hook";
import { AreaResource } from "../../../gestion-de-personal/areas/lib/area.interface";
import { useAllWorkers } from "../../../gestion-de-personal/trabajadores/lib/worker.hook";
import { WorkerResource } from "../../../gestion-de-personal/trabajadores/lib/worker.interface";

const { MODEL } = WORK_SCHEDULE;

interface WorkScheduleAssignBulkModalProps {
  open: boolean;
  workScheduleId: number | null;
  onClose: () => void;
}

export function WorkScheduleAssignBulkModal({
  open,
  workScheduleId,
  onClose,
}: WorkScheduleAssignBulkModalProps) {
  const [previewParams, setPreviewParams] = useState<
    Record<string, any> | undefined
  >(undefined);

  const form = useForm<WorkScheduleAssignBulkSchema>({
    resolver: zodResolver(workScheduleAssignBulkSchema) as any,
    defaultValues: {
      cargo_id: null,
      area_id: null,
      sede_id: null,
      empresa_id: null,
    },
    mode: "onChange",
  });

  const { control } = form;

  const [sedeId, cargoId, areaId, empresaId] = useWatch({
    control,
    name: ["sede_id", "cargo_id", "area_id", "empresa_id"],
  });

  const hasFilters = !!(sedeId || cargoId || areaId || empresaId);

  const { data: affectedWorkers, isFetching: loadingWorkers } = useAllWorkers(
    previewParams,
    !!previewParams,
  );

  const handleShowPreview = () => {
    setPreviewParams({
      "filters[sede_id]": sedeId ?? undefined,
      "filters[cargo_id]": cargoId ?? undefined,
      "filters[area_id]": areaId ?? undefined,
      "filters[empresa_id]": empresaId ?? undefined,
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: WorkScheduleAssignBulkSchema) =>
      assignBulkWorkSchedule({
        work_schedule_id: workScheduleId!,
        cargo_id: data.cargo_id ?? undefined,
        area_id: data.area_id ?? undefined,
        sede_id: data.sede_id ?? undefined,
        empresa_id: data.empresa_id ?? undefined,
      }),
    onSuccess: (res) => {
      successToast(res.message);
      form.reset();
      setPreviewParams(undefined);
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "manage"),
      );
    },
  });

  const handleClose = () => {
    form.reset();
    setPreviewParams(undefined);
    onClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Asignar horario masivamente"
      subtitle="Se asignará este horario a todos los trabajadores activos que cumplan los filtros seleccionados."
      icon="Users"
      size="lg"
      childrenFooter={
        <div className="flex w-full justify-end gap-2">
          {form.formState.errors.root && (
            <p className="text-xs text-destructive font-medium mr-auto self-center">
              {form.formState.errors.root.message}
            </p>
          )}
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="assign-bulk-form"
            disabled={isPending || !form.formState.isValid}
          >
            <Loader className={`mr-2 h-4 w-4 ${!isPending ? "hidden" : ""}`} />
            {isPending ? "Asignando..." : "Asignar"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="assign-bulk-form"
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="space-y-4"
        >
          <FormSelectAsync
            control={control}
            name="empresa_id"
            label="Empresa"
            placeholder="Seleccione una empresa"
            useQueryHook={useCompanies}
            mapOptionFn={(company: CompanyResource) => ({
              label: company.name,
              value: String(company.id),
            })}
          />
          <FormSelectAsync
            control={control}
            name="sede_id"
            label="Sede"
            placeholder="Seleccione una sede"
            useQueryHook={useSedes}
            mapOptionFn={(sede: SedeResource) => ({
              label: sede.description,
              value: String(sede.id),
            })}
          />
          <FormSelectAsync
            control={control}
            name="area_id"
            label="Área"
            placeholder="Seleccione un área"
            useQueryHook={useAreas}
            mapOptionFn={(area: AreaResource) => ({
              label: area.name,
              value: String(area.id),
            })}
          />
          <FormSelectAsync
            control={control}
            name="cargo_id"
            label="Posición"
            placeholder="Seleccione una posición"
            useQueryHook={usePositions}
            mapOptionFn={(position: PositionResource) => ({
              label: position.name,
              value: String(position.id),
            })}
          />

          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasFilters || loadingWorkers}
              onClick={handleShowPreview}
              className="w-full"
            >
              {loadingWorkers ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Users className="mr-2 h-4 w-4" />
              )}
              {loadingWorkers ? "Consultando..." : "Mostrar trabajadores afectados"}
            </Button>
          </div>

          {/* Preview panel — only appears after clicking Mostrar */}
          {previewParams && !loadingWorkers && (
            <div className="rounded-lg border bg-muted/30 overflow-hidden">
              {!affectedWorkers?.length ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-6 text-center">
                  <Users className="h-8 w-8 opacity-40" />
                  <p className="text-xs">
                    Ningún trabajador coincide con los filtros seleccionados
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-64 p-2 space-y-1">
                  <p className="text-xs text-muted-foreground px-1 pb-1">
                    {affectedWorkers.length} trabajador
                    {affectedWorkers.length !== 1 ? "es" : ""} afectado
                    {affectedWorkers.length !== 1 ? "s" : ""}
                  </p>
                  {affectedWorkers.map((worker: WorkerResource) => (
                    <div
                      key={worker.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate leading-tight">
                          {worker.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {worker.document}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </Form>
    </GeneralSheet>
  );
}
