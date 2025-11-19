"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import DevelopmentPlanForm from "../../../../../../features/gp/gestionhumana/plan-desarrollo/components/DevelopmentPlanForm";

interface DevelopmentPlanFormSheetProps {
  open: boolean;
  onClose: () => void;
  personId: number;
}

export default function DevelopmentPlanFormSheet({
  open,
  onClose,
  personId,
}: DevelopmentPlanFormSheetProps) {
  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Crear Plan de Desarrollo"
      className="max-w-5xl!"
    >
      <DevelopmentPlanForm personId={personId} onSuccess={onClose} />
    </GeneralSheet>
  );
}
