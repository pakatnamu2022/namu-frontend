"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TelephoneAccountTable from "@/features/gp/tics/telephoneAccount/components/TelephoneAccountTable";
import { useTelephoneAccounts } from "@/features/gp/tics/telephoneAccount/lib/telephoneAccount.hook";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import TelephoneAccountOptions from "@/features/gp/tics/telephoneAccount/components/TelephoneAccountOptions";
import TelephoneAccountActions from "@/features/gp/tics/telephoneAccount/components/TelephoneAccountActions";
import { telephoneAccountColumns } from "@/features/gp/tics/telephoneAccount/components/TelephoneAccountColumns";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteTelephoneAccount } from "@/features/gp/tics/telephoneAccount/lib/telephoneAccount.actions";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { useAllCompanies } from "@/features/gp/gestionsistema/empresa/lib/company.hook";
import TelephoneAccountModal from "@/features/gp/tics/telephoneAccount/components/TelephoneAccountModal";

export default function TelephoneAccountPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAccountId, setEditAccountId] = useState<string | null>(null);
  const { data: companies = [] } = useAllCompanies();

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useTelephoneAccounts({
    page,
    search,
    company_id: companyId,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTelephoneAccount(deleteId);
      await refetch();
      successToast("Cuenta telefónica eliminada correctamente.");
    } catch (error) {
      errorToast("Error al eliminar la cuenta telefónica.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleOpenModal = (accountId?: string) => {
    setEditAccountId(accountId || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditAccountId(null);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("cuentas-telefonicas")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <TelephoneAccountActions onAdd={() => handleOpenModal()} />
      </HeaderTableWrapper>
      <TelephoneAccountTable
        isLoading={isLoading}
        columns={telephoneAccountColumns({
          onDelete: setDeleteId,
          onEdit: handleOpenModal,
        })}
        data={data?.data || []}
      >
        <TelephoneAccountOptions
          search={search}
          setSearch={setSearch}
          companies={companies}
          companyId={companyId}
          setCompanyId={setCompanyId}
        />
      </TelephoneAccountTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <TelephoneAccountModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        accountId={editAccountId}
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
