import { api } from "@/core/api";
import {
  DocumentValidationDniResponse,
  DocumentValidationLicenseResponse,
  DocumentValidationPlateResponse,
  DocumentValidationRucResponse,
  DocumentValidationService,
} from "./documentValidation.interface";

const BASE_ENDPOINT = "/document-validation";

class DocumentValidationServiceImpl implements DocumentValidationService {
  async validateDni(
    dni: string,
    isBusinessPartners?: boolean,
  ): Promise<DocumentValidationDniResponse> {
    const { data } = await api.post<DocumentValidationDniResponse>(
      `${BASE_ENDPOINT}/validate/dni`,
      { dni, isBusinessPartners },
    );
    return data;
  }

  async validateRuc(
    ruc: string,
    isBusinessPartners?: boolean,
  ): Promise<DocumentValidationRucResponse> {
    const { data } = await api.post<DocumentValidationRucResponse>(
      `${BASE_ENDPOINT}/validate/ruc`,
      { ruc, isBusinessPartners },
    );
    return data;
  }

  async validateLicense(
    license: string,
    isBusinessPartners?: boolean,
  ): Promise<DocumentValidationLicenseResponse> {
    const { data } = await api.post<DocumentValidationLicenseResponse>(
      `${BASE_ENDPOINT}/validate/license`,
      { license, isBusinessPartners },
    );
    return data;
  }

  async validatePlate(plate: string): Promise<DocumentValidationPlateResponse> {
    const { data } = await api.post<DocumentValidationPlateResponse>(
      `${BASE_ENDPOINT}/validate/plate`,
      { plate },
    );
    return data;
  }
}

export const documentValidationService = new DocumentValidationServiceImpl();
