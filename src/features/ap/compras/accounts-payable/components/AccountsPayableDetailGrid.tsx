import { Hash, Building2, Banknote } from "lucide-react";
import { formatDate, formatDateTime } from "@/core/core.function";
import type { AccountPayable } from "../lib/accountsPayable.interface";

function formatAmount(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="py-1 border-b border-border/40 last:border-0 flex items-start justify-between gap-2">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-none shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-xs text-right">{value ?? "-"}</span>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <h3 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-1 flex items-center gap-1">
      <Icon className="size-3" /> {label}
    </h3>
  );
}

interface Props {
  account: AccountPayable;
}

export default function AccountsPayableDetailGrid({ account }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Documento */}
      <section>
        <SectionTitle icon={Hash} label="Documento" />
        <div className="rounded-lg bg-muted/40 p-2 space-y-0">
          <DetailRow label="Número" value={account.documento} />
          <DetailRow
            label="Fecha documento"
            value={formatDate(account.fecha_documento)}
          />
          <DetailRow
            label="Fecha contable"
            value={formatDate(account.fecha_contable)}
          />
          <DetailRow
            label="Empresa"
            value={
              account.company === "deposito" ? "Depósito" : "Automotores"
            }
          />
        </div>
      </section>

      {/* Proveedor */}
      <section>
        <SectionTitle icon={Building2} label="Proveedor" />
        <div className="rounded-lg bg-muted/40 p-2 space-y-0">
          <DetailRow label="RUC / DNI" value={account.proveedor_documento} />
          <DetailRow label="Razón social" value={account.proveedor_nombre} />
        </div>
      </section>

      {/* Importes */}
      <section>
        <SectionTitle icon={Banknote} label="Importes" />
        <div className="rounded-lg bg-muted/40 p-2 space-y-0">
          <DetailRow label="Moneda" value={account.moneda} />
          <DetailRow
            label="Monto original"
            value={`${account.moneda} ${formatAmount(account.monto)}`}
          />
          <DetailRow
            label="Saldo sin aplicar"
            value={
              <span className="font-bold text-primary">
                {account.moneda} {formatAmount(account.monto_sin_aplicar)}
              </span>
            }
          />
          <DetailRow
            label="Última sincronización"
            value={formatDateTime(account.synced_at)}
          />
        </div>
      </section>
    </div>
  );
}
