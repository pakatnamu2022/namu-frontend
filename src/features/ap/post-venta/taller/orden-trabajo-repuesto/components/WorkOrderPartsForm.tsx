"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeWorkOrderParts } from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import { errorToast, successToast } from "@/core/core.function";
import { useInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook";
import { InventoryResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormInput } from "@/shared/components/FormInput";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { DEFAULT_APPROVED_DISCOUNT } from "@/core/core.constants";

interface WorkOrderPartsFormProps {
  workOrderId: number;
  groupNumber: number;
  warehouseId: string;
  warehouseName: string;
  sedeName?: string;
  currencySymbol?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AddPartFormValues {
  product_id: string;
  quantity_used: number;
  unit_price: number;
  discount_percentage: number;
}

const createPartFormSchema = (maxDiscount: number) =>
  z.object({
    product_id: z.string().min(1, "El producto es requerido"),
    quantity_used: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    unit_price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
    discount_percentage: z
      .number()
      .min(0, "El descuento no puede ser negativo")
      .max(maxDiscount, `El descuento no puede ser mayor a ${maxDiscount}%`),
  });

export default function WorkOrderPartsForm({
  workOrderId,
  groupNumber,
  warehouseId,
  warehouseName,
  sedeName,
  currencySymbol = "S/",
  onSuccess,
  onCancel,
}: WorkOrderPartsFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const maxDiscountPercentage =
    user?.discount_percentage ?? DEFAULT_APPROVED_DISCOUNT;

  const [minSalePrice, setMinSalePrice] = useState(0);

  const form = useForm<AddPartFormValues>({
    resolver: zodResolver(createPartFormSchema(maxDiscountPercentage)),
    mode: "onChange",
    defaultValues: {
      product_id: "",
      quantity_used: 1,
      unit_price: 0,
      discount_percentage: 0,
    },
  });

  const unitPrice = form.watch("unit_price");
  const isPriceBelowMin = minSalePrice > 0 && unitPrice < minSalePrice;

  const handleInventoryChange = (_value: string, item?: InventoryResource) => {
    if (item) {
      const price = parseFloat(item.sale_price);
      setMinSalePrice(price);
      form.setValue("unit_price", price, { shouldValidate: true });
    } else {
      setMinSalePrice(0);
      form.setValue("unit_price", 0, { shouldValidate: true });
    }
  };

  const storePartMutation = useMutation({
    mutationFn: (data: AddPartFormValues) =>
      storeWorkOrderParts({
        work_order_id: workOrderId,
        product_id: data.product_id,
        warehouse_id: warehouseId,
        quantity_used: data.quantity_used,
        unit_price: data.unit_price,
        discount_percentage: data.discount_percentage,
        group_number: groupNumber,
      }),
    onSuccess: () => {
      successToast("Repuesto agregado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      setMinSalePrice(0);
      form.reset({
        product_id: "",
        quantity_used: 1,
        unit_price: 0,
        discount_percentage: 0,
      });
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al agregar el repuesto");
    },
  });

  const handleSubmit = (data: AddPartFormValues) => {
    if (!warehouseId) {
      errorToast("Debe seleccionar un almacén");
      return;
    }
    if (minSalePrice > 0 && data.unit_price < minSalePrice) {
      return;
    }
    storePartMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
          <p className="text-xs text-primary">
            <span className="font-semibold">Almacén:</span>{" "}
            {warehouseName || "No seleccionado"}
          </p>
          <p className="text-xs text-primary">
            <span className="font-semibold">Sede:</span> {sedeName || "N/A"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormSelectAsync
            name="product_id"
            label="Producto"
            placeholder="Buscar producto en el almacén..."
            control={form.control}
            useQueryHook={useInventory}
            additionalParams={{
              warehouse_id: warehouseId,
              available_quantity: 0,
            }}
            mapOptionFn={(inventory: InventoryResource) => ({
              label: () => (
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="font-medium truncate">
                    {inventory.product.code} - {inventory.product.name}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${
                      inventory.available_quantity > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    Stock: {inventory.available_quantity}
                  </span>
                </div>
              ),
              value: inventory.product_id.toString(),
            })}
            perPage={10}
            debounceMs={500}
            onValueChange={handleInventoryChange}
          />

          <FormInput
            name="quantity_used"
            label="Cantidad"
            type="number"
            placeholder="1"
            control={form.control}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <FormInput
              name="unit_price"
              label={`Precio Unitario (${currencySymbol})`}
              type="number"
              placeholder="0.0"
              step="0.01"
              control={form.control}
            />
            {isPriceBelowMin && (
              <p className="text-xs font-medium text-destructive">
                El precio no puede ser menor a {minSalePrice}
              </p>
            )}
          </div>

          <div className="items-start">
            <FormInput
              name="discount_percentage"
              label={`Descuento (% máx: ${maxDiscountPercentage})`}
              type="number"
              min={0}
              max={maxDiscountPercentage}
              step="0.01"
              control={form.control}
              placeholder="0.0"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setMinSalePrice(0);
              form.reset();
              onCancel();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={
              storePartMutation.isPending ||
              !form.watch("product_id") ||
              isPriceBelowMin
            }
            className="gap-2"
          >
            {storePartMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
