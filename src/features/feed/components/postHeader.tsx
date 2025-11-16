import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PostResource } from "../lib/feed.interface";
import { departmentColors } from "../lib/feed.data";

interface Props {
  post: PostResource;
}

export default function PostHeader({ post }: Props) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Avatar className="w-12 h-12">
        <AvatarImage
          src={post.user.avatar || "/placeholder.svg"}
          alt={post.user.name}
        />
        <AvatarFallback className="bg-primary text-white">
          {post.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-primary">{post.user.name}</h4>
          <Badge
            className="text-white"
            style={{
              backgroundColor:
                departmentColors[
                  post.user.department as keyof typeof departmentColors
                ],
            }}
          >
            {post.user.department}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{post.user.position}</p>
        <p className="text-xs text-gray-500">{post.timestamp}</p>
      </div>
    </div>
  );
}
