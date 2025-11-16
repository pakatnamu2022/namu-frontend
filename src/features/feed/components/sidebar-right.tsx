import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Hash, TrendingUp } from "lucide-react";

export default function SidebarRight({
  trendingTopics,
}: {
  trendingTopics: Array<{ tag: string; posts: number }>;
}) {
  return (
    <div className="lg:col-span-3 space-y-6">
      {/* Trending Topics */}
      <Card className="bg-background border border-[#00227D]/10 shadow-xs">
        <CardHeader>
          <CardTitle className="text-[#00227D] flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-[#00227D]">{topic.tag}</span>
              <Badge className="bg-secondary text-white">{topic.posts}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Estadísticas del día */}
      <Card className="bg-[#00227D]/5 border border-[#00227D]/10">
        <CardHeader>
          <CardTitle className="text-[#00227D] flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Estadísticas de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Posts publicados</span>
            <span className="font-bold text-[#00227D]">12</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Comentarios</span>
            <span className="font-bold text-secondary">45</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Likes totales</span>
            <span className="font-bold text-green-600">127</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Usuarios activos</span>
            <span className="font-bold text-blue-600">24</span>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card className="bg-background border border-[#00227D]/10 shadow-xs">
        <CardHeader>
          <CardTitle className="text-[#00227D] flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm font-medium text-blue-800">
              María González te mencionó
            </p>
            <p className="text-xs text-blue-600">Hace 30 minutos</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
            <p className="text-sm font-medium text-green-800">
              Tu post recibió 5 likes
            </p>
            <p className="text-xs text-green-600">Hace 1 hora</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm font-medium text-yellow-800">
              Nuevo anuncio de RRHH
            </p>
            <p className="text-xs text-yellow-600">Hace 2 horas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
