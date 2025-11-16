import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function PostNotFound() {
  return (
    <Card className="bg-background/90 backdrop-blur-xs border border-primary/10">
      <CardContent className="p-12 text-center">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No hay posts que mostrar
        </h3>
        <p className="text-gray-500">
          Intenta cambiar los filtros o crear el primer post.
        </p>
      </CardContent>
    </Card>
  );
}
