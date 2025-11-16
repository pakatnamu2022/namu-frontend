import { ModelComplete } from "@/src/core/core.interface";
import { SedeResource } from "@/src/features/gp/maestro-general/sede/lib/sede.interface";

const ROUTE = "sede";

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
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
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
