"use client";

import TitleComponent from "@/shared/components/TitleComponent";
import { useEffect, useState, useMemo } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useEvaluationsByPersonToEvaluate } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.hook";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import TeamGrid from "@/features/profile/team/components/TeamGrid";
import TeamOptions from "@/features/profile/team/components/TeamOptions";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { EvaluationPersonResultModal } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonResultModal";
import { useQueryClient } from "@tanstack/react-query";
import TeamActions from "@/features/profile/team/components/TeamActions";
import { useNavigate } from "react-router-dom";
import {
  filterByEvaluatorType,
  getUserEvaluatorTypeCounts,
} from "@/features/profile/team/lib/teamHelpers";
import PageWrapper from "@/shared/components/PageWrapper";
import { useActivePerformanceEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/lib/performance-evaluation.hook";

export default function TeamPage() {
  const { user } = useAuthStore();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [evaluatorTypeFilter, setEvaluatorTypeFilter] = useState<number | null>(
    null
  );
  const [selectedWorker, setSelectedWorker] = useState<WorkerResource | null>(
    null
  );
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const { data: activeEvaluation } = useActivePerformanceEvaluation();

  const { data, isLoading } = useEvaluationsByPersonToEvaluate(
    user?.partner_id,
    !!user?.partner_id && user.subordinates > 0 && !!activeEvaluation?.id,
    {
      page,
      search,
    }
  );

  // Filtrar datos por tipo de evaluador
  const filteredData = useMemo(() => {
    return filterByEvaluatorType(data, evaluatorTypeFilter, user?.partner_id);
  }, [data, evaluatorTypeFilter, user?.partner_id]);

  // Calcular contadores por tipo de evaluador
  const evaluatorTypeCounts = useMemo(() => {
    return getUserEvaluatorTypeCounts(data, user?.partner_id);
  }, [data, user?.partner_id]);
  useEffect(() => {
    setPage(1);
  }, [search, evaluatorTypeFilter]);

  const getCurrentParams = () => {
    const params = new URLSearchParams();
    if (page !== 1) params.set("page", page.toString());
    if (search) params.set("search", search);
    return params.toString();
  };

  const handleOnEvaluate = (personId: number) => {
    const queryString = getCurrentParams();
    router(
      `/perfil/equipo/${personId}/evaluar${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  const handleOnHistory = (personId: number) => {
    const queryString = getCurrentParams();
    router(
      `/perfil/equipo/${personId}/historial${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  if (!user) return <PageSkeleton />;

  return (
    <PageWrapper>
      <HeaderTableWrapper>
        <TitleComponent
          title={"Evaluación de Guerreros"}
          subtitle={"Gestiona tus evaluaciones asignadas"}
          icon={"Users2"}
        />
        <TeamActions />
      </HeaderTableWrapper>
      <TeamGrid
        isLoading={isLoading}
        data={filteredData}
        onEvaluate={handleOnEvaluate}
        onHistory={handleOnHistory}
      >
        <TeamOptions
          metrics={!!activeEvaluation && activeEvaluation.typeEvaluation !== 0}
          search={search}
          setSearch={setSearch}
          evaluatorTypeFilter={evaluatorTypeFilter}
          setEvaluatorTypeFilter={setEvaluatorTypeFilter}
          counts={evaluatorTypeCounts}
        />
      </TeamGrid>

      {selectedWorker && openDetailModal && (
        <EvaluationPersonResultModal
          queryClient={queryClient}
          open={openDetailModal}
          setOpen={(o) => {
            setOpenDetailModal(o);
            if (!o) {
              setTimeout(() => setSelectedWorker(null), 220);
            }
          }}
          person={selectedWorker}
          evaluation_id={Number(1)}
        />
      )}
    </PageWrapper>
  );
}
