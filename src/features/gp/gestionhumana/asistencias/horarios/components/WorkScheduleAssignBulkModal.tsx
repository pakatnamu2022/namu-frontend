"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { GeneralModal } from "@/shared/components/GeneralModal";
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
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Asignar horario masivamente"
      subtitle="Se asignará este horario a todos los trabajadores activos que cumplan los filtros seleccionados. Debe indicar al menos un filtro."
      icon="Users"
      size="lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="space-y-4 py-2"
        >
          <div className="grid grid-cols-1 gap-4">
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
                label: sede.suc_abrev,
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
          </div>

          {form.formState.errors.root && (
            <p className="text-xs text-destructive font-medium">
              {form.formState.errors.root.message}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isPending ? "hidden" : ""}`}
              />
              {isPending ? "Asignando..." : "Asignar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
