import { useQuery } from "@tanstack/react-query";
import {
  ElectronicDocumentResource,
  ElectronicDocumentResponse,
  AdvancePaymentsByQuotationResponse,
} from "./electronicDocument.interface";
import {
  findElectronicDocumentById,
  getAllElectronicDocuments,
  getElectronicDocuments,
  getNextCorrelativeElectronicDocument,
  getAdvancePaymentsByVehicle,
  getAdvancePaymentsByQuotation,
} from "./electronicDocument.actions";
import { ELECTRONIC_DOCUMENT } from "./electronicDocument.constants";

const { QUERY_KEY } = ELECTRONIC_DOCUMENT;

export const useElectronicDocuments = (params?: Record<string, any>) => {
  return useQuery<ElectronicDocumentResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getElectronicDocuments(params),
    refetchOnWindowFocus: false,
  });
};

export const useElectronicDocument = (id: number) => {
  return useQuery<ElectronicDocumentResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findElectronicDocumentById(id),
    refetchOnWindowFocus: false,
  });
};

export const useAllElectronicDocuments = (params?: Record<string, any>) => {
  return useQuery<ElectronicDocumentResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllElectronicDocuments(params),
    refetchOnWindowFocus: false,
  });
};

export const useNextCorrelativeElectronicDocument = (
  documentTypeId: number,
  series: number
) => {
  return useQuery<{ number: string }>({
    queryKey: [QUERY_KEY, { documentTypeId, series }],
    queryFn: () => getNextCorrelativeElectronicDocument(documentTypeId, series),
    refetchOnWindowFocus: false,
    enabled: !!documentTypeId && !!series && documentTypeId > 0 && series > 0,
  });
};

export const useAdvancePaymentsByVehicle = (vehicleId: number | null) => {
  return useQuery<AdvancePaymentsByQuotationResponse>({
    queryKey: [QUERY_KEY, "advances", "vehicle", vehicleId],
    queryFn: () => getAdvancePaymentsByVehicle(vehicleId!),
    refetchOnWindowFocus: false,
    enabled: !!vehicleId && vehicleId > 0,
  });
};

export const useAdvancePaymentsByQuotation = (quotationId: number | null) => {
  return useQuery<AdvancePaymentsByQuotationResponse>({
    queryKey: [QUERY_KEY, "advances", "quotation", quotationId],
    queryFn: () => getAdvancePaymentsByQuotation(quotationId!),
    refetchOnWindowFocus: false,
    enabled: !!quotationId && quotationId > 0,
  });
};
