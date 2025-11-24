"use client";

import TitleComponent from "@/shared/components/TitleComponent";
import { useEffect, useState, useMemo } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useEvaluationsByPersonToEvaluate } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.hook";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import TeamTable from "@/features/profile/team/components/TeamTable";
import MetricOptions from "@/features/profile/team/components/TeamOptions";
import { teamColumns } from "@/features/profile/team/components/TeamColumns";
import { WorkerResource } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.interface";
import { EvaluationPersonResultModal } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonResultModal";
import { useQueryClient } from "@tanstack/react-query";
import TeamActions from "@/features/profile/team/components/TeamActions";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useNavigate } from "react-router-dom";
import {
  filterByEvaluatorType,
  getUserEvaluatorTypeCounts,
} from "@/features/profile/team/lib/teamHelpers";

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

  const { data, isLoading } = useEvaluationsByPersonToEvaluate(
    user?.partner_id,
    !!user?.partner_id,
    {
      page,
      search,
    }
  );

  // Filtrar datos por tipo de evaluador
  const filteredData = useMemo(() => {
    return filterByEvaluatorType(
      data || [],
      evaluatorTypeFilter,
      user?.partner_id
    );
  }, [data, evaluatorTypeFilter, user?.partner_id]);
  // Calcular contadores por tipo de evaluador
  const evaluatorTypeCounts = useMemo(() => {
    return getUserEvaluatorTypeCounts(data || [], user?.partner_id);
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

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="space-y-4 w-full py-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={"Evaluación de Guerreros"}
          subtitle={"Gestiona tus evaluaciones asignadas"}
          icon={"Users2"}
        />
        <TeamActions />
      </HeaderTableWrapper>
      <TeamTable
        isLoading={isLoading}
        columns={teamColumns({
          onEvaluate: handleOnEvaluate,
          onHistory: handleOnHistory,
        })}
        data={filteredData}
      >
        <MetricOptions
          search={search}
          setSearch={setSearch}
          evaluatorTypeFilter={evaluatorTypeFilter}
          setEvaluatorTypeFilter={setEvaluatorTypeFilter}
          counts={evaluatorTypeCounts}
        />
      </TeamTable>

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
    </div>
  );
}
