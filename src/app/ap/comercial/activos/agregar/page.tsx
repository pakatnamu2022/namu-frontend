"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { ASSETS } from "@/features/ap/comercial/activos/lib/assets.constants";
import { AssetForm } from "@/features/ap/comercial/activos/components/AssetForm";
import { AssetSchema } from "@/features/ap/comercial/activos/lib/assets.schema";
import { useCreateAsset } from "@/features/ap/comercial/activos/lib/assets.hook";

export default function AddAssetPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = ASSETS;

  const { mutate, isPending } = useCreateAsset();

  const handleSubmit = (data: AssetSchema) => {
    mutate(
      {
        ap_vehicle_id: Number(data.ap_vehicle_id),
        worker_id: Number(data.worker_id),
        observation: data.observation || undefined,
      },
      {
        onSuccess: () => {
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          router(ABSOLUTE_ROUTE!);
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || "";
          errorToast(ERROR_MESSAGE(MODEL, "create", msg));
        },
      },
    );
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <AssetForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </FormWrapper>
  );
}
