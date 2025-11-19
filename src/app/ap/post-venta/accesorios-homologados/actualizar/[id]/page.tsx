"use client";

import { useParams } from "react-router-dom";
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
import { APPROVED_ACCESSORIES } from "@/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.constants";
import {
  findApprovedAccesoriesById,
  updateApprovedAccesories,
} from "@/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.actions";
import { ApprovedAccesoriesSchema } from "@/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.schema";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.interface";
import { ApprovedAccesoriesForm } from "@/features/ap/post-venta/accesorios-homologados/components/ApprovedAccessoriesForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateApprovedAccesoriesPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = APPROVED_ACCESSORIES;

  const { data: ApprovedAccesories, isLoading: loadingApprovedAccesories } =
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => findApprovedAccesoriesById(Number(id)),
      refetchOnWindowFocus: false,
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ApprovedAccesoriesSchema) =>
      updateApprovedAccesories(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: ApprovedAccesoriesSchema) => {
    mutate(data);
  };

  function mapApprovedAccesoriesToForm(
    data: ApprovedAccesoriesResource
  ): Partial<ApprovedAccesoriesSchema> {
    return {
      code: data.code,
      type: data.type,
      description: data.description,
      price: data.price,
      body_type_id: String(data.body_type_id),
      type_currency_id: String(data.type_currency_id),
    };
  }

  const isLoadingAny = loadingApprovedAccesories || !ApprovedAccesories;

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
      <ApprovedAccesoriesForm
        defaultValues={mapApprovedAccesoriesToForm(ApprovedAccesories)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
