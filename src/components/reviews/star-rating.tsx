'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

const gapClasses = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
  xl: 'gap-1.5',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  showValue = false,
  showCount = false,
  count = 0,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className={cn('flex items-center', gapClasses[size], className)}>
      <div className={cn('flex items-center', gapClasses[size])}>
        {Array.from({ length: maxRating }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= displayRating;
          const isHalf = !isFilled && starIndex - 0.5 <= displayRating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'relative transition-transform duration-150',
                interactive && 'cursor-pointer hover:scale-110 focus:outline-none',
                !interactive && 'cursor-default'
              )}
              aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''}`}
            >
              {/* Background star (empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'text-gray-300 transition-colors duration-150'
                )}
                fill="currentColor"
                strokeWidth={0}
              />
              
              {/* Filled star overlay */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'absolute inset-0 transition-all duration-150',
                  isFilled
                    ? 'text-amber-400'
                    : isHalf
                      ? 'text-amber-400'
                      : 'text-transparent'
                )}
                fill="currentColor"
                strokeWidth={0}
                style={
                  isHalf
                    ? {
                        clipPath: 'inset(0 50% 0 0)',
                      }
                    : undefined
                }
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span
          className={cn(
            'font-semibold text-gray-900',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base',
            size === 'xl' && 'text-lg'
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}

      {showCount && count > 0 && (
        <span
          className={cn(
            'text-gray-500',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-sm',
            size === 'xl' && 'text-base'
          )}
        >
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

// Animated star rating for forms
interface AnimatedStarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export function AnimatedStarRating({
  value,
  onChange,
  label,
  error,
  required,
}: AnimatedStarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const labels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= (hoveredStar || value);
            
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className={cn(
                  'relative p-1 transition-all duration-200 focus:outline-none',
                  'hover:scale-125 active:scale-110'
                )}
                aria-label={`Đánh giá ${star} sao`}
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-all duration-200',
                    isActive
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
                
                {/* Ripple effect on selection */}
                {star === value && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
                )}
              </button>
            );
          })}
        </div>

        {/* Rating label */}
        <span
          className={cn(
            'min-w-[80px] text-sm font-medium transition-all duration-200',
            (hoveredStar || value) > 0 ? 'text-amber-600' : 'text-gray-400'
          )}
        >
          {labels[hoveredStar || value] || 'Chọn đánh giá'}
        </span>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Rating distribution bar
interface RatingDistributionProps {
  distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  totalReviews: number;
  averageRating: number;
}

export function RatingDistribution({
  distribution,
  totalReviews,
  averageRating,
}: RatingDistributionProps) {
  return (
    <div className="flex gap-8">
      {/* Average rating */}
      <div className="flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-gray-900">
          {averageRating.toFixed(1)}
        </div>
        <StarRating rating={averageRating} size="lg" />
        <div className="mt-1 text-sm text-gray-500">
          {totalReviews.toLocaleString()} đánh giá
        </div>
      </div>

      {/* Distribution bars */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const item = distribution.find((d) => d.rating === rating) || {
            rating,
            count: 0,
            percentage: 0,
          };

          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="w-3 text-sm font-medium text-gray-600">
                {rating}
              </span>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm text-gray-500">
                {item.count > 0 ? item.count.toLocaleString() : '0'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

