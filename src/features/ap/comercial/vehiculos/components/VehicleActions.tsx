"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { FileUp } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import VehicleUpdateByVinSheet from "./VehicleUpdateByVinSheet";
import { VEHICLES_EXPORT } from "../lib/vehicles.constants";

interface VehicleActionsProps {
  permissions?: {
    canImport?: boolean;
  };
  onUpdateSuccess?: () => void;
}

export default function VehicleActions({
  onUpdateSuccess,
}: VehicleActionsProps) {
  const [updateByVinOpen, setUpdateByVinOpen] = useState(false);

  return (
    <ActionsWrapper>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUpdateByVinOpen(true)}
          >
            <FileUp className="size-4 mr-2" /> Actualizar por VIN
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Actualizar motor y color de vehículos desde Excel por VIN
        </TooltipContent>
      </Tooltip>

      <VehicleUpdateByVinSheet
        open={updateByVinOpen}
        onClose={() => setUpdateByVinOpen(false)}
        onSuccess={onUpdateSuccess}
      />

      <ExportButtons
        excelEndpoint={VEHICLES_EXPORT.ENDPOINT_EXPORT_EXCEL}
        pdfEndpoint={VEHICLES_EXPORT.ENDPOINT_EXPORT_PDF}
        excelFileName="vehiculos.xlsx"
        pdfFileName="vehiculos.pdf"
        variant="grouped"
      />
    </ActionsWrapper>
  );
}
