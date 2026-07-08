import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GuidedTourProps, GuidedTourContextValue } from './types';
import { GuidedTourOverlay } from './GuidedTourOverlay';
import { GuidedTourControls } from './GuidedTourControls';
import { useGuidedTourStorage } from './useGuidedTourStorage';

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null);

export const useGuidedTour = () => {
    const context = useContext(GuidedTourContext);
    if (!context) throw new Error('useGuidedTour must be used within a GuidedTour');
    return context;
};

export function GuidedTour({
    tourKey,
    steps,
    title = 'Tour Guiado',
    description = 'Te mostraremos las principales funcionalidades de esta sección.',
    trigger,
    autoStart = true,
    allowSkip = true,
    onFinish,
    onSkip,
    tooltipClassName,
    overlayClassName,
}: GuidedTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [targetElement, setTargetElement] = useState<Element | null>(null);
    const [isStepChanging, setIsStepChanging] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const isMounted = useRef(true);
    const previousTargetRef = useRef<Element | null>(null);
    const previousTabListRef = useRef<Element | null>(null);

    const { hasBeenCompleted, markAsCompleted, markAsSkipped } = useGuidedTourStorage(tourKey);

    const clearHighlights = useCallback(() => {
        const cleanupElement = (el: Element | null) => {
            if (!el) return;
            const htmlEl = el as HTMLElement;
            htmlEl.classList.remove('tour-highlight', 'tour-highlight-active', 'tour-tab-highlight', 'tour-tablist-highlight');
            htmlEl.removeAttribute('data-tour-highlight');
            ['background', 'color', 'border-color', 'transform', 'box-shadow', 'border-radius', 'position', 'z-index', 'background-image', 'padding', 'border'].forEach(prop => {
                htmlEl.style.removeProperty(prop);
            });
        };

        cleanupElement(previousTargetRef.current);
        cleanupElement(previousTabListRef.current);
        previousTargetRef.current = null;
        previousTabListRef.current = null;

        document.querySelectorAll('.tour-highlight, .tour-highlight-active, .tour-tab-highlight, .tour-tablist-highlight')
            .forEach(el => cleanupElement(el));
    }, []);

    const findElement = useCallback((selector: string): Element | null => {
        try {
            return document.querySelector(selector);
        } catch {
            return null;
        }
    }, []);

    const clickTab = useCallback((element: HTMLElement) => {
        const tabValue = element.getAttribute('value') || element.dataset.value;
        if (tabValue) {
            const trigger = document.querySelector(`[role="tab"][value="${tabValue}"]`) as HTMLElement;
            if (trigger) trigger.click();
            else element.click();
        } else {
            element.click();
        }
    }, []);

    const highlightElement = useCallback((element: Element | null) => {
        clearHighlights();
        if (!element) return;

        //para ciertos elementos, tengan estilos resaltados especificos
        const htmlEl = element as HTMLElement;
        previousTargetRef.current = element;
        htmlEl.classList.add('tour-highlight', 'tour-highlight-active');
        htmlEl.setAttribute('data-tour-highlight', 'true');

        const isTab = htmlEl.getAttribute('role') === 'tab' ||
            !!htmlEl.closest('[role="tablist"]') ||
            htmlEl.getAttribute('data-state') !== null;
        const isButton = htmlEl.tagName === 'BUTTON' || htmlEl.getAttribute('role') === 'button';
        const isInput = htmlEl.tagName === 'INPUT' || htmlEl.tagName === 'SELECT' || htmlEl.tagName === 'TEXTAREA';
        const isCard = htmlEl.classList.contains('card') || htmlEl.closest('[class*="card"]');
        if (isButton) {
            htmlEl.style.setProperty('transform', 'scale(1.05)', 'important');
            htmlEl.style.setProperty('box-shadow', '0 0 0 4px rgba(59, 130, 246, 0.3)', 'important');
        }
        if (isInput) {
            htmlEl.style.setProperty('border-color', '#3b82f6', 'important');
            htmlEl.style.setProperty('box-shadow', '0 0 0 4px rgba(59, 130, 246, 0.2)', 'important');
        }
        if (isCard) {
            htmlEl.style.setProperty('border-color', '#3b82f6', 'important');
            htmlEl.style.setProperty('box-shadow', '0 4px 24px rgba(59, 130, 246, 0.15)', 'important');
        }
        if (isTab) {
            htmlEl.style.cssText = `
        background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%) !important;
        color: #ffffff !important;
        border-color: #3b82f6 !important;
        transform: scale(1.08) !important;
        box-shadow: 0 0 25px rgba(59, 130, 246, 0.5) !important;
        border-radius: 6px !important;
        position: relative !important;
        z-index: 10000 !important;
      `;
            htmlEl.classList.add('tour-tab-highlight');

            const tabList = htmlEl.closest('[role="tablist"]');
            if (tabList) {
                const tabListEl = tabList as HTMLElement;
                previousTabListRef.current = tabListEl;
                tabListEl.classList.add('tour-tablist-highlight');
                tabListEl.style.cssText = `
          padding: 6px !important;
          border-radius: 12px !important;
          background: rgba(59, 130, 246, 0.08) !important;
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.08) !important;
          border: 1px solid rgba(59, 130, 246, 0.1) !important;
        `;
            }

            clickTab(htmlEl);
        } else {
            htmlEl.style.cssText = `
        position: relative !important;
        z-index: 10000 !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
      `;
        }


        void htmlEl.offsetHeight;
    }, [clearHighlights, clickTab]);

    useEffect(() => {
        if (hasBeenCompleted) {
            setIsComplete(true);
            setIsActive(false);
            return;
        }

        if (!autoStart) return;

        const initTour = () => {
            if (!isMounted.current) return;
            const firstTarget = steps[0]?.target;
            if (!firstTarget) {
                setIsReady(true);
                setIsActive(true);
                return;
            }

            const element = findElement(firstTarget);
            if (element) {
                setIsReady(true);
                setIsActive(true);
            } else {
                const retry = setTimeout(() => {
                    if (isMounted.current) {
                        const retryElement = findElement(firstTarget);
                        setIsReady(true);
                        setIsActive(!!retryElement);
                    }
                }, 800);
                return () => clearTimeout(retry);
            }
        };

        const timer = setTimeout(initTour, 600);
        return () => clearTimeout(timer);
    }, [hasBeenCompleted, autoStart, steps, findElement]);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            clearHighlights();
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';
        };
    }, [clearHighlights]);

    useEffect(() => {
        if (isActive) {
            document.body.style.overflow = 'hidden';

            const preventInteraction = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                // Permitir clicks SOLO en el tooltip y sus hijos
                const isTooltip = target.closest('.guided-tour-tooltip-content') ||
                    target.closest('.guided-tour-overlay');
                if (!isTooltip) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                return true;
            };
            document.addEventListener('click', preventInteraction, true);
            document.addEventListener('mousedown', preventInteraction, true);

            return () => {
                document.removeEventListener('click', preventInteraction, true);
                document.removeEventListener('mousedown', preventInteraction, true);
                document.body.style.overflow = '';
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive || !isReady) {
            setTargetElement(null);
            clearHighlights();
            return;
        }

        const target = steps[currentStep]?.target;
        if (!target) {
            setTargetElement(null);
            return;
        }

        setIsStepChanging(true);
        clearHighlights();

        const timer = setTimeout(() => {
            const element = findElement(target);
            if (element) {
                setTargetElement(element);
                highlightElement(element);
            } else {
                const retryTimer = setTimeout(() => {
                    const retryElement = findElement(target);
                    if (retryElement) {
                        setTargetElement(retryElement);
                        highlightElement(retryElement);
                    } else {
                        setTargetElement(null);
                    }
                }, 300);
                return () => clearTimeout(retryTimer);
            }

            setTimeout(() => setIsStepChanging(false), 300);
            steps[currentStep]?.onShow?.();
        }, 150);

        return () => clearTimeout(timer);
    }, [currentStep, steps, isActive, isReady, highlightElement, clearHighlights, findElement]);

    useEffect(() => {
        if (!isActive || !targetElement || isStepChanging) return;
        const element = targetElement as HTMLElement;
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!isVisible) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentStep, isActive, targetElement, isStepChanging]);

    useEffect(() => {
        if (isComplete) {
            clearHighlights();
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';
        }
    }, [isComplete, clearHighlights]);

    const finishTour = useCallback(() => {
        if (!isMounted.current) return;
        setIsActive(false);
        setIsComplete(true);
        clearHighlights();
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        markAsCompleted();
        onFinish?.();
    }, [clearHighlights, markAsCompleted, onFinish]);

    const skipTour = useCallback(() => {
        if (!isMounted.current) return;
        setIsActive(false);
        setIsComplete(true);
        clearHighlights();
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        markAsSkipped();
        onSkip?.();
    }, [clearHighlights, markAsSkipped, onSkip]);

    const goToNext = useCallback(() => {
        steps[currentStep]?.onComplete?.();
        clearHighlights();
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishTour();
        }
    }, [currentStep, steps, clearHighlights, finishTour]);

    const goToPrev = useCallback(() => {
        if (currentStep > 0) {
            clearHighlights();
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep, clearHighlights]);

    const goToStep = useCallback((index: number) => {
        if (index >= 0 && index < steps.length) {
            clearHighlights();
            setCurrentStep(index);
        }
    }, [steps.length, clearHighlights]);

    const contextValue: GuidedTourContextValue = {
        currentStep,
        totalSteps: steps.length,
        isActive,
        isComplete,
        goToNext,
        goToPrev,
        goToStep,
        finishTour,
        skipTour,
    };

    if (!isActive || !isReady) return trigger ? <>{trigger}</> : null;

    return (
        <GuidedTourContext.Provider value={contextValue}>
            <GuidedTourOverlay
                targetElement={targetElement}
                step={steps[currentStep]}
                overlayClassName={overlayClassName}
            >
                <GuidedTourControls
                    title={title}
                    description={description}
                    step={steps[currentStep]}
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    isFirstStep={currentStep === 0}
                    isLastStep={currentStep === steps.length - 1}
                    onNext={goToNext}
                    onPrev={goToPrev}
                    onSkip={allowSkip ? skipTour : undefined}
                    onFinish={finishTour}
                    tooltipClassName={tooltipClassName}
                />
            </GuidedTourOverlay>
        </GuidedTourContext.Provider>
    );
}