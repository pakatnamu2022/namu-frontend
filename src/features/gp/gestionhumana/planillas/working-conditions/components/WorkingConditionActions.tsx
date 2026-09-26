"use client";

import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { WORKING_CONDITION } from "../lib/working-condition.constant";
import { downloadWorkingConditionsTemplate } from "../lib/working-condition.actions";
import WorkingConditionAddModal from "./WorkingConditionAddModal";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function";

const { MODEL } = WORKING_CONDITION;

interface WorkingConditionActionsProps {
  companyId: string;
  companyName?: string;
}

export default function WorkingConditionActions({
  companyId,
  companyName,
}: WorkingConditionActionsProps) {
  const [open, setOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      await downloadWorkingConditionsTemplate(companyId);
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
        disabled={isDownloading}
      >
        <Download className="size-4 mr-2" /> Descargar Plantilla
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Importar {MODEL.name}
      </Button>

      <WorkingConditionAddModal
        open={open}
        onClose={() => setOpen(false)}
        companyId={companyId}
        companyName={companyName}
      />
    </div>
  );
}
