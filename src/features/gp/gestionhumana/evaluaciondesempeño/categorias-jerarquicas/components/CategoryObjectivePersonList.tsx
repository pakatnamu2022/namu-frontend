import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CategoryObjectivePersonResponse } from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.interface";
import { CategoryObjectiveTable } from "./CategoryObjectiveTables";
import { RefreshCw, Scale } from "lucide-react";

interface Props {
  data: CategoryObjectivePersonResponse[];
  handleSwitchChange: (id: number, checked: boolean) => void;
  isPending: boolean;
  handleUpdateGoalCell: (id: number, value: number) => void;
  handleUpdateWeightCell: (id: number, value: number) => void;
  categoryId: number;
  categoryObjectivesCount: number;
  onRegenerateObjectives: (categoryId: number, personId: number) => void;
  onHomogeneousWeights: (categoryId: number, personId: number) => void;
  isRegenerating?: boolean;
  isHomogenizing?: boolean;
}

export const CategoryObjectivePersonList = ({
  data,
  handleSwitchChange,
  isPending,
  handleUpdateGoalCell,
  handleUpdateWeightCell,
  categoryId,
  categoryObjectivesCount,
  onRegenerateObjectives,
  onHomogeneousWeights,
  isRegenerating,
  isHomogenizing,
}: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {data && data.length > 0 ? (
        data.map((child: CategoryObjectivePersonResponse) => {
          const activeObjectives = child.objectives.filter((o) => o.active);
          const activeWeightSum = activeObjectives.reduce(
            (sum, o) => sum + (o.weight ?? 0),
            0
          );
          const hasMissingObjectives =
            child.objectives.length < categoryObjectivesCount;
          const weightsNotEqualHundred = Math.abs(activeWeightSum - 100) > 0.01;

          return (
            <div
              key={String(child.worker.name)}
              className="flex flex-col justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={child.worker.photo} alt={child.worker.name} />
                  <AvatarFallback>
                    {String(child.worker.name)?.[0] ?? "-"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-semibold text-sm">
                    {child.worker.name ?? `#${child.objectives[0]?.id}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {child?.worker.position || "—"}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {hasMissingObjectives && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isRegenerating}
                      onClick={() =>
                        onRegenerateObjectives(categoryId, child.worker.id)
                      }
                      title="Regenerar objetivos faltantes"
                    >
                      <RefreshCw className="size-4 mr-1" />
                      Regenerar faltantes
                    </Button>
                  )}
                  {weightsNotEqualHundred && activeObjectives.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isHomogenizing}
                      onClick={() =>
                        onHomogeneousWeights(categoryId, child.worker.id)
                      }
                      title="Distribuir pesos homogéneamente"
                    >
                      <Scale className="size-4 mr-1" />
                      Homogenizar pesos
                    </Button>
                  )}
                </div>
              </div>
              <div className="pl-12 w-full">
                <div className="overflow-hidden rounded border shadow-xs w-full">
                  <div className="overflow-x-auto w-full">
                    <CategoryObjectiveTable
                      objectives={child.objectives}
                      handleSwitchChange={handleSwitchChange}
                      isPending={isPending}
                      handleUpdateGoalCell={handleUpdateGoalCell}
                      handleUpdateWeightCell={handleUpdateWeightCell}
                    />
                  </div>
                </div>
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
