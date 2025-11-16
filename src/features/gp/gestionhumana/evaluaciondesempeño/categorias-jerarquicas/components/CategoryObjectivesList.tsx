import { Button } from "@/components/ui/button";
import { ObjectiveResource } from "../../objetivos/lib/objective.interface";
import { Trash2 } from "lucide-react";

interface Props {
  categoryObjectives: ObjectiveResource[];
  setDeleteDetailId: (id: number) => void;
}

export const CategoryObjectivesList = ({
  categoryObjectives,
  setDeleteDetailId,
}: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {categoryObjectives && categoryObjectives.length > 0 ? (
        categoryObjectives.map((child: ObjectiveResource) => (
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

            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => setDeleteDetailId(child.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No hay datos.</p>
      )}
    </div>
  );
};
