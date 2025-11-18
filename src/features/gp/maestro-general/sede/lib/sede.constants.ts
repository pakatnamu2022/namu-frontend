import { type ModelComplete } from "@/core/core.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";

const ROUTE = "sede";
const ABSOLUTE_ROUTE = `/gp/maestro-general/${ROUTE}`;

export const SEDE: ModelComplete<SedeResource> = {
  MODEL: {
    name: "Sede",
    plural: "Sedes",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/mg/sede",
  QUERY_KEY: "sede",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    description: "",
    id: 0,
    localidad: "",
    suc_abrev: "",
    abreviatura: "",
    empresa_id: 0,
    ruc: "",
    razon_social: "",
    direccion: "",
    distrito: "",
    provincia: "",
    departamento: "",
    web: "",
    email: "",
    logo: null,
    ciudad: "",
    info_labores: "",
    dyn_code: "",
    establishment: "",
    district_id: 0,
    province_id: 0,
    department_id: 0,
    status: true,
  },
};
