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
    <div className="space-y-2.5">
      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
        Comentarios
      </h4>

      {comment && (
        <div className="p-3 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
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
            className="min-h-20 resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={onSubmitComment}
              disabled={!newComment?.trim()}
              className="gap-2 h-9"
            >
              <Send className="w-4 h-4" />
              Enviar comentario
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
