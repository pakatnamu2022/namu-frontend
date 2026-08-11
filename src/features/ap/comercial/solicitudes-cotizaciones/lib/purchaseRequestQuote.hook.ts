import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PURCHASE_REQUEST_QUOTE } from "./purchaseRequestQuote.constants";
import {
  ConceptDiscountBondResource,
  CreditInsuranceMasterResource,
  DiscountCouponResource,
  DiscountCouponUpdatePayload,
  PurchaseRequestQuoteResource,
  PurchaseRequestQuoteResponse,
} from "./purchaseRequestQuote.interface";
import {
  assignVehicleToPurchaseRequestQuote,
  findPurchaseRequestQuoteById,
  getAllConceptDiscountBond,
  getAllCreditEntities,
  getAllPurchaseRequestQuote,
  getConceptDiscountBondDescriptions,
  getCreditEntities,
  getCreditTypes,
  getDiscountCouponsByQuote,
  getInsuranceEntities,
  getPurchaseRequestQuote,
  swapVehicleInPurchaseRequestQuote,
  updateDiscountCoupon,
} from "./purchaseRequestQuote.actions";

const DISCOUNT_COUPON_QUERY_KEY = "discountCoupons";

const { QUERY_KEY } = PURCHASE_REQUEST_QUOTE;

export const usePurchaseRequestQuote = (params?: Record<string, any>) => {
  return useQuery<PurchaseRequestQuoteResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPurchaseRequestQuote({ params }),
  });
};

export const useAllPurchaseRequestQuote = (params?: Record<string, any>) => {
  return useQuery<PurchaseRequestQuoteResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllPurchaseRequestQuote({ params }),
  });
};

export const useAllConceptDiscountBond = (params?: Record<string, any>) => {
  return useQuery<ConceptDiscountBondResource[]>({
    queryKey: [QUERY_KEY + "_CONCEPT_DISCOUNT_BOND", params],
    queryFn: () => getAllConceptDiscountBond({ params }),
  });
};

export const useConceptDiscountBondDescriptions = (
  parentId?: number | string,
) => {
  return useQuery<ConceptDiscountBondResource[]>({
    queryKey: [QUERY_KEY + "_CONCEPT_DISCOUNT_BOND_DESCRIPTION", parentId],
    queryFn: () =>
      getConceptDiscountBondDescriptions({ parentId: parentId as number }),
    enabled: !!parentId,
  });
};

export const useCreditTypes = () => {
  return useQuery<CreditInsuranceMasterResource[]>({
    queryKey: [QUERY_KEY + "_CREDIT_TYPE"],
    queryFn: () => getCreditTypes(),
  });
};

export const useCreditEntities = (parentId?: number | string) => {
  return useQuery<CreditInsuranceMasterResource[]>({
    queryKey: [QUERY_KEY + "_CREDIT_ENTITY", parentId],
    queryFn: () => getCreditEntities({ parentId: parentId as number }),
    enabled: !!parentId,
  });
};

// Lista completa de entidades de crédito (todas, sin filtrar por parent_id),
// usada para etiquetar credit_entity_id en la tabla de listado.
export const useAllCreditEntities = () => {
  return useQuery<CreditInsuranceMasterResource[]>({
    queryKey: [QUERY_KEY + "_CREDIT_ENTITY_ALL"],
    queryFn: () => getAllCreditEntities(),
  });
};

export const useInsuranceEntities = () => {
  return useQuery<CreditInsuranceMasterResource[]>({
    queryKey: [QUERY_KEY + "_INSURANCE_ENTITY"],
    queryFn: () => getInsuranceEntities(),
  });
};

export const usePurchaseRequestQuoteById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPurchaseRequestQuoteById(id),

    enabled: !!id && id > 0,
  });
};

export const useAssignVehicleToPurchaseRequestQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ap_vehicle_id,
    }: {
      id: number;
      ap_vehicle_id: number;
    }) => assignVehicleToPurchaseRequestQuote(id, ap_vehicle_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useSwapVehiclePurchaseRequestQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ap_vehicle_id,
    }: {
      id: number;
      ap_vehicle_id: number;
    }) => swapVehicleInPurchaseRequestQuote(id, ap_vehicle_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useDiscountCouponsByQuote = (quoteId: number) => {
  return useQuery<DiscountCouponResource[]>({
    queryKey: [DISCOUNT_COUPON_QUERY_KEY, quoteId],
    queryFn: () => getDiscountCouponsByQuote(quoteId),

    enabled: !!quoteId && quoteId > 0,
  });
};

export const useUpdateDiscountCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: DiscountCouponUpdatePayload;
    }) => updateDiscountCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISCOUNT_COUPON_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
