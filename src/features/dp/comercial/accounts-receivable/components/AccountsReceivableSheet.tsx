import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { useAccountReceivableById } from "../lib/accountsReceivable.hook";
import {
  OVERDUE_STATUS_COLORS,
  DEFAULT_OVERDUE_STATUS_COLOR,
} from "../lib/accountsReceivable.constants";
import { cn } from "@/lib/utils";
import AccountsReceivableDetailGrid from "./AccountsReceivableDetailGrid";
import AccountsReceivableComments from "./AccountsReceivableComments";

interface Props {
  selectedId: number | null;
  open: boolean;
  onClose: () => void;
  canUpdate: boolean;
}

export default function AccountsReceivableSheet({ selectedId, open, onClose, canUpdate }: Props) {
  const { data: account, isLoading } = useAccountReceivableById(selectedId);

  const statusColor = account
    ? (OVERDUE_STATUS_COLORS[account.overdue_status] ?? DEFAULT_OVERDUE_STATUS_COLOR)
    : "";

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Detalle de cuenta por cobrar"
      subtitle={account?.document_number}
      icon="FileText"
      size="4xl"
      isLoading={isLoading}
    >
      {account && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("border", statusColor)}>
              {account.overdue_status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Días vencidos: <strong>{account.overdue_days}</strong>
            </span>
          </div>

          <AccountsReceivableDetailGrid account={account} />

          <AccountsReceivableComments
            selectedId={account.id}
            canUpdate={canUpdate}
            initialComments={account.comments ?? []}
          />
        </div>
      )}
    </GeneralSheet>
  );
}
