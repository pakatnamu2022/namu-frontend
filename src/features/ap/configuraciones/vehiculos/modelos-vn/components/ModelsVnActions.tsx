"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Download, FileSearch, FileUp, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { MODELS_VN, MODELS_VN_POSTVENTA } from "../lib/modelsVn.constanst";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import {
  downloadTemplateModelsVn,
  downloadVerifyTemplateModelsVn,
  syncAllModelsVn,
} from "../lib/modelsVn.actions";
import { errorToast, successToast } from "@/core/core.function";
import ModelsVnImportDialog from "./ModelsVnImportDialog";
import ModelsVnVerifyDialog from "./ModelsVnVerifyDialog";
import ModelVnDynamicsSheet from "./ModelVnDynamicsSheet";

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
  const queryClient = useQueryClient();
  const [importOpen, setImportOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [dynamicsOpen, setDynamicsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingVerify, setIsDownloadingVerify] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const { ROUTE_ADD, QUERY_KEY } =
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

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const result = await syncAllModelsVn();
      successToast(result.message);
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "sync-logs"] });
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al despachar sincronización masiva."
      );
    } finally {
      setIsSyncingAll(false);
    }
  };

  if (!permissions.canCreate && !permissions.canImport) {
    return null;
  }

  return (
    <ActionsWrapper>
      {(permissions.canCreate || permissions.canImport) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
            >
              <Download className="size-4 mr-2" />
              {isDownloading ? "Descargando..." : "Template"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Descargar template de importación</TooltipContent>
        </Tooltip>
      )}

      {permissions.canImport && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
              <FileUp className="size-4 mr-2" /> Importar
            </Button>
          </TooltipTrigger>
          <TooltipContent>Importar modelos desde Excel</TooltipContent>
        </Tooltip>
      )}

      {permissions.canImport && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadVerifyTemplate}
              disabled={isDownloadingVerify}
            >
              <Download className="size-4 mr-2" />
              {isDownloadingVerify ? "Descargando..." : "Tmpl. Verificar"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Descargar template de verificación</TooltipContent>
        </Tooltip>
      )}

      {permissions.canImport && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => setVerifyOpen(true)}>
              <FileSearch className="size-4 mr-2" /> Verificar
            </Button>
          </TooltipTrigger>
          <TooltipContent>Verificar modelos desde Excel</TooltipContent>
        </Tooltip>
      )}

      {isCommercial === CM_COMERCIAL_ID && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncAll}
                disabled={isSyncingAll}
              >
                <RefreshCw className={`size-4 mr-2 ${isSyncingAll ? "animate-spin" : ""}`} />
                {isSyncingAll ? "Despachando..." : "Sync. Todos"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sincronizar todos los modelos pendientes a Dynamics</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => setDynamicsOpen(true)}>
                <RefreshCw className="size-4 mr-2" /> Artículos Dynamics
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver historial de sincronización con Dynamics</TooltipContent>
          </Tooltip>
        </>
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

      <ModelVnDynamicsSheet
        open={dynamicsOpen}
        onClose={() => setDynamicsOpen(false)}
      />
    </ActionsWrapper>
  );
}
