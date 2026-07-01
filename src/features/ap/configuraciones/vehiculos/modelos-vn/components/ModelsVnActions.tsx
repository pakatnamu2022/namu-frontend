"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSearch, FileUp, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { MODELS_VN, MODELS_VN_POSTVENTA } from "../lib/modelsVn.constanst";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import {
  downloadTemplateModelsVn,
  downloadVerifyTemplateModelsVn,
} from "../lib/modelsVn.actions";
import { errorToast, successToast } from "@/core/core.function";
import ModelsVnImportDialog from "./ModelsVnImportDialog";
import ModelsVnVerifyDialog from "./ModelsVnVerifyDialog";

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
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingVerify, setIsDownloadingVerify] = useState(false);

  const { ROUTE_ADD, ABSOLUTE_ROUTE } =
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

  const handleDownloadVerifyTemplate = async () => {
    setIsDownloadingVerify(true);
    try {
      await downloadVerifyTemplateModelsVn();
      successToast("Template de verificación descargado correctamente.");
    } catch {
      errorToast("Error al descargar el template de verificación.");
    } finally {
      setIsDownloadingVerify(false);
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
          {isDownloading ? "Descargando..." : "Template"}
        </Button>
      )}

      {permissions.canImport && (
        <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
          <FileUp className="size-4 mr-2" /> Importar
        </Button>
      )}

      {permissions.canImport && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownloadVerifyTemplate}
          disabled={isDownloadingVerify}
        >
          <Download className="size-4 mr-2" />
          {isDownloadingVerify ? "Descargando..." : "Tmpl. Verificar"}
        </Button>
      )}

      {permissions.canImport && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setVerifyOpen(true)}
        >
          <FileSearch className="size-4 mr-2" /> Verificar
        </Button>
      )}

      {isCommercial === CM_COMERCIAL_ID && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router(`${ABSOLUTE_ROUTE}/dynamics`)}
        >
          <RefreshCw className="size-4 mr-2" /> Artículos Dynamics
        </Button>
      )}

      {permissions.canCreate && (
        <Button size="sm" onClick={() => router(ROUTE_ADD!)}>
          <Plus className="size-4 mr-2" /> Nuevo Modelo
        </Button>
      )}

      <ModelsVnImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={onImportSuccess}
      />

      <ModelsVnVerifyDialog
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
      />
    </ActionsWrapper>
  );
}
