import {
  VehiclePurchaseOrderSchema,
  vehiclePurchaseOrderSchemaCreate,
  vehiclePurchaseOrderSchemaUpdate,
  genericPurchaseOrderSchemaCreate,
  genericPurchaseOrderSchemaUpdate,
} from "../lib/vehiclePurchaseOrder.schema";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { Link } from 'react-router-dom'
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
  Loader,
  Car,
  FileText,
  Calculator,
  Plus,
  Trash2,
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
import { useAllSuppliers } from "../../proveedores/lib/suppliers.hook";
import { useAllUnitMeasurement } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.hook";
import { EMPRESA_AP, TYPE_BUSINESS_PARTNERS } from "@/core/core.constants";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import VehicleColorModal from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/components/VehicleColorModal";
import { useQueryClient } from "@tanstack/react-query";
import { VEHICLE_COLOR } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.constants";
import { useAllBrandsBySede } from "../../../configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.hook";
import { UNIT_MEASUREMENT_ID } from "../../../configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.constants";

interface VehiclePurchaseOrderFormProps {
  defaultValues: Partial<VehiclePurchaseOrderSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update" | "resend";
  isVehiclePurchase?: boolean; // Nuevo parámetro para determinar si es compra de vehículo
}

export const VehiclePurchaseOrderForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  isVehiclePurchase = true, // Por defecto es compra de vehículo
}: VehiclePurchaseOrderFormProps) => {
  const queryClient = useQueryClient();
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [hasIsc, setHasIsc] = useState(false);
  const hasAddedInitialItem = useRef(false);

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? isVehiclePurchase
          ? vehiclePurchaseOrderSchemaCreate
          : genericPurchaseOrderSchemaCreate
        : isVehiclePurchase
        ? vehiclePurchaseOrderSchemaUpdate
        : genericPurchaseOrderSchemaUpdate
    ),
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

  // Si es compra de vehículo y no hay items, agregar el primer item automáticamente
  useEffect(() => {
    if (
      isVehiclePurchase &&
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
        is_vehicle: true,
      });
    }
  }, [isVehiclePurchase, fields.length, append, mode]);

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
    form.watch("sede_id") ? Number(form.watch("sede_id")) : undefined
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
  const { data: suppliers = [], isLoading: isLoadingSuppliers } =
    useAllSuppliers({
      type: [TYPE_BUSINESS_PARTNERS.PROVEEDOR, TYPE_BUSINESS_PARTNERS.AMBOS],
    });
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

  // Watch valores ingresados por el usuario (no calculados)
  const subtotalInput = form.watch("subtotal") || 0;
  const igvInput = form.watch("igv") || 0;
  const iscInput = form.watch("isc") || 0;
  const totalInput = form.watch("total") || 0;
  const emissionDate = form.watch("emission_date");

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
        new Date(emissionDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      );
    }
  }, [emissionDate]);

  // Detectar si hay ISC basado en si el usuario ingresó un valor mayor a 0
  useEffect(() => {
    setHasIsc(Number(iscInput) > 0);
  }, [iscInput]);

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

  // Solo mostrar skeleton en carga inicial, no durante búsquedas (fetching)
  const isInitialLoading =
    isLoadingSuppliers ||
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
        className="space-y-6 w-full formlayout py-2"
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sección 1: Información del Vehículo - Solo si isVehiclePurchase es true */}
          {isVehiclePurchase && (
            <GroupFormSection
              title="Información del Vehículo"
              icon={Car}
              className="xl:col-span-3"
              cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            >
              <FormSelect
                name="sede_id"
                label="Sede"
                placeholder="Selecciona una sede"
                options={sedes.map((item) => ({
                  label: item.abreviatura,
                  value: item.id.toString(),
                }))}
                control={form.control}
              />

              <FormSelect
                name="ap_brand_id"
                label="Marca"
                placeholder="Selecciona una marca"
                disabled={isLoadingBrands || !selectedSede}
                options={brands.map((item) => ({
                  label: item.name,
                  value: item.id.toString(),
                }))}
                control={form.control}
              />

              <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
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
                  disabled={isLoadingModelsVn || !selectedBrand}
                  // isLoadingOptions={isFetchingModelsVn}
                />
              </div>

              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIN</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={17}
                        placeholder="Ej: 1HGBH41AX1N109186"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año Vehículo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Ej: 2024"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                  size="icon-lg"
                  className="aspect-square"
                  onClick={() => setIsColorModalOpen(true)}
                  title="Agregar nuevo color"
                >
                  <Plus className="h-4 w-4" />
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
              <FormField
                control={form.control}
                name="engine_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Núm. Motor</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={25}
                        placeholder="Ej: ENG32345XYZ"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle_unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Unitario Vehículo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Ej: 25000.00"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Actualizar el precio del primer item automáticamente
                          if (fields.length > 0) {
                            form.setValue(
                              "items.0.unit_price",
                              Number(e.target.value)
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GroupFormSection>
          )}

          {/* Sección 4: Items de la Orden de Compra */}
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
                      <TableHead className="min-w-[180px]">
                        Unidad de Medida
                      </TableHead>
                      <TableHead className="min-w-[250px]">
                        Descripción
                      </TableHead>
                      <TableHead className="w-[140px]">
                        Precio Unitario
                      </TableHead>
                      <TableHead className="w-[80px]">Cantidad</TableHead>
                      <TableHead className="w-[140px] text-end">
                        Subtotal
                      </TableHead>
                      <TableHead className="w-[80px] text-center">
                        Acción
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const itemPrice =
                        form.watch(`items.${index}.unit_price`) || 0;
                      const itemQty =
                        form.watch(`items.${index}.quantity`) || 0;
                      const itemSubtotal = Number(itemPrice) * Number(itemQty);

                      return (
                        <TableRow key={field.id}>
                          <TableCell className="align-middle p-1.5 h-full">
                            <div className="flex items-center justify-center gap-1 h-full">
                              {isVehiclePurchase && index === 0 ? (
                                <Car className="h-4 w-4 text-primary" />
                              ) : (
                                <span className="text-sm font-medium">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            <FormSelect
                              name={`items.${index}.unit_measurement_id`}
                              placeholder="Selecciona"
                              className={
                                isVehiclePurchase && index === 0
                                  ? "bg-muted"
                                  : ""
                              }
                              disabled={isVehiclePurchase && index === 0}
                              options={unitMeasurements.map((item) => ({
                                label: item.dyn_code + " - " + item.description,
                                value: item.id.toString(),
                              }))}
                              control={form.control}
                            />
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      min={0}
                                      placeholder="Descripción del item"
                                      {...field}
                                      disabled={
                                        isVehiclePurchase && index === 0
                                      }
                                      className={
                                        isVehiclePurchase && index === 0
                                          ? "bg-muted"
                                          : ""
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            {isVehiclePurchase && index === 0 ? (
                              <div className="text-sm font-medium pt-2 px-3 py-2 bg-muted rounded-md">
                                {new Intl.NumberFormat("es-PE", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(Number(itemPrice) || 0)}
                              </div>
                            ) : (
                              <FormField
                                control={form.control}
                                name={`items.${index}.unit_price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        min={0}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </TableCell>
                          <TableCell className="align-middle p-1.5">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      min={0}
                                      type="number"
                                      placeholder="1"
                                      {...field}
                                      disabled={
                                        isVehiclePurchase && index === 0
                                      }
                                      className={
                                        isVehiclePurchase && index === 0
                                          ? "bg-muted"
                                          : ""
                                      }
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
                              }).format(itemSubtotal)}
                            </div>
                          </TableCell>
                          <TableCell className="align-middle text-center p-1.5">
                            {!(isVehiclePurchase && index === 0) ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                            )}
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
            cols={{ sm: 1, md: 2 }}
          >
            <FormSelect
              name="supplier_id"
              label="Proveedor"
              placeholder="Selecciona un proveedor"
              options={suppliers.map((item) => ({
                label: item.full_name,
                value: item.id.toString(),
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
                    <Input placeholder="Ej: 00001234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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

            <FormField
              control={form.control}
              name="subtotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtotal (Calculado: Total / 1.18)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Ej: 25000.00"
                      {...field}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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

            <FormField
              control={form.control}
              name="igv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IGV (Calculado: Total - Subtotal)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Ej: 4500.00"
                      {...field}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total (Requerido)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Ej: 29500.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISC (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Ej: 0.00"
                      {...field}
                    />
                  </FormControl>
                  {hasIsc && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠ Con ISC: La validación verifica que (suma items + ISC) =
                      subtotal
                    </p>
                  )}
                  {!hasIsc && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Sin ISC: La validación verifica que suma items =
                      subtotal
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </GroupFormSection>

          {/* Sección 3: Resumen de Factura */}
          <GroupFormSection
            title="Resumen de Factura"
            icon={Calculator}
            className="xl:col-span-1"
            cols={{ sm: 1, md: 1 }}
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
            <Link to={mode === "create" ? "./" : "../"}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>

            <Button
              type="submit"
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
