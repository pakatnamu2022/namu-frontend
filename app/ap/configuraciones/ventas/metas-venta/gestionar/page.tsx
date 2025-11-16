"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { useInvalidateQuery } from "@/src/core/core.hook";
import BackButton from "@/src/shared/components/BackButton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { AP_GOAL_SELL_OUT_IN } from "@/src/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.constants";
import { storeApGoalSellOutIn } from "@/src/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.actions";
import { ApGoalSellOutInSchema } from "@/src/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.schema";
import { ApGoalSellOutInForm } from "@/src/features/ap/configuraciones/ventas/metas-venta/components/ApGoalSellOutInForm";

export default function CreateApGoalSellOutInPage() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const { currentView, checkRouteExists } = useCurrentModule();
  const invalidateQueryKey = useInvalidateQuery();
  const { QUERY_KEY, ROUTE, MODEL } = AP_GOAL_SELL_OUT_IN;

  const { mutate, isPending } = useMutation({
    mutationFn: storeApGoalSellOutIn,
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      invalidateQueryKey(QUERY_KEY);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = async (data: ApGoalSellOutInSchema) => {
    mutate(data);
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <TitleFormComponent
          title={currentView.descripcion}
          mode="create"
          icon={currentView.icon}
        ></TitleFormComponent>
        <BackButton route={"./"} name={"Asignar Meta"} fullname={false} />
      </HeaderTableWrapper>
      <ApGoalSellOutInForm
        defaultValues={{
          year: year,
          month: month,
          goal: 0,
          type: "IN",
          brand_id: "",
          shop_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
