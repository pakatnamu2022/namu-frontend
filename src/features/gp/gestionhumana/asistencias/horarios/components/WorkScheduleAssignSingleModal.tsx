"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import { WORK_SCHEDULE } from "../lib/work-schedule.constants";
import {
  workScheduleAssignSingleSchema,
  type WorkScheduleAssignSingleSchema,
} from "../lib/work-schedule.schema";
import { useAssignWorkSchedule } from "../lib/work-schedule.hook";
import { useWorkSchedules } from "../lib/work-schedule.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import type { WorkScheduleResource } from "../lib/work-schedule.interface";

const { MODEL } = WORK_SCHEDULE;

interface WorkScheduleAssignSingleModalProps {
  open: boolean;
  workerId: number | null;
  workerName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WorkScheduleAssignSingleModal({
  open,
  workerId,
  workerName,
  onClose,
  onSuccess,
}: WorkScheduleAssignSingleModalProps) {
  const form = useForm<WorkScheduleAssignSingleSchema>({
    resolver: zodResolver(workScheduleAssignSingleSchema),
    defaultValues: { work_schedule_id: "" },
    mode: "onChange",
  });

  const { control } = form;

  const { mutate, isPending } = useAssignWorkSchedule();

  const handleSubmit = (data: WorkScheduleAssignSingleSchema) => {
    if (!workerId) return;
    mutate(
      { workerId, workScheduleId: Number(data.work_schedule_id) },
      {
        onSuccess: (res) => {
          successToast(res.message);
          form.reset();
          onSuccess?.();
          onClose();
        },
        onError: (error: any) => {
          errorToast(
            error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "manage"),
          );
        },
      },
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Asignar horario"
      subtitle={
        workerName
          ? `Asignar un horario de trabajo a ${workerName}`
          : "Asignar un horario de trabajo al trabajador seleccionado"
      }
      icon="Clock"
      size="sm"
      childrenFooter={
        <div className="flex w-full justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="assign-single-form"
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
          id="assign-single-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <FormSelectAsync
            control={control}
            name="work_schedule_id"
            label="Horario de trabajo"
            placeholder="Seleccione un horario"
            useQueryHook={useWorkSchedules as any}
            mapOptionFn={(schedule: WorkScheduleResource) => ({
              label: schedule.name,
              value: String(schedule.id),
              description: `${schedule.checkin} — ${schedule.checkout}`,
            })}
          />
        </form>
      </Form>
    </GeneralSheet>
  );
}
