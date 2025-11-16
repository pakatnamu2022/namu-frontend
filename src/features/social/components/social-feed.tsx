"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, Share2, Send, ImageIcon, Users, TrendingUp, Activity, Plus } from "lucide-react"

const feedData = [
  {
    id: 1,
    user: {
      name: "María González",
      position: "Operadora de Transporte",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Transporte",
    },
    content:
      "¡Excelente capacitación de seguridad industrial hoy! Aprendimos nuevos protocolos que nos ayudarán a mejorar nuestros procesos diarios. 🚛✨",
    timestamp: "Hace 2 horas",
    likes: 12,
    comments: [
      {
        user: "Carlos Ruiz",
        content: "¡Totalmente de acuerdo! Los nuevos protocolos son muy útiles.",
        timestamp: "Hace 1 hora",
      },
    ],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    user: {
      name: "Roberto Silva",
      position: "Supervisor de Depósito",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Depósito",
    },
    content:
      "Nuevo récord en el depósito: procesamos 500 órdenes en un solo día. ¡Felicitaciones a todo el equipo! 📦🎉",
    timestamp: "Hace 4 horas",
    likes: 25,
    comments: [],
  },
  {
    id: 3,
    user: {
      name: "Ana López",
      position: "Gerente de RRHH",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "RRHH",
    },
    content:
      "Recordatorio: La evaluación de desempeño anual comenzará la próxima semana. Por favor, preparen sus autoevaluaciones. 📋",
    timestamp: "Hace 6 horas",
    likes: 8,
    comments: [],
  },
  {
    id: 4,
    user: {
      name: "Diego Fernández",
      position: "Técnico Automotriz",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Automotores",
    },
    content:
      "Completé la reparación del vehículo #VH-150 antes de lo programado. El cliente quedó muy satisfecho con el servicio. 🔧⚡",
    timestamp: "Hace 8 horas",
    likes: 15,
    comments: [
      {
        user: "Miguel Torres",
        content: "¡Excelente trabajo, Diego!",
        timestamp: "Hace 7 horas",
      },
    ],
  },
]

const departmentColors = {
  Transporte: "#00227D",
  Depósito: "#F01E23",
  RRHH: "#00227D",
  Automotores: "#F01E23",
}

export function SocialFeed() {
  const [newPost, setNewPost] = useState("")
  const [newComment, setNewComment] = useState("")
  const [showCreatePost, setShowCreatePost] = useState(false)

  const handleCreatePost = () => {
    if (newPost.trim()) {
      console.log("Nuevo post:", newPost)
      setNewPost("")
      setShowCreatePost(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header del feed */}
      <Card className="bg-background border border-primary/10 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Feed Empresarial
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                <Users className="w-3 h-3" />
                24 activos
              </Badge>
              <Button
                size="sm"
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Publicar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Crear nuevo post */}
      {showCreatePost && (
        <Card className="bg-background border border-primary/10 shadow-xs">
          <CardContent className="p-4">
            <div className="flex gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Juan Carlos Pérez" />
                <AvatarFallback className="bg-primary text-white">JC</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="¿Qué quieres compartir con tu equipo?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] border-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <imgIcon className="w-4 h-4" />
                Imagen
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreatePost(false)}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  className="bg-secondary hover:bg-secondary/90 text-white"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Publicar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts del feed */}
      <div className="space-y-4">
        {feedData.map((post) => (
          <Card key={post.id} className="bg-background border border-primary/10 shadow-xs">
            <CardContent className="p-4">
              {/* Header del post */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                  <AvatarFallback className="bg-primary text-white text-sm">
                    {post.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-primary text-sm">{post.user.name}</h4>
                    <Badge
                      className="text-xs text-white"
                      style={{
                        backgroundColor: departmentColors[post.user.department as keyof typeof departmentColors],
                      }}
                    >
                      {post.user.department}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{post.user.position}</p>
                  <p className="text-xs text-gray-500">{post.timestamp}</p>
                </div>
              </div>

              {/* Contenido del post */}
              <div className="mb-3">
                <p className="text-gray-700 text-sm mb-2">{post.content}</p>
                {post.image && (
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Post content"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                )}
              </div>

              {/* Acciones del post */}
              <div className="flex items-center gap-3 py-2 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600 hover:text-secondary p-1"
                >
                  <Heart className="w-3 h-3" />
                  <span className="text-xs">{post.likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary p-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span className="text-xs">{post.comments.length}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary p-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span className="text-xs">Compartir</span>
                </Button>
              </div>

              {/* Comentarios */}
              {post.comments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  {post.comments.map((comment, index) => (
                    <div key={index} className="flex gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                          {comment.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs text-primary">{comment.user}</span>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar comentario */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <Avatar className="w-6 h-6">
                  <AvatarImage src="/placeholder.svg?height=24&width=24" alt="Juan Carlos Pérez" />
                  <AvatarFallback className="bg-primary text-white text-xs">JC</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-1">
                  <Input
                    placeholder="Comentar..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="text-xs h-8 border-primary/20 focus:border-primary"
                  />
                  <Button
                    size="sm"
                    disabled={!newComment.trim()}
                    className="bg-secondary hover:bg-secondary/90 text-white h-8 px-2"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estadísticas del feed */}
      <Card className="bg-primary/5 border border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <span className="text-gray-600">Actividad de hoy</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-primary font-medium">12 posts</span>
              <span className="text-secondary font-medium">45 comentarios</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
