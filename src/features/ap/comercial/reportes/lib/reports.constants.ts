import { ReportConfig } from "./reports.interface";

export const COMMERCIAL_REPORTS: ReportConfig[] = [
  {
    id: "vehicle-sales",
    title: "Reporte de Ventas de Vehículos",
    description: "Exporta el reporte de ventas de vehículos",
    icon: "TrendingUp",
    endpoint: "/ap/commercial/vehicles/export/sales",
    fields: [
      {
        name: "is_paid",
        label: "Estado de Pago",
        type: "select",
        required: false,
        placeholder: "Seleccionar estado",
        options: [
          { label: "Todos", value: "" },
          { label: "Pagado", value: "1" },
          { label: "Pendiente", value: "0" },
        ],
        defaultValue: "1",
      },
      // {
      //   name: "date_from",
      //   label: "Rango de Fechas",
      //   type: "daterange",
      //   required: false,
      //   nameFrom: "date_from",
      //   nameTo: "date_to",
      // },
      // {
      //   name: "sede_id",
      //   label: "Sede",
      //   type: "select",
      //   required: false,
      //   placeholder: "Todas las sedes",
      //   endpoint: "/admin/sedes",
      //   optionsMapper: (data: any) =>
      //     data?.data?.map((sede: any) => ({
      //       label: sede.name,
      //       value: sede.id.toString(),
      //     })) || [],
      // },
    ],
    defaultParams: {},
  },
  // {
  //   id: "vehicle-purchases",
  //   title: "Reporte de Compras de Vehículos",
  //   description: "Exporta el reporte de compras realizadas a proveedores",
  //   icon: "ShoppingCart",
  //   endpoint: "/ap/commercial/vehicles/export/purchases",
  //   fields: [
  //     {
  //       name: "status",
  //       label: "Estado de la Orden",
  //       type: "select",
  //       required: false,
  //       placeholder: "Seleccionar estado",
  //       options: [
  //         { label: "Todos", value: "" },
  //         { label: "Pendiente", value: "pending" },
  //         { label: "Aprobado", value: "approved" },
  //         { label: "Recibido", value: "received" },
  //       ],
  //     },
  //     {
  //       name: "date_from",
  //       label: "Rango de Fechas",
  //       type: "daterange",
  //       required: false,
  //       nameFrom: "date_from",
  //       nameTo: "date_to",
  //     },
  //     {
  //       name: "supplier_id",
  //       label: "Proveedor",
  //       type: "select",
  //       required: false,
  //       placeholder: "Todos los proveedores",
  //       endpoint: "/ap/commercial/suppliers",
  //       optionsMapper: (data: any) =>
  //         data?.data?.map((supplier: any) => ({
  //           label: supplier.business_name || supplier.name,
  //           value: supplier.id.toString(),
  //         })) || [],
  //     },
  //   ],
  //   defaultParams: {},
  // },
];

export const REPORTS_CONSTANTS = {
  ROUTE: "/ap/comercial/reportes",
  TITLE: "Reportes Comerciales",
  DESCRIPTION: "Genera y descarga reportes del módulo comercial",
};
