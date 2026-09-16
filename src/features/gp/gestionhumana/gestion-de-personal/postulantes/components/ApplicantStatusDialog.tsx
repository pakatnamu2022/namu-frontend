"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { Badge } from "@/components/ui/badge";
import {
  applicantStatusSchema,
  ApplicantStatusSchema,
} from "../lib/applicant.schema.ts";
import { APPLICANT_STATUS_OPTIONS } from "../lib/applicant.constant.ts";
import { ApplicantResource } from "../lib/applicant.interface.ts";
import { useInterviews } from "../../procesos-postulacion/lib/interview.hook.ts";
import { INTERVIEW_PHASE } from "../../procesos-postulacion/lib/interview.constant.ts";

interface Props {
  applicant: ApplicantResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ApplicantStatusSchema) => Promise<void>;
  isLoading?: boolean;
}

export default function ApplicantStatusDialog({
  applicant,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const form = useForm<ApplicantStatusSchema>({
    resolver: zodResolver(applicantStatusSchema),
    defaultValues: {
      tipo_trabajador_id: "",
      motivo_status: "",
      fecha_inicio: "",
      presupuesto: "",
    },
    mode: "onChange",
  });

  const selectedType = form.watch("tipo_trabajador_id");
  const isSelected = String(selectedType) === "6";

  const { data: interviewsData } = useInterviews(
    {
      persona_id: applicant?.id,
      proceso_postulacion_id: applicant?.proceso_postulacion_id,
    },
    { enabled: open && !!applicant },
  );
  const rrhhInterview = interviewsData?.data.find(
    (i) => i.fase === INTERVIEW_PHASE.RRHH,
  );
  const jefeInterview = interviewsData?.data.find(
    (i) => i.fase === INTERVIEW_PHASE.JEFE,
  );

  useEffect(() => {
    if (open) {
      form.reset({
        tipo_trabajador_id: applicant?.tipo_trabajador_id
          ? String(applicant.tipo_trabajador_id)
          : "",
        motivo_status: applicant?.motivo_status ?? "",
        fecha_inicio: "",
        presupuesto: "",
      });
    }
  }, [open, applicant, form]);

  const submit = async (data: ApplicantStatusSchema) => {
    await onConfirm(data);
  };

  const handleClose = () => onOpenChange(false);

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Cambiar estado del postulante"
      subtitle={
        applicant
          ? `${applicant.nombre_completo} — ${applicant.proceso}`
          : undefined
      }
      icon="ShieldCheck"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          {open && applicant && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground">Entrevistas:</span>
              <Badge color={rrhhInterview?.resultado_promedio != null ? "green" : rrhhInterview ? "amber" : "tertiary"}>
                RRHH{" "}
                {rrhhInterview
                  ? rrhhInterview.resultado_promedio != null
                    ? `· ${Number(rrhhInterview.resultado_promedio).toFixed(2)}`
                    : "· sin calificar"
                  : "· no registrada"}
              </Badge>
              <Badge color={jefeInterview?.resultado_promedio != null ? "green" : jefeInterview ? "amber" : "tertiary"}>
                Jefe{" "}
                {jefeInterview
                  ? jefeInterview.resultado_promedio != null
                    ? `· ${Number(jefeInterview.resultado_promedio).toFixed(2)}`
                    : "· sin calificar"
                  : "· no registrada"}
              </Badge>
            </div>
          )}
          <FormSelect
            control={form.control}
            name="tipo_trabajador_id"
            label="Nuevo estado"
            placeholder="Seleccionar estado..."
            options={APPLICANT_STATUS_OPTIONS}
            required
          />
          <FormInput
            control={form.control}
            name="motivo_status"
            label="Motivo / observación"
          />

          {isSelected && (
            <>
              <FormInput
                control={form.control}
                name="fecha_inicio"
                label="Fecha de ingreso"
                type="date"
                required
              />
              <FormInput
                control={form.control}
                name="presupuesto"
                label="Presupuesto asignado"
                type="number"
                required
              />
              <p className="text-xs text-muted-foreground">
                Al seleccionar se generará y enviará automáticamente la carta
                oferta al correo del postulante.
              </p>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
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
