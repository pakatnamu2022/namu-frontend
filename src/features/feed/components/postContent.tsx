import { PostResource } from "../lib/feed.interface";

interface Props {
  post: PostResource;
}

export default function PostContent({ post }: Props) {
  return (
    <div>
      <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
      {post.image && (
        <img
          src={post.image || "/placeholder.svg"}
          alt="Post content"
          className="w-full h-96 object-cover rounded-lg border border-gray-200"
        />
      )}
    </div>
  );
}
