"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader, Tags } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import {
  ContractTypeSchema,
  contractTypeSchemaCreate,
  contractTypeSchemaUpdate,
} from "../lib/contractType.schema.ts";
import { CONTRACT_TYPE } from "../lib/contractType.constant.ts";

interface ContractTypeFormProps {
  defaultValues: Partial<ContractTypeSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ContractTypeForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ContractTypeFormProps) => {
  const { ABSOLUTE_ROUTE } = CONTRACT_TYPE;

  const form = useForm<any>({
    resolver: zodResolver(
      mode === "create" ? contractTypeSchemaCreate : contractTypeSchemaUpdate,
    ) as any,
    defaultValues: {
      descripcion: "",
      anios: "",
      dias_vacaciones: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <GroupFormSection
          title="Datos del Tipo de Contrato"
          icon={Tags}
          color="blue"
          cols={{ sm: 2 }}
        >
          <FormInput
            control={form.control}
            name="descripcion"
            label="Descripción"
            required
            placeholder="Ej: Contrato a plazo fijo"
          />
          <FormInput
            control={form.control}
            name="anios"
            label="Años de duración"
            type="number"
            min="0"
          />
          <FormInput
            control={form.control}
            name="dias_vacaciones"
            label="Días de vacaciones"
            type="number"
            min="0"
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
            {isSubmitting ? "Guardando" : "Guardar Tipo de Contrato"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
