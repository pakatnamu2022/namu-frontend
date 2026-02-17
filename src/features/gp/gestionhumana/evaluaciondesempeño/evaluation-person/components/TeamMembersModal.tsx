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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-all"
            >
              {/* Header Section */}
              <div className="bg-muted/50 px-6 py-4 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <h4 className="font-semibold text-lg leading-tight">
                      {member.name}
                    </h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="font-medium">DNI:</span>
                      <span>{member.dni}</span>
                    </div>
                  </div>
                  <Badge
                    className="shrink-0"
                    color={
                      member.evaluation_progress.progress_status === "completado"
                        ? "green"
                        : member.evaluation_progress.progress_status ===
                            "en_proceso"
                          ? "amber"
                          : "red"
                    }
                  >
                    {member.evaluation_progress.progress_status_label}
                  </Badge>
                </div>
              </div>

              {/* Info Section */}
              <div className="px-6 py-3 bg-background">
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Cargo:</span>
                    <span className="font-medium">{member.position}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Área:</span>
                    <span className="font-medium">{member.area}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Section */}
              <div className="px-6 py-5 bg-background border-t">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center space-y-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Progreso
                    </p>
                    <Badge
                      className="text-base px-3 py-1"
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

                  <div className="text-center space-y-2.5 border-x px-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Objetivos
                    </p>
                    <div className="space-y-1">
                      <p className="font-bold text-xl leading-none">
                        {member.evaluation_results.objectives_result.toFixed(2)}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        Peso: {member.evaluation_results.objectives_percentage}%
                      </p>
                    </div>
                  </div>

                  <div className="text-center space-y-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Competencias
                    </p>
                    <div className="space-y-1">
                      <p className="font-bold text-xl leading-none">
                        {member.evaluation_results.competences_result.toFixed(2)}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        Peso: {member.evaluation_results.competences_percentage}%
                      </p>
                    </div>
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
