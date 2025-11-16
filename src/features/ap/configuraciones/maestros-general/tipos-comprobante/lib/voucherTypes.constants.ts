import { ModelComplete } from "@/src/core/core.interface";
import { VoucherTypesResource } from "./voucherTypes.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "tipos-comprobante";

export const VOUCHER_TYPE: ModelComplete<VoucherTypesResource> = {
  MODEL: {
    name: "Tipo Comprobante",
    plural: "Tipos Comprobante",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "voucherType",
  ROUTE,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
