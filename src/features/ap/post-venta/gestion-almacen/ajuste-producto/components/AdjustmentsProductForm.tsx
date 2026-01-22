import {
  AdjustmentSchema,
  adjustmentSchemaCreate,
  adjustmentSchemaUpdate,
} from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.schema.ts";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  FileText,
  Loader,
  PackageCheck,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync.tsx";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook.ts";
import { useProduct } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { ProductResource } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.interface.ts";
import { AdjustmentsProductResource } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.interface.ts";
import { GroupFormSection } from "@/shared/components/GroupFormSection.tsx";
import { Card } from "@/components/ui/card.tsx";
import { ALL_MOVEMENT_TYPES } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.constants.ts";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField.tsx";
import { useAllReasonsAdjustment } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.hook.ts";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { useEffect, useMemo } from "react";
import { FormInput } from "@/shared/components/FormInput.tsx";

interface AdjustmentsProductFormProps {
  defaultValues: Partial<AdjustmentSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  AdjustmentData?: AdjustmentsProductResource;
}

export const AdjustmentsProductForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  AdjustmentData,
}: AdjustmentsProductFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? adjustmentSchemaCreate : adjustmentSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      details: defaultValues.details || [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({
      is_physical_warehouse: 1,
    });
  const { data: allReasons = [], isLoading: isLoadingReasons } =
    useAllReasonsAdjustment();

  // Observar el tipo de movimiento seleccionado
  const selectedMovementType = form.watch("movement_type");

  // Filtrar motivos según el tipo de movimiento seleccionado
  const filteredReasons = useMemo(() => {
    if (!selectedMovementType) return [];

    const typeMapping: Record<string, string> = {
      [AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN]: AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN,
      [AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT]: AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT,
    };

    const targetType = typeMapping[selectedMovementType];
    if (!targetType) return [];

    return allReasons.filter((reason) => reason.type === targetType);
  }, [selectedMovementType, allReasons]);

  // Limpiar unit_cost cuando el tipo de movimiento cambia a SALIDA
  useEffect(() => {
    if (selectedMovementType === AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT) {
      const currentDetails = form.getValues("details");
      const updatedDetails = currentDetails!.map((detail) => ({
        ...detail,
        unit_cost: 0,
      }));
      form.setValue("details", updatedDetails);
    }
  }, [selectedMovementType, form]);

  if (isLoadingWarehouses || isLoadingReasons) {
    return <FormSkeleton />;
  }

  const handleAddDetail = () => {
    append({
      product_id: "",
      quantity: 1,
      unit_cost: undefined,
      batch_number: "",
      expiration_date: "",
      notes: "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información del Movimiento */}
        <GroupFormSection
          title="Información del Movimiento"
          icon={FileText}
          iconColor="text-primary"
          bgColor="bg-blue-50"
        >
          <FormSelect
            name="movement_type"
            label="Tipo de Movimiento"
            placeholder="Selecciona el tipo"
            options={ALL_MOVEMENT_TYPES.map((type) => ({
              label: type.label,
              value: type.value,
            }))}
            control={form.control}
            disabled={mode === "update"}
          />

          <FormSelect
            name="reason_in_out_id"
            label="Motivo de Ajuste"
            placeholder={
              selectedMovementType
                ? "Selecciona un motivo"
                : "Primero selecciona tipo de movimiento"
            }
            options={filteredReasons.map((reason) => ({
              label: `${reason.code} - ${reason.description}`,
              value: reason.id.toString(),
            }))}
            control={form.control}
            disabled={mode === "update" || !selectedMovementType}
          />

          <DatePickerFormField
            control={form.control}
            name="movement_date"
            label="Fecha de Movimiento"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={{ after: new Date() }}
          />

          <FormSelect
            name="warehouse_id"
            label="Almacén"
            placeholder="Selecciona un almacén"
            options={warehouses.map((warehouse) => ({
              label: warehouse.description,
              value: warehouse.id.toString(),
            }))}
            control={form.control}
            disabled={mode === "update"}
          />
        </GroupFormSection>

        {/* Detalles de Productos */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Productos</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDetail}
              disabled={mode === "update"}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay productos agregados</p>
              <p className="text-sm mt-1">
                Haz clic en "Agregar Producto" para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className="p-3 lg:p-4 bg-linear-to-r from-slate-50 to-slate-100/30 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    {/* Layout compacto horizontal para desktop, vertical para móvil */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      {/* Número del item */}
                      <div className="flex lg:block items-center justify-between lg:justify-center h-8 w-full lg:w-8 lg:shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        {/* Botón eliminar - solo visible en móvil */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 lg:hidden text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => remove(index)}
                          disabled={mode === "update"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Selector de producto */}
                      <div className="flex-1 min-w-0">
                        {mode === "update" ? (
                          // Modo edición: Mostrar información del producto (solo lectura)
                          <div className="space-y-1">
                            <FormLabel>Producto</FormLabel>
                            <div className="h-auto min-h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                              <div className="flex items-center justify-between gap-2 w-full">
                                <span className="font-medium truncate">
                                  {AdjustmentData?.details?.[index]?.product
                                    ?.name || "Producto no disponible"}
                                </span>
                                <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded shrink-0">
                                  CÓD. DYN:
                                  {AdjustmentData?.details?.[index]?.product
                                    ?.dyn_code || "N/A"}{" "}
                                  - UM:
                                  {AdjustmentData?.details?.[index]?.product
                                    ?.unit_measurement_name || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Modo creación: Selector asíncrono
                          <FormSelectAsync
                            name={`details.${index}.product_id`}
                            label="Producto"
                            placeholder="Buscar producto..."
                            control={form.control}
                            useQueryHook={useProduct}
                            mapOptionFn={(product: ProductResource) => ({
                              value: product.id.toString(),
                              label: `${product.name} - CÓD. DYN:${product.dyn_code} - UM:${product.unit_measurement_name}`,
                            })}
                            perPage={10}
                            debounceMs={500}
                          />
                        )}
                      </div>

                      {/* Campos de cantidad y costos - grid en móvil, inline en desktop */}
                      <div className="grid grid-cols-2 lg:flex lg:items-center gap-3 lg:shrink-0">
                        <div className="lg:w-32">
                          <FormInput
                            control={form.control}
                            name={`details.${index}.quantity`}
                            label="Cantidad"
                            placeholder="Cantidad"
                            disabled={mode === "update"}
                            type="number"
                          />
                        </div>

                        {selectedMovementType ===
                          AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN && (
                          <>
                            <div className="lg:w-32">
                              <FormInput
                                control={form.control}
                                name={`details.${index}.unit_cost`}
                                label="Costo Unitario"
                                placeholder="Costo Unitario"
                                disabled={mode === "update"}
                                type="number"
                              />
                            </div>
                            <div className="col-span-2 lg:col-span-1 lg:w-32">
                              <FormLabel className="lg:text-center">
                                Costo Total
                              </FormLabel>
                              <div className="h-9 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md px-3 mt-2">
                                <span className="text-sm font-semibold text-gray-700">
                                  S/.{" "}
                                  {(
                                    Number(
                                      form.watch(`details.${index}.quantity`) ||
                                        0
                                    ) *
                                    Number(
                                      form.watch(
                                        `details.${index}.unit_cost`
                                      ) || 0
                                    )
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Botón eliminar - solo visible en desktop */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hidden lg:flex h-8 w-8 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => remove(index)}
                        disabled={mode === "update"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Notas Generales */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Generales</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas o comentarios adicionales del movimiento"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (mode === "create" && !form.formState.isValid) ||
              (mode === "update" && !form.formState.isDirty)
            }
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Movimiento"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
