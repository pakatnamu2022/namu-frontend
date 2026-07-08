import { useEffect, useState, useCallback, useRef } from 'react';
import { TourStep } from './types';
import { cn } from '@/lib/utils';

interface GuidedTourOverlayProps {
    targetElement: Element | null;
    step: TourStep;
    children: React.ReactNode;
    overlayClassName?: string;
}

export function GuidedTourOverlay({
    targetElement,
    step,
    children,
    overlayClassName,
}: GuidedTourOverlayProps) {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const rafId = useRef<number | null>(null);

    const calculatePosition = useCallback((rect: DOMRect): 'top' | 'bottom' | 'left' | 'right' => {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const th = 300;
        const tw = 360;
        const m = 20;

        const spaces = {
            bottom: vh - rect.bottom - m,
            top: rect.top - m,
            right: vw - rect.right - m,
            left: rect.left - m,
        };

        if (step?.position) {
            const pos = step.position;
            if (pos === 'top' && spaces.top > th) return 'top';
            if (pos === 'bottom' && spaces.bottom > th) return 'bottom';
            if (pos === 'left' && spaces.left > tw) return 'left';
            if (pos === 'right' && spaces.right > tw) return 'right';
        }

        const sorted = Object.entries(spaces).sort((a, b) => b[1] - a[1]);
        return sorted[0][0] as 'top' | 'bottom' | 'left' | 'right';
    }, [step?.position]);

    const updateRect = useCallback(() => {
        if (!targetElement) {
            setTargetRect(null);
            return;
        }
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
        setTooltipPosition(calculatePosition(rect));
    }, [targetElement, calculatePosition]);

    useEffect(() => {
        setIsTransitioning(true);
        const timeout = setTimeout(() => {
            updateRect();
            setTimeout(() => setIsTransitioning(false), 50);
        }, 50);
        return () => clearTimeout(timeout);
    }, [targetElement, updateRect]);

    useEffect(() => {
        const handleUpdate = () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
            rafId.current = requestAnimationFrame(updateRect);
        };

        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, { passive: true });

        const observer = new ResizeObserver(handleUpdate);
        if (targetElement) observer.observe(targetElement);

        return () => {
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate);
            observer.disconnect();
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [targetElement, updateRect]);

    if (!targetElement || !targetRect) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 pointer-events-none">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm pointer-events-auto shadow-2xl">
                    <p className="text-sm text-red-500 dark:text-red-400">Elemento no encontrado: {step?.target || 'desconocido'}</p>
                    {children}
                </div>
            </div>
        );
    }

    const { left, top, width, height } = targetRect;
    const padding = 12;
    const radius = 8;
    const margin = 16;

    const getOffset = () => {
        switch (tooltipPosition) {
            case 'bottom': return { left: left + width / 2, top: top + height + margin, transform: 'translateX(-50%)' };
            case 'top': return { left: left + width / 2, top: top - margin, transform: 'translateX(-50%) translateY(-100%)' };
            case 'right': return { left: left + width + margin, top: top + height / 2, transform: 'translateY(-50%)' };
            case 'left': return { left: left - margin, top: top + height / 2, transform: 'translateX(-100%) translateY(-50%)' };
            default: return { left: left + width / 2, top: top + height + margin, transform: 'translateX(-50%)' };
        }
    };

    const offset = getOffset();

    const getTooltipStyles = () => {
        const base = {
            left: offset.left,
            top: offset.top,
            transform: offset.transform,
            transition: 'opacity 200ms ease-out, transform 200ms ease-out',
        };
        return base;
    };

    return (
        <div className={cn('fixed inset-0 z-[9999] pointer-events-none guided-tour-overlay', overlayClassName)}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '100vw', height: '100vh' }}>
                <defs>
                    <clipPath id="tourHighlight">
                        <rect width="100vw" height="100vh" />
                        <rect x={left - padding} y={top - padding} width={width + padding * 2} height={height + padding * 2} rx={radius} />
                    </clipPath>
                </defs>
                <rect width="100vw" height="100vh" clipPath="url(#tourHighlight)" fill="rgba(0, 0, 0, 0.75)" className="transition-all duration-300 ease-out" />
            </svg>

            <div
                className={cn(
                    "absolute pointer-events-none rounded-lg border-2 border-blue-500/60",
                    isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
                )}
                style={{
                    left: left - padding,
                    top: top - padding,
                    width: width + padding * 2,
                    height: height + padding * 2,
                    borderRadius: radius,
                    boxShadow: '0 0 0 4px rgba(59,130,246,0.15)',
                    transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                }}
            />

            {/* Tooltip contenedor - con pointer-events-auto */}
            <div
                className={cn(
                    'absolute pointer-events-auto',
                    isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                )}
                style={{
                    ...getTooltipStyles(),
                    marginTop: tooltipPosition === 'bottom' ? '16px' : '0',
                    marginBottom: tooltipPosition === 'top' ? '16px' : '0',
                    marginLeft: tooltipPosition === 'right' ? '16px' : '0',
                    marginRight: tooltipPosition === 'left' ? '16px' : '0',
                    zIndex: 10000,
                }}
            >
                {/* Flecha del tooltip */}
                <div
                    className="absolute z-10"
                    style={{
                        ...(tooltipPosition === 'bottom' && {
                            top: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: '8px solid #ffffff',
                        }),
                        ...(tooltipPosition === 'top' && {
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '8px solid #ffffff',
                        }),
                        ...(tooltipPosition === 'left' && {
                            right: '-8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderTop: '8px solid transparent',
                            borderBottom: '8px solid transparent',
                            borderLeft: '8px solid #ffffff',
                        }),
                        ...(tooltipPosition === 'right' && {
                            left: '-8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderTop: '8px solid transparent',
                            borderBottom: '8px solid transparent',
                            borderRight: '8px solid #ffffff',
                        }),
                    }}
                />
                {children}
            </div>
        </div>
    );
}