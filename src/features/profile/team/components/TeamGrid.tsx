import { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";
import { TeamCard } from "./TeamCard";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  data: EvaluationPersonResultResource[];
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

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros y opciones */}
      {children}

      {/* Grid de tarjetas */}
      {isLoading ? (
        <FormSkeleton />
      ) : data.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>No se encontraron evaluaciones</EmptyTitle>
            <EmptyDescription>
              No hay guerreros asignados para evaluar en este momento. Revisa el dashboard del líder para ver más detalles.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("/perfil/equipo/indicadores")}>
              Ver Indicadores
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
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
}
