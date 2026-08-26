"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import FormSkeleton from "@/shared/components/FormSkeleton";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { PURCHASE_REQUEST_QUOTE } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.constants";
import { usePurchaseRequestQuoteById } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.hook";
import AdjustmentRequestForm from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/components/AdjustmentRequestForm";

export default function RequestAdjustmentPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const navigate = useNavigate();
  const { quoteId } = useParams<{ quoteId: string }>();
  const { ROUTE, ABSOLUTE_ROUTE } = PURCHASE_REQUEST_QUOTE;
  // Es una subruta de Solicitudes de Compra: reutiliza el mismo módulo/permisos
  // (no requiere una Vista nueva en el menú).
  const permissions = useModulePermissions(ROUTE);

  const { data: quote, isLoading } = usePurchaseRequestQuoteById(
    Number(quoteId),
  );

  if (isLoadingModule) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!permissions.canRequestAdjustment) notFound();
  if (isLoading || !quote) return <FormSkeleton />;
  if (!quote.is_paid) notFound();

  const goBack = () => navigate(ABSOLUTE_ROUTE);

  return (
    <PageWrapper>
      <TitleFormComponent
        title="Solicitar Ajuste de Bono / Descuento"
        subtitle={`Cotización ${quote.correlative} · ya pagada — el cambio requiere aprobación contable`}
        icon="PercentCircle"
        backRoute={ABSOLUTE_ROUTE}
      />
      <AdjustmentRequestForm quote={quote} onSuccess={goBack} onCancel={goBack} />
    </PageWrapper>
  );
}
