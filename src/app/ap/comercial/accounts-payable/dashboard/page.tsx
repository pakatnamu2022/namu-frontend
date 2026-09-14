import AccountsPayableDashboard from "@/features/ap/compras/accounts-payable/components/AccountsPayableDashboard";
import { ACCOUNTS_PAYABLE_AP } from "@/features/ap/compras/accounts-payable/lib/accountsPayable.constants";

export default function AccountsPayableDashboardApPage() {
  return (
    <AccountsPayableDashboard
      company={ACCOUNTS_PAYABLE_AP.COMPANY}
      title="Dashboard — Cuentas por Pagar"
      subtitle="Automotores"
      listRoute={ACCOUNTS_PAYABLE_AP.ABSOLUTE_ROUTE}
    />
  );
}
