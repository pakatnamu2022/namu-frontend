"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Loader, FileCode } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import {
  ContractTemplateSchema,
  contractTemplateSchemaCreate,
  contractTemplateSchemaUpdate,
} from "../lib/contractTemplate.schema.ts";
import {
  CONTRACT_TEMPLATE,
  CONTRACT_TEMPLATE_PLACEHOLDERS,
} from "../lib/contractTemplate.constant.ts";

interface ContractTemplateFormProps {
  defaultValues: Partial<ContractTemplateSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ContractTemplateForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ContractTemplateFormProps) => {
  const { ABSOLUTE_ROUTE } = CONTRACT_TEMPLATE;

  const form = useForm<any>({
    resolver: zodResolver(
      mode === "create"
        ? contractTemplateSchemaCreate
        : contractTemplateSchemaUpdate,
    ) as any,
    defaultValues: {
      nombre: "",
      descripcion: "",
      contenido: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const insertToken = (token: string) => {
    const current = form.getValues("contenido") ?? "";
    form.setValue("contenido", `${current}${token}`, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <GroupFormSection
          title="Datos de la Plantilla"
          icon={FileCode}
          color="blue"
          cols={{ sm: 2 }}
        >
          <FormInput
            control={form.control}
            name="nombre"
            label="Nombre"
            required
            placeholder="Ej: Contrato a plazo fijo - Ventas"
          />
          <FormInput
            control={form.control}
            name="descripcion"
            label="Descripción"
            placeholder="Ej: Plantilla para el área comercial"
          />
        </GroupFormSection>

        <GroupFormSection
          title="Contenido"
          icon={FileCode}
          color="violet"
          cols={{ sm: 1 }}
        >
          <div className="flex flex-wrap gap-1.5">
            {CONTRACT_TEMPLATE_PLACEHOLDERS.map(({ token, label }) => (
              <Badge
                key={token}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                title={label}
                onClick={() => insertToken(token)}
              >
                {token}
              </Badge>
            ))}
          </div>
          <FormTextArea
            control={form.control}
            name="contenido"
            label="Contenido HTML del contrato"
            required
            rows={16}
            placeholder="Escriba el contenido del contrato usando los placeholders de arriba..."
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : "animate-spin"}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Plantilla"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
