"use client";

import { useForm } from "react-hook-form";
import {
  PerDiemRequestSchema,
  PerDiemRequestSchemaUpdate,
  perDiemRequestSchemaCreate,
  perDiemRequestSchemaUpdate,
} from "../lib/perDiemRequest.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useGetAllPerDiemCategory } from "../../../gp/gestionhumana/viaticos/categoria-viaticos/lib/perDiemCategory.hook";
import { useUserCompanies } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { useAllDistrict } from "@/features/gp/gestionsistema/ubicaciones/lib/location.hook";
import { useAllCompanies } from "@/features/gp/gestionsistema/empresa/lib/company.hook";
import { FormInputText } from "@/shared/components/FormInputText";

interface PerDiemRequestFormProps {
  defaultValues: Partial<PerDiemRequestSchema | PerDiemRequestSchemaUpdate>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

const districtDestinationIds = [
  "1300",
  "1295",
  "1286",
  "1549",
  "1227",
  "558",
  "1827",
  "631",
]; // IDs de departamentos para destino

export const PerDiemRequestForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: PerDiemRequestFormProps) => {
  const form = useForm<PerDiemRequestSchema | PerDiemRequestSchemaUpdate>({
    resolver: zodResolver(
      mode === "create"
        ? perDiemRequestSchemaCreate
        : perDiemRequestSchemaUpdate
    ) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  useGetAllPerDiemCategory();
  const { data: myCompanies = [], isLoading: isLoadingMyCompanies } =
    useUserCompanies();
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useAllCompanies();
  const { data: districts = [], isLoading: isLoadingDistricts } =
    useAllDistrict({
      id: districtDestinationIds,
    });

  useEffect(() => {
    if (mode === "update" && Object.keys(defaultValues).length > 0) {
      form.reset(defaultValues, {
        keepDefaultValues: true,
      });
      setTimeout(() => {
        form.trigger();
      }, 0);
    }
  }, [defaultValues, mode, form]);

  // Seleccionar automáticamente la empresa si solo hay una
  useEffect(() => {
    if (myCompanies.length === 1 && !form.getValues("company_id")) {
      form.setValue("company_id", myCompanies[0].id.toString());
    }
  }, [myCompanies, form]);

  if (isLoadingMyCompanies || isLoadingDistricts || isLoadingCompanies)
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            name="company_id"
            label="Mi Empresa"
            placeholder="Selecciona una empresa"
            options={myCompanies
              .filter((item) => item?.id && item?.name)
              .map((item) => ({
                label: item.name,
                value: item.id.toString(),
              }))}
            control={form.control}
          />

          <FormSelect
            name="company_service_id"
            label="Empresa Brinda Servicio"
            placeholder="Selecciona una empresa"
            options={companies
              .filter((item) => item?.id && item?.name)
              .map((item) => ({
                label: item.name,
                value: item.id.toString(),
              }))}
            control={form.control}
          />

          <DatePickerFormField
            control={form.control}
            name="start_date"
            label="Fecha de Inicio"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={{
              before: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 21);
                return date;
              })(),
            }}
          />

          <DatePickerFormField
            control={form.control}
            name="end_date"
            label="Fecha de Fin"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={{
              before: form.watch("start_date")
                ? new Date(form.watch("start_date"))
                : new Date(),
            }}
          />
        </div>

        <FormSelect
          name="district_id"
          label="Destino"
          placeholder="Selecciona un distrito"
          options={districts.map((item) => ({
            label: item.name + " - " + item.ubigeo,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
        />

        <FormInputText
          name="purpose"
          label="Propósito"
          placeholder="Describa el propósito del viático..."
          control={form.control}
        />

        <FormInputText
          name="notes"
          label="Notas (Opcional)"
          placeholder="Observaciones o notas adicionales sobre esta solicitud..."
          control={form.control}
        />

        <div className="flex gap-4 w-full justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting ? "Guardando..." : "Guardar Solicitud"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
