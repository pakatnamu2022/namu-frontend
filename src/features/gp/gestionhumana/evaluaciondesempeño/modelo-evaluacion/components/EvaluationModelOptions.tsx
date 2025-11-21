"use client";

import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { EVALUATION_MODEL } from "../lib/evaluationModel.constants";
import type { EvaluationModelResource } from "../lib/evaluationModel.interface";
import { useDeleteEvaluationModel } from "../lib/evaluationModel.hook";

interface EvaluationModelOptionsProps {
  row: Row<EvaluationModelResource>;
}

export function EvaluationModelOptions({ row }: EvaluationModelOptionsProps) {
  const router = useNavigate();
  const { ROUTE_UPDATE } = EVALUATION_MODEL;
  const deleteModel = useDeleteEvaluationModel();

  const id = row.original.id;

  const handleDelete = () => {
    deleteModel.mutate(id);
  };

  const handleEdit = () => {
    router(`${ROUTE_UPDATE}/${id}`);
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <Button
        variant="outline"
        tooltip="Editar"
        size="icon"
        className="size-7"
        onClick={handleEdit}
      >
        <Pencil className="size-4" />
      </Button>

      <DeleteButton onClick={handleDelete} />
    </div>
  );
}
