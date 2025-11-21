"use client";

import SearchInput from "@/shared/components/SearchInput";
import { WORKER } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.constant";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { PAR_EVALUATOR } from "../lib/par-evaluator.constant";

const { MODEL } = WORKER;

export default function ParEvaluatorOptions({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-between w-full">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={`Buscar ${MODEL.name}`}
      />
      <Link to={PAR_EVALUATOR.ROUTE_ADD}>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </Link>
    </div>
  );
}
