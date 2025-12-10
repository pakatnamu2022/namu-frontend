export interface DocumentValidationService {
  validateDni: (
    dni: string,
    isBusinessPartners?: boolean
  ) => Promise<DocumentValidationDniResponse>;
  validateRuc: (
    ruc: string,
    isBusinessPartners?: boolean
  ) => Promise<DocumentValidationRucResponse>;
  validateLicense: (
    license: string,
    isBusinessPartners?: boolean
  ) => Promise<DocumentValidationLicenseResponse>;
}

export interface DocumentValidationDniResponse {
  success: boolean;
  document_type: string;
  document_number: string;
  provider: string;
  source: string;
  validated_at: Date;
  data: DataDni;
}

export interface DataDni {
  valid: boolean;
  document_number: string;
  names: string;
  first_name: string;
  paternal_surname: string;
  maternal_surname: string;
  birth_date: string;
  gender: string;
  department: string;
  province: string;
  district: string;
  ubigeo_reniec: string;
  ubigeo_sunat: string;
  address: string;
  ubigeo: null[];
  restricted: boolean;
  type?: string;
}

export interface DocumentValidationRucResponse {
  success: boolean;
  document_type: string;
  document_number: string;
  provider: string;
  source: string;
  validated_at: Date;
  data: DataRuc;
}

export interface DataRuc {
  valid: boolean;
  ruc: string;
  business_name: string;
  taxpayer_type: string;
  status: string;
  condition: string;
  department: string;
  province: string;
  district: string;
  address: string;
  full_address: string;
  ubigeo_sunat: string;
  ubigeo: string[];
  type?: string;
}

export interface DocumentValidationLicenseResponse {
  success: boolean;
  document_type: string;
  document_number: string;
  provider: string;
  validated_at: Date;
  data: DataLicense;
}

export interface DataLicense {
  valid: boolean;
  license_number: string;
  full_name: string;
  licencia: Licencia;
}

export interface Licencia {
  numero: string;
  categoria: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
  estado: string;
  restricciones: string;
}

export interface DocumentValidationPlateResponse {
  success: boolean;
  document_type: string;
  document_number: string;
  provider: string;
  validated_at: Date;
  data: DataPlate;
  source: string;
}

export interface DataPlate {
  valid: boolean;
  plate_number: string;
  brand: string;
  model: string;
  series: string;
  color: string;
  engine_number: string;
  vin: string;
}
