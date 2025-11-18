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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Loader,
  Package,
  Plus,
  Trash2,
  Calculator,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllProduct } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { Textarea } from "@/components/ui/textarea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { PAYMENT_TERMS_OPTIONS } from "../lib/purchaseOrderProducts.constants";
import { useEffect } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";

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
  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes();

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

  if (
    isLoadingSuppliers ||
    isLoadingWarehouses ||
    isLoadingProducts ||
    isLoadingCurrencyTypes
  ) {
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full formlayout py-2"
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sección 1: Información de la Orden */}
          <GroupFormSection
            title="Información de la Orden"
            icon={FileText}
            className="xl:col-span-2"
            cols={{ sm: 1, md: 2 }}
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

            <DatePickerFormField
              control={form.control}
              name="expected_delivery_date"
              label="Fecha de Entrega Esperada"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              disabledRange={{ before: new Date() }}
            />

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

            <FormSelect
              name="currency_type_id"
              label="Tipo Moneda"
              placeholder="Seleccionar Tipo"
              options={currencyTypes.map((currencyType) => ({
                label: currencyType.name,
                value: currencyType.id.toString(),
              }))}
              control={form.control}
            />

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
          </GroupFormSection>

          {/* Sección 2: Resumen de Totales */}
          <GroupFormSection
            title="Resumen de Totales"
            icon={Calculator}
            className="xl:col-span-1"
            cols={{ sm: 1, md: 1 }}
          >
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded-md mb-3">
                Los totales se calcularán automáticamente según los productos
                agregados.
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(form.watch("subtotal") || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">
                  Descuento:
                </span>
                <span className="font-medium text-red-600">
                  -
                  {new Intl.NumberFormat("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(form.watch("total_discount") || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Impuesto:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(form.watch("total_tax") || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 bg-primary/5 px-3 rounded-md">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-primary">
                  {new Intl.NumberFormat("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(form.watch("total_amount") || 0)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                * Calculado automáticamente
              </p>
            </div>
          </GroupFormSection>

          {/* Sección 3: Items de la Orden de Compra */}
          <GroupFormSection
            title="Items de la Orden de Compra"
            icon={Package}
            className="mt-6 w-full col-span-full"
            cols={{ sm: 1 }}
          >
            <div className="w-full space-y-4">
              {/* Tabla de Items */}
              <div className="w-full rounded-md border-none">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="min-w-[250px]">Producto</TableHead>
                      <TableHead className="w-20">Cant.</TableHead>
                      <TableHead className="w-[140px]">Precio Unit.</TableHead>
                      <TableHead className="w-[100px]">Desc. %</TableHead>
                      <TableHead className="w-[100px]">IGV %</TableHead>
                      <TableHead className="w-[140px] text-end">
                        Subtotal
                      </TableHead>
                      <TableHead className="w-20 text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const quantity =
                        form.watch(`items.${index}.quantity`) || 0;
                      const unitPrice =
                        form.watch(`items.${index}.unit_price`) || 0;
                      const discount =
                        form.watch(`items.${index}.discount`) || 0;
                      const taxRate =
                        form.watch(`items.${index}.tax_rate`) || 0;

                      const itemSubtotal = Number(quantity) * Number(unitPrice);
                      const itemDiscount =
                        (itemSubtotal * Number(discount)) / 100;
                      const itemAfterDiscount = itemSubtotal - itemDiscount;
                      const itemTax =
                        (itemAfterDiscount * Number(taxRate)) / 100;
                      const itemTotal = itemAfterDiscount + itemTax;

                      return (
                        <TableRow key={field.id}>
                          <TableCell className="align-middle p-1.5 h-full">
                            <div className="flex items-center justify-center gap-1 h-full">
                              <span className="text-sm font-medium">
                                {index + 1}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            <FormSelect
                              name={`items.${index}.product_id`}
                              placeholder="Selecciona producto"
                              options={products.map((product) => ({
                                label: `${product.name} (${product.code})`,
                                value: product.id.toString(),
                              }))}
                              control={form.control}
                            />
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
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
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit_price`}
                              render={({ field }) => (
                                <FormItem>
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
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            <FormField
                              control={form.control}
                              name={`items.${index}.discount`}
                              render={({ field }) => (
                                <FormItem>
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
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            <FormField
                              control={form.control}
                              name={`items.${index}.tax_rate`}
                              render={({ field }) => (
                                <FormItem>
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
                          </TableCell>
                          <TableCell className="align-middle p-1.5 text-end">
                            <div className="text-sm font-medium text-end">
                              {new Intl.NumberFormat("es-PE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(itemTotal)}
                            </div>
                          </TableCell>
                          <TableCell className="align-middle text-center p-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Botón para agregar items */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>

              {/* Campo de notas dentro de items */}
              {fields.length > 0 && (
                <div className="mt-4">
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
                </div>
              )}
            </div>
          </GroupFormSection>
        </div>

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
            {isSubmitting ? "Guardando..." : "Guardar Orden de Compra"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
