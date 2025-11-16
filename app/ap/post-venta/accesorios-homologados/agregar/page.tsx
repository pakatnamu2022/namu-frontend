"use client";

import { notFound, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { APPROVED_ACCESSORIES } from "@/src/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.constants";
import { storeApprovedAccesories } from "@/src/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.actions";
import { ApprovedAccesoriesSchema } from "@/src/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.schema";
import { ApprovedAccesoriesForm } from "@/src/features/ap/post-venta/accesorios-homologados/components/ApprovedAccessoriesForm";

export default function CreateApprovedAccesoriesPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = APPROVED_ACCESSORIES;

  const { mutate, isPending } = useMutation({
    mutationFn: storeApprovedAccesories,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ApprovedAccesoriesSchema) => {
    mutate(data);
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
