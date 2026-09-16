"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { CONTRACT } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.constant";
import { useContracts } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.hook";
import {
  deleteContract,
  downloadSignedContract,
  openContractPdf,
  requestContractApproval,
  sendContractToWorker,
} from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.actions";
import ContractActions from "@/features/gp/gestionhumana/gestion-de-personal/contratos/components/ContractActions";
import ContractTable from "@/features/gp/gestionhumana/gestion-de-personal/contratos/components/ContractTable";
import ContractOptions from "@/features/gp/gestionhumana/gestion-de-personal/contratos/components/ContractOptions";
import { contractColumns } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/components/ContractColumns";

export default function ContractPage() {
  const { MODEL, ROUTE } = CONTRACT;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [approvalId, setApprovalId] = useState<number | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useContracts({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteContract(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
    }
  };

  const handleViewPdf = async (id: number) => {
    try {
      await openContractPdf(id);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo generar el PDF del contrato.",
      );
    }
  };

  const handleRequestApproval = async () => {
    if (!approvalId) return;
    setProcessing(true);
    try {
      await requestContractApproval(approvalId);
      await refetch();
      successToast("Solicitud de aprobación enviada a RRHH.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo solicitar la aprobación.",
      );
    } finally {
      setProcessing(false);
      setApprovalId(null);
    }
  };

  const handleSendToWorker = async () => {
    if (!sendingId) return;
    setProcessing(true);
    try {
      await sendContractToWorker(sendingId);
      await refetch();
      successToast("Contrato firmado enviado al trabajador.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo enviar el contrato al trabajador.",
      );
    } finally {
      setProcessing(false);
      setSendingId(null);
    }
  };

  const handleDownloadSigned = async (id: number) => {
    try {
      await downloadSignedContract(id);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo descargar el contrato firmado.",
      );
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
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ContractActions />
      </HeaderTableWrapper>

      <ContractTable
        isLoading={isLoading}
        columns={contractColumns({
          onDelete: setDeleteId,
          onViewPdf: handleViewPdf,
          onRequestApproval: setApprovalId,
          onSendToWorker: setSendingId,
          onDownloadSigned: handleDownloadSigned,
        })}
        data={data?.data || []}
      >
        <ContractOptions search={search} setSearch={setSearch} />
      </ContractTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          description="El contrato quedará anulado y dejará de mostrarse en el listado. ¿Deseas continuar?"
        />
      )}

      {approvalId !== null && (
        <SimpleConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setApprovalId(null)}
          onConfirm={handleRequestApproval}
          title="Solicitar aprobación de firma"
          description="Se enviará un correo a RRHH para aprobar el contrato y continuar con el flujo de firma. ¿Deseas continuar?"
          confirmText="Solicitar"
          icon="success"
          isLoading={processing}
        />
      )}

      {sendingId !== null && (
        <SimpleConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setSendingId(null)}
          onConfirm={handleSendToWorker}
          title="Enviar contrato al trabajador"
          description="Se enviará el contrato firmado por correo al trabajador. ¿Deseas continuar?"
          confirmText="Enviar"
          icon="success"
          isLoading={processing}
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
