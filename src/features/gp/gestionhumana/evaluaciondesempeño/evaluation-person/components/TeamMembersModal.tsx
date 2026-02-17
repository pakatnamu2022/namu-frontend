"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useTeamMembersByLeader } from "../lib/evaluationPerson.hook";
import { getProgressColorBadge } from "../lib/evaluationPerson.function";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface TeamMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluationId: number;
  leaderId: number;
  leaderName: string;
}

export default function TeamMembersModal({
  open,
  onOpenChange,
  evaluationId,
  leaderId,
  leaderName,
}: TeamMembersModalProps) {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useTeamMembersByLeader(
    evaluationId,
    leaderId,
    open,
    {
      page,
      per_page: perPage,
    },
  );

  const teamMembers = data?.data || [];
  const leader = data?.leader;

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Miembros del Equipo - ${leader?.name || leaderName}`}
      subtitle="Revisa el progreso de evaluación de cada miembro del equipo."
      size="4xl"
      childrenFooter={
        teamMembers.length > 0 && data?.meta ? (
          <DataTablePagination
            page={page}
            totalPages={data.meta.last_page || 1}
            onPageChange={setPage}
            per_page={perPage}
            setPerPage={() => {}} // Fixed per_page at 10
            totalData={data.meta.total || 0}
          />
        ) : undefined
      }
    >
      {isLoading ? (
        <FormSkeleton />
      ) : (
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <h4 className="font-semibold text-base">{member.name}</h4>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>DNI: {member.dni}</span>
                    <span>•</span>
                    <span>{member.position}</span>
                    <span>•</span>
                    <span>{member.area}</span>
                  </div>
                </div>
                <Badge
                  color={
                    member.evaluation_progress.progress_status === "completado"
                      ? "green"
                      : member.evaluation_progress.progress_status ===
                          "in_progress"
                        ? "amber"
                        : "gray"
                  }
                >
                  {member.evaluation_progress.progress_status_label}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Progreso
                  </p>
                  <Badge
                    color={getProgressColorBadge(
                      member.evaluation_progress.completion_percentage,
                    )}
                  >
                    {member.evaluation_progress.completion_percentage.toFixed(
                      0,
                    )}
                    %
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Objetivos
                  </p>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-base">
                      {member.evaluation_results.objectives_result.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.evaluation_results.objectives_percentage}%
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Competencias
                  </p>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-base">
                      {member.evaluation_results.competences_result.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.evaluation_results.competences_percentage}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GeneralModal>
  );
}
