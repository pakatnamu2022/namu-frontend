"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useTeamMembersByLeader } from "../lib/evaluationPerson.hook";
import { getResultRateColorBadge } from "../lib/evaluationPerson.function";
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
      title={`${leader?.name || leaderName}`}
      subtitle="Miembros del equipo a evaluar"
      size="4xl"
      icon="Users2"
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
              className="border rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col h-full"
            >
              {/* Header Section */}
              <div className="bg-muted/50 px-6 py-4 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <h4 className="font-semibold leading-tight">
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
                      member.evaluation_progress.progress_status ===
                      "completado"
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
              <div className="px-6 py-3 bg-background grow">
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex flex-col items-start">
                    <span className="text-muted-foreground text-xs">CARGO</span>
                    <span className="font-medium">{member.position}</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-muted-foreground text-xs">ÁREA</span>
                    <span className="font-medium">{member.area}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Section - Fixed at bottom */}
              <div className="px-6 py-3 bg-background border-t mt-auto">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center space-y-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Progreso
                    </p>
                    <Badge
                      className="text-base px-3 py-1"
                      color={getResultRateColorBadge(
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
                        {member.evaluation_results.competences_result.toFixed(
                          2,
                        )}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        Peso: {member.evaluation_results.competences_percentage}
                        %
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
