"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useNavigate } from "react-router-dom";
import { STATUS_ACTIVE } from "@/core/core.constants";
import {
  PerDiemRateSchema,
  perDiemRateSchemaCreate,
  perDiemRateSchemaUpdate,
} from "../lib/perDiemRate.schema";
import { useAllDistrict } from "@/features/gp/gestionsistema/ubicaciones/lib/location.hook";
import { useGetAllPerDiemPolicy } from "../../politica-viaticos/lib/perDiemPolicy.hook";
import { PER_DIEM_RATE } from "../lib/perDiemRate.constants";
import { useAllExpenseTypes } from "../../tipo-gasto/lib/expenseType.hook";
import { FormInput } from "@/shared/components/FormInput";
import { useGetAllPerDiemCategory } from "../../categoria-viaticos/lib/perDiemCategory.hook";

interface PerDiemRateFormProps {
  defaultValues: Partial<PerDiemRateSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
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

export const PerDiemRateForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: PerDiemRateFormProps) => {
  const router = useNavigate();
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? perDiemRateSchemaCreate : perDiemRateSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { data: perDiemPolicy = [], isLoading: isLoadingPerDiemPolicy } =
    useGetAllPerDiemPolicy({
      is_current: STATUS_ACTIVE,
    });
  const { data: districts = [], isLoading: isLoadingDistricts } =
    useAllDistrict({
      id: districtDestinationIds,
    });
  const { data: expenseTypes = [], isLoading: isLoadingExpenseTypes } =
    useAllExpenseTypes();
  const { data: perDiemCategory = [], isLoading: isLoadingPerDiemCategory } =
    useGetAllPerDiemCategory();

  const isLoading =
    isLoadingDistricts ||
    isLoadingPerDiemPolicy ||
    isLoadingExpenseTypes ||
    isLoadingPerDiemCategory;

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormSelect
          name="per_diem_policy_id"
          label="Política de Viáticos"
          placeholder="Selecciona una política"
          options={perDiemPolicy.map((item) => ({
            label: item.name + " - " + item.version,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
        />
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
        <FormSelect
          name="per_diem_category_id"
          label="categoría de Viático"
          placeholder="Selecciona una categoría"
          options={perDiemCategory.map((item) => ({
            label: item.name + " - " + item.description,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
        />
        <FormSelect
          name="expense_type_id"
          label="Tipo de Gasto"
          placeholder="Selecciona un tipo"
          options={expenseTypes.map((item) => ({
            label: item.name,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
        />
        <FormInput
          name="daily_amount"
          label="Monto Diario"
          type="number"
          placeholder="Ingresa el monto diario"
          control={form.control}
        />

        <div className="flex gap-4 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router(PER_DIEM_RATE.ABSOLUTE_ROUTE)}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting
              ? "Guardando"
              : mode === "create"
              ? "Agregar Tarifa"
              : "Actualizar Tarifa"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
