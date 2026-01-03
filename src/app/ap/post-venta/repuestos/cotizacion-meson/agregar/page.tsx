"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { notFound } from "@/shared/hooks/useNotFound";
import { useNavigate } from "react-router-dom";
import { ORDER_QUOTATION_MESON } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import { Card } from "@/components/ui/card";
import ProformaMesonForm from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/ProformaMesonForm";
import { QuotationMesonWithProductsSchema } from "@/features/ap/post-venta/repuestos/cotizacion-meson/lib/quotationMeson.schema";
import { storeOrderQuotationWithProducts } from "@/features/ap/post-venta/repuestos/cotizacion-meson/lib/quotationMeson.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useState } from "react";

export default function AddOrderQuotationMesonPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { MODEL, ROUTE, ABSOLUTE_ROUTE } = ORDER_QUOTATION_MESON;
  const router = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: QuotationMesonWithProductsSchema) => {
    try {
      setIsSubmitting(true);
      await storeOrderQuotationWithProducts(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE);
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <TitleComponent
        title={`Agregar ${currentView.descripcion}`}
        subtitle={`Crear una nueva ${MODEL.name.toLowerCase()} con repuestos`}
        icon={currentView.icon}
      />
      <Card className="p-6">
        <ProformaMesonForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
}
