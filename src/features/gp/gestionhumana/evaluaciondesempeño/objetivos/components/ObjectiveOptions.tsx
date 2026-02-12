"use client";

import SearchInput from "@/shared/components/SearchInput";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function ObjectiveOptions({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar objetivo..."
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant={"default"}>
              <ArrowUp className="size-4" />
              Ascendente
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Indica que a mayor valor, mejor desempeño
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge color="destructive">
              <ArrowDown className="size-4" />
              Descendente
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Indica que a menor valor, mejor desempeño
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
