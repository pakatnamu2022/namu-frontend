"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router.push(`${baseRoute}/agregar`)}
      >
        <Plus className="size-4 mr-2" /> Agregar Establecimiento
      </Button>
    </ActionsWrapper>
  );
}
