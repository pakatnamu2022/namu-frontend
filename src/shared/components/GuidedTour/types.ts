import { ReactNode } from 'react';

export interface TourStep {
    id: string;
    target: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    icon?: ReactNode;
    onShow?: () => void;
    onComplete?: () => void;
}

export interface GuidedTourProps {
    tourKey: string;
    steps: TourStep[];
    title?: string;
    description?: string;
    trigger?: ReactNode;
    autoStart?: boolean;
    allowSkip?: boolean;
    onFinish?: () => void;
    onSkip?: () => void;
    tooltipClassName?: string;
    overlayClassName?: string;
}

export interface GuidedTourContextValue {
    currentStep: number;
    totalSteps: number;
    isActive: boolean;
    isComplete: boolean;
    goToNext: () => void;
    goToPrev: () => void;
    goToStep: (index: number) => void;
    finishTour: () => void;
    skipTour: () => void;
}