"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import RegenerateEvaluationSheet from "./RegenerateEvaluationSheet";
import CompetencesSyncButton from "./CompetencesSyncButton";
import { LayoutDashboard, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EVALUATION,
  EVALUATION_OBJECTIVE,
} from "../../evaluaciones/lib/evaluation.constans";
import { EVALUATION_PERSON } from "../lib/evaluationPerson.constans";
import EvaluationEligibleWorkersSheet from "../../evaluaciones/components/EvaluationEligibleWorkersSheet";

interface RegenerateEvaluationParams {
  mode: "full_reset" | "sync_with_cycle" | "add_missing_only";
  reset_progress?: boolean;
  force?: boolean;
}

interface Props {
  idEvaluation?: number;
  typeEvaluation?: number;
  handleRegenerate: (params: RegenerateEvaluationParams) => void;
  loadingRegenerate: boolean;
  handleSyncCompetences: () => void;
  loadingSyncCompetences: boolean;
}

const { ABSOLUTE_ROUTE } = EVALUATION;
const { ABSOLUTE_ROUTE: EVALUATION_PERSON_ABSOLUTE_ROUTE } = EVALUATION_PERSON;

export default function EvaluationPersonActions({
  idEvaluation,
  typeEvaluation,
  handleRegenerate,
  loadingRegenerate,
  handleSyncCompetences,
  loadingSyncCompetences,
}: Props) {
  const [openEligibleWorkers, setOpenEligibleWorkers] = useState(false);
  const isNotObjectiveEvaluation =
    typeEvaluation !== undefined &&
    String(typeEvaluation) !== EVALUATION_OBJECTIVE.ID;

  return (
    <div className="flex items-center gap-2 w-full md:justify-end">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpenEligibleWorkers(true)}
      >
        <Users className="w-4 h-4" />
        Agregar Trabajadores
      </Button>
      <Link to={`${ABSOLUTE_ROUTE}/${idEvaluation}`}>
        <Button size="sm" variant="outline" color="primary">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Button>
      </Link>

      <Link to={`${EVALUATION_PERSON_ABSOLUTE_ROUTE}/${idEvaluation}/competencias`}>
        <Button size="sm" variant="outline">
          <TrendingUp className="w-4 h-4" />
          Ver Competencias
        </Button>
      </Link>

      {isNotObjectiveEvaluation && (
        <CompetencesSyncButton
          evaluationId={idEvaluation!}
          onSync={handleSyncCompetences}
          loading={loadingSyncCompetences}
        />
      )}

      <RegenerateEvaluationSheet
        evaluationId={idEvaluation!}
        onRegenerate={handleRegenerate}
        loadingRegenerate={loadingRegenerate}
      />

      <EvaluationEligibleWorkersSheet
        open={openEligibleWorkers}
        onClose={() => setOpenEligibleWorkers(false)}
        evaluationId={idEvaluation!}
      />
    </div>
  );
}
