import { type ModelComplete } from "@/core/core.interface";
import { CompanyResource } from "@/features/gp/maestro-general/empresa/lib/company.interface";

const ROUTE = "empresa";
const ABSOLUTE_ROUTE = `/gp/maestro-general/${ROUTE}`;

export const COMPANY: ModelComplete<CompanyResource> = {
  MODEL: {
    name: "Empresa",
    plural: "Empresas",
    gender: true,
  },
  ICON: "Building2",
  ENDPOINT: "/company",
  QUERY_KEY: "company",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
