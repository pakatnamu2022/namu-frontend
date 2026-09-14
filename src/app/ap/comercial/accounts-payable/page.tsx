import AccountsPayableView from "@/features/ap/compras/accounts-payable/components/AccountsPayableView";
import { ACCOUNTS_PAYABLE_AP } from "@/features/ap/compras/accounts-payable/lib/accountsPayable.constants";

export default function AccountsPayableApPage() {
  return (
    <AccountsPayableView
      company={ACCOUNTS_PAYABLE_AP.COMPANY}
      permissionModule={ACCOUNTS_PAYABLE_AP.PERMISSION_MODULE}
      title="Cuentas por Pagar"
      subtitle="Automotores"
      showComments
      dashboardRoute={`${ACCOUNTS_PAYABLE_AP.ABSOLUTE_ROUTE}/dashboard`}
    />
  );
}
