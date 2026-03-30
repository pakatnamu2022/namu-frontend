"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { CustomersSchema } from "../lib/customers.schema";
import { storeCustomers } from "../lib/customers.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";

import { CUSTOMERS } from "../lib/customers.constants";
import { CustomersResource } from "../lib/customers.interface";
import { EMPRESA_AP, TYPE_BUSINESS_PARTNERS } from "@/core/core.constants";
import { CustomersPvForm } from "@/features/ap/post-venta/taller/clientes-post-venta/components/CustomersPvForm";

interface Props {
  open: boolean;
  onClose: (newCustomer?: CustomersResource) => void;
  title: string;
}

const { QUERY_KEY, MODEL } = CUSTOMERS;

export default function CustomerModal({ open, onClose, title }: Props) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CustomersSchema) => storeCustomers(data as any),
    onSuccess: async (newCustomer) => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onClose(newCustomer);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: CustomersSchema) => {
    mutate(data);
  };

  return (
    <GeneralModal
      size="4xl"
      open={open}
      onClose={() => onClose()}
      title={title}
    >
      {open ? (
        <CustomersPvForm
          defaultValues={{
            company_id: EMPRESA_AP.id,
            type: TYPE_BUSINESS_PARTNERS.CLIENTE,
          }}
          onCancel={() => onClose()}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode="create"
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
