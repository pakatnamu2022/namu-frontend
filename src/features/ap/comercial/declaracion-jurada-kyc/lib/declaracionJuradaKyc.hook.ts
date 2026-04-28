import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DECLARACION_JURADA_KYC } from "./declaracionJuradaKyc.constants";
import {
  CustomerKycDeclarationRequest,
  CustomerKycDeclarationResponse,
  CustomerKycDeclarationResource,
} from "./declaracionJuradaKyc.interface";
import {
  confirmLegalReview,
  deleteCustomerKycDeclaration,
  findCustomerKycDeclarationById,
  getCustomerKycDeclarations,
  rejectLegalReview,
  storeCustomerKycDeclaration,
  updateCustomerKycDeclaration,
  uploadSignedKycDeclaration,
} from "./declaracionJuradaKyc.actions";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";

const { QUERY_KEY, MODEL } = DECLARACION_JURADA_KYC;

export const useCustomerKycDeclarations = (params?: Record<string, any>) => {
  return useQuery<CustomerKycDeclarationResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getCustomerKycDeclarations({ params }),
  });
};

export const useCustomerKycDeclarationById = (id: number) => {
  return useQuery<CustomerKycDeclarationResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCustomerKycDeclarationById(id),
    refetchOnWindowFocus: false,
    enabled: !!id && id > 0,
  });
};

export const useStoreCustomerKycDeclaration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storeCustomerKycDeclaration,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });
};

export const useUpdateCustomerKycDeclaration = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CustomerKycDeclarationRequest>) =>
      updateCustomerKycDeclaration(id, data),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });
};

export const useDeleteCustomerKycDeclaration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomerKycDeclaration,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });
};

export const useUploadSignedKycDeclaration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      uploadSignedKycDeclaration(id, file),
    onSuccess: () => {
      successToast("PDF firmado subido correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al subir el PDF firmado${msg ? `: ${msg}` : ""}`);
    },
  });
};

export const useConfirmLegalReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comments }: { id: number; comments?: string }) =>
      confirmLegalReview(id, comments ? { comments } : undefined),
    onSuccess: () => {
      successToast("Revisión legal confirmada correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al confirmar la revisión legal${msg ? `: ${msg}` : ""}`);
    },
  });
};

export const useRejectLegalReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comments }: { id: number; comments: string }) =>
      rejectLegalReview(id, { comments }),
    onSuccess: () => {
      successToast("Revisión legal rechazada");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al rechazar la revisión legal${msg ? `: ${msg}` : ""}`);
    },
  });
};
