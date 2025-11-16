import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostResource } from "../lib/feed.interface";

export default function Comments({ post }: { post: PostResource }) {
  if (post.comments.length <= 0) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-gray-200">
      {post.comments.map((comment, index) => (
        <div key={index} className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
              {comment.user
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-primary">
                {comment.user}
              </span>
              <span className="text-xs text-gray-500">{comment.timestamp}</span>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
