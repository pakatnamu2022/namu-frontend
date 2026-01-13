"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface DevelopmentPlanCommentsProps {
  comment: string | null;
  isLeader: boolean;
  newComment: string;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
}

export function DevelopmentPlanComments({
  comment,
  isLeader,
  newComment,
  onCommentChange,
  onSubmitComment,
}: DevelopmentPlanCommentsProps) {
  return (
    <div className="pt-3 border-t space-y-2.5">
      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
        Comentarios
      </h4>

      {comment && (
        <div className="p-2.5 rounded-md border bg-muted/20">
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {comment}
          </p>
        </div>
      )}

      {isLeader && (
        <div className="space-y-2">
          <Textarea
            placeholder="Escribe un comentario sobre este plan..."
            value={newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="min-h-16 resize-none text-xs"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={onSubmitComment}
              disabled={!newComment?.trim()}
              className="gap-1.5 h-8 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
