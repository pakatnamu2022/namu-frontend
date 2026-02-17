"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Users } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LeaderStatusEvaluationResource, Teammember } from "../lib/evaluationPerson.interface";
import {
  getProgressColorBadge,
} from "../lib/evaluationPerson.function";
import { sendReminderToLeader } from "../lib/evaluationPerson.actions";
import { errorToast, successToast } from "@/core/core.function";

export type LeaderStatusColumn = ColumnDef<LeaderStatusEvaluationResource>;

export const LeadersStatusColumns = ({
  evaluationId,
}: {
  evaluationId: number;
}): LeaderStatusColumn[] => [
  {
    accessorKey: "name",
    header: "Líder",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "dni",
    header: "DNI",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "position",
    header: "Cargo",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "area",
    header: "Área",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "sede",
    header: "Sede",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: "team_evaluation_stats.total_team_members",
    header: "Subordinados",
    cell: ({ row }) => {
      const count = row.original.team_members_count ?? 0;
      const [showTeamDialog, setShowTeamDialog] = useState(false);
      const teamMembers = row.original.team_members ?? [];

      return (
        <>
          <div className="flex justify-center items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5"
              onClick={() => setShowTeamDialog(true)}
            >
              <Users className="size-4" />
              <Badge color="sky">{count}</Badge>
            </Button>
          </div>

          <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
            <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Miembros del Equipo - {row.original.name}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {teamMembers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay miembros en el equipo
                  </p>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member: Teammember) => (
                      <div
                        key={member.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{member.name}</h4>
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
                              member.evaluation_progress.progress_status === "completed"
                                ? "green"
                                : member.evaluation_progress.progress_status === "in_progress"
                                ? "amber"
                                : "gray"
                            }
                          >
                            {member.evaluation_progress.progress_status_label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">
                              Progreso
                            </p>
                            <Badge
                              color={getProgressColorBadge(
                                member.evaluation_progress.completion_percentage
                              )}
                            >
                              {member.evaluation_progress.completion_percentage.toFixed(0)}%
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">
                              Objetivos
                            </p>
                            <span className="font-semibold">
                              {member.evaluation_results.objectives_result.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">
                              Competencias
                            </p>
                            <span className="font-semibold">
                              {member.evaluation_results.competences_result.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    accessorKey: "team_evaluation_stats.completion_percentage",
    header: "Progreso General",
    cell: ({ row }) => {
      const percentage = row.original.team_evaluation_stats?.completion_percentage ?? 0;
      const completed = row.original.team_evaluation_stats?.completed_members ?? 0;
      const total = row.original.team_evaluation_stats?.total_team_members ?? 0;
      return (
        <div className="flex flex-col justify-center items-center gap-1">
          <Badge color={getProgressColorBadge(percentage)}>
            {percentage.toFixed(0)}%
          </Badge>
          <span className="text-xs text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "team_evaluation_stats.objectives_evaluated",
    header: "Objetivos",
    cell: ({ row }) => {
      const stats = row.original.team_evaluation_stats;
      const evaluated = stats?.objectives_evaluated ?? 0;
      const total = stats?.total_team_members ?? 0;
      const percentage = total > 0 ? (evaluated / total) * 100 : 0;
      return (
        <div className="flex flex-col justify-center items-center gap-1">
          <Badge color={getProgressColorBadge(percentage)}>
            {percentage.toFixed(0)}%
          </Badge>
          <span className="text-xs text-muted-foreground">
            {evaluated}/{total}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "team_evaluation_stats.competences_evaluated",
    header: "Competencias",
    cell: ({ row }) => {
      const stats = row.original.team_evaluation_stats;
      const evaluated = stats?.competences_evaluated ?? 0;
      const total = stats?.total_team_members ?? 0;
      const percentage = total > 0 ? (evaluated / total) * 100 : 0;
      return (
        <div className="flex flex-col justify-center items-center gap-1">
          <Badge color={getProgressColorBadge(percentage)}>
            {percentage.toFixed(0)}%
          </Badge>
          <span className="text-xs text-muted-foreground">
            {evaluated}/{total}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    size: 60,
    cell: ({ row }) => {
      const leaderId = row.original.person_id;
      const leaderName = row.original.name;
      const [showReminderDialog, setShowReminderDialog] = useState(false);
      const [isLoading, setIsLoading] = useState(false);

      const handleSendReminder = async () => {
        setIsLoading(true);
        try {
          const response = await sendReminderToLeader(evaluationId, leaderId);
          successToast(response.message ?? "Recordatorio enviado correctamente.");
        } catch (error: any) {
          errorToast(
            error.response?.data?.message ?? "Error al enviar el recordatorio."
          );
        } finally {
          setIsLoading(false);
          setShowReminderDialog(false);
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7"
            onClick={() => setShowReminderDialog(true)}
            tooltip="Enviar Recordatorio"
            disabled={isLoading}
          >
            <Bell className="size-4" />
          </Button>

          <AlertDialog
            open={showReminderDialog}
            onOpenChange={setShowReminderDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Enviar Recordatorio</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas enviar un recordatorio a{" "}
                  <strong>{leaderName}</strong> para que complete sus
                  evaluaciones pendientes?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleSendReminder} disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
