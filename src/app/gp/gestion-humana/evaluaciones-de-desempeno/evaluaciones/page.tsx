"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useEvaluations } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import {
  deleteEvaluation,
  updateEvaluation,
  sendEvaluationOpened,
  sendEvaluationReminder,
  sendEvaluationClosed,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.actions";
import EvaluationActions from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/EvaluationActions";
import EvaluationTable from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/EvaluationTable";
import { evaluationColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/EvaluationColumns";
import EvaluationOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/EvaluationOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { EVALUATION } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import NotFound from "@/app/not-found";

const { MODEL } = EVALUATION;

export default function EvaluationPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("objectives");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useEvaluations({
    page,
    search,
    type,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEvaluation(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(ERROR_MESSAGE(MODEL, "delete"), error.message.toString());
    } finally {
      setDeleteId(null);
    }
  };

  const handleStatusUpdate = async (id: number, status: number | string) => {
    try {
      await updateEvaluation(id, { status });
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      errorToast(ERROR_MESSAGE(MODEL, "update"), error.message.toString());
    }
  };

  const handleSendOpenedNotification = async (id: number) => {
    try {
      const response = await sendEvaluationOpened(id);
      if (response.success) {
        await refetch();
        successToast("Notificación enviada", response.message);
      } else {
        errorToast("Error al enviar notificación", response.message);
      }
    } catch (error: any) {
      errorToast(
        "Error al enviar notificación",
        error.message?.toString() || "Ocurrió un error inesperado"
      );
    }
  };

  const handleSendReminderNotification = async (id: number) => {
    try {
      const response = await sendEvaluationReminder(id);
      if (response.success) {
        successToast("Recordatorio enviado", response.message);
      } else {
        errorToast("Error al enviar recordatorio", response.message);
      }
    } catch (error: any) {
      errorToast(
        "Error al enviar recordatorio",
        error.message?.toString() || "Ocurrió un error inesperado"
      );
    }
  };

  const handleSendClosedNotification = async (id: number) => {
    try {
      const response = await sendEvaluationClosed(id);
      if (response.success) {
        await refetch();
        successToast("Notificación enviada", response.message);
      } else {
        errorToast("Error al enviar notificación", response.message);
      }
    } catch (error: any) {
      errorToast(
        "Error al enviar notificación",
        error.message?.toString() || "Ocurrió un error inesperado"
      );
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("parametros")) return <NotFound />;
  if (!currentView) return <div>No hay</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <EvaluationActions />
      </HeaderTableWrapper>
      <EvaluationTable
        isLoading={isLoading}
        columns={evaluationColumns({
          onDelete: setDeleteId,
          onStatusUpdate: handleStatusUpdate,
          onSendOpenedNotification: handleSendOpenedNotification,
          onSendReminderNotification: handleSendReminderNotification,
          onSendClosedNotification: handleSendClosedNotification,
        })}
        data={data?.data || []}
      >
        <EvaluationOptions
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
        />
      </EvaluationTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
