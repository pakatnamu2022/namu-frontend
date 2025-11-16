import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Props {
  setShowCreatePost: (show: boolean) => void;
}

export default function NewPost({ setShowCreatePost }: Props) {
  return (
    <Card className="mb-6 bg-background/90 backdrop-blur-xs border border-primary/10">
      <CardContent className="p-4">
        <Button
          onClick={() => setShowCreatePost(true)}
          className="w-full bg-secondary hover:bg-secondary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          ¿Qué quieres compartir con tu equipo?
        </Button>
      </CardContent>
    </Card>
  );
}
