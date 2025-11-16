"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { CLASS_ARTICLE } from "../lib/classArticle.constants";

interface ClassArticleActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ClassArticleActions({
  permissions,
}: ClassArticleActionsProps) {
  const router = useRouter();
  const { ROUTE_ADD } = CLASS_ARTICLE;

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
        <Plus className="size-4 mr-2" /> Agregar Clase de Artículo
      </Button>
    </ActionsWrapper>
  );
}
