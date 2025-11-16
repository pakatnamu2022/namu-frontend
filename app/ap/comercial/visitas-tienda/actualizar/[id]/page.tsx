"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { STORE_VISITS } from "@/src/features/ap/comercial/visitas-tienda/lib/storeVisits.constants";
import {
  findStoreVisitsById,
  updateStoreVisits,
} from "@/src/features/ap/comercial/visitas-tienda/lib/storeVisits.actions";
import { StoreVisitsSchema } from "@/src/features/ap/comercial/visitas-tienda/lib/storeVisits.schema";
import { StoreVisitsResource } from "@/src/features/ap/comercial/visitas-tienda/lib/storeVisits.interface";
import { StoreVisitsForm } from "@/src/features/ap/comercial/visitas-tienda/components/StoreVisitsForm";

export default function EditStoreVisitsPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL } = STORE_VISITS;

  const { data: StoreVisits, isLoading: loadingStoreVisits } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findStoreVisitsById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: StoreVisitsSchema) =>
      updateStoreVisits(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router.push("../");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: StoreVisitsSchema) => {
    mutate(data);
  };

  function mapStoreVisitsToForm(
    data: StoreVisitsResource
  ): Partial<StoreVisitsSchema> {
    return {
      num_doc: data.num_doc,
      full_name: data.full_name,
      phone: data.phone || "",
      email: data.email || "",
      campaign: data.campaign,
      sede_id: String(data.sede_id),
      worker_id: String(data.worker_id),
      vehicle_brand_id: String(data.vehicle_brand_id),
      document_type_id: String(data.document_type_id),
      income_sector_id: String(data.income_sector_id),
      type: data.type,
      area_id: data.area_id ? String(data.area_id) : "",
    };
  }

  const isLoadingAny = loadingStoreVisits || !StoreVisits;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <StoreVisitsForm
        defaultValues={mapStoreVisitsToForm(StoreVisits)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
