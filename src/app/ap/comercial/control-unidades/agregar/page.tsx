"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { CONTROL_UNITS } from "@/features/ap/comercial/control-unidades/lib/controlUnits.constants";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { ControlUnitsForm } from "@/features/ap/comercial/control-unidades/components/ControlUnitsForm";
import { useCreateControlUnits } from "@/features/ap/comercial/control-unidades/lib/controlUnits.hook";
import { ControlUnitsSchema } from "@/features/ap/comercial/control-unidades/lib/controlUnits.schema";
import { notFound } from "@/shared/hooks/useNotFound";
import PageWrapper from "@/shared/components/PageWrapper";

export default function AddControlUnitsPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = CONTROL_UNITS;

  const createMutation = useCreateControlUnits();

  const handleSubmit = (data: ControlUnitsSchema) => {
    createMutation.mutate(data as any, {
      onSuccess: () => {
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
        router(ABSOLUTE_ROUTE);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || "";
        errorToast(ERROR_MESSAGE(MODEL, "create", msg));
      },
    });
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE);
  };

  if (!checkRouteExists(ROUTE)) notFound();

  return (
    <PageWrapper>
      <div className="space-y-4">
        <TitleFormComponent
          title={MODEL.name}
          icon={currentView?.icon || "FileText"}
        />
        <ControlUnitsForm
          defaultValues={{
            document_type: "GUIA_REMISION",
            issuer_type: "",
            document_series_id: "",
            series: "",
            correlative: "",
            issue_date: "",
            transmitter_origin_id: "",
            receiver_destination_id: "",
            transmitter_id: "",
            receiver_id: "",
            driver_doc: "",
            license: "",
            plate: "",
            total_packages: "1",
            total_weight: "0",
            transport_company_id: "",
            driver_name: "",
            notes: "",
            transfer_reason_id: "",
            transfer_modality_id: "",
            ap_class_article_id: "",
          }}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          mode="create"
          onCancel={handleCancel}
        />
      </div>
    </PageWrapper>
  );
}
