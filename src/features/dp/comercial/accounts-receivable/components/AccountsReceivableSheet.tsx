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

export default function AccountsReceivableSheet({
  selectedId,
  open,
  onClose,
  canUpdate,
}: Props) {
  const { data: account, isLoading } = useAccountReceivableById(selectedId);

  const statusColor = account
    ? (OVERDUE_STATUS_COLORS[account.overdue_status] ??
      DEFAULT_OVERDUE_STATUS_COLOR)
    : "";

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Detalle de cuenta por cobrar"
      subtitle={account?.document_number}
      icon="FileText"
      size="6xl"
      isLoading={isLoading}
    >
      {account && (
        <div className="grid grid-cols-3 gap-0 h-full">
          {/* Left — compact detail */}
          <div className="overflow-y-auto pr-4 border-r border-border/40 space-y-3 pb-2 cols-span-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge variant="outline" className={cn("border", statusColor)}>
                {account.overdue_status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Días vencidos: <strong>{account.overdue_days}</strong>
              </span>
            </div>
            <AccountsReceivableDetailGrid account={account} />
          </div>

          {/* Right — comments full height */}
          <div className="pl-4 flex flex-col h-full min-h-0 overflow-hidden col-span-2">
            <AccountsReceivableComments
              selectedId={account.id}
              canUpdate={canUpdate}
              initialComments={account.comments ?? []}
            />
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
