import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface BankResponse {
  data: BankResource[];
  links: Links;
  meta: Meta;
}

export interface BankResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface BankRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getBankProps {
  params?: Record<string, any>;
}
