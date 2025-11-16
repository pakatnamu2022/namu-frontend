import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HierarchicalCategoryCompetenceResource } from "../../categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.interface";

interface Props {
  competences: HierarchicalCategoryCompetenceResource[];
  handleSwitchChange: (id: number, checked: boolean) => void;
  isPending: boolean;
  handleUpdateGoalCell: (id: number, value: number) => void;
  handleUpdateWeightCell: (id: number, value: number) => void;
}

export const CategoryCompetenceTable = ({ competences }: Props) => {
  return (
    <div className="flex flex-col gap-5">
      {competences.map((competence) => (
        <div key={competence.id} className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-primary">
            {competence.competence.nombre}
          </p>

          <div className="w-full overflow-hidden rounded-xl shadow border">
            <Table className="p-1 w-full text-xs md:text-sm">
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow className="text-nowrap h-8">
                  {["Nombre", "Definición"].map((header) => (
                    <TableHead className="h-8" key={header}>
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {competence.competence.subcompetences.map((subcompetence) => (
                  <TableRow key={subcompetence.id}>
                    <TableCell className="p-1">
                      {subcompetence.nombre}
                    </TableCell>
                    <TableCell className="p-1">
                      {subcompetence.definicion}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};
