import {
  ReceptionSchema,
  receptionSchemaCreate,
  receptionSchemaUpdate,
} from "../lib/receptions-products.schema";
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
  Warehouse,
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
  REJECTION_REASONS,
} from "../lib/receptions-products.constants";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ReceptionsProductsFormProps {
  defaultValues: Partial<ReceptionSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  purchaseOrderNumber?: string;
}

export const ReceptionsProductsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  purchaseOrderNumber,
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
    useAllWarehouse();
  const { data: products = [], isLoading: isLoadingProducts } = useAllProduct();

  const watchedDetails = form.watch("details");

  useEffect(() => {
    watchedDetails?.forEach((detail, index) => {
      if (detail && typeof detail.quantity_received === "number") {
        const quantityReceived = detail.quantity_received || 0;
        const quantityRejected = detail.quantity_rejected || 0;
        const quantityAccepted = quantityReceived - quantityRejected;

        if (quantityAccepted !== detail.quantity_accepted) {
          form.setValue(
            `details.${index}.quantity_accepted`,
            Math.max(0, quantityAccepted)
          );
        }
      }
    });
  }, [watchedDetails, form]);

  if (isLoadingWarehouses || isLoadingProducts) {
    return <FormSkeleton />;
  }

  const handleAddDetail = () => {
    append({
      product_id: "",
      quantity_received: 1,
      quantity_accepted: 1,
      quantity_rejected: 0,
      reception_type: "ORDERED",
      is_charged: true,
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
          {purchaseOrderNumber && (
            <div>
              <FormLabel>Orden de Compra</FormLabel>
              <div className="mt-2">
                <Badge className="text-base px-3 py-1">
                  {purchaseOrderNumber}
                </Badge>
              </div>
            </div>
          )}
          <FormField
            control={form.control}
            name="reception_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Recepción</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
        </GroupFormSection>

        {/* Datos de Factura y Guía */}
        <GroupFormSection
          title="Datos de Factura y Guía"
          icon={Warehouse}
          iconColor="text-secondary"
          bgColor="bg-red-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormField
            control={form.control}
            name="supplier_invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Factura del Proveedor</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: F001-00001234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplier_invoice_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Factura</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
              <p className="text-sm">
                Haz clic en "Agregar Producto" para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const receptionType = watchedDetails?.[index]?.reception_type;
                const quantityRejected =
                  watchedDetails?.[index]?.quantity_rejected || 0;
                const hasRejection = quantityRejected > 0;

                return (
                  <Card key={field.id} className="p-4 bg-muted/50">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium">Producto {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <FormSelect
                        name={`details.${index}.product_id`}
                        label="Producto"
                        placeholder="Selecciona producto"
                        options={products.map((product) => ({
                          label: `${product.name} (${product.code})`,
                          value: product.id.toString(),
                        }))}
                        control={form.control}
                      />

                      <FormSelect
                        name={`details.${index}.reception_type`}
                        label="Tipo de Recepción"
                        placeholder="Selecciona tipo"
                        options={RECEPTION_TYPES.map((type) => ({
                          label: type.label,
                          value: type.value,
                        }))}
                        control={form.control}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.quantity_received`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad Recibida</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0"
                                value={
                                  typeof field.value === "number"
                                    ? field.value
                                    : ""
                                }
                                onChange={(e) => {
                                  const num = parseFloat(e.target.value);
                                  field.onChange(isNaN(num) ? "" : num);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.quantity_rejected`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad Rechazada</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                value={
                                  typeof field.value === "number"
                                    ? field.value
                                    : ""
                                }
                                onChange={(e) => {
                                  const num = parseFloat(e.target.value);
                                  field.onChange(isNaN(num) ? "" : num);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.quantity_accepted`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad Aceptada</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled
                                value={
                                  typeof field.value === "number"
                                    ? field.value
                                    : ""
                                }
                                className="bg-muted"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(receptionType === "ORDERED" ||
                        receptionType === "BONUS") && (
                        <FormField
                          control={form.control}
                          name={`details.${index}.unit_cost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo Unitario</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={
                                    typeof field.value === "number"
                                      ? field.value
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const num = parseFloat(e.target.value);
                                    field.onChange(isNaN(num) ? "" : num);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {receptionType === "ORDERED" && (
                        <FormField
                          control={form.control}
                          name={`details.${index}.is_charged`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>¿Se cobra?</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      )}

                      {(receptionType === "BONUS" ||
                        receptionType === "GIFT") && (
                        <FormField
                          control={form.control}
                          name={`details.${index}.bonus_reason`}
                          render={({ field }) => (
                            <FormItem className="col-span-1 sm:col-span-2">
                              <FormLabel>
                                Motivo de{" "}
                                {receptionType === "BONUS"
                                  ? "Bonificación"
                                  : "Regalo"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Describe el motivo..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {hasRejection && (
                        <>
                          <FormSelect
                            name={`details.${index}.rejection_reason`}
                            label="Motivo de Rechazo"
                            placeholder="Selecciona motivo"
                            options={REJECTION_REASONS.map((reason) => ({
                              label: reason.label,
                              value: reason.value,
                            }))}
                            control={form.control}
                          />

                          <FormField
                            control={form.control}
                            name={`details.${index}.rejection_notes`}
                            render={({ field }) => (
                              <FormItem className="col-span-1 sm:col-span-2">
                                <FormLabel>Notas de Rechazo</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Detalles del rechazo..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name={`details.${index}.batch_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Lote</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: L-2024-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.expiration_date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Vencimiento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.notes`}
                        render={({ field }) => (
                          <FormItem className="col-span-1 sm:col-span-2 md:col-span-3">
                            <FormLabel>Notas del Producto</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Notas adicionales..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
