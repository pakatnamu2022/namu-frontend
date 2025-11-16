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
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { EMPRESA_AP } from "@/src/core/core.constants";
import { SUPPLIERS } from "@/src/features/ap/comercial/proveedores/lib/suppliers.constants";
import { storeSuppliers } from "@/src/features/ap/comercial/proveedores/lib/suppliers.actions";
import { SuppliersSchema } from "@/src/features/ap/comercial/proveedores/lib/suppliers.schema";
import { SuppliersForm } from "@/src/features/ap/comercial/proveedores/components/SuppliersForm";

export default function CreateSuppliersPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = SUPPLIERS;

  const { mutate, isPending } = useMutation({
    mutationFn: storeSuppliers,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: SuppliersSchema) => {
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
      <SuppliersForm
        defaultValues={{
          first_name: "",
          middle_name: "",
          paternal_surname: "",
          maternal_surname: "",
          full_name: "",
          num_doc: "",
          direction: "",
          email: "",
          secondary_email: "",
          phone: "",
          secondary_phone: "",
          secondary_phone_contact_name: "",
          supplier_tax_class_id: "",
          type_person_id: "",
          district_id: "",
          document_type_id: "",
          person_segment_id: "",
          company_id: EMPRESA_AP.id,
          type: "",
          company_status: "",
          company_condition: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
