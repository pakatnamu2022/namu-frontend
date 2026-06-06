"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { useParams } from "react-router-dom";
import { ORDER_QUOTATION_MESON } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import { useOrderQuotationById } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.hook";
import FormWrapper from "@/shared/components/FormWrapper";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import BackButton from "@/shared/components/BackButton";
import TitleComponent from "@/shared/components/TitleComponent";
import { BillingSheetContent } from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/OrderQuotationBillingSheet";

export default function OrderQuotationMesonDetallePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE, ABSOLUTE_ROUTE } = ORDER_QUOTATION_MESON;
  const { id } = useParams();

  const { data: orderQuotation, isLoading, refetch } = useOrderQuotationById(Number(id));

  if (isLoadingModule || isLoading) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (!orderQuotation) notFound();

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <BackButton size="icon" name="Cotización Mesón" route={ABSOLUTE_ROUTE} />
        <TitleComponent
          title={`Cotización ${orderQuotation.quotation_number}`}
          subtitle="Detalle de la cotización"
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      <BillingSheetContent
        orderQuotation={orderQuotation}
        onRefresh={refetch}
      />
    </FormWrapper>
  );
}
