import {
  ReceptionSchema,
  receptionSchemaCreate,
  receptionSchemaUpdate,
} from "../lib/receptionsProducts.schema";
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
import {
  RECEPTION_TYPES,
  OBSERVATION_REASONS,
} from "../lib/receptionsProducts.constants";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";

interface ReceptionsProductsFormProps {
  defaultValues: Partial<ReceptionSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  purchaseOrderNumber?: string;
  purchaseOrderItems?: Array<{
    id: number;
    product_id: number;
    product_name?: string;
    quantity: number;
    unit_price: number;
  }>;
}

export const ReceptionsProductsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  purchaseOrderItems = [],
}: ReceptionsProductsFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? receptionSchemaCreate : receptionSchemaUpdate
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
  const { data: products = [], isLoading: isLoadingProducts } = useAllProduct();

  const watchedDetails = form.watch("details");

  // Cargar automáticamente los productos de la orden de compra
  useEffect(() => {
    if (
      mode === "create" &&
      purchaseOrderItems.length > 0 &&
      fields.length === 0
    ) {
      const initialDetails = purchaseOrderItems.map((item) => ({
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
  }, [mode, purchaseOrderItems, fields.length, form]);

  if (isLoadingWarehouses || isLoadingProducts) {
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
          />

          <FormField
            control={form.control}
            name="shipping_guide_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Guía de Remisión</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: G001-00001234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Detalles de Productos Recibidos */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Productos Recibidos</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDetail}
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
            <div className="space-y-3">
              {fields.map((field, index) => {
                const detail = watchedDetails?.[index];
                const receptionType = detail?.reception_type;
                const observedQuantity = detail?.observed_quantity || 0;
                const hasObservation = observedQuantity > 0;

                // Determinar si es producto de la orden
                const isOrderedProduct = detail?.purchase_order_item_id != null;

                const productItem = purchaseOrderItems.find(
                  (item) => item.product_id.toString() === detail?.product_id
                );

                return (
                  <Card
                    key={field.id}
                    className="p-4 bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    {/* Header compacto */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-slate-700">
                          {productItem?.product_name || `Producto ${index + 1}`}
                        </h4>
                        {isOrderedProduct && (
                          <Badge
                            variant="secondary"
                            className="text-xs h-5 shrink-0 bg-blue-100 text-blue-700"
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
                      {!isOrderedProduct && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Campos en grid responsivo */}
                    <div
                      className={`grid gap-3 mb-3 ${
                        isOrderedProduct
                          ? "grid-cols-2 md:grid-cols-3"
                          : "grid-cols-1 md:grid-cols-3"
                      }`}
                    >
                      {!isOrderedProduct && (
                        <FormSelect
                          name={`details.${index}.product_id`}
                          label="Producto *"
                          placeholder="Selecciona"
                          options={products.map((product) => ({
                            label: `${product.name} (${product.code})`,
                            value: product.id.toString(),
                          }))}
                          control={form.control}
                        />
                      )}

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
                                      orderedQuantity
                                    );
                                    const observedQuantity =
                                      orderedQuantity - finalQuantityReceived;

                                    field.onChange(finalQuantityReceived);
                                    form.setValue(
                                      `details.${index}.observed_quantity`,
                                      observedQuantity
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
                                        orderedQuantity
                                      );
                                      const receivedQuantity =
                                        orderedQuantity - finalObservedQuantity;

                                      field.onChange(finalObservedQuantity);
                                      form.setValue(
                                        `details.${index}.quantity_received`,
                                        receivedQuantity
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

                      <FormField
                        control={form.control}
                        name={`details.${index}.reception_type`}
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">
                              Tipo *
                            </FormLabel>
                            <FormControl>
                              <FormSelect
                                name={`details.${index}.reception_type`}
                                placeholder="Tipo"
                                options={
                                  isOrderedProduct
                                    ? [{ label: "Ordenado", value: "ORDERED" }]
                                    : RECEPTION_TYPES.filter(
                                        (type) => type.value !== "ORDERED"
                                      ).map((type) => ({
                                        label: type.label,
                                        value: type.value,
                                      }))
                                }
                                control={form.control}
                                disabled={isOrderedProduct}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Motivo bonificación */}
                    {(receptionType === "BONUS" ||
                      receptionType === "GIFT" ||
                      receptionType === "SAMPLE") && (
                      <div className="mb-3">
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
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Observaciones */}
                    {hasObservation && (
                      <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-3">
                        <p className="text-xs font-semibold text-orange-700 mb-2">
                          Observación Detectada
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                      })
                                    )}
                                    control={form.control}
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

                    {/* Notas del producto - solo para productos ordenados */}
                    {isOrderedProduct && (
                      <FormField
                        control={form.control}
                        name={`details.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">
                              Notas Adicionales
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Comentarios sobre este producto..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* Notas */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Generales</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas o comentarios adicionales de la recepción"
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
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Recepción"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
