"use client";

import { Button } from "@/components/ui/button";
import { FileBox } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { INVENTORY } from "../lib/inventory.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function InventoryActions({ permissions }: Props) {
  const router = useNavigate();
  const { ABSOLUTE_ROUTE } = INVENTORY;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="default"
        className="ml-auto"
        onClick={() => router(`${ABSOLUTE_ROUTE}/kardex`)}
      >
        <FileBox className="size-4 mr-2" /> Kardex
      </Button>
    </ActionsWrapper>
  );
}
