import { Button } from "@/components/ui/button";
import { FileUp, RefreshCw, Download } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useState } from "react";
import ManageLeadsModal from "./ManageLeadsModal";
import ManageLeadsRefreshSheet from "./ManageLeadsRefreshSheet";
import { ImportedLeadResource } from "../lib/manageLeads.interface";
import { errorToast, successToast } from "@/core/core.function";
import { downloadManageLeadsFile } from "../lib/manageLeads.actions";
import ExportButtons from "@/shared/components/ExportButtons";

interface Props {
  dateFrom?: Date;
  dateTo?: Date;
  onImportSuccess: (data: ImportedLeadResource[]) => void;
  onRefresh: (params: {
    date_from: string;
    date_to: string;
    all?: boolean;
  }) => void;
  permissions: {
    canImport: boolean;
    canUpdate: boolean;
    canExport: boolean;
  };
}

export default function ManageLeadsActions({
  dateFrom,
  dateTo,
  onImportSuccess,
  onRefresh,
  permissions,
}: Props) {
  const [open, setOpen] = useState(false);
  const [openRefresh, setOpenRefresh] = useState(false);

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/REDES_SOCIALES.xlsx";
    link.download = "REDES_SOCIALES.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  const handleExcelDownload = async () => {
    try {
      const created_at =
        dateFrom && dateTo
          ? [formatDate(dateFrom), formatDate(dateTo)]
          : undefined;

      await downloadManageLeadsFile({
        params: { created_at },
      });
      successToast("Archivo Excel descargado exitosamente");
    } catch (error: any) {
      errorToast(
        "Error al descargar el Excel. Por favor, intente nuevamente.",
        error.response.data?.message?.toString(),
      );
    }
  };

  const handlePDFDownload = async () => {
    try {
      const created_at =
        dateFrom && dateTo
          ? [formatDate(dateFrom), formatDate(dateTo)]
          : undefined;

      await downloadManageLeadsFile({
        params: { format: "pdf", created_at },
      });
      successToast("Archivo PDF descargado exitosamente");
    } catch (error: any) {
      errorToast(
        "Error al descargar el PDF. Por favor, intente nuevamente.",
        error.response.data?.message?.toString(),
      );
    }
  };

  return (
    <ActionsWrapper>
      <div className="flex items-center gap-2">
        {permissions.canExport && (
          <ExportButtons
            onExcelDownload={handleExcelDownload}
            onPdfDownload={handlePDFDownload}
            disableExcel={!dateFrom || !dateTo}
            disablePdf={!dateFrom || !dateTo}
            variant="grouped"
          />
        )}
      </div>
      <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
        <Download className="size-4 mr-2" /> Formato Redes Sociales
      </Button>

      {permissions.canUpdate && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpenRefresh(true)}
        >
          <RefreshCw className="size-4 mr-2" /> Reasignar Leads
        </Button>
      )}

      {permissions.canImport && (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <FileUp className="size-4 mr-2" /> Importar Leads
        </Button>
      )}

      <ManageLeadsModal
        title="Importar Leads"
        open={open}
        onClose={() => setOpen(false)}
        onImportSuccess={onImportSuccess}
      />

      <ManageLeadsRefreshSheet
        open={openRefresh}
        onClose={() => setOpenRefresh(false)}
        onSubmit={onRefresh}
      />
    </ActionsWrapper>
  );
}
