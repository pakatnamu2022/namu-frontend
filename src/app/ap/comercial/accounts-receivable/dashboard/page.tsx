import AccountsReceivableDashboard from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableDashboard";
import { ACCOUNTS_RECEIVABLE_AP } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.constants";

export default function AccountsReceivableDashboardApPage() {
  return (
    <AccountsReceivableDashboard
      company={ACCOUNTS_RECEIVABLE_AP.COMPANY}
      areaId={ACCOUNTS_RECEIVABLE_AP.AREA_ID}
      title="Dashboard — Cuentas por Cobrar"
      subtitle="Automotores"
      listRoute={ACCOUNTS_RECEIVABLE_AP.ABSOLUTE_ROUTE}
    />
  );
}
