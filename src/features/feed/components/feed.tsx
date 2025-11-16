import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { feedData } from "../lib/feed.data";
import Posts from "./posts";
import PostFilters from "./filters";
import NewPost from "./newPost";
import CreatePost from "./createPost";
import PostNotFound from "./postNotFound";

export default function Feed() {
  const searchParams = useSearchParams();
  const [newPost, setNewPost] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(
    searchParams?.get("create") === "true"
  );

  const handleCreatePost = () => {
    if (newPost.trim()) {
      setNewPost("");
      setShowCreatePost(false);
    }
  };

  const filteredPosts = feedData.filter((post) => {
    const matchesFilter = activeFilter === "all" || post.type === activeFilter;
    const matchesSearch =
      searchTerm === "" ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="lg:col-span-6">
      {/* Controles del feed */}
      <div className="mb-6 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar en el feed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-primary/20 focus:border-primary"
          />
        </div>

        {/* Filtros */}
        <PostFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      </div>

      {/* Crear nuevo post */}
      {!showCreatePost && <NewPost setShowCreatePost={setShowCreatePost} />}

      {showCreatePost && (
        <CreatePost
          setShowCreatePost={setShowCreatePost}
          newPost={newPost}
          setNewPost={setNewPost}
          handleCreatePost={handleCreatePost}
        />
      )}

      {/* Posts del feed */}
      <Posts posts={filteredPosts} />

      {filteredPosts.length === 0 && <PostNotFound />}
    </div>
  );
}
