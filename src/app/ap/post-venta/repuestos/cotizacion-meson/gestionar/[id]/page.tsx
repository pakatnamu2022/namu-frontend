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
import { OrderQuotationManageContent } from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/OrderQuotationManageContent";

export default function OrderQuotationMesonManagePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE, ABSOLUTE_ROUTE } = ORDER_QUOTATION_MESON;
  const { id } = useParams();

  const {
    data: orderQuotation,
    isLoading,
    refetch,
  } = useOrderQuotationById(Number(id));

  if (isLoadingModule || isLoading) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (!orderQuotation) notFound();

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <BackButton
          size="icon"
          name="Cotización Mesón"
          route={ABSOLUTE_ROUTE}
        />
        <TitleComponent
          title={`${orderQuotation.quotation_number}`}
          subtitle="Gestión de Cotización Repuestos"
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      <OrderQuotationManageContent
        orderQuotation={orderQuotation}
        onRefresh={refetch}
      />
    </FormWrapper>
  );
}
