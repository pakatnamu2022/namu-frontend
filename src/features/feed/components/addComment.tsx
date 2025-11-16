import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Props {
  newComment: string;
  setNewComment: (comment: string) => void;
}

export default function AddComment({ newComment, setNewComment }: Props) {
  return (
    <div className="flex gap-3 pt-4 border-t border-gray-200">
      <Avatar className="w-8 h-8">
        <AvatarImage
          src="/placeholder.svg?height=32&width=32"
          alt="Juan Carlos Pérez"
        />
        <AvatarFallback className="bg-primary text-white text-xs">
          JC
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 flex gap-2">
        <Input
          placeholder="Escribe un comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border-primary/20 focus:border-primary"
        />
        <Button
          disabled={!newComment.trim()}
          className="bg-secondary hover:bg-secondary/90 text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
