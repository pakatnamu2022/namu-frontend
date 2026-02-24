import {
  VehiclePurchaseOrderSchema,
  vehiclePurchaseOrderSchemaCreate,
  vehiclePurchaseOrderSchemaUpdate,
  genericPurchaseOrderSchemaCreate,
  genericPurchaseOrderSchemaUpdate,
  consignmentPurchaseOrderSchemaCreate,
  consignmentPurchaseOrderSchemaUpdate,
} from "../lib/vehiclePurchaseOrder.schema";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/DataTable";
import { usePurchaseOrderItemsColumns } from "./PurchaseOrderItemsColumns";
import {
  Loader,
  Car,
  FileText,
  Calculator,
  Plus,
  Package,
  FileEdit,
} from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { useMemo, useRef, useState, useEffect } from "react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllModelsVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { useAllVehicleColor } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.hook";
import { useAllEngineTypes } from "@/features/ap/configuraciones/vehiculos/tipos-motor/lib/engineTypes.hook";
import { useAllSupplierOrderType } from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/lib/supplierOrderType.hook";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useWarehouseByModelSede } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useSuppliers } from "../../proveedores/lib/suppliers.hook";
import { useAllUnitMeasurement } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.hook";
import { EMPRESA_AP } from "@/core/core.constants";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import VehicleColorModal from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/components/VehicleColorModal";
import { useQueryClient } from "@tanstack/react-query";
import { VEHICLE_COLOR } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.constants";
import { useAllBrandsBySede } from "../../../configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.hook";
import { UNIT_MEASUREMENT_ID } from "../../../configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.constants";
import { VEHICLE_PURCHASE_ORDER } from "../lib/vehiclePurchaseOrder.constants";
import { FormInput } from "@/shared/components/FormInput";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import {
  usePurchaseRequestQuote,
  usePurchaseRequestQuoteById,
} from "../../solicitudes-cotizaciones/lib/purchaseRequestQuote.hook";
import { PurchaseRequestQuoteResource } from "../../solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";

interface VehiclePurchaseOrderFormProps {
  defaultValues: Partial<VehiclePurchaseOrderSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update" | "resend";
  isVehiclePurchase?: boolean; // Nuevo parámetro para determinar si es compra de vehículo
  consignmentShippingGuideId?: number; // ID de guía de consignación para OC de consignación
}

export const VehiclePurchaseOrderForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  isVehiclePurchase = true, // Por defecto es compra de vehículo
  consignmentShippingGuideId,
}: VehiclePurchaseOrderFormProps) => {
  const isConsignmentOrder = !!consignmentShippingGuideId;
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { ABSOLUTE_ROUTE } = VEHICLE_PURCHASE_ORDER;
  const queryClient = useQueryClient();
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [hasIsc, setHasIsc] = useState(false);
  const hasAddedInitialItem = useRef(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<
    number | undefined
  >(undefined);

  const form = useForm({
    resolver: zodResolver(
      isConsignmentOrder
        ? mode === "create"
          ? consignmentPurchaseOrderSchemaCreate
          : consignmentPurchaseOrderSchemaUpdate
        : mode === "create"
          ? isVehiclePurchase
            ? vehiclePurchaseOrderSchemaCreate
            : genericPurchaseOrderSchemaCreate
          : isVehiclePurchase
            ? vehiclePurchaseOrderSchemaUpdate
            : genericPurchaseOrderSchemaUpdate,
    ) as any,
    defaultValues: {
      ...defaultValues,
      items: defaultValues.items || [],
      vehicle_unit_price: defaultValues.vehicle_unit_price || 0,
      subtotal: defaultValues.subtotal || 0,
      igv: defaultValues.igv || 0,
      total: defaultValues.total || 0,
      discount: 0, // Siempre 0, no se usa
      isc: defaultValues.isc || 0,
    },
    mode: "onChange",
  });

  // Field array para manejar los items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Si es compra de vehículo o consignación y no hay items, agregar el primer item automáticamente
  useEffect(() => {
    if (
      (isVehiclePurchase || isConsignmentOrder) &&
      fields.length === 0 &&
      mode === "create" &&
      !hasAddedInitialItem.current
    ) {
      hasAddedInitialItem.current = true;
      append({
        unit_measurement_id: UNIT_MEASUREMENT_ID.UNIDAD.toString(),
        description: "",
        unit_price: 0,
        quantity: 1,
        is_vehicle: isVehiclePurchase,
      });
    }
  }, [isVehiclePurchase, isConsignmentOrder, fields.length, append, mode]);

  // Sincronizar el precio unitario del vehículo con el primer item
  const vehicleUnitPrice = form.watch("vehicle_unit_price");
  useEffect(() => {
    if (
      isVehiclePurchase &&
      fields.length > 0 &&
      vehicleUnitPrice !== undefined
    ) {
      const currentItemPrice = form.getValues("items.0.unit_price");
      if (currentItemPrice !== vehicleUnitPrice) {
        form.setValue("items.0.unit_price", Number(vehicleUnitPrice) || 0);
      }
    }
  }, [vehicleUnitPrice, isVehiclePurchase, fields.length, form]);

  // Store initial values to compare against
  const initialValues = useRef(defaultValues);

  // Track if form has actual changes by comparing current values with initial values
  const hasChanges = useMemo(() => {
    if (mode !== "resend") return true;

    const currentValues = form.getValues();
    const initial = initialValues.current;

    // Compare each field
    return Object.keys(currentValues).some((key) => {
      const currentVal = currentValues[key as keyof typeof currentValues];
      const initialVal = initial[key as keyof typeof initial];

      // Handle null/undefined comparisons
      if (currentVal === initialVal) return false;
      if (currentVal == null && initialVal == null) return false;

      // Convert to string for comparison to handle numeric strings
      return String(currentVal) !== String(initialVal);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, form.watch()]);

  // Obtener lista de campos que cambiaron
  const changedFields = useMemo(() => {
    if (mode !== "resend") return [];

    const currentValues = form.getValues();
    const initial = initialValues.current;
    const changes: Array<{
      field: string;
      label: string;
      oldValue: any;
      newValue: any;
    }> = [];

    // Mapeo de nombres de campos a etiquetas legibles
    const fieldLabels: Record<string, string> = {
      vin: "VIN",
      year: "Año",
      engine_number: "Número de Motor",
      vehicle_unit_price: "Precio Unitario Vehículo",
      invoice_series: "Serie Factura",
      invoice_number: "Número Factura",
      subtotal: "Subtotal",
      igv: "IGV",
      total: "Total",
      isc: "ISC",
      emission_date: "Fecha Emisión",
      due_date: "Fecha Vencimiento",
    };

    Object.keys(currentValues).forEach((key) => {
      const currentVal = currentValues[key as keyof typeof currentValues];
      const initialVal = initial[key as keyof typeof initial];

      // Skip arrays and objects for now (items, dates need special handling)
      if (
        key === "items" ||
        typeof currentVal === "object" ||
        typeof initialVal === "object"
      )
        return;

      // Handle null/undefined comparisons
      if (currentVal === initialVal) return;
      if (currentVal == null && initialVal == null) return;

      // Convert to string for comparison
      if (String(currentVal) !== String(initialVal)) {
        changes.push({
          field: key,
          label: fieldLabels[key] || key,
          oldValue: initialVal,
          newValue: currentVal,
        });
      }
    });

    return changes;
  }, [mode, form.watch()]);

  const {
    data: brands = [],
    isLoading: isLoadingBrands,
    isFetching: isFetchingBrands,
  } = useAllBrandsBySede(
    form.watch("sede_id") ? Number(form.watch("sede_id")) : undefined,
  );

  // Vehicle hooks
  const {
    data: modelsVn = [],
    isLoading: isLoadingModelsVn,
    isFetching: isFetchingModelsVn,
  } = useAllModelsVn({
    family$brand_id: form.watch("ap_brand_id"),
  });

  const { data: colors = [], isLoading: isLoadingColors } =
    useAllVehicleColor();
  const { data: engineTypes = [], isLoading: isLoadingEngineTypes } =
    useAllEngineTypes();
  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const {
    data: supplierOrderTypes = [],
    isLoading: isLoadingSupplierOrderTypes,
  } = useAllSupplierOrderType();

  // Invoice hooks
  const { data: currencies = [], isLoading: isLoadingCurrencies } =
    useAllCurrencyTypes();

  // Warehouse hooks
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useWarehouseByModelSede({
      model_vn_id: form.watch("ap_models_vn_id"),
      sede_id: form.watch("sede_id"),
    });

  // Unit measurement hook
  const { data: unitMeasurements = [], isLoading: isLoadingUnitMeasurements } =
    useAllUnitMeasurement();

  // Quotation hooks
  const {
    data: selectedQuotation,
    isLoading: isLoadingQuotation,
    isFetching: isFetchingQuotation,
  } = usePurchaseRequestQuoteById(selectedQuotationId || 0);

  // Watch valores ingresados por el usuario (no calculados)
  const subtotalInput = form.watch("subtotal") || 0;
  const igvInput = form.watch("igv") || 0;
  const iscInput = form.watch("isc") || 0;
  const totalInput = form.watch("total") || 0;
  const emissionDate = form.watch("emission_date");
  const quotationWatch = form.watch("quotation_id");

  // Watch all items to trigger recalculation on any change
  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });

  // Calcular la suma de todos los items (precio unitario × cantidad)
  const itemsTotal = useMemo(() => {
    if (!watchedItems || watchedItems.length === 0) return 0;
    return watchedItems.reduce((sum, item) => {
      const itemPrice = Number(item?.unit_price) || 0;
      const itemQty = Number(item?.quantity) || 0;
      return sum + itemPrice * itemQty;
    }, 0);
  }, [watchedItems]);

  // Generar descripción automática del vehículo
  const vin = form.watch("vin");
  const sedeId = form.watch("sede_id");
  const brandId = form.watch("ap_brand_id");
  const modelId = form.watch("ap_models_vn_id");
  const selectedSede = useMemo(() => {
    return sedes.find((s) => s.id.toString() === sedeId);
  }, [sedes, sedeId]);
  const selectedBrand = useMemo(() => {
    return brands.find((b) => b.id.toString() === brandId);
  }, [brands, brandId]);
  const selectedModel = useMemo(() => {
    return modelsVn.find((m) => m.id.toString() === modelId);
  }, [modelsVn, modelId]);

  // Actualizar descripción del primer item automáticamente
  useEffect(() => {
    if (isVehiclePurchase && fields.length > 0 && vin && selectedModel) {
      const vehicleDescription = `${vin} - ${selectedModel.code} ${selectedModel.version}`;
      form.setValue("items.0.description", vehicleDescription);
    }
  }, [vin, selectedModel, isVehiclePurchase, fields.length, form]);

  useEffect(() => {
    if (emissionDate) {
      form.setValue(
        "due_date",
        new Date(emissionDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      );
    }
  }, [emissionDate]);

  // Detectar si hay ISC basado en si el usuario ingresó un valor mayor a 0
  useEffect(() => {
    setHasIsc(Number(iscInput) > 0);
  }, [iscInput]);

  // Effect para sincronizar la cotización seleccionada
  useEffect(() => {
    if (quotationWatch) {
      setSelectedQuotationId(Number(quotationWatch));
    } else {
      setSelectedQuotationId(undefined);
    }
  }, [quotationWatch]);

  // Paso 1: Auto-completar SOLO la sede cuando se selecciona una cotización
  useEffect(() => {
    if (selectedQuotation && selectedQuotation.sede_id) {
      const currentSedeId = form.getValues("sede_id");
      if (currentSedeId !== selectedQuotation.sede_id.toString()) {
        form.setValue("sede_id", selectedQuotation.sede_id.toString());
      }
    }
  }, [selectedQuotation, form]);

  // Paso 2: Auto-completar la marca cuando las marcas se hayan cargado
  useEffect(() => {
    if (selectedQuotation && selectedQuotation.brand_id && brands.length > 0) {
      const currentBrandId = form.getValues("ap_brand_id");
      if (currentBrandId !== selectedQuotation.brand_id.toString()) {
        form.setValue("ap_brand_id", selectedQuotation.brand_id.toString());
      }
    }
  }, [selectedQuotation, brands, form]);

  // Paso 3: Auto-completar el modelo cuando los modelos se hayan cargado
  useEffect(() => {
    if (
      selectedQuotation &&
      selectedQuotation.ap_models_vn_id &&
      modelsVn.length > 0
    ) {
      const currentModelId = form.getValues("ap_models_vn_id");
      if (currentModelId !== selectedQuotation.ap_models_vn_id.toString()) {
        // Verificar que el modelo esté en la lista de modelos cargados
        const modelExists = modelsVn.some(
          (model) =>
            model.id.toString() ===
            selectedQuotation.ap_models_vn_id?.toString(),
        );
        if (modelExists) {
          form.setValue(
            "ap_models_vn_id",
            selectedQuotation.ap_models_vn_id.toString(),
          );
        }
      }
    }
  }, [selectedQuotation, modelsVn, form]);

  // El subtotal SIEMPRE se calcula como: Total / 1.18 (redondeado a 2 decimales)
  // La validación es diferente según haya ISC o no:
  // - Sin ISC: suma_items debe ser igual al subtotal
  // - Con ISC: suma_items + ISC debe ser igual al subtotal
  const calculatedSubtotal = useMemo(() => {
    if (Number(totalInput) > 0) {
      return Number((Number(totalInput) / 1.18).toFixed(2));
    }
    return 0;
  }, [totalInput]);

  // Actualizar el subtotal automáticamente cuando cambia el total
  useEffect(() => {
    if (Number(totalInput) > 0) {
      form.setValue("subtotal", calculatedSubtotal);
    }
  }, [calculatedSubtotal, totalInput, form]);

  // Calcular el IGV automáticamente como: Total - Subtotal
  const calculatedIgv = useMemo(() => {
    if (Number(totalInput) > 0 && calculatedSubtotal > 0) {
      return Number((Number(totalInput) - calculatedSubtotal).toFixed(2));
    }
    return 0;
  }, [totalInput, calculatedSubtotal]);

  // Actualizar el IGV automáticamente
  useEffect(() => {
    if (Number(totalInput) > 0 && calculatedSubtotal > 0) {
      form.setValue("igv", calculatedIgv);
    }
  }, [calculatedIgv, totalInput, calculatedSubtotal, form]);

  // Calcular la diferencia entre la suma de items y el subtotal calculado
  // - Sin ISC: validar que suma_items = subtotal
  // - Con ISC: validar que suma_items + ISC = subtotal
  const subtotalDifference = useMemo(() => {
    let expectedValue = itemsTotal;

    // Si hay ISC, sumamos el ISC a los items
    if (hasIsc && Number(iscInput) > 0) {
      expectedValue = itemsTotal + Number(iscInput);
    }

    // Calculamos la diferencia absoluta
    const diff = Math.abs(expectedValue - calculatedSubtotal);
    return Number(diff.toFixed(2));
  }, [itemsTotal, calculatedSubtotal, hasIsc, iscInput]);

  // Determinar el color de la alerta según la diferencia
  const getDifferenceAlertColor = (diff: number) => {
    if (diff === 0) return "green";
    if (diff > 0 && diff <= 1) return "yellow";
    return "red";
  };

  // Obtener mensaje de diferencia
  const getDifferenceMessage = (diff: number) => {
    const validationBase =
      hasIsc && Number(iscInput) > 0
        ? "la suma de items + ISC"
        : "la suma de items";

    if (diff === 0)
      return `El subtotal coincide perfectamente con ${validationBase}`;
    if (diff > 0 && diff <= 1)
      return `Diferencia aceptable de ${diff.toFixed(2)}`;
    return `Diferencia excesiva de ${diff.toFixed(2)}`;
  };

  // Sync items.0.unit_price → vehicle_unit_price para órdenes de consignación
  useEffect(() => {
    if (isConsignmentOrder && watchedItems && watchedItems[0] !== undefined) {
      const tablePrice = Number(watchedItems[0]?.unit_price) || 0;
      const currentVehiclePrice = form.getValues("vehicle_unit_price");
      if (currentVehiclePrice !== tablePrice) {
        form.setValue("vehicle_unit_price", tablePrice);
      }
    }
  }, [isConsignmentOrder, watchedItems, form]);

  // Usar hook personalizado que memoriza las columnas automáticamente
  const columns = usePurchaseOrderItemsColumns({
    control: form.control,
    watch: form.watch,
    setValue: form.setValue,
    onRemove: remove,
    isVehiclePurchase,
    isConsignmentOrder,
    unitMeasurements,
  });

  // Solo mostrar skeleton en carga inicial, no durante búsquedas (fetching)
  const isInitialLoading =
    isLoadingCurrencies ||
    isLoadingUnitMeasurements ||
    (isLoadingBrands && !isFetchingBrands) ||
    (isVehiclePurchase &&
      ((isLoadingModelsVn && !isFetchingModelsVn) ||
        isLoadingColors ||
        isLoadingEngineTypes ||
        isLoadingSupplierOrderTypes ||
        isLoadingSedes));

  if (isInitialLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full py-2"
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sección 1: Información del Vehículo - Solo si isVehiclePurchase es true */}
          {isVehiclePurchase && (
            <GroupFormSection
              title="Información del Vehículo"
              icon={Car}
              className="xl:col-span-3"
              cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
              gap="gap-3"
            >
              <div className="sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
                <FormSelectAsync
                  name="quotation_id"
                  label="Cotización (Opcional)"
                  placeholder="Selecciona una cotización aprobada"
                  control={form.control}
                  useQueryHook={usePurchaseRequestQuote}
                  mapOptionFn={(quotation: PurchaseRequestQuoteResource) => ({
                    value: quotation.id.toString(),
                    label: `${quotation.correlative} - ${quotation.holder}`,
                    description: quotation.ap_model_vn || "Sin modelo",
                  })}
                  additionalParams={{
                    is_approved: 1,
                  }}
                  perPage={10}
                  debounceMs={500}
                  allowClear={true}
                />
              </div>

              <FormSelect
                name="sede_id"
                label="Sede"
                placeholder="Selecciona una sede"
                options={sedes.map((item) => ({
                  label: item.abreviatura,
                  value: item.id.toString(),
                }))}
                control={form.control}
                disabled={
                  !!selectedQuotation ||
                  isLoadingQuotation ||
                  isFetchingQuotation
                }
              />

              <FormSelect
                name="ap_brand_id"
                label="Marca"
                placeholder="Selecciona una marca"
                disabled={
                  isLoadingBrands ||
                  !selectedSede ||
                  !!selectedQuotation ||
                  isLoadingQuotation ||
                  isFetchingQuotation
                }
                options={brands.map((item) => ({
                  label: item.name,
                  value: item.id.toString(),
                }))}
                control={form.control}
              />

              <div className="sm:col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2">
                <FormSelect
                  name="ap_models_vn_id"
                  label="Modelo VN"
                  placeholder="Selecciona un modelo"
                  options={modelsVn.map((item) => ({
                    label: item.version,
                    value: item.id.toString(),
                    description: item.code,
                  }))}
                  control={form.control}
                  disabled={
                    isLoadingModelsVn ||
                    !selectedBrand ||
                    !!selectedQuotation ||
                    isLoadingQuotation ||
                    isFetchingQuotation
                  }
                />
              </div>

              <FormInput
                control={form.control}
                name="vin"
                uppercase={true}
                label="VIN"
                maxLength={17}
                placeholder="Ej: 1HGBH41AX1N109186"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  form.setValue("vin", value);
                }}
              />

              <FormInput
                control={form.control}
                name="year"
                label="Año Vehículo"
                maxLength={4}
                placeholder="Ej: 2024"
                type="number"
              />

              <FormSelect
                name="vehicle_color_id"
                label="Color"
                placeholder="Selecciona un color"
                options={colors.map((item) => ({
                  label: item.description,
                  value: item.id.toString(),
                  description: item.code,
                }))}
                control={form.control}
              >
                <Button
                  type="button"
                  variant="outline"
                  size={isMobile ? "icon-sm" : "icon-lg"}
                  className="aspect-square"
                  onClick={() => setIsColorModalOpen(true)}
                  title="Agregar nuevo color"
                >
                  <Plus className="size-2 md:size-4" />
                </Button>
              </FormSelect>

              <FormSelect
                name="supplier_order_type_id"
                label="Tipo de Pedido"
                placeholder="Selecciona un tipo"
                options={supplierOrderTypes.map((item) => ({
                  label: item.code + " - " + item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
              />
              <FormSelect
                name="engine_type_id"
                label="Tipo de Motor"
                placeholder="Selecciona un tipo"
                options={engineTypes.map((item) => ({
                  label: item.code + " - " + item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
              />

              <FormInput
                control={form.control}
                name="engine_number"
                label="Núm. Motor"
                uppercase={true}
                maxLength={25}
                placeholder="Ej: ENG32345XYZ"
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  form.setValue("engine_number", value);
                }}
              />

              {!isConsignmentOrder && (
                <FormInput
                  control={form.control}
                  name="vehicle_unit_price"
                  label="Precio Unitario Vehículo (Sin IGV)"
                  placeholder="Ej: 25000.00"
                  min={0}
                  step="0.01"
                  type="number"
                  onChange={(e) => {
                    const value = e.target.value;
                    form.setValue("vehicle_unit_price", Number(value));
                    if (fields.length > 0) {
                      form.setValue("items.0.unit_price", Number(value) || 0);
                    }
                  }}
                />
              )}

              {selectedQuotation && (
                <div className="col-span-full mt-2">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      Información de la Cotización Seleccionada
                    </p>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground text-xs">
                          Correlativo
                        </span>
                        <p className="text-gray-900">
                          {selectedQuotation.correlative}
                        </p>
                      </div>
                      {selectedQuotation.ap_model_vn && (
                        <div>
                          <span className="font-medium text-muted-foreground text-xs">
                            Modelo
                          </span>
                          <p className="text-gray-900">
                            {selectedQuotation.ap_model_vn}
                          </p>
                        </div>
                      )}
                      {selectedQuotation.vehicle_color && (
                        <div>
                          <span className="font-medium text-muted-foreground text-xs">
                            Color
                          </span>
                          <p className="text-gray-900">
                            {selectedQuotation.vehicle_color}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-muted-foreground text-xs">
                          Precio de Venta
                        </span>
                        <p className="text-gray-900">
                          {selectedQuotation.doc_type_currency_symbol}{" "}
                          {Number(
                            selectedQuotation.doc_sale_price,
                          ).toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </GroupFormSection>
          )}

          {/* Sección 4: Items de la Orden de Compra */}
          <GroupFormSection
            title="Items de la Orden de Compra"
            icon={Package}
            className="w-full col-span-full"
            cols={{ sm: 1 }}
            gap="gap-3"
          >
            <div className="w-full space-y-4 col-span-full">
              {/* DataTable de Items */}
              <DataTable
                columns={columns}
                data={fields}
                isVisibleColumnFilter={false}
                variant={"ghost"}
              />

              {/* Botón para actualizar items */}
              <Button
                type="button"
                onClick={() =>
                  append({
                    unit_measurement_id: UNIT_MEASUREMENT_ID.UNIDAD.toString(),
                    description: "",
                    unit_price: 0,
                    quantity: 1,
                    is_vehicle: false,
                  })
                }
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Item Adicional
              </Button>
            </div>
          </GroupFormSection>

          {/* Sección 2: Información de la Factura */}
          <GroupFormSection
            title="Información de la Factura"
            icon={FileText}
            className="xl:col-span-2"
            cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            gap="gap-3"
          >
            <FormSelectAsync
              name="supplier_id"
              label="Proveedor"
              placeholder="Selecciona un proveedor"
              useQueryHook={useSuppliers}
              mapOptionFn={(item) => ({
                label: item.full_name,
                value: item.id.toString(),
              })}
              control={form.control}
              preloadId={defaultValues.supplier_id || undefined}
            />

            <FormInput
              control={form.control}
              name="invoice_series"
              label="Serie Factura"
              placeholder="Ej: F001"
              maxLength={4}
              type="text"
              uppercase={true}
            />

            <FormInput
              control={form.control}
              name="invoice_number"
              label="Número Factura"
              placeholder="Ej: 00001234"
              type="text"
            />

            <DatePickerFormField
              control={form.control}
              name="emission_date"
              label="Fecha de Emisión"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              disabledRange={{
                after: new Date(),
              }}
            />

            <DatePickerFormField
              control={form.control}
              name="due_date"
              label="Fecha de Vencimiento"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
            />

            <FormSelect
              name="currency_id"
              label="Moneda"
              placeholder="Selecciona una moneda"
              options={currencies.map((item) => ({
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

            {
              <FormSelect
                name="warehouse_id"
                label="Almacén"
                placeholder="Selecciona un almacén"
                options={warehouses.map((item) => ({
                  label: item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
                disabled={isLoadingWarehouses || warehouses.length === 0}
              />
            }

            <FormInput
              control={form.control}
              name="subtotal"
              label="Subtotal"
              type="number"
              className="bg-muted"
              placeholder="Ej: 25000.00"
              step="0.01"
              min={0}
              disabled
            />

            {/* Alerta de validación de diferencia */}
            {calculatedSubtotal > 0 && (
              <div className="col-span-full">
                <div
                  className={`flex items-start gap-2 p-3 rounded-md border ${
                    getDifferenceAlertColor(subtotalDifference) === "green"
                      ? "bg-green-50 border-green-200"
                      : getDifferenceAlertColor(subtotalDifference) === "yellow"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex-1">
                    <p
                      className={`text-xs font-medium ${
                        getDifferenceAlertColor(subtotalDifference) === "green"
                          ? "text-green-900"
                          : getDifferenceAlertColor(subtotalDifference) ===
                              "yellow"
                            ? "text-yellow-900"
                            : "text-red-900"
                      }`}
                    >
                      Validación de Subtotal
                    </p>
                    <p
                      className={`text-xs ${
                        getDifferenceAlertColor(subtotalDifference) === "green"
                          ? "text-green-700"
                          : getDifferenceAlertColor(subtotalDifference) ===
                              "yellow"
                            ? "text-yellow-700"
                            : "text-red-700"
                      }`}
                    >
                      {getDifferenceMessage(subtotalDifference)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Suma de items: {itemsTotal.toFixed(2)}
                      {hasIsc && Number(iscInput) > 0 && (
                        <span>
                          {" "}
                          + ISC: {Number(iscInput).toFixed(2)} ={" "}
                          {(itemsTotal + Number(iscInput)).toFixed(2)}
                        </span>
                      )}
                      {" | "}Subtotal calculado: {calculatedSubtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <FormInput
              control={form.control}
              name="igv"
              label="IGV"
              type="number"
              className="bg-muted"
              placeholder="Ej: 4500.00"
              step="0.01"
              min={0}
              disabled
            />

            <FormInput
              control={form.control}
              name="isc"
              label="ISC (Opcional)"
              type="number"
              placeholder="Ej: 150.00"
              step="0.01"
              min={0}
            >
              {hasIsc && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠ Con ISC: La validación verifica que (suma items + ISC) =
                  subtotal
                </p>
              )}
              {!hasIsc && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Sin ISC: La validación verifica que suma items = subtotal
                </p>
              )}
            </FormInput>

            <FormInput
              control={form.control}
              name="total"
              label="Total (Requerido)"
              type="number"
              placeholder="Ej: 29500.00"
              step="0.01" 
              min={0}
            />
          </GroupFormSection>

          {/* Sección 3: Resumen de Factura */}
          <GroupFormSection
            title="Resumen de Factura"
            icon={Calculator}
            className="xl:col-span-1"
            cols={{ sm: 1, md: 1 }}
            gap="gap-3"
          >
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded-md mb-3">
                Los valores que ingreses en los campos de la factura se
                mostrarán aquí.
              </div>

              {Number(subtotalInput) > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    Subtotal:
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(Number(subtotalInput))}
                  </span>
                </div>
              )}

              {Number(igvInput) > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">IGV:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(Number(igvInput))}
                  </span>
                </div>
              )}

              {Number(iscInput) > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">ISC:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(Number(iscInput))}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 bg-primary/5 px-3 rounded-md">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-primary">
                  {new Intl.NumberFormat("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Number(totalInput))}
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                * Valores de la factura física
              </p>
            </div>
          </GroupFormSection>
        </div>

        {/* Mostrar cambios realizados en modo reenvío */}
        {mode === "resend" && changedFields.length > 0 && (
          <GroupFormSection
            title={`Cambios a Actualizar (${changedFields.length})`}
            icon={FileEdit}
            className="mt-6"
            cols={{ sm: 1 }}
            gap="gap-3"
          >
            <div className="space-y-2 col-span-full">
              {changedFields.map((change, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-xs bg-blue-50 p-3 rounded border border-blue-100"
                >
                  <span className="font-medium text-blue-800 min-w-[150px]">
                    {change.label}:
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-gray-500 line-through">
                      {String(change.oldValue || "-")}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-700 font-medium">
                      {String(change.newValue || "-")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GroupFormSection>
        )}

        <div className="flex flex-col gap-2 w-full items-end">
          {subtotalDifference > 1 && (
            <p className="text-xs text-destructive">
              No se puede guardar: La diferencia entre la suma de items y el
              subtotal excede el límite permitido (1.00)
            </p>
          )}

          <div className="flex gap-4">
            <ConfirmationDialog
              trigger={
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              }
              title="¿Cancelar registro?"
              description="Se perderán todos los datos ingresados en el formulario. ¿Estás seguro de que deseas cancelar?"
              confirmText="Sí, cancelar"
              cancelText="No, continuar"
              variant="destructive"
              icon="warning"
              onConfirm={() => navigate(ABSOLUTE_ROUTE)}
            />

            <ConfirmationDialog
              trigger={
                <Button
                  type="button"
                  disabled={
                    isSubmitting ||
                    !form.formState.isValid ||
                    (mode === "resend" && !hasChanges) ||
                    subtotalDifference > 1
                  }
                >
                  <Loader
                    className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
                  />
                  {isSubmitting
                    ? mode === "resend"
                      ? "Actualizando..."
                      : "Guardando..."
                    : mode === "resend"
                      ? "Reenviar Orden de Compra"
                      : "Guardar Orden de Compra"}
                </Button>
              }
              title={
                mode === "resend"
                  ? "¿Reenviar orden de compra?"
                  : "¿Guardar orden de compra?"
              }
              description={
                mode === "resend"
                  ? "Se actualizarán los datos de la orden de compra en el sistema. ¿Deseas continuar?"
                  : "Se creará una nueva orden de compra con los datos ingresados. ¿Deseas continuar?"
              }
              confirmText={mode === "resend" ? "Sí, reenviar" : "Sí, guardar"}
              cancelText="Cancelar"
              variant="default"
              icon="info"
              onConfirm={() => form.handleSubmit(onSubmit)()}
              confirmDisabled={
                isSubmitting ||
                !form.formState.isValid ||
                (mode === "resend" && !hasChanges) ||
                subtotalDifference > 1
              }
            />
          </div>
        </div>
      </form>

      <VehicleColorModal
        open={isColorModalOpen}
        onClose={async () => {
          setIsColorModalOpen(false);
          await queryClient.invalidateQueries({
            queryKey: [VEHICLE_COLOR.QUERY_KEY],
          });
        }}
        title="Nuevo Color de Vehículo"
        mode="create"
      />
    </Form>
  );
};
