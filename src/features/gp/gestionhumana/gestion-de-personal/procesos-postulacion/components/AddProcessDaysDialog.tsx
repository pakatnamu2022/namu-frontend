"use client";

import { useEffect, useState } from "react";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FilterMultiSelect } from "@/shared/components/FilterMultiSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useAllRecruitmentProcesses } from "../lib/recruitmentProcess.hook.ts";
import {
  addProcessDaysSchema,
  AddProcessDaysSchema,
} from "../lib/recruitmentProcess.schema.ts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: AddProcessDaysSchema) => Promise<void>;
  isLoading?: boolean;
}

export default function AddProcessDaysDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const { data: processes, isLoading: isLoadingProcesses } =
    useAllRecruitmentProcesses({ status_id: undefined });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const form = useForm<any>({
    resolver: zodResolver(addProcessDaysSchema) as any,
    defaultValues: { proceso_postulacion_ids: [], dias: 1, motivo: "" },
    mode: "onChange",
  });

  useEffect(() => {
    form.setValue("proceso_postulacion_ids", selectedIds, {
      shouldValidate: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  const handleClose = () => {
    form.reset({ proceso_postulacion_ids: [], dias: 1, motivo: "" });
    setSelectedIds([]);
    onOpenChange(false);
  };

  const submit = async (data: AddProcessDaysSchema) => {
    await onConfirm({ ...data, dias: Number(data.dias) });
    handleClose();
  };

  const options = (processes ?? [])
    .filter((p) => p.is_open)
    .map((p) => ({
      value: String(p.id),
      label: p.nombre_postulacion,
      description: [p.sede, p.cargo].filter(Boolean).join(" · "),
    }));

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Agregar días a procesos"
      subtitle="Extiende el plazo de uno o varios procesos abiertos a la vez"
      icon="CalendarPlus"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <FilterMultiSelect
            value={selectedIds}
            onChange={setSelectedIds}
            options={options}
            label="Procesos"
            placeholder="Seleccionar procesos..."
            isLoadingOptions={isLoadingProcesses}
          />
          <FormInput
            control={form.control}
            name="dias"
            label="Días adicionales"
            type="number"
            min="1"
            max="60"
            required
          />
          <FormTextArea
            control={form.control}
            name="motivo"
            label="Motivo"
            required
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid || selectedIds.length === 0}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isLoading ? "hidden" : "animate-spin"}`}
              />
              Agregar días
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
