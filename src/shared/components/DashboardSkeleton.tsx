import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  // Definimos las piezas del rompecabezas con diferentes tamaños y posiciones
  const puzzlePieces = [
    { id: 1, className: "col-span-2 row-span-1", delay: 800 },
    { id: 2, className: "col-span-1 row-span-2", delay: 1400 },
    { id: 3, className: "col-span-1 row-span-1", delay: 2200 },
    { id: 4, className: "col-span-1 row-span-1", delay: 3000 },
    { id: 5, className: "col-span-2 row-span-1", delay: 1800 },
    { id: 6, className: "col-span-1 row-span-1", delay: 2600 },
    { id: 7, className: "col-span-2 row-span-1", delay: 3400 },
    { id: 8, className: "col-span-1 row-span-1", delay: 4000 },
  ];

  return (
    <>
      <div
        style={{ minHeight: "calc(100vh - 64px)" }}
        className="w-full mx-auto p-6 hidden md:grid grid-cols-3 grid-rows-4 gap-4 auto-rows-fr"
      >
        {puzzlePieces.map((piece) => (
          <div
            key={piece.id}
            className={`${piece.className} transform transition-all duration-700 ease-out opacity-0`}
            style={{
              animation: `puzzleBuild 0.8s ease-out ${piece.delay}ms both`,
            }}
          >
            <Skeleton className="w-full h-full min-h-[120px] rounded-lg" />
          </div>
        ))}
      </div>

      {/* Vista mobile - aparición secuencial simple */}
      <div className="w-full mx-auto p-6 md:hidden space-y-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="transform transition-all duration-600 ease-out opacity-0"
            style={{
              animation: `slideUp 0.6s ease-out ${(i + 1) * 400}ms both`,
            }}
          >
            <Skeleton className="w-full h-32 rounded-lg" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes puzzleBuild {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.9) rotate(-2deg);
            filter: blur(2px);
          }
          50% {
            opacity: 0.7;
            transform: translateY(20px) scale(0.95) rotate(-1deg);
            filter: blur(1px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
            filter: blur(0px);
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .animate-pulse {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </>
  );
}
