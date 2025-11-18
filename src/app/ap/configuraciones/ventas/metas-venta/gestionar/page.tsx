"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useInvalidateQuery } from "@/core/core.hook";
import BackButton from "@/shared/components/BackButton";
import FormWrapper from "@/shared/components/FormWrapper";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { AP_GOAL_SELL_OUT_IN } from "@/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.constants";
import { storeApGoalSellOutIn } from "@/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.actions";
import { ApGoalSellOutInSchema } from "@/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.schema";
import { ApGoalSellOutInForm } from "@/features/ap/configuraciones/ventas/metas-venta/components/ApGoalSellOutInForm";
import NotFound from "@/app/not-found";

export default function CreateApGoalSellOutInPage() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const { currentView, checkRouteExists } = useCurrentModule();
  const invalidateQueryKey = useInvalidateQuery();
  const { QUERY_KEY, ROUTE, MODEL, ABSOLUTE_ROUTE } = AP_GOAL_SELL_OUT_IN;

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

  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <TitleFormComponent
          title={currentView.descripcion}
          mode="create"
          icon={currentView.icon}
        ></TitleFormComponent>
        <BackButton
          route={ABSOLUTE_ROUTE!}
          name={"Asignar Meta"}
          fullname={false}
        />
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
