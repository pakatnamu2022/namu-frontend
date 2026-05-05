"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import { CONTROL_UNITS } from "@/features/ap/comercial/control-unidades/lib/controlUnits.constants";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { ControlUnitsForm } from "@/features/ap/comercial/control-unidades/components/ControlUnitsForm";
import { ControlUnitsSchema } from "@/features/ap/comercial/control-unidades/lib/controlUnits.schema";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  findControlUnitsById,
  updateControlUnits,
} from "@/features/ap/comercial/control-unidades/lib/controlUnits.actions";
import { ControlUnitsResource } from "@/features/ap/comercial/control-unidades/lib/controlUnits.interface";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

export default function UpdateControlUnitsPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = CONTROL_UNITS;
  const { setOpen, setOpenMobile } = useSidebar();

  const { data: ControlUnits, isLoading: loadingControlUnits } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findControlUnitsById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ControlUnitsSchema) =>
      updateControlUnits(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: ControlUnitsSchema) => {
    mutate(data);
  };

  function mapControlUnitsToForm(
    data: ControlUnitsResource,
  ): Partial<ControlUnitsSchema> & {
    transmitter_establishment?: any;
    receiver_establishment?: any;
  } {
    return {
      ap_vehicle_id: String(data.ap_vehicle_id) || "",
      document_type: data.document_type || "",
      issuer_type: data.issuer_type || "",
      document_series_id: String(data.document_series_id) || "",
      series: String(data.series) || "",
      correlative: String(data.correlative) || "",
      issue_date: data.issue_date ? new Date(data.issue_date) : undefined,
      sede_transmitter_id: String(data.sede_transmitter_id) || "",
      sede_receiver_id: String(data.sede_receiver_id) || "",
      transmitter_origin_id: data.transmitter_origin_id
        ? String(data.transmitter_origin_id)
        : undefined,
      receiver_destination_id: data.receiver_destination_id
        ? String(data.receiver_destination_id)
        : undefined,
      transmitter_id: data.transmitter_id ? String(data.transmitter_id) : "",
      receiver_id: data.receiver_id ? String(data.receiver_id) : "",
      total_packages: data.total_packages?.toString() || "0",
      total_weight: data.total_weight?.toString() || "0",
      transport_company_id: String(data.transport_company_id) || "",
      driver_doc: data.driver_doc || "",
      license: data.license || "",
      plate: data.plate || "",
      driver_name: data.driver_name || "",
      notes: data.notes || "",
      transfer_reason_id: String(data.transfer_reason_id) || "",
      transfer_modality_id: String(data.transfer_modality_id) || "",
      transmitter_establishment: data.transmitter_establishment,
      receiver_establishment: data.receiver_establishment,
      ap_class_article_id: data.ap_class_article_id
        ? String(data.ap_class_article_id)
        : "",
    };
  }

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const isLoadingAny = loadingControlUnits || !ControlUnits;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <div className="space-y-4">
        <TitleFormComponent
          title={MODEL.name}
          icon={currentView?.icon || "FileText"}
        />
        <ControlUnitsForm
          key={`control-units-form-${id}`}
          defaultValues={mapControlUnitsToForm(ControlUnits)}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode="update"
        />
      </div>
    </FormWrapper>
  );
}
