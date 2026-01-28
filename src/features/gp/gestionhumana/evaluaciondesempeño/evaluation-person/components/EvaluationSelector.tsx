import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface Evaluation {
  id: number;
  name: string;
  period: string;
}

interface EvaluationSelectorProps {
  evaluations: Evaluation[];
  selectedEvaluationId?: number;
  onEvaluationChange: (evaluationId: number) => void;
  onRefresh: () => void;
  isLoadingEvaluations: boolean;
  isSaving: boolean;
}

export default function EvaluationSelector({
  evaluations,
  selectedEvaluationId,
  onEvaluationChange,
  onRefresh,
  isLoadingEvaluations,
  isSaving,
}: EvaluationSelectorProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {isLoadingEvaluations ? (
        <Skeleton className="h-8 w-80" />
      ) : (
        <SearchableSelect
          options={evaluations.map((evaluation) => ({
            value: evaluation.id.toString(),
            label: () => (
              <span className="flex items-center gap-2">
                {evaluation.name}{" "}
                <Badge color="sky">{evaluation.period}</Badge>
              </span>
            ),
          }))}
          onChange={(value: string) => {
            onEvaluationChange(Number(value));
          }}
          value={selectedEvaluationId?.toString() ?? ""}
          placeholder="Selecciona la Evaluación..."
          className="w-auto! min-w-80"
        />
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          color="primary"
          onClick={onRefresh}
          disabled={isSaving}
          className="gap-2"
        >
          <RefreshCw className={`size-4 ${isSaving ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>
    </div>
  );
}
