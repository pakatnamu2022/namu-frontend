"use client";

import { useState } from "react";
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
