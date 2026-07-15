import AccountsReceivableView from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableView";
import { ACCOUNTS_RECEIVABLE } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.constants";

export default function AccountsReceivablePage() {
  return (
    <AccountsReceivableView
      company={ACCOUNTS_RECEIVABLE.COMPANY}
      permissionModule="cuentas-por-cobrar"
      title="Cuentas por Cobrar"
      subtitle="Depósito Pakatnamu"
      showComments
      dashboardRoute="/dp/comercial/cuentas-por-cobrar/dashboard"
    />
  );
}
