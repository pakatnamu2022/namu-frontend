"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BONUS } from "../lib/bonus.constant";
import { currentMonth, currentYear } from "@/core/core.function";
import BonusImportModal from "./BonusImportModal";
import BonusTemplateDialog from "./BonusTemplateDialog";

const { MODEL, ROUTE_ADD } = BONUS;

interface BonusActionsProps {
  companyId: string;
}

export default function BonusActions({ companyId }: BonusActionsProps) {
  const push = useNavigate();
  const [open, setOpen] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => setShowTemplate(true)}
        disabled={!companyId}
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
      />

      <BonusTemplateDialog
        open={showTemplate}
        onClose={() => setShowTemplate(false)}
        companyId={companyId}
        defaultYear={currentYear()}
        defaultMonth={currentMonth()}
      />
    </div>
  );
}
