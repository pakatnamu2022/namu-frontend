"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import PerDiemRequestActions from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/components/PerDiemRequestActions";
import PerDiemRequestTable from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/components/PerDiemRequestTable";
import { perDiemRequestColumns } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/components/PerDiemRequestColumns";
import PerDiemRequestOptions from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/components/PerDiemRequestOptions";
import { useGetPerDiemRequest } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.hook";
import { deletePerDiemRequest } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { PER_DIEM_REQUEST } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { useNavigate } from "react-router-dom";

export default function PerDiemRequestPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE, ROUTE_UPDATE } = PER_DIEM_REQUEST;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useGetPerDiemRequest({
    params: {
      page,
      search,
      per_page,
    },
  });

  const handleUpdate = (id: number) => {
    router(`${ROUTE_UPDATE}/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePerDiemRequest(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
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
          subtitle={"Solicitudes de Viáticos"}
          icon={currentView.icon}
        />
        <PerDiemRequestActions permissions={permissions} />
      </HeaderTableWrapper>
      <PerDiemRequestTable
        isLoading={isLoading}
        columns={perDiemRequestColumns({
          onDelete: setDeleteId,
          onUpdate: handleUpdate,
          permissions,
        })}
        data={data?.data || []}
      >
        <PerDiemRequestOptions search={search} setSearch={setSearch} />
      </PerDiemRequestTable>

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
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
