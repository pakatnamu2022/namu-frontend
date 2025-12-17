"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  findModelsVnById,
  updateModelsVn,
} from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.actions";
import { ModelsVnSchema } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import { ModelsVnForm } from "@/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelsVnForm";
import FormWrapper from "@/shared/components/FormWrapper";
import { MODELS_VN_POSTVENTA } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.constanst";
import { notFound } from "@/shared/hooks/useNotFound";
import { CM_POSTVENTA_ID } from "@/core/core.constants";

export default function UpdateModelsVnPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { QUERY_KEY, MODEL, ABSOLUTE_ROUTE, ROUTE } = MODELS_VN_POSTVENTA;

  const { data: ModelsVn, isLoading: loadingModelsVn } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findModelsVnById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ModelsVnSchema) => updateModelsVn(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: () => {
      errorToast(ERROR_MESSAGE(MODEL, "update"));
    },
  });

  const handleSubmit = (data: ModelsVnSchema) => {
    mutate(data);
  };

  function mapModelsVnToForm(data: ModelsVnResource): Partial<ModelsVnSchema> {
    return {
      code: data.code,
      brand_id: String(data.brand_id),
      family_id: String(data.family_id),
      version: data.version,
      class_id: String(data.class_id),
      fuel_id: String(data.fuel_id),
      power: data.power || "0",
      model_year: data.model_year,
      wheelbase: data.wheelbase || "0",
      axles_number: data.axles_number || "0",
      vehicle_type_id: String(data.vehicle_type_id),
      body_type_id: String(data.body_type_id),
      traction_type_id: String(data.traction_type_id),
      transmission_id: String(data.transmission_id),
      width: data.width || "0",
      length: data.length || "0",
      height: data.height || "0",
      seats_number: data.seats_number || "0",
      doors_number: data.doors_number,
      net_weight: data.net_weight || "0",
      gross_weight: data.gross_weight || "0",
      payload: data.payload || "0",
      displacement: data.displacement || "0",
      cylinders_number: data.cylinders_number || "0",
      passengers_number: data.passengers_number,
      wheels_number: data.wheels_number,
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
      type_operation_id: String(CM_POSTVENTA_ID),
    };
  }

  const isLoadingAny = loadingModelsVn || !ModelsVn;

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
      <ModelsVnForm
        defaultValues={mapModelsVnToForm(ModelsVn)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
