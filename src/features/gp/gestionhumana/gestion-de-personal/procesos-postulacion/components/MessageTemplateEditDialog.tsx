"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSwitch } from "@/shared/components/FormSwitch";
import {
  messageTemplateSchema,
  MessageTemplateSchema,
} from "../lib/messageTemplate.schema.ts";

interface Props {
  open: boolean;
  title?: string;
  subtitle?: string;
  defaultValues: MessageTemplateSchema;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: MessageTemplateSchema) => Promise<void>;
  isLoading?: boolean;
}

const PLACEHOLDERS_HINT =
  "Placeholders disponibles: {$postulante}, {$proceso}, {$cargo}, {$area}, {$sede}, {$solicitante}, {$detalle}";

export default function MessageTemplateEditDialog({
  open,
  title,
  subtitle,
  defaultValues,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const form = useForm<MessageTemplateSchema>({
    resolver: zodResolver(messageTemplateSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (open) form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const submit = async (data: MessageTemplateSchema) => {
    await onConfirm(data);
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title={title ?? "Editar mensaje automático"}
      subtitle={subtitle}
      icon="Mail"
      size="xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <FormSwitch
            control={form.control}
            name="activo"
            text="Mensaje activo"
            textDescription="Si está desactivado, no se enviará el correo automático."
          />
          <FormInput
            control={form.control}
            name="asunto"
            label="Asunto"
            required
          />
          <FormTextArea
            control={form.control}
            name="contenido"
            label="Contenido (HTML permitido)"
            description={PLACEHOLDERS_HINT}
            required
            rows={8}
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
