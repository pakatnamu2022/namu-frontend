import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

interface Evaluation {
  id: number;
  name: string;
  period: string;
}

interface NoEvaluationMessageProps {
  title: string;
  description: string;
  evaluations?: Evaluation[];
  selectedEvaluationId?: number;
  onEvaluationChange?: (evaluationId: number) => void;
  isLoadingEvaluations?: boolean;
  showSelector?: boolean;
  actions?: ReactNode;
}

export default function NoEvaluationMessage({
  title,
  description,
  evaluations = [],
  selectedEvaluationId,
  onEvaluationChange,
  isLoadingEvaluations = false,
  showSelector = true,
  actions,
}: NoEvaluationMessageProps) {
  return (
    <div className="w-full py-4">
      <Card className="border-none shadow-none">
        <CardContent className="mx-auto max-w-7xl">
          <CardHeader className="space-y-4 p-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              {showSelector && onEvaluationChange && (
                <div className="flex items-center gap-2">
                  {isLoadingEvaluations ? (
                    <Skeleton className="h-8 w-80" />
                  ) : (
                    <SearchableSelect
                      options={evaluations.map((evaluation) => ({
                        value: evaluation.id.toString(),
                        label: () => (
                          <span className="flex items-center gap-2">
                            {evaluation.name}{" "}
                            <Badge variant={"tertiary"} className="text-[10px]">
                              {evaluation.period}
                            </Badge>
                          </span>
                        ),
                      }))}
                      onChange={(value: string) => {
                        onEvaluationChange(Number(value));
                      }}
                      value={selectedEvaluationId?.toString() ?? ""}
                      placeholder="Selecciona la Evaluación..."
                      className="w-80!"
                    />
                  )}
                </div>
              )}
              {actions}
            </div>
          </CardHeader>
        </CardContent>
      </Card>
    </div>
  );
}
