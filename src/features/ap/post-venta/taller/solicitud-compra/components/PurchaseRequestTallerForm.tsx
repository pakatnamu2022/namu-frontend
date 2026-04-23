"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Package,
  Search,
  PackagePlus,
  Copy,
  Check,
  Info,
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
  FormMessage,
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
import { AREA_TALLER } from "@/features/ap/ap-master/lib/apMaster.constants";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { STATUS_ACTIVE } from "@/core/core.constants";
interface PurchaseRequestFormProps {
  defaultValues: Partial<PurchaseRequestSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  showQuotationOption?: boolean;
  allowCreateProduct?: boolean;
  area_id?: number;
}

export default function PurchaseRequestTallerForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  showQuotationOption = true,
  allowCreateProduct = false,
  area_id = AREA_TALLER,
}: PurchaseRequestFormProps) {
  const [details, setDetails] = useState<PurchaseRequestDetailSchema[]>(() => {
    // Transformar los detalles del backend al formato esperado
    if (defaultValues.details && defaultValues.details.length > 0) {
      const transformed = defaultValues.details.map((detail: any) => ({
        product_id: detail.product_id?.toString() || "",
        product_name: detail.product_name || "",
        product_code: detail.product_code || "",
        quantity: Number(detail.quantity) || 1,
        notes: detail.notes || "",
        supply_type: String(detail.supply_type) as
          | "LOCAL"
          | "CENTRAL"
          | "IMPORTACION",
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
      area_id,
      ...defaultValues,
      // Usar los details ya transformados
      details: details,
    },
    mode: "onChange",
  });

  const selectedWarehouseId = form.watch("warehouse_id");
  const hasAppointment = form.watch("has_appointment");
  const selectedQuotationId = form.watch("ap_order_quotation_id");

  const selectedWarehouse = warehouses.find(
    (w) => w.id.toString() === selectedWarehouseId,
  );

  // Estado local para el selector temporal de productos
  const [tempProductId, setTempProductId] = useState<string>("");
  const [tempProductData, setTempProductData] =
    useState<InventoryResource | null>(null);

  // Sincronizar details con el formulario
  useEffect(() => {
    form.setValue("details", details);
    // Validar inmediatamente después de setear
    form.trigger("details");
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

  const loadQuotationDetails = useCallback(async (quotationId: string) => {
    try {
      setIsLoadingQuotations(true);
      const quotation = await findOrderQuotationById(Number(quotationId));
      if (!quotation?.details) return;

      setSelectedQuotationData(quotation);

      const productDetails = quotation.details.filter(
        (detail) =>
          detail.item_type === ITEM_TYPE_PRODUCT &&
          (detail.supply_type === "CENTRAL" ||
            detail.supply_type === "IMPORTACION"),
      );

      const newDetails: PurchaseRequestDetailSchema[] = productDetails.map(
        (detail) => ({
          product_id: detail.product_id!.toString(),
          product_name: detail.product?.name || "",
          product_code: detail.product?.code || "",
          quantity: Number(detail.quantity) || 1,
          notes: "",
          supply_type: String(detail.supply_type) as
            | "LOCAL"
            | "CENTRAL"
            | "IMPORTACION",
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
  }, []);

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

    // Verificar si el producto ya está en la lista
    const productExists = details.some(
      (detail) => detail.product_id === productId,
    );

    if (productExists) {
      errorToast("El producto ya ha sido agregado a la solicitud.");
      return;
    }

    const newDetail: PurchaseRequestDetailSchema = {
      product_id: productId,
      product_name: productData?.product.name,
      product_code: productData?.product.code || "",
      quantity: 1,
      notes: "",
      supply_type: "LOCAL",
    };

    setDetails([...details, newDetail]);
  };

  const handleRemoveProduct = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      quantity: quantity > 0 ? quantity : 1,
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

  const handleUpdateSupplyType = (
    index: number,
    supply_type: "LOCAL" | "CENTRAL" | "IMPORTACION",
  ) => {
    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      supply_type,
    };
    setDetails(updatedDetails);
  };

  const SUPPLY_TYPE_OPTIONS = [
    { label: "LOCAL", value: "LOCAL" },
    { label: "CENTRAL", value: "CENTRAL" },
    { label: "IMPORTACION", value: "IMPORTACION" },
  ];

  const handleSelectQuotation = (quotationId: string) => {
    form.setValue("ap_order_quotation_id", quotationId);
  };

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
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
        <GroupFormSection
          title="Información General"
          icon={Info}
          cols={{ sm: 1 }}
        >
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
              disabledRange={{ before: new Date() }}
            />
          </div>

          {/* Checkbox para adjuntar cotización */}
          {showQuotationOption && (
            <FormField
              control={form.control}
              name="has_appointment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿Adjuntar Cotización?</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marque esta opción si desea adjuntar una cotización a la
                      solicitud de compra.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}

          {/* Selector de Cotización - Solo visible si has_appointment es true */}
          {showQuotationOption && hasAppointment && (
            <FormField
              control={form.control}
              name="ap_order_quotation_id"
              render={() => (
                <FormItem>
                  <FormLabel>Cotización</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setIsQuotationModalOpen(true);
                        }}
                        disabled={isLoadingQuotations}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {isLoadingQuotations
                          ? "Cargando cotizaciones..."
                          : getSelectedQuotationLabel() ||
                            "Buscar y seleccionar cotización"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormTextArea
            name="observations"
            label="Observaciones"
            placeholder="Notas adicionales sobre la solicitud..."
            control={form.control}
          />
        </GroupFormSection>

        {/* Productos */}
        <GroupFormSection
          title="Productos a solicitar"
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
                Seleccione un almacén para agregar productos
              </p>
            </div>
          ) : (
            <>
              {/* Selector de productos con búsqueda - Solo visible si NO hay cotización */}
              {!selectedQuotationId && (
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">
                    Seleccionar Producto
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <FormSelectAsync
                        name="temp_product_selector"
                        placeholder="Buscar y seleccionar producto para agregar"
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

              {/* Lista de Productos */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <h4 className="font-semibold text-gray-700">
                    Items de Productos
                  </h4>
                  <Badge color="secondary" className="font-semibold">
                    {details.length} item(s)
                  </Badge>
                </div>

                {details.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      No hay productos agregados
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    {/* Cabecera de tabla - Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 border-b">
                      <div className="col-span-2">Código</div>
                      <div className="col-span-3">Producto</div>
                      <div className="col-span-2">Tipo Abastec.</div>
                      <div className="col-span-2">Cantidad</div>
                      <div className="col-span-2">Notas</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Items */}
                    <div className="divide-y">
                      {details.map((detail, index) => {
                        return (
                          <div key={index}>
                            {/* Vista Desktop */}
                            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 hover:bg-gray-50 transition-colors items-center">
                              <div className="col-span-2">
                                <div className="flex items-center gap-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {detail.product_code ||
                                      `Producto #${detail.product_id}`}
                                  </p>
                                  {detail.product_code && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 hover:bg-blue-100 shrink-0"
                                      onClick={() =>
                                        handleCopyCode(
                                          detail.product_code!,
                                          index,
                                        )
                                      }
                                      tooltip="Copiar código"
                                    >
                                      {copiedIndex === index ? (
                                        <Check className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <Copy className="h-3 w-3 text-primary" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="col-span-3">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {detail.product_name ||
                                    `Producto #${detail.product_id}`}
                                </p>
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
                                      handleUpdateSupplyType(
                                        index,
                                        value as
                                          | "LOCAL"
                                          | "CENTRAL"
                                          | "IMPORTACION",
                                      )
                                    }
                                  />
                                )}
                              </div>

                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={detail.quantity}
                                  onChange={(e) =>
                                    handleUpdateQuantity(
                                      index,
                                      Number(e.target.value),
                                    )
                                  }
                                  className="h-9 text-sm"
                                  disabled={!!selectedQuotationId}
                                />
                              </div>

                              <div className="col-span-2">
                                <Input
                                  type="text"
                                  value={detail.notes || ""}
                                  onChange={(e) =>
                                    handleUpdateNotes(index, e.target.value)
                                  }
                                  placeholder="Notas opcionales..."
                                  className="h-9 text-sm"
                                />
                              </div>

                              <div className="col-span-1 flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRemoveProduct(index)}
                                  disabled={!!selectedQuotationId}
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
                                      `Producto #${detail.product_id}`}
                                  </p>
                                  {detail.product_code && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-xs font-mono text-slate-700">
                                        Código: {detail.product_code}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 hover:bg-blue-100"
                                        onClick={() =>
                                          handleCopyCode(
                                            detail.product_code!,
                                            index,
                                          )
                                        }
                                        tooltip="Copiar código"
                                      >
                                        {copiedIndex === index ? (
                                          <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3 text-primary" />
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                                  onClick={() => handleRemoveProduct(index)}
                                  disabled={!!selectedQuotationId}
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
                                        handleUpdateSupplyType(
                                          index,
                                          value as
                                            | "LOCAL"
                                            | "CENTRAL"
                                            | "IMPORTACION",
                                        )
                                      }
                                    />
                                  )}
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Cantidad
                                  </label>
                                  <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={detail.quantity}
                                    onChange={(e) =>
                                      handleUpdateQuantity(
                                        index,
                                        Number(e.target.value),
                                      )
                                    }
                                    className="h-9 text-sm w-full"
                                    disabled={!!selectedQuotationId}
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

          <FormMessage>{form.formState.errors.details?.message}</FormMessage>
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
          onOpenChange={setIsQuotationModalOpen}
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
