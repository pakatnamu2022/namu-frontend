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
import { STORE_VISITS } from "@/src/features/ap/comercial/visitas-tienda/lib/storeVisits.constants";
import { storeStoreVisits } from "@/src/features/ap/comercial/visitas-tienda/lib/storeVisits.actions";
import { StoreVisitsSchema } from "@/src/features/ap/comercial/visitas-tienda/lib/storeVisits.schema";
import { StoreVisitsForm } from "@/src/features/ap/comercial/visitas-tienda/components/StoreVisitsForm";
import { BUSINESS_PARTNERS, INCOME_SECTOR } from "@/src/core/core.constants";

export default function CreateStoreVisitsPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = STORE_VISITS;

  const { mutate, isPending } = useMutation({
    mutationFn: storeStoreVisits,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: StoreVisitsSchema) => {
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
      <StoreVisitsForm
        defaultValues={{
          num_doc: "",
          full_name: "",
          phone: "",
          email: "",
          campaign: "",
          sede_id: "",
          vehicle_brand_id: "",
          document_type_id: BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID,
          type: "",
          income_sector_id: INCOME_SECTOR.SHOWROOM_ID,
          area_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
