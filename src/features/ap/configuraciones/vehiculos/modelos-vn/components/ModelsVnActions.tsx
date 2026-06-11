"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { MODELS_VN, MODELS_VN_POSTVENTA } from "../lib/modelsVn.constanst";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { downloadTemplateModelsVn } from "../lib/modelsVn.actions";
import { errorToast, successToast } from "@/core/core.function";
import ModelsVnImportDialog from "./ModelsVnImportDialog";

interface ModelsVnActionsProps {
  isCommercial: number;
  permissions: {
    canCreate: boolean;
    canImport: boolean;
  };
  onImportSuccess: () => void;
}

export default function ModelsVnActions({
  permissions,
  isCommercial = CM_COMERCIAL_ID,
  onImportSuccess,
}: ModelsVnActionsProps) {
  const router = useNavigate();
  const [importOpen, setImportOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { ROUTE_ADD } =
    isCommercial === CM_COMERCIAL_ID ? MODELS_VN : MODELS_VN_POSTVENTA;

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      await downloadTemplateModelsVn();
      successToast("Template descargado correctamente.");
    } catch {
      errorToast("Error al descargar el template.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!permissions.canCreate && !permissions.canImport) {
    return null;
  }

  return (
    <ActionsWrapper>
      {(permissions.canCreate || permissions.canImport) && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownloadTemplate}
          disabled={isDownloading}
        >
          <Download className="size-4 mr-2" />
          {isDownloading ? "Descargando..." : "Descargar Template"}
        </Button>
      )}

      {permissions.canImport && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setImportOpen(true)}
        >
          <FileUp className="size-4 mr-2" /> Importar Modelos
        </Button>
      )}

      {permissions.canCreate && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router(ROUTE_ADD!)}
        >
          <Plus className="size-4 mr-2" /> Agregar Modelo VN
        </Button>
      )}

      <ModelsVnImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={onImportSuccess}
      />
    </ActionsWrapper>
  );
}
