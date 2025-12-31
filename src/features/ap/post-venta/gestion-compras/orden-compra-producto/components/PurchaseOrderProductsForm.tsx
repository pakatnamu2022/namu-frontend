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
  CheckCircle2,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook";
import {
  useAllWarehouse,
  useWarehouseById,
} from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useProduct } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.hook";
import { ProductResource } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.interface";
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
import { format, addDays } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { TYPES_OPERATION_ID } from "@/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface";
import { PurchaseOrderProductsResource } from "../lib/purchaseOrderProducts.interface";
import { usePurchaseRequestsDetailsPending } from "../../../taller/solicitud-compra/lib/purchaseRequest.hook";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PurchaseOrderProductsFormProps {
  defaultValues: Partial<PurchaseOrderProductsSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  PurchaseOrderProductsData?: PurchaseOrderProductsResource;
}

export const PurchaseOrderProductsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  PurchaseOrderProductsData,
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

  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  // Watch para obtener el warehouse_id seleccionado
  const selectedWarehouseId = form.watch("warehouse_id");

  const {
    data: purcheseRequestDetailsPending,
    isLoading: isLoadingPurcheseRequestDetailsPending,
  } = usePurchaseRequestsDetailsPending({
    warehouse_id: selectedWarehouseId ? Number(selectedWarehouseId) : undefined,
  });

  console.log({ purcheseRequestDetailsPending });

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
  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes();

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeRateError, setExchangeRateError] = useState<string>("");
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [addedRequestDetailIds, setAddedRequestDetailIds] = useState<number[]>(
    []
  );
  const [discardedRequestDetailIds, setDiscardedRequestDetailIds] = useState<
    number[]
  >([]);

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

  // useEffect para calcular automáticamente la fecha de vencimiento (30 días después de la emisión)
  useEffect(() => {
    if (watchedEmissionDate instanceof Date) {
      const dueDate = addDays(watchedEmissionDate, 30);
      form.setValue("due_date", dueDate, { shouldValidate: true });
    }
  }, [watchedEmissionDate, form]);

  if (isLoadingCurrencyTypes || isLoadingMySedes) {
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

  const handleAddFromRequest = (requestDetail: any) => {
    const existingItemIndex = fields.findIndex(
      (item: any) => item.product_id === requestDetail.product_id.toString()
    );

    if (existingItemIndex !== -1) {
      // Si el producto ya existe, sumar la cantidad
      const currentQuantity =
        form.getValues(`items.${existingItemIndex}.quantity`) || 0;
      const newQuantity = currentQuantity + parseFloat(requestDetail.quantity);
      form.setValue(`items.${existingItemIndex}.quantity`, newQuantity);

      // Recalcular precio unitario
      const itemTotal =
        form.getValues(`items.${existingItemIndex}.item_total`) || 0;
      if (newQuantity > 0) {
        const calculatedPrice =
          Math.round((itemTotal / newQuantity) * 10000) / 10000;
        form.setValue(
          `items.${existingItemIndex}.unit_price`,
          calculatedPrice,
          { shouldValidate: false }
        );
      }
    } else {
      // Si no existe, agregar nuevo item
      append({
        product_id: requestDetail.product_id.toString(),
        quantity: parseFloat(requestDetail.quantity),
        item_total: 0,
        unit_price: 0,
        discount: 0,
        tax_rate: 18,
        notes: requestDetail.notes || "",
      });
    }

    // Agregar el ID a la lista de añadidos
    setAddedRequestDetailIds((prev) => [...prev, requestDetail.id]);
  };

  const handleDiscardFromRequest = (requestDetail: any) => {
    console.log("Descartando solicitud de compra:", {
      request_detail_id: requestDetail.id,
      product_id: requestDetail.product_id,
      product_name: requestDetail.product_name,
      request_number: requestDetail.request_number,
      quantity: requestDetail.quantity,
    });

    // TODO: Endpoint en desarrollo para descartar
    // await api.post('/ap/purchase-requests/details/discard', { detail_id: requestDetail.id });

    // Agregar el ID a la lista de descartados
    setDiscardedRequestDetailIds((prev) => [...prev, requestDetail.id]);
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

  // Filtrar solicitudes no añadidas ni descartadas
  // Solo mostrar si hay almacén seleccionado
  const availablePurchaseRequests =
    (selectedWarehouseId &&
      purcheseRequestDetailsPending?.data?.filter(
        (detail: any) =>
          !addedRequestDetailIds.includes(detail.id) &&
          !discardedRequestDetailIds.includes(detail.id)
      )) ||
    [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full formlayout py-2"
      >
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Lista lateral de solicitudes de compra */}
          {((availablePurchaseRequests.length > 0 && mode === "create") ||
            (isLoadingPurcheseRequestDetailsPending &&
              selectedWarehouseId &&
              mode === "create")) && (
            <div className="xl:col-span-4 order-last xl:order-first">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Solicitudes de Compra Pendientes
                    {!isLoadingPurcheseRequestDetailsPending && (
                      <Badge variant="secondary" className="ml-auto">
                        {availablePurchaseRequests.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-12rem)] px-4">
                    {isLoadingPurcheseRequestDetailsPending ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Cargando solicitudes...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 pb-4">
                        {availablePurchaseRequests.map((detail: any) => (
                          <Card
                            key={detail.id}
                            className="border-l-4 border-l-primary hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">
                                    {detail.product_name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Código: {detail.product_code}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">
                                    Solicitud:
                                  </span>
                                  <p className="font-medium">
                                    {detail.request_number}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Cantidad:
                                  </span>
                                  <p className="font-medium">
                                    {parseFloat(detail.quantity)}
                                  </p>
                                </div>
                              </div>

                              <div className="text-xs">
                                <span className="text-muted-foreground">
                                  Almacén:
                                </span>
                                <p className="font-medium truncate">
                                  {detail.warehouse_name}
                                </p>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="flex-1 h-8"
                                  onClick={() => handleAddFromRequest(detail)}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Añadir
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() =>
                                    handleDiscardFromRequest(detail)
                                  }
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Descartar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contenido principal del formulario */}
          <div
            className={
              ((availablePurchaseRequests.length > 0 && mode === "create") ||
                (isLoadingPurcheseRequestDetailsPending &&
                  selectedWarehouseId &&
                  mode === "create"))
                ? "xl:col-span-8"
                : "xl:col-span-12"
            }
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
                    label: `${item.num_doc || "S/N"} | ${
                      item.full_name || "S/N"
                    }`,
                  })}
                  perPage={10}
                  debounceMs={500}
                  defaultOption={
                    PurchaseOrderProductsData?.supplier_id
                      ? {
                          value:
                            PurchaseOrderProductsData.supplier_id.toString(),
                          label: `${
                            PurchaseOrderProductsData.supplier_num_doc || "S/N"
                          } | ${PurchaseOrderProductsData.supplier || "S/N"}`,
                        }
                      : undefined
                  }
                ></FormSelectAsync>

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
                  label="Fecha Vencimiento Factura (30 días después)"
                  placeholder="Calculado automáticamente"
                  dateFormat="dd/MM/yyyy"
                  captionLayout="dropdown"
                  disabledRange={{ before: watchedEmissionDate || new Date() }}
                  disabled={true}
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
                    Los totales se calcularán automáticamente según los
                    productos agregados.
                  </div>

                  <div className="flex justify-between items-center py-3 bg-primary/5 px-3 rounded-md">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-primary">
                      {currencyTypes.find(
                        (ct) => ct.id.toString() === watchedCurrencyTypeId
                      )?.symbol || "S/."}{" "}
                      {(form.watch("total") || 0)
                        .toFixed(4)
                        .replace(/\.?0+$/, "")}
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
                                S/.{" "}
                                {exchangeRate.toFixed(4).replace(/\.?0+$/, "")}
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
                          <TableHead className="min-w-[250px]">
                            Producto
                          </TableHead>
                          <TableHead className="w-24 text-center">
                            Cantidad
                          </TableHead>
                          <TableHead className="w-32 text-end">
                            Precio
                          </TableHead>
                          <TableHead className="w-32 text-end">Total</TableHead>
                          {watchedCurrencyTypeId &&
                            watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES &&
                            exchangeRate && (
                              <TableHead className="w-32 text-end">
                                Total Soles
                              </TableHead>
                            )}
                          <TableHead className="w-20 text-center">
                            Acción
                          </TableHead>
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
                                  {mode === "update" ? (
                                    // Modo edición: Mostrar nombre del producto (solo lectura)
                                    <div className="h-auto min-h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm flex items-center">
                                      <span className="font-medium text-sm truncate">
                                        {PurchaseOrderProductsData?.items?.[
                                          index
                                        ]?.product_name ||
                                          "Producto no disponible"}
                                      </span>
                                    </div>
                                  ) : (
                                    // Modo creación: Selector asíncrono
                                    <>
                                      <FormSelectAsync
                                        name={`items.${index}.product_id`}
                                        placeholder="Buscar producto..."
                                        control={form.control}
                                        useQueryHook={useProduct}
                                        mapOptionFn={(
                                          product: ProductResource
                                        ) => ({
                                          value: product.id.toString(),
                                          label: `${product.name} - ${
                                            product.code
                                          } - ${
                                            product.unit_measurement_name ||
                                            "Sin unidad"
                                          }`,
                                        })}
                                        perPage={10}
                                        debounceMs={500}
                                      />
                                      {/* Badge si fue añadido desde solicitud */}
                                      {purcheseRequestDetailsPending?.data?.find(
                                        (detail: any) =>
                                          detail.product_id.toString() ===
                                            form.watch(
                                              `items.${index}.product_id`
                                            ) &&
                                          addedRequestDetailIds.includes(
                                            detail.id
                                          )
                                      ) && (
                                        <Badge
                                          variant="default"
                                          className="mt-1 w-fit bg-green-600"
                                        >
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Añadido desde solicitud
                                        </Badge>
                                      )}
                                    </>
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
                                          value={
                                            typeof field.value === "number"
                                              ? field.value
                                              : ""
                                          }
                                          onChange={(e) => {
                                            const num = parseInt(
                                              e.target.value
                                            );
                                            field.onChange(
                                              isNaN(num) ? "" : num
                                            );

                                            // Calcular precio unitario inmediatamente
                                            if (!isNaN(num) && num > 0) {
                                              const total =
                                                form.getValues(
                                                  `items.${index}.item_total`
                                                ) || 0;
                                              const calculatedPrice =
                                                Math.round(
                                                  (total / num) * 10000
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
                                            const num = parseFloat(
                                              e.target.value
                                            );
                                            field.onChange(
                                              isNaN(num) ? "" : num
                                            );

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
                                watchedCurrencyTypeId !==
                                  CURRENCY_TYPE_IDS.SOLES &&
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
                                  disabled={mode === "update"}
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
                    disabled={mode === "update"}
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
          </div>
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
