"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.actions";
import { ClassArticleSchema } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { ClassArticleForm } from "@/features/ap/configuraciones/maestros-general/clase-articulo/components/ClassArticleForm";
import FormWrapper from "@/shared/components/FormWrapper";
import { CLASS_ARTICLE } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.constants";
import NotFound from "@/app/not-found";

const { MODEL, ROUTE } = CLASS_ARTICLE;

export default function CreateClassArticlePage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeClassArticle,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ClassArticleSchema) => {
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
      <ClassArticleForm
        defaultValues={{
          dyn_code: "",
          description: "",
          account: "",
          type_operation_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
