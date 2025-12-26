"use client";

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PER_DIEM_REQUEST,
} from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import {
  findPerDiemRequestById,
  downloadSettlementPdf,
} from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { useState } from "react";
import { toast } from "sonner";
import TitleComponent from "@/shared/components/TitleComponent";
import {
  GeneralInfoSection,
  RequestStatusBadge,
  BudgetSection,
  FinancialSummarySection,
} from "@/features/profile/viaticos/components/PerDiemRequestDetail";
import FormWrapper from "@/shared/components/FormWrapper";
import BackButton from "@/shared/components/BackButton";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Receipt } from "lucide-react";
import ExpensesTable from "@/features/profile/viaticos/components/ExpensesTable";

export default function PerDiemRequestDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: request,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  const handleDownloadPdf = async () => {
    if (!id) return;

    try {
      setIsDownloading(true);
      await downloadSettlementPdf(Number(id));
      toast.success("PDF descargado correctamente");
    } catch (error) {
      toast.error("Error al descargar el PDF");
      console.error("Error downloading PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleActionComplete = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </FormWrapper>
    );
  }

  if (!request) {
    return (
      <FormWrapper>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Solicitud no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="space-y-6">
        {/* Header */}
        <FormWrapper>
          <div className="flex items-center gap-3">
            <BackButton
              route="/gp/gestion-humana/viaticos/solicitud-viaticos"
              size="icon"
              name=""
            />
            <TitleComponent
              title={request.code}
              subtitle="Detalle de Solicitud de Viáticos"
              icon="FileText"
            />
          </div>
          <div className="flex items-center gap-2">
            <RequestStatusBadge status={request.status} />
            <Button
              onClick={handleDownloadPdf}
              size="sm"
              variant="outline"
              className="gap-2"
              disabled={isDownloading}
            >
              <FileDown className="h-4 w-4" />
              {isDownloading ? "Descargando..." : "Exportar PDF"}
            </Button>
          </div>
        </FormWrapper>

        {/* Información General */}
        <GeneralInfoSection request={request} />

        {/* Detalle de Presupuesto */}
        <BudgetSection request={request} />

        {/* Resumen Financiero */}
        <FinancialSummarySection request={request} />

        {/* Gastos Registrados con acciones de validación */}
        <GroupFormSection
          title="Gastos Registrados"
          icon={Receipt}
          cols={{ sm: 1 }}
        >
          <div className="md:col-span-1">
            <ExpensesTable
              expenses={request.expenses || []}
              onActionComplete={handleActionComplete}
            />
          </div>
        </GroupFormSection>
      </div>
    </FormWrapper>
  );
}
