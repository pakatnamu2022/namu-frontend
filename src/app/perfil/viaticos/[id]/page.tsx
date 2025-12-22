"use client";

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { findPerDiemRequestById, downloadSettlementPdf } from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { useState } from "react";
import { toast } from "sonner";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import {
  GeneralInfoSection,
  FinancialSummarySection,
  ExpensesSection,
  RequestStatusBadge,
} from "@/features/profile/viaticos/components/PerDiemRequestDetail";
import FormWrapper from "@/shared/components/FormWrapper";

export default function PerDiemRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: request, isLoading } = useQuery({
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
        <HeaderTableWrapper>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/perfil/viaticos")}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
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
            <Button
              onClick={() => navigate(`/perfil/viaticos/${id}/gastos/agregar`)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Gasto
            </Button>
          </div>
        </HeaderTableWrapper>

        {/* Grid para Información General y Resumen Financiero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información General - 2/3 */}
          <div className="lg:col-span-2 h-full">
            <GeneralInfoSection request={request} />
          </div>

          {/* Resumen Financiero - 1/3 */}
          <div className="lg:col-span-1 h-full">
            <FinancialSummarySection request={request} />
          </div>
        </div>

        {/* Gastos Registrados */}
        <ExpensesSection request={request} />
      </div>
    </FormWrapper>
  );
}
