import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressStats } from "../../evaluaciones/lib/evaluation.interface";
import { TrendingUp } from "lucide-react";

// Componente de Progreso General
interface ProgressChartProps {
  progressStats: ProgressStats;
}

interface ProgressItem {
  category: string;
  value: number;
  total: number;
  color: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  progressStats,
}) => {
  const completionPercentage: number =
    (progressStats.completed_participants / progressStats.total_participants) *
    100;

  const progressData: ProgressItem[] = [
    {
      category: "Completados",
      value: progressStats.completed_participants,
      total: progressStats.total_participants,
      color: "hsl(var(--primary))",
    },
    {
      category: "En Progreso",
      value: progressStats.in_progress_participants,
      total: progressStats.total_participants,
      color: "hsl(var(--muted-foreground))",
    },
    {
      category: "Sin Iniciar",
      value: progressStats.not_started_participants,
      total: progressStats.total_participants,
      color: "hsl(var(--secondary))",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso General de Evaluación</CardTitle>
        <CardDescription>
          Estado actual del proceso de evaluación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progressData.map((item: ProgressItem, index: number) => {
            const percentage: string = (
              (item.value / item.total) *
              100
            ).toFixed(1);
            const width: number = Math.max((item.value / item.total) * 100, 2);

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.value} ({percentage}%)
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-muted/20 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${width}%`,
                        backgroundColor: item.color,
                      }}
                    >
                      {width > 15 && (
                        <span className="text-xs font-medium text-white">
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                  {width <= 15 && (
                    <span
                      className="absolute top-0 text-xs font-medium text-foreground"
                      style={{ left: `${width + 2}%` }}
                    >
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {completionPercentage.toFixed(1)}% de evaluaciones completadas{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {progressStats.completed_participants} de{" "}
          {progressStats.total_participants} participantes han completado su
          evaluación
        </div>
      </CardFooter>
    </Card>
  );
};
