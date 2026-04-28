"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { DECLARACION_JURADA_KYC } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.constants";
import { useCustomerKycDeclarations, useDeleteCustomerKycDeclaration } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.hook";
import { declaracionJuradaKycColumns } from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycColumns";
import DeclaracionJuradaKycTable from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycTable";
import DeclaracionJuradaKycOptions from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycOptions";
import DeclaracionJuradaKycActions from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycActions";
import DeclaracionJuradaKycDetailSheet from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycDetailSheet";
import UploadSignedPdfModal from "@/features/ap/comercial/declaracion-jurada-kyc/components/UploadSignedPdfModal";
import { CustomerKycDeclarationResource } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.interface";

export default function DeclaracionJuradaKycPage() {
  const router = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE, ROUTE_UPDATE } = DECLARACION_JURADA_KYC;
  const permissions = useModulePermissions(ROUTE);

  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [detailId, setDetailId] = useState<number | null>(null);
  const [uploadItem, setUploadItem] =
    useState<CustomerKycDeclarationResource | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, status]);

  const { data, isLoading, refetch } = useCustomerKycDeclarations({
    page,
    per_page,
    search,
    status: status || undefined,
  });

  const { mutate: deleteDeclaration } = useDeleteCustomerKycDeclaration();

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
        <DeclaracionJuradaKycActions
          permissions={{ canCreate: permissions.canCreate }}
        />
      </HeaderTableWrapper>

      <DeclaracionJuradaKycTable
        isLoading={isLoading}
        columns={declaracionJuradaKycColumns({
          onUpdate: (id) => router(`${ROUTE_UPDATE}/${id}`),
          onDelete: (id) => deleteDeclaration(id),
          onViewDetail: (item) => setDetailId(item.id),
          onUploadSigned: (item) => setUploadItem(item),
          onPdfDownloaded: () => refetch(),
          permissions: {
            canUpdate: permissions.canUpdate,
            canDelete: permissions.canDelete,
            canUploadSigned: permissions.canUpdate,
          },
        })}
        data={data?.data || []}
      >
        <DeclaracionJuradaKycOptions
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />
      </DeclaracionJuradaKycTable>

      {detailId !== null && (
        <DeclaracionJuradaKycDetailSheet
          open={true}
          onOpenChange={(open) => !open && setDetailId(null)}
          id={detailId}
        />
      )}

      {uploadItem !== null && (
        <UploadSignedPdfModal
          open={true}
          onOpenChange={(open) => !open && setUploadItem(null)}
          declaration={uploadItem}
          onSuccess={() => refetch()}
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
