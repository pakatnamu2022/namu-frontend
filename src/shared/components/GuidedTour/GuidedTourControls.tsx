import { useEffect, useState } from 'react';
import { TourStep } from './types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, SkipForward, Check, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuidedTourControlsProps {
    title: string;
    description: string;
    step: TourStep;
    currentStep: number;
    totalSteps: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    onNext: () => void;
    onPrev: () => void;
    onSkip?: () => void;
    onFinish: () => void;
    tooltipClassName?: string;
}

export function GuidedTourControls({
    title,
    description,
    step,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    onNext,
    onPrev,
    onSkip,
    onFinish,
    tooltipClassName,
}: GuidedTourControlsProps) {
    const [isContentVisible, setIsContentVisible] = useState(false);
    const progress = ((currentStep + 1) / totalSteps) * 100;

    useEffect(() => {
        setIsContentVisible(false);
        const timer = setTimeout(() => setIsContentVisible(true), 50);
        return () => clearTimeout(timer);
    }, [currentStep]);

    const stepTitle = step?.title || title;
    const stepDescription = step?.description || description;

    return (
        <div className={cn(
            'w-[360px] max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden',
            tooltipClassName
        )}>
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>

            <div className={cn(
                "flex items-start justify-between gap-4 px-5 pt-4 transition-all duration-300",
                isContentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        {step?.icon || <HelpCircle className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{stepTitle}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Paso {currentStep + 1} de {totalSteps}</p>
                    </div>
                </div>
                {onSkip && (
                    <button onClick={onSkip} className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Saltar tour">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className={cn(
                "px-5 py-3 transition-all duration-300 delay-50",
                isContentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{stepDescription}</p>
            </div>

            <div className={cn(
                "flex items-center justify-between gap-2 px-5 pb-4 pt-1 transition-all duration-300 delay-100",
                isContentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
                <div>
                    {!isFirstStep ? (
                        <Button variant="ghost" size="sm" onClick={onPrev} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
                        </Button>
                    ) : (
                        <div className="w-[72px]" />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!isLastStep ? (
                        <Button size="sm" onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button size="sm" onClick={onFinish} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                            <Check className="w-4 h-4 mr-1" /> Finalizar
                        </Button>
                    )}
                </div>
            </div>

            {onSkip && !isLastStep && (
                <div className={cn(
                    "px-5 pb-3 pt-0 border-t border-slate-100 dark:border-slate-800 transition-all duration-300 delay-150",
                    isContentVisible ? "opacity-100" : "opacity-0"
                )}>
                    <button onClick={onSkip} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        <SkipForward className="w-3.5 h-3.5" /> Saltar tutorial
                    </button>
                </div>
            )}
        </div>
    );
}