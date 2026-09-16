"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { useApplicants } from "../../postulantes/lib/applicant.hook.ts";
import { useUsers } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import {
  interviewSchemaCreate,
  InterviewSchema,
} from "../lib/interview.schema.ts";
import { INTERVIEW_PHASE, INTERVIEW_PHASE_OPTIONS } from "../lib/interview.constant.ts";

interface Props {
  processId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: InterviewSchema) => Promise<void>;
  isLoading?: boolean;
}

export default function InterviewFormDialog({
  processId,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const form = useForm<InterviewSchema>({
    resolver: zodResolver(interviewSchemaCreate),
    defaultValues: {
      proceso_postulacion_id: processId ?? "",
      persona_id: "",
      fase: String(INTERVIEW_PHASE.RRHH),
      entrevistador_id: "",
      fecha_entrevista: "",
      observaciones: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        proceso_postulacion_id: processId ?? "",
        persona_id: "",
        fase: String(INTERVIEW_PHASE.RRHH),
        entrevistador_id: "",
        fecha_entrevista: "",
        observaciones: "",
      });
    }
  }, [open, processId, form]);

  const useApplicantsByProcess = (params: Record<string, any>) =>
    useApplicants({ ...params, proceso_postulacion_id: processId ?? undefined });

  const handleClose = () => onOpenChange(false);

  const submit = async (data: InterviewSchema) => {
    await onConfirm(data);
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Registrar entrevista"
      subtitle="Etapa de entrevista por competencias del proceso"
      icon="MessageSquareQuote"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <FormSelectAsync
            control={form.control}
            name="persona_id"
            label="Postulante"
            placeholder="Seleccionar postulante..."
            useQueryHook={useApplicantsByProcess}
            mapOptionFn={(a) => ({
              value: String(a.id),
              label: a.nombre_completo,
              description: a.estado_postulante,
            })}
            required
          />
          <FormSelect
            control={form.control}
            name="fase"
            label="Fase"
            placeholder="Seleccionar fase..."
            options={INTERVIEW_PHASE_OPTIONS}
            required
          />
          <FormSelectAsync
            control={form.control}
            name="entrevistador_id"
            label="Entrevistador"
            placeholder="Seleccionar entrevistador..."
            useQueryHook={useUsers}
            mapOptionFn={(u) => ({
              value: String(u.id),
              label: u.name,
              description: u.position || "",
            })}
          />
          <DateTimePickerForm
            control={form.control}
            name="fecha_entrevista"
            label="Fecha y hora de entrevista"
            placeholder="Seleccione fecha y hora"
          />
          <FormTextArea
            control={form.control}
            name="observaciones"
            label="Observaciones"
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
              Guardar
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
