import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { PostResource } from "../lib/feed.interface";

export default function Actions({ post }: { post: PostResource }) {
  return (
    <div className="flex items-center gap-6 py-3 border-t border-gray-200">
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-gray-600 hover:text-secondary"
      >
        <Heart className="w-4 h-4" />
        <span>{post.likes}</span>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-gray-600 hover:text-primary"
      >
        <MessageSquare className="w-4 h-4" />
        <span>{post.comments.length}</span>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-gray-600 hover:text-primary"
      >
        <Share2 className="w-4 h-4" />
        Compartir
      </Button>
    </div>
  );
}
