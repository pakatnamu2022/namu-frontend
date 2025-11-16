"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { CLASS_ARTICLE } from "../lib/classArticle.constants";

interface ClassArticleActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ClassArticleActions({
  permissions,
}: ClassArticleActionsProps) {
  const router = useNavigate();
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
        onClick={() => router(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Clase de Artículo
      </Button>
    </ActionsWrapper>
  );
}
