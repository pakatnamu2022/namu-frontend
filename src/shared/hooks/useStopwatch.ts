import { useState, useEffect, useRef } from 'react';

export function useStopwatch(startTime?: Date | null) {
    const [elapsedTime, setElapsedTime] = useState(() => {
        if (!startTime) return 0;
        try {
            const date = startTime instanceof Date ? startTime : new Date(startTime);
            if (isNaN(date.getTime())) return 0;
            return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
        } catch {
            return 0;
        }
    });
    
    const [isRunning, setIsRunning] = useState(() => !!startTime);
    const intervalRef = useRef<number | null>(null);
    
    // CORREGIDO: Valor directo, no función
    const startTimeRef = useRef<number | null>(
        !startTime ? null : 
        (() => {
            try {
                const date = startTime instanceof Date ? startTime : new Date(startTime);
                return !isNaN(date.getTime()) ? date.getTime() : null;
            } catch {
                return null;
            }
        })()
    );

    useEffect(() => {
        if (isRunning) {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
            }

            intervalRef.current = window.setInterval(() => {
                if (startTimeRef.current) {
                    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                    setElapsedTime(elapsed);
                } else {
                    setElapsedTime(prev => prev + 1);
                }
            }, 1000);
        } else if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const start = () => {
        if (!isRunning) {
            if (!startTimeRef.current) {
                startTimeRef.current = Date.now();
            }
            setIsRunning(true);
        }
    };

    const stop = () => setIsRunning(false);
    const reset = () => {
        setIsRunning(false);
        setElapsedTime(0);
        startTimeRef.current = null;
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    return {
        elapsedTime,
        formattedTime: formatTime(elapsedTime),
        isRunning,
        start,
        stop,
        reset,
    };
}