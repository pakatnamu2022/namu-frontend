import { useQuery } from "@tanstack/react-query";
import { documentValidationService } from "../services/documentValidation.service";
import {
  DocumentValidationDniResponse,
  DocumentValidationRucResponse,
} from "../services/documentValidation.interface";

export const useDniValidation = (
  dni?: string,
  enabled = false,
  isBusinessPartners = false
) => {
  return useQuery<DocumentValidationDniResponse>({
    queryKey: ["dniValidation", dni, isBusinessPartners],
    queryFn: () => {
      if (!dni) throw new Error("DNI is required");
      return documentValidationService.validateDni(dni, isBusinessPartners);
    },
    enabled: enabled && !!dni,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRucValidation = (
  ruc?: string,
  enabled = false,
  isBusinessPartners = false
) => {
  return useQuery<DocumentValidationRucResponse>({
    queryKey: ["rucValidation", ruc, isBusinessPartners],
    queryFn: () => {
      if (!ruc) throw new Error("RUC is required");
      return documentValidationService.validateRuc(ruc, isBusinessPartners);
    },
    enabled: enabled && !!ruc,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLicenseValidation = (
  license?: string,
  enabled = false,
  isBusinessPartners = false
) => {
  return useQuery({
    queryKey: ["licenseValidation", license, isBusinessPartners],
    queryFn: () => {
      if (!license) throw new Error("License is required");
      return documentValidationService.validateLicense(
        license,
        isBusinessPartners
      );
    },
    enabled: enabled && !!license && license.length > 0,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
