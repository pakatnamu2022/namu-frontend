import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { EditableCell } from "@/shared/components/EditableCell.tsx";
import { cn } from "@/lib/utils.ts";
import { ConceptObjectivePvResource } from "../lib/conceptObjectiveMasterPv.interface.ts";
import { AREA_TALLER } from "../lib/conceptObjectiveMasterPv.constants.ts";

interface Props {
  data: ConceptObjectivePvResource[];
  isLoading?: boolean;
  editingId?: number | null;
  onEdit: (record: ConceptObjectivePvResource) => void;
  onToggleStatus: (record: ConceptObjectivePvResource, status: boolean) => void;
  onDelete: (record: ConceptObjectivePvResource) => void;
  onUpdateOrder: (id: number, order: number) => void;
}

export default function ConceptObjectivePvList({
  data,
  isLoading,
  editingId,
  onEdit,
  onToggleStatus,
  onDelete,
  onUpdateOrder,
}: Props) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Cargando conceptos...
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Aún no hay conceptos registrados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((record) => {
        const isTaller = record.area_id === AREA_TALLER;

        return (
          <div
            key={record.id}
            className={cn(
              "flex items-start justify-between gap-3 rounded-lg border p-3",
              editingId === record.id && "border-primary bg-muted/50",
            )}
          >
            <EditableCell
              id={record.id}
              value={record.order}
              onUpdate={onUpdateOrder}
              widthClass="w-14"
              min={1}
            />

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground">
                  {record.area?.description}
                </span>
                {isTaller && record.is_vehicular_crossing && (
                  <Badge variant="outline" color="blue">
                    Paso Vehicular
                  </Badge>
                )}
                {isTaller && (
                  <Badge variant="outline" color="blue">
                    {record.type_planning_ids?.length || 0} planificación
                    {record.type_planning_ids?.length === 1 ? "" : "es"}
                  </Badge>
                )}
              </div>
              <p className="text-sm wrap-break-word">{record.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Switch
                checked={record.status}
                onCheckedChange={(checked) => onToggleStatus(record, checked)}
                className={cn(record.status ? "bg-primary" : "bg-secondary")}
              />
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => onEdit(record)}
              >
                <Pencil className="size-4" />
              </Button>
              <DeleteButton onClick={() => onDelete(record)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
