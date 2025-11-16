"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  findClassArticleById,
  updateClassArticle,
} from "@/src/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.actions";
import { ClassArticleSchema } from "@/src/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { ClassArticleResource } from "@/src/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.interface";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { ClassArticleForm } from "@/src/features/ap/configuraciones/maestros-general/clase-articulo/components/ClassArticleForm";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { CLASS_ARTICLE } from "@/src/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.constants";

const { MODEL, QUERY_KEY, ROUTE } = CLASS_ARTICLE;

export default function EditClassArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: ClassArticle, isLoading: loadingClassArticle } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findClassArticleById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ClassArticleSchema) =>
      updateClassArticle(Number(id), data),
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

  const handleSubmit = (data: ClassArticleSchema) => {
    mutate(data);
  };

  function mapClassArticleToForm(
    data: ClassArticleResource
  ): Partial<ClassArticleSchema> {
    return {
      dyn_code: data.dyn_code,
      description: data.description,
      account: data.account,
      type: data.type,
    };
  }

  const isLoadingAny = loadingClassArticle || !ClassArticle;

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
      <ClassArticleForm
        defaultValues={mapClassArticleToForm(ClassArticle)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
