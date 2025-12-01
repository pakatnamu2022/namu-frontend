import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PRODUCT_TRANSFER } from "./productTransfer.constants";
import {
  ProductTransferRequest,
  ProductTransferResource,
  ProductTransferResponse,
} from "./productTransfer.interface";
import {
  deleteProductTransfer,
  findProductTransferById,
  getAllProductTransfers,
  getProductTransfers,
  storeProductTransfer,
  updateProductTransfer,
} from "./productTransfer.actions";
import { toast } from "sonner";
import {
  sendShippingGuideToNubefact,
  queryShippingGuideFromNubefact,
} from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.actions";
import { successToast, errorToast } from "@/core/core.function";

const { QUERY_KEY } = PRODUCT_TRANSFER;

// Hooks para transferencias de productos
export const useProductTransfers = (params?: Record<string, any>) => {
  return useQuery<ProductTransferResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getProductTransfers({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllProductTransfers = (params?: Record<string, any>) => {
  return useQuery<ProductTransferResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllProductTransfers({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useProductTransferById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findProductTransferById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};

// Mutations para transferencias de productos
export const useCreateProductTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductTransferRequest) =>
      storeProductTransfer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateProductTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ProductTransferRequest;
    }) => updateProductTransfer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useDeleteProductTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProductTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Transferencia de producto eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Error al eliminar la transferencia de producto"
      );
    },
  });
};

// Hook para enviar a Nubefact (reutilizando el mismo endpoint que ShipmentsReceptions)
export const useSendShippingGuideToNubefact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sendShippingGuideToNubefact(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

      if (response.success) {
        successToast(response.message);
      } else {
        errorToast(
          response.message || "Error al enviar la guía de remisión a Nubefact"
        );
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al enviar la guía de remisión a Nubefact";

      errorToast(errorMessage);

      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          errorToast(`${key}: ${errors[key].join(", ")}`);
        });
      }
    },
  });
};

// Hook para consultar estado en Nubefact (reutilizando el mismo endpoint que ShipmentsReceptions)
export const useQueryShippingGuideFromNubefact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => queryShippingGuideFromNubefact(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

      if (response.success) {
        successToast(response.message);
      } else {
        errorToast(
          response.message || "Error al consultar el estado de la guía"
        );
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al consultar el estado de la guía";

      errorToast(errorMessage);

      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          errorToast(`${key}: ${errors[key].join(", ")}`);
        });
      }
    },
  });
};
