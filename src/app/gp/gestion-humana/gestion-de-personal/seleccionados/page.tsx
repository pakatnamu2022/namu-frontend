"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DataTable } from "@/shared/components/DataTable";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import { SELECTED_WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/seleccionados/lib/selectedWorker.constant";
import { useSelectedWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/seleccionados/lib/selectedWorker.hook";
import {
  changeWorkerLifeStatus,
  generateWorkerUser,
  rehireSelectedWorker,
  sendWorkerWelcomeEmail,
  uploadSignedOfferLetter,
} from "@/features/gp/gestionhumana/gestion-de-personal/seleccionados/lib/selectedWorker.actions";
import { SelectedWorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/seleccionados/lib/selectedWorker.interface";
import {
  LifeStatusSchema,
  RehireWorkerSchema,
} from "@/features/gp/gestionhumana/gestion-de-personal/seleccionados/lib/selectedWorker.schema";
import { selectedWorkerColumns } from "@/features/gp/gestionhumana/gestion-de-personal/seleccionados/components/SelectedWorkerColumns";
import ChangeLifeStatusDialog from "@/features/gp/gestionhumana/gestion-de-personal/seleccionados/components/ChangeLifeStatusDialog";
import RehireSelectedWorkerDialog from "@/features/gp/gestionhumana/gestion-de-personal/seleccionados/components/RehireSelectedWorkerDialog";

export default function SelectedWorkersPage() {
  const { ROUTE } = SELECTED_WORKER;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [lifeStatusRow, setLifeStatusRow] = useState<SelectedWorkerResource | null>(
    null,
  );
  const [rehireRow, setRehireRow] = useState<SelectedWorkerResource | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [per_page]);

  const { data, isLoading, refetch } = useSelectedWorkers({ page, per_page });

  const handleUploadSignedLetter = async (
    row: SelectedWorkerResource,
    file: File,
  ) => {
    try {
      await uploadSignedOfferLetter(row.id, file);
      await refetch();
      successToast("Carta oferta firmada subida correctamente.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo subir la carta firmada.",
      );
    }
  };

  const handleSendWelcomeEmail = async (row: SelectedWorkerResource) => {
    try {
      await sendWorkerWelcomeEmail(row.id);
      await refetch();
      successToast("Email de bienvenida enviado.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo enviar el email.",
      );
    }
  };

  const handleGenerateUser = async (row: SelectedWorkerResource) => {
    try {
      const result = await generateWorkerUser(row.id);
      await refetch();
      successToast(result.mensaje);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo generar el usuario.",
      );
    }
  };

  const handleLifeStatus = async (values: LifeStatusSchema) => {
    if (!lifeStatusRow) return;
    setSaving(true);
    try {
      await changeWorkerLifeStatus(lifeStatusRow.id, {
        estado: Number(values.estado),
        fecha: values.fecha,
        motivo: values.motivo || undefined,
      });
      await refetch();
      successToast("Estado actualizado correctamente.");
      setLifeStatusRow(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo actualizar el estado.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRehire = async (values: RehireWorkerSchema) => {
    if (!rehireRow) return;
    setSaving(true);
    try {
      await rehireSelectedWorker(
        rehireRow.id,
        Number(values.proceso_postulacion_id),
      );
      await refetch();
      successToast("Trabajador reingresado al nuevo proceso.");
      setRehireRow(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo reingresar al trabajador.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle="Seguimiento de seleccionados hasta el alta: carta oferta, email de bienvenida, usuario y alta/baja."
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={selectedWorkerColumns({
            onUploadSignedLetter: handleUploadSignedLetter,
            onSendWelcomeEmail: handleSendWelcomeEmail,
            onGenerateUser: handleGenerateUser,
            onLifeStatus: setLifeStatusRow,
            onRehire: setRehireRow,
          })}
          data={data?.data || []}
          isLoading={isLoading}
        />
      </div>

      <ChangeLifeStatusDialog
        worker={lifeStatusRow}
        open={lifeStatusRow !== null}
        onOpenChange={(open) => !open && setLifeStatusRow(null)}
        onConfirm={handleLifeStatus}
        isLoading={saving}
      />

      <RehireSelectedWorkerDialog
        worker={rehireRow}
        open={rehireRow !== null}
        onOpenChange={(open) => !open && setRehireRow(null)}
        onConfirm={handleRehire}
        isLoading={saving}
      />

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
