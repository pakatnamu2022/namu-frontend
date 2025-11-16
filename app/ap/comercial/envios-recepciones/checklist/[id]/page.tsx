"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { SHIPMENTS_RECEPTIONS } from "@/src/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.constants";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { ReceptionChecklistSchema } from "@/src/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.schema";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReceptionChecklistById,
  updateReceptionChecklist,
} from "@/src/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.actions";
import { ReceptionChecklistForm } from "@/src/features/ap/comercial/envios-recepciones/components/ReceptionChecklistForm";

export default function ReceptionChecklistPage() {
  const { id } = useParams();
  const router = useRouter();
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
      router.push("../");
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
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

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
          onCancel={() => router.push("../")}
        />
      </div>
    </FormWrapper>
  );
}
