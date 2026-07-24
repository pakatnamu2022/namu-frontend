"use client";

import { useEffect, useRef, useState } from "react";
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
import { FormSwitch } from "@/shared/components/FormSwitch";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { useActiveCampaign } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.hook";
import { AREA_TALLER } from "@/features/ap/ap-master/lib/apMaster.constants";

interface WorkOrderPartsFormProps {
  workOrderId: number;
  groupNumber: number;
  warehouseId: string;
  warehouseName: string;
  sedeName?: string;
  currencySymbol?: string;
  currencyId?: number;
  exchangeRate?: number;
  onSuccess: () => void;
  onCancel: () => void;
  maxDiscountPercentage: number;
}

interface AddPartFormValues {
  product_id: string;
  quantity_used: number;
  unit_price: number;
  discount_percentage: number;
  is_traverse: boolean;
}

const createPartFormSchema = (
  maxDiscount: number,
  getCampaignDiscountOverride: () => number | undefined,
) =>
  z.object({
    product_id: z.string().min(1, "El producto es requerido"),
    quantity_used: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    unit_price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
    discount_percentage: z
      .number()
      .min(0, "El descuento no puede ser negativo")
      .superRefine((val, ctx) => {
        // El descuento aplicado por campaña puede superar el máximo normal;
        // solo se omite la validación cuando el valor coincide exactamente
        // con el descuento de campaña vigente (asignado automáticamente).
        const campaignOverride = getCampaignDiscountOverride();
        if (campaignOverride !== undefined && val === campaignOverride) {
          return;
        }
        if (val > maxDiscount) {
          ctx.addIssue({
            code: "custom",
            message: `El descuento no puede ser mayor a ${maxDiscount}%`,
          });
        }
      }),
    is_traverse: z.boolean(),
  });

export default function WorkOrderPartsForm({
  workOrderId,
  groupNumber,
  warehouseId,
  currencySymbol = "S/",
  currencyId,
  exchangeRate,
  onSuccess,
  onCancel,
  maxDiscountPercentage,
}: WorkOrderPartsFormProps) {
  const queryClient = useQueryClient();

  const isInDollars = currencyId === Number(CURRENCY_TYPE_IDS.DOLLARS);
  const [minSalePrice, setMinSalePrice] = useState(0);
  const [salePriceSoles, setSalePriceSoles] = useState(0);
  const [hasStock, setHasStock] = useState(false);

  const { data: activeCampaign } = useActiveCampaign({ area_id: AREA_TALLER });
  const campaignDiscountValue =
    activeCampaign && activeCampaign.discount_type === "percentage"
      ? Number(activeCampaign.discount_value)
      : undefined;
  const campaignDiscountRef = useRef<number | undefined>(undefined);
  campaignDiscountRef.current = campaignDiscountValue;

  const form = useForm<AddPartFormValues>({
    resolver: zodResolver(
      createPartFormSchema(
        maxDiscountPercentage,
        () => campaignDiscountRef.current,
      ),
    ),
    mode: "onChange",
    defaultValues: {
      product_id: "",
      quantity_used: 1,
      unit_price: 0,
      discount_percentage: 0,
      is_traverse: false,
    },
  });

  const unitPrice = form.watch("unit_price");
  const isTraverse = form.watch("is_traverse");
  const isPriceBelowMin =
    !isTraverse && minSalePrice > 0 && unitPrice < minSalePrice;

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setMinSalePrice(0);
    setSalePriceSoles(0);
    form.setValue("product_id", "");
    form.setValue("unit_price", 0);
    form.clearErrors(["product_id", "unit_price"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTraverse]);

  const isCampaignDiscountLocked =
    hasStock && !isTraverse && campaignDiscountValue !== undefined;

  // Aplicar automáticamente el descuento de campaña cuando el repuesto tiene stock en el almacén
  useEffect(() => {
    if (!isCampaignDiscountLocked) return;
    const currentDiscount = form.getValues("discount_percentage");
    if (currentDiscount !== campaignDiscountValue) {
      form.setValue("discount_percentage", campaignDiscountValue as number);
    }
  }, [isCampaignDiscountLocked, campaignDiscountValue, form]);

  // Si es travesía, no aplica el descuento de campaña
  useEffect(() => {
    if (isTraverse) {
      form.setValue("discount_percentage", 0);
    }
  }, [isTraverse, form]);

  const handleInventoryChange = (_value: string, item?: InventoryResource) => {
    if (isTraverse) return;
    if (item) {
      const priceSoles = parseFloat(item.sale_price);
      const price =
        isInDollars && exchangeRate
          ? Math.round((priceSoles / exchangeRate) * 100) / 100
          : priceSoles;
      setMinSalePrice(price);
      setSalePriceSoles(priceSoles);
      form.setValue("unit_price", price, { shouldValidate: true });
      setHasStock(item.available_quantity > 0);
    } else {
      setMinSalePrice(0);
      setSalePriceSoles(0);
      form.setValue("unit_price", 0, { shouldValidate: true });
      setHasStock(false);
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
        is_traverse: data.is_traverse,
      }),
    onSuccess: () => {
      successToast("Repuesto agregado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
      setMinSalePrice(0);
      setHasStock(false);
      form.reset({
        product_id: "",
        quantity_used: 1,
        unit_price: 0,
        discount_percentage: 0,
        is_traverse: false,
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
    if (
      !data.is_traverse &&
      minSalePrice > 0 &&
      data.unit_price < minSalePrice
    ) {
      return;
    }
    storePartMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
          <p className="text-xs text-primary">
            <span className="font-semibold">Almacén:</span>{" "}
            {warehouseName || "No seleccionado"}
          </p>
          <p className="text-xs text-primary">
            <span className="font-semibold">Sede:</span> {sedeName || "N/A"}
          </p>
        </div> */}

        <FormSwitch
          control={form.control}
          name="is_traverse"
          text="Es travesía"
          textDescription={
            isTraverse
              ? "Activo: no se validará stock disponible ni precio de venta mínimo"
              : "No se validará stock disponible ni precio de venta mínimo"
          }
          size="lg"
          autoHeight
          className={
            isTraverse
              ? "border-blue-300 bg-blue-50 hover:bg-blue-50"
              : undefined
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormSelectAsync
            name="product_id"
            label="Repuesto"
            placeholder="Buscar producto en el almacén..."
            control={form.control}
            useQueryHook={useInventory}
            additionalParams={{
              warehouse_id: warehouseId,
              ...(isTraverse ? {} : { available_quantity: 0 }),
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
            {isInDollars && exchangeRate && (
              <p className="text-[10px] text-muted-foreground">
                Convertido con tipo de cambio S/. {exchangeRate.toFixed(4)} (S/.{" "}
                {salePriceSoles.toFixed(2)})
              </p>
            )}
            {isPriceBelowMin && (
              <p className="text-xs font-medium text-destructive">
                El precio no puede ser menor a {minSalePrice}
              </p>
            )}
          </div>

          <div className="items-start space-y-1">
            <FormInput
              name="discount_percentage"
              label={`Descuento (% máx: ${maxDiscountPercentage})`}
              type="number"
              min={0}
              max={maxDiscountPercentage}
              step="0.01"
              control={form.control}
              placeholder="0.0"
              disabled={isCampaignDiscountLocked}
              className={
                isCampaignDiscountLocked
                  ? "border-orange-400 bg-orange-50"
                  : undefined
              }
            />
            {isCampaignDiscountLocked && (
              <p className="text-[10px] font-medium text-orange-600">
                Descuento por campaña aplicado
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setMinSalePrice(0);
              setHasStock(false);
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
