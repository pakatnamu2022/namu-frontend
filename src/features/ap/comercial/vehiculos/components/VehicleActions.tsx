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
import VehicleUpdateByVinSheet from "./VehicleUpdateByVinSheet";

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
    </ActionsWrapper>
  );
}
