"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PAR_EVALUATOR } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/lib/par-evaluator.constant";
import { ParEvaluatorForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/components/ParEvaluatorForm";
import { useAllWorkers } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import { ParEvaluatorSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/lib/par-evaluator.schema";
import { STATUS_WORKER } from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import {
  storeMultipleParEvaluators,
  getAllParEvaluators,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/lib/par-evaluator.actions";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ParEvaluatorResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/lib/par-evaluator.interface";

const { MODEL, ROUTE, ABSOLUTE_ROUTE } = PAR_EVALUATOR;

export default function AddParEvaluatorPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEvaluators, setExistingEvaluators] = useState<
    ParEvaluatorResource[]
  >([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const workerIdParam = searchParams.get("worker_id");

  const { data: workersData, isLoading: loadingWorkers } = useAllWorkers({
    status_id: STATUS_WORKER.ACTIVE,
  });

  // Cargar evaluadores existentes si viene un worker_id en la URL
  useEffect(() => {
    const loadExistingEvaluators = async () => {
      if (!workerIdParam) return;

      setLoadingExisting(true);
      try {
        const evaluators = await getAllParEvaluators({
          params: {
            worker_id: Number(workerIdParam),
          },
        });
        setExistingEvaluators(evaluators || []);
      } catch (error) {
        console.error("Error loading existing evaluators:", error);
        setExistingEvaluators([]);
      } finally {
        setLoadingExisting(false);
      }
    };

    loadExistingEvaluators();
  }, [workerIdParam]);

  const handleSubmit = async (data: ParEvaluatorSchema) => {
    setIsSubmitting(true);
    try {
      const payload = {
        worker_id: Number(data.worker_id),
        mate_ids: data.mate_ids,
      };
      await storeMultipleParEvaluators(payload);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ABSOLUTE_ROUTE);
    } catch (error: any) {
      errorToast(
        ERROR_MESSAGE(MODEL, "create", error?.response?.data?.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  const isLoading = loadingWorkers || loadingExisting;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={`Agregar ${MODEL.name}`}
          subtitle={`Asignar evaluadores pares a un trabajador`}
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      <div className="bg-card rounded-lg border p-6 max-w-4xl mx-auto">
        {isLoading ? (
          <FormSkeleton />
        ) : (
          <ParEvaluatorForm
            persons={workersData || []}
            existingEvaluators={existingEvaluators}
            defaultValues={{
              worker_id: workerIdParam || undefined,
              mate_ids: [],
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            showCancelButton={true}
          />
        )}
      </div>
    </div>
  );
}
