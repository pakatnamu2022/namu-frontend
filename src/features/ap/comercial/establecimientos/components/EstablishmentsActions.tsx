"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from 'react-router-dom';

interface Props {
  baseRoute: string;
  permissions: {
    canCreate: boolean;
  };
}

export default function EstablishmentsActions({
  baseRoute,
  permissions,
}: Props) {
  const router = useNavigate();

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(`${baseRoute}/agregar`)}
      >
        <Plus className="size-4 mr-2" /> Agregar Establecimiento
      </Button>
    </ActionsWrapper>
  );
}
