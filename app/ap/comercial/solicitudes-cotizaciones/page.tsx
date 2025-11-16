"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleApproveDialog } from "@/shared/components/SimpleApproveDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import {
  ERROR_MESSAGE,
  errorToast,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { PURCHASE_REQUEST_QUOTE } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.constants";
import { usePurchaseRequestQuote } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.hook";
import {
  approvePurchaseRequestQuote,
  downloadPurchaseRequestQuotePdf,
  unassignVehicleFromPurchaseRequestQuote,
} from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.actions";
import PurchaseRequestQuoteActions from "@/features/ap/comercial/solicitudes-cotizaciones/components/PurchaseRequestQuoteActions";
import PurchaseRequestQuoteTable from "@/features/ap/comercial/solicitudes-cotizaciones/components/PurchaseRequestQuoteTable";
import { purchaseRequestQuoteColumns } from "@/features/ap/comercial/solicitudes-cotizaciones/components/PurchaseRequestQuoteColumns";
import PurchaseRequestQuoteOptions from "@/features/ap/comercial/solicitudes-cotizaciones/components/PurchaseRequestQuoteOptions";
import AssignVehicleModal from "@/features/ap/comercial/solicitudes-cotizaciones/components/AssignVehicleModal";
import { PurchaseRequestQuoteResource } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";
import NotFound from "@/app/not-found";


export default function PurchaseRequestQuotePage() {
  
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [approveId, setApproveId] = useState<number | null>(null);
  const [assignVehicleQuote, setAssignVehicleQuote] =
    useState<PurchaseRequestQuoteResource | null>(null);
  const [unassignVehicleId, setUnassignVehicleId] = useState<number | null>(
    null
  );
  const { MODEL, ROUTE } = PURCHASE_REQUEST_QUOTE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = usePurchaseRequestQuote({
    page,
    search,
    per_page,
    status: 1, // TODO: Remove and change to hide actions on columns
  });

  const handleApprove = async () => {
    if (!approveId) return;
    try {
      await approvePurchaseRequestQuote(approveId);
      await refetch();
      successToast("El registro se aprobó correctamente");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, msg));
    } finally {
      setApproveId(null);
    }
  };

  const handleDownloadPdf = async (id: number) => {
    try {
      await downloadPurchaseRequestQuotePdf(id);
      successToast("PDF descargado correctamente");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, msg));
    }
  };

  const handleUnassignVehicle = async () => {
    if (!unassignVehicleId) return;
    try {
      await unassignVehicleFromPurchaseRequestQuote(unassignVehicleId);
      await refetch();
      successToast("Vehículo desvinculado correctamente");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "fetch", msg));
    } finally {
      setUnassignVehicleId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <PurchaseRequestQuoteActions permissions={permissions} />
      </HeaderTableWrapper>
      <PurchaseRequestQuoteTable
        isLoading={isLoading}
        columns={purchaseRequestQuoteColumns({
          onApprove: setApproveId,
          onDownloadPdf: handleDownloadPdf,
          onAssignVehicle: setAssignVehicleQuote,
          onUnassignVehicle: setUnassignVehicleId,
          permissions,
        })}
        data={data?.data || []}
      >
        <PurchaseRequestQuoteOptions search={search} setSearch={setSearch} />
      </PurchaseRequestQuoteTable>

      {approveId !== null && (
        <SimpleApproveDialog
          open={true}
          onOpenChange={(open) => !open && setApproveId(null)}
          onConfirm={handleApprove}
        />
      )}

      {assignVehicleQuote !== null && (
        <AssignVehicleModal
          open={true}
          onOpenChange={(open) => !open && setAssignVehicleQuote(null)}
          quote={assignVehicleQuote}
        />
      )}

      {unassignVehicleId !== null && (
        <Dialog
          open={true}
          onOpenChange={(open) => !open && setUnassignVehicleId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <DialogTitle className="text-left">
                    ¿Está seguro de desvincular este vehículo?
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>
            <DialogDescription className="text-left mt-2">
              Esta acción desvinculará el vehículo de la cotización. Podrá
              asignar otro vehículo posteriormente si lo desea.
            </DialogDescription>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setUnassignVehicleId(null)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleUnassignVehicle}>
                Sí, desvincular
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
