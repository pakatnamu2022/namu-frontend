import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { useAccountPayableById } from "../lib/accountsPayable.hook";
import { cn } from "@/lib/utils";
import AccountsPayableDetailGrid from "./AccountsPayableDetailGrid";
import AccountsPayableComments from "./AccountsPayableComments";

interface Props {
  selectedId: number | null;
  open: boolean;
  onClose: () => void;
  canUpdate: boolean;
  showComments?: boolean;
}

export default function AccountsPayableSheet({
  selectedId,
  open,
  onClose,
  canUpdate,
  showComments = true,
}: Props) {
  const { data: account, isLoading } = useAccountPayableById(selectedId);

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Detalle de cuenta por pagar"
      subtitle={account?.documento}
      icon="FileText"
      size="6xl"
      isLoading={isLoading}
    >
      {account && (
        <div
          className={cn(
            "grid gap-0 h-full",
            showComments ? "grid-cols-3" : "grid-cols-1",
          )}
        >
          {/* Left — compact detail */}
          <div
            className={cn(
              "overflow-y-auto space-y-3 pb-2",
              showComments && "pr-4 border-r border-border/40 col-span-1",
            )}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge variant="outline">{account.moneda}</Badge>
              <span className="text-xs text-muted-foreground">
                Saldo sin aplicar:{" "}
                <strong>{account.monto_sin_aplicar}</strong>
              </span>
            </div>
            <AccountsPayableDetailGrid account={account} />
          </div>

          {/* Right — comments full height */}
          {showComments && (
            <div className="pl-4 flex flex-col h-full min-h-0 overflow-hidden col-span-2">
              <AccountsPayableComments
                selectedId={account.id}
                canUpdate={canUpdate}
                initialComments={account.comments ?? []}
              />
            </div>
          )}
        </div>
      )}
    </GeneralSheet>
  );
}
