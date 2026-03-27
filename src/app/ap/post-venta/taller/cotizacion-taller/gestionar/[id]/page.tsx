"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, User, FileText } from "lucide-react";
import VehicleWorkOrderHistory from "@/features/ap/comercial/vehiculos/components/VehicleWorkOrderHistory";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function.ts";
import { IGV } from "@/core/core.constants.ts";
import { ORDER_QUOTATION_TALLER } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants.ts";
import { ORDER_QUOTATION_DETAILS } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.constants.ts";
import { findOrderQuotationById } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions.ts";
import {
  getAllOrderQuotationDetails,
  deleteOrderQuotationDetails,
} from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.actions.ts";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface.ts";
import { OrderQuotationDetailsResource } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.interface.ts";
import LaborDetailsSection from "@/features/ap/post-venta/taller/cotizacion-detalle/components/LaborDetailsSection.tsx";
import ProductDetailsSection from "@/features/ap/post-venta/taller/cotizacion-detalle/components/ProductDetailsSection.tsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDiscountRequestsQuotation } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.hook";
import {
  STATUS_APPROVED,
  STATUS_PENDING,
} from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";

export default function ManageQuotationPage() {
  const params = useParams();
  const navigate = useNavigate();
  const quotationId = Number(params.id);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [quotation, setQuotation] = useState<OrderQuotationResource | null>(
    null,
  );
  const [details, setDetails] = useState<OrderQuotationDetailsResource[]>([]);
  const { ROUTE, ABSOLUTE_ROUTE } = ORDER_QUOTATION_TALLER;
  const permissions = useModulePermissions(ROUTE);

  const { data: discountRequests = [] } = useDiscountRequestsQuotation({
    ap_order_quotation_id: Number(quotationId),
    status: [STATUS_PENDING, STATUS_APPROVED],
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const [quotationData, detailsData] = await Promise.all([
        findOrderQuotationById(quotationId),
        getAllOrderQuotationDetails({
          params: { order_quotation_id: quotationId },
        }),
      ]);

      setQuotation(quotationData);
      setDetails(detailsData);
    } catch (error: any) {
      if (showLoading) {
        errorToast("Error al cargar los datos");
      }
      errorToast(error?.response?.data?.message || "Error al cargar los datos");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const loadDetails = async () => {
    try {
      setIsLoadingDetails(true);
      const detailsData = await getAllOrderQuotationDetails({
        params: { order_quotation_id: quotationId },
      });
      setDetails(detailsData);
    } catch (error: any) {
      errorToast("Error al cargar los detalles");
      console.error(error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOrderQuotationDetails(id);
      successToast(SUCCESS_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "delete"));
      await loadDetails();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(ORDER_QUOTATION_DETAILS.MODEL, "delete", msg));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (
    amount: number,
    quotation: OrderQuotationResource,
  ) => {
    return `${quotation.type_currency.symbol} ${amount.toFixed(2)}`;
  };

  // Calcular el total actual desde los detalles
  const currentTotal = details.reduce((sum, detail) => {
    return sum + (Number(detail.total_amount) || 0);
  }, 0);
  const igvAmount = currentTotal * IGV.RATE;
  const proposalTotal = currentTotal + igvAmount;

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Cotización no encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(ABSOLUTE_ROUTE)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <TitleComponent
          title="Gestionar Cotización"
          subtitle={`Cotización: ${quotation.quotation_number}`}
        />
      </div>

      {/* Información de la Cotización */}
      <section className="overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/5 via-background to-background">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b border-border/80 bg-primary/5 p-6 md:p-7 lg:border-b-0 lg:border-r lg:border-border/80">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-background/80 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground">
                Datos de Cotización
              </h3>
            </div>

            <div className="mt-5 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                N° Cotización
              </p>
              <p className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                {quotation.quotation_number}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Fecha
                </p>
                <p className="text-base font-medium text-foreground">
                  {formatDate(quotation.quotation_date)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Vencimiento
                </p>
                <p className="text-base font-medium text-foreground">
                  {quotation.expiration_date
                    ? formatDate(quotation.expiration_date)
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border/80 bg-background/70 px-4 py-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Monto Total</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(currentTotal, quotation)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  IGV ({(IGV.RATE * 100).toFixed(0)}%)
                </p>
                <p className="text-base font-medium text-foreground">
                  {formatCurrency(igvAmount, quotation)}
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-border flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  Total Propuesta
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(proposalTotal, quotation)}
                </p>
              </div>
            </div>

            {quotation.observations && (
              <div className="mt-5 rounded-xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Observaciones
                </p>
                <p className="text-sm leading-relaxed text-foreground/90 line-clamp-3">
                  {quotation.observations}
                </p>
              </div>
            )}
          </div>

          {quotation.vehicle && (
            <div className="p-6 md:p-7">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  Información del Vehículo
                </h3>
                <div className="ml-auto">
                  <VehicleWorkOrderHistory
                    vehicleId={quotation.vehicle.id}
                    vehiclePlate={quotation.vehicle.plate}
                    buttonVariant="default"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Placa
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {quotation.vehicle.plate || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    VIN
                  </p>
                  <p className="text-base font-medium text-foreground truncate">
                    {quotation.vehicle.vin || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Marca
                  </p>
                  <p className="text-base font-medium text-foreground truncate">
                    {quotation.vehicle.model?.brand || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Año
                  </p>
                  <p className="text-base font-medium text-foreground">
                    {quotation.vehicle.year || "N/A"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Modelo
                  </p>
                  <p className="text-base font-medium text-foreground truncate">
                    {quotation.vehicle.model?.version || "N/A"}
                  </p>
                </div>
              </div>

              {quotation.vehicle.owner && (
                <div className="mt-6 rounded-2xl border border-border/80 bg-muted/35 p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Propietario del Vehículo
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Nombre Completo
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {quotation.vehicle.owner.full_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Documento
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {quotation.vehicle.owner.num_doc}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Teléfono
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {quotation.vehicle.owner.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {quotation.client && (
                <div className="mt-6 rounded-2xl border border-border/80 bg-muted/35 p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Cliente de la Cotización
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Nombre Completo
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {quotation.client.full_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Documento
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {quotation.client.num_doc || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Teléfono
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {quotation.client.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Correo
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {quotation.client.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Sección de Mano de Obra */}
      <LaborDetailsSection
        quotationId={quotationId}
        constManHours={quotation.cost_man_hours}
        details={details}
        isLoadingDetails={isLoadingDetails}
        onRefresh={loadDetails}
        onDelete={handleDelete}
        currencySymbol={quotation.type_currency.symbol}
        exchangeRate={quotation.exchange_rate}
        discountRequests={discountRequests.filter(
          (r) => r.item_type === "LABOR",
        )}
        permissions={permissions}
      />

      {/* Sección de Productos */}
      <ProductDetailsSection
        quotationId={quotationId}
        details={details}
        isLoadingDetails={isLoadingDetails}
        onRefresh={loadDetails}
        onDelete={handleDelete}
        quotationDate={quotation.quotation_date}
        currencySymbol={quotation.type_currency.symbol}
        currencyId={quotation.currency_id}
        discountRequests={discountRequests.filter(
          (r) => r.item_type === "PRODUCT",
        )}
        permissions={permissions}
      />
    </div>
  );
}
