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
    <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-xs text-right">{value ?? "-"}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
      <Icon className="size-3" /> {label}
    </h3>
  );
}

interface Props {
  account: AccountReceivable;
}

export default function AccountsReceivableDetailGrid({ account }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        {/* Documento */}
        <section>
          <SectionTitle icon={Hash} label="Documento" />
          <div className="rounded-lg border bg-card p-2">
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
          <div className="rounded-lg border bg-card p-2">
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
      </div>

      <div className="flex flex-col gap-4">
        {/* Importes */}
        <section>
          <SectionTitle icon={Calendar} label="Importes" />
          <div className="rounded-lg border bg-card p-2">
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
          <div className="rounded-lg border bg-card p-2">
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
    </div>
  );
}
