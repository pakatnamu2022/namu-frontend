"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, Send } from "lucide-react";

interface Comment {
  user: string;
  content: string;
  timestamp: string;
}

interface FeedPostProps {
  id: number;
  user: {
    name: string;
    position: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  image?: string;
  currentUser: {
    name: string;
    avatar: string;
  };
}

export function FeedPost({
  user,
  content,
  timestamp,
  likes,
  comments,
  image,
  currentUser,
}: FeedPostProps) {
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      setNewComment("");
    }
  };

  return (
    <Card className="bg-background/90 backdrop-blur-xs border border-primary/10">
      <CardContent>
        {/* Header del post */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
            />
            <AvatarFallback className="bg-primary text-white">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-primary">{user.name}</h4>
            <p className="text-sm text-gray-600">{user.position}</p>
            <p className="text-xs text-gray-500">{timestamp}</p>
          </div>
        </div>

        {/* Contenido del post */}
        <div>
          <p className="text-gray-700 mb-3">{content}</p>
          {image && (
            <img
              src={image || "/placeholder.svg"}
              alt="Post content"
              className="w-full h-64 object-cover rounded-lg border border-gray-200"
            />
          )}
        </div>

        {/* Acciones del post */}
        <div className="flex items-center gap-4 py-3 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-2 ${
              isLiked ? "text-secondary" : "text-gray-600 hover:text-secondary"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <MessageSquare className="w-4 h-4" />
            {comments.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </Button>
        </div>

        {/* Comentarios */}
        {comments.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            {comments.map((comment, index) => (
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
                    <span className="text-xs text-gray-500">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agregar comentario */}
        <div className="flex gap-3 pt-3 border-t border-gray-200">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={currentUser.avatar || "/placeholder.svg"}
              alt={currentUser.name}
            />
            <AvatarFallback className="bg-primary text-white text-xs">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="border-primary/20 focus:border-primary"
              onKeyPress={(e) => e.key === "Enter" && handleComment()}
            />
            <Button
              size="sm"
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
