import { Links, Meta } from "@/shared/lib/pagination.interface.ts";

export interface AreaResponse {
  data: AreaResource[];
  links: Links;
  meta: Meta;
}

export interface AreaResource {
  id: number;
  name: string;
  sede_id: number;
  sede: string;
}

export interface getAreasProps {
  params?: Record<string, any>;
}
