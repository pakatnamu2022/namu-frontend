"use client";

import { useNavigate } from 'react-router-dom';
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { APPROVED_ACCESSORIES } from "@/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.constants";
import { storeApprovedAccesories } from "@/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.actions";
import { ApprovedAccesoriesSchema } from "@/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.schema";
import { ApprovedAccesoriesForm } from "@/features/ap/post-venta/accesorios-homologados/components/ApprovedAccessoriesForm";
import NotFound from '@/app/not-found';


export default function AddApprovedAccesoriesPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = APPROVED_ACCESSORIES;

  const { mutate, isPending } = useMutation({
    mutationFn: storeApprovedAccesories,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ApprovedAccesoriesSchema) => {
    mutate(data);
  };
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <ApprovedAccesoriesForm
        defaultValues={{
          code: "",
          type: "SERVICIO",
          description: "",
          price: 0,
          body_type_id: "",
          type_currency_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
