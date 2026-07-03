"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { EvaluationPersonCompetenceDetailGroup } from "../lib/evaluationPersonCompetenceDetail.interface";
import { EVALUATOR_TYPES } from "../lib/evaluation.constans";

const evaluatorTypeColors = ["blue", "indigo", "amber", "emerald"] as const;

function evaluatorTypeLabel(type: number) {
  const label = EVALUATOR_TYPES.find((t) => t.value === type.toString())?.label;
  return typeof label === "function" ? label() : label ?? "-";
}

interface Props {
  groups: EvaluationPersonCompetenceDetailGroup[];
  isLoading?: boolean;
  rowSelection: RowSelectionState;
  onRowSelectionChange: (value: RowSelectionState) => void;
}

export default function EvaluationCompetenceDetailGroupedList({
  groups,
  isLoading,
  rowSelection,
  onRowSelectionChange,
}: Props) {
  const toggleSub = (id: number, checked: boolean) => {
    const next = { ...rowSelection };
    if (checked) next[String(id)] = true;
    else delete next[String(id)];
    onRowSelectionChange(next);
  };

  const toggleGroup = (
    group: EvaluationPersonCompetenceDetailGroup,
    checked: boolean
  ) => {
    const next = { ...rowSelection };
    group.subcompetences.forEach((sub) => {
      if (checked) next[String(sub.id)] = true;
      else delete next[String(sub.id)];
    });
    onRowSelectionChange(next);
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-3">
        <FormSkeleton />
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="w-full rounded-2xl shadow-xs p-6 text-center text-sm text-muted-foreground">
        No se encontraron registros.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {groups.map((group) => {
        const ids = group.subcompetences.map((sub) => sub.id);
        const selectedCount = ids.filter((id) => rowSelection[String(id)]).length;
        const allSelected = ids.length > 0 && selectedCount === ids.length;
        const partiallySelected = selectedCount > 0 && !allSelected;

        return (
          <div
            key={`${group.person_id}-${group.competence_id}`}
            className="w-full overflow-hidden rounded-2xl bg-background shadow-xs"
          >
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-3">
              <Checkbox
                checked={allSelected ? true : partiallySelected ? "indeterminate" : false}
                onCheckedChange={(checked) => toggleGroup(group, !!checked)}
                aria-label="Seleccionar competencia"
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{group.person}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {group.competence}
                </span>
              </div>
              <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                {group.subcompetences.length}{" "}
                {group.subcompetences.length === 1
                  ? "subcompetencia"
                  : "subcompetencias"}
              </Badge>
            </div>

            <div className="divide-y">
              {group.subcompetences.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-1 hover:bg-muted/30"
                >
                  <Checkbox
                    checked={!!rowSelection[String(sub.id)]}
                    onCheckedChange={(checked) => toggleSub(sub.id, !!checked)}
                    aria-label="Seleccionar sub-competencia"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {sub.sub_competence}
                  </span>
                  <Badge
                    color={evaluatorTypeColors[sub.evaluatorType] ?? "muted"}
                    className="shrink-0 text-xs"
                  >
                    {evaluatorTypeLabel(sub.evaluatorType)}
                  </Badge>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {sub.evaluator}
                  </span>
                  <span className="w-16 shrink-0 text-right text-sm font-semibold">
                    {sub.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
