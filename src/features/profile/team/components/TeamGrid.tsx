import { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";
import { TeamCard } from "./TeamCard";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Props {
  data?: EvaluationPersonResultResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onEvaluate: (personId: number) => void;
  onHistory: (personId: number) => void;
}

export default function TeamGrid({
  data,
  children,
  isLoading,
  onEvaluate,
  onHistory,
}: Props) {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    pendientes: true,
    enProgreso: true,
    completadas: true,
  });

  // Separar y ordenar evaluaciones por estado
  const sortedData = [...(data || [])].sort((a, b) => {
    const progressA = a.statistics.overall_completion_rate;
    const progressB = b.statistics.overall_completion_rate;

    // Pendientes (0%) primero
    if (progressA === 0 && progressB > 0) return -1;
    if (progressA > 0 && progressB === 0) return 1;

    // En progreso (1-99%) en medio
    if (progressA < 100 && progressB === 100) return -1;
    if (progressA === 100 && progressB < 100) return 1;

    // Dentro del mismo grupo, ordenar por progreso descendente
    return progressB - progressA;
  });

  // Agrupar por estado
  const pendingEvaluations = sortedData.filter(
    (item) => item.statistics.overall_completion_rate === 0
  );
  const inProgressEvaluations = sortedData.filter(
    (item) =>
      item.statistics.overall_completion_rate > 0 &&
      item.statistics.overall_completion_rate < 100
  );
  const completedEvaluations = sortedData.filter(
    (item) => item.statistics.overall_completion_rate === 100
  );

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const renderSection = (
    title: string,
    items: EvaluationPersonResultResource[],
    sectionKey: string
  ) => {
    if (items.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="space-y-3">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </button>
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <TeamCard
                key={item.person.id}
                data={item}
                onEvaluate={onEvaluate}
                onHistory={onHistory}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros y opciones */}
      {children}

      {/* Grid de tarjetas */}
      {isLoading ? (
        <FormSkeleton />
      ) : data && data.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>No se encontraron evaluaciones</EmptyTitle>
            <EmptyDescription>
              No hay guerreros asignados para evaluar en este momento. Revisa el
              dashboard del líder para ver más detalles.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("/perfil/equipo/indicadores")}>
              Ver Indicadores
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-8">
          {renderSection("Pendientes", pendingEvaluations, "pendientes")}
          {renderSection("En Progreso", inProgressEvaluations, "enProgreso")}
          {renderSection("Completadas", completedEvaluations, "completadas")}
        </div>
      )}
    </div>
  );
}
