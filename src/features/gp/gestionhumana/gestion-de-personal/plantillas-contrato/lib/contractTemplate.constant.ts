import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "plantillas-contrato";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/gestion-de-personal/${ROUTE}`;

export const CONTRACT_TEMPLATE: ModelComplete = {
  MODEL: {
    name: "Plantilla de Contrato",
    plural: "Plantillas de Contrato",
    gender: true,
  },
  ICON: "FileCode",
  ENDPOINT: "/gp/gh/contratos/contract-template",
  QUERY_KEY: "contractTemplate",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

/**
 * Placeholders soportados en `contenido` (ver
 * ContractService::mergeTemplate en milla-backend). Se muestran como ayuda
 * al usuario en el formulario de la plantilla.
 */
export const CONTRACT_TEMPLATE_PLACEHOLDERS = [
  { token: "{$empresa}", label: "Razón social de la empresa" },
  { token: "{$RucEmpresa}", label: "RUC de la empresa" },
  { token: "{$DireccionEmpresa}", label: "Dirección de la empresa" },
  { token: "{$DistritoEmpresa}", label: "Distrito de la empresa" },
  { token: "{$ProvinciaEmpresa}", label: "Provincia de la empresa" },
  { token: "{$DepartamentoEmpresa}", label: "Departamento de la empresa" },
  { token: "{$InfoEmpresa}", label: "Información de labores de la empresa" },
  { token: "{$abrev_suc}", label: "Abreviatura de la sede" },
  { token: "{$NombreTrabajador}", label: "Nombre completo del trabajador" },
  { token: "{$DocTrabajador}", label: "Documento del trabajador" },
  { token: "{$DireccionTrabajador}", label: "Dirección del trabajador" },
  { token: "{$DistritoTrabajador}", label: "Distrito del trabajador" },
  { token: "{$ProvinciaTrabajador}", label: "Provincia del trabajador" },
  { token: "{$DepartamentoTrabajador}", label: "Departamento del trabajador" },
  { token: "{$EmailTrabajador}", label: "Email del trabajador" },
  { token: "{$CargoTrabajador}", label: "Cargo del trabajador" },
  { token: "{$DescCargo}", label: "Descripción del cargo" },
  { token: "{$SueldoTrabajador}", label: "Sueldo del trabajador" },
  { token: "{$TipoContrato}", label: "Tipo de contrato" },
  { token: "{$FechInicioContrato}", label: "Fecha de inicio del contrato" },
  { token: "{$FechFinContrato}", label: "Fecha de fin del contrato" },
  { token: "{$NombreFirmante}", label: "Nombre del firmante" },
  { token: "{$DniFirmante}", label: "DNI del firmante" },
  { token: "{$NombreFirmanteSecundario}", label: "Nombre del firmante secundario (convenio)" },
  { token: "{$DniFirmanteSecundario}", label: "DNI del firmante secundario (convenio)" },
  { token: "{$empresa_origen}", label: "Razón social origen (adenda/convenio)" },
  { token: "{$RucEmpresa_origen}", label: "RUC origen (adenda/convenio)" },
  { token: "{$FechaInicio_origen}", label: "Fecha de inicio del contrato origen" },
] as const;
