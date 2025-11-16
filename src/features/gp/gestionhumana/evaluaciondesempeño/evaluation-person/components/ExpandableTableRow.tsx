"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ReactNode } from "react";
import CommentSection from "./CommentSection";
import { MessageCircleMore, MessageCirclePlus } from "lucide-react";

interface ExpandableTableRowProps {
  id: number;
  isExpanded: boolean;
  onToggleExpansion: (id: number) => void;
  children: ReactNode;
  columnsCount: number;
  comment?: string;
  readOnly?: boolean;
  onCommentSubmit: (id: number, comment: string) => void;
}

export default function ExpandableTableRow({
  id,
  isExpanded,
  onToggleExpansion,
  children,
  columnsCount,
  comment,
  readOnly = false,
  onCommentSubmit,
}: ExpandableTableRowProps) {
  return (
    <>
      {/* Fila principal */}
      <TableRow className="text-nowrap hover:bg-muted bg-background">
        {/* Contenido de la fila */}
        {children}
      </TableRow>

      {/* Botón fino para comentarios */}
      <TableRow className="border-b-0">
        <TableCell colSpan={columnsCount} className="p-0">
          <Button
            variant="ghost"
            onClick={() => onToggleExpansion(id)}
            className="w-full h-6 rounded-none text-xs border-b"
            aria-label={
              isExpanded ? "Ocultar comentarios" : "Mostrar comentarios"
            }
          >
            {comment ? (
              <MessageCircleMore className="size-4 ml-1" />
            ) : (
              <MessageCirclePlus className="size-4 ml-1" />
            )}
            {isExpanded
              ? "Ocultar comentario"
              : comment
              ? "Ver / Editar comentario"
              : "Clic para agregar comentario"}
          </Button>
        </TableCell>
      </TableRow>

      {/* Fila expandible con comentario */}
      {isExpanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={columnsCount} className="p-0">
            <div className="p-4 border-t">
              <CommentSection
                objectiveId={id}
                existingComment={comment}
                readOnly={readOnly}
                onCommentSubmit={onCommentSubmit}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
