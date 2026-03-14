"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/core/api";
import { promiseToast } from "@/core/core.function";
import { Sheet, FileText } from "lucide-react";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "neutral"
  | "tertiary";

interface ExportButtonsProps {
  excelEndpoint?: string;
  pdfEndpoint?: string;
  excelFileName?: string;
  pdfFileName?: string;
  onExcelDownload?: () => void | Promise<void>;
  onPdfDownload?: () => void | Promise<void>;
  disableExcel?: boolean;
  disablePdf?: boolean;
  variant?: "grouped" | "separate";
  buttonVariant?: ButtonVariant;
}

export default function ExportButtons({
  excelEndpoint,
  pdfEndpoint,
  excelFileName = "export.xlsx",
  pdfFileName = "export.pdf",
  onExcelDownload,
  onPdfDownload,
  disableExcel = false,
  disablePdf = false,
  variant = "grouped",
  buttonVariant = "ghost",
}: ExportButtonsProps) {
  const handleExcelDownload = () => {
    if (onExcelDownload) {
      promiseToast(Promise.resolve(onExcelDownload()), {
        loading: "Descargando Excel...",
        success: "Excel descargado exitosamente",
        error: "Error al descargar el archivo Excel",
      });
      return;
    }

    if (!excelEndpoint) return;

    const download = api
      .get(excelEndpoint, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", excelFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });

    promiseToast(download, {
      loading: "Descargando Excel...",
      success: "Excel descargado exitosamente",
      error: "Error al descargar el archivo Excel",
    });
  };

  const handlePDFDownload = () => {
    if (onPdfDownload) {
      promiseToast(Promise.resolve(onPdfDownload()), {
        loading: "Descargando PDF...",
        success: "PDF descargado exitosamente",
        error: "Error al descargar el archivo PDF",
      });
      return;
    }

    if (!pdfEndpoint) return;

    const download = api
      .get(pdfEndpoint, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", pdfFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });

    promiseToast(download, {
      loading: "Descargando PDF...",
      success: "PDF descargado exitosamente",
      error: "Error al descargar el archivo PDF",
    });
  };

  const showExcelButton = excelEndpoint || onExcelDownload;
  const showPdfButton = pdfEndpoint || onPdfDownload;

  const isGhost = buttonVariant === "ghost";

  if (variant === "grouped") {
    return (
      <div className="flex items-center gap-1 bg-muted rounded-lg border h-8">
        {showExcelButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={buttonVariant}
                className={isGhost ? "gap-2 hover:bg-green-700/5 hover:text-green-700 transition-colors" : "gap-2"}
                onClick={handleExcelDownload}
                disabled={disableExcel}
              >
                <Sheet className="h-4 w-4" />
                Excel
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar Excel</p>
            </TooltipContent>
          </Tooltip>
        )}

        {showPdfButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={buttonVariant}
                className={isGhost ? "gap-2 hover:bg-red-700/5 hover:text-red-700 transition-colors" : "gap-2"}
                onClick={handlePDFDownload}
                disabled={disablePdf}
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar PDF</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // Variant "separate" - botones individuales sin agrupar
  return (
    <>
      {showExcelButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={buttonVariant}
              className={isGhost ? "h-8 w-8 p-0 hover:bg-green-700/5 hover:text-green-700 transition-colors" : "h-8 w-8 p-0"}
              onClick={handleExcelDownload}
              disabled={disableExcel}
            >
              <Sheet className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar Excel</p>
          </TooltipContent>
        </Tooltip>
      )}

      {showPdfButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={buttonVariant}
              className={isGhost ? "h-8 w-8 p-0 hover:bg-red-700/5 hover:text-red-700 transition-colors" : "h-8 w-8 p-0"}
              onClick={handlePDFDownload}
              disabled={disablePdf}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar PDF</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
