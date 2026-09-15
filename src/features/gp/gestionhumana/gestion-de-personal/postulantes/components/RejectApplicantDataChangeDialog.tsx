"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormTextArea } from "@/shared/components/FormTextArea";
import {
  applicantDataChangeRejectSchema,
  ApplicantDataChangeRejectSchema,
} from "../lib/applicantDataChange.schema.ts";
import { ApplicantDataChangeResource } from "../lib/applicantDataChange.interface.ts";

interface Props {
  change: ApplicantDataChangeResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ApplicantDataChangeRejectSchema) => Promise<void>;
  isLoading?: boolean;
}

export default function RejectApplicantDataChangeDialog({
  change,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const form = useForm<ApplicantDataChangeRejectSchema>({
    resolver: zodResolver(applicantDataChangeRejectSchema),
    defaultValues: { motivo: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) form.reset({ motivo: "" });
  }, [open, form]);

  const handleClose = () => onOpenChange(false);

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Rechazar cambio de ficha"
      subtitle={change?.applicant?.nombre_completo}
      icon="X"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-4">
          <FormTextArea
            control={form.control}
            name="motivo"
            label="Motivo del rechazo"
            required
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
              Rechazar
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
