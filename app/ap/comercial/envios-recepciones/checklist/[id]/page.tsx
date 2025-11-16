"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import { SHIPMENTS_RECEPTIONS } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.constants";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { ReceptionChecklistSchema } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.schema";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReceptionChecklistById,
  updateReceptionChecklist,
} from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.actions";
import { ReceptionChecklistForm } from "@/features/ap/comercial/envios-recepciones/components/ReceptionChecklistForm";
import NotFound from "@/app/not-found";


export default function ReceptionChecklistPage() {
  
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL } = SHIPMENTS_RECEPTIONS;

  const { data: ShipmentsReceptions, isLoading: loadingShipmentsReceptions } =
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => getReceptionChecklistById(Number(id)),
      refetchOnWindowFocus: false,
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ReceptionChecklistSchema) =>
      updateReceptionChecklist(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router("../");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: ReceptionChecklistSchema) => {
    mutate(data);
  };

  const isLoadingAny = loadingShipmentsReceptions || !ShipmentsReceptions;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <div className="space-y-4">
        <TitleFormComponent
          title={`Actualizar ${MODEL.name}`}
          icon={currentView?.icon || "FileText"}
        />
        <ReceptionChecklistForm
          shippingGuideId={Number(id)}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          onCancel={() => router("../")}
        />
      </div>
    </FormWrapper>
  );
}
