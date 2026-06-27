import { Hash, User, Calendar, Building2 } from "lucide-react";
import { formatDate, formatDateTime } from "@/core/core.function";
import type { AccountReceivable } from "../lib/accountsReceivable.interface";

function formatAmount(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-1 border-b border-border/40 last:border-0 flex items-start justify-between gap-2">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-none shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-right">{value ?? "-"}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <h3 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-1 flex items-center gap-1">
      <Icon className="size-3" /> {label}
    </h3>
  );
}

interface Props {
  account: AccountReceivable;
}

export default function AccountsReceivableDetailGrid({ account }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Documento */}
      <section>
        <SectionTitle icon={Hash} label="Documento" />
        <div className="rounded-lg bg-muted/40 p-2 space-y-0">
          <DetailRow label="Número" value={account.document_number} />
          <DetailRow label="Cajero" value={account.cashier} />
          <DetailRow label="Fecha documento" value={formatDate(account.document_date)} />
          <DetailRow label="Fecha vencimiento" value={formatDate(account.document_due_date)} />
          <DetailRow label="Mes vencimiento" value={`${account.due_month} ${account.due_year}`} />
          <DetailRow
            label="Fecha cobro"
            value={account.collection_date ? formatDate(account.collection_date) : null}
          />
        </div>
      </section>

      {/* Cliente */}
      <section>
        <SectionTitle icon={User} label="Cliente" />
        <div className="rounded-lg bg-muted/40 p-2 space-y-0">
          <DetailRow label="RUC / DNI" value={account.client_id} />
          <DetailRow label="Razón social" value={account.client_name} />
          {account.client_id_real && (
            <DetailRow label="RUC real" value={account.client_id_real} />
          )}
          {account.client_name_real && (
            <DetailRow label="Nombre real" value={account.client_name_real} />
          )}
        </div>
      </section>

      {/* Importes */}
      <section>
        <SectionTitle icon={Calendar} label="Importes" />
        <div className="rounded-lg bg-muted/40 p-2 space-y-0">
          <DetailRow label="Moneda" value={account.currency} />
          <DetailRow
            label="Tipo de cambio"
            value={parseFloat(account.exchange_rate).toFixed(5)}
          />
          <DetailRow
            label="Importe original"
            value={`${account.currency} ${formatAmount(account.amount)}`}
          />
          <DetailRow
            label="Saldo pendiente"
            value={
              <span className="font-bold">
                {account.currency} {formatAmount(account.balance)}
              </span>
            }
          />
          <DetailRow
            label="Importe original (Soles)"
            value={`S/ ${formatAmount(account.amount_pen)}`}
          />
          <DetailRow
            label="Saldo pendiente (Soles)"
            value={
              <span className="font-bold text-primary">
                S/ {formatAmount(account.balance_pen)}
              </span>
            }
          />
        </div>
      </section>

      {/* Sucursal */}
      <section>
        <SectionTitle icon={Building2} label="Sucursal" />
        <div className="rounded-lg bg-muted/40 p-2 space-y-0">
          <DetailRow label="Vendedor" value={account.seller} />
          <DetailRow label="Sede" value={account.sede?.localidad} />
          <DetailRow label="Sucursal" value={account.branch} />
          {account.observations && (
            <DetailRow label="Observaciones" value={account.observations} />
          )}
          <DetailRow label="Última sincronización" value={formatDateTime(account.synced_at)} />
        </div>
      </section>
    </div>
  );
}
