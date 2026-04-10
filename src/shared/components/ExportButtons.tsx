"use client";

import { Button, ButtonColors } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/core/api";
import { promiseToast } from "@/core/core.function";
import { Sheet, FileDown, type LucideIcon } from "lucide-react";

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
  variant?: "grouped" | "separate" | "separate-icon";
  excelVariant?: ButtonVariant;
  excelColor?: ButtonColors;
  excelButtonText?: string;
  excelIcon?: LucideIcon;
  pdfVariant?: ButtonVariant;
  pdfColor?: ButtonColors;
  pdfButtonText?: string;
  pdfIcon?: LucideIcon;
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
  excelVariant = "ghost",
  excelColor = "emerald",
  excelButtonText = "Excel",
  excelIcon: ExcelIcon,
  pdfVariant = "ghost",
  pdfColor = "rose",
  pdfButtonText = "PDF",
  pdfIcon: PdfIcon,
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

  const ExcelIconResolved = ExcelIcon ?? Sheet;
  const PdfIconResolved = PdfIcon ?? FileDown;

  if (variant === "grouped") {
    return (
      <div className="flex items-center gap-1 bg-muted rounded-lg border h-fit">
        {showExcelButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={excelVariant}
                color={excelColor}
                onClick={handleExcelDownload}
                disabled={disableExcel}
              >
                <ExcelIconResolved className="h-4 w-4" />
                {excelButtonText}
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
                variant={pdfVariant}
                color={pdfColor}
                onClick={handlePDFDownload}
                disabled={disablePdf}
              >
                <PdfIconResolved className="h-4 w-4" />
                {pdfButtonText}
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
              size={variant === "separate-icon" ? "icon-sm" : "sm"}
              variant={excelVariant}
              color={excelColor}
              onClick={handleExcelDownload}
              disabled={disableExcel}
            >
              <ExcelIconResolved className="h-4 w-4" />
              {variant !== "separate-icon" && excelButtonText}
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
              size={variant === "separate-icon" ? "icon-sm" : "sm"}
              variant={pdfVariant}
              color={pdfColor}
              onClick={handlePDFDownload}
              disabled={disablePdf}
            >
              <PdfIconResolved className="h-4 w-4" />
              {variant !== "separate-icon" && pdfButtonText}
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
