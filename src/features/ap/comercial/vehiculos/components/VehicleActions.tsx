"use client";

import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import VehicleImportModal from "./VehicleImportModal";
import VehicleImportResultModal from "./VehicleImportResultModal";
import { VinMatchResponse } from "../lib/vehicles.interface";

export default function VehicleActions() {
  const [importOpen, setImportOpen] = useState(false);
  const [result, setResult] = useState<VinMatchResponse | null>(null);

  const handleResult = (data: VinMatchResponse) => {
    setResult(data);
  };

  return (
    <>
      <ActionsWrapper>
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <FileUp className="mr-2 size-4" />
          Importar VINs
        </Button>
      </ActionsWrapper>

      <VehicleImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onResult={handleResult}
      />

      {result && (
        <VehicleImportResultModal
          open={true}
          onClose={() => setResult(null)}
          result={result}
        />
      )}
    </>
  );
}
