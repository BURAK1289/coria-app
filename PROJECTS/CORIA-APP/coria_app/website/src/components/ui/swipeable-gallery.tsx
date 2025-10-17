'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons/Icon';

interface SwipeableGalleryProps {
  children: React.ReactNode[];
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onSlideChange?: (index: number) => void;
}

export function SwipeableGallery({
  children,
  className,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  onSlideChange,
}: SwipeableGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = children.length;

  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentIndex(newIndex);
    setTranslateX(0);
    onSlideChange?.(newIndex);
  }, [totalSlides, onSlideChange]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isDragging) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % totalSlides);
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, totalSlides, isDragging]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    
    // Pause auto-play during interaction
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentIndex > 0) {
        prevSlide();
      } else if (translateX < 0 && currentIndex < totalSlides - 1) {
        nextSlide();
      }
    }
    
    setTranslateX(0);
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 50;
    
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentIndex > 0) {
        prevSlide();
      } else if (translateX < 0 && currentIndex < totalSlides - 1) {
        nextSlide();
      }
    }
    
    setTranslateX(0);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Main gallery container */}
      <div
        ref={containerRef}
        className="swipeable cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10',
              'bg-white/80 backdrop-blur-sm rounded-full p-2',
              'shadow-md hover:bg-white transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'touch-target'
            )}
            aria-label="Previous slide"
          >
            <Icon name="chevron-left" size={20} className="text-gray-700" aria-hidden="true" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={currentIndex === totalSlides - 1}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10',
              'bg-white/80 backdrop-blur-sm rounded-full p-2',
              'shadow-md hover:bg-white transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'touch-target'
            )}
            aria-label="Next slide"
          >
            <Icon name="chevron-right" size={20} className="text-gray-700" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && totalSlides > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors touch-target',
                index === currentIndex
                  ? 'bg-coria-primary'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe indicator for mobile */}
      <div className="swipe-indicator md:hidden" />
    </div>
  );
}