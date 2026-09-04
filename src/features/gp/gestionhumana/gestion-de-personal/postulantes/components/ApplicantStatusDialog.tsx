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
import {
  applicantStatusSchema,
  ApplicantStatusSchema,
} from "../lib/applicant.schema.ts";
import { APPLICANT_STATUS_OPTIONS } from "../lib/applicant.constant.ts";
import { ApplicantResource } from "../lib/applicant.interface.ts";

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
    defaultValues: { tipo_trabajador_id: "", motivo_status: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        tipo_trabajador_id: applicant?.tipo_trabajador_id
          ? String(applicant.tipo_trabajador_id)
          : "",
        motivo_status: applicant?.motivo_status ?? "",
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
