"use client";

import Link from "next/link";
import RegenerateEvaluationSheet from "./RegenerateEvaluationSheet";
import { EVALUATION_ABSOLUTE_ROUTE } from "../../evaluaciones/lib/evaluation.constans";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function EvaluationPersonActions({
  idEvaluation,
  handleRegenerate,
  loadingRegenerate,
}: Props) {
  return (
    <div className="flex items-center gap-2 w-full md:justify-end">
      <Link href={EVALUATION_ABSOLUTE_ROUTE + `/${idEvaluation}`}>
        <Button size={"sm"} variant={"tertiary"}>
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
