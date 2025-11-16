import { useQuery } from "@tanstack/react-query";
import { DOCUMENT_TYPE } from "./documentTypes.constants";
import {
  DocumentTypeResource,
  DocumentTypeResponse,
} from "./documentTypes.interface";
import {
  findDocumentTypeById,
  getAllDocumentType,
  getDocumentType,
} from "./documentTypes.actions";

const { QUERY_KEY } = DOCUMENT_TYPE;

export const useDocumentType = (params?: Record<string, any>) => {
  return useQuery<DocumentTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getDocumentType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllDocumentType = (params?: Record<string, any>) => {
  return useQuery<DocumentTypeResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllDocumentType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useDocumentTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findDocumentTypeById(id),
    refetchOnWindowFocus: false,
  });
};
