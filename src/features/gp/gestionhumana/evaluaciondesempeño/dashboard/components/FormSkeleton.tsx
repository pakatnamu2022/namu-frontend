import React from "react";
import { Car } from "lucide-react";

const FormCarSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-8">
      {/* Car animation container */}
      <div className="relative w-64 h-16 mx-auto">
        {/* Road line */}
        <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-muted-foreground/30"></div>

        {/* Animated dashed road line */}
        <div className="absolute bottom-4 left-0 right-0 h-0.5 overflow-hidden">
          <div className="h-full bg-linear-to-r from-transparent via-muted-foreground to-transparent animate-pulse"></div>
        </div>

        {/* Car with combined animations */}
        <div className="absolute bottom-6 left-0 w-full h-8">
          <Car
            className="h-8 w-8 text-primary transition-all duration-1000 ease-in-out
                       animate-[carStart_3s_ease-in-out_infinite]"
          />
        </div>

        {/* Exhaust smoke effect */}
        <div className="absolute bottom-8 animate-[smoke_2s_ease-in-out_infinite]">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-bounce"></div>
            <div
              className="w-1 h-1 bg-muted-foreground/30 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-1 h-1 bg-muted-foreground/20 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground">
          Cargando datos de la evaluación...
        </p>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>

    <style jsx>{`
      @keyframes carStart {
        0% {
          transform: translateX(0) scale(1);
        }
        25% {
          transform: translateX(0) scale(1.1);
        }
        50% {
          transform: translateX(50px) scale(1);
        }
        75% {
          transform: translateX(150px) scale(0.9);
        }
        100% {
          transform: translateX(220px) scale(0.8);
        }
      }

      @keyframes smoke {
        0%,
        100% {
          opacity: 0;
          transform: translateX(0) translateY(0);
        }
        50% {
          opacity: 1;
          transform: translateX(-10px) translateY(-5px);
        }
      }
    `}</style>
  </div>
);

export default FormCarSkeleton;
