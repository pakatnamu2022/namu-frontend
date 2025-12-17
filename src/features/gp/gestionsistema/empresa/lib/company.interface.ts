import { type Links, type Meta } from "@/shared/lib/pagination.interface";

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
}

export interface getCompanysProps {
  params?: Record<string, any>;
}
