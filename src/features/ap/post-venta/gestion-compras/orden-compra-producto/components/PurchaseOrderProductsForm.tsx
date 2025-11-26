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
import {
  useAllWarehouse,
  useWarehouseById,
} from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllProduct } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { Textarea } from "@/components/ui/textarea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { PAYMENT_TERMS_OPTIONS } from "../lib/purchaseOrderProducts.constants";
import { useEffect } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { EMPRESA_AP } from "@/core/core.constants";
import { useState } from "react";
import { api } from "@/core/api";
import { format } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { useAllSupplierOrderType } from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/lib/supplierOrderType.hook";
import { TYPES_OPERATION_ID } from "@/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.constants";

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
  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  // En modo editar, obtener el warehouse por ID para extraer su sede_id
  const { data: initialWarehouse } = useWarehouseById(
    mode === "update" && defaultValues.warehouse_id
      ? Number(defaultValues.warehouse_id)
      : 0
  );

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({
      is_physical_warehouse: 1,
      sede_id: form.watch("sede_id") || undefined,
    });
  const { data: products = [], isLoading: isLoadingProducts } = useAllProduct({
    warehouse_id: form.watch("warehouse_id") || undefined,
  });
  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes();
  const {
    data: orderTypeSupplier = [],
    isLoading: isLoadingOrderTypeSupplier,
  } = useAllSupplierOrderType();

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeRateError, setExchangeRateError] = useState<string>("");
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Watch con suscripción completa al formulario
  const formValues = form.watch();
  const watchedItems = formValues.items || [];
  const watchedCurrencyTypeId = formValues.currency_id;
  const watchedEmissionDate = formValues.emission_date;

  // Crear un string serializado de los totales para detectar cambios
  const itemTotalsKey = watchedItems
    ?.map((item) => item?.item_total || 0)
    .join(",");

  // Effect para setear la sede cuando se carga el warehouse en modo editar
  useEffect(() => {
    if (
      mode === "update" &&
      isInitialLoad &&
      defaultValues.warehouse_id &&
      initialWarehouse
    ) {
      if (initialWarehouse.sede_id) {
        // Setear la sede para que se filtren correctamente los almacenes
        form.setValue("sede_id", initialWarehouse.sede_id.toString(), {
          shouldValidate: false,
        });

        // Asegurarse de que el warehouse_id esté seteado
        form.setValue("warehouse_id", defaultValues.warehouse_id, {
          shouldValidate: false,
        });
      }
      setIsInitialLoad(false);
    }
  }, [mode, isInitialLoad, defaultValues.warehouse_id, initialWarehouse, form]);

  // Función para consultar el tipo de cambio
  const fetchExchangeRate = async (currencyId: string, date: Date) => {
    setIsLoadingExchangeRate(true);
    setExchangeRateError("");
    setExchangeRate(null);

    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await api.get(
        `/gp/mg/exchange-rate/by-date-and-currency?to_currency_id=${currencyId}&date=${formattedDate}`
      );

      if (response.data?.data?.rate) {
        setExchangeRate(parseFloat(response.data.data.rate));
        setExchangeRateError("");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "No se encontró tipo de cambio para los parámetros proporcionados";
      setExchangeRateError(errorMessage);
      setExchangeRate(null);
    } finally {
      setIsLoadingExchangeRate(false);
    }
  };

  // useEffect para consultar tipo de cambio cuando cambien la moneda y la fecha
  useEffect(() => {
    // Solo consultar si la moneda NO es soles (id 1) y si ambos valores existen
    if (
      watchedCurrencyTypeId &&
      watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES &&
      watchedEmissionDate instanceof Date
    ) {
      fetchExchangeRate(watchedCurrencyTypeId, watchedEmissionDate);
    } else {
      // Si es soles o no hay datos, limpiar el tipo de cambio
      setExchangeRate(null);
      setExchangeRateError("");
    }
  }, [watchedCurrencyTypeId, watchedEmissionDate]);

  // useEffect para calcular y sincronizar totales cuando cambian los item_total
  useEffect(() => {
    let subtotal = 0;

    watchedItems?.forEach((item) => {
      if (!item) return;
      const itemTotal = Number(item.item_total) || 0;
      subtotal += itemTotal;
    });

    const totalAmount = Math.round(subtotal * 10000) / 10000;

    form.setValue("subtotal", totalAmount, { shouldValidate: false });
    form.setValue("total_discount", 0, { shouldValidate: false });
    form.setValue("total_tax", 0, { shouldValidate: false });
    form.setValue("total", totalAmount, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemTotalsKey]);

  if (
    isLoadingSuppliers ||
    isLoadingCurrencyTypes ||
    isLoadingMySedes ||
    isLoadingOrderTypeSupplier
  ) {
    return <FormSkeleton />;
  }

  const handleAddItem = () => {
    append({
      product_id: "",
      quantity: 1,
      item_total: 0,
      unit_price: 0,
      discount: 0,
      tax_rate: 18,
      notes: "",
    });
  };

  const handleSubmit = (data: any) => {
    // Transformar fechas a formato Y-m-d antes de enviar
    const transformedData = {
      ...data,
      emission_date:
        data.emission_date instanceof Date
          ? format(data.emission_date, "yyyy-MM-dd")
          : data.emission_date,
      due_date:
        data.due_date instanceof Date
          ? format(data.due_date, "yyyy-MM-dd")
          : data.due_date,
      igv: 18,
      type_operation_id: data.type_operation_id || TYPES_OPERATION_ID.POSTVENTA,
    };

    onSubmit(transformedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
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

            <FormField
              control={form.control}
              name="invoice_series"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serie Factura</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: F001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Núm. Factura</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 00012345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DatePickerFormField
              control={form.control}
              name="emission_date"
              label="Fecha Emisión Factura"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              disabledRange={{ after: new Date() }}
            />

            <DatePickerFormField
              control={form.control}
              name="due_date"
              label="Fecha Vencimiento Factura"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              disabledRange={{ before: watchedEmissionDate || new Date() }}
            />

            <FormSelect
              name="sede_id"
              label="Sede"
              placeholder="Selecciona una sede"
              options={mySedes.map((item) => ({
                label: item.abreviatura,
                value: item.id.toString(),
              }))}
              control={form.control}
            />

            <FormSelect
              name="warehouse_id"
              label="Almacén"
              placeholder="Selecciona un almacén"
              options={warehouses.map((warehouse) => ({
                label: warehouse.description,
                description: warehouse.sede,
                value: warehouse.id.toString(),
              }))}
              control={form.control}
              disabled={!form.watch("sede_id") || isLoadingWarehouses}
            />

            <FormSelect
              name="currency_id"
              label="Tipo Moneda"
              placeholder="Seleccionar Tipo"
              options={currencyTypes.map((item) => ({
                label: () => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.code}
                    </span>
                    <span>{item.name}</span>
                  </div>
                ),
                value: item.id.toString(),
              }))}
              control={form.control}
            />

            <FormSelect
              name="supplier_order_type_id"
              label="Tipo Pedido Proveedor"
              placeholder="Selecciona un tipo"
              options={orderTypeSupplier.map((item) => ({
                label: item.description,
                value: item.id.toString(),
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

          {/* Sección 2: Resumen */}
          <GroupFormSection
            title="Total de Factura"
            icon={Calculator}
            className="xl:col-span-1"
            cols={{ sm: 1, md: 1 }}
          >
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded-md mb-3">
                Los totales se calcularán automáticamente según los productos
                agregados.
              </div>

              <div className="flex justify-between items-center py-3 bg-primary/5 px-3 rounded-md">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-primary">
                  {currencyTypes.find(
                    (ct) => ct.id.toString() === watchedCurrencyTypeId
                  )?.symbol || "S/."}{" "}
                  {(form.watch("total") || 0).toFixed(4).replace(/\.?0+$/, "")}
                </span>
              </div>

              {/* Mostrar tipo de cambio y equivalente en soles si la moneda es diferente a soles */}
              {watchedCurrencyTypeId &&
                watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES && (
                  <>
                    {isLoadingExchangeRate && (
                      <div className="text-xs text-primary text-center py-2 bg-blue-50 rounded-md">
                        Consultando tipo de cambio...
                      </div>
                    )}

                    {exchangeRateError && (
                      <div className="text-xs text-red-600 text-center py-2 bg-red-50 rounded-md">
                        {exchangeRateError}
                      </div>
                    )}

                    {exchangeRate && (
                      <>
                        <div className="flex justify-between items-center py-2 border-t mt-2 pt-2">
                          <span className="text-xs text-muted-foreground">
                            Tipo de cambio:
                          </span>
                          <span className="text-xs font-medium">
                            S/. {exchangeRate.toFixed(4).replace(/\.?0+$/, "")}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3 bg-green-50 px-3 rounded-md">
                          <span className="font-semibold text-sm">
                            Equivalente en Soles:
                          </span>
                          <span className="font-bold text-lg text-green-700">
                            S/.{" "}
                            {((form.watch("total") || 0) * exchangeRate)
                              .toFixed(4)
                              .replace(/\.?0+$/, "")}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}

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
                      <TableHead className="w-24 text-center">
                        Cantidad
                      </TableHead>
                      <TableHead className="w-32 text-end">Precio</TableHead>
                      <TableHead className="w-32 text-end">Total</TableHead>
                      {watchedCurrencyTypeId &&
                        watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES &&
                        exchangeRate && (
                          <TableHead className="w-32 text-end">
                            Total Soles
                          </TableHead>
                        )}
                      <TableHead className="w-20 text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const unitPrice =
                        form.watch(`items.${index}.unit_price`) || 0;
                      const itemTotal =
                        form.watch(`items.${index}.item_total`) || 0;

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
                            <div className="space-y-1">
                              <FormSelect
                                name={`items.${index}.product_id`}
                                placeholder="Selecciona producto"
                                options={products
                                  .filter((product) => {
                                    // Filtrar productos ya seleccionados en otros items
                                    const selectedProductIds = watchedItems
                                      ?.map((item, idx) =>
                                        idx !== index ? item?.product_id : null
                                      )
                                      .filter(Boolean);
                                    return !selectedProductIds?.includes(
                                      product.id.toString()
                                    );
                                  })
                                  .map((product) => ({
                                    label: () => (
                                      <div className="flex items-center justify-between gap-2 py-1">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <span className="font-medium text-sm truncate">
                                            {product.name}
                                          </span>
                                          <span className="text-xs text-primary bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {product.unit_measurement_name ||
                                              "Sin unidad"}
                                          </span>
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded whitespace-nowrap">
                                          {product.code}
                                        </span>
                                      </div>
                                    ),
                                    value: product.id.toString(),
                                  }))}
                                control={form.control}
                                disabled={isLoadingProducts}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="align-middle p-1.5 text-center">
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
                                      className="text-center"
                                      value={
                                        typeof field.value === "number"
                                          ? field.value
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const num = parseInt(e.target.value);
                                        field.onChange(isNaN(num) ? "" : num);

                                        // Calcular precio unitario inmediatamente
                                        if (!isNaN(num) && num > 0) {
                                          const total =
                                            form.getValues(
                                              `items.${index}.item_total`
                                            ) || 0;
                                          const calculatedPrice =
                                            Math.round((total / num) * 10000) /
                                            10000;
                                          form.setValue(
                                            `items.${index}.unit_price`,
                                            calculatedPrice,
                                            { shouldValidate: false }
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="align-middle p-1.5 text-end">
                            <div className="text-sm font-medium bg-muted/50 px-3 py-2 rounded-md">
                              {unitPrice.toFixed(4).replace(/\.?0+$/, "")}
                            </div>
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            <FormField
                              control={form.control}
                              name={`items.${index}.item_total`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.0001"
                                      placeholder="0.00"
                                      className="text-end"
                                      value={
                                        typeof field.value === "number"
                                          ? field.value
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const num = parseFloat(e.target.value);
                                        field.onChange(isNaN(num) ? "" : num);

                                        // Calcular precio unitario inmediatamente
                                        if (!isNaN(num) && num >= 0) {
                                          const quantity =
                                            form.getValues(
                                              `items.${index}.quantity`
                                            ) || 1;
                                          const calculatedPrice =
                                            Math.round(
                                              (num / quantity) * 10000
                                            ) / 10000;
                                          form.setValue(
                                            `items.${index}.unit_price`,
                                            calculatedPrice,
                                            { shouldValidate: false }
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          {watchedCurrencyTypeId &&
                            watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES &&
                            exchangeRate && (
                              <TableCell className="align-middle p-1.5 text-end">
                                <div className="text-sm font-medium text-green-700">
                                  S/.{" "}
                                  {(itemTotal * exchangeRate)
                                    .toFixed(4)
                                    .replace(/\.?0+$/, "")}
                                </div>
                              </TableCell>
                            )}
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
            disabled={
              isSubmitting ||
              !form.formState.isValid ||
              Boolean(
                watchedCurrencyTypeId &&
                  watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES &&
                  !exchangeRate
              )
            }
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
