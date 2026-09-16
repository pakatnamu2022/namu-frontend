"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormTextArea } from "@/shared/components/FormTextArea";
import {
  pauseProcessSchema,
  PauseProcessSchema,
} from "../lib/recruitmentProcess.schema.ts";
import { RecruitmentProcessResource } from "../lib/recruitmentProcess.interface.ts";

interface Props {
  process: RecruitmentProcessResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: PauseProcessSchema) => Promise<void>;
  isLoading?: boolean;
}

export default function PauseProcessDialog({
  process,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const form = useForm<PauseProcessSchema>({
    resolver: zodResolver(pauseProcessSchema),
    defaultValues: { motivo: "" },
    mode: "onChange",
  });

  const handleClose = () => {
    form.reset({ motivo: "" });
    onOpenChange(false);
  };

  const submit = async (data: PauseProcessSchema) => {
    await onConfirm(data);
    form.reset({ motivo: "" });
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Pausar proceso"
      subtitle={process?.nombre_postulacion}
      icon="PauseCircle"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            El plazo del proceso dejará de correr hasta que se reanude. Los
            días hábiles de pausa se sumarán automáticamente al plazo al
            reanudar.
          </p>
          <FormTextArea
            control={form.control}
            name="motivo"
            label="Motivo de la pausa"
            required
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !form.formState.isValid}>
              <Loader
                className={`mr-2 h-4 w-4 ${!isLoading ? "hidden" : "animate-spin"}`}
              />
              Pausar
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
