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
import { useEffect, useMemo } from "react";
import { DateRangePickerFormField } from "@/shared/components/DateRangePickerFormField";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useGetAllPerDiemCategory } from "../../../gp/gestionhumana/viaticos/categoria-viaticos/lib/perDiemCategory.hook";
import { useUserCompanies } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { FormInputText } from "@/shared/components/FormInputText";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";

interface PerDiemRequestFormProps {
  defaultValues: Partial<PerDiemRequestSchema | PerDiemRequestSchemaUpdate>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const PerDiemRequestForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: PerDiemRequestFormProps) => {
  const MIN_DAYS = 18;
  const form = useForm<PerDiemRequestSchema | PerDiemRequestSchemaUpdate>({
    resolver: zodResolver(
      mode === "create"
        ? perDiemRequestSchemaCreate
        : perDiemRequestSchemaUpdate
    ) as any,
    defaultValues: {
      ...defaultValues,
      with_request: defaultValues.with_request ?? false,
    },
    mode: "onChange",
  });
  useGetAllPerDiemCategory();
  const { data: myCompanies = [], isLoading: isLoadingMyCompanies } =
    useUserCompanies();

  const { data: sedes = [], isLoading: isLoadingSedes } = useAllSedes();

  // Observar el valor de company_id
  const companyId = form.watch("company_id");

  // Filtrar sedes según la empresa seleccionada
  const filteredSedes = useMemo(() => {
    // Si no hay company_id seleccionado (null o ""), no mostrar ninguna sede
    if (!companyId || companyId === "") {
      return [];
    }

    // Si company_id es "4", mostrar todas las sedes
    if (companyId === "4") {
      return sedes;
    }

    // En cualquier otro caso, filtrar por empresa_id
    return sedes.filter((sede) => sede.empresa_id?.toString() === companyId);
  }, [companyId, sedes]);

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
      const companyId = myCompanies[0].id.toString();
      form.setValue("company_id", companyId);
    }
  }, [myCompanies, form]);

  // Limpiar sede_service_id cuando cambie company_id
  useEffect(() => {
    const currentSedeId = form.getValues("sede_service_id");
    // Si hay una sede seleccionada, verificar si aún está en la lista filtrada
    if (currentSedeId) {
      const sedeExists = filteredSedes.some(
        (sede) => sede.id.toString() === currentSedeId
      );
      // Si la sede no existe en la lista filtrada, limpiar el valor
      if (!sedeExists) {
        form.setValue("sede_service_id", "");
      }
    }
  }, [companyId, filteredSedes, form]);

  if (isLoadingMyCompanies || isLoadingSedes) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={myCompanies.length <= 1 ? "hidden" : ""}>
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
          </div>

          <FormSelect
            name="sede_service_id"
            label="Sede Brinda Servicio"
            placeholder="Selecciona una sede"
            options={filteredSedes
              .filter(
                (item) => item?.id && item?.abreviatura
                // && item.id !== user?.sede_id
                // && item?.shop_id !== user?.shop_id
              )
              .map((item) => ({
                label: item.abreviatura.replace(/_/g, " "),
                value: item.id.toString(),
              }))}
            control={form.control}
          />

          <DateRangePickerFormField
            control={form.control}
            nameFrom="start_date"
            nameTo="end_date"
            label="Rango de Fechas"
            placeholder="Selecciona el rango de fechas"
            dateFormat="dd/MM/yyyy"
            required
            disabled={{
              before: new Date(Date.now() + MIN_DAYS * 24 * 60 * 60 * 1000),
            }}
          />

          <FormSwitch
            name="with_active"
            label="¿Movilidad sera un Activo de la empresa?"
            text={form.watch("with_active") ? "Sí" : "No"}
            control={form.control}
          />
        </div>

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
