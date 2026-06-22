import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";

interface ManualViewerProps {
  s3Url: string;
  title: string;
}

export default function ManualViewer({ s3Url, title }: ManualViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(s3Url)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el manual.");
        return res.text();
      })
      .then(setContent)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [s3Url]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-sm text-red-500">{error}</div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
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
