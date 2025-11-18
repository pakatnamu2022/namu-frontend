"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { STORE_VISITS } from "@/features/ap/comercial/visitas-tienda/lib/storeVisits.constants";
import {
  findStoreVisitsById,
  updateStoreVisits,
} from "@/features/ap/comercial/visitas-tienda/lib/storeVisits.actions";
import { StoreVisitsSchema } from "@/features/ap/comercial/visitas-tienda/lib/storeVisits.schema";
import { StoreVisitsResource } from "@/features/ap/comercial/visitas-tienda/lib/storeVisits.interface";
import { StoreVisitsForm } from "@/features/ap/comercial/visitas-tienda/components/StoreVisitsForm";
import { notFound } from "@/shared/hooks/useNotFound";


export default function UpdateStoreVisitsPage() {
    const { id } = useParams();
  const router = useNavigate();
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
      router("../");
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
