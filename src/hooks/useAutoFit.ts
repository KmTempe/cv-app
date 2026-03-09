import { useEffect, useRef, useState, useCallback } from 'react';

interface AutoFitOptions {
    minScale?: number;            // Don't shrink to microscopic sizes
    debounceMs?: number;
}

export function useAutoFit({
    minScale = 0.65,
    debounceMs = 150
}: AutoFitOptions = {}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [isOverflowing, setIsOverflowing] = useState(false);

    // Pixels per mm is roughly 3.78 on standard 96dpi displays. 
    // However since the container forces `minHeight: 297mm`, we can directly compare scrollHeight vs clientHeight.
    const adjustScale = useCallback(() => {
        if (!contentRef.current || !containerRef.current) return;

        const contentElement = contentRef.current;
        // The container holds the fixed A4 dimensions
        const containerElement = containerRef.current;

        // Reset scale to 1 temporarily to measure natural unscaled height
        let currentScale = 1;

        const checkHeight = () => {
            requestAnimationFrame(() => {
                // Measure the actual exact height of the scrollable content vs the fixed container wrapper
                const scrollH = contentElement.scrollHeight;
                const limitH = containerElement.clientHeight;

                if (scrollH > limitH) {
                    // It's overflowing! Calculate exactly how much it needs to scale down to fit
                    // Subtract a tiny margin (e.g., 2) for safety border so it doesn't trigger scrollbars
                    currentScale = Math.max(minScale, (limitH - 4) / scrollH);
                    setIsOverflowing(currentScale === minScale && scrollH * minScale > limitH);
                } else {
                    currentScale = 1;
                    setIsOverflowing(false);
                }

                setScale(currentScale);
            });
        };

        checkHeight();
    }, [minScale]);

    // Use ResizeObserver to detect changes in container/content dimensions
    useEffect(() => {
        const obs = new ResizeObserver(() => {
            // Debounce the adjustment to avoid flashing
            const timeoutId = setTimeout(adjustScale, debounceMs);
            return () => clearTimeout(timeoutId);
        });

        if (contentRef.current) {
            obs.observe(contentRef.current);
        }

        return () => obs.disconnect();
    }, [adjustScale, debounceMs]);

    // Triger one initial layout check on mount
    useEffect(() => {
        // Just delay it slightly to let fonts render
        const t = setTimeout(adjustScale, 300);
        return () => clearTimeout(t);
    }, [adjustScale]);

    return { containerRef, contentRef, scale, isOverflowing };
}
