"use client";

import { useEffect, useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import PerDiemRequestTable from "@/features/profile/viaticos/components/PerDiemRequestTable";
import { pendingSettlementsColumns } from "@/features/profile/viaticos/components/PendingSettlementsColumns";
import PerDiemRequestOptions from "@/features/profile/viaticos/components/PerDiemRequestOptions";
import { useGetPendingSettlements } from "@/features/profile/viaticos/lib/perDiemRequest.hook";
import {
  approveSettlement,
  rejectSettlement
} from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { ReviewDialog } from "@/features/profile/viaticos/components/ReviewDialog";
import PerDiemRequestDetailSheet from "@/features/profile/viaticos/components/PerDiemRequestDetailSheet";

export default function ApproveSettlementPage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [reviewAction, setReviewAction] = useState<
    "approved" | "rejected" | null
  >(null);
  const [comments, setComments] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const { MODEL } = PER_DIEM_REQUEST;

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useGetPendingSettlements({
    params: {
      page,
      search,
      per_page,
    },
  });

  const handleApprove = (id: number) => {
    setReviewId(id);
    setReviewAction("approved");
    setComments("");
  };

  const handleReject = (id: number) => {
    setReviewId(id);
    setReviewAction("rejected");
    setComments("");
  };

  const handleConfirmReview = async () => {
    if (!reviewId || !reviewAction) return;

    try {
      if (reviewAction === "approved") {
        await approveSettlement(reviewId, comments || undefined);
      } else {
        if (!comments.trim()) {
          errorToast("El motivo de rechazo es requerido");
          return;
        }
        await rejectSettlement(reviewId, comments);
      }
      await refetch();
      successToast(
        reviewAction === "approved"
          ? "Liquidación aprobada exitosamente"
          : "Liquidación rechazada exitosamente"
      );
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    } finally {
      setReviewId(null);
      setReviewAction(null);
      setComments("");
    }
  };

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Aprobar Liquidaciones"
          subtitle="Aprobar Liquidaciones de Viáticos"
          icon="CheckCircle"
        />
      </HeaderTableWrapper>
      <PerDiemRequestTable
        isLoading={isLoading}
        columns={pendingSettlementsColumns({
          onApprove: handleApprove,
          onReject: handleReject,
          onViewDetail: setDetailId,
        })}
        data={data?.data || []}
      >
        <PerDiemRequestOptions search={search} setSearch={setSearch} />
      </PerDiemRequestTable>

      <ReviewDialog
        isOpen={reviewId !== null}
        reviewAction={reviewAction}
        comments={comments}
        onCommentsChange={setComments}
        onConfirm={handleConfirmReview}
        onCancel={() => {
          setReviewId(null);
          setReviewAction(null);
          setComments("");
        }}
      />

      <PerDiemRequestDetailSheet
        requestId={detailId}
        open={detailId !== null}
        onOpenChange={(open) => !open && setDetailId(null)}
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
