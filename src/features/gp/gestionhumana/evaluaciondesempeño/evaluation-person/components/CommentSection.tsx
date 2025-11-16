"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Edit2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface CommentSectionProps {
  objectiveId: number;
  existingComment?: string;
  readOnly?: boolean;
  onCommentSubmit: (id: number, comment: string) => void;
}

export default function CommentSection({
  objectiveId,
  existingComment,
  readOnly = false,
  onCommentSubmit,
}: CommentSectionProps) {
  const [commentValue, setCommentValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCommentValue(existingComment || "");
    setIsEditing(!existingComment);
  }, [existingComment]);

  const handleSubmit = async () => {
    if (commentValue.trim() && !isLoading) {
      setIsLoading(true);
      try {
        onCommentSubmit(objectiveId, commentValue.trim());
        setIsEditing(false);
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!isLoading) {
      setCommentValue(existingComment || "");
      setIsEditing(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Comentario del objetivo
          </span>
        </div>

        {!readOnly && isEditing && (
          <div className="flex gap-2">
            <Textarea
              placeholder="Escribe un comentario sobre este objetivo..."
              value={commentValue}
              onChange={(e) => setCommentValue(e.target.value)}
              className="min-h-[80px] resize-none"
              aria-label="Comentario del objetivo"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!commentValue.trim() || isLoading}
                size="sm"
                aria-label="Enviar comentario"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              {existingComment && (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  aria-label="Cancelar edición"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}

        {!readOnly && !isEditing && existingComment && (
          <div className="bg-muted/50 p-3 rounded-md flex justify-between items-start">
            <p className="text-sm flex-1">{existingComment}</p>
            <Button
              onClick={handleEdit}
              variant="ghost"
              size="sm"
              className="ml-2 h-8 w-8 p-0"
              disabled={isLoading}
              aria-label="Editar comentario"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {readOnly && existingComment && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm">{existingComment}</p>
          </div>
        )}

        {readOnly && !existingComment && (
          <p className="text-sm text-muted-foreground italic">
            No hay comentarios para este objetivo
          </p>
        )}
      </div>
    </Card>
  );
}
