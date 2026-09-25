import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  SearchCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyCell } from "@/shared/components/CopyCell";
import { successToast, errorToast } from "@/core/core.function";
import {
  getElectronicDocumentCancellations,
  queryElectronicDocumentCancellation,
} from "../lib/electronicDocument.actions";
import type {
  ElectronicDocumentCancellation,
  ElectronicDocumentResource,
} from "../lib/electronicDocument.interface";

export const CANCELLATIONS_QUERY_KEY = "electronicDocumentCancellations";

const OPERATION_LABEL: Record<ElectronicDocumentCancellation["operation"], string> = {
  generar_anulacion: "Envío de baja",
  consultar_anulacion: "Consulta de baja",
};

function fmtDateTime(value?: string | null) {
  if (!value) return null;
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Row({ label, value, copy }: { label: string; value?: React.ReactNode; copy?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  const isText = typeof value === "string" || typeof value === "number";
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="shrink-0 text-[13px] text-muted-foreground">{label}</span>
      {copy && isText ? (
        <CopyCell value={String(value)} size="sm" className="min-w-0 truncate text-right font-medium" />
      ) : (
        <span className="min-w-0 text-right text-sm font-medium wrap-break-word">{value}</span>
      )}
    </div>
  );
}

/** Estado de la baja según el documento y la última operación registrada. */
function getCancellationState(
  doc: ElectronicDocumentResource,
  last?: ElectronicDocumentCancellation,
): { title: string; detail: string; tone: "success" | "warning" | "danger" | "muted"; icon: typeof Ban } {
  const lastOk = last?.success ? last : undefined;

  if (doc.anulado && (!last || lastOk?.aceptada_por_sunat)) {
    return {
      title: "Anulado en SUNAT",
      detail: lastOk?.sunat_ticket_numero
        ? `Comunicación de baja aceptada · ticket ${lastOk.sunat_ticket_numero}`
        : "Comunicación de baja aceptada por SUNAT.",
      tone: "success",
      icon: CheckCircle,
    };
  }

  if (lastOk && !lastOk.aceptada_por_sunat) {
    return {
      title: "Baja en proceso",
      detail: `Nubefact recibió la comunicación de baja; SUNAT aún no la acepta${
        lastOk.sunat_ticket_numero ? ` (ticket ${lastOk.sunat_ticket_numero})` : ""
      }.`,
      tone: "warning",
      icon: Clock,
    };
  }

  if ((doc.status === "cancelled" || doc.anulado) && !lastOk) {
    return {
      title: "Anulado en el sistema, sin baja en Nubefact",
      detail:
        "El comprobante figura como anulado, pero no hay comunicación de baja registrada en Nubefact. Consulta la baja para confirmarlo.",
      tone: "danger",
      icon: AlertTriangle,
    };
  }

  return {
    title: "Sin comunicación de baja",
    detail: "Este comprobante no tiene anulaciones registradas.",
    tone: "muted",
    icon: Ban,
  };
}

const TONE_CLASS = {
  success: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  danger: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  muted: "bg-muted/50 text-muted-foreground",
};

export function ElectronicDocumentCancellationTab({
  doc,
  enabled,
  onStatusUpdated,
}: {
  doc: ElectronicDocumentResource;
  enabled: boolean;
  onStatusUpdated?: () => void;
}) {
  const queryClient = useQueryClient();

  const { data: cancellations = [], isFetching } = useQuery({
    queryKey: [CANCELLATIONS_QUERY_KEY, doc.id],
    queryFn: () => getElectronicDocumentCancellations(doc.id),
    enabled: enabled && !!doc.id,
  });

  const queryMutation = useMutation({
    mutationFn: () => queryElectronicDocumentCancellation(doc.id),
    onSuccess: (res) => {
      if (res.aceptada_por_sunat) successToast("Baja aceptada por SUNAT");
      else if (res.exists) successToast("Baja registrada en Nubefact, pendiente en SUNAT");
      else errorToast(`Nubefact: ${res.error ?? "no existe comunicación de baja"}`);
      queryClient.invalidateQueries({ queryKey: [CANCELLATIONS_QUERY_KEY, doc.id] });
      onStatusUpdated?.();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al consultar la baja: ${msg}`);
    },
  });

  const state = getCancellationState(doc, cancellations[0]);
  const StateIcon = state.icon;

  return (
    <div className="space-y-5 pt-4">
      <div className={`flex flex-wrap items-start justify-between gap-3 rounded-lg p-4 ${TONE_CLASS[state.tone]}`}>
        <div className="flex min-w-0 items-start gap-2.5">
          <StateIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">{state.title}</p>
            <p className="text-xs opacity-90">{state.detail}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryMutation.mutate()}
          disabled={queryMutation.isPending}
          className="bg-background"
        >
          {queryMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SearchCheck className="mr-2 h-4 w-4" />
          )}
          Consultar baja en Nubefact
        </Button>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
          Historial de operaciones
          {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
        </p>

        {cancellations.length === 0 && !isFetching ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay operaciones de baja registradas con Nubefact.
          </p>
        ) : (
          <div className="space-y-3">
            {cancellations.map((c) => (
              <CancellationCard key={c.id} item={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CancellationCard({ item: c }: { item: ElectronicDocumentCancellation }) {
  const status = !c.success
    ? { label: c.error_code === 24 ? "Sin baja en Nubefact" : "Error", color: "red" as const, icon: XCircle }
    : c.aceptada_por_sunat
      ? { label: "Aceptada por SUNAT", color: "green" as const, icon: CheckCircle }
      : { label: "Pendiente en SUNAT", color: "orange" as const, icon: Clock };

  const links = [
    { label: "PDF", href: c.enlace_del_pdf },
    { label: "XML", href: c.enlace_del_xml },
    { label: "CDR", href: c.enlace_del_cdr },
  ].filter((l) => !!l.href);

  return (
    <div className="rounded-lg bg-muted/40 p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{OPERATION_LABEL[c.operation] ?? c.operation}</p>
          <p className="text-xs text-muted-foreground">
            {[
              c.operation === "consultar_anulacion"
                ? `Última consulta ${fmtDateTime(c.updated_at)}`
                : fmtDateTime(c.created_at),
              c.user_name ?? "Sistema",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <Badge variant="outline" color={status.color} icon={status.icon}>
          <span>{status.label}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
        <Row label="Motivo" value={c.motivo} />
        <Row label="Ticket SUNAT" value={c.sunat_ticket_numero} copy />
        <Row label="N° de baja" value={c.numero} />
        <Row label="Código único" value={c.codigo_unico} copy />
        <Row label="Código respuesta SUNAT" value={c.sunat_responsecode} />
        <Row label="Descripción SUNAT" value={c.sunat_description} />
        <Row label="Nota SUNAT" value={c.sunat_note} />
        <Row label="Error SOAP" value={c.sunat_soap_error} />
        <Row
          label="Error Nubefact"
          value={
            c.error_message
              ? `${c.error_code ? `[${c.error_code}] ` : ""}${c.error_message}`
              : null
          }
        />
        <Row label="HTTP" value={c.http_status_code} />
      </div>

      {(links.length > 0 || c.enlace) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((l) => (
            <Button key={l.label} variant="outline" size="sm" asChild>
              <a href={l.href!} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                {l.label}
              </a>
            </Button>
          ))}
          {c.enlace && links.length === 0 && (
            <Button variant="outline" size="sm" asChild>
              <a href={c.enlace} target="_blank" rel="noopener noreferrer">
                Ver en Nubefact
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
