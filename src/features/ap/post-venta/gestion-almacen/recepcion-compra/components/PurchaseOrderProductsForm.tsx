import {
  PurchaseOrderProductsSchema,
  purchaseOrderProductsSchemaCreate,
  purchaseOrderProductsSchemaUpdate,
} from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.schema.ts";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { FileText, Loader, Package, Calculator } from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { useSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook.ts";
import {
  useAllWarehouse,
  useWarehouseById,
} from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook.ts";
import { useProduct } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook.ts";
import { ProductResource } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.interface.ts";
import { GroupFormSection } from "@/shared/components/GroupFormSection.tsx";
import { PAYMENT_TERMS_OPTIONS } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.constants.ts";
import { useEffect } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField.tsx";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook.ts";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook.ts";
import { EMPRESA_AP, IGV, STATUS_ACTIVE } from "@/core/core.constants.ts";
import { useState } from "react";
import { api } from "@/core/api.ts";
import { format, addDays } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants.ts";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync.tsx";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface.ts";
import { PurchaseOrderProductsResource } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.interface.ts";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { ReceptionResource } from "../../recepciones-producto/lib/receptionsProducts.interface";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog.tsx";
import { CopyCell } from "@/shared/components/CopyCell";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface PurchaseOrderProductsFormProps {
  defaultValues: Partial<PurchaseOrderProductsSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  PurchaseOrderProductsData?: PurchaseOrderProductsResource;
  receptionData?: ReceptionResource;
}

export const PurchaseOrderProductsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  receptionData,
}: PurchaseOrderProductsFormProps) => {
  // Procesar los items iniciales si hay receptionData
  const processedItems = (() => {
    if (defaultValues.items && receptionData?.supplier_order?.details) {
      return defaultValues.items.map((item: any) => {
        // Buscar el precio del producto en supplier_order.details
        const orderDetail = receptionData.supplier_order.details.find(
          (detail) =>
            detail.product_id.toString() === item.product_id?.toString(),
        );

        if (orderDetail) {
          const itemTotal =
            orderDetail.total !== undefined && orderDetail.total !== null
              ? Math.round(Number(orderDetail.total) * 100) / 100
              : Math.round(
                  Number(item.quantity || 0) *
                    Number(orderDetail.unit_price || 0) *
                    100,
                ) / 100;

          const quantity = Number(item.quantity || 0);
          const unitPrice =
            quantity > 0
              ? Math.round((itemTotal / quantity) * 10000) / 10000
              : Number(orderDetail.unit_price || 0);

          return {
            ...item,
            unit_price: unitPrice,
            item_total: itemTotal,
          };
        }

        return item;
      });
    }
    return defaultValues.items || [];
  })();

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? purchaseOrderProductsSchemaCreate
        : purchaseOrderProductsSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      items: processedItems,
      status: defaultValues.status || "PENDING",
    },
    mode: "onChange",
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  // En modo editar, obtener el warehouse por ID para extraer su sede_id
  const { data: initialWarehouse } = useWarehouseById(
    mode === "update" && defaultValues.warehouse_id
      ? Number(defaultValues.warehouse_id)
      : 0,
  );

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useAllWarehouse({
      is_physical_warehouse: 1,
      sede_id: form.watch("sede_id") || undefined,
    });
  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes({
      enable_after_sales: STATUS_ACTIVE,
    });

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeRateError, setExchangeRateError] = useState<string>("");
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

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
        `/gp/mg/exchange-rate/by-date-and-currency?to_currency_id=${currencyId}&date=${formattedDate}`,
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
    const rawDate = watchedEmissionDate as Date | string | undefined;
    const emissionDateAsDate =
      rawDate instanceof Date
        ? rawDate
        : rawDate
          ? new Date(rawDate as string)
          : null;

    if (
      watchedCurrencyTypeId &&
      watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES &&
      emissionDateAsDate instanceof Date &&
      !isNaN(emissionDateAsDate.getTime())
    ) {
      fetchExchangeRate(watchedCurrencyTypeId, emissionDateAsDate);
    } else {
      setExchangeRate(null);
      setExchangeRateError("");
    }
  }, [watchedCurrencyTypeId, watchedEmissionDate]);

  // useEffect para calcular y sincronizar totales cuando cambian los item_total
  useEffect(() => {
    let netValue = 0;

    watchedItems?.forEach((item) => {
      if (!item) return;
      const itemTotal = Number(item.item_total) || 0;
      netValue += itemTotal;
    });

    netValue = Math.round(netValue * 10000) / 10000;

    // Calcular IGV sobre el valor neto
    const taxAmount = Math.round(netValue * IGV.RATE * 10000) / 10000;

    // Calcular el total (valor neto + IGV)
    const totalAmount = Math.round((netValue + taxAmount) * 10000) / 10000;

    form.setValue("subtotal", netValue, { shouldValidate: false });
    form.setValue("total_discount", 0, { shouldValidate: false });
    form.setValue("total_tax", taxAmount, { shouldValidate: false });
    form.setValue("total", totalAmount, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemTotalsKey]);

  // useEffect para calcular automáticamente la fecha de vencimiento (30 días después de la emisión)
  useEffect(() => {
    const rawDate = watchedEmissionDate as Date | string | undefined;
    const emissionDate =
      rawDate instanceof Date
        ? rawDate
        : rawDate
          ? new Date(rawDate as string)
          : null;

    if (emissionDate instanceof Date && !isNaN(emissionDate.getTime())) {
      const dueDate = addDays(emissionDate, 30);
      form.setValue("due_date", dueDate, { shouldValidate: true });
    }
  }, [watchedEmissionDate, form]);

  if (isLoadingCurrencyTypes || isLoadingMySedes) {
    return <FormSkeleton />;
  }

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
      igv: data.total_tax || 0, // Enviar el monto del IGV calculado
      type_operation_id: data.type_operation_id || CM_POSTVENTA_ID,
    };

    onSubmit(transformedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full py-2"
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sección 1: Información de la Orden */}
          <GroupFormSection
            title="Información de la Orden"
            icon={FileText}
            className="xl:col-span-2"
            cols={{ sm: 1, md: 2 }}
          >
            <FormSelectAsync
              placeholder="Seleccionar Proveedor"
              control={form.control}
              label={"Proveedor"}
              name="supplier_id"
              useQueryHook={useSuppliers}
              mapOptionFn={(item: SuppliersResource) => ({
                value: item.id.toString(),
                label: `${item.num_doc || "S/N"} | ${item.full_name || "S/N"}`,
              })}
              perPage={10}
              debounceMs={500}
              readOnly={Boolean(receptionData)}
              defaultOption={
                receptionData?.supplier_id
                  ? {
                      value: receptionData.supplier_id.toString(),
                      label: `${
                        receptionData.supplier_num_doc || "S/N"
                      } | ${receptionData.supplier_name || "S/N"}`,
                    }
                  : undefined
              }
            ></FormSelectAsync>

            <div className="md:col-start-2">
              <FormLabel className="text-xs md:text-sm mb-1 leading-none h-fit">
                Nro Factura
              </FormLabel>
              <div className="grid grid-cols-[7rem_auto_minmax(0,1fr)] items-start gap-1">
                <FormInput
                  control={form.control}
                  name="invoice_series"
                  placeholder="F001"
                  className="text-center font-mono"
                />

                <span className="h-7 md:h-8 flex items-center justify-center text-muted-foreground font-mono">
                  -
                </span>

                <FormInput
                  control={form.control}
                  name="invoice_number"
                  placeholder="00012345"
                  className="text-center font-mono"
                />
              </div>
            </div>

            <DatePickerFormField
              control={form.control}
              name="emission_date"
              label="Fecha Emisión Factura"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              disabledRange={[
                {
                  before: receptionData?.supplier_order?.order_date
                    ? new Date(receptionData.supplier_order.order_date)
                    : new Date(new Date().getFullYear(), 6, 1),
                },
                { after: new Date() },
              ]}
            />

            <DatePickerFormField
              control={form.control}
              name="due_date"
              label="Fecha Vencimiento Factura (30 días después)"
              placeholder="Calculado automáticamente"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              disabledRange={{
                before:
                  watchedEmissionDate instanceof Date
                    ? watchedEmissionDate
                    : new Date(),
              }}
              readOnly={true}
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
              readOnly={Boolean(receptionData)}
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
              readOnly={
                !form.watch("sede_id") ||
                isLoadingWarehouses ||
                Boolean(receptionData)
              }
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
              readOnly={Boolean(receptionData)}
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

              {/* Desglose de IGV */}
              <div className="space-y-2 border rounded-md p-3 bg-slate-50/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Valor de Venta Neta:
                  </span>
                  <span className="font-medium">
                    {currencyTypes.find(
                      (ct) => ct.id.toString() === watchedCurrencyTypeId,
                    )?.symbol || "S/."}{" "}
                    {(form.watch("subtotal") || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">IGV (18%):</span>
                  <span className="font-medium">
                    {currencyTypes.find(
                      (ct) => ct.id.toString() === watchedCurrencyTypeId,
                    )?.symbol || "S/."}{" "}
                    {(form.watch("total_tax") || 0).toFixed(2)}
                  </span>
                </div>

                <div className="border-t pt-2 mt-2"></div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Importe Total:</span>
                  <span className="font-bold text-lg text-primary">
                    {currencyTypes.find(
                      (ct) => ct.id.toString() === watchedCurrencyTypeId,
                    )?.symbol || "S/."}{" "}
                    {(form.watch("total") || 0).toFixed(2)}
                  </span>
                </div>
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
                          <span className="text-xs text-muted-foreground mt-2">
                            Tipo de cambio:
                          </span>
                          <span className="text-xs font-medium">
                            S/. {exchangeRate.toFixed(4).replace(/\.?0+$/, "")}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const unitPrice =
                        Number(form.watch(`items.${index}.unit_price`)) || 0;
                      // const itemTotal =
                      //   Number(form.watch(`items.${index}.item_total`)) || 0;
                      const currentItem = form.watch(`items.${index}`);

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
                            <div className="space-y-2">
                              <FormSelectAsync
                                name={`items.${index}.product_id`}
                                placeholder="Buscar producto..."
                                control={form.control}
                                useQueryHook={useProduct}
                                mapOptionFn={(product: ProductResource) => ({
                                  value: product.id.toString(),
                                  label: `${product.name} - ${product.code} - ${
                                    product.unit_measurement_name ||
                                    "Sin unidad"
                                  }`,
                                })}
                                perPage={10}
                                debounceMs={500}
                                defaultOption={
                                  currentItem?.product_name &&
                                  currentItem?.product_code
                                    ? {
                                        value: currentItem.product_id,
                                        label: `${currentItem.product_name} - ${currentItem.product_code}`,
                                      }
                                    : undefined
                                }
                                readOnly={Boolean(receptionData)}
                              />
                              {currentItem?.product_code && (
                                <div className="flex items-center gap-2 px-2 py-1.5">
                                  <CopyCell
                                    className="text-xs font-mono text-slate-700"
                                    value={currentItem.product_code}
                                    label={`Cód: ${currentItem.product_code}`}
                                  />
                                </div>
                              )}
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
                                      readOnly={true}
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
                                              `items.${index}.item_total`,
                                            ) || 0;
                                          const calculatedPrice =
                                            Math.round((total / num) * 10000) /
                                            10000;
                                          form.setValue(
                                            `items.${index}.unit_price`,
                                            calculatedPrice,
                                            { shouldValidate: false },
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
                              {unitPrice.toFixed(6).replace(/\.?0+$/, "")}
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
                                      step="0.01"
                                      placeholder="0.00"
                                      className="text-end"
                                      value={
                                        typeof field.value === "number"
                                          ? field.value
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        const num = parseFloat(raw);
                                        const rounded = isNaN(num)
                                          ? ""
                                          : Math.round(num * 100) / 100;
                                        field.onChange(rounded);

                                        if (
                                          typeof rounded === "number" &&
                                          rounded >= 0
                                        ) {
                                          const quantity =
                                            form.getValues(
                                              `items.${index}.quantity`,
                                            ) || 1;
                                          const calculatedPrice =
                                            Math.round(
                                              (rounded / quantity) * 10000,
                                            ) / 10000;
                                          form.setValue(
                                            `items.${index}.unit_price`,
                                            calculatedPrice,
                                            { shouldValidate: false },
                                          );
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const num = parseFloat(e.target.value);
                                        if (!isNaN(num)) {
                                          const rounded =
                                            Math.round(num * 100) / 100;
                                          field.onChange(rounded);
                                          const quantity =
                                            form.getValues(
                                              `items.${index}.quantity`,
                                            ) || 1;
                                          form.setValue(
                                            `items.${index}.unit_price`,
                                            Math.round(
                                              (rounded / quantity) * 10000,
                                            ) / 10000,
                                            { shouldValidate: false },
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Campo de notas dentro de items */}
              {fields.length > 0 && (
                <div className="mt-4">
                  <FormTextArea
                    control={form.control}
                    name="notes"
                    label="Notas Generales"
                    placeholder="Notas o comentarios adicionales de la orden"
                    rows={3}
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

          <ConfirmationDialog
            trigger={
              <Button
                type="button"
                disabled={
                  isSubmitting ||
                  !form.formState.isValid ||
                  Boolean(
                    watchedCurrencyTypeId &&
                    watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES &&
                    !exchangeRate,
                  )
                }
              >
                <Loader
                  className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
                />
                {isSubmitting ? "Guardando..." : "Guardar Orden de Compra"}
              </Button>
            }
            title="Confirmar Orden de Compra"
            description="¿Estás seguro de que deseas guardar esta orden de compra con los siguientes montos?"
            confirmText="Sí, guardar"
            cancelText="Cancelar"
            onConfirm={() => form.handleSubmit(handleSubmit)()}
            icon="info"
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
          >
            <div className="space-y-3 border rounded-md p-4 bg-slate-50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Valor de Venta Neta:
                </span>
                <span className="font-medium">
                  {currencyTypes.find(
                    (ct) => ct.id.toString() === watchedCurrencyTypeId,
                  )?.symbol || "S/."}{" "}
                  {(form.watch("subtotal") || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IGV (18%):</span>
                <span className="font-medium">
                  {currencyTypes.find(
                    (ct) => ct.id.toString() === watchedCurrencyTypeId,
                  )?.symbol || "S/."}{" "}
                  {(form.watch("total_tax") || 0).toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-2 mt-2"></div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Importe Total:</span>
                <span className="font-bold text-xl text-primary">
                  {currencyTypes.find(
                    (ct) => ct.id.toString() === watchedCurrencyTypeId,
                  )?.symbol || "S/."}{" "}
                  {(form.watch("total") || 0).toFixed(2)}
                </span>
              </div>

              {watchedCurrencyTypeId &&
                watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES &&
                exchangeRate && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Equivalente (T.C. S/. {exchangeRate.toFixed(4)}):
                    </span>
                    <span className="text-sm font-semibold text-green-700">
                      S/.{" "}
                      {((form.watch("total") || 0) * exchangeRate).toFixed(2)}
                    </span>
                  </div>
                )}
            </div>
          </ConfirmationDialog>
        </div>
      </form>
    </Form>
  );
};
