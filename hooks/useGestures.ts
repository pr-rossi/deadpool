import { useRef, useCallback } from 'react';

interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onLongPress?: () => void;
}

interface GestureOptions {
  threshold?: number;
  preventScroll?: boolean;
}

export const useGestures = (handlers: GestureHandlers, options: GestureOptions = {}) => {
  const { threshold = 50, preventScroll = false } = options;
  
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const initialDistance = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2 && handlers.onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance.current = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    }

    // Long press detection
    if (handlers.onLongPress) {
      longPressTimeout.current = setTimeout(() => {
        handlers.onLongPress!();
      }, 500);
    }
  }, [handlers, preventScroll]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    // Handle pinch gestures
    if (e.touches.length === 2 && handlers.onPinch && initialDistance.current > 0) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = currentDistance / initialDistance.current;
      handlers.onPinch(scale);
    }
  }, [handlers]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;

    // Check if it's a valid swipe (fast enough and far enough)
    if (deltaTime < 300 && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight();
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && handlers.onSwipeDown) {
          handlers.onSwipeDown();
        } else if (deltaY < 0 && handlers.onSwipeUp) {
          handlers.onSwipeUp();
        }
      }
    }

    touchStart.current = null;
    initialDistance.current = 0;
  }, [handlers, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

export default useGestures;