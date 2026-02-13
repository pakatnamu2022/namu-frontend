import {
  ReceptionSchema,
  receptionSchemaCreate,
  receptionSchemaUpdate,
} from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.schema.ts";
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
import { Input } from "@/components/ui/input.tsx";
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
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook.ts";
import { useProduct } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook.ts";
import { ProductResource } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.interface.ts";
import { GroupFormSection } from "@/shared/components/GroupFormSection.tsx";
import { Card } from "@/components/ui/card.tsx";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog.tsx";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField.tsx";
import { OBSERVATION_REASONS } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.constants.ts";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync.tsx";
import { useSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook.ts";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface.ts";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";
import { SupplierOrderDetailsResource } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.interface";

interface ReceptionsProductsFormProps {
  defaultValues: Partial<ReceptionSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  supplierOrderNumber?: string;
  supplierOrderItems?: SupplierOrderDetailsResource[];
}

export const ReceptionsProductsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  supplierOrderItems = [],
}: ReceptionsProductsFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? receptionSchemaCreate : receptionSchemaUpdate,
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({
      is_physical_warehouse: 1,
    });

  const watchedDetails = form.watch("details");

  // Cargar automáticamente los productos de la orden de compra
  useEffect(() => {
    if (
      mode === "create" &&
      supplierOrderItems.length > 0 &&
      fields.length === 0
    ) {
      const initialDetails = supplierOrderItems.map((item) => ({
        purchase_order_item_id: String(item.id),
        product_id: item.product_id.toString(),
        quantity_received: item.quantity,
        observed_quantity: 0,
        reception_type: "ORDERED" as const,
        reason_observation: undefined,
        observation_notes: "",
        bonus_reason: "",
        notes: "",
      }));

      form.setValue("details", initialDetails);
    }
  }, [mode, supplierOrderItems, fields.length, form]);

  // Limpiar motivo y notas de observación cuando la cantidad observada sea 0
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Detectar cambios en observed_quantity
      if (name?.includes("observed_quantity")) {
        const match = name.match(/details\.(\d+)\.observed_quantity/);
        if (match) {
          const index = parseInt(match[1]);
          const observedQuantity =
            value.details?.[index]?.observed_quantity || 0;

          if (observedQuantity === 0) {
            form.setValue(`details.${index}.reason_observation`, undefined, {
              shouldValidate: true,
            });
            form.setValue(`details.${index}.observation_notes`, "", {
              shouldValidate: true,
            });
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  if (isLoadingWarehouses) {
    return <FormSkeleton />;
  }

  const handleAddDetail = () => {
    append({
      purchase_order_item_id: undefined,
      product_id: "",
      quantity_received: 1,
      observed_quantity: undefined,
      reception_type: "BONUS",
      reason_observation: undefined,
      observation_notes: "",
      bonus_reason: "",
      notes: "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información de Recepción */}
        <GroupFormSection
          title="Información de Recepción"
          icon={FileText}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 3 }}
        >
          <DatePickerFormField
            control={form.control}
            name="reception_date"
            label="Fecha de Recepción"
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
            disabled={true}
          />

          <FormInput
            name="shipping_guide_number"
            label="Núm. de Guía de Remisión"
            placeholder="Ej: G001-00001234"
            control={form.control}
          />

          <FormInput
            name="freight_cost"
            label="Costo de Flete (SOL PERUANO)"
            placeholder="Ej: 0.00"
            type="number"
            step="0.01"
            min="0"
            control={form.control}
          />

          <FormSelectAsync
            placeholder="Seleccionar Transportista"
            control={form.control}
            label={"Proveedor Transportista"}
            name="carrier_id"
            useQueryHook={useSuppliers}
            mapOptionFn={(item: SuppliersResource) => ({
              value: item.id.toString(),
              label: `${item.num_doc || "S/N"} | ${item.full_name || "S/N"}`,
            })}
            perPage={10}
            debounceMs={500}
          ></FormSelectAsync>
        </GroupFormSection>

        {/* Detalles de Productos Recibidos */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Productos Recibidos</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDetail}
              className="hidden"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay productos agregados</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {fields.map((field, index) => {
                const detail = watchedDetails?.[index];
                const receptionType = detail?.reception_type;
                const observedQuantity = detail?.observed_quantity || 0;
                const hasObservation = observedQuantity > 0;

                // Determinar si es producto de la orden
                const isOrderedProduct = detail?.purchase_order_item_id != null;

                const productItem = supplierOrderItems.find(
                  (item) => item.product_id.toString() === detail?.product_id,
                );

                return (
                  <Card
                    key={field.id}
                    className="p-3 bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    {/* Header compacto */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-slate-700">
                          {productItem?.product?.name ||
                            `Producto ${index + 1}`}
                        </h4>
                        {isOrderedProduct && (
                          <Badge
                            color="default"
                            className="text-xs h-5 shrink-0"
                          >
                            ORDENADO
                          </Badge>
                        )}
                        {productItem && (
                          <span className="text-xs text-slate-500 shrink-0 bg-slate-200 px-2 py-0.5 rounded">
                            Ord: {productItem.quantity}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setProductToDelete(index);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={mode === "update"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Campos en grid responsivo */}
                    <div className="space-y-2">
                      {/* Fila 1: Producto (si no es ordenado) o Cantidades + Notas */}
                      <div
                        className={`grid gap-2 ${
                          isOrderedProduct
                            ? "grid-cols-2 md:grid-cols-[minmax(100px,140px)_minmax(100px,140px)_1fr]"
                            : "grid-cols-1 md:grid-cols-2"
                        }`}
                      >
                        {!isOrderedProduct &&
                          (mode === "update" ? (
                            // Modo edición: Mostrar nombre del producto (solo lectura)
                            <div className="space-y-1">
                              <FormLabel className="text-xs font-medium">
                                Producto *
                              </FormLabel>
                              <div className="h-auto min-h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm flex items-center">
                                <span className="font-medium text-sm truncate">
                                  {productItem?.product?.name ||
                                    "Producto no disponible"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            // Modo creación: Selector asíncrono
                            <FormSelectAsync
                              name={`details.${index}.product_id`}
                              label="Producto *"
                              placeholder="Buscar producto..."
                              control={form.control}
                              useQueryHook={useProduct}
                              mapOptionFn={(product: ProductResource) => ({
                                value: product.id.toString(),
                                label: `${product.name} (${product.code})`,
                              })}
                              perPage={10}
                              debounceMs={500}
                            />
                          ))}

                        <FormField
                          control={form.control}
                          name={`details.${index}.quantity_received`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">
                                Cant. Recibida *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  className="text-center"
                                  placeholder="0"
                                  disabled={mode === "update"}
                                  value={
                                    typeof field.value === "number"
                                      ? field.value
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const num = parseFloat(e.target.value);
                                    const newQuantityReceived = isNaN(num)
                                      ? 0
                                      : num;

                                    // Si es producto ordenado, calcular cantidad observada
                                    if (isOrderedProduct && productItem) {
                                      const orderedQuantity =
                                        productItem.quantity;

                                      // No permitir que la cantidad recibida supere la ordenada
                                      const finalQuantityReceived = Math.min(
                                        newQuantityReceived,
                                        orderedQuantity,
                                      );
                                      const observedQuantity =
                                        orderedQuantity - finalQuantityReceived;

                                      field.onChange(finalQuantityReceived);
                                      form.setValue(
                                        `details.${index}.observed_quantity`,
                                        observedQuantity,
                                      );
                                    } else {
                                      field.onChange(newQuantityReceived);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {isOrderedProduct && (
                          <FormField
                            control={form.control}
                            name={`details.${index}.observed_quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium">
                                  Cant. Observada
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="text-center"
                                    placeholder="0"
                                    disabled={mode === "update"}
                                    value={
                                      typeof field.value === "number"
                                        ? field.value
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const num = parseFloat(e.target.value);
                                      const newObservedQuantity = isNaN(num)
                                        ? 0
                                        : num;

                                      // Si es producto ordenado, calcular cantidad recibida
                                      if (productItem) {
                                        const orderedQuantity =
                                          productItem.quantity;

                                        // No permitir que la cantidad observada supere la ordenada
                                        const finalObservedQuantity = Math.min(
                                          newObservedQuantity,
                                          orderedQuantity,
                                        );
                                        const receivedQuantity =
                                          orderedQuantity -
                                          finalObservedQuantity;

                                        field.onChange(finalObservedQuantity);
                                        form.setValue(
                                          `details.${index}.quantity_received`,
                                          receivedQuantity,
                                        );
                                      } else {
                                        field.onChange(newObservedQuantity);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Notas adicionales en la misma fila para productos ordenados */}
                        {isOrderedProduct && (
                          <FormField
                            control={form.control}
                            name={`details.${index}.notes`}
                            render={({ field }) => (
                              <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel className="text-xs font-medium">
                                  Notas Adicionales
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Comentarios..."
                                    disabled={mode === "update"}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* Campo oculto para reception_type */}
                      <FormField
                        control={form.control}
                        name={`details.${index}.reception_type`}
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <input type="hidden" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Motivo bonificación */}
                      {(receptionType === "BONUS" ||
                        receptionType === "GIFT" ||
                        receptionType === "SAMPLE") && (
                        <FormField
                          control={form.control}
                          name={`details.${index}.bonus_reason`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">
                                Motivo{" "}
                                {receptionType === "BONUS"
                                  ? "Bonificación"
                                  : receptionType === "GIFT"
                                    ? "Regalo"
                                    : "Muestra"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ingresa el motivo..."
                                  disabled={mode === "update"}
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Observaciones */}
                      {hasObservation && (
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-2.5">
                          <p className="text-xs font-semibold text-orange-700 mb-1.5">
                            Observación Detectada
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name={`details.${index}.reason_observation`}
                              render={() => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">
                                    Motivo de Observación *
                                  </FormLabel>
                                  <FormControl>
                                    <FormSelect
                                      name={`details.${index}.reason_observation`}
                                      placeholder="Selecciona motivo"
                                      options={OBSERVATION_REASONS.map(
                                        (reason) => ({
                                          label: reason.label,
                                          value: reason.value,
                                        }),
                                      )}
                                      control={form.control}
                                      disabled={mode === "update"}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`details.${index}.observation_notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">
                                    Notas de Observación
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Detalles adicionales..."
                                      disabled={mode === "update"}
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* Notas */}
        <FormInputText
          name="notes"
          label="Notas Generales"
          placeholder="Notas o comentarios adicionales de la recepción"
          control={form.control}
          rows={3}
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
            {isSubmitting ? "Guardando" : "Guardar Recepción"}
          </Button>
        </div>

        <SimpleConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={() => {
            if (productToDelete !== null) {
              remove(productToDelete);
              setProductToDelete(null);
            }
            setDeleteDialogOpen(false);
          }}
          title="¿Eliminar producto?"
          description="¿Estás seguro de que deseas eliminar este producto de la recepción? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="destructive"
          icon="danger"
        />
      </form>
    </Form>
  );
};
