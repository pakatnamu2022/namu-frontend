"use client";

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderQuotationById } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.hook";
import { ORDER_QUOTATION_CAJA } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import OrderQuotationBillingContent from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/OrderQuotationBillingContent";

export default function BillOrderQuotationCajaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quotationId = id ? parseInt(id) : 0;
  const { ABSOLUTE_ROUTE } = ORDER_QUOTATION_CAJA;

  const { data: quotation, isLoading } = useOrderQuotationById(quotationId);

  const handleGoBack = () => navigate(ABSOLUTE_ROUTE);

  if (isLoading) return <PageSkeleton />;

  if (!quotation) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Cotización no encontrada</h1>
          <p className="text-muted-foreground">
            La cotización que intentas facturar no existe.
          </p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a cotizaciones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleGoBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <TitleComponent
          title="Facturar Cotización"
          subtitle={`Cotización: ${quotation.quotation_number}`}
        />
      </div>

      <OrderQuotationBillingContent
        quotation={quotation}
        quotationId={quotationId}
      />
    </div>
  );
}
