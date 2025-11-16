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
import { storeClassArticle } from "@/src/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.actions";
import { ClassArticleSchema } from "@/src/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.schema";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { ClassArticleForm } from "@/src/features/ap/configuraciones/maestros-general/clase-articulo/components/ClassArticleForm";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { CLASS_ARTICLE } from "@/src/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.constants";

const { MODEL, ROUTE } = CLASS_ARTICLE;

export default function CreateClassArticlePage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeClassArticle,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ClassArticleSchema) => {
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
      <ClassArticleForm
        defaultValues={{
          dyn_code: "",
          description: "",
          account: "",
          type: "VEHICULO",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
