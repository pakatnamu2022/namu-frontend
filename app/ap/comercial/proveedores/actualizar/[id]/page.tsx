"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { SUPPLIERS } from "@/src/features/ap/comercial/proveedores/lib/suppliers.constants";
import {
  findSuppliersById,
  updateSuppliers,
} from "@/src/features/ap/comercial/proveedores/lib/suppliers.actions";
import { SuppliersSchema } from "@/src/features/ap/comercial/proveedores/lib/suppliers.schema";
import { SuppliersResource } from "@/src/features/ap/comercial/proveedores/lib/suppliers.interface";
import { SuppliersForm } from "@/src/features/ap/comercial/proveedores/components/SuppliersForm";

export default function EditSuppliersPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL } = SUPPLIERS;

  const { data: Suppliers, isLoading: loadingSuppliers } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findSuppliersById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SuppliersSchema) => updateSuppliers(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router.push("../");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: SuppliersSchema) => {
    mutate(data);
  };

  function mapSuppliersToForm(
    data: SuppliersResource
  ): Partial<SuppliersSchema> {
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

  const isLoadingAny = loadingSuppliers || !Suppliers;

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
      <SuppliersForm
        defaultValues={mapSuppliersToForm(Suppliers)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
