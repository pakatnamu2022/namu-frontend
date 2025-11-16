"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { AssignBrandConsultantSchema } from "@/features/ap/configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { AssignBrandConsultantForm } from "@/features/ap/configuraciones/ventas/asignar-marca/components/assignBrandConsultantForm";
import { storeAssignBrandConsultant } from "@/features/ap/configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.actions";
import { useInvalidateQuery } from "@/core/core.hook";
import BackButton from "@/shared/components/BackButton";
import FormWrapper from "@/shared/components/FormWrapper";
import { ASSIGN_BRAND_CONSULTANT } from "@/features/ap/configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import NotFound from '@/app/not-found';


export default function CreateAssignBrandConsultantPage() {
  
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const { currentView, checkRouteExists } = useCurrentModule();
  const invalidateQueryKey = useInvalidateQuery();
  const { QUERY_KEY, ROUTE, MODEL } = ASSIGN_BRAND_CONSULTANT;

  const { mutate, isPending } = useMutation({
    mutationFn: storeAssignBrandConsultant,
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      invalidateQueryKey(QUERY_KEY);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = async (data: AssignBrandConsultantSchema) => {
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
        <BackButton route={"./"} name={"Asignar Marca"} fullname={false} />
      </HeaderTableWrapper>
      <AssignBrandConsultantForm
        defaultValues={{
          year: year,
          month: month,
          sede_id: "",
          brand_id: "",
          sales_target: 0,
          worker_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
