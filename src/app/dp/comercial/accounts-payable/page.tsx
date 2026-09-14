import AccountsPayableView from "@/features/ap/compras/accounts-payable/components/AccountsPayableView";
import { ACCOUNTS_PAYABLE } from "@/features/ap/compras/accounts-payable/lib/accountsPayable.constants";

export default function AccountsPayablePage() {
  return (
    <AccountsPayableView
      company={ACCOUNTS_PAYABLE.COMPANY}
      permissionModule={ACCOUNTS_PAYABLE.PERMISSION_MODULE}
      title="Cuentas por Pagar"
      subtitle="Depósito Pakatnamu"
      showComments
      dashboardRoute="/dp/comercial/accounts-payable/dashboard"
    />
  );
}
