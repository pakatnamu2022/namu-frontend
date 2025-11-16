"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash, ChevronDown } from "lucide-react";

interface SubCompetenceListProps {
  items: {
    id?: number;
    nombre: string;
    definicion?: string | null;
    level1?: string | null;
    level2?: string | null;
    level3?: string | null;
    level4?: string | null;
    level5?: string | null;
  }[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function ParameterDetailList({
  items,
  onEdit,
  onDelete,
}: SubCompetenceListProps) {
  return (
    <div className="space-y-2">
      {items.map((field, index) => (
        <Collapsible key={field.id ?? index}>
          <div className="flex items-center justify-between border rounded-sm px-4 py-2 bg-background">
            <div className="flex items-center justify-between h-full w-full">
              <p className="text-sm font-medium h-full">{field.nombre}</p>
              <CollapsibleTrigger
                className={`${buttonVariants({
                  variant: "outline",
                  size: "icon",
                })} flex text-left group aspect-square items-center justify-center h-full`}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
            </div>

            <div className="flex gap-2 pl-2 h-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => onEdit(index)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => onDelete(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <CollapsibleContent className="text-xs text-muted-foreground bg-muted/50 rounded-b-sm px-4 py-2 space-y-1">
            {field.definicion && (
              <p>
                <span className="font-medium">Definición:</span>{" "}
                {field.definicion}
              </p>
            )}
            {[1, 2, 3, 4, 5].map((lvl) => {
              const value = field[`level${lvl}` as keyof typeof field];
              return value ? (
                <p key={lvl}>
                  <span className="font-medium">Nivel {lvl}:</span> {value}
                </p>
              ) : null;
            })}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
