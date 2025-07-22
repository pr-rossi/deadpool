import React, { useRef, useState, useEffect, useCallback } from 'react';
import '../styles/NativeScrollView.css';

interface NativeScrollViewProps {
  children: React.ReactNode;
  className?: string;
  showScrollIndicator?: boolean;
  bounces?: boolean;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
  style?: React.CSSProperties;
}

const NativeScrollView: React.FC<NativeScrollViewProps> = ({
  children,
  className = '',
  showScrollIndicator = false,
  bounces = true,
  onRefresh,
  refreshing = false,
  onScroll,
  style
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const startY = useRef(0);
  const isDragging = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onRefresh || refreshing) return;
    
    const container = scrollRef.current;
    if (!container || container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, [onRefresh, refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !onRefresh || refreshing) return;

    const container = scrollRef.current;
    if (!container || container.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && container.scrollTop === 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.4, 80);
      setPullDistance(distance);
      setCanRefresh(distance >= 60);
    }
  }, [onRefresh, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;

    isDragging.current = false;

    if (canRefresh && onRefresh && !refreshing) {
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }
    }

    setPullDistance(0);
    setCanRefresh(false);
  }, [canRefresh, onRefresh, refreshing]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScrollTop = target.scrollTop;
    
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    if (onScroll) {
      onScroll(newScrollTop, target.scrollHeight, target.clientHeight);
    }
  }, [onScroll]);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  const scrollIndicatorHeight = scrollRef.current ? 
    (scrollRef.current.clientHeight / scrollRef.current.scrollHeight) * 100 : 0;
  
  const scrollIndicatorTop = scrollRef.current ? 
    (scrollTop / (scrollRef.current.scrollHeight - scrollRef.current.clientHeight)) * 
    (100 - scrollIndicatorHeight) : 0;

  return (
    <div className="native-scroll-container">
      {onRefresh && (
        <div 
          className={`pull-refresh-indicator ${refreshing ? 'refreshing' : ''} ${canRefresh ? 'can-refresh' : ''}`}
          style={{ 
            opacity: pullDistance > 0 || refreshing ? 1 : 0,
            transform: `translateY(${Math.min(pullDistance - 20, 40)}px)`
          }}
        >
          <div className={`refresh-spinner ${refreshing ? 'spinning' : ''}`}>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        </div>
      )}
      
      <div
        ref={scrollRef}
        className={`native-scroll-view ${bounces ? 'bounces' : ''} ${isScrolling ? 'scrolling' : ''} ${className}`}
        style={{
          ...style,
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging.current ? 'none' : 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)'
        }}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {showScrollIndicator && scrollIndicatorHeight < 100 && (
        <div 
          className={`scroll-indicator ${isScrolling ? 'visible' : ''}`}
          style={{
            height: `${scrollIndicatorHeight}%`,
            top: `${scrollIndicatorTop}%`
          }}
        />
      )}
    </div>
  );
};

export default NativeScrollView;