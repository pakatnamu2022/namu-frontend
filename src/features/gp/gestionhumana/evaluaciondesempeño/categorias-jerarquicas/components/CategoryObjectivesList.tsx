import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ObjectiveResource } from "../../objetivos/lib/objective.interface";
import { Loader2, PowerOff, Trash2 } from "lucide-react";

interface Props {
  categoryObjectives: ObjectiveResource[];
  setDeleteDetailId: (id: number) => void;
  onToggleActive: (objectiveId: number, active: boolean) => void;
  onOpenDeactivateModal: (objectiveId: number, objectiveName: string) => void;
  pendingObjectiveId?: number | null;
}

export const CategoryObjectivesList = ({
  categoryObjectives,
  setDeleteDetailId,
  onToggleActive,
  onOpenDeactivateModal,
  pendingObjectiveId,
}: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {categoryObjectives && categoryObjectives.length > 0 ? (
        categoryObjectives.map((child: ObjectiveResource) => {
          const isPending = pendingObjectiveId === child.id;
          return (
            <div
              key={String(child.id)}
              className="flex justify-between gap-1 border-2 px-4 py-1 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <p className="font-semibold text-sm">{child.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {child.metric || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isPending ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground mx-2" />
                ) : (
                  <Switch
                    checked={child.active ?? false}
                    onCheckedChange={(checked) =>
                      onToggleActive(child.id, checked)
                    }
                  />
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => onOpenDeactivateModal(child.id, child.name)}
                  tooltip="Desactivar en todas las categorías"
                >
                  <PowerOff className="size-4 text-amber-500" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteDetailId(child.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-muted-foreground">No hay datos.</p>
      )}
    </div>
  );
};
