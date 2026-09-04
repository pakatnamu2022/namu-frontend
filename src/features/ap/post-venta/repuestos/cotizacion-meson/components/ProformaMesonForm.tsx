"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  quotationMesonWithProductsSchemaCreate,
  quotationMesonWithProductsSchemaUpdate,
  QuotationMesonWithProductsSchema,
  ProductDetailMesonSchema,
} from "../lib/quotationMeson.schema";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import {
  Plus,
  Package,
  PackagePlus,
  User,
  Car,
  FileText,
  Calendar,
  Gauge,
  ChevronDown,
  ChevronUp,
  Percent,
  ArrowUpDown,
  Check,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useState,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  DEFAULT_APPROVED_DISCOUNT,
  EMPRESA_AP,
  IGV,
  STATUS_ACTIVE,
} from "@/core/core.constants";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { format } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { useExchangeRateByDateAndCurrency } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { getStockByProductIds } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.actions";
import { StockByProductIdsResponse } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface";
import QuotationPartModal from "./QuotationPartModal";
import AddProductDetailSheet from "./AddProductDetailSheet";
import ProductDetailRow from "./ProductDetailRow";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import CustomerModal from "@/features/ap/comercial/clientes/components/CustomerModal";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import {
  useVehicles,
  useVehicleById,
} from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import VehicleRepuestosModal from "@/features/ap/comercial/vehiculos/components/VehicleRepuestosModal";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { AREA_MESON } from "@/features/ap/ap-master/lib/apMaster.constants";
import { useActiveCampaign } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.hook";
import { ActiveCampaignAlert } from "@/features/ap/configuraciones/maestros-general/campanas/components/ActiveCampaignAlert";
import { ITEM_TYPE_PRODUCT } from "../../../taller/cotizacion-detalle/lib/proformaDetails.constants";
import { DiscountRequestOrderQuotationResource } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.interface";
import {
  STATUS_APPROVED,
  TYPE_GLOBAL,
  TYPE_PARTIAL,
} from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.constants";
import {
  ORDER_QUOTATION_MESON,
  STATUS_ORDER_QUOTE,
} from "../../../taller/cotizacion/lib/proforma.constants";
import { DataCard } from "@/components/DataCard";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";

interface ProformaMesonFormProps {
  defaultValues?: Partial<QuotationMesonWithProductsSchema>;
  onSubmit: (data: QuotationMesonWithProductsSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  clientData?: CustomersResource;
  vehicleData?: VehicleResource;
  quotationData?: OrderQuotationResource;
  approvedDiscountRequests?: DiscountRequestOrderQuotationResource[];
}

export default function ProformaMesonForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  clientData,
  vehicleData,
  quotationData,
  approvedDiscountRequests = [],
}: ProformaMesonFormProps) {
  const router = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [stockData, setStockData] = useState<StockByProductIdsResponse | null>(
    null,
  );
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [globalShowStock, setGlobalShowStock] = useState(true);
  const [itemStockVisible, setItemStockVisible] = useState<
    Record<number, boolean>
  >({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [globalDiscountOpen, setGlobalDiscountOpen] = useState(false);
  const [globalDiscountValue, setGlobalDiscountValue] = useState("");
  const [pendingProductId, setPendingProductId] = useState<
    number | undefined
  >();
  const [vehicleDefaultOption, setVehicleDefaultOption] = useState<
    { value: string; label: string } | undefined
  >(
    vehicleData
      ? {
          value: vehicleData.id.toString(),
          label: vehicleData.plate
            ? `${vehicleData.plate} - ${vehicleData.vin || ""}`
            : vehicleData.vin || "-",
        }
      : undefined,
  );
  const { user, general } = useAuthStore();
  const defaultDiscount =
    user?.discount_percentage ?? DEFAULT_APPROVED_DISCOUNT;
  const freightCommissionMultiplier = 1 + (general?.freight_commission ?? 0.05);
  const { ABSOLUTE_ROUTE } = ORDER_QUOTATION_MESON;

  // Determinar si los detalles deben estar deshabilitados
  const isDetailsDisabled =
    mode === "update" &&
    (quotationData?.status.id === STATUS_ORDER_QUOTE.FACTURAR ||
      quotationData?.has_management_discount);

  const form = useForm<QuotationMesonWithProductsSchema>({
    resolver: zodResolver(
      mode === "create"
        ? quotationMesonWithProductsSchemaCreate
        : quotationMesonWithProductsSchemaUpdate,
    ) as any,
    defaultValues: {
      area_id: AREA_MESON.toString(),
      sede_id: "",
      currency_id: CURRENCY_TYPE_IDS.SOLES,
      quotation_date: "",
      expiration_date: "",
      collection_date: "",
      observations: "",
      details: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { fields, append, remove, update, move } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const [isSorting, setIsSorting] = useState(false);

  const quotationDate = form.watch("quotation_date");
  const currencyId = form.watch("currency_id");
  const vehicleId = form.watch("vehicle_id");

  // Usar useWatch para detectar cambios en details en tiempo real
  const watchedDetails = useWatch({
    control: form.control,
    name: "details",
  });

  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const { data: currencyTypes = [] } = useAllCurrencyTypes({
    enable_after_sales: STATUS_ACTIVE,
  });

  const { data: activeCampaign } = useActiveCampaign({
    area_id: AREA_MESON,
  });
  const campaignDiscountValue =
    activeCampaign && activeCampaign.discount_type === "percentage"
      ? Number(activeCampaign.discount_value)
      : undefined;
  const sedeId = form.watch("sede_id");

  const { data: vehicleById } = useVehicleById(Number(vehicleId) || 0);

  useEffect(() => {
    setSelectedVehicle(vehicleById ?? null);
  }, [vehicleById]);

  // Setear primera sede por defecto
  useEffect(() => {
    if (mySedes.length > 0 && !form.getValues("sede_id")) {
      form.setValue("sede_id", mySedes[0].id.toString(), {
        shouldValidate: true,
      });
    }
  }, [mySedes, form]);

  // Setear fecha de apertura por defecto a hoy
  useEffect(() => {
    if (!defaultValues?.quotation_date && !form.getValues("quotation_date")) {
      form.setValue("quotation_date", new Date());
    }
  }, [form, defaultValues]);

  // Actualizar moneda seleccionada
  useEffect(() => {
    if (currencyId && currencyTypes.length > 0) {
      const currency = currencyTypes.find(
        (c) => c.id.toString() === currencyId,
      );
      setSelectedCurrency(currency || null);
    } else {
      setSelectedCurrency(null);
    }
  }, [currencyId, currencyTypes]);

  // Actualizar fecha de vencimiento automáticamente
  useEffect(() => {
    if (quotationDate) {
      const quotationDateObj = new Date(quotationDate);
      if (isNaN(quotationDateObj.getTime())) return;
      const expirationDateObj = new Date(quotationDateObj);
      expirationDateObj.setDate(quotationDateObj.getDate() + 7);
      form.setValue("expiration_date", expirationDateObj);
    } else {
      form.setValue("expiration_date", "");
    }
  }, [quotationDate, form]);

  // Consultar tipo de cambio cuando cambia la fecha de cotización
  const quotationDateFormatted = useMemo(() => {
    if (!quotationDate) return "";
    const dateObj = new Date(quotationDate);
    if (isNaN(dateObj.getTime())) return "";
    return format(dateObj, "yyyy-MM-dd");
  }, [quotationDate]);

  const { data: exchangeRateData, isLoading: isLoadingExchangeRate } =
    useExchangeRateByDateAndCurrency(
      Number(CURRENCY_TYPE_IDS.DOLLARS),
      quotationDateFormatted,
    );
  const exchangeRate = exchangeRateData?.rate
    ? Number(exchangeRateData.rate)
    : null;

  // Consultar stock de productos seleccionados
  // Crear un string con los IDs de productos para detectar cambios
  const productIdsString = useMemo(() => {
    if (!watchedDetails || watchedDetails.length === 0) return "";
    const ids = watchedDetails
      .map((detail: any) => Number(detail?.product_id || 0))
      .filter((id: number) => id > 0)
      .sort((a: number, b: number) => a - b); // Ordenar para que [1,2] sea igual a [2,1]
    return ids.join(",");
  }, [watchedDetails]);

  useEffect(() => {
    const fetchProductsStock = async () => {
      // Si no hay productos seleccionados, limpiar el stock
      if (!productIdsString) {
        setStockData(null);
        return;
      }

      const productIds = productIdsString.split(",").map(Number);

      try {
        const response = await getStockByProductIds(productIds);
        setStockData(response);
      } catch {
        setStockData(null);
      }
    };

    fetchProductsStock();
  }, [productIdsString]);

  const openAddSheet = () => {
    setEditingIndex(null);
    setSheetOpen(true);
  };

  const openEditSheet = (index: number) => {
    setEditingIndex(index);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingIndex(null);
    setPendingProductId(undefined);
  };

  const handleConfirmDetail = (row: ProductDetailMesonSchema) => {
    if (editingIndex === null) {
      append(row);
    } else {
      update(editingIndex, row);
    }
    closeSheet();
  };

  const toggleSortMode = () => {
    setIsSorting((prev) => !prev);
  };

  const sortSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    move(oldIndex, newIndex);
  };

  const applyGlobalDiscount = () => {
    const parsed = Number(globalDiscountValue);
    if (Number.isNaN(parsed) || parsed < 0) return;

    fields.forEach((_, index) => {
      const maxAllowed = resolveApprovedDiscount(index) ?? defaultDiscount;
      const discount = Math.min(parsed, maxAllowed);
      form.setValue(`details.${index}.discount_percentage`, discount, {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
    setGlobalDiscountOpen(false);
  };

  // Resuelve el descuento aprobado (GLOBAL aplica a todos, PARTIAL por detail_id)
  const resolveApprovedDiscount = (index: number) => {
    const originalDetail = quotationData?.details?.filter(
      (d) => d.item_type === ITEM_TYPE_PRODUCT,
    )[index];

    const globalApproved = approvedDiscountRequests.find(
      (r) => r.type === TYPE_GLOBAL && r.status === STATUS_APPROVED,
    );
    const partialApproved = originalDetail
      ? approvedDiscountRequests.find(
          (r) =>
            r.type === TYPE_PARTIAL &&
            r.status === STATUS_APPROVED &&
            r.ap_order_quotation_detail_id === originalDetail.id,
        )
      : undefined;

    return globalApproved
      ? Number(globalApproved.requested_discount_percentage)
      : partialApproved
        ? Number(partialApproved.requested_discount_percentage)
        : undefined;
  };

  const calculateUnitPrice = (index: number) => {
    const detail = form.watch(`details.${index}`);
    const retail = detail?.retail_price_external || 0;
    const commission =
      detail?.freight_commission || freightCommissionMultiplier;

    // Si la moneda seleccionada es USD (id: 1), no aplicar tipo de cambio
    // Si es PEN (id: 3), aplicar el tipo de cambio
    const isUSD = selectedCurrency?.code === "USD";
    const rate = isUSD ? 1 : exchangeRate || 1;

    return Math.round(retail * commission * rate * 100) / 100;
  };

  const calculateTotalAmount = (index: number) => {
    const detail = form.watch(`details.${index}`);
    const quantity = detail?.quantity || 0;
    const unitPrice = detail?.unit_price || 0;
    const discount = detail?.discount_percentage || 0;

    // Aplicar descuento: total = cantidad * precioUnitario * (1 - descuento/100)
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    return Math.round((subtotal - discountAmount) * 100) / 100;
  };

  // Calcular automáticamente el precio unitario cuando cambian los valores
  const watchAllFields = form.watch();
  useEffect(() => {
    fields.forEach((_, index) => {
      const calculatedUnitPrice = calculateUnitPrice(index);
      const currentUnitPrice = form.getValues(`details.${index}.unit_price`);

      if (calculatedUnitPrice !== currentUnitPrice) {
        form.setValue(`details.${index}.unit_price`, calculatedUnitPrice);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchAllFields, exchangeRate, selectedCurrency]);

  const formatCurrency = (amount: number) => {
    const symbol = selectedCurrency?.symbol || "S/.";
    const formattedAmount = new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${symbol} ${formattedAmount}`;
  };

  const getTotalGeneral = () => {
    return fields.reduce((sum, _, index) => {
      return sum + calculateTotalAmount(index);
    }, 0);
  };

  const getIgvTotal = () => {
    return fields.reduce((sum, _, index) => {
      const itemTotal = calculateTotalAmount(index);
      return sum + Math.round(itemTotal * IGV.RATE * 100) / 100;
    }, 0);
  };

  if (isLoadingMySedes) return <FormSkeleton />;

  const handleSubmit = (data: QuotationMesonWithProductsSchema) => {
    onSubmit({
      ...data,
      details: data.details?.map((detail, index) => ({
        ...detail,
        order: index,
      })),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Información de la Cotización */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona una sede"
            options={mySedes.map((item) => ({
              label: item.abreviatura,
              value: item.id.toString(),
            }))}
            control={form.control}
            required
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

          <FormSelectAsync
            placeholder="Seleccionar cliente"
            control={form.control}
            label={"Cliente"}
            name="client_id"
            useQueryHook={useCustomers}
            mapOptionFn={(item: CustomersResource) => ({
              value: item.id.toString(),
              label: `${item.full_name}`,
            })}
            perPage={10}
            debounceMs={500}
            defaultOption={
              clientData
                ? {
                    value: clientData.id.toString(),
                    label: `${clientData.full_name}`,
                  }
                : undefined
            }
          >
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="aspect-square"
              onClick={() => setIsCustomerModalOpen(true)}
              tooltip="Agregar nuevo cliente"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </FormSelectAsync>

          <FormSelectAsync
            placeholder="Seleccionar vehículo"
            control={form.control}
            label={"Vehículo"}
            name="vehicle_id"
            useQueryHook={useVehicles}
            mapOptionFn={(item: VehicleResource) => ({
              value: item.id.toString(),
              label: item.plate
                ? `${item.plate} - ${item.vin || ""}`
                : item.vin || "-",
            })}
            perPage={10}
            debounceMs={500}
            defaultOption={vehicleDefaultOption}
          >
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="aspect-square"
              onClick={() => setIsVehicleModalOpen(true)}
              tooltip="Agregar nuevo vehículo"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </FormSelectAsync>

          <DatePickerFormField
            control={form.control}
            name="quotation_date"
            label="Fecha de Apertura"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabled
          />

          <DatePickerFormField
            control={form.control}
            name="expiration_date"
            label="Fecha de Vencimiento"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabled={true}
          />

          <DatePickerFormField
            control={form.control}
            name="collection_date"
            label="Fecha Estimada de Recojo"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={
              form.watch("quotation_date")
                ? { before: new Date(form.watch("quotation_date")) }
                : undefined
            }
          />
        </div>

        <FormTextArea
          name="observations"
          label="Observaciones"
          placeholder="Notas adicionales sobre la cotización..."
          control={form.control}
          rows={3}
        />

        {/* Información del Vehículo Seleccionado */}
        {selectedVehicle && (
          <DataCard
            title="INFORMACIÓN DEL VEHÍCULO"
            columns={3}
            fields={[
              {
                key: "vin",
                label: "VIN",
                icon: FileText,
                value: selectedVehicle.vin || "N/A",
              },
              {
                key: "brand",
                label: "Marca",
                icon: Car,
                value: selectedVehicle.model?.brand || "N/A",
              },
              {
                key: "model",
                label: "Modelo",
                icon: FileText,
                value: selectedVehicle.model?.version || "N/A",
              },
              {
                key: "year",
                label: "Año",
                icon: Calendar,
                value: selectedVehicle.year || "N/A",
              },
              {
                key: "color",
                label: "Color",
                icon: Car,
                value: selectedVehicle.vehicle_color || "N/A",
              },
              {
                key: "engine_type",
                label: "Motor",
                icon: Gauge,
                value: selectedVehicle.engine_type || "N/A",
              },
              {
                key: "engine_number",
                label: "N° Motor",
                icon: FileText,
                value: selectedVehicle.engine_number || "N/A",
              },
            ]}
            sections={
              selectedVehicle.owner
                ? [
                    {
                      key: "owner",
                      title: "Propietario",
                      icon: User,
                      fields: [
                        {
                          key: "owner_name",
                          label: "Nombre",
                          icon: User,
                          value: selectedVehicle.owner.full_name || "N/A",
                        },
                        {
                          key: "owner_document",
                          label: "Documento",
                          icon: FileText,
                          value: selectedVehicle.owner.num_doc || "N/A",
                        },
                        {
                          key: "owner_phone",
                          label: "Teléfono",
                          icon: User,
                          value: selectedVehicle.owner.phone || "N/A",
                        },
                      ],
                    },
                  ]
                : undefined
            }
          />
        )}

        {/* Sección de Repuestos */}

        <ActiveCampaignAlert areaId={AREA_MESON} className="mb-4" />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Repuestos</h3>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {fields.length > 1 && (
              <Button
                type="button"
                variant={isSorting ? "default" : "outline"}
                size="sm"
                className="w-full sm:w-auto"
                onClick={toggleSortMode}
                disabled={isDetailsDisabled}
              >
                {isSorting ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Listo
                  </>
                ) : (
                  <>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Ordenar
                  </>
                )}
              </Button>
            )}
            {fields.length > 0 && !isSorting && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={`w-full sm:w-auto transition-colors ${globalShowStock ? "border-primary text-primary hover:bg-primary/5" : "text-gray-500 hover:text-primary hover:border-primary"}`}
                onClick={() => {
                  const next = !globalShowStock;
                  setGlobalShowStock(next);
                  const reset: Record<number, boolean> = {};
                  fields.forEach((_, i) => {
                    reset[i] = next;
                  });
                  setItemStockVisible(reset);
                }}
              >
                {globalShowStock ? (
                  <ChevronUp className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                {globalShowStock ? "Contraer almacenes" : "Expandir almacenes"}
              </Button>
            )}
            {fields.length > 0 && !isSorting && (
              <Popover
                open={globalDiscountOpen}
                onOpenChange={(next) => {
                  setGlobalDiscountOpen(next);
                  if (next) setGlobalDiscountValue("");
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={isDetailsDisabled}
                  >
                    <Percent className="h-4 w-4 mr-2" />
                    Dcto. Global
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-72 max-w-none p-4 space-y-3"
                >
                  <div className="space-y-1">
                    <Label htmlFor="global-discount-input">
                      Descuento global (%)
                    </Label>
                    <Input
                      id="global-discount-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ej. 10"
                      value={globalDiscountValue}
                      onChange={(e) => setGlobalDiscountValue(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-500">
                      Se aplicará a todos los repuestos cargados, respetando el
                      máximo permitido de cada uno.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setGlobalDiscountOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={applyGlobalDiscount}
                      disabled={globalDiscountValue === ""}
                    >
                      Aplicar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {!isSorting && (
              <Button
                type="button"
                onClick={() => setIsPartModalOpen(true)}
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isDetailsDisabled}
              >
                <PackagePlus className="h-4 w-4 mr-2" />
                Crear Repuesto
              </Button>
            )}
            {!isSorting && (
              <Button
                type="button"
                onClick={openAddSheet}
                size="sm"
                className="w-full sm:w-auto"
                disabled={!quotationDate || isDetailsDisabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Repuesto
              </Button>
            )}
          </div>
        </div>

        {/* Mensaje de tipo de cambio */}
        {quotationDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-4">
            <p className="text-xs text-primary">
              <span className="font-semibold">Comisión de flete:</span>{" "}
              {freightCommissionMultiplier.toFixed(2)}
            </p>
            {isLoadingExchangeRate ? (
              <p className="text-xs text-primary">
                <span className="font-semibold">Tipo de cambio:</span>{" "}
                Cargando...
              </p>
            ) : exchangeRate ? (
              <p className="text-xs text-primary">
                <span className="font-semibold">Tipo de cambio:</span> S/.{" "}
                {exchangeRate.toFixed(4)}
              </p>
            ) : (
              <p className="text-xs text-red-600">
                <span className="font-semibold">Tipo de cambio:</span> No
                disponible
              </p>
            )}
          </div>
        )}

        {fields.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No hay repuestos agregados</p>
            <p className="text-xs text-gray-500 mt-1">
              Selecciona una fecha de cotización y haz clic en "Agregar
              Repuesto"
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Cabecera de tabla - Solo Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-100 px-4 py-2 rounded-t-lg text-xs font-semibold text-gray-700 border-b">
              {isSorting && <div className="col-span-1" />}
              <div className={isSorting ? "col-span-3" : "col-span-4"}>
                Repuesto
              </div>
              <div className="col-span-1 text-center">Cant.</div>
              <div className="col-span-2 text-center">
                P. Unit. ({selectedCurrency?.symbol || "S/."})
              </div>
              <div className="col-span-1 text-center">Dcto %</div>
              <div className="col-span-2 text-center">
                Total ({selectedCurrency?.symbol || "S/."})
              </div>
              <div className={isSorting ? "col-span-1" : "col-span-2"}>
                {isSorting ? "" : "Acción"}
              </div>
            </div>

            {/* Items */}
            <DndContext
              sensors={sortSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {fields.map((field, index) => {
                    const isStockVisible = isSorting
                      ? false
                      : itemStockVisible[index] !== undefined
                        ? itemStockVisible[index]
                        : globalShowStock;

                    return (
                      <SortableProductDetailRow
                        key={field.id}
                        id={field.id}
                        sortable={isSorting}
                      >
                        {(dragHandleProps) => (
                          <ProductDetailRow
                            index={index}
                            detail={
                              watchedDetails?.[
                                index
                              ] as ProductDetailMesonSchema
                            }
                            selectedCurrency={selectedCurrency}
                            stockData={stockData}
                            showStock={isStockVisible}
                            onToggleStock={() =>
                              setItemStockVisible((prev) => ({
                                ...prev,
                                [index]: !isStockVisible,
                              }))
                            }
                            onEdit={() => openEditSheet(index)}
                            onRemove={() => remove(index)}
                            onChangeSupplyType={(value) =>
                              form.setValue(
                                `details.${index}.supply_type`,
                                value as any,
                                {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                },
                              )
                            }
                            onToggleTraverse={(value) =>
                              form.setValue(
                                `details.${index}.is_traverse`,
                                value,
                                {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                },
                              )
                            }
                            isDetailsDisabled={isDetailsDisabled}
                            sedeId={sedeId}
                            sortable={isSorting}
                            dragHandleProps={dragHandleProps}
                          />
                        )}
                      </SortableProductDetailRow>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

            {/* Total General */}
            <div className="flex justify-end pt-4">
              <div className="text-right space-y-1">
                <div className="flex justify-between gap-8">
                  <p className="text-sm text-gray-600">Subtotal:</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatCurrency(getTotalGeneral())}
                  </p>
                </div>
                <div className="flex justify-between gap-8">
                  <p className="text-sm text-gray-600">IGV (18%):</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatCurrency(getIgvTotal())}
                  </p>
                </div>
                <div className="flex justify-between gap-8 pt-1 border-t">
                  <p className="text-sm font-semibold text-gray-700">
                    Total General:
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(getTotalGeneral() + getIgvTotal())}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <ConfirmationDialog
            trigger={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
            title="¿Cancelar registro?"
            variant="destructive"
            icon="warning"
            onConfirm={() => {
              router(ABSOLUTE_ROUTE!);
            }}
          />

          <Button
            type="submit"
            disabled={
              isSubmitting || !form.formState.isValid || fields.length === 0
            }
          >
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
                ? "Crear Cotización"
                : "Actualizar Cotización"}
          </Button>
        </div>
      </form>

      {/* Modal para crear repuesto */}
      <QuotationPartModal
        open={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSuccess={(productId) => {
          setPendingProductId(productId);
          setIsPartModalOpen(false);
          setSheetOpen(true);
        }}
      />

      {/* Sheet para agregar/editar repuesto */}
      <AddProductDetailSheet
        open={sheetOpen}
        onClose={closeSheet}
        onConfirm={handleConfirmDetail}
        mode={editingIndex === null ? "create" : "edit"}
        initialValue={
          editingIndex !== null
            ? (watchedDetails?.[editingIndex] as ProductDetailMesonSchema)
            : undefined
        }
        exchangeRate={exchangeRate}
        freightCommissionMultiplier={freightCommissionMultiplier}
        selectedCurrency={selectedCurrency}
        campaignDiscountValue={campaignDiscountValue}
        sedeId={sedeId}
        approvedDiscount={
          editingIndex !== null
            ? resolveApprovedDiscount(editingIndex)
            : undefined
        }
        defaultDiscount={defaultDiscount}
        isDetailsDisabled={isDetailsDisabled}
        initialProductId={pendingProductId}
      />

      <CustomerModal
        open={isCustomerModalOpen}
        onClose={(newCustomer) => {
          setIsCustomerModalOpen(false);
          if (newCustomer) {
            form.setValue("client_id", newCustomer.id.toString(), {
              shouldValidate: true,
            });
          }
        }}
        title="Agregar Nuevo Cliente"
      />

      <VehicleRepuestosModal
        open={isVehicleModalOpen}
        onClose={(newVehicle) => {
          setIsVehicleModalOpen(false);
          if (newVehicle) {
            form.setValue("vehicle_id", newVehicle.id.toString(), {
              shouldValidate: true,
            });
            setVehicleDefaultOption({
              value: newVehicle.id.toString(),
              label: newVehicle.plate
                ? `${newVehicle.plate} - ${newVehicle.vin || ""}`
                : newVehicle.vin || "-",
            });
          }
        }}
        title="Agregar Nuevo Vehículo"
        sedeId={form.watch("sede_id")}
        sedeName={
          mySedes.find((s) => s.id.toString() === form.watch("sede_id"))
            ?.abreviatura
        }
      />
    </Form>
  );
}

/** Envuelve un item con soporte de drag-and-drop cuando `sortable` está activo. */
function SortableProductDetailRow({
  id,
  sortable,
  children,
}: {
  id: string;
  sortable: boolean;
  children: (dragHandleProps: HTMLAttributes<HTMLButtonElement>) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "z-10 opacity-80" : ""}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  );
}
