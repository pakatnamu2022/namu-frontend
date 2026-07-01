"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FormInput } from "@/shared/components/FormInput";
import { workerSchemaUpdate } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.schema.ts";
import { Calendar, Clock, Loader, PenLine, User } from "lucide-react";
import { Link } from "react-router-dom";
import { WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.constant.ts";
import { SignaturePad } from "@/features/ap/post-venta/taller/inspeccion-vehiculo/components/SignaturePad";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import {
  useWorkers,
  useWorkerById,
} from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { WorkerScheduleInfo } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/components/WorkerScheduleInfo";
import type { WorkScheduleResource } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.interface";
import { useWorkSchedules } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.hook";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { usePositions } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.hook";
import { WorkerAttendanceExclusion } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/components/WorkerAttendanceExclusion";

const useWorkSchedulesSelect = (params: {
  search?: string;
  per_page?: number;
  page?: number;
}) => useWorkSchedules({ name: params.search, per_page: params.per_page, page: params.page });

const usePositionsSelect = (params: {
  search?: string;
  per_page?: number;
  page?: number;
}) => usePositions({ name: params.search, per_page: params.per_page, page: params.page });

interface WorkerFormProps {
  defaultValues: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  workSchedule?: WorkScheduleResource;
  workerId?: number;
  workerName?: string;
}

export const WorkerForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  workSchedule,
  workerId,
  workerName,
}: WorkerFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = WORKER;

  const { data: sedesData } = useAllSedes();
  const sedeOptions = (sedesData ?? []).map((s) => ({
    value: s.description,
    label: s.description,
    description: s.suc_abrev,
  }));

  const { data: supervisor } = useWorkerById(
    defaultValues.supervisor_id ? Number(defaultValues.supervisor_id) : 0
  );

  const supervisorDefaultOption = supervisor
    ? {
        value: supervisor.id.toString(),
        label: supervisor.name,
        description: `${supervisor.document} - ${supervisor.position}`,
      }
    : undefined;

  const workScheduleDefaultOption = workSchedule
    ? { value: workSchedule.id.toString(), label: workSchedule.name }
    : undefined;

  const form = useForm<any>({
    resolver: zodResolver(workerSchemaUpdate) as any,
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

          {/* Left: datos del trabajador + firma */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <GroupFormSection
              title="Datos del Trabajador"
              icon={User}
              color="slate"
              cols={{ sm: 2 }}
            >
              <FormInput
                control={form.control}
                name="name"
                label="Nombre"
                placeholder="Ej: Juan Pérez"
              />
              <FormInput
                control={form.control}
                name="document"
                label="Documento"
                placeholder="Ej: 12345678"
              />
              <FormSelect
                control={form.control}
                name="sede"
                label="Sede"
                placeholder="Seleccionar sede..."
                options={sedeOptions}
              />
              <FormSelectAsync
                control={form.control}
                name="position"
                label="Cargo"
                placeholder="Buscar cargo..."
                useQueryHook={usePositionsSelect}
                mapOptionFn={(pos) => ({
                  value: pos.name,
                  label: pos.name,
                  description: pos.area,
                })}
                perPage={10}
                debounceMs={400}
                defaultOption={
                  defaultValues.position
                    ? { value: defaultValues.position, label: defaultValues.position }
                    : undefined
                }
              />
            </GroupFormSection>

            <GroupFormSection
              title="Firma del Trabajador"
              icon={PenLine}
              color="blue"
              cols={{ sm: 1 }}
            >
              <FormSelectAsync
                control={form.control}
                name="supervisor_id"
                label="Supervisor"
                placeholder="Buscar supervisor..."
                useQueryHook={useWorkers}
                mapOptionFn={(worker) => ({
                  value: worker.id.toString(),
                  label: worker.name,
                  description: `${worker.document} - ${worker.position}`,
                })}
                perPage={10}
                debounceMs={500}
                defaultOption={supervisorDefaultOption}
              />

              <FormField
                control={form.control}
                name="worker_signature"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SignaturePad
                        label="Firma del Trabajador"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GroupFormSection>
          </div>

          {/* Right: horario + configuración de asistencia */}
          <div className="flex flex-col gap-4">
            {workSchedule ? (
              <WorkerScheduleInfo schedule={workSchedule} />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md border border-muted px-3 py-3">
                <Calendar className="h-4 w-4 shrink-0" />
                Sin horario configurado
              </div>
            )}

            <GroupFormSection
              title="Configuración de Asistencia"
              icon={Clock}
              color="violet"
              cols={{ sm: 1 }}
            >
              <FormSelectAsync
                control={form.control}
                name="work_schedule_id"
                label="Asignar horario"
                placeholder="Buscar horario..."
                useQueryHook={useWorkSchedulesSelect}
                mapOptionFn={(ws) => ({ value: ws.id.toString(), label: ws.name })}
                perPage={10}
                debounceMs={400}
                defaultOption={workScheduleDefaultOption}
                allowClear
              />

              {workerId && (
                <WorkerAttendanceExclusion
                  workerId={workerId}
                  workerName={workerName ?? defaultValues.name ?? ""}
                />
              )}
            </GroupFormSection>
          </div>
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
            {isSubmitting ? "Guardando" : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
