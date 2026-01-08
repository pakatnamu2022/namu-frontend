import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { DOCUMENT_TYPE } from "../lib/documentTypes.constants";
import { useDocumentTypeById } from "../lib/documentTypes.hook";
import { DocumentTypeResource } from "../lib/documentTypes.interface";
import { DocumentTypeSchema } from "../lib/documentTypes.schema";
import {
  storeDocumentType,
  updateDocumentType,
} from "../lib/documentTypes.actions";
import { DocumentTypeForm } from "./DocumentTypesForm";
import { AP_MASTER_TYPE } from "../../../../comercial/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function DocumentTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = DOCUMENT_TYPE;
  const {
    data: DocumentType,
    isLoading: loadingDocumentType,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useDocumentTypeById(id!);

  function mapRoleToForm(
    data: DocumentTypeResource
  ): Partial<DocumentTypeSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_TYPE.DOCUMENT_TYPE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: DocumentTypeSchema) =>
      mode === "create"
        ? storeDocumentType(data)
        : updateDocumentType(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: DocumentTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingDocumentType || !DocumentType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && DocumentType ? (
        <DocumentTypeForm
          defaultValues={mapRoleToForm(DocumentType)}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
