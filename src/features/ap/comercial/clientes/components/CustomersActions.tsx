"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { useRouter } from "next/navigation";
import { CUSTOMERS } from "../lib/customers.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function CustomersActions({ permissions }: Props) {
  const router = useRouter();
  const { ROUTE_ADD } = CUSTOMERS;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router.push(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Cliente
      </Button>
    </ActionsWrapper>
  );
}
