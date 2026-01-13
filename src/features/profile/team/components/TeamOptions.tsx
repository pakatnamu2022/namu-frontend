"use client";

import SearchInput from "@/shared/components/SearchInput";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EVALUATOR_TYPES_ARRAY,
  ALL_EVALUATOR_TYPE,
} from "../lib/teamConstants";
import { Badge } from "@/components/ui/badge";

interface TeamOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  evaluatorTypeFilter: number | null;
  setEvaluatorTypeFilter: (value: number | null) => void;
  counts?: Record<number | "all", number>;
  metrics?: boolean;
}

export default function TeamOptions({
  search,
  setSearch,
  evaluatorTypeFilter,
  setEvaluatorTypeFilter,
  counts = { all: 0, 0: 0, 1: 0, 2: 0, 3: 0 },
  metrics = false,
}: TeamOptionsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Tabs de filtrado por tipo de evaluador */}
      {metrics && (
        <Tabs
          value={evaluatorTypeFilter?.toString() ?? "all"}
          onValueChange={(value) =>
            setEvaluatorTypeFilter(value === "all" ? null : Number(value))
          }
        >
          <TabsList className="grid w-full grid-cols-5">
            {/* Tab "Todos" */}
            <TabsTrigger value="all" className="flex items-center gap-2">
              {ALL_EVALUATOR_TYPE.name}
              {counts.all > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {counts.all}
                </Badge>
              )}
            </TabsTrigger>

            {/* Tabs por tipo de evaluador */}
            {EVALUATOR_TYPES_ARRAY.map((type) => {
              const Icon = type.icon;
              const count = counts[type.id] || 0;

              return (
                <TabsTrigger
                  key={type.id}
                  value={type.id.toString()}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {type.description}
                  {count > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 px-1.5 py-0 text-xs"
                    >
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {/* Búsqueda */}
      <div className="flex items-center gap-2 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar persona..."
        />
      </div>
    </div>
  );
}
