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
import HotelAgreementActions from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/components/HotelAgreementActions";
import HotelAgreementTable from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/components/HotelAgreementTable";
import { hotelAgreementColumns } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/components/HotelAgreementColumns";
import HotelAgreementOptions from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/components/HotelAgreementOptions";
import { useGetHotelAgreement } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.hook";
import {
  deleteHotelAgreement,
  toggleActiveHotelAgreement,
} from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { HOTEL_AGREEMENT } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { useNavigate } from "react-router-dom";

export default function HotelAgreementPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE, ROUTE_UPDATE } = HOTEL_AGREEMENT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useGetHotelAgreement({
    params: {
      page,
      search,
      per_page,
    },
  });

  const handleUpdate = (id: number) => {
    router(`${ROUTE_UPDATE}/${id}`);
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    try {
      await toggleActiveHotelAgreement(id, {
        active,
      });
      await refetch();
      successToast("Estado actualizado correctamente");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast("Error al actualizar el estado: " + msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHotelAgreement(deleteId);
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
          subtitle={"Convenios de Hoteles"}
          icon={currentView.icon}
        />
        <HotelAgreementActions permissions={permissions} />
      </HeaderTableWrapper>
      <HotelAgreementTable
        isLoading={isLoading}
        columns={hotelAgreementColumns({
          onDelete: setDeleteId,
          onUpdate: handleUpdate,
          onToggleActive: handleToggleActive,
          permissions,
        })}
        data={data?.data || []}
      >
        <HotelAgreementOptions search={search} setSearch={setSearch} />
      </HotelAgreementTable>

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
