import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface CompanyResponse {
  data: CompanyResource[];
  links: Links;
  meta: Meta;
}

export interface CompanyResource {
  id: number;
  name: string;
  abbreviation: string;
  description: string;
  businessName: string;
  email: string;
  logo: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  detraction_amount: number;
  billing_detraction_type_id: string;
}

export interface getCompanysProps {
  params?: Record<string, any>;
}
