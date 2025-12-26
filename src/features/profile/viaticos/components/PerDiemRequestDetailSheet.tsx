import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { findPerDiemRequestById } from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import {
  GeneralInfoSection,
  FinancialSummarySection,
  RequestStatusBadge,
  BudgetSection,
  DepositVoucherSection,
} from "@/features/profile/viaticos/components/PerDiemRequestDetail";

interface Props {
  requestId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PerDiemRequestDetailSheet({
  requestId,
  open,
  onOpenChange,
}: Props) {
  const { data: request, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId],
    queryFn: () => findPerDiemRequestById(requestId!),
    enabled: open && requestId !== null,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : request ? (
          <>
            <SheetHeader>
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-2xl">{request.code}</SheetTitle>
                  <SheetDescription>
                    Detalle de Solicitud de Viáticos
                  </SheetDescription>
                </div>
                <RequestStatusBadge status={request.status} />
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Información General */}
              <GeneralInfoSection request={request} />

              {/* Detalle de Presupuesto */}
              <BudgetSection request={request} />

              {/* Comprobante de Depósito */}
              <DepositVoucherSection request={request} />

              {/* Resumen Financiero */}
              <FinancialSummarySection request={request} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              No se pudo cargar la información de la solicitud
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
