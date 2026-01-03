"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, User, FileText } from "lucide-react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { ORDER_QUOTATION } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import { ORDER_QUOTATION_DETAILS } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.constants";
import { findOrderQuotationById } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions";
import {
  getAllOrderQuotationDetails,
  deleteOrderQuotationDetails,
} from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.actions";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import { OrderQuotationDetailsResource } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.interface";
import LaborDetailsSection from "@/features/ap/post-venta/taller/cotizacion-detalle/components/LaborDetailsSection";
import ProductDetailsSection from "@/features/ap/post-venta/taller/cotizacion-detalle/components/ProductDetailsSection";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ManageQuotationPage() {
  const params = useParams();
  const navigate = useNavigate();
  const quotationId = Number(params.id);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [quotation, setQuotation] = useState<OrderQuotationResource | null>(
    null
  );
  const [details, setDetails] = useState<OrderQuotationDetailsResource[]>([]);

  useEffect(() => {
    loadData();
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
      console.error(error);
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

  const formatCurrency = (amount: number) => {
    return `S/. ${amount.toFixed(2)}`;
  };

  // Calcular el total actual desde los detalles
  const currentTotal = details.reduce((sum, detail) => {
    return sum + (Number(detail.total_amount) || 0);
  }, 0);

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
          variant="ghost"
          size="icon"
          onClick={() => navigate(ORDER_QUOTATION.ABSOLUTE_ROUTE)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <TitleComponent
          title="Gestionar Cotización"
          subtitle={`Cotización: ${quotation.quotation_number}`}
        />
      </div>

      {/* Información de la Cotización */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen de Cotización */}
        <Card className="p-6 border-gray-200 bg-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-gray-600" />
            </div>
            Datos de Cotización
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">N° Cotización</p>
              <p className="font-bold text-lg text-gray-900">
                {quotation.quotation_number}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Fecha</p>
                <p className="font-medium text-sm">
                  {formatDate(quotation.quotation_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Vencimiento</p>
                <p className="font-medium text-sm">
                  {quotation.expiration_date
                    ? formatDate(quotation.expiration_date)
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Monto Total</p>
              <p className="font-bold text-2xl text-gray-900">
                {formatCurrency(currentTotal)}
              </p>
            </div>
          </div>
          {quotation.observations && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Observaciones</p>
              <p className="text-sm text-gray-700 line-clamp-3">
                {quotation.observations}
              </p>
            </div>
          )}
        </Card>

        {/* Información del Vehículo */}
        {quotation.vehicle && (
          <Card className="p-6 border-gray-200 lg:col-span-2 bg-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Car className="h-5 w-5 text-gray-600" />
              Información del Vehículo
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Placa</p>
                <p className="font-bold text-base text-gray-900">
                  {quotation.vehicle.plate || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">VIN</p>
                <p className="font-medium text-sm text-gray-800 truncate">
                  {quotation.vehicle.vin || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Marca</p>
                <p className="font-medium text-sm text-gray-800 truncate">
                  {quotation.vehicle.model?.brand || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Año</p>
                <p className="font-medium text-sm text-gray-800">
                  {quotation.vehicle.year || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Modelo</p>
                <p className="font-medium text-sm text-gray-800 truncate">
                  {quotation.vehicle.model?.version || ""}
                </p>
              </div>
            </div>

            {quotation.vehicle.owner && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-gray-600" />
                  <p className="text-xs font-semibold text-gray-700">
                    Propietario del Vehículo
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">
                      Nombre Completo
                    </p>
                    <p className="font-medium text-sm text-gray-900">
                      {quotation.vehicle.owner.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Documento</p>
                    <p className="font-medium text-sm text-gray-900">
                      {quotation.vehicle.owner.num_doc}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Teléfono</p>
                    <p className="font-medium text-sm text-gray-900">
                      {quotation.vehicle.owner.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Sección de Mano de Obra */}
      <LaborDetailsSection
        quotationId={quotationId}
        details={details}
        isLoadingDetails={isLoadingDetails}
        onRefresh={loadDetails}
        onDelete={handleDelete}
      />

      {/* Sección de Productos */}
      <ProductDetailsSection
        quotationId={quotationId}
        details={details}
        isLoadingDetails={isLoadingDetails}
        onRefresh={loadDetails}
        onDelete={handleDelete}
        quotationDate={quotation.quotation_date}
      />
    </div>
  );
}
