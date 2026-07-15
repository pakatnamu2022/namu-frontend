import AccountsReceivableView from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableView";
import { ACCOUNTS_RECEIVABLE_AP } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.constants";

export default function AccountsReceivableApPage() {
  return (
    <AccountsReceivableView
      company={ACCOUNTS_RECEIVABLE_AP.COMPANY}
      areaId={ACCOUNTS_RECEIVABLE_AP.AREA_ID}
      permissionModule={ACCOUNTS_RECEIVABLE_AP.PERMISSION_MODULE}
      title="Cuentas por Cobrar"
      subtitle="Automotores"
      showComments={false}
      dashboardRoute={`${ACCOUNTS_RECEIVABLE_AP.ABSOLUTE_ROUTE}/dashboard`}
    />
  );
}
