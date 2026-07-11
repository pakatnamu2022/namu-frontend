"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Package,
  PackagePlus,
  FileText,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PurchaseRequestSchema,
  purchaseRequestTallerSchemaCreate,
  purchaseRequestTallerSchemaUpdate,
  PurchaseRequestDetailSchema,
} from "../lib/purchaseRequest.schema";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useMyPhysicalWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook";
import { InventoryResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface";
import { findOrderQuotationById } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import { errorToast } from "@/core/core.function";
import { FormTextArea } from "@/shared/components/FormTextArea";
import QuotationPartModal from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/QuotationPartModal";
import { ITEM_TYPE_PRODUCT } from "../../cotizacion-detalle/lib/proformaDetails.constants";
import { QuotationSelectionTallerModal } from "../../cotizacion/components/QuotationSelectionTallerModal";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { IGV, STATUS_ACTIVE } from "@/core/core.constants";
import {
  SUPPLY_TYPE_OPTIONS,
  SUPPLY_TYPES,
} from "../lib/purchaseRequest.constants";
import { CopyCell } from "@/shared/components/CopyCell";
import { IntegerInput } from "@/shared/components/IntegerInput";
import { DecimalInput } from "@/shared/components/DecimalInput";
interface PurchaseRequestFormProps {
  defaultValues: Partial<PurchaseRequestSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  showQuotationOption?: boolean;
  allowCreateProduct?: boolean;
}

export default function PurchaseRequestTallerForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  showQuotationOption = true,
  allowCreateProduct = false,
}: PurchaseRequestFormProps) {
  const [details, setDetails] = useState<PurchaseRequestDetailSchema[]>(() => {
    if (defaultValues.details && defaultValues.details.length > 0) {
      const transformed = defaultValues.details.map((detail: any) => ({
        product_id: detail.product_id?.toString() || "",
        product_name: detail.product_name || "",
        product_code: detail.product_code || "",
        quantity: Number(detail.quantity) || 1,
        notes: detail.notes || "",
        supply_type: detail.supply_type || undefined,
        unit_price:
          detail.unit_price !== undefined
            ? Number(detail.unit_price)
            : undefined,
        discount_percentage:
          detail.discount_percentage !== undefined
            ? Number(detail.discount_percentage)
            : undefined,
        total_amount:
          detail.total_amount !== undefined
            ? Number(detail.total_amount)
            : undefined,
      }));
      return transformed;
    }
    return [];
  });
  const [selectedQuotationData, setSelectedQuotationData] =
    useState<OrderQuotationResource | null>(null);
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<{
    symbol: string;
  } | null>(null);

  // Obtener mis almacenes físicos de postventa
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useMyPhysicalWarehouse();

  const { data: currencyTypes = [] } = useAllCurrencyTypes({
    enable_after_sales: STATUS_ACTIVE,
  });

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? purchaseRequestTallerSchemaCreate
        : purchaseRequestTallerSchemaUpdate,
    ),
    defaultValues: {
      warehouse_id: "",
      requested_date: new Date(),
      observations: "",
      has_appointment: false,
      ...defaultValues,
      // Usar los details ya transformados
      details: details,
    },
    mode: "onChange",
  });

  const selectedWarehouseId = form.watch("warehouse_id");
  const hasAppointment = form.watch("has_appointment");
  const selectedQuotationId = form.watch("ap_order_quotation_id");
  const currencyId = form.watch("currency_id");

  const selectedWarehouse = warehouses.find(
    (w) => w.id.toString() === selectedWarehouseId,
  );

  // Estado local para el selector temporal de repuestos
  const [tempProductId, setTempProductId] = useState<string>("");
  const [tempProductData, setTempProductData] =
    useState<InventoryResource | null>(null);

  // Sincronizar details con el formulario
  useEffect(() => {
    form.setValue("details", details);
    form.trigger("details");
    details.forEach((detail, index) => {
      if (detail.supply_type) {
        form.setValue(`detail_supply_type_${index}` as any, detail.supply_type);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details]);

  // Setear valores por defecto en modo create
  useEffect(() => {
    if (mode !== "create") return;

    // Setear primer almacén si no hay valor
    if (warehouses.length > 0 && !form.getValues("warehouse_id")) {
      form.setValue("warehouse_id", warehouses[0].id.toString(), {
        shouldValidate: true,
      });
    }
  }, [warehouses, mode, form]);

  useEffect(() => {
    if (!hasAppointment) {
      form.setValue("ap_order_quotation_id", "");
    }
  }, [form, hasAppointment]);

  useEffect(() => {
    if (currencyId && currencyTypes.length > 0) {
      const currency = currencyTypes.find(
        (c) => c.id.toString() === currencyId,
      );
      setSelectedCurrency(currency || null);
    }
  }, [currencyId, currencyTypes]);

  const loadQuotationDetails = useCallback(
    async (quotationId: string) => {
      try {
        setIsLoadingQuotations(true);
        const quotation = await findOrderQuotationById(Number(quotationId));
        if (!quotation?.details) return;

        setSelectedQuotationData(quotation);

        if (quotation.currency_id) {
          form.setValue("currency_id", quotation.currency_id.toString(), {
            shouldValidate: true,
          });
        }

        const productDetails = quotation.details.filter(
          (detail) =>
            detail.item_type === ITEM_TYPE_PRODUCT &&
            (detail.supply_type === SUPPLY_TYPES.LOCAL ||
              detail.supply_type === SUPPLY_TYPES.CENTRAL ||
              detail.supply_type === SUPPLY_TYPES.IMPORTACION),
        );

        const newDetails: PurchaseRequestDetailSchema[] = productDetails.map(
          (detail) => ({
            product_id: detail.product_id!.toString(),
            product_name: detail.product?.name || "",
            product_code: detail.product?.code || "",
            quantity: Number(detail.quantity) || 1,
            notes: "",
            supply_type: detail.supply_type,
            unit_price:
              detail.unit_price !== undefined
                ? Number(detail.unit_price)
                : undefined,
            discount_percentage:
              detail.discount_percentage !== undefined
                ? Number(detail.discount_percentage)
                : undefined,
            total_amount:
              detail.net_amount !== undefined
                ? Number(detail.net_amount)
                : undefined,
          }),
        );

        setDetails(newDetails);
      } catch (error: any) {
        const msgError =
          error?.response?.data?.message || "Error al cargar la cotización.";
        errorToast(msgError);
      } finally {
        setIsLoadingQuotations(false);
      }
    },
    [form],
  );

  useEffect(() => {
    if (selectedQuotationId) {
      loadQuotationDetails(selectedQuotationId);
    } else {
      setSelectedQuotationData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuotationId]);

  if (isLoadingWarehouses) {
    return <FormSkeleton />;
  }

  const handleAddProduct = (
    productId: string,
    productData?: InventoryResource,
  ) => {
    if (!productId) {
      return;
    }

    // Verificar si el repuesto ya está en la lista
    const productExists = details.some(
      (detail) => detail.product_id === productId,
    );

    if (productExists) {
      errorToast("El repuesto ya ha sido agregado a la solicitud.");
      return;
    }

    const newDetail: PurchaseRequestDetailSchema = {
      product_id: productId,
      product_name: productData?.product.name,
      product_code: productData?.product.code || "",
      quantity: 1,
      notes: "",
      supply_type: SUPPLY_TYPES.CENTRAL,
      discount_percentage: 0,
    };

    const newIndex = details.length;
    setDetails([...details, newDetail]);
    form.setValue(
      `detail_supply_type_${newIndex}` as any,
      SUPPLY_TYPES.CENTRAL,
    );
  };

  const handleRemoveProduct = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (
    index: number,
    quantity: number | undefined,
  ) => {
    const updatedDetails = [...details];
    const qty = quantity ?? 1;
    const unitPrice = updatedDetails[index].unit_price ?? 0;
    const discount = updatedDetails[index].discount_percentage ?? 0;
    updatedDetails[index] = {
      ...updatedDetails[index],
      quantity: qty,
      total_amount:
        unitPrice > 0
          ? unitPrice * qty * (1 - discount / 100)
          : updatedDetails[index].total_amount,
    };
    setDetails(updatedDetails);
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      notes,
    };
    setDetails(updatedDetails);
  };

  const handleUpdateSupplyType = (index: number, supply_type: string) => {
    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      supply_type,
    };
    setDetails(updatedDetails);
  };

  const handleUpdateUnitPrice = (
    index: number,
    unit_price: number | undefined,
  ) => {
    const updatedDetails = [...details];
    const discount = updatedDetails[index].discount_percentage ?? 0;
    const qty = updatedDetails[index].quantity;
    updatedDetails[index] = {
      ...updatedDetails[index],
      unit_price,
      total_amount:
        unit_price !== undefined
          ? unit_price * qty * (1 - discount / 100)
          : undefined,
    };
    setDetails(updatedDetails);
  };

  const handleUpdateDiscountPercentage = (
    index: number,
    discount_percentage: number,
  ) => {
    const updatedDetails = [...details];
    const unitPrice = updatedDetails[index].unit_price ?? 0;
    const qty = updatedDetails[index].quantity;
    updatedDetails[index] = {
      ...updatedDetails[index],
      discount_percentage,
      total_amount: unitPrice * qty * (1 - discount_percentage / 100),
    };
    setDetails(updatedDetails);
  };

  const handleSelectQuotation = (quotationId: string) => {
    form.setValue("ap_order_quotation_id", quotationId);
  };

  const getSelectedQuotationLabel = () => {
    if (!selectedQuotationId || !selectedQuotationData) return null;

    const vehicle = selectedQuotationData.vehicle;
    const vehicleInfo = vehicle
      ? `${vehicle.plate || vehicle.vin} (${vehicle.model?.brand || ""} ${vehicle.model?.family || ""})`
      : "-";

    return `${selectedQuotationData.quotation_number} - ${vehicleInfo} - S/ ${selectedQuotationData.total_amount.toFixed(2)}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormSelect
            name="warehouse_id"
            label="Almacén"
            placeholder="Seleccione un almacén"
            options={warehouses.map((warehouse) => ({
              label: warehouse.description,
              value: warehouse.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            control={form.control}
            name="currency_id"
            options={currencyTypes.map((type) => ({
              value: type.id.toString(),
              label: type.name,
            }))}
            label="Moneda"
            placeholder="Seleccionar moneda"
            required
          />

          <DatePickerFormField
            control={form.control}
            name="requested_date"
            label="Fecha de Solicitud"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={{ after: new Date() }}
          />
        </div>

        {/* Checkbox para adjuntar cotización */}
        {showQuotationOption && (
          <div className="mt-4">
            <FormField
              control={form.control}
              name="has_appointment"
              render={({ field }) => (
                <FormItem className="rounded-md border p-4 space-y-0">
                  {/* Fila del checkbox */}
                  <div className="flex flex-row items-start space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        disabled={isLoadingQuotations}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange(true);
                            setIsQuotationModalOpen(true);
                          } else {
                            field.onChange(false);
                            form.setValue("ap_order_quotation_id", "");
                            setSelectedQuotationData(null);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        ¿Adjuntar Cotización?
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {isLoadingQuotations
                          ? "Cargando cotización..."
                          : "Marque para adjuntar una cotización a la solicitud."}
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta de cotización seleccionada */}
                  {hasAppointment && selectedQuotationData && (
                    <div className="mt-3 ml-7 flex items-center justify-between rounded-md bg-muted/50 border px-3 py-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {getSelectedQuotationLabel()}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsQuotationModalOpen(true)}
                        tooltip="Cambiar cotización"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </div>
        )}

        <FormTextArea
          name="observations"
          label="Observaciones"
          placeholder="Notas adicionales sobre la solicitud..."
          control={form.control}
        />

        {/* Repuestos */}
        <GroupFormSection
          title="Repuestos a solicitar"
          icon={Package}
          cols={{ sm: 1 }}
        >
          <div className="flex items-center justify-between">
            {allowCreateProduct && (
              <Button
                type="button"
                onClick={() => setIsPartModalOpen(true)}
                size="sm"
                variant="outline"
              >
                <PackagePlus className="h-4 w-4 mr-2" />
                Crear Repuesto
              </Button>
            )}
          </div>

          {!selectedWarehouseId ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Seleccione un almacén para agregar repuestos
              </p>
            </div>
          ) : (
            <>
              {/* Selector de repuestos con búsqueda - Solo visible si NO hay cotización */}
              {!selectedQuotationId && (
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">
                    Seleccionar Repuesto
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <FormSelectAsync
                        name="temp_product_selector"
                        placeholder="Buscar y seleccionar repuesto para agregar"
                        control={form.control}
                        useQueryHook={useInventory}
                        additionalParams={{
                          warehouse_id: selectedWarehouseId,
                        }}
                        mapOptionFn={(inventory: InventoryResource) => ({
                          label: () => (
                            <div className="flex items-center justify-between gap-2 w-full">
                              <span className="font-medium truncate">
                                {inventory.product.code} -{" "}
                                {inventory.product.name}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${
                                  inventory.available_quantity > 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                Stock: {inventory.available_quantity}
                              </span>
                            </div>
                          ),
                          value: inventory.product_id.toString(),
                        })}
                        perPage={10}
                        onValueChange={(value, item) => {
                          setTempProductId(value);
                          setTempProductData(item || null);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        if (tempProductId && tempProductData) {
                          handleAddProduct(tempProductId, tempProductData);
                          setTempProductId("");
                          setTempProductData(null);
                          form.setValue("temp_product_selector" as any, "");
                        }
                      }}
                      disabled={!tempProductId}
                      className="self-end sm:w-auto w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de Repuestos */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <h4 className="font-semibold text-gray-700">Repuestos</h4>
                  <Badge color="secondary" className="font-semibold">
                    {details.length} item(s)
                  </Badge>
                </div>

                {details.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      No hay repuestos agregados
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    {/* Cabecera de tabla - Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-2 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 border-b">
                      <div className="col-span-3">Repuesto</div>
                      <div className="col-span-2">Tipo Abastec.</div>
                      <div className="col-span-1">Cantidad</div>
                      <div className="col-span-1">P. Unit.</div>
                      <div className="col-span-1">Desc. %</div>
                      <div className="col-span-1">Total</div>
                      <div className="col-span-3">Notas</div>
                    </div>

                    {/* Items */}
                    <div className="divide-y">
                      {details.map((detail, index) => {
                        return (
                          <div key={index}>
                            {/* Vista Desktop */}
                            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors items-center">
                              <div className="col-span-3">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {detail.product_name ||
                                    `Repuesto #${detail.product_id}`}
                                </p>
                                {detail.product_code && (
                                  <CopyCell
                                    value={detail.product_code}
                                    label={`Cód: ${detail.product_code}`}
                                    className="text-xs text-gray-500 mt-0.5"
                                  />
                                )}
                              </div>

                              <div className="col-span-2">
                                {selectedQuotationId ? (
                                  <span className="text-sm font-medium text-gray-700">
                                    {detail.supply_type || "-"}
                                  </span>
                                ) : (
                                  <FormSelect
                                    name={`detail_supply_type_${index}` as any}
                                    placeholder="Seleccionar"
                                    options={SUPPLY_TYPE_OPTIONS}
                                    control={form.control}
                                    strictFilter={true}
                                    onValueChange={(value) =>
                                      handleUpdateSupplyType(index, value)
                                    }
                                  />
                                )}
                              </div>

                              <div className="col-span-1">
                                <IntegerInput
                                  value={detail.quantity}
                                  onChange={(val) =>
                                    handleUpdateQuantity(index, val)
                                  }
                                  className="h-9 text-sm"
                                  disabled={!!selectedQuotationId}
                                />
                              </div>

                              <div className="col-span-1">
                                <DecimalInput
                                  decimals={2}
                                  value={detail.unit_price}
                                  onChange={(val) =>
                                    handleUpdateUnitPrice(index, val)
                                  }
                                  placeholder="0.00"
                                  className="h-9 text-sm"
                                  disabled={!!selectedQuotationId}
                                />
                              </div>

                              <div className="col-span-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={detail.discount_percentage ?? ""}
                                  onChange={(e) =>
                                    handleUpdateDiscountPercentage(
                                      index,
                                      Number(e.target.value),
                                    )
                                  }
                                  placeholder="0"
                                  className="h-9 text-sm"
                                  readOnly
                                />
                              </div>

                              <div className="col-span-1">
                                <Input
                                  type="number"
                                  value={
                                    detail.total_amount !== undefined
                                      ? Number(detail.total_amount).toFixed(2)
                                      : ""
                                  }
                                  readOnly
                                  placeholder="0.00"
                                  className="h-9 text-sm bg-gray-50"
                                />
                              </div>

                              <div className="col-span-2 flex items-center gap-1">
                                <Input
                                  type="text"
                                  value={detail.notes || ""}
                                  onChange={(e) =>
                                    handleUpdateNotes(index, e.target.value)
                                  }
                                  placeholder="Notas opcionales..."
                                  className="h-9 text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                                  onClick={() => handleRemoveProduct(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Vista Mobile */}
                            <div className="md:hidden px-4 py-3 space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {detail.product_name ||
                                      `Repuesto #${detail.product_id}`}
                                  </p>
                                  {detail.product_code && (
                                    <div className="flex items-center gap-1 mt-1">
                                      {detail.product_code ? (
                                        <span className="text-xs font-mono text-slate-700">
                                          <CopyCell
                                            value={detail.product_code}
                                            label={`Cód: ${detail.product_code}`}
                                          />
                                        </span>
                                      ) : (
                                        <span className="text-gray-500">-</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                                  onClick={() => handleRemoveProduct(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Tipo Abastecimiento
                                  </label>
                                  {selectedQuotationId ? (
                                    <span className="text-sm font-medium text-gray-700">
                                      {detail.supply_type || "-"}
                                    </span>
                                  ) : (
                                    <FormSelect
                                      name={
                                        `detail_supply_type_${index}` as any
                                      }
                                      placeholder="Seleccionar"
                                      options={SUPPLY_TYPE_OPTIONS}
                                      control={form.control}
                                      strictFilter={true}
                                      onValueChange={(value) =>
                                        handleUpdateSupplyType(index, value)
                                      }
                                    />
                                  )}
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Cantidad
                                  </label>
                                  <DecimalInput
                                    decimals={2}
                                    value={detail.unit_price}
                                    onChange={(val) =>
                                      handleUpdateUnitPrice(index, val)
                                    }
                                    placeholder="0.00"
                                    className="h-9 text-sm w-full"
                                    disabled={!!selectedQuotationId}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                      Precio Unit.
                                    </label>
                                    <DecimalInput
                                      decimals={2}
                                      value={detail.unit_price}
                                      onChange={(val) =>
                                        handleUpdateUnitPrice(index, val)
                                      }
                                      placeholder="0.00"
                                      className="h-9 text-sm w-full"
                                      disabled={!!selectedQuotationId}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                      Descuento %
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      value={detail.discount_percentage ?? ""}
                                      onChange={(e) =>
                                        handleUpdateDiscountPercentage(
                                          index,
                                          Number(e.target.value),
                                        )
                                      }
                                      placeholder="0"
                                      className="h-9 text-sm w-full"
                                      disabled={!!selectedQuotationId}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Total
                                  </label>
                                  <Input
                                    type="number"
                                    value={
                                      detail.total_amount !== undefined
                                        ? Number(detail.total_amount).toFixed(2)
                                        : ""
                                    }
                                    readOnly
                                    placeholder="0.00"
                                    className="h-9 text-sm w-full bg-gray-50"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Notas
                                  </label>
                                  <Input
                                    type="text"
                                    value={detail.notes || ""}
                                    onChange={(e) =>
                                      handleUpdateNotes(index, e.target.value)
                                    }
                                    placeholder="Notas opcionales..."
                                    className="h-9 text-sm w-full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Resumen de Totales */}
          {details.some((d) => d.total_amount !== undefined) && (
            <div className="flex justify-end pt-4 border-t mt-4">
              <div className="text-right space-y-1">
                {(() => {
                  const subtotal = details.reduce(
                    (sum, d) => sum + (d.total_amount ?? 0),
                    0,
                  );
                  return (
                    <>
                      <div className="flex justify-between gap-8">
                        <p className="text-sm text-gray-600">Subtotal:</p>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedCurrency?.symbol || "S/"}{" "}
                          {subtotal.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="flex justify-between gap-8">
                        <p className="text-sm text-gray-600">IGV (18%):</p>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedCurrency?.symbol || "S/"}{" "}
                          {(subtotal * IGV.RATE).toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="flex justify-between gap-8 pt-1 border-t">
                        <p className="text-sm font-semibold text-gray-700">
                          Total General:
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {selectedCurrency?.symbol || "S/"}{" "}
                          {(subtotal * IGV.FACTOR).toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </GroupFormSection>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting || details.length === 0 || !form.formState.isValid
            }
          >
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
                ? "Crear Solicitud"
                : "Actualizar Solicitud"}
          </Button>
        </div>

        {/* Modal de Selección de Cotización */}
        <QuotationSelectionTallerModal
          open={isQuotationModalOpen}
          sedeId={selectedWarehouse?.sede_id}
          onOpenChange={(open) => {
            setIsQuotationModalOpen(open);
            if (!open && !form.getValues("ap_order_quotation_id")) {
              form.setValue("has_appointment", false);
            }
          }}
          onSelectQuotation={handleSelectQuotation}
        />

        {/* Modal de Crear Repuesto - Solo disponible para almacén */}
        {allowCreateProduct && (
          <QuotationPartModal
            open={isPartModalOpen}
            onClose={() => setIsPartModalOpen(false)}
          />
        )}
      </form>
    </Form>
  );
}
