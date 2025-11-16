import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-2">
      {categoryCompetences && categoryCompetences.length > 0 ? (
        categoryCompetences.map((child: CompetenceResource) => (
          <div
            key={String(child.id)}
            className="flex justify-between gap-1 border-2 px-4 py-1 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <p className="font-semibold text-sm">{child.nombre}</p>
                {child.subcompetences && child.subcompetences.length > 0 ? (
                  <div className="flex flex-col pl-4">
                    {child.subcompetences.map((sub: any) => (
                      <p key={sub.id} className="text-xs text-muted-foreground">
                        {sub.nombre || "—"}
                      </p>
                    ))}
                  </div>
                ) : null}
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
