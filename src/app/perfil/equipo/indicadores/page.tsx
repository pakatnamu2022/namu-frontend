"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ParticipationChart } from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/components/ParticipationChart";
import {
  CheckCircle2,
  Clock,
  Users,
  XCircle,
  TrendingUp,
  Calendar,
  Target,
  Award,
  BarChart3,
  Building2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Rectangle, XAxis } from "recharts";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLeaderDashboard } from "@/features/profile/team/lib/team.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAllEvaluations } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const SCALE_COLORS: Record<string, string> = {
  Excelente: "hsl(142, 71%, 45%)",
  "Muy Bueno": "hsl(160, 60%, 45%)",
  Satisfactorio: "hsl(47, 91%, 54%)",
  "Necesita desarrollo": "hsl(25, 95%, 53%)",
  "No Cumple": "hsl(0, 72%, 51%)",
};

export default function TeamIndicatorsPage() {
  const router = useNavigate();
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    number | null
  >(null);
  const [open, setOpen] = useState(false);

  const { data: evaluations, isLoading: isLoadingEvaluations } =
    useAllEvaluations();

  const { data, isLoading, refetch, isRefetching } = useLeaderDashboard(
    selectedEvaluationId || 0
  );

  // Auto-select first evaluation if none selected
  useMemo(() => {
    if (evaluations && evaluations.length > 0 && !selectedEvaluationId) {
      setSelectedEvaluationId(evaluations[0].id);
    }
  }, [evaluations, selectedEvaluationId]);

  if (isLoading || !selectedEvaluationId || isLoadingEvaluations) {
    return <FormSkeleton />;
  }

  if (!data) {
    return (
      <div className="h-full bg-background xl:p-6 flex items-center justify-center w-full border-2 border-dashed rounded-lg">
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold mb-2 w-full">
            No se encontraron datos del equipo
          </h2>
          <p className="text-muted-foreground">
            No hay información disponible para mostrar.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => router("/perfil/equipo")}>
            Regresar
          </Button>
        </div>
      </div>
    );
  }

  const { evaluation, team_summary, collaborators, distribution } = data;

  // Adaptar datos para ParticipationChart
  const progressStats = {
    completed_participants: team_summary.completed,
    in_progress_participants: team_summary.in_progress,
    not_started_participants: team_summary.not_started,
    total_participants: team_summary.total_collaborators,
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1600px] space-y-6 px-4">
        {/* Header with Evaluation Selector */}
        <div className="flex items-start justify-between gap-4">
          <EvaluationHeader
            evaluation={evaluation}
            onRefresh={refetch}
            isRefetching={isRefetching}
          />
          <EvaluationSelector
            evaluations={evaluations || []}
            selectedEvaluationId={selectedEvaluationId}
            onSelectEvaluation={setSelectedEvaluationId}
            open={open}
            setOpen={setOpen}
          />
        </div>

        {/* Summary Cards */}
        <SummaryCards teamSummary={team_summary} />

        {/* Progress Chart */}
        <ProgressChartSection teamSummary={team_summary} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ParticipationChart progressStats={progressStats} />
          <ResultsChartSection distribution={distribution} />
        </div>

        {/* Area and Category Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AreaMetricsSection areaMetrics={data.area_metrics} />
          <CategoryMetricsSection categoryMetrics={data.category_metrics} />
        </div>

        {/* Competence Gaps */}
        {data.competence_gaps && data.competence_gaps.length > 0 && (
          <CompetenceGapsSection competenceGaps={data.competence_gaps} />
        )}

        {/* Collaborators Table */}
        <CollaboratorsTable collaborators={collaborators} />
      </div>
    </div>
  );
}

// Evaluation Selector Component
function EvaluationSelector({
  evaluations,
  selectedEvaluationId,
  onSelectEvaluation,
  open,
  setOpen,
}: {
  evaluations: any[];
  selectedEvaluationId: number | null;
  onSelectEvaluation: (id: number) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const selectedEvaluation = evaluations.find(
    (e) => e.id === selectedEvaluationId
  );

  return (
    <div className="shrink-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[400px] justify-between"
          >
            {selectedEvaluation
              ? selectedEvaluation.name
              : "Seleccionar evaluación..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Buscar evaluación..." />
            <CommandList>
              <CommandEmpty>No se encontró ninguna evaluación.</CommandEmpty>
              <CommandGroup>
                {evaluations.map((evaluation) => (
                  <CommandItem
                    key={evaluation.id}
                    value={`${evaluation.name} ${evaluation.cycle} ${evaluation.period}`}
                    onSelect={() => {
                      onSelectEvaluation(evaluation.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedEvaluationId === evaluation.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{evaluation.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {evaluation.cycle} - {evaluation.period} -{" "}
                        {evaluation.statusName}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Header Component
function EvaluationHeader({
  evaluation,
}: {
  evaluation: any;
  onRefresh: () => void;
  isRefetching: boolean;
}) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold">{evaluation.name}</h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(evaluation.start_date).toLocaleDateString("es-ES")} -{" "}
            {new Date(evaluation.end_date).toLocaleDateString("es-ES")}
          </span>
        </div>
        <Badge variant="outline">{evaluation.typeEvaluationName}</Badge>
        <Badge
          variant={evaluation.status === 1 ? "default" : "secondary"}
          className="gap-1"
        >
          {evaluation.statusName}
        </Badge>
      </div>
      <div className="flex gap-4 text-sm mt-2">
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4 text-primary" />
          <span>
            Objetivos: <strong>{evaluation.objectivesPercentage}%</strong>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="h-4 w-4 text-primary" />
          <span>
            Competencias: <strong>{evaluation.competencesPercentage}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

// Summary Cards Component
function SummaryCards({ teamSummary }: { teamSummary: any }) {
  const allKpis = [
    {
      label: "Total Colaboradores",
      value: teamSummary.total_collaborators,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Completadas",
      value: teamSummary.completed,
      percentage: teamSummary.completion_percentage,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "En Progreso",
      value: teamSummary.in_progress,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Sin Iniciar",
      value: teamSummary.not_started,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    {
      label: "Promedio General",
      value: teamSummary.average_result || 0,
      displayValue: teamSummary.average_result?.toFixed(2) || "0",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      suffix: "pts",
    },
    {
      label: "Promedio Objetivos",
      value: teamSummary.average_objectives || 0,
      displayValue: teamSummary.average_objectives?.toFixed(2) || "0",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      suffix: "pts",
    },
    {
      label: "Promedio Competencias",
      value: teamSummary.average_competences || 0,
      displayValue: teamSummary.average_competences?.toFixed(2) || "0",
      icon: Award,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      suffix: "pts",
    },
  ];

  // Filter out KPIs with value <= 0
  const kpis = allKpis.filter((kpi) => {
    const numericValue =
      typeof kpi.value === "number" ? kpi.value : parseFloat(kpi.value);
    return numericValue > 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {kpis.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${kpi.bgColor} ${kpi.color} flex items-center justify-center`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {kpi.label}
                </p>
                <p className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.displayValue || kpi.value}
                  {kpi.suffix && (
                    <span className="text-sm ml-1">{kpi.suffix}</span>
                  )}
                </p>
                {kpi.percentage !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.percentage.toFixed(1)}% del total
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Progress Chart Component
function ProgressChartSection({ teamSummary }: { teamSummary: any }) {
  const progressData = [
    {
      category: "Completados",
      value: teamSummary.completed,
      total: teamSummary.total_collaborators,
      color: "hsl(142, 71%, 45%)",
    },
    {
      category: "En Progreso",
      value: teamSummary.in_progress,
      total: teamSummary.total_collaborators,
      color: "hsl(47, 91%, 54%)",
    },
    {
      category: "Sin Iniciar",
      value: teamSummary.not_started,
      total: teamSummary.total_collaborators,
      color: "hsl(0, 72%, 51%)",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso de Evaluaciones</CardTitle>
        <CardDescription>
          Estado actual del proceso de evaluación del equipo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progressData.map((item, index) => {
            const percentage = ((item.value / item.total) * 100).toFixed(1);

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.value} de {item.total} ({percentage}%)
                  </span>
                </div>
                <Progress value={parseFloat(percentage)} className="h-3" />
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {teamSummary.completion_percentage.toFixed(1)}% de evaluaciones
          completadas <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}

// Results Bar Chart Component
function ResultsChartSection({ distribution }: { distribution: any[] }) {
  const chartData = distribution.map((range) => ({
    rangeLabel: range.label,
    count: range.count,
    percentage: range.percentage,
    fill: SCALE_COLORS[range.label] || "hsl(var(--primary))",
  }));

  const activeIndex = chartData.reduce((maxIndex, item, index, array) => {
    return item.count > array[maxIndex].count ? index : maxIndex;
  }, 0);

  const chartConfig: ChartConfig = chartData.reduce<ChartConfig>(
    (config, item) => ({
      ...config,
      [item.rangeLabel]: { label: item.rangeLabel, color: item.fill },
    }),
    { count: { label: "Colaboradores" } }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribución de Resultados</CardTitle>
        <CardDescription>Colaboradores por nivel de desempeño</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="rangeLabel"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => {
                    const payload = item?.payload as (typeof chartData)[0];
                    return [
                      `${value} colaborador${
                        value !== 1 ? "es" : ""
                      } (${payload.percentage.toFixed(1)}%)`,
                      payload?.rangeLabel ?? "",
                    ];
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              radius={8}
              activeIndex={activeIndex}
              activeBar={({ ...props }) => (
                <Rectangle
                  {...props}
                  fillOpacity={0.8}
                  stroke={props.payload.fill}
                />
              )}
            >
              {chartData.map((item) => (
                <Cell key={item.rangeLabel} fill={item.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Area Metrics Section
function AreaMetricsSection({ areaMetrics }: { areaMetrics: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Métricas por Área
        </CardTitle>
        <CardDescription>Desempeño promedio por área</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {areaMetrics.map((area, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{area.area}</p>
                  <p className="text-xs text-muted-foreground">
                    {area.completed} de {area.total} completados
                  </p>
                </div>
                <Badge color="secondary" className="text-base font-bold">
                  {area.average_result.toFixed(2)} pts
                </Badge>
              </div>
              <Progress
                value={(area.completed / area.total) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Category Metrics Section
function CategoryMetricsSection({
  categoryMetrics,
}: {
  categoryMetrics: any[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Métricas por Categoría
        </CardTitle>
        <CardDescription>Desempeño promedio por categoría</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryMetrics.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{category.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {category.completed} de {category.total} completados
                  </p>
                </div>
                <Badge color="secondary" className="text-base font-bold">
                  {category.average_result.toFixed(2)} pts
                </Badge>
              </div>
              <Progress
                value={(category.completed / category.total) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Competence Gaps Section
function CompetenceGapsSection({ competenceGaps }: { competenceGaps: any[] }) {
  const topGaps = competenceGaps.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Brechas de Competencias
        </CardTitle>
        <CardDescription>
          Top 5 competencias con mayor brecha de desarrollo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topGaps.map((gap, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-medium flex-1 line-clamp-2">
                  {gap.competence_name}
                </p>
                <Badge color="destructive">
                  {gap.gap_percentage}% brecha
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  Promedio: {gap.average_score.toFixed(2)} / {gap.max_score}
                </span>
                <span>•</span>
                <span>{gap.evaluations_count} evaluaciones</span>
              </div>
              <Progress value={100 - gap.gap_percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Collaborators Table Component
function CollaboratorsTable({ collaborators }: { collaborators: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Colaboradores</CardTitle>
        <CardDescription>
          Listado completo con resultados individuales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Área</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
                <TableHead className="text-right">Objetivos</TableHead>
                <TableHead className="text-right">Competencias</TableHead>
                <TableHead className="text-center">Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        DNI: {collaborator.dni}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {collaborator.position}
                  </TableCell>
                  <TableCell className="text-sm">{collaborator.area}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        collaborator.is_completed ? "default" : "secondary"
                      }
                    >
                      {collaborator.status_label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {collaborator.result.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {collaborator.objectives_result.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {collaborator.competences_result.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={collaborator.completion_rate}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {collaborator.completion_rate}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
