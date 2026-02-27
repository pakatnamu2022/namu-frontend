import {
  TransferReceptionSchema,
  transferReceptionSchemaCreate,
  transferReceptionSchemaUpdate,
} from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.schema.ts";
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
  ShoppingCart,
  Trash2,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync.tsx";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook.ts";
import { useProduct } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { GroupFormSection } from "@/shared/components/GroupFormSection.tsx";
import { Card } from "@/components/ui/card.tsx";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField.tsx";
import { OBSERVATION_REASONS } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.constants.ts";

interface TransferReceptionFormProps {
  defaultValues: Partial<TransferReceptionSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  itemType?: "PRODUCTO" | "SERVICIO";
  productTransferItems?: Array<{
    id: number;
    product_id: number | null;
    product_name?: string;
    notes?: string;
    quantity: number;
    unit_cost: number;
  }>;
}

export const TransferReceptionForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  itemType = "PRODUCTO",
  productTransferItems = [],
}: TransferReceptionFormProps) => {
  const isServicio = itemType === "SERVICIO";
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? transferReceptionSchemaCreate
        : transferReceptionSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      details: defaultValues.details || [],
    },
    mode: "onChange",
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({
      is_physical_warehouse: 1,
    });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedDetails = form.watch("details");

  // Cargar automáticamente los productos de la transferencia
  useEffect(() => {
    if (
      mode === "create" &&
      productTransferItems.length > 0 &&
      fields.length === 0
    ) {
      const initialDetails = productTransferItems.map((item) => ({
        transfer_item_id: String(item.id),
        product_id: item.product_id ? item.product_id.toString() : undefined,
        quantity_sent: item.quantity,
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
  }, [mode, productTransferItems, fields.length, form]);

  if (isLoadingWarehouses) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información de Recepción */}
        <GroupFormSection
          title="Información de Recepción"
          icon={FileText}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 2 }}
        >
          <DatePickerFormField
            control={form.control}
            name="reception_date"
            label="Fecha de Recepción"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabled
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
        </GroupFormSection>

        {/* Detalles de Productos Recibidos */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Productos Recibidos</h3>
            </div>
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
                const observedQuantity = detail?.observed_quantity || 0;
                const hasObservation = observedQuantity > 0;

                // Determinar si es producto de la transferencia
                const isOrderedProduct = detail?.transfer_item_id != null;

                // Para servicios, buscar por transfer_item_id, para productos por product_id
                const transferItem = productTransferItems.find((item) => {
                  if (isServicio) {
                    // Para servicios, buscar por transfer_item_id
                    return (
                      detail?.transfer_item_id &&
                      item.id.toString() === detail.transfer_item_id
                    );
                  } else {
                    // Para productos, buscar por product_id
                    return (
                      item.product_id &&
                      detail?.product_id &&
                      item.product_id.toString() === detail.product_id
                    );
                  }
                });

                // Determinar si el detalle es un ítem de servicio (sin product_id)
                const isServiceItem = isServicio && !detail?.product_id;

                return (
                  <Card
                    key={field.id}
                    className="p-4 bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    {/* Header compacto */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-slate-700">
                          {isServiceItem
                            ? detail?.observation_notes ||
                              transferItem?.notes ||
                              `Servicio ${index + 1}`
                            : transferItem?.product_name ||
                              `Producto ${index + 1}`}
                        </h4>
                        {isOrderedProduct && (
                          <Badge
                            color="default"
                            className="text-xs h-5 shrink-0"
                          >
                            TRANSFERIDO
                          </Badge>
                        )}
                        {isServiceItem && (
                          <Badge
                            color="default"
                            className="text-xs h-5 shrink-0"
                          >
                            SERVICIO
                          </Badge>
                        )}
                        {transferItem && !isServiceItem && (
                          <span className="text-xs text-slate-500 shrink-0 bg-slate-200 px-2 py-0.5 rounded">
                            Trans: {transferItem.quantity}
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

                    {/* Campos en una sola fila en desktop, columna en móvil */}
                    <div className="grid grid-cols-12 gap-3 mb-3 items-end">
                      {!isOrderedProduct && !isServiceItem && (
                        <div className="col-span-12 md:col-span-8">
                          <FormSelectAsync
                            name={`details.${index}.product_id`}
                            label="Producto *"
                            placeholder="Buscar producto..."
                            useQueryHook={useProduct}
                            mapOptionFn={(product) => ({
                              label: `${product.name} (${product.code})`,
                              value: product.id.toString(),
                            })}
                            control={form.control}
                            disabled={mode === "update"}
                            perPage={20}
                          />
                        </div>
                      )}

                      {(isOrderedProduct || isServiceItem) && transferItem && (
                        <div className="col-span-12 md:col-span-2">
                          <FormItem>
                            <FormLabel className="text-xs font-medium">
                              Cant. Enviada
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="text-center bg-slate-100"
                                value={transferItem.quantity}
                                disabled
                                readOnly
                              />
                            </FormControl>
                          </FormItem>
                        </div>
                      )}

                      <div
                        className={`col-span-12 ${isOrderedProduct || isServiceItem ? "md:col-span-2" : "md:col-span-4"}`}
                      >
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

                                    // Si es ítem transferido (producto o servicio), calcular cantidad observada
                                    if (isOrderedProduct && transferItem) {
                                      const transferredQuantity =
                                        transferItem.quantity;

                                      // No permitir que la cantidad recibida supere la transferida
                                      const finalQuantityReceived = Math.min(
                                        newQuantityReceived,
                                        transferredQuantity,
                                      );
                                      const observedQuantity =
                                        transferredQuantity -
                                        finalQuantityReceived;

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
                      </div>

                      {isOrderedProduct && (
                        <div className="col-span-12 md:col-span-2">
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

                                      // Si es ítem transferido (producto o servicio), calcular cantidad recibida
                                      if (transferItem) {
                                        const transferredQuantity =
                                          transferItem.quantity;

                                        // No permitir que la cantidad observada supere la transferida
                                        const finalObservedQuantity = Math.min(
                                          newObservedQuantity,
                                          transferredQuantity,
                                        );
                                        const receivedQuantity =
                                          transferredQuantity -
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
                        </div>
                      )}

                      {/* Notas Adicionales con más espacio - solo para productos ordenados no servicios */}
                      {isOrderedProduct && !isServiceItem && (
                        <div className="col-span-12 md:col-span-6">
                          <FormField
                            control={form.control}
                            name={`details.${index}.observation_notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium">
                                  Notas Adicionales
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Comentarios sobre este producto..."
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
                      )}
                    </div>

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

                          {!isServiceItem && (
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
                          )}
                        </div>
                      </div>
                    )}

                    {/* Campo oculto para mantener observation_notes en servicios */}
                    {isServiceItem && (
                      <FormField
                        control={form.control}
                        name={`details.${index}.observation_notes`}
                        render={({ field }) => (
                          <input
                            type="hidden"
                            {...field}
                            value={field.value || ""}
                          />
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
      </form>
    </Form>
  );
};
