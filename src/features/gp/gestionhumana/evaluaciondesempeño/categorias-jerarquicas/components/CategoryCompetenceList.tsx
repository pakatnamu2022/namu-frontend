import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompetenceResource } from "../../competencias/lib/competence.interface";
import { Trash2 } from "lucide-react";

interface Props {
  categoryCompetences: CompetenceResource[];
  setDeleteDetailId: (id: number) => void;
}

export const CategoryCompetencesList = ({
  categoryCompetences,
  setDeleteDetailId,
}: Props) => {
  return (
    <div className="flex flex-col gap-3">
      {categoryCompetences && categoryCompetences.length > 0 ? (
        categoryCompetences.map((child: CompetenceResource) => (
          <div
            key={String(child.id)}
            className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col gap-2 min-w-0">
              <p className="text-sm font-semibold leading-snug">
                {child.nombre}
              </p>
              {child.subcompetences && child.subcompetences.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {child.subcompetences.map((sub: any) => (
                    <Badge key={sub.id} color="muted" size="sm">
                      {sub.nombre || "—"}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <Button
              variant={"ghost"}
              size={"icon"}
              className="shrink-0"
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
