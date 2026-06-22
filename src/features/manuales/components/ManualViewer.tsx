import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, BookOpen } from "lucide-react";
import { getManualContent } from "../lib/manuales.actions";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ManualViewerProps {
  id: number;
}

export default function ManualViewer({ id }: ManualViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getManualContent(id)
      .then(setContent)
      .catch(() => setError("No se pudo cargar el manual."))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen />
          </EmptyMedia>
          <EmptyTitle>No se pudo cargar el manual</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="bg-background rounded-xl shadow-sm p-6 md:p-8">
<div className="prose prose-sm md:prose-base max-w-none prose-img:rounded-lg prose-img:shadow-sm prose-a:text-primary">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img({ src, alt }) {
              if (!src) return null;
              if (/\.mp4$/i.test(src)) {
                return (
                  <video
                    src={src}
                    controls
                    className="w-full rounded-lg my-4"
                    aria-label={alt ?? "video"}
                  />
                );
              }
              return (
                <img
                  src={src}
                  alt={alt ?? ""}
                  loading="lazy"
                  className="rounded-lg shadow-sm"
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
