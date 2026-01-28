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
import { Input } from "@/components/ui/input";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Loader, Plus, Info, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
import {
  ERROR_MESSAGE,
  errorToast,
  currentMonth,
  SUCCESS_MESSAGE,
  successToast,
  currentYear,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE, MONTHS } from "@/core/core.constants";
import {
  ApGoalSellOutInSchema,
  apGoalSellOutInSchemaCreate,
  apGoalSellOutInSchemaUpdate,
} from "../lib/apGoalSellOutIn.schema";
import { useAllShop } from "../../tiendas/lib/shop.hook";
import { useAllBrands } from "../../../vehiculos/marcas/lib/brands.hook";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  deleteApGoalSellOutIn,
  updateApGoalSellOutIn,
} from "../lib/apGoalSellOutIn.actions";
import { useApGoalSellOutIn } from "../lib/apGoalSellOutIn.hook";
import { AP_GOAL_SELL_OUT_IN } from "../lib/apGoalSellOutIn.constants";
import ApGoalSellOutInTable from "./ApGoalSellOutInTable";
import { apGoalSellOutInManageColumns } from "./ApGoalSellOutInManageColumns";

interface ApGoalSellOutInFormProps {
  defaultValues: Partial<ApGoalSellOutInSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ApGoalSellOutInForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ApGoalSellOutInFormProps) => {
  const currentMonthIndex = currentMonth() - 1;
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const currentMonthName = MONTHS[currentMonthIndex].label;
  const { MODEL } = AP_GOAL_SELL_OUT_IN;
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? apGoalSellOutInSchemaCreate
        : (apGoalSellOutInSchemaUpdate as any)
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const [switchValue, setSwitchValue] = useState("IN");
  const { data: shops = [], isLoading: isLoadingShops } = useAllShop();
  const { data: brands = [], isLoading: isLoadingBrands } = useAllBrands();
  const { data, refetch } = useApGoalSellOutIn({
    page,
    per_page,
    shop_id: form.watch("shop_id"),
    type: switchValue,
    year: currentYear(),
    month: currentMonth(),
  });
  const [totalGoal, setTotalGoal] = useState(0);
  const calculateTotal = (data: any) => {
    if (data?.data?.length > 0) {
      // Si tu API ya devuelve total_goal, usa el primer elemento
      return data.data[0]?.total_goal || 0;
    }
    return 0;
  };

  useEffect(() => {
    if (data) {
      setTotalGoal(calculateTotal(data));
    }
  }, [data]);

  const handleToggleGoal = async (id: number, newObjetivo: number) => {
    try {
      await updateApGoalSellOutIn(id, { goal: newObjetivo });
      await refetch();
      successToast("Objetivo de venta correctamente.");
    } catch {
      errorToast("Error al actualizar el objetivo de venta.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApGoalSellOutIn(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingShops || isLoadingBrands) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 flex items-center gap-2">
        <Info className="h-5 w-5" />
        <span className="font-semibold">
          La acción se realizará para el periodo {currentYear()} y mes{" "}
          {currentMonthName}.
        </span>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
      >
        {/* Card bonita para mostrar el total */}
        {form.watch("shop_id") && (
          <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">Meta Total</h3>
                  <p className="text-sm text-green-600">
                    {shops.find(
                      (s) => s.id.toString() === form.watch("shop_id")
                    )?.description || "Tienda"}{" "}
                    - SELL {switchValue}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">
                  {totalGoal.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">unidades</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 justify-end">
          <Switch
            checked={switchValue === "IN"}
            onCheckedChange={(checked) => {
              const newValue = checked ? "IN" : "OUT";
              setSwitchValue(newValue);
              form.setValue("type", newValue);
            }}
          />
          <span className="font-medium text-sm">
            {switchValue === "IN" ? "SELL IN" : "SELL OUT"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <FormSelect
            name="shop_id"
            label="Tienda"
            placeholder="Selecciona una tienda"
            options={shops.map((shop) => ({
              label: shop.description,
              value: shop.id.toString(),
            }))}
            control={form.control}
          />

          <FormSelect
            name="brand_id"
            label="Marca"
            placeholder="Selecciona una marca"
            options={brands.map((brand) => ({
              label: brand.name,
              value: brand.id.toString(),
            }))}
            control={form.control}
          />

          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>&nbsp;</FormLabel>{" "}
            <FormControl>
              <Button
                type="submit"
                className="h-10 w-full md:w-10 rounded-lg flex items-center justify-center"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span className="ml-2 block md:hidden">Agregar</span>
                  </>
                )}
              </Button>
            </FormControl>
          </FormItem>
        </div>
        <div className="mt-6">
          <ApGoalSellOutInTable
            isLoading={false}
            columns={apGoalSellOutInManageColumns({
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
    </Form>
  );
};
