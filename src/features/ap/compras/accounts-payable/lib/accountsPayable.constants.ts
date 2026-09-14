export const ACCOUNTS_PAYABLE = {
  ENDPOINT: "/ap/commercial/accountsPayable",
  QUERY_KEY: "ap-accounts-payable",
  ROUTE: "accounts-payable",
  ABSOLUTE_ROUTE: "/dp/comercial/accounts-payable",
  COMPANY: "deposito",
  PERMISSION_MODULE: "cuentas-por-pagar",
} as const;

export const ACCOUNTS_PAYABLE_AP = {
  COMPANY: "automotores",
  PERMISSION_MODULE: "cuentas-por-pagar-ap",
  ABSOLUTE_ROUTE: "/ap/comercial/cuentas-por-pagar-ap",
} as const;
