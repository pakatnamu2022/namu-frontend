import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FileText, Sheet } from "lucide-react";
import { Tooltip, TooltipTrigger } from "@radix-ui/react-tooltip";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import ApSafeCreditGoalModal from "./ApSafeCreditGoalModal";

interface ApSafeCreditGoalActionsProps {
  permissions: {
    canCreate: boolean;
    canExport: boolean;
  };
}

export default function ApSafeCreditGoalActions({
  permissions,
}: ApSafeCreditGoalActionsProps) {
  const [open, setOpen] = useState(false);

  // if (!permissions.canCreate) {
  //   return null;
  // }

  const handlePDFDownload = () => {
    alert("ESTAMOS TRABAJANDO EN ESTA FUNCIONALIDAD");
  };

  const handleExcelDownload = () => {
    alert("ESTAMOS TRABAJANDO EN ESTA FUNCIONALIDAD");
  };

  return (
    <div className="flex items-center gap-2">
      {permissions.canExport && (
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                tooltip="Excel"
                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 transition-colors"
                onClick={handleExcelDownload}
              >
                <Sheet className="size-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                tooltip="PDF"
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 transition-colors"
                onClick={handlePDFDownload}
              >
                <FileText className="size-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>
      )}

      <ActionsWrapper>
        

        {permissions.canCreate && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => setOpen(true)}
            >
              <Plus className="size-4 mr-2" /> Agregar Meta
            </Button>

            <ApSafeCreditGoalModal
              title="Crear Meta"
              open={open}
              onClose={() => setOpen(false)}
              mode="create"
            />
          </>
        )}
      </ActionsWrapper>
    </div>
  );
}
