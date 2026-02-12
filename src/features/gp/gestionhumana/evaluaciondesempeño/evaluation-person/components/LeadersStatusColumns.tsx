"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
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
import type { Leader } from "../lib/evaluationPerson.interface";
import {
  getProgressColorBadge,
  getResultRateColorBadge,
} from "../lib/evaluationPerson.function";
import { sendReminderToLeader } from "../lib/evaluationPerson.actions";
import { errorToast, successToast } from "@/core/core.function";

export type LeaderStatusColumn = ColumnDef<Leader>;

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
    accessorKey: "team_info",
    header: "Subordinados",
    cell: ({ row }) => {
      const teamInfo = row.original.team_info;
      return (
        <div className="flex justify-center items-center">
          <Badge color="sky">{teamInfo.subordinates_count}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "evaluation_status.progress_status_label",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.evaluation_status;
      const colorMap: Record<string, "green" | "amber" | "orange" | "red" | "gray"> = {
        completed: "green",
        in_progress: "amber",
        not_started: "gray",
      };
      return (
        <div className="flex justify-center items-center">
          <Badge color={colorMap[status.progress_status] || "gray"}>
            {status.progress_status_label}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "evaluation_status.completion_percentage",
    header: "Progreso",
    cell: ({ row }) => {
      const percentage = row.original.evaluation_status.completion_percentage;
      return (
        <div className="flex justify-center items-center">
          <Badge color={getProgressColorBadge(percentage)}>
            {percentage.toFixed(0)}%
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "evaluation_status.objectives_result",
    header: "Objetivos",
    cell: ({ row }) => {
      const result = row.original.evaluation_status.objectives_result;
      return (
        <div className="flex justify-center items-center">
          <Badge color={getResultRateColorBadge(result)}>
            {result.toFixed(2)}%
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "evaluation_status.competences_result",
    header: "Competencias",
    cell: ({ row }) => {
      const result = row.original.evaluation_status.competences_result;
      return (
        <div className="flex justify-center items-center">
          <Badge color={getResultRateColorBadge(result)}>
            {result.toFixed(2)}%
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "evaluation_status.final_result",
    header: "Resultado Final",
    cell: ({ row }) => {
      const result = row.original.evaluation_status.final_result;
      return (
        <div className="flex justify-center items-center">
          <Badge color={getResultRateColorBadge(result)}>
            {result.toFixed(2)}%
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
