import {
  SupplierOrderSchema,
  supplierOrderSchemaCreate,
  supplierOrderSchemaUpdate,
} from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.schema.ts";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
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
import {
  FileText,
  Loader,
  Package,
  Plus,
  Trash2,
  Calculator,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { useSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook.ts";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook.ts";
import { useProduct } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook.ts";
import { ProductResource } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.interface.ts";
import { GroupFormSection } from "@/shared/components/GroupFormSection.tsx";
import { useEffect, useState } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField.tsx";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook.ts";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook.ts";
import { EMPRESA_AP, IGV, STATUS_ACTIVE } from "@/core/core.constants.ts";
import { api } from "@/core/api.ts";
import { format } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants.ts";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync.tsx";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface.ts";
import { SupplierOrderResource } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.interface.ts";
import { useUnitMeasurement } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.hook.ts";
import { UnitMeasurementResource } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.interface.ts";
import { FormInput } from "@/shared/components/FormInput.tsx";
import { PendingPurchaseRequestsList } from "./PendingPurchaseRequestsList.tsx";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog.tsx";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePurchaseRequestsDetailsPending } from "../../../taller/solicitud-compra/lib/purchaseRequest.hook.ts";
import { rejectPurchaseRequestDetail } from "../../../taller/solicitud-compra/lib/purchaseRequest.actions.ts";

const SUPPLY_TYPE_OPTIONS = [
  { label: "Lima", value: "LIMA" },
  { label: "Importación", value: "IMPORTACION" },
];

interface SupplierOrderFormProps {
  defaultValues: Partial<SupplierOrderSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  SupplierOrderData?: SupplierOrderResource;
}

export const SupplierOrderForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  SupplierOrderData,
}: SupplierOrderFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? supplierOrderSchemaCreate : supplierOrderSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      details: defaultValues.details || [],
      supply_type: defaultValues.supply_type || "STOCK",
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

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
  const [addedRequestDetailIds, setAddedRequestDetailIds] = useState<number[]>(
    [],
  );
  // Mapa que relaciona cada product_id con sus request_detail_ids originales
  const [productRequestMap, setProductRequestMap] = useState<
    Record<string, number[]>
  >({});
  const [isRequestListVisible, setIsRequestListVisible] = useState(true);
  const [openRejectedAlert, setOpenRejectedAlert] = useState(false);
  const [pendingDiscardRequest, setPendingDiscardRequest] = useState<any>(null);
  // Mapa de defaultOptions por product_id (para producto y unidad de medida)
  const [detailDefaultOptions, setDetailDefaultOptions] = useState<
    Record<
      string,
      {
        product?: { value: string; label: string };
        unit?: { value: string; label: string };
      }
    >
  >({});

  // Inicializar defaultOptions desde SupplierOrderData al editar
  useEffect(() => {
    if (SupplierOrderData?.details?.length) {
      const initialDefaults: Record<
        string,
        {
          product?: { value: string; label: string };
          unit?: { value: string; label: string };
        }
      > = {};
      SupplierOrderData.details.forEach((detail) => {
        const productId = detail.product_id.toString();
        initialDefaults[productId] = {
          product: detail.product
            ? {
                value: productId,
                label: `${detail.product.name} - ${detail.product.code}`,
              }
            : undefined,
          unit: detail.unit_measurement
            ? {
                value: detail.unit_measurement_id.toString(),
                label: detail.unit_measurement.description,
              }
            : undefined,
        };
      });
      setDetailDefaultOptions(initialDefaults);
    }
  }, [SupplierOrderData]);

  // Watch con suscripción completa al formulario
  const formValues = form.watch();
  const watchedDetails = formValues.details || [];
  const watchedCurrencyTypeId = formValues.type_currency_id;
  const watchedOrderDate = formValues.order_date;

  // Watch para obtener el warehouse_id seleccionado
  const selectedWarehouseId = form.watch("warehouse_id");

  const {
    data: purcheseRequestDetailsPending,
    isLoading: isLoadingPurcheseRequestDetailsPending,
    refetch: refetchPurchaseRequests,
  } = usePurchaseRequestsDetailsPending({
    warehouse_id: selectedWarehouseId ? Number(selectedWarehouseId) : undefined,
  });

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
    // Verificar si la fecha es válida (puede ser Date o string)
    const isValidDate =
      watchedOrderDate instanceof Date ||
      (typeof watchedOrderDate === "string" && watchedOrderDate.length > 0);

    let dateToUse: Date | null = null;

    if (watchedOrderDate instanceof Date) {
      dateToUse = watchedOrderDate;
    } else if (typeof watchedOrderDate === "string" && watchedOrderDate.length > 0) {
      // Para evitar problemas de zona horaria, parseamos manualmente la fecha en formato YYYY-MM-DD
      const parts = watchedOrderDate.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Los meses en JS empiezan en 0
        const day = parseInt(parts[2], 10);
        dateToUse = new Date(year, month, day);
      }
    }

    // Solo consultar si la moneda NO es soles (id 1) y si ambos valores existen
    if (
      watchedCurrencyTypeId &&
      watchedCurrencyTypeId !== CURRENCY_TYPE_IDS.SOLES &&
      isValidDate &&
      dateToUse &&
      !isNaN(dateToUse.getTime())
    ) {
      fetchExchangeRate(watchedCurrencyTypeId, dateToUse);
    } else {
      // Si es soles o no hay datos, limpiar el tipo de cambio
      setExchangeRate(null);
      setExchangeRateError("");
    }
  }, [watchedCurrencyTypeId, watchedOrderDate]);

  // Setear la primera sede por defecto cuando se carguen las sedes
  useEffect(() => {
    if (mySedes.length > 0 && !form.getValues("sede_id")) {
      form.setValue("sede_id", mySedes[0].id.toString());
    }
  }, [mySedes, form]);

  // Setear el primer almacén por defecto cuando se carguen los almacenes
  useEffect(() => {
    if (warehouses.length > 0 && !form.getValues("warehouse_id")) {
      form.setValue("warehouse_id", warehouses[0].id.toString());
    }
  }, [warehouses, form]);

  if (isLoadingCurrencyTypes || isLoadingMySedes) {
    return <FormSkeleton />;
  }

  const handleAddItem = () => {
    append({
      product_id: "",
      unit_measurement_id: "",
      quantity: 1,
      total: 0,
      unit_price: 0,
      note: "",
    });
  };

  const handleRemoveItem = (index: number) => {
    // Obtener el product_id del item que se va a eliminar
    const itemToRemove = fields[index] as any;
    const productId = itemToRemove.product_id;

    // Buscar todos los request_detail_ids asociados a este producto
    const associatedRequestIds = productRequestMap[productId] || [];

    if (associatedRequestIds.length > 0) {
      // Remover TODOS los request_detail_ids asociados a este producto
      setAddedRequestDetailIds((prev) =>
        prev.filter((id) => !associatedRequestIds.includes(id)),
      );

      // Limpiar el mapeo de este producto
      setProductRequestMap((prev) => {
        const newMap = { ...prev };
        delete newMap[productId];
        return newMap;
      });
    }

    // Eliminar el item del formulario
    remove(index);
  };

  const handleAddFromRequest = (requestDetail: any) => {
    const productId = requestDetail.product_id.toString();
    const existingItemIndex = fields.findIndex(
      (item: any) => item.product_id === productId,
    );

    if (existingItemIndex !== -1) {
      // Si el producto ya existe, sumar la cantidad
      const currentQuantity =
        form.getValues(`details.${existingItemIndex}.quantity`) || 0;
      const newQuantity = currentQuantity + parseFloat(requestDetail.quantity);
      form.setValue(`details.${existingItemIndex}.quantity`, newQuantity);

      // Setear el unit_measurement_id si viene en el requestDetail
      if (requestDetail.unit_measurement_id) {
        form.setValue(
          `details.${existingItemIndex}.unit_measurement_id`,
          requestDetail.unit_measurement_id.toString(),
        );
      }

      // Recalcular precio unitario
      const itemTotal =
        form.getValues(`details.${existingItemIndex}.total`) || 0;
      if (newQuantity > 0) {
        const calculatedPrice =
          Math.round((itemTotal / newQuantity) * 10000) / 10000;
        form.setValue(
          `details.${existingItemIndex}.unit_price`,
          calculatedPrice,
          { shouldValidate: false },
        );
      }

      // Agregar este request_detail_id al mapeo del producto
      setProductRequestMap((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] || []), requestDetail.id],
      }));
    } else {
      // Si no existe, actualizar nuevo item
      append({
        product_id: productId,
        unit_measurement_id:
          requestDetail.unit_measurement_id?.toString() || "",
        quantity: parseFloat(requestDetail.quantity),
        total: 0,
        unit_price: 0,
        note: requestDetail.notes || "",
      });

      // Inicializar el mapeo para este nuevo producto
      setProductRequestMap((prev) => ({
        ...prev,
        [productId]: [requestDetail.id],
      }));
    }

    // Agregar el ID a la lista de añadidos
    setAddedRequestDetailIds((prev) => [...prev, requestDetail.id]);

    // Guardar defaultOptions para el producto y unidad de medida
    setDetailDefaultOptions((prev) => ({
      ...prev,
      [productId]: {
        product: {
          value: productId,
          label: `${requestDetail.product_name || ""} - ${requestDetail.product_code || ""}`,
        },
        unit: requestDetail.unit_measurement_id
          ? {
              value: requestDetail.unit_measurement_id.toString(),
              label:
                requestDetail.unit_measurement_name ||
                requestDetail.product?.unit_measurement?.description ||
                "",
            }
          : prev[productId]?.unit,
      },
    }));
  };

  const handleDiscardFromRequest = (requestDetail: any) => {
    // Guardar la solicitud pendiente de descarte y mostrar el diálogo
    setPendingDiscardRequest(requestDetail);
    setOpenRejectedAlert(true);
  };

  const handleConfirmDiscard = async () => {
    if (!pendingDiscardRequest) return;

    try {
      // Llamar al endpoint para rechazar la solicitud de compra
      await rejectPurchaseRequestDetail(pendingDiscardRequest.id);

      toast.success("Solicitud descartada correctamente");

      // Refrescar la lista de solicitudes pendientes
      await refetchPurchaseRequests();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Error al descartar la solicitud de compra",
      );
    } finally {
      // Limpiar el estado y cerrar el diálogo
      setPendingDiscardRequest(null);
      setOpenRejectedAlert(false);
    }
  };

  const handleSubmit = (data: any) => {
    // Transformar fechas a formato Y-m-d y números antes de enviar
    const transformedData = {
      ...data,
      order_date:
        data.order_date instanceof Date
          ? format(data.order_date, "yyyy-MM-dd")
          : data.order_date,
      details: data.details?.map((detail: any) => ({
        ...detail,
        quantity: parseFloat(detail.quantity) || 0,
        unit_price: parseFloat(detail.unit_price) || 0,
        total: parseFloat(detail.total) || 0, // Enviar el valor neto directamente
      })),
      request_detail_ids:
        addedRequestDetailIds.length > 0 ? addedRequestDetailIds : undefined,
    };

    onSubmit(transformedData);
  };

  // Calcular el valor neto (suma de los items sin IGV)
  const netValue = watchedDetails?.reduce(
    (sum, detail) => sum + (Number(detail?.total) || 0),
    0,
  );

  // Calcular IGV sobre el valor neto
  const igvAmount = netValue * IGV.RATE; // 18% del valor neto

  // Calcular el importe total (valor neto + IGV)
  const grandTotal = netValue + igvAmount;

  // Filtrar solicitudes no añadidas
  // Solo mostrar si hay almacén seleccionado
  const availablePurchaseRequests =
    (selectedWarehouseId &&
      purcheseRequestDetailsPending?.data?.filter(
        (detail: any) => !addedRequestDetailIds.includes(detail.id),
      )) ||
    [];

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 w-full py-2"
        >
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
            {/* Lista lateral de solicitudes de compra */}
            {((availablePurchaseRequests.length > 0 && mode === "create") ||
              (isLoadingPurcheseRequestDetailsPending &&
                selectedWarehouseId &&
                mode === "create")) && (
              <>
                {/* Botón toggle para mostrar/ocultar la lista */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRequestListVisible(!isRequestListVisible)}
                  className="absolute left-[-35px] top-0 z-10 h-8 w-8 p-0 rounded-full shadow-md hidden lg:block"
                >
                  {isRequestListVisible ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {/* Lista de solicitudes */}
                {isRequestListVisible && (
                  <div className="xl:col-span-3 order-last xl:order-first">
                    <PendingPurchaseRequestsList
                      requests={availablePurchaseRequests}
                      isLoading={isLoadingPurcheseRequestDetailsPending}
                      onAdd={handleAddFromRequest}
                      onDiscard={handleDiscardFromRequest}
                    />
                  </div>
                )}
              </>
            )}

            {/* Contenido principal del formulario */}
            <div
              className={
                ((availablePurchaseRequests.length > 0 && mode === "create") ||
                  (isLoadingPurcheseRequestDetailsPending &&
                    selectedWarehouseId &&
                    mode === "create")) &&
                isRequestListVisible
                  ? "xl:col-span-9"
                  : "xl:col-span-12"
              }
            >
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Sección 1: Información del Pedido */}
                <GroupFormSection
                  title="Información del Pedido"
                  icon={FileText}
                  className="xl:col-span-2"
                  cols={{ sm: 1, md: 2 }}
                >
                  <FormInput
                    name="order_number"
                    label="Número de Pedido"
                    placeholder="Ingrese el número de pedido"
                    control={form.control}
                  />

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
                      SupplierOrderData?.supplier_id
                        ? {
                            value: SupplierOrderData.supplier_id.toString(),
                            label: SupplierOrderData.supplier!.full_name,
                          }
                        : undefined
                    }
                  />

                  <DatePickerFormField
                    control={form.control}
                    name="order_date"
                    label="Fecha de Pedido"
                    placeholder="Selecciona una fecha"
                    dateFormat="dd/MM/yyyy"
                    captionLayout="dropdown"
                    disabledRange={{ after: new Date() }}
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
                    name="type_currency_id"
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
                    name="supply_type"
                    label="Tipo de Abastecimiento"
                    placeholder="Seleccionar Tipo"
                    options={SUPPLY_TYPE_OPTIONS}
                    control={form.control}
                  />
                </GroupFormSection>

                {/* Sección 2: Resumen */}
                <GroupFormSection
                  title="Total del Pedido"
                  icon={Calculator}
                  className="xl:col-span-1"
                  cols={{ sm: 1, md: 1 }}
                >
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded-md mb-3">
                      El total se calculará automáticamente según los productos
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
                          {(netValue || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          IGV (18%):
                        </span>
                        <span className="font-medium">
                          {currencyTypes.find(
                            (ct) => ct.id.toString() === watchedCurrencyTypeId,
                          )?.symbol || "S/."}{" "}
                          {(igvAmount || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="border-t pt-2 mt-2"></div>

                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Importe Total:</span>
                        <span className="font-bold text-lg text-primary">
                          {currencyTypes.find(
                            (ct) => ct.id.toString() === watchedCurrencyTypeId,
                          )?.symbol || "S/."}{" "}
                          {(grandTotal || 0).toFixed(2)}
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
                                  S/.{" "}
                                  {exchangeRate
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

                {/* Sección 3: Detalles del Pedido */}
                <GroupFormSection
                  title="Productos del Pedido"
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
                            <TableHead className="w-40">
                              Unidad Medida
                            </TableHead>
                            <TableHead className="w-24 text-center">
                              Cantidad
                            </TableHead>
                            <TableHead className="w-32 text-end">
                              Precio
                            </TableHead>
                            <TableHead className="w-32 text-end">
                              Total
                            </TableHead>
                            {watchedCurrencyTypeId &&
                              watchedCurrencyTypeId !==
                                CURRENCY_TYPE_IDS.SOLES &&
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
                              Number(
                                form.watch(`details.${index}.unit_price`),
                              ) || 0;
                            const itemTotal =
                              Number(form.watch(`details.${index}.total`)) || 0;
                            const currentProductId = form.watch(
                              `details.${index}.product_id`,
                            );
                            const rowDefaults = currentProductId
                              ? detailDefaultOptions[currentProductId]
                              : undefined;

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
                                  <FormSelectAsync
                                    name={`details.${index}.product_id`}
                                    placeholder="Buscar producto..."
                                    control={form.control}
                                    useQueryHook={useProduct}
                                    mapOptionFn={(
                                      product: ProductResource,
                                    ) => ({
                                      value: product.id.toString(),
                                      label: `${product.name} - ${product.code}`,
                                    })}
                                    perPage={10}
                                    debounceMs={500}
                                    defaultOption={rowDefaults?.product}
                                    onValueChange={(_, selectedProduct) => {
                                      // Setear el unit_measurement_id del producto seleccionado
                                      if (
                                        selectedProduct?.unit_measurement_id
                                      ) {
                                        form.setValue(
                                          `details.${index}.unit_measurement_id`,
                                          selectedProduct.unit_measurement_id.toString(),
                                        );
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell className="align-middle p-1.5">
                                  <FormSelectAsync
                                    name={`details.${index}.unit_measurement_id`}
                                    placeholder="Unidad..."
                                    control={form.control}
                                    useQueryHook={useUnitMeasurement}
                                    mapOptionFn={(
                                      unit: UnitMeasurementResource,
                                    ) => ({
                                      value: unit.id.toString(),
                                      label: unit.description,
                                    })}
                                    perPage={10}
                                    debounceMs={500}
                                    defaultOption={rowDefaults?.unit}
                                  />
                                </TableCell>
                                <TableCell className="align-middle p-1.5 text-center">
                                  <FormField
                                    control={form.control}
                                    name={`details.${index}.quantity`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            placeholder="1"
                                            className="text-center"
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                              const num = parseFloat(
                                                e.target.value,
                                              );
                                              field.onChange(
                                                isNaN(num) ? "" : num,
                                              );

                                              // Calcular precio unitario inmediatamente
                                              if (!isNaN(num) && num > 0) {
                                                const total =
                                                  Number(
                                                    form.getValues(
                                                      `details.${index}.total`,
                                                    ),
                                                  ) || 0;
                                                const calculatedPrice =
                                                  Math.round(
                                                    (total / num) * 10000,
                                                  ) / 10000;
                                                form.setValue(
                                                  `details.${index}.unit_price`,
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
                                    {unitPrice.toFixed(4).replace(/\.?0+$/, "")}
                                  </div>
                                </TableCell>
                                <TableCell className="align-middle p-1.5">
                                  <FormField
                                    control={form.control}
                                    name={`details.${index}.total`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.0001"
                                            placeholder="0.00"
                                            className="text-end"
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                              const num = parseFloat(
                                                e.target.value,
                                              );
                                              field.onChange(
                                                isNaN(num) ? "" : num,
                                              );

                                              // Calcular precio unitario inmediatamente
                                              if (!isNaN(num) && num >= 0) {
                                                const quantity =
                                                  Number(
                                                    form.getValues(
                                                      `details.${index}.quantity`,
                                                    ),
                                                  ) || 1;
                                                const calculatedPrice =
                                                  Math.round(
                                                    (num / quantity) * 10000,
                                                  ) / 10000;
                                                form.setValue(
                                                  `details.${index}.unit_price`,
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
                                    onClick={() => handleRemoveItem(index)}
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

                    {/* Botón para actualizar items */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddItem}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Producto
                    </Button>
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
                  !exchangeRate,
                )
              }
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
              />
              {isSubmitting ? "Guardando..." : "Guardar Pedido a Proveedor"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Alert para confirmar rechazo de solicitud de compra Item */}
      <SimpleConfirmDialog
        open={openRejectedAlert}
        onOpenChange={setOpenRejectedAlert}
        onConfirm={handleConfirmDiscard}
        title="¿Descartar Solicitud de Compra?"
        description={`¿Estás seguro de descartar esta solicitud? El producto "${
          pendingDiscardRequest?.product_name || ""
        }" será descartado de las solicitudes pendientes.`}
        confirmText="Sí, Descartar"
        cancelText="Cancelar"
        variant="destructive"
        icon="warning"
      />
    </>
  );
};
