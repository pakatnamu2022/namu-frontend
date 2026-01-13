import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ParameterResource } from "../../parametros/lib/parameter.interface";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { getScales } from "../../parametros/lib/parameter.hook";

interface Props {
  selectedParameter?: ParameterResource;
}

export default function CycleParameterInfo({ selectedParameter }: Props) {
  if (!selectedParameter) return null;

  return (
    <div className="border rounded-md mt-2 text-sm bg-muted overflow-hidden">
      <div className="text-sm md:text-base font-semibold text-muted-foreground border-b p-2">
        {selectedParameter.name}
      </div>

      <div className="bg-background p-4">
        <p className="font-medium text-foreground text-xs md:text-sm">
          {selectedParameter.type === "objectives"
            ? "Configuración para la definición y evaluación de objetivos"
            : selectedParameter.type === "competences"
            ? "Configuración para la definición y evaluación de competencias"
            : "Configuración para la definición y evaluación final"}
        </p>

        <div>
          <p className="text-xs md:text-[13px] text-muted-foreground">
            {selectedParameter.type === "objectives"
              ? "Los objetivos se calificarán con un porcentaje exacto tomando como referencia el porcentaje de cumplimiento y la meta del colaborador."
              : selectedParameter.type === "competences"
              ? "Las competencias se calificarán con una escala definida por rangos."
              : "La evaluación final se realizará con base en los resultados obtenidos en las etapas anteriores."}
          </p>
        </div>

        <div className="border-t border-muted mt-3 pt-3">
          <p className="font-medium text-foreground mb-2 text-xs md:text-sm">
            Rangos de resultados
          </p>
          <Table className="lg:w-2/3 w-full text-sm border-none!">
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs md:text-sm text-nowrap">
                <TableHead className="border h-10 px-1">Etiqueta</TableHead>
                <TableHead className="border h-10 px-1">
                  Desde / Mayor a
                </TableHead>
                <TableHead className="border h-10 px-1">Hasta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedParameter.details.map((range, index) => (
                <TableRow key={range.id} className="text-nowrap">
                  <TableCell className="border pl-2 pr-10 py-2">
                    <div
                      className={cn(
                        "rounded w-fit px-2 py-1 text-xs md:text-sm font-medium text-center",
                        getScales(selectedParameter.details.length)[index]
                      )}
                    >
                      {range.label}
                    </div>
                  </TableCell>
                  <TableCell className="border pl-2 text-xs md:text-sm pr-10 py-2">
                    {range.from}
                    {selectedParameter.isPercentage ? "%" : ""}
                  </TableCell>
                  <TableCell className="border pl-2 text-xs md:text-sm pr-10 py-2">
                    {range.to}
                    {selectedParameter.isPercentage ? "%" : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center mt-2 gap-2 text-muted-foreground text-xs md:text-[13px]">
            <Check className="text-green-600 size-4" />
            Se visualizará el rango de resultados en las etiquetas de la
            evaluación.
          </div>
        </div>
      </div>
    </div>
  );
}
