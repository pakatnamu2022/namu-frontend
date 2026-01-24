export type ReportFormat = "excel" | "pdf";

export type ReportFieldType = "date" | "daterange" | "select" | "multiselect" | "text" | "number";

export interface ReportFieldOption {
  label: string;
  value: string;
}

export interface MultiSelectOption {
  id: number;
  [key: string]: any;
}

export interface ReportField {
  name: string;
  label: string;
  type: ReportFieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  // Para campos de tipo select
  options?: ReportFieldOption[];
  // Para campos de tipo select que cargan datos de un endpoint
  endpoint?: string;
  // Mapper para transformar la respuesta del endpoint a opciones
  optionsMapper?: (data: any) => ReportFieldOption[];
  // Para campos de tipo multiselect
  multiSelectOptions?: MultiSelectOption[];
  multiSelectMapper?: (data: any) => MultiSelectOption[];
  getDisplayValue?: (item: MultiSelectOption) => string;
  getSecondaryText?: (item: MultiSelectOption) => string | undefined;
  // Para daterange
  nameFrom?: string;
  nameTo?: string;
}

export interface ReportConfig {
  id: string;
  title: string;
  type: string;
  description: string;
  icon?: string;
  endpoint: string;
  fields: ReportField[];
  // Parámetros adicionales que siempre se envían
  defaultParams?: Record<string, any>;
}

export interface ReportFilterValues {
  format: ReportFormat;
  [key: string]: any;
}
