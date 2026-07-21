"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Package,
  Loader2,
  PackagePlus,
  Pencil,
  Percent,
  CheckCircle,
  XCircle,
  Undo2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { DEFAULT_APPROVED_DISCOUNT } from "@/core/core.constants";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import {
  ITEM_TYPE_PRODUCT,
  onSelectSupplyType,
  ORDER_QUOTATION_DETAILS,
} from "../lib/proformaDetails.constants";
import {
  storeOrderQuotationDetails,
  updateOrderQuotationDetails,
} from "../lib/proformaDetails.actions";
import { OrderQuotationDetailsResource } from "../lib/proformaDetails.interface";
import {
  productDetailSchema,
  ProductDetailSchema,
} from "../lib/proformaDetails.schema";
import {
  useProduct,
  useProductById,
} from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { api } from "@/core/api";
import { format } from "date-fns";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { FormInput } from "@/shared/components/FormInput";
import { CopyCell } from "@/shared/components/CopyCell";
import { QuotationItemsTable } from "./QuotationItemsTable";
import QuotationPartModal from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/QuotationPartModal";
import { FormSelect } from "@/shared/components/FormSelect";
import { DiscountRequestOrderQuotationResource } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.interface";
import { DiscountRequestModal } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/components/DiscountRequestModal";
import {
  approveDiscountRequestOrderQuotation,
  rejectDiscountRequestOrderQuotation,
  revertDiscountRequestOrderQuotation,
} from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.actions";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import {
  TYPE_GLOBAL,
  TYPE_PARTIAL,
  DISCOUNT_REQUEST_MESON,
  STATUS_APPROVED,
  STATUS_PENDING,
  STATUS_REJECTED,
} from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockByProductIds } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.actions";
import {
  StockByProductIdsResponse,
  InventoryResource,
} from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface";
import { useInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook";
import { StockWarehousesCard } from "@/features/ap/post-venta/gestion-almacen/inventario/components/StockWarehousesCard";
import { useActiveCampaign } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.hook";
import { AREA_TALLER } from "@/features/ap/ap-master/lib/apMaster.constants";

const SUPPLY_TYPE_STOCK = "STOCK";

interface ProductDetailsSectionProps {
  quotationId: number;
  quotationDate: string;
  details: OrderQuotationDetailsResource[];
  isLoadingDetails: boolean;
  onRefresh: () => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  currencySymbol: string;
  currencyId: number;
  discountRequests: DiscountRequestOrderQuotationResource[];
  warehouseId?: number;
  brandId?: number;
  permissions: {
    canEditDiscount: boolean;
    canApprove: boolean;
    canReject: boolean;
    canRequest: boolean;
    canRemoveSparePartQuote: boolean;
    canRemoveSparePartLabor: boolean;
    canCreateSpare: boolean;
    canReverseDiscount?: boolean;
  };
}

export default function ProductDetailsSection({
  quotationId,
  quotationDate,
  details,
  isLoadingDetails,
  onRefresh,
  onDelete,
  currencySymbol,
  currencyId,
  discountRequests,
  warehouseId,
  permissions,
}: ProductDetailsSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"DEALER_PORTAL" | "AP">("DEALER_PORTAL");
  const queryClient = useQueryClient();
  const { user, general } = useAuthStore();
  const freightCommissionMultiplier = 1 + (general?.freight_commission ?? 0.05);
  const isInDollars = currencyId === Number(CURRENCY_TYPE_IDS.DOLLARS);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);

  const { data: activeCampaign } = useActiveCampaign({ area_id: AREA_TALLER });
  const campaignDiscountValue =
    activeCampaign && activeCampaign.discount_type === "percentage"
      ? Number(activeCampaign.discount_value)
      : undefined;
  const [apHasStock, setApHasStock] = useState(false);

  // AP mode
  const maxDiscountPercentage =
    user?.discount_percentage ?? DEFAULT_APPROVED_DISCOUNT;
  const [apMinSalePrice, setApMinSalePrice] = useState(0);
  const [apSalePriceSoles, setApSalePriceSoles] = useState(0);
  const [isApSaving, setIsApSaving] = useState(false);

  const apForm = useForm({
    defaultValues: {
      ap_product_id: "",
      ap_quantity: 1,
      ap_unit_price: 0,
      ap_discount: 0,
      ap_description: "",
      ap_supply_type: "",
    },
  });

  const apUnitPrice = apForm.watch("ap_unit_price");
  const apProductId = apForm.watch("ap_product_id");
  const apSupplyType = apForm.watch("ap_supply_type");
  const apIsPriceBelowMin = apMinSalePrice > 0 && apUnitPrice < apMinSalePrice;

  const handleApInventoryChange = (
    _value: string,
    item?: InventoryResource,
  ) => {
    if (item) {
      const priceSoles = parseFloat(item.sale_price);
      const price =
        isInDollars && exchangeRate
          ? Math.round((priceSoles / exchangeRate) * 100) / 100
          : priceSoles;
      setApMinSalePrice(price);
      setApSalePriceSoles(priceSoles);
      apForm.setValue("ap_unit_price", price);
      apForm.setValue("ap_description", item.product?.name || "");
      setApHasStock(item.available_quantity > 0);
    } else {
      setApMinSalePrice(0);
      setApSalePriceSoles(0);
      apForm.setValue("ap_unit_price", 0);
      apForm.setValue("ap_description", "");
      setApHasStock(false);
    }
  };

  const isApCampaignDiscountLocked =
    apHasStock &&
    apSupplyType === SUPPLY_TYPE_STOCK &&
    campaignDiscountValue !== undefined;

  // Aplicar automáticamente el descuento de campaña cuando el repuesto tiene stock en el almacén
  useEffect(() => {
    if (!isApCampaignDiscountLocked) return;
    const currentDiscount = apForm.getValues("ap_discount");
    if (currentDiscount !== campaignDiscountValue) {
      apForm.setValue("ap_discount", campaignDiscountValue as number);
    }
  }, [isApCampaignDiscountLocked, campaignDiscountValue, apForm]);

  // Si el tipo de abastecimiento deja de ser Stock, se limpia el descuento aplicado
  useEffect(() => {
    if (apSupplyType !== SUPPLY_TYPE_STOCK) {
      apForm.setValue("ap_discount", 0);
    }
  }, [apSupplyType, apForm]);

  const handleApSubmit = apForm.handleSubmit(async (data) => {
    if (apIsPriceBelowMin) return;
    if (!data.ap_supply_type) {
      apForm.setError("ap_supply_type", {
        type: "manual",
        message: "El tipo de abastecimiento es requerido",
      });
      return;
    }
    try {
      setIsApSaving(true);
      await storeOrderQuotationDetails({
        order_quotation_id: quotationId,
        item_type: ITEM_TYPE_PRODUCT,
        product_id: Number(data.ap_product_id),
        description: data.ap_description,
        quantity: data.ap_quantity,
        unit_measure: "UND",
        retail_price_external: undefined,
        freight_commission: 1,
        exchange_rate: 0,
        unit_price: data.ap_unit_price,
        discount_percentage: data.ap_discount,
        observations: "",
        supply_type: data.ap_supply_type,
      });
      successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create"));
      setApMinSalePrice(0);
      apForm.reset({
        ap_product_id: "",
        ap_quantity: 1,
        ap_unit_price: 0,
        ap_discount: 0,
        ap_description: "",
        ap_supply_type: "",
      });
      await onRefresh();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create", msg));
    } finally {
      setIsApSaving(false);
    }
  });

  // Estado del modal de descuento
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"GLOBAL" | "PARTIAL">(TYPE_GLOBAL);
  const [selectedDetail, setSelectedDetail] =
    useState<OrderQuotationDetailsResource | null>(null);
  const [editingRequest, setEditingRequest] =
    useState<DiscountRequestOrderQuotationResource | null>(null);

  const { mutate: doApprove, isPending: isApproving } = useMutation({
    mutationFn: approveDiscountRequestOrderQuotation,
    onSuccess: async () => {
      successToast("Solicitud aprobada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
      await onRefresh();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al aprobar la solicitud";
      errorToast(message);
    },
  });

  const { mutate: doReject, isPending: isRejecting } = useMutation({
    mutationFn: rejectDiscountRequestOrderQuotation,
    onSuccess: async () => {
      successToast("Solicitud rechazada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
      await onRefresh();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al rechazar la solicitud";
      errorToast(message);
    },
  });

  const { mutate: doRevert, isPending: isReverting } = useMutation({
    mutationFn: revertDiscountRequestOrderQuotation,
    onSuccess: async () => {
      successToast("Aprobación revertida correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
      await onRefresh();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al revertir la aprobación";
      errorToast(message);
    },
  });

  const [globalRevertReason, setGlobalRevertReason] = useState("");

  const handleOpenCreate = (
    type: "GLOBAL" | "PARTIAL",
    detail?: OrderQuotationDetailsResource,
  ) => {
    setEditingRequest(null);
    setModalType(type);
    setSelectedDetail(detail ?? null);
    setModalOpen(true);
  };

  const handleOpenEdit = (
    request: DiscountRequestOrderQuotationResource,
    detail?: OrderQuotationDetailsResource,
  ) => {
    setEditingRequest(request);
    setModalType(request.type);
    setSelectedDetail(detail ?? null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedDetail(null);
    setEditingRequest(null);
  };

  const handleDiscountUpdate = async (
    detail: OrderQuotationDetailsResource,
    newPct: number,
  ) => {
    try {
      await updateOrderQuotationDetails(detail.id, {
        order_quotation_id: detail.order_quotation_id,
        item_type: detail.item_type,
        description: detail.description,
        quantity: detail.quantity,
        unit_measure: detail.unit_measure,
        retail_price_external: detail.retail_price_external,
        freight_commission: detail.freight_commission,
        exchange_rate: detail.exchange_rate,
        unit_price: detail.unit_price,
        discount_percentage: newPct,
        observations: detail.observations ?? undefined,
      });
      successToast("Descuento actualizado correctamente");
      await onRefresh();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al actualizar el descuento");
    }
  };

  const handlePriceUpdate = async (
    detail: OrderQuotationDetailsResource,
    newPrice: number,
  ) => {
    try {
      await updateOrderQuotationDetails(detail.id, {
        order_quotation_id: detail.order_quotation_id,
        item_type: detail.item_type,
        description: detail.description,
        quantity: detail.quantity,
        unit_measure: detail.unit_measure,
        retail_price_external: detail.retail_price_external,
        freight_commission: detail.freight_commission,
        exchange_rate: detail.exchange_rate,
        unit_price: newPrice,
        discount_percentage: detail.discount_percentage,
        observations: detail.observations ?? undefined,
      });
      successToast("Precio actualizado correctamente");
      await onRefresh();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al actualizar el precio");
    }
  };

  const handleQuantityUpdate = async (
    detail: OrderQuotationDetailsResource,
    newQuantity: number,
  ) => {
    try {
      await updateOrderQuotationDetails(detail.id, {
        order_quotation_id: detail.order_quotation_id,
        item_type: detail.item_type,
        description: detail.description,
        quantity: newQuantity,
        unit_measure: detail.unit_measure,
        retail_price_external: detail.retail_price_external,
        freight_commission: detail.freight_commission,
        exchange_rate: detail.exchange_rate,
        unit_price: detail.unit_price,
        discount_percentage: detail.discount_percentage,
        observations: detail.observations ?? undefined,
      });
      successToast("Cantidad actualizada correctamente");
      await onRefresh();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al actualizar la cantidad");
    }
  };

  const [externalPriceText, setExternalPriceText] = useState("");
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [stockData, setStockData] = useState<StockByProductIdsResponse | null>(
    null,
  );
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(productDetailSchema),
    defaultValues: {
      order_quotation_id: quotationId,
      item_type: ITEM_TYPE_PRODUCT,
      product_id: "",
      description: "",
      quantity: 1,
      unit_measure: "UND",
      retail_price_external: undefined,
      freight_commission: freightCommissionMultiplier,
      exchange_rate: 0,
      unit_price: 0,
      discount_percentage: 0,
      observations: "",
      supply_type: "",
    },
  });

  const selectedProductId = form.watch("product_id");
  const retailPriceExternal = form.watch("retail_price_external");
  const comisionFlete = form.watch("freight_commission");
  const supplyType = form.watch("supply_type");

  const { data: productData } = useProductById(Number(selectedProductId) || 0);

  const handleCopyCode = async (code: string, key: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeKey(key);
      setTimeout(() => setCopiedCodeKey(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const normalizedValue = pastedText.replace(",", ".");
    const numericValue = parseFloat(normalizedValue);
    if (!isNaN(numericValue)) {
      setExternalPriceText(normalizedValue);
      form.setValue("retail_price_external", numericValue);
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    // Allow intermediate decimal states like "1." while typing
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setExternalPriceText(value);
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        form.setValue("retail_price_external", numericValue);
      } else {
        form.setValue("retail_price_external", 0);
      }
    }
  };

  useEffect(() => {
    if (productData) {
      form.setValue("description", productData.name || "");
      form.setValue("unit_measure", productData.unit_measurement_name || "UND");
    }
  }, [productData, form]);

  // Fetch stock por almacén cuando se selecciona un producto
  useEffect(() => {
    const fetchStock = async () => {
      const id = Number(selectedProductId);
      if (!id) {
        setStockData(null);
        return;
      }
      try {
        const response = await getStockByProductIds([id]);
        setStockData(response);
      } catch {
        setStockData(null);
      }
    };
    fetchStock();
  }, [selectedProductId]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoadingExchangeRate(true);
      try {
        const formattedDate = format(new Date(quotationDate), "yyyy-MM-dd");
        const response = await api.get(
          `/gp/mg/exchange-rate/by-date-and-currency?to_currency_id=${CURRENCY_TYPE_IDS.DOLLARS}&date=${formattedDate}`,
        );
        if (response.data?.data?.rate) {
          const rate = parseFloat(response.data.data.rate);
          setExchangeRate(rate);
          form.setValue("exchange_rate", rate);
        }
      } catch (error) {
        console.error("Error al obtener tipo de cambio:", error);
        setExchangeRate(null);
        form.setValue("exchange_rate", 0);
      } finally {
        setIsLoadingExchangeRate(false);
      }
    };
    fetchExchangeRate();
  }, [quotationDate, form]);

  const hasStockInWarehouse = (() => {
    const currentProductStock = stockData?.data?.find(
      (s) => s.product_id === Number(selectedProductId),
    );
    return !!currentProductStock?.warehouses?.some(
      (w) => w.warehouse_id === warehouseId && w.available_quantity > 0,
    );
  })();

  const isCampaignDiscountLocked =
    hasStockInWarehouse &&
    supplyType === SUPPLY_TYPE_STOCK &&
    campaignDiscountValue !== undefined;

  // Aplicar automáticamente el descuento de campaña cuando el repuesto tiene stock en el almacén
  useEffect(() => {
    if (!isCampaignDiscountLocked) return;
    const currentDiscount = form.getValues("discount_percentage");
    if (currentDiscount !== campaignDiscountValue) {
      form.setValue("discount_percentage", campaignDiscountValue as number);
    }
  }, [isCampaignDiscountLocked, campaignDiscountValue, form]);

  // Si el tipo de abastecimiento deja de ser Stock, se limpia el descuento aplicado
  useEffect(() => {
    if (supplyType !== SUPPLY_TYPE_STOCK) {
      form.setValue("discount_percentage", 0);
    }
  }, [supplyType, form]);

  useEffect(() => {
    const retail = Number(retailPriceExternal) || 0;
    const comision = Number(comisionFlete) || freightCommissionMultiplier;
    let calculatedUnitPrice: number;
    if (isInDollars) {
      calculatedUnitPrice = Math.round(retail * comision * 100) / 100;
    } else {
      const tipoCambio = exchangeRate || 1;
      calculatedUnitPrice =
        Math.round(retail * comision * tipoCambio * 100) / 100;
    }
    form.setValue("unit_price", calculatedUnitPrice);
  }, [
    retailPriceExternal,
    comisionFlete,
    exchangeRate,
    form,
    isInDollars,
    freightCommissionMultiplier,
  ]);

  const onSubmit = async (data: ProductDetailSchema) => {
    try {
      setIsSaving(true);
      await storeOrderQuotationDetails({
        ...data,
        product_id: Number(data.product_id),
      });
      successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create"));
      form.reset({
        order_quotation_id: quotationId,
        item_type: ITEM_TYPE_PRODUCT,
        product_id: "",
        description: "",
        quantity: 1,
        unit_measure: "UND",
        retail_price_external: undefined,
        freight_commission: freightCommissionMultiplier,
        exchange_rate: exchangeRate || 0,
        unit_price: 0,
        discount_percentage: 0,
        observations: "",
        supply_type: "",
      });
      setExternalPriceText("");
      await onRefresh();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "create", msg));
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    const value = Number(amount) || 0;
    return `${currencySymbol} ${value.toFixed(2)}`;
  };

  const productDetails = details.filter(
    (d) => d.item_type === ITEM_TYPE_PRODUCT,
  );

  const globalBaseAmount = productDetails.reduce(
    (sum, d) => sum + Number(d.total_cost || 0),
    0,
  );
  const hasMultipleItems = productDetails.length > 1;

  // Las solicitudes revertidas (reverted_by_id != null) se tratan como descartadas,
  // permitiendo volver a solicitar el descuento.
  const activeDiscountRequests = discountRequests.filter(
    (r) => r.reverted_by_id == null,
  );

  const globalRequest = activeDiscountRequests.find(
    (r) => r.type === TYPE_GLOBAL,
  );
  const hasPartialRequests = activeDiscountRequests.some(
    (r) => r.type === TYPE_PARTIAL,
  );

  // Calcular descuento máximo permitido (para formulario y modal)
  const globalApprovedRequest = activeDiscountRequests.find(
    (r) => r.type === TYPE_GLOBAL && r.status === STATUS_APPROVED,
  );
  const maxDiscountAllowed = globalApprovedRequest
    ? Number(globalApprovedRequest.requested_discount_percentage)
    : (user?.discount_percentage ?? DEFAULT_APPROVED_DISCOUNT);

  const baseAmountForModal =
    modalType === TYPE_GLOBAL
      ? globalBaseAmount
      : Number(selectedDetail?.total_cost || 0);

  // Para el modal siempre permitir solicitar hasta 100% (es una solicitud, no aplicación directa)
  const maxDiscountForModal = maxDiscountAllowed;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Repuestos</h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Switch de modo */}
          <div className="flex items-center gap-2">
            <Label
              htmlFor="mode-switch"
              className={`text-xs font-semibold cursor-pointer ${mode === "DEALER_PORTAL" ? "text-primary" : "text-muted-foreground"}`}
            >
              DEALER PORTAL
            </Label>
            <Switch
              id="mode-switch"
              checked={mode === "AP"}
              onCheckedChange={(checked) => {
                const newMode = checked ? "AP" : "DEALER_PORTAL";
                setMode(newMode);
                if (newMode === "AP") {
                  apForm.reset({
                    ap_product_id: "",
                    ap_quantity: 1,
                    ap_unit_price: 0,
                    ap_discount: 0,
                    ap_description: "",
                    ap_supply_type: "",
                  });
                  setApMinSalePrice(0);
                } else {
                  form.reset({
                    order_quotation_id: quotationId,
                    item_type: ITEM_TYPE_PRODUCT,
                    product_id: "",
                    description: "",
                    quantity: 1,
                    unit_measure: "UND",
                    retail_price_external: undefined,
                    freight_commission: freightCommissionMultiplier,
                    exchange_rate: exchangeRate || 0,
                    unit_price: 0,
                    discount_percentage: 0,
                    observations: "",
                    supply_type: "",
                  });
                  setExternalPriceText("");
                  setStockData(null);
                }
              }}
            />
            <Label
              htmlFor="mode-switch"
              className={`text-xs font-semibold cursor-pointer ${mode === "AP" ? "text-primary" : "text-muted-foreground"}`}
            >
              AP
            </Label>
          </div>

          {permissions.canCreateSpare && (
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
      </div>

      {/* Formulario modo AP */}
      {mode === "AP" && (
        <div className="space-y-4 mt-4">
          <Form {...apForm}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <FormSelectAsync
                  name="ap_product_id"
                  label="Repuesto"
                  placeholder="Buscar producto en el almacén..."
                  control={apForm.control}
                  useQueryHook={useInventory}
                  additionalParams={{
                    warehouse_id: warehouseId?.toString() ?? "",
                  }}
                  mapOptionFn={(inventory: InventoryResource) => ({
                    label: () => (
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="font-medium truncate">
                          {inventory.product.code} - {inventory.product.name}
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
                  debounceMs={500}
                  onValueChange={handleApInventoryChange}
                />

                {/* Espacio reservado */}
                <div className="h-4" />
              </div>

              <div className="flex flex-col gap-1">
                <FormInput
                  name="ap_unit_price"
                  label={`Precio Venta Público (${currencySymbol})`}
                  type="number"
                  placeholder="0.0"
                  step="0.01"
                  control={apForm.control}
                />
                {isInDollars && exchangeRate && (
                  <p className="text-[10px] text-muted-foreground">
                    Convertido con tipo de cambio S/. {exchangeRate.toFixed(4)}{" "}
                    (S/. {apSalePriceSoles.toFixed(2)})
                  </p>
                )}
                {apIsPriceBelowMin && (
                  <p className="text-xs font-medium text-destructive">
                    El precio no puede ser menor a {apMinSalePrice}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <FormInput
                name="ap_quantity"
                label="Cantidad"
                type="number"
                placeholder="1"
                step="0.01"
                min={0.01}
                control={apForm.control}
              />

              <div className="space-y-1">
                <FormInput
                  name="ap_discount"
                  label={`Descuento (% máx: ${maxDiscountPercentage})`}
                  type="number"
                  placeholder="0.0"
                  step="0.01"
                  min={0}
                  max={maxDiscountPercentage}
                  control={apForm.control}
                  disabled={isApCampaignDiscountLocked}
                  className={
                    isApCampaignDiscountLocked
                      ? "border-orange-400 bg-orange-50"
                      : undefined
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    apForm.setValue(
                      "ap_discount",
                      Math.min(val, maxDiscountPercentage),
                    );
                  }}
                />
                {isApCampaignDiscountLocked && (
                  <p className="text-[10px] font-medium text-orange-600">
                    Descuento por campaña aplicado
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="hidden">
                <FormInput
                  name="ap_description"
                  label="Descripción"
                  placeholder="Descripción del producto"
                  control={apForm.control}
                />
              </div>

              <FormSelect
                control={apForm.control}
                name="ap_supply_type"
                options={onSelectSupplyType}
                label="Tipo de Abastecimiento"
                placeholder="Seleccionar un tipo"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                disabled={isApSaving || !apProductId || apIsPriceBelowMin}
                className="gap-2"
                onClick={handleApSubmit}
              >
                {isApSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          style={{ display: mode === "DEALER_PORTAL" ? undefined : "none" }}
        >
          {/* Mensaje de tipo de cambio y comisión */}
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 space-y-1">
            <p className="text-xs text-primary">
              <span className="font-semibold">Moneda de cotización:</span>{" "}
              {currencySymbol}
            </p>
            <p className="text-xs text-primary">
              <span className="font-semibold">Comisión de flete:</span>{" "}
              {Number(comisionFlete) || freightCommissionMultiplier}
            </p>
            {!isInDollars &&
              (isLoadingExchangeRate ? (
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
              ))}
          </div>

          {/* Primera fila: Repuesto y Precio Externo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-2">
              <FormSelectAsync
                name="product_id"
                label="Repuesto"
                placeholder="Seleccione un repuesto"
                control={form.control}
                useQueryHook={useProduct}
                mapOptionFn={(product) => ({
                  label: () => (
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-medium truncate">
                        {product.code} - {product.name}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 bg-orange-100 text-orange-700">
                        {product.brand.name || "Sin marca"}
                      </span>
                    </div>
                  ),
                  value: product.id.toString(),
                })}
                perPage={10}
                debounceMs={500}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <FormInput
                control={form.control}
                name="retail_price_external"
                label="Precio Lista ($)"
                placeholder="Ej: 1.5"
                inputMode="decimal"
                type="text"
                value={externalPriceText}
                onPaste={handlePaste}
                onChange={handleNumericChange}
              />
            </div>
          </div>

          {/* Stock por almacén del repuesto seleccionado */}
          {stockData &&
            selectedProductId &&
            (() => {
              const currentStock = stockData.data?.find(
                (s) => s.product_id === Number(selectedProductId),
              );
              if (!currentStock) return null;
              return (
                <StockWarehousesCard
                  stock={currentStock}
                  productInfo={productData}
                  copyCodeKey="stock-code"
                  copiedCodeKey={copiedCodeKey}
                  onCopyCode={handleCopyCode}
                />
              );
            })()}

          {/* Segunda fila: Cantidad, Precio Unitario, Descuento y Tipo de Abastecimiento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <FormInput
                control={form.control}
                name="quantity"
                label="Cantidad"
                placeholder="Ej: 1"
                inputMode="numeric"
                type="number"
              />
            </div>

            <div>
              <FormInput
                control={form.control}
                name="unit_price"
                label="Precio Unit. (Calculado)"
                placeholder="Ej: 10.00"
                inputMode="numeric"
                type="number"
                disabled
              />
            </div>

            <div className="space-y-1">
              <FormInput
                control={form.control}
                name="discount_percentage"
                label="Desc. %"
                placeholder="Ej: 0.00"
                inputMode="numeric"
                type="number"
                min={0}
                max={maxDiscountAllowed}
                disabled={isCampaignDiscountLocked}
                className={
                  isCampaignDiscountLocked
                    ? "border-orange-400 bg-orange-50"
                    : globalApprovedRequest
                      ? "border-green-400"
                      : undefined
                }
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : 0;
                  if (val > maxDiscountAllowed) {
                    form.setValue("discount_percentage", maxDiscountAllowed);
                  } else {
                    form.setValue("discount_percentage", val);
                  }
                }}
              />
              {isCampaignDiscountLocked ? (
                <p className="text-[10px] font-medium text-orange-600">
                  Descuento por campaña aplicado
                </p>
              ) : (
                <p className="text-[10px] font-medium text-green-600">
                  Máx. {globalApprovedRequest ? "aprobado" : "permitido"}:{" "}
                  {maxDiscountAllowed.toFixed(2)}%
                </p>
              )}
            </div>

            <div>
              <FormSelect
                control={form.control}
                name="supply_type"
                options={onSelectSupplyType}
                label="Tipo de Abastecimiento"
                placeholder="Seleccionar un tipo"
                required
              />
            </div>
          </div>

          {/* Tercera fila: Observaciones y Botón */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-11">
              <FormInput
                control={form.control}
                name="observations"
                label="Observaciones"
                placeholder="Ej: Observaciones adicionales"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <Button
                type="submit"
                disabled={isSaving || !selectedProductId}
                className="h-9 w-full lg:h-10 lg:rounded-md lg:px-3 lg:font-semibold lg:shadow-sm"
                size="sm"
              >
                <Plus className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
                <span className="hidden lg:inline text-xs">Agregar</span>
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Lista de Productos en formato tabla */}
      <div className="mt-6">
        {/* Header con botón de descuento global */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-700">Items de Repuestos</h4>
            <Badge color="secondary" className="font-semibold">
              {productDetails.length} item(s)
            </Badge>
          </div>

          {hasMultipleItems && productDetails.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {globalRequest ? (
                <div className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5">
                  <span className="text-muted-foreground text-xs">
                    Desc. global:
                  </span>
                  <span className="font-semibold">
                    {Number(
                      globalRequest.requested_discount_percentage,
                    ).toFixed(2)}
                    %
                  </span>
                  <Badge
                    color={
                      globalRequest.status === STATUS_APPROVED
                        ? "green"
                        : globalRequest.status === STATUS_REJECTED
                          ? "red"
                          : "orange"
                    }
                  >
                    {globalRequest.status === STATUS_APPROVED
                      ? "Aprobado"
                      : globalRequest.status === STATUS_REJECTED
                        ? "Rechazado"
                        : "Pendiente"}
                  </Badge>
                  {globalRequest.status === STATUS_PENDING && (
                    <>
                      {permissions.canApprove && (
                        <ConfirmationDialog
                          trigger={
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7 text-green-600 hover:text-green-600 hover:bg-green-50"
                              tooltip="Aprobar solicitud global"
                              disabled={isApproving}
                            >
                              <CheckCircle className="size-4" />
                            </Button>
                          }
                          title="¿Aprobar solicitud?"
                          description="Se aprobará el descuento global solicitado. ¿Deseas continuar?"
                          confirmText="Sí, aprobar"
                          cancelText="Cancelar"
                          icon="info"
                          onConfirm={() => doApprove(globalRequest.id)}
                        />
                      )}
                      {permissions.canEditDiscount && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          tooltip="Editar solicitud global"
                          onClick={() => handleOpenEdit(globalRequest)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {permissions.canReject && (
                        <ConfirmationDialog
                          trigger={
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              tooltip="Rechazar solicitud global"
                              disabled={isRejecting}
                            >
                              <XCircle className="size-4" />
                            </Button>
                          }
                          title="¿Rechazar solicitud?"
                          description="Se rechazará el descuento global solicitado. ¿Deseas continuar?"
                          confirmText="Sí, rechazar"
                          cancelText="Cancelar"
                          variant="destructive"
                          icon="danger"
                          onConfirm={() => doReject(globalRequest.id)}
                        />
                      )}
                    </>
                  )}
                  {globalRequest.status === STATUS_APPROVED &&
                    permissions.canReverseDiscount && (
                      <ConfirmationDialog
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7 text-amber-600 hover:text-amber-600 hover:bg-amber-50"
                            tooltip="Revertir aprobación global"
                            disabled={isReverting}
                          >
                            <Undo2 className="size-4" />
                          </Button>
                        }
                        title="¿Revertir descuento aprobado?"
                        description="Se revertirá la aprobación del descuento global. Puedes indicar un motivo (opcional)."
                        confirmText="Sí, revertir"
                        cancelText="Cancelar"
                        variant="destructive"
                        icon="warning"
                        onConfirm={() => {
                          doRevert({
                            id: globalRequest.id,
                            reason: globalRevertReason.trim() || undefined,
                          });
                          setGlobalRevertReason("");
                        }}
                      >
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="global-revert-reason"
                            className="text-xs"
                          >
                            Motivo (opcional)
                          </Label>
                          <Textarea
                            id="global-revert-reason"
                            value={globalRevertReason}
                            onChange={(e) =>
                              setGlobalRevertReason(e.target.value)
                            }
                            placeholder="Ej: Se corrigió el porcentaje por error de digitación"
                            className="text-sm"
                            rows={3}
                          />
                        </div>
                      </ConfirmationDialog>
                    )}
                </div>
              ) : (
                !hasPartialRequests && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreate(TYPE_GLOBAL)}
                    className="gap-2"
                  >
                    <Percent className="size-4" />
                    Desc. global
                  </Button>
                )
              )}
            </div>
          )}
        </div>

        <QuotationItemsTable
          details={productDetails}
          isLoading={isLoadingDetails}
          emptyIcon={<Package className="h-10 w-10" />}
          emptyMessage="No hay items de repuestos"
          formatCurrency={formatCurrency}
          maxDiscountAllowed={maxDiscountAllowed}
          discountRequests={activeDiscountRequests}
          globalRequest={globalRequest}
          permissions={permissions}
          itemType="PART"
          isApproving={isApproving}
          isRejecting={isRejecting}
          isReverting={isReverting}
          onDiscountUpdate={handleDiscountUpdate}
          onPriceUpdate={handlePriceUpdate}
          onQuantityUpdate={handleQuantityUpdate}
          onDelete={onDelete}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onApprove={(id) => doApprove(id)}
          onReject={(id) => doReject(id)}
          onRevert={(id, reason) => doRevert({ id, reason })}
          renderName={(detail) => (
            <div>
              <p className="text-sm font-medium truncate">
                {detail.description}
              </p>
              {detail.product?.code && (
                <CopyCell
                  value={detail.product.code}
                  label={`Cód: ${detail.product.code}`}
                  className="text-xs font-mono px-1.5 py-0.5 rounded mt-0.5"
                />
              )}
              {detail.product?.dyn_code && (
                <CopyCell
                  value={detail.product.dyn_code}
                  label={`Dyn: ${detail.product.dyn_code}`}
                  className="text-xs font-mono px-1.5 py-0.5 rounded mt-0.5"
                />
              )}
              {detail.observations && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {detail.observations}
                </p>
              )}
            </div>
          )}
          getQuantity={(detail) => (
            <span className="tabular-nums">
              {detail.quantity}{" "}
              <span className="text-xs text-muted-foreground">
                {detail.unit_measure}
              </span>
            </span>
          )}
          getPrice={(detail) => formatCurrency(detail.unit_price)}
          getTotal={(detail) => detail.net_amount}
          extraColumns={[
            {
              header: "Tipo Abas.",
              className: "w-[10%]",
              render: (detail) => (
                <span className="text-xs">{detail.supply_type}</span>
              ),
            },
            {
              header: "Reg. por",
              className: "w-[10%]",
              render: (detail) => (
                <span className="text-xs text-muted-foreground wrap-break-word">
                  {detail.created_by_name}
                </span>
              ),
            },
            {
              header: "Cto. Total",
              className: "w-[12%]",
              render: (detail) => (
                <span className="font-medium tabular-nums">
                  {formatCurrency(detail.total_cost)}
                </span>
              ),
            },
          ]}
          extraMobileFields={(detail) => (
            <>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Tipo Abas.:</span>
                <span className="font-medium">{detail.supply_type}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Reg. por:</span>
                <span className="font-medium">{detail.created_by_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Cto. Total:</span>
                <span className="font-medium">{detail.total_cost}</span>
              </div>
            </>
          )}
        />
      </div>

      {/* Modal para crear repuesto */}
      <QuotationPartModal
        open={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
      />

      <DiscountRequestModal
        open={modalOpen}
        onClose={handleClose}
        type={modalType}
        quotationId={quotationId}
        baseAmount={baseAmountForModal}
        detail={selectedDetail ?? undefined}
        currencySymbol={currencySymbol}
        existingRequest={editingRequest ?? undefined}
        itemType="PRODUCT"
        maxDiscount={maxDiscountForModal}
      />
    </Card>
  );
}
