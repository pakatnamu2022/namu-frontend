"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Loader, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
import {
  AssignBrandConsultantSchema,
  assignBrandConsultantSchemaCreate,
} from "../lib/assignBrandConsultant.schema";
import { Input } from "@/components/ui/input";
import { useAllBrands } from "../../../vehiculos/marcas/lib/brands.hook";
import AssignBrandConsultantTable from "./assignBrandConsultantTable";
import { useAssignBrandConsultant } from "../lib/assignBrandConsultant.hook";
import { assignBrandConsultantManageColumns } from "./AssignBrandConsultantManageColumns";
import {
  ERROR_MESSAGE,
  errorToast,
  currentMonth,
  SUCCESS_MESSAGE,
  successToast,
  currentYear,
} from "@/core/core.function";
import { useEffect, useState, useMemo } from "react";
import {
  deleteAssignBrandConsultant,
  updateAssignBrandConsultant,
} from "../lib/assignBrandConsultant.actions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE, EMPRESA_AP, MONTHS } from "@/core/core.constants";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { ASSIGN_BRAND_CONSULTANT } from "../lib/assignBrandConsultant.constants";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import MetaIndicators from "./AssignBrandConsultantMetaIndicator";
import { useAllWorkersBySede } from "../../asignar-sede/lib/assignCompanyBranch.hook";

interface AssignBrandConsultantFormProps {
  defaultValues: Partial<AssignBrandConsultantSchema>;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export const AssignBrandConsultantForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: AssignBrandConsultantFormProps) => {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const { MODEL } = ASSIGN_BRAND_CONSULTANT;
  const currentMonthIndex = currentMonth() - 1;
  const currentMonthName = MONTHS[currentMonthIndex].label;

  const form = useForm({
    resolver: zodResolver(assignBrandConsultantSchemaCreate as any),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const sedeSeleccionada = form.watch("sede_id");
  const brandSeleccionada = form.watch("brand_id");

  const {
    data: companyBranchs = [],
    isLoading: isLoadingAssignBrandConsultant,
  } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  const { data, refetch } = useAssignBrandConsultant({
    page,
    per_page,
    year: currentYear(),
    month: currentMonth(),
    sede_id: sedeSeleccionada,
    brand_id: brandSeleccionada,
  });

  const { data: brands = [], isLoading: isLoadingbrands } = useAllBrands();

  const { data: asesores = [], isLoading: isLoadingAsesores } =
    useAllWorkersBySede(
      sedeSeleccionada ? Number(sedeSeleccionada) : undefined
    );

  const metaSellIn = data?.meta_sell_in || 0;
  const metaSellOut = data?.meta_sell_out || 0;
  const shop = data?.shop || "No definida";

  // Calcular el total actual de objetivos asignados
  const currentTotal = useMemo(() => {
    return (
      data?.data?.reduce((sum, item) => sum + (item.sales_target || 0), 0) || 0
    );
  }, [data?.data]);

  // Obtener nombres para mostrar
  const sedeName = companyBranchs.find(
    (s) => s.id.toString() === sedeSeleccionada
  )?.abreviatura;
  const brandName = brands.find(
    (b) => b.id.toString() === brandSeleccionada
  )?.name;

  useEffect(() => {
    if (sedeSeleccionada) {
      const asesorActual = form.getValues("worker_id");
      if (asesorActual) {
        form.setValue("worker_id", "", {
          shouldValidate: false,
          shouldDirty: true,
        });
      }
    }
  }, [sedeSeleccionada, form]);

  const handleToggleGoal = async (id: number, newObjetivo: number) => {
    try {
      await updateAssignBrandConsultant(id, { sales_target: newObjetivo });
      await refetch();
      successToast("Objetivo de venta actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el objetivo de venta.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAssignBrandConsultant(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingAssignBrandConsultant || isLoadingbrands) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="font-semibold">
            La inserción o actualización se realizará para el periodo{" "}
            {currentYear()} y mes {currentMonthName}.
          </span>
        </div>
        <MetaIndicators
          metaSellIn={metaSellIn}
          metaSellOut={metaSellOut}
          currentTotal={currentTotal}
          sedeName={sedeName!}
          brandName={brandName!}
          shop={shop}
        />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full formlayout"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              name="sede_id"
              label="Sede"
              placeholder="Selecciona un sede"
              options={companyBranchs.map((companyBranch) => ({
                label: companyBranch.abreviatura,
                value: companyBranch.id.toString(),
              }))}
              control={form.control}
            />
            <FormSelect
              name="brand_id"
              label="Marca"
              placeholder="Selecciona un marca"
              options={brands.map((brand) => ({
                label: brand.name,
                value: brand.id.toString(),
              }))}
              control={form.control}
            />
          </div>
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-6 md:col-span-6">
              <FormSelect
                name="worker_id"
                label="Asesor"
                placeholder="Selecciona un asesor"
                options={asesores.map((asesor) => ({
                  label: asesor.name,
                  value: asesor.id.toString(),
                }))}
                control={form.control}
                disabled={!sedeSeleccionada || isLoadingAsesores}
              />
            </div>
            <div className="col-span-4 md:col-span-4">
              <FormField
                control={form.control}
                name="sales_target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-2 flex items-center gap-2">
              <Button
                type="submit"
                className="h-10 w-10 p-0 rounded-lg flex items-center justify-center"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <AssignBrandConsultantTable
              isLoading={false}
              columns={assignBrandConsultantManageColumns({
                onUpdateGoal: handleToggleGoal,
                onDelete: setDeleteId,
              })}
              data={data?.data || []}
              isVisibleColumnFilter={false}
            />
            {deleteId !== null && (
              <SimpleDeleteDialog
                open={true}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
              />
            )}
            <div className="mt-2">
              <DataTablePagination
                page={page}
                totalPages={data?.meta?.last_page || 1}
                totalData={data?.meta?.total || 0}
                onPageChange={setPage}
                per_page={per_page}
                setPerPage={setPerPage}
              />
            </div>
          </div>
        </form>
      </div>
    </Form>
  );
};
