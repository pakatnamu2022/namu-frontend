import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CategoryObjectivePersonResponse } from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.interface";
import { CategoryObjectiveTable } from "./CategoryObjectiveTables";

interface Props {
  data: CategoryObjectivePersonResponse[];
  handleSwitchChange: (id: number, checked: boolean) => void;
  isPending: boolean;
  handleUpdateGoalCell: (id: number, value: number) => void;
  handleUpdateWeightCell: (id: number, value: number) => void;
}
export const CategoryObjectivePersonList = ({
  data,
  handleSwitchChange,
  isPending,
  handleUpdateGoalCell,
  handleUpdateWeightCell,
}: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {data && data.length > 0 ? (
        data.map((child: CategoryObjectivePersonResponse) => (
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
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No hay datos.</p>
      )}
    </div>
  );
};
