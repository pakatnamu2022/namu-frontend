"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BONUS } from "../lib/bonus.constant";
import { downloadBonusTemplate } from "../lib/bonus.actions";
import { errorToast, successToast } from "@/core/core.function";
import BonusImportModal from "./BonusImportModal";

const { MODEL, ROUTE_ADD } = BONUS;

interface BonusActionsProps {
  companyId: string;
  companyName?: string;
}

export default function BonusActions({
  companyId,
  companyName,
}: BonusActionsProps) {
  const push = useNavigate();
  const [open, setOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      await downloadBonusTemplate(companyId);
      successToast("Plantilla descargada correctamente");
    } catch {
      errorToast("Error al descargar la plantilla");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={handleDownloadTemplate}
        disabled={isDownloading || !companyId}
      >
        <Download className="size-4 mr-2" /> Descargar Plantilla
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => setOpen(true)}
        disabled={!companyId}
      >
        <Upload className="size-4 mr-2" /> Importar {MODEL.name}
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => push(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>

      <BonusImportModal
        open={open}
        onClose={() => setOpen(false)}
        companyId={companyId}
        companyName={companyName}
      />
    </div>
  );
}
