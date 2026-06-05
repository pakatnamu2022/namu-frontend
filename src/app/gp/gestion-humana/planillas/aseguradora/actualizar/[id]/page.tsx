"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { INSURER } from "@/features/gp/gestionhumana/planillas/aseguradora/lib/insurer.constants";
import { updateInsurer } from "@/features/gp/gestionhumana/planillas/aseguradora/lib/insurer.actions";
import { useInsurerById } from "@/features/gp/gestionhumana/planillas/aseguradora/lib/insurer.hook";
import { SuppliersSchema } from "@/features/ap/comercial/proveedores/lib/suppliers.schema";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface";
import { SuppliersForm } from "@/features/ap/comercial/proveedores/components/SuppliersForm";
import { notFound } from "@/shared/hooks/useNotFound";

function mapInsurerToForm(data: SuppliersResource): Partial<SuppliersSchema> {
  return {
    first_name: data.first_name,
    middle_name: data.middle_name || "",
    paternal_surname: data.paternal_surname || "",
    maternal_surname: data.maternal_surname || "",
    full_name: data.full_name || "",
    num_doc: data.num_doc,
    direction: data.direction || "",
    email: data.email,
    secondary_email: data.secondary_email || "",
    phone: data.phone,
    secondary_phone: data.secondary_phone || "",
    secondary_phone_contact_name: data.secondary_phone_contact_name || "",
    supplier_tax_class_id: data.supplier_tax_class_id
      ? String(data.supplier_tax_class_id)
      : "",
    type_person_id: data.type_person_id ? String(data.type_person_id) : "",
    district_id: data.district_id ? String(data.district_id) : "",
    document_type_id: data.document_type_id
      ? String(data.document_type_id)
      : "",
    person_segment_id: data.person_segment_id
      ? String(data.person_segment_id)
      : "",
    company_id: data.company_id,
    company_status: data.company_status || "",
    company_condition: data.company_condition || "",
    type: data.type || "",
  };
}

export default function UpdateInsurerPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = INSURER;

  const { data: insurer, isLoading } = useInsurerById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SuppliersSchema) => updateInsurer(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  if (isLoading || !insurer) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView!.descripcion}
        mode="edit"
        icon={currentView!.icon}
      />
      <SuppliersForm
        defaultValues={mapInsurerToForm(insurer)}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
