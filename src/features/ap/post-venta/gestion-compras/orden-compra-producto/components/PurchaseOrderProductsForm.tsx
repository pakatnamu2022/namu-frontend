import {
  PurchaseOrderProductsSchema,
  purchaseOrderProductsSchemaCreate,
  purchaseOrderProductsSchemaUpdate,
} from "../lib/purchaseOrderProducts.schema";
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
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllProduct } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { Textarea } from "@/components/ui/textarea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Card } from "@/components/ui/card";
import {
  PAYMENT_TERMS_OPTIONS,
  PURCHASE_ORDER_STATUS,
  SHIPPING_METHOD_OPTIONS,
} from "../lib/purchaseOrderProducts.constants";
import { useEffect } from "react";

interface PurchaseOrderProductsFormProps {
  defaultValues: Partial<PurchaseOrderProductsSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const PurchaseOrderProductsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: PurchaseOrderProductsFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? purchaseOrderProductsSchemaCreate
        : purchaseOrderProductsSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      items: defaultValues.items || [],
      status: defaultValues.status || "PENDING",
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } =
    useAllSuppliers();
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse();
  const { data: products = [], isLoading: isLoadingProducts } = useAllProduct();

  const watchedItems = form.watch("items");

  useEffect(() => {
    const calculateTotals = () => {
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      watchedItems?.forEach((item) => {
        if (!item || typeof item.quantity !== "number") return;

        const quantity = item.quantity || 0;
        const unitPrice = item.unit_price || 0;
        const discount = item.discount || 0;
        const taxRate = item.tax_rate || 0;

        const itemSubtotal = quantity * unitPrice;
        const itemDiscount = (itemSubtotal * discount) / 100;
        const itemAfterDiscount = itemSubtotal - itemDiscount;
        const itemTax = (itemAfterDiscount * taxRate) / 100;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        totalTax += itemTax;
      });

      const totalAmount = subtotal - totalDiscount + totalTax;

      form.setValue("subtotal", parseFloat(subtotal.toFixed(2)));
      form.setValue("total_discount", parseFloat(totalDiscount.toFixed(2)));
      form.setValue("total_tax", parseFloat(totalTax.toFixed(2)));
      form.setValue("total_amount", parseFloat(totalAmount.toFixed(2)));
    };

    calculateTotals();
  }, [watchedItems, form]);

  if (isLoadingSuppliers || isLoadingWarehouses || isLoadingProducts) {
    return <FormSkeleton />;
  }

  const handleAddItem = () => {
    append({
      product_id: "",
      quantity: 1,
      unit_price: 0,
      discount: 0,
      tax_rate: 18,
      notes: "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información de Orden */}
        <GroupFormSection
          title="Información de Orden"
          icon={FileText}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormField
            control={form.control}
            name="order_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Orden</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: OC-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="order_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Orden</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expected_delivery_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega Esperada</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="status"
            label="Estado"
            placeholder="Selecciona un estado"
            options={PURCHASE_ORDER_STATUS.map((status) => ({
              label: status.label,
              value: status.value,
            }))}
            control={form.control}
          />
        </GroupFormSection>

        {/* Proveedor y Almacén */}
        <GroupFormSection
          title="Proveedor y Almacén"
          icon={User}
          iconColor="text-secondary"
          bgColor="bg-red-50"
          cols={{ sm: 2, md: 2 }}
        >
          <FormSelect
            name="supplier_id"
            label="Proveedor"
            placeholder="Selecciona un proveedor"
            options={suppliers.map((supplier) => ({
              label: `${supplier.full_name} - ${supplier.num_doc}`,
              value: supplier.id.toString(),
            }))}
            control={form.control}
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

        {/* Términos de Pago y Envío */}
        <GroupFormSection
          title="Términos de Pago y Envío"
          icon={Truck}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 2 }}
        >
          <FormSelect
            name="payment_terms"
            label="Términos de Pago"
            placeholder="Selecciona términos de pago"
            options={PAYMENT_TERMS_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            control={form.control}
          />
          <FormSelect
            name="shipping_method"
            label="Método de Envío"
            placeholder="Selecciona método de envío"
            options={SHIPPING_METHOD_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            control={form.control}
          />
        </GroupFormSection>

        {/* Items/Productos */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Productos</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
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
              {fields.map((field, index) => (
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
                      name={`items.${index}.product_id`}
                      label="Producto"
                      placeholder="Selecciona producto"
                      options={products.map((product) => ({
                        label: `${product.name} (${product.code})`,
                        value: product.id.toString(),
                      }))}
                      control={form.control}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="1"
                              value={
                                typeof field.value === "number"
                                  ? field.value
                                  : ""
                              }
                              onChange={(e) => {
                                const num = parseInt(e.target.value);
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
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Unitario</FormLabel>
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
                    <FormField
                      control={form.control}
                      name={`items.${index}.discount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descuento (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
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
                      name={`items.${index}.tax_rate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impuesto (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="18"
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
                      name={`items.${index}.notes`}
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
              ))}
            </div>
          )}
        </Card>

        {/* Totales */}
        <Card className="p-4 bg-muted/30">
          <h3 className="text-lg font-semibold mb-4">Resumen de Totales</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-lg font-semibold">
                S/ {form.watch("subtotal")?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Descuento</p>
              <p className="text-lg font-semibold text-red-600">
                - S/ {form.watch("total_discount")?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Impuesto</p>
              <p className="text-lg font-semibold">
                S/ {form.watch("total_tax")?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">
                S/ {form.watch("total_amount")?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
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
                  placeholder="Notas o comentarios adicionales de la orden"
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
            {isSubmitting ? "Guardando" : "Guardar Orden de Compra"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
