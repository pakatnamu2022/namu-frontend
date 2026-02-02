"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { useAuthorizationWorkOrder } from "../lib/workOrder.hook";

interface AuthorizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrderResource | null;
}

function AuthorizationModalContent({
  workOrder,
}: {
  workOrder: WorkOrderResource;
}) {
  const { mutate: updateWorkOrder, isPending } = useAuthorizationWorkOrder();

  const [allowRemoveQuote, setAllowRemoveQuote] = useState(
    workOrder.allow_remove_associated_quote ?? false,
  );
  const [allowEditingInspection, setAllowEditingInspection] = useState(
    workOrder.allow_editing_inspection ?? false,
  );

  const handleSwitchChange = (
    field: "allow_remove_associated_quote" | "allow_editing_inspection",
    value: boolean,
  ) => {
    if (field === "allow_remove_associated_quote") {
      setAllowRemoveQuote(value);
    } else {
      setAllowEditingInspection(value);
    }

    updateWorkOrder({
      id: workOrder.id,
      data: { [field]: value } as any,
    });
  };

  return (
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Autorización</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
          <Label htmlFor="allow_remove_quote" className="flex-1 cursor-pointer">
            Permitir remover cotización asociada
          </Label>
          <Switch
            id="allow_remove_quote"
            checked={allowRemoveQuote}
            onCheckedChange={(value) =>
              handleSwitchChange("allow_remove_associated_quote", value)
            }
            disabled={isPending}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
          <Label
            htmlFor="allow_editing_inspection"
            className="flex-1 cursor-pointer"
          >
            Permitir editar inspección
          </Label>
          <Switch
            id="allow_editing_inspection"
            checked={allowEditingInspection}
            onCheckedChange={(value) =>
              handleSwitchChange("allow_editing_inspection", value)
            }
            disabled={isPending}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export function AuthorizationModal({
  open,
  onOpenChange,
  workOrder,
}: AuthorizationModalProps) {
  if (!workOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AuthorizationModalContent key={workOrder.id} workOrder={workOrder} />
    </Dialog>
  );
}
