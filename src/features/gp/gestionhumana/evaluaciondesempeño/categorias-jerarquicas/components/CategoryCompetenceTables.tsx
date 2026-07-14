import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { HierarchicalCategoryCompetenceResource } from "../../categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.interface";

interface Props {
  competences: HierarchicalCategoryCompetenceResource[];
  handleSwitchChange: (id: number, checked: boolean) => void;
  isPending: boolean;
  handleUpdateGoalCell: (id: number, value: number) => void;
  handleUpdateWeightCell: (id: number, value: number) => void;
}

export const CategoryCompetenceTable = ({
  competences,
  handleSwitchChange,
  isPending,
}: Props) => {
  return (
    <div className="flex flex-col gap-3">
      {competences.map((competence) => (
        <div
          key={competence.id}
          className="flex flex-col gap-2 rounded-lg bg-muted/40 p-3 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-primary">
              {competence.competence.nombre}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">
                {competence.active ? "Activo" : "Inactivo"}
              </span>
              <Switch
                disabled={isPending}
                checked={competence.active}
                onCheckedChange={(checked) => {
                  handleSwitchChange(competence.id, checked);
                }}
              />
            </div>
          </div>

          {competence.competence.subcompetences.length > 0 && (
            <div className="w-full overflow-hidden rounded-lg bg-background shadow-sm">
              <Table className="w-full text-xs md:text-sm">
                <TableHeader className="bg-muted/60 sticky top-0 z-10">
                  <TableRow className="text-nowrap h-8">
                    {["Nombre", "Definición"].map((header) => (
                      <TableHead
                        className="h-8 font-medium text-muted-foreground"
                        key={header}
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competence.competence.subcompetences.map((subcompetence) => (
                    <TableRow key={subcompetence.id} className="hover:bg-muted/30">
                      <TableCell className="py-2 font-medium whitespace-nowrap">
                        {subcompetence.nombre}
                      </TableCell>
                      <TableCell className="py-2 text-muted-foreground">
                        {subcompetence.definicion || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
