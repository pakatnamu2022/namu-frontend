import { Clock, User, MapPin } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/core/core.function";
import { cn } from "@/lib/utils";
import { useAttendanceById } from "../lib/attendance.hook";
import { MARK_TYPE_LABELS, MARK_TYPE_COLORS } from "../lib/attendance.constants";

interface Props {
  selectedId: number | null;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-xs text-right">{value ?? "-"}</span>
    </div>
  );
}

export default function AttendanceSheet({ selectedId, onClose }: Props) {
  const { data: record, isLoading } = useAttendanceById(selectedId);

  const markLabel = record ? (MARK_TYPE_LABELS[record.mark_type] ?? record.mark_type) : "-";
  const markColor = record
    ? (MARK_TYPE_COLORS[record.mark_type] ?? "bg-gray-100 text-gray-700 border-gray-200")
    : "";

  return (
    <GeneralSheet
      open={!!selectedId}
      onClose={onClose}
      title="Detalle de marcación"
      subtitle={record?.full_name ?? "Cargando..."}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          Cargando...
        </div>
      ) : record ? (
        <div className="space-y-4 p-4">
          {/* Header badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-sm border px-3 py-1", markColor)}>
              {markLabel}
            </Badge>
            {!record.person_id && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                Sin vinculación en RRHH
              </Badge>
            )}
          </div>

          <Separator />

          {/* Collaborator info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <User className="size-3" /> Colaborador
            </p>
            <DetailRow label="Nombre" value={<span className="font-medium">{record.full_name}</span>} />
            <DetailRow label="Código (ZKBio)" value={<span className="font-mono">{record.emp_code}</span>} />
            <DetailRow label="ID persona" value={record.person_id ?? <span className="text-amber-600">Sin match</span>} />
          </div>

          <Separator />

          {/* Attendance info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <Clock className="size-3" /> Marcación
            </p>
            <DetailRow label="Fecha" value={<span className="tabular-nums">{record.date}</span>} />
            <DetailRow
              label="Hora"
              value={<span className="tabular-nums font-semibold">{record.time?.slice(0, 5) ?? "-"}</span>}
            />
            <DetailRow label="Tipo" value={markLabel} />
            <DetailRow label="Estado original" value={record.punch_state_original ?? "-"} />
          </div>

          <Separator />

          {/* Location & system info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <MapPin className="size-3" /> Ubicación y sistema
            </p>
            <DetailRow label="Área" value={record.area ?? "-"} />
            <DetailRow label="ID transacción ZKBio" value={record.zkbio_transaction_id ?? "-"} />
            <DetailRow label="Sincronizado" value={formatDateTime(record.synced_at)} />
          </div>
        </div>
      ) : null}
    </GeneralSheet>
  );
}
