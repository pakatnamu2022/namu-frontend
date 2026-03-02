"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  CompanySchema,
  companySchemaCreate,
  companySchemaUpdate,
} from "../lib/company.schema";
import { COMPANY } from "../lib/company.constants";
import { FormInput } from "@/shared/components/FormInput";

interface CompanyFormProps {
  defaultValues: Partial<CompanySchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const CompanyForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: CompanyFormProps) => {
  const { ABSOLUTE_ROUTE } = COMPANY;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? companySchemaCreate : companySchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput
            control={form.control}
            name="name"
            label="Nombre"
            placeholder="Ej: Transportes Pakatnamú"
          />

          <FormInput
            control={form.control}
            name="abbreviation"
            label="Abreviatura"
            placeholder="Ej: TP"
          />

          <FormInput
            control={form.control}
            name="businessName"
            label="Razón Social"
            placeholder="Ej: TRANSPORTES PAKATNAMÚ S.A.C."
          />

          <FormInput
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Descripción de la empresa"
          />

          <FormInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="ej: example@pakatnamu.com"
          />

          <FormInput
            control={form.control}
            name="phone"
            label="Teléfono"
            placeholder="Ej: 074-123456"
          />

          <FormInput
            control={form.control}
            name="address"
            label="Dirección"
            placeholder="Dirección de la empresa"
          />

          <FormInput
            control={form.control}
            name="city"
            label="Ciudad"
            placeholder="Ej: Chiclayo"
          />

          <FormInput
            control={form.control}
            name="website"
            label="Sitio Web"
            placeholder="https://www.empresa.com"
          />

          <FormInput
            control={form.control}
            name="detraction_amount"
            label="Monto de detracción"
            placeholder="Ej: 100.00"
          />

          {/* <FormSelect
            name="billing_detraction_type_id"
            label="Tipo de detracción"
            placeholder="Selecciona un tipo"
            options={companies.map((company) => ({
              label: company.name,
              value: company.id.toString(),
            }))}
            control={form.control}
          /> */}
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Empresa"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
