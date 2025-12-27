'use client';

import { useState } from 'react';
import {
  Crown,
  Camera,
  Video,
  Star,
  Zap,
  Award,
  Trophy,
  Medal,
  Target,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Badge types and their configurations
export const BADGE_CONFIG = {
  TOP_REVIEWER: {
    icon: Crown,
    name: 'Top Reviewer',
    nameVi: 'Người đánh giá hàng đầu',
    description: 'Đã viết hơn 50 đánh giá chất lượng',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    gradient: 'from-amber-400 to-orange-500',
    requirement: '50+ reviews với 80%+ helpful',
  },
  PHOTO_PRO: {
    icon: Camera,
    name: 'Photo Pro',
    nameVi: 'Chuyên gia hình ảnh',
    description: 'Đã upload hơn 100 hình ảnh',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    gradient: 'from-blue-400 to-cyan-500',
    requirement: '100+ photos uploaded',
  },
  VIDEO_STAR: {
    icon: Video,
    name: 'Video Star',
    nameVi: 'Ngôi sao video',
    description: 'Đã upload hơn 20 video đánh giá',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    gradient: 'from-purple-400 to-pink-500',
    requirement: '20+ videos uploaded',
  },
  TRUSTED_VOICE: {
    icon: Shield,
    name: 'Trusted Voice',
    nameVi: 'Tiếng nói uy tín',
    description: 'Có 25+ đánh giá verified purchase',
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    gradient: 'from-green-400 to-emerald-500',
    requirement: '25+ verified reviews, avg 4+ stars',
  },
  EARLY_ADOPTER: {
    icon: Zap,
    name: 'Early Adopter',
    nameVi: 'Người tiên phong',
    description: 'Là người đầu tiên đánh giá 10+ sản phẩm',
    color: 'text-rose-500',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-300',
    gradient: 'from-rose-400 to-red-500',
    requirement: '10+ first reviews on products',
  },
  HELPFUL_GURU: {
    icon: Star,
    name: 'Helpful Guru',
    nameVi: 'Guru hữu ích',
    description: 'Nhận 500+ helpful votes từ cộng đồng',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-300',
    gradient: 'from-indigo-400 to-violet-500',
    requirement: '500+ helpful votes received',
  },
} as const;

export type BadgeType = keyof typeof BADGE_CONFIG;

interface BadgeDisplayProps {
  badgeType: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  animated?: boolean;
}

export function BadgeDisplay({
  badgeType,
  size = 'md',
  showName = false,
  animated = false,
}: BadgeDisplayProps) {
  const config = BADGE_CONFIG[badgeType];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative inline-flex items-center gap-2',
              animated && 'group'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-full border-2',
                sizeClasses[size],
                config.bgColor,
                config.borderColor,
                animated && 'transition-transform duration-300 group-hover:scale-110'
              )}
            >
              <Icon className={cn(iconSizes[size], config.color)} />
            </div>
            {showName && (
              <span className={cn('text-sm font-medium', config.color)}>
                {config.name}
              </span>
            )}
            {animated && (
              <div
                className={cn(
                  'absolute inset-0 rounded-full bg-gradient-to-r opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50',
                  config.gradient
                )}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold">{config.nameVi}</div>
            <div className="text-xs text-gray-500">{config.description}</div>
            <div className="text-xs text-gray-400">
              Yêu cầu: {config.requirement}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BadgeCollectionProps {
  badges: BadgeType[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
}

export function BadgeCollection({
  badges,
  size = 'sm',
  maxDisplay = 5,
}: BadgeCollectionProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className="flex items-center gap-1">
      {displayBadges.map((badge) => (
        <BadgeDisplay key={badge} badgeType={badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

// Points display component
interface PointsDisplayProps {
  points: number;
  rank?: number;
  showRank?: boolean;
}

export function PointsDisplay({ points, rank, showRank = false }: PointsDisplayProps) {
  const tier = points >= 5000 ? 'platinum' : points >= 2000 ? 'gold' : points >= 500 ? 'silver' : 'bronze';
  
  const tierConfig = {
    bronze: { color: 'text-orange-600', bg: 'bg-orange-50', icon: Medal },
    silver: { color: 'text-gray-500', bg: 'bg-gray-100', icon: Medal },
    gold: { color: 'text-amber-500', bg: 'bg-amber-50', icon: Trophy },
    platinum: { color: 'text-purple-500', bg: 'bg-purple-50', icon: Crown },
  };

  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1', config.bg)}>
      <Icon className={cn('h-4 w-4', config.color)} />
      <span className={cn('font-semibold', config.color)}>
        {points.toLocaleString()} điểm
      </span>
      {showRank && rank && (
        <span className="text-xs text-gray-500">
          #{rank}
        </span>
      )}
    </div>
  );
}

// Leaderboard component
interface LeaderboardEntry {
  id: string;
  name: string;
  image?: string;
  points: number;
  badges: BadgeType[];
  reviewCount: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  period?: 'weekly' | 'monthly' | 'all';
}

export function Leaderboard({
  entries,
  title = 'Top Reviewers',
  period = 'monthly',
}: LeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(['weekly', 'monthly', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={cn(
                'rounded-md px-3 py-1 text-sm transition-colors',
                selectedPeriod === p
                  ? 'bg-white font-medium shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {p === 'weekly' ? 'Tuần' : p === 'monthly' ? 'Tháng' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={cn(
              'flex items-center gap-4 rounded-lg p-3 transition-colors',
              index < 3 ? 'bg-gradient-to-r from-amber-50 to-transparent' : 'hover:bg-gray-50'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full font-bold',
                index === 0
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                  : index === 1
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                    : index === 2
                      ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white'
                      : 'bg-gray-100 text-gray-600'
              )}
            >
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{entry.name}</span>
                {entry.badges.length > 0 && (
                  <BadgeCollection badges={entry.badges} size="sm" maxDisplay={3} />
                )}
              </div>
              <div className="text-sm text-gray-500">
                {entry.reviewCount} đánh giá
              </div>
            </div>

            <PointsDisplay points={entry.points} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress towards next badge
interface BadgeProgressProps {
  badgeType: BadgeType;
  current: number;
  required: number;
  earned?: boolean;
}

export function BadgeProgress({
  badgeType,
  current,
  required,
  earned = false,
}: BadgeProgressProps) {
  const config = BADGE_CONFIG[badgeType];
  const Icon = config.icon;
  const progress = Math.min((current / required) * 100, 100);

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all',
        earned ? 'border-green-300 bg-green-50' : 'border-gray-200'
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              earned ? config.bgColor : 'bg-gray-100'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                earned ? config.color : 'text-gray-400'
              )}
            />
          </div>
          <div>
            <div className={cn('font-medium', earned ? config.color : 'text-gray-700')}>
              {config.name}
            </div>
            <div className="text-xs text-gray-500">{config.description}</div>
          </div>
        </div>
        {earned && (
          <Award className="h-5 w-5 text-green-500" />
        )}
      </div>

      {!earned && (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r transition-all', config.gradient)}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{current} / {required}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

