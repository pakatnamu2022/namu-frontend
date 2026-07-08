import { useState } from 'react';

const STORAGE_PREFIX = 'guided_tour_';

export function useGuidedTourStorage(tourKey: string) {
    const storageKey = `${STORAGE_PREFIX}${tourKey}`;

    const [hasBeenCompleted, setHasBeenCompleted] = useState(() => {
        try {
            return localStorage.getItem(storageKey) === 'completed';
        } catch {
            return false;
        }
    });

    const markAsCompleted = () => {
        try {
            localStorage.setItem(storageKey, 'completed');
            setHasBeenCompleted(true);
        } catch (error) {
            console.error('Error saving tour state:', error);
        }
    };

    const markAsSkipped = () => {
        try {
            localStorage.setItem(storageKey, 'skipped');
            setHasBeenCompleted(true);
        } catch (error) {
            console.error('Error saving tour state:', error);
        }
    };

    const resetTour = () => {
        try {
            localStorage.removeItem(storageKey);
            setHasBeenCompleted(false);
        } catch (error) {
            console.error('Error resetting tour state:', error);
        }
    };

    return { hasBeenCompleted, markAsCompleted, markAsSkipped, resetTour };
}