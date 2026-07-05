"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import {
  findModelsVnById,
  storeModelsVn,
} from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.actions";
import { ModelsVnSchema } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ModelsVnForm } from "@/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelsVnForm";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import { MODELS_VN } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.constanst";
import { notFound } from "@/shared/hooks/useNotFound";
import PageWrapper from "@/shared/components/PageWrapper";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

export default function AddModelsVnPage() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get("duplicate");
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = MODELS_VN;

  const { data: duplicateFrom, isLoading: loadingDuplicateFrom } = useQuery({
    queryKey: [MODELS_VN.QUERY_KEY, "duplicate", duplicateId],
    queryFn: () => findModelsVnById(Number(duplicateId)),
    enabled: !!duplicateId,
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: storeModelsVn,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ModelsVnSchema) => {
    mutate(data);
  };

  function mapModelsVnToDuplicateForm(
    data: ModelsVnResource,
  ): Partial<ModelsVnSchema> {
    return {
      code: "",
      brand_id: String(data.brand_id),
      family_id: String(data.family_id),
      version: data.version,
      class_id: String(data.class_id),
      fuel_id: String(data.fuel_id),
      power: data.power,
      model_year: String(data.model_year),
      wheelbase: data.wheelbase,
      axles_number: data.axles_number,
      vehicle_type_id: String(data.vehicle_type_id),
      body_type_id: String(data.body_type_id),
      traction_type_id: String(data.traction_type_id),
      transmission_id: String(data.transmission_id),
      width: data.width,
      length: data.length,
      height: data.height,
      seats_number: Number(data.seats_number),
      doors_number: Number(data.doors_number),
      net_weight: data.net_weight,
      gross_weight: data.gross_weight,
      payload: data.payload,
      displacement: data.displacement,
      cylinders_number: Number(data.cylinders_number),
      passengers_number: Number(data.passengers_number),
      wheels_number: Number(data.wheels_number),
      distributor_price: Number(data.distributor_price),
      transport_cost: Number(data.transport_cost),
      other_amounts: Number(data.other_amounts),
      purchase_discount: Number(data.purchase_discount),
      igv_amount: Number(data.igv_amount),
      total_purchase_excl_igv: Number(data.total_purchase_excl_igv),
      total_purchase_incl_igv: Number(data.total_purchase_incl_igv),
      sale_price: Number(data.sale_price),
      currency_type_id: String(data.currency_type_id),
      margin: Number(data.margin),
      type_operation_id: String(CM_COMERCIAL_ID),
    };
  }

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  if (duplicateId && (loadingDuplicateFrom || !duplicateFrom)) {
    return <FormSkeleton />;
  }

  return (
    <PageWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <ModelsVnForm
        defaultValues={
          duplicateFrom
            ? mapModelsVnToDuplicateForm(duplicateFrom)
            : {
                code: "",
                version: "",
                power: "",
                model_year: String(new Date().getFullYear()),
                wheelbase: "",
                axles_number: "",
                width: "",
                length: "",
                height: "",
                seats_number: undefined,
                doors_number: undefined,
                net_weight: "",
                gross_weight: "",
                payload: "",
                displacement: "",
                cylinders_number: undefined,
                passengers_number: undefined,
                wheels_number: undefined,
                distributor_price: 0.0,
                transport_cost: 370,
                other_amounts: 0.0,
                purchase_discount: 7,
                igv_amount: 0.0,
                total_purchase_excl_igv: 0.0,
                total_purchase_incl_igv: 0.0,
                sale_price: 0.0,
                margin: 7,
                family_id: "",
                class_id: "",
                fuel_id: "",
                vehicle_type_id: "",
                body_type_id: "",
                traction_type_id: "",
                transmission_id: "",
                currency_type_id: "",
                type_operation_id: String(CM_COMERCIAL_ID),
              }
        }
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </PageWrapper>
  );
}
