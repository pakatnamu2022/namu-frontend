import { HierarchicalCategoryObjectiveResource } from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditableCell } from "@/src/shared/components/EditableCell";
import { Switch } from "@/components/ui/switch";

interface Props {
  objectives: HierarchicalCategoryObjectiveResource[];
  handleSwitchChange: (id: number, checked: boolean) => void;
  isPending: boolean;
  handleUpdateGoalCell: (id: number, value: number) => void;
  handleUpdateWeightCell: (id: number, value: number) => void;
}

export const CategoryObjectiveTable = ({
  objectives,
  handleSwitchChange,
  isPending,
  handleUpdateGoalCell,
  handleUpdateWeightCell,
}: Props) => {
  return (
    <Table className="p-1 w-full text-xs md:text-sm">
      <TableHeader className="bg-muted sticky top-0 z-10">
        <TableRow className="text-nowrap h-8">
          {["", "Objetivo", "Meta", "Peso"].map((header) => (
            <TableHead className="h-8" key={header}>
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {objectives.map((objective) => (
          <TableRow key={objective.id}>
            <TableCell className="p-1">
              <Switch
                disabled={isPending}
                checked={objective.active}
                onCheckedChange={(checked) => {
                  handleSwitchChange(objective.id, checked);
                }}
              />
            </TableCell>
            <TableCell className="p-1">{objective.objective}</TableCell>
            <TableCell className="p-1">
              <EditableCell
                id={objective.id}
                value={objective.goal}
                onUpdate={handleUpdateGoalCell}
              />
            </TableCell>
            <TableCell className="p-1">
              <EditableCell
                id={objective.id}
                value={objective.weight}
                onUpdate={handleUpdateWeightCell}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
