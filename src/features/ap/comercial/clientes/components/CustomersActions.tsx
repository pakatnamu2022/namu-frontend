"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from 'react-router-dom';
import { CUSTOMERS } from "../lib/customers.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function CustomersActions({ permissions }: Props) {
  const router = useNavigate();
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
        onClick={() => router(`/ap/comercial/${ROUTE_ADD}`)}
      >
        <Plus className="size-4 mr-2" /> Agregar Cliente
      </Button>
    </ActionsWrapper>
  );
}
