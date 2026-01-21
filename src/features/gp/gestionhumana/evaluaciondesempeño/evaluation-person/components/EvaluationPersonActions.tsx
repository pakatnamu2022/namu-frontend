"use client";

import { Link } from "react-router-dom";
import RegenerateEvaluationSheet from "./RegenerateEvaluationSheet";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVALUATION } from "../../evaluaciones/lib/evaluation.constans";

interface RegenerateEvaluationParams {
  mode: "full_reset" | "sync_with_cycle" | "add_missing_only";
  reset_progress?: boolean;
  force?: boolean;
}

interface Props {
  idEvaluation?: number;
  handleRegenerate: (params: RegenerateEvaluationParams) => void;
  loadingRegenerate: boolean;
}

const { ABSOLUTE_ROUTE } = EVALUATION;

export default function EvaluationPersonActions({
  idEvaluation,
  handleRegenerate,
  loadingRegenerate,
}: Props) {
  return (
    <div className="flex items-center gap-2 w-full md:justify-end">
      <Link to={`${ABSOLUTE_ROUTE}/${idEvaluation}`}>
        <Button size="sm" variant="outline" color="primary">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Button>
      </Link>
      <RegenerateEvaluationSheet
        onRegenerate={handleRegenerate}
        loadingRegenerate={loadingRegenerate}
      />
    </div>
  );
}
