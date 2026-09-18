import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { FamilyReportItem } from "../lib/daily-delivery.interface";
import FamilyImage from "./FamilyImage";

interface FamilyPodiumCardProps {
  family: FamilyReportItem;
  rank: number;
  value: number;
  valueLabel: string;
  secondaryLabel: string;
  secondaryValue: number;
  share: number;
  showModels?: boolean;
}

const RANK_STYLES: Record<number, string> = {
  1: "text-amber-600 bg-amber-500/10",
  2: "text-slate-600 bg-slate-500/10",
  3: "text-orange-700 bg-orange-500/10",
};

const SPRING = { stiffness: 180, damping: 18, mass: 0.6 };

/**
 * Tarjeta del podio con inclinación 3D que sigue al mouse: la imagen del auto
 * "flota" por delante de la tarjeta (translateZ) y proyecta su propia sombra.
 */
export default function FamilyPodiumCard({
  family,
  rank,
  value,
  valueLabel,
  secondaryLabel,
  secondaryValue,
  share,
  showModels = true,
}: FamilyPodiumCardProps) {
  const isFirst = rank === 1;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-12, 12]),
    SPRING,
  );
  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [10, -10]),
    SPRING,
  );
  const imageShiftX = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-10, 10]),
    SPRING,
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (rank - 1) * 0.12, ease: "easeOut" }}
      className={cn(
        "[perspective:1000px]",
        rank === 1 && "md:order-2",
        rank === 2 && "md:order-1",
        rank === 3 && "md:order-3",
        !isFirst && "md:mt-8",
      )}
    >
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "relative flex h-full flex-col rounded-2xl bg-card p-5 shadow-md",
          "transition-shadow duration-300 hover:shadow-xl",
          isFirst && "md:pb-7",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={cn(
                "truncate font-semibold tracking-tight",
                isFirst ? "text-xl" : "text-lg",
              )}
              title={family.family}
            >
              {family.family}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {family.brand ?? "Sin marca"}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
              RANK_STYLES[rank],
            )}
          >
            #{rank}
          </span>
        </div>

        <div
          className={cn(
            "relative my-2 flex items-center justify-center",
            isFirst ? "h-44" : "h-36",
          )}
        >
          {/* Sombra en el piso, bajo el auto */}
          <div
            aria-hidden
            className="absolute bottom-2 h-4 w-3/5 rounded-[50%] bg-foreground/15 blur-md"
            style={{ transform: "translateZ(0px)" }}
          />
          <motion.div
            className="relative h-full w-full"
            style={{ transform: "translateZ(70px)", x: imageShiftX }}
          >
            <FamilyImage
              image={family.image}
              brandLogo={family.brand_logo}
              alt={family.family}
              className="h-full w-full drop-shadow-[0_18px_16px_rgba(0,0,0,0.28)]"
            />
          </motion.div>
        </div>

        <div className="mt-auto space-y-3" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div
                className={cn(
                  "font-bold leading-none tabular-nums",
                  isFirst ? "text-5xl" : "text-4xl",
                )}
              >
                {value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {valueLabel}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold tabular-nums text-emerald-600">
                {secondaryValue}
              </div>
              <div className="text-xs text-muted-foreground">
                {secondaryLabel}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(share, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.3 + rank * 0.1 }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {share.toFixed(1)}% del total
            </div>
          </div>

          {showModels && family.modelos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {family.modelos.slice(0, 3).map((m) => (
                <span
                  key={m.modelo}
                  className="max-w-full truncate rounded-full bg-muted/70 px-2 py-0.5 text-[11px] text-muted-foreground"
                  title={`${m.modelo}: ${m.entregas}`}
                >
                  {m.modelo}
                  <strong className="ml-1 font-semibold text-foreground">
                    {m.entregas}
                  </strong>
                </span>
              ))}
              {family.modelos.length > 3 && (
                <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[11px] text-muted-foreground">
                  +{family.modelos.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
