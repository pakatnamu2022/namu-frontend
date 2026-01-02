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
import PerDiemRequestTable from "@/features/profile/viaticos/components/PerDiemRequestTable";
import { perDiemRequestColumns } from "@/features/profile/viaticos/components/PerDiemRequestColumns";
import PerDiemRequestOptions from "@/features/profile/viaticos/components/PerDiemRequestOptions";
import { useGetPerDiemRequest } from "@/features/profile/viaticos/lib/perDiemRequest.hook";
import { deletePerDiemRequest } from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import HotelReservationDetailSheet from "@/features/profile/viaticos/components/HotelReservationDetailSheet";
import { useNavigate } from "react-router-dom";

export default function PerDiemRequestPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = PER_DIEM_REQUEST;
  const [hotelReservationRequestId, setHotelReservationRequestId] = useState<
    number | null
  >(null);

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
      </HeaderTableWrapper>
      <PerDiemRequestTable
        isLoading={isLoading}
        columns={perDiemRequestColumns({
          onViewDetail: (id) =>
            navigate(`/gp/gestion-humana/viaticos/solicitud-viaticos/${id}`),
          onViewHotelReservation: setHotelReservationRequestId,
          module: "gh",
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

      <HotelReservationDetailSheet
        hotelReservation={
          data?.data?.find((req) => req.id === hotelReservationRequestId)
            ?.hotel_reservation || null
        }
        open={hotelReservationRequestId !== null}
        onOpenChange={(open) => !open && setHotelReservationRequestId(null)}
        requestId={hotelReservationRequestId || undefined}
        module="gh"
      />

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
