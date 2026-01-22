import { useState } from "react";
import { EvaluationHeader } from "./EvaluationHeader";
import { ProgressChart } from "./ProgressChart";
import { KPICards } from "./KPICards";
import { ParticipationChart } from "./ParticipationChart";
import { useActivePerformanceEvaluation } from "../lib/performance-evaluation.hook";
import { exportEvaluationReport } from "../../evaluation-person/lib/evaluationPerson.actions";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useEvaluation } from "../../evaluaciones/lib/evaluation.hook";
import { EvaluationResultsChart } from "../../evaluation-person/components/EvaluationResultsChart";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EVALUATION } from "../../evaluaciones/lib/evaluation.constans";
import PageWrapper from "@/shared/components/PageWrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PersonResultsAccordion from "./PersonResultsAccordion";
import { usePersonResultsByType } from "../lib/usePersonResults";
import { KPICardType, getKPITitle } from "../lib/kpi.utils";

// Tipos de datos
interface ProgressStats {
  total_participants: number;
  completed_participants: number;
  in_progress_participants: number;
  not_started_participants: number;
  completion_percentage: number;
  progress_percentage: number;
}

// Componente Principal
export default function PerformanceEvaluationPage({ id }: { id?: number }) {
  const { ABSOLUTE_ROUTE } = EVALUATION;
  const [selectedCardType, setSelectedCardType] = useState<KPICardType | null>(
    null,
  );
  const [shouldRecalculate, setShouldRecalculate] = useState(false);

  // Always call hooks unconditionally
  const evaluationByIdQuery = useEvaluation(id, {
    recalculate: shouldRecalculate ? 1 : undefined,
  });
  const activeEvaluationQuery = useActivePerformanceEvaluation();

  // Use the appropriate data based on whether id is provided
  const evaluationQuery = id ? evaluationByIdQuery : activeEvaluationQuery;
  const evaluationData = evaluationQuery.data;

  const {
    data: personResults = [],
    isLoading: isLoadingPersons,
    error: personsError,
  } = usePersonResultsByType(
    evaluationData?.id || 0,
    selectedCardType || "total",
  );

  const handleCardClick = (type: KPICardType) => {
    setSelectedCardType(selectedCardType === type ? null : type);
  };

  if (evaluationQuery.isLoading) {
    return <FormSkeleton />;
  }

  if (!evaluationData) {
    return (
      <div className="h-full bg-background border-dashed rounded-2xl border-muted border-2 p-6 flex items-center justify-center">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-muted-foreground mb-4">
            No hay evaluación activa
          </h2>
          <p className="text-muted-foreground mb-8">
            No se encontró ninguna evaluación de desempeño activa en este
            momento. Puedes crear una nueva evaluación o revisar las existentes.
          </p>
          <Link to={ABSOLUTE_ROUTE!}>
            <Button>Ir a Evaluaciones</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDownloadReport = async () => {
    try {
      const blob = await exportEvaluationReport(evaluationData.id);

      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);

      // Crear elemento <Link> temporal para la descarga
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-evaluacion-${evaluationData.id}.xlsx`; // o .xlsx, .csv según el tipo

      // Agregar al DOM, hacer click y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar la URL del objeto
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el reporte:", error);
      // Aquí puedes agregar un toast o notificación de error
    }
  };

  const progressStats: ProgressStats = evaluationData.progress_stats!;

  const handleRefresh = async () => {
    setShouldRecalculate(true);
    await evaluationQuery.refetch();
    setShouldRecalculate(false);
  };

  return (
    <PageWrapper>
      <EvaluationHeader
        onRefresh={handleRefresh}
        refetching={evaluationQuery.isRefetching}
        evaluationData={evaluationData}
        onDownloadReport={handleDownloadReport}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ProgressChart progressStats={progressStats} />
        </div>

        <KPICards
          progressStats={progressStats}
          selectedCardType={selectedCardType}
          onCardClick={handleCardClick}
        />
      </div>

      {selectedCardType && (
        <Accordion
          type="single"
          collapsible
          value={selectedCardType}
          className="px-4"
        >
          <AccordionItem value={selectedCardType}>
            <AccordionTrigger className="text-lg font-semibold uppercase tracking-wider pb-0">
              {getKPITitle(selectedCardType, progressStats)}
            </AccordionTrigger>
            <AccordionContent>
              <PersonResultsAccordion
                data={personResults}
                isLoading={isLoadingPersons}
                error={personsError}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ParticipationChart progressStats={progressStats} />
        <EvaluationResultsChart resultsStats={evaluationData?.results_stats} />
        {/* <ConfigurationCard
            evaluationData={evaluationData}
            progressStats={progressStats}
          /> */}
      </div>
    </PageWrapper>
  );
}
