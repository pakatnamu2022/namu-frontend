"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { ReactNode } from "react";
import CommentSection from "./CommentSection";

interface ExpandableTableRowProps {
  id: number;
  isExpanded: boolean;
  children: ReactNode;
  columnsCount: number;
  comment?: string;
  readOnly?: boolean;
  onCommentSubmit: (id: number, comment: string) => void;
}

export default function ExpandableTableRow({
  id,
  isExpanded,
  children,
  columnsCount,
  comment,
  readOnly = false,
  onCommentSubmit,
}: ExpandableTableRowProps) {
  return (
    <>
      {/* Fila principal con datos */}
      <TableRow className="text-nowrap hover:bg-muted bg-background">
        {children}
      </TableRow>

      {/* Fila expandible con comentario - se muestra cuando isExpanded=true */}
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
