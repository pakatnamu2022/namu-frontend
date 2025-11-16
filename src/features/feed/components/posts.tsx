import { Card, CardContent } from "@/components/ui/card";
import Actions from "./actions";
import Comments from "./comments";
import { useState } from "react";
import { PostResource } from "../lib/feed.interface";
import AddComment from "./addComment";
import PostHeader from "./postHeader";
import PostContent from "./postContent";

interface Props {
  posts: PostResource[];
}

export default function Posts({ posts }: Props) {
  const [newComment, setNewComment] = useState("");
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="bg-background/90 backdrop-blur-xs border border-primary/10 shadow-xs"
        >
          <CardContent className="p-6">
            {/* Header del post */}
            <PostHeader post={post} />

            {/* Contenido del post */}
            <PostContent post={post} />

            {/* Acciones del post */}
            <Actions post={post} />

            {/* Comentarios */}
            <Comments post={post} />

            {/* Agregar comentario */}
            <AddComment newComment={newComment} setNewComment={setNewComment} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
