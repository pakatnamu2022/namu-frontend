"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useRecruitmentProcesses } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.hook";
import { rehireWorkerSchema, RehireWorkerSchema } from "../lib/selectedWorker.schema.ts";
import { SelectedWorkerResource } from "../lib/selectedWorker.interface.ts";

interface Props {
  worker: SelectedWorkerResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: RehireWorkerSchema) => Promise<void>;
  isLoading?: boolean;
}

export default function RehireSelectedWorkerDialog({
  worker,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const form = useForm<RehireWorkerSchema>({
    resolver: zodResolver(rehireWorkerSchema),
    defaultValues: { proceso_postulacion_id: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) form.reset({ proceso_postulacion_id: "" });
  }, [open, form]);

  const handleClose = () => onOpenChange(false);

  const useOpenProcesses = (params: Record<string, any>) =>
    useRecruitmentProcesses({ ...params, status_id: undefined });

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Reingresar"
      subtitle={worker ? worker.nombre_completo : undefined}
      icon="Redo2"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-4">
          <FormSelectAsync
            control={form.control}
            name="proceso_postulacion_id"
            label="Proceso de postulación"
            placeholder="Seleccionar proceso..."
            useQueryHook={useOpenProcesses}
            mapOptionFn={(p) => ({
              value: String(p.id),
              label: p.nombre_postulacion,
              description: [p.sede, p.cargo].filter(Boolean).join(" · "),
            })}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !form.formState.isValid}>
              <Loader
                className={`mr-2 h-4 w-4 ${!isLoading ? "hidden" : "animate-spin"}`}
              />
              Reingresar
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
