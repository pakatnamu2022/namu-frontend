"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { EXHIBITION_VEHICLES } from "@/features/ap/comercial/vehiculos-exhibicion/lib/exhibitionVehicles.constants";
import { ExhibitionVehiclesForm } from "@/features/ap/comercial/vehiculos-exhibicion/components/ExhibitionVehiclesForm";
import { useStoreExhibitionVehicles } from "@/features/ap/comercial/vehiculos-exhibicion/lib/exhibitionVehicles.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddExhibitionVehiclesPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const navigate = useNavigate();
  const { MODEL, ROUTE } = EXHIBITION_VEHICLES;
  const storeMutation = useStoreExhibitionVehicles();

  const handleSubmit = (data: any) => {
    storeMutation.mutate(data, {
      onSuccess: () => {
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
        navigate(ROUTE);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || "";
        errorToast(ERROR_MESSAGE(MODEL, "create", msg));
      },
    });
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={`Agregar ${MODEL}`}
          subtitle={`Crear un nuevo ${MODEL.toLowerCase()}`}
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      <div className="bg-white rounded-lg border p-6">
        <ExhibitionVehiclesForm
          defaultValues={{}}
          onSubmit={handleSubmit}
          isSubmitting={storeMutation.isPending}
          mode="create"
        />
      </div>
    </div>
  );
}
