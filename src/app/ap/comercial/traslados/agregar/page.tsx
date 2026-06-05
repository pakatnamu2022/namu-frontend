"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { TRANSFERS } from "@/features/ap/comercial/traslados/lib/transfers.constants";
import InternalTransferForm from "@/features/ap/comercial/traslados/components/InternalTransferForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddTransferPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const { ROUTE } = TRANSFERS;

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Nuevo Traslado Interno"
          subtitle="Crear guía interna de traslado entre sedes"
          icon="Truck"
        />
      </HeaderTableWrapper>

      <InternalTransferForm />
    </div>
  );
}
