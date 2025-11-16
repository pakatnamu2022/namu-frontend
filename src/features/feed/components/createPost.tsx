import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Send, Users } from "lucide-react";

interface Props {
  setShowCreatePost: (show: boolean) => void;
  newPost: string;
  setNewPost: (post: string) => void;
  handleCreatePost: () => void;
}

export default function CreatePost({
  setShowCreatePost,
  newPost,
  setNewPost,
  handleCreatePost,
}: Props) {
  return (
    <Card className="mb-6 bg-background/90 backdrop-blur-xs border border-primary/10">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          Compartir con el equipo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src="/placeholder.svg?height=48&width=48"
              alt="Juan Carlos Pérez"
            />
            <AvatarFallback className="bg-primary text-white">
              JC
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="¿Qué quieres compartir con tu equipo?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[120px] border-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Button variant="outline" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Agregar Imagen
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreatePost(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.trim()}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
