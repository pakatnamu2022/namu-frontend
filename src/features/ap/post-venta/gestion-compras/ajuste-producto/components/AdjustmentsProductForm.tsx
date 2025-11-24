import {
  AdjustmentSchema,
  adjustmentSchemaCreate,
  adjustmentSchemaUpdate,
} from "../lib/adjustmentsProduct.schema";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import {
  FileText,
  Loader,
  PackageCheck,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllProduct } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { Textarea } from "@/components/ui/textarea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Card } from "@/components/ui/card";
import { ALL_MOVEMENT_TYPES } from "../lib/adjustmentsProduct.constants";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllReasonsAdjustment } from "@/features/ap/post-venta/gestion-compras/motivos-ajuste/lib/reasonsAdjustment.hook";
import { AP_MASTER_POST_VENTA } from "@/features/ap/lib/ap.constants";
import { useMemo } from "react";

interface AdjustmentsProductFormProps {
  defaultValues: Partial<AdjustmentSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const AdjustmentsProductForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
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
      is_received: 1,
    });
  const { data: products = [], isLoading: isLoadingProducts } = useAllProduct({
    warehouse_id: form.watch("warehouse_id") || undefined,
  });
  const { data: allReasons = [], isLoading: isLoadingReasons } =
    useAllReasonsAdjustment();

  // Observar el tipo de movimiento seleccionado
  const selectedMovementType = form.watch("movement_type");

  // Filtrar motivos según el tipo de movimiento seleccionado
  const filteredReasons = useMemo(() => {
    if (!selectedMovementType) return [];

    const typeMapping: Record<string, string> = {
      [AP_MASTER_POST_VENTA.TYPE_ADJUSTMENT_IN]:
        AP_MASTER_POST_VENTA.TYPE_ADJUSTMENT_IN,
      [AP_MASTER_POST_VENTA.TYPE_ADJUSTMENT_OUT]:
        AP_MASTER_POST_VENTA.TYPE_ADJUSTMENT_OUT,
    };

    const targetType = typeMapping[selectedMovementType];
    if (!targetType) return [];

    return allReasons.filter((reason) => reason.type === targetType);
  }, [selectedMovementType, allReasons]);

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
            name="adjustment_reason_id"
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
            <div className="space-y-2">
              {fields.map((field, index) => {
                const productId = form.watch(`details.${index}.product_id`);
                const selectedProduct = products.find(
                  (p) => p.id.toString() === productId
                );

                return (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 p-3 bg-linear-to-r from-slate-50 to-slate-100/30 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    {/* Número del item */}
                    <div className="flex items-center justify-center h-8 w-8 bg-primary/10 text-primary rounded-full text-sm font-semibold shrink-0">
                      {index + 1}
                    </div>

                    {/* Selector de producto */}
                    <div className="flex-1 min-w-0">
                      <FormSelect
                        name={`details.${index}.product_id`}
                        label=""
                        placeholder="Selecciona un producto"
                        options={products.map((product) => ({
                          label: () => (
                            <div className="flex items-center justify-between gap-2 w-full">
                              <span className="font-medium truncate">
                                {product.name}
                              </span>
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                                {product.code}
                              </span>
                            </div>
                          ),
                          value: product.id.toString(),
                        }))}
                        control={form.control}
                        disabled={mode === "update" || isLoadingProducts}
                      />
                    </div>

                    {/* Input de cantidad compacto */}
                    <div className="w-32 shrink-0">
                      <FormField
                        control={form.control}
                        name={`details.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="h-9 text-center font-medium"
                                placeholder="Cantidad"
                                disabled={mode === "update"}
                                value={
                                  typeof field.value === "number"
                                    ? field.value
                                    : ""
                                }
                                onChange={(e) => {
                                  const num = parseFloat(e.target.value);
                                  field.onChange(isNaN(num) ? 0 : num);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Badge con unidad de medida */}
                    {selectedProduct?.unit_measurement_name && (
                      <span className="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded shrink-0">
                        {selectedProduct.unit_measurement_name}
                      </span>
                    )}

                    {/* Botón eliminar */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => remove(index)}
                      disabled={mode === "update"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                  disabled={mode === "update"}
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
