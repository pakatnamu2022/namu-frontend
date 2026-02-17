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
import type { LeaderStatusEvaluationResource } from "../lib/evaluationPerson.interface";
import { getResultRateColorBadge } from "../lib/evaluationPerson.function";
import { sendReminderToLeader } from "../lib/evaluationPerson.actions";
import { errorToast, successToast } from "@/core/core.function";
import TeamMembersModal from "./TeamMembersModal";

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
      const count = row.original.team_evaluation_stats.total_team_members ?? 0;
      const [showTeamModal, setShowTeamModal] = useState(false);

      return (
        <>
          <div className="flex justify-center items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5"
              onClick={() => setShowTeamModal(true)}
            >
              <Users className="size-4" />
              <Badge color="sky">{count}</Badge>
            </Button>
          </div>

          <TeamMembersModal
            open={showTeamModal}
            onOpenChange={setShowTeamModal}
            evaluationId={evaluationId}
            leaderId={row.original.person_id}
            leaderName={row.original.name}
          />
        </>
      );
    },
  },
  {
    accessorKey: "team_evaluation_stats.completion_percentage",
    header: "Progreso General",
    cell: ({ row }) => {
      const percentage =
        row.original.team_evaluation_stats?.completion_percentage ?? 0;
      const completed =
        row.original.team_evaluation_stats?.completed_members ?? 0;
      const total = row.original.team_evaluation_stats?.total_team_members ?? 0;
      return (
        <div className="flex justify-center items-center gap-1">
          <Badge color={getResultRateColorBadge(percentage)}>
            {percentage.toFixed(0)}%
          </Badge>
          <Badge color="muted">
            {completed}/{total}
          </Badge>
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
      return (
        <div className="flex justify-center items-center gap-1">
          <Badge color="blue" className="text-xs">
            {evaluated}
          </Badge>
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
      return (
        <div className="flex justify-center items-center gap-1">
          <Badge color="purple" className="text-xs">
            {evaluated}
          </Badge>
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
          successToast(
            response.message ?? "Recordatorio enviado correctamente.",
          );
        } catch (error: any) {
          errorToast(
            error.response?.data?.message ?? "Error al enviar el recordatorio.",
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
                <AlertDialogAction
                  onClick={handleSendReminder}
                  disabled={isLoading}
                >
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
