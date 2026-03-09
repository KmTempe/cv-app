import { renderHook, act } from '@testing-library/react'
import { useAutoFit } from '../../hooks/useAutoFit'

// Mock ResizeObserver
class ResizeObserverMock {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

describe('useAutoFit hook', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
            global.requestAnimationFrameMock = cb as unknown as () => void;
            return 0;
        });
    });

    afterAll(() => {
        jest.useRealTimers();
        if (window.requestAnimationFrame && (window.requestAnimationFrame as jest.Mock).mockRestore) {
            (window.requestAnimationFrame as jest.Mock).mockRestore();
        }
    });

    it('returns default scale of 1 initially', () => {
        const { result } = renderHook(() => useAutoFit())
        expect(result.current.scale).toBe(1)
        expect(result.current.isOverflowing).toBe(false)
        expect(result.current.containerRef).toBeDefined()
        expect(result.current.contentRef).toBeDefined()
    })

    it('handles resize measurements correctly', () => {
        // We simulate the container and content heights
        const { result } = renderHook(() => useAutoFit({ minScale: 0.5 }))

        // Attach mock elements to the refs
        const mockContainer = document.createElement('div')
        const mockContent = document.createElement('div')

        // Define exact clientHeight and scrollHeight
        Object.defineProperty(mockContainer, 'clientHeight', { value: 1000, writable: true })
        Object.defineProperty(mockContent, 'scrollHeight', { value: 2000, writable: true })

        act(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result.current.containerRef as any).current = mockContainer;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result.current.contentRef as any).current = mockContent;
        });

        // Simulate the resize observer triggering
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // The autoFit hook checks inside a requestAnimationFrame 
        act(() => {
            if (global.requestAnimationFrameMock) {
                global.requestAnimationFrameMock();
            }
        });

        // Limit is 1000, scroll is 2000 => scale should be max(0.5, (1000 - 4)/2000) = 0.498, but minScale is 0.5.
        // So scale should be 0.5
        expect(result.current.scale).toBe(0.5);
    })
})

declare global {
    var requestAnimationFrameMock: (() => void) | undefined;
}
