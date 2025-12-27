'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { ThumbsUp, ThumbsDown, Flag, MessageCircle, CheckCircle2, ImageIcon, MoreVertical, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StarRating, RatingDistribution } from './star-rating';
import { cn } from '@/lib/utils';

// Types
interface ReviewMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnail?: string;
}

interface Review {
  id: string;
  overallRating: number;
  qualityRating?: number;
  valueRating?: number;
  title?: string;
  content: string;
  pros?: string;
  cons?: string;
  isVerifiedPurchase: boolean;
  isAnonymous: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  sellerResponse?: string;
  sellerRespondedAt?: string;
  createdAt: string;
  user: {
    name?: string;
    image?: string;
  };
  media: ReviewMedia[];
  userVote?: 'helpful' | 'not_helpful' | null;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  verifiedCount: number;
  withMediaCount: number;
}

interface ReviewListProps {
  productId: string;
  initialReviews: Review[];
  stats: ReviewStats;
  hasMore?: boolean;
}

export function ReviewList({
  productId,
  initialReviews,
  stats,
  hasMore: initialHasMore = false,
}: ReviewListProps) {
  const locale = useLocale();
  const { data: session } = useSession();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'rating_high' | 'rating_low'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterWithMedia, setFilterWithMedia] = useState(false);
  const [page, setPage] = useState(1);

  // Vote handler
  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!session?.user) {
      alert('Vui lòng đăng nhập để bình chọn');
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHelpful }),
      });

      if (response.ok) {
        const result = await response.json();
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpfulCount: result.data.helpfulCount,
                  notHelpfulCount: result.data.notHelpfulCount,
                  userVote: isHelpful ? 'helpful' : 'not_helpful',
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  // Report handler
  const handleReport = async (reviewId: string) => {
    if (!session?.user) {
      alert('Vui lòng đăng nhập để báo cáo');
      return;
    }

    const reason = prompt('Lý do báo cáo:');
    if (!reason) return;

    try {
      await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      alert('Đã gửi báo cáo. Cảm ơn bạn!');
    } catch (error) {
      console.error('Report error:', error);
    }
  };

  // Load more
  const loadMore = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        productId,
        page: String(page + 1),
        sortBy,
        ...(filterRating && { rating: String(filterRating) }),
        ...(filterVerified && { verified: 'true' }),
        ...(filterWithMedia && { withMedia: 'true' }),
      });

      const response = await fetch(`/api/reviews?${params}`);
      const result = await response.json();

      if (result.success) {
        setReviews((prev) => [...prev, ...result.data.reviews]);
        setHasMore(result.data.hasMore);
        setPage((p) => p + 1);
      }
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter/sort change
  const applyFilters = async () => {
    setIsLoading(true);
    setPage(1);

    try {
      const params = new URLSearchParams({
        productId,
        page: '1',
        sortBy,
        ...(filterRating && { rating: String(filterRating) }),
        ...(filterVerified && { verified: 'true' }),
        ...(filterWithMedia && { withMedia: 'true' }),
      });

      const response = await fetch(`/api/reviews?${params}`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data.reviews);
        setHasMore(result.data.hasMore);
      }
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      {stats.totalReviews > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Tổng quan đánh giá</h3>
          <RatingDistribution
            distribution={stats.distribution}
            totalReviews={stats.totalReviews}
            averageRating={stats.averageRating}
          />
          
          {/* Quick stats */}
          <div className="mt-4 flex gap-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {stats.verifiedCount} đã mua hàng
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4 text-blue-500" />
              {stats.withMediaCount} có hình ảnh
            </span>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Rating filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {filterRating ? `${filterRating} sao` : 'Tất cả sao'}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setFilterRating(null); applyFilters(); }}>
                Tất cả
              </DropdownMenuItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <DropdownMenuItem key={r} onClick={() => { setFilterRating(r); applyFilters(); }}>
                  {r} sao
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Verified filter */}
          <Button
            variant={filterVerified ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilterVerified(!filterVerified); applyFilters(); }}
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Đã mua
          </Button>

          {/* With media filter */}
          <Button
            variant={filterWithMedia ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilterWithMedia(!filterWithMedia); applyFilters(); }}
          >
            <ImageIcon className="mr-1 h-4 w-4" />
            Có ảnh
          </Button>
        </div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Sắp xếp: {sortBy === 'newest' ? 'Mới nhất' : sortBy === 'helpful' ? 'Hữu ích' : sortBy === 'rating_high' ? 'Điểm cao' : 'Điểm thấp'}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSortBy('newest'); applyFilters(); }}>
              Mới nhất
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('helpful'); applyFilters(); }}>
              Hữu ích nhất
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('rating_high'); applyFilters(); }}>
              Điểm cao nhất
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('rating_low'); applyFilters(); }}>
              Điểm thấp nhất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
          <p className="mt-2 text-sm text-gray-400">
            Hãy là người đầu tiên đánh giá!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              dateLocale={dateLocale}
              onVote={handleVote}
              onReport={handleReport}
              isLoggedIn={!!session?.user}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </Button>
        </div>
      )}
    </div>
  );
}

// Individual Review Card
interface ReviewCardProps {
  review: Review;
  dateLocale: Locale;
  onVote: (reviewId: string, isHelpful: boolean) => void;
  onReport: (reviewId: string) => void;
  isLoggedIn: boolean;
}

function ReviewCard({ review, dateLocale, onVote, onReport, isLoggedIn }: ReviewCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const userName = review.isAnonymous
    ? 'Ẩn danh'
    : review.user.name || 'Khách hàng';

  const initials = review.isAnonymous
    ? '?'
    : (review.user.name || 'K').charAt(0).toUpperCase();

  const contentPreview = review.content.length > 300 && !showFullContent
    ? review.content.slice(0, 300) + '...'
    : review.content;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {!review.isAnonymous && review.user.image && (
              <AvatarImage src={review.user.image} alt={userName} />
            )}
            <AvatarFallback className="bg-ce-primary/10 text-ce-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{userName}</span>
              {review.isVerifiedPurchase && (
                <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Đã mua
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <StarRating rating={review.overallRating} size="sm" />
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                  locale: dateLocale,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* More options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReport(review.id)}>
              <Flag className="mr-2 h-4 w-4" />
              Báo cáo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="mb-2 font-semibold text-gray-900">{review.title}</h4>
      )}

      {/* Content */}
      <p className="whitespace-pre-wrap text-gray-700">{contentPreview}</p>
      {review.content.length > 300 && (
        <button
          onClick={() => setShowFullContent(!showFullContent)}
          className="mt-1 text-sm font-medium text-ce-primary hover:underline"
        >
          {showFullContent ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}

      {/* Pros & Cons */}
      {(review.pros || review.cons) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {review.pros && (
            <div className="rounded-lg bg-green-50 p-3">
              <div className="mb-1 flex items-center gap-1 text-sm font-medium text-green-700">
                <ThumbsUp className="h-4 w-4" />
                Ưu điểm
              </div>
              <p className="text-sm text-green-600">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="rounded-lg bg-red-50 p-3">
              <div className="mb-1 flex items-center gap-1 text-sm font-medium text-red-700">
                <ThumbsDown className="h-4 w-4" />
                Nhược điểm
              </div>
              <p className="text-sm text-red-600">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Media */}
      {review.media.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.media.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedImage(m.url)}
              className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 transition-transform hover:scale-105"
            >
              <img
                src={m.thumbnail || m.url}
                alt=""
                className="h-full w-full object-cover"
              />
              {m.type === 'VIDEO' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-2xl text-white">▶</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Seller Response */}
      {review.sellerResponse && (
        <div className="mt-4 rounded-lg border border-ce-primary/20 bg-ce-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ce-primary">
            <MessageCircle className="h-4 w-4" />
            Phản hồi từ người bán
          </div>
          <p className="text-sm text-gray-700">{review.sellerResponse}</p>
          {review.sellerRespondedAt && (
            <p className="mt-2 text-xs text-gray-500">
              {formatDistanceToNow(new Date(review.sellerRespondedAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </p>
          )}
        </div>
      )}

      {/* Voting */}
      <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
        <span className="text-sm text-gray-500">Đánh giá này có hữu ích?</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(review.id, true)}
            disabled={!isLoggedIn}
            className={cn(
              'gap-1',
              review.userVote === 'helpful' && 'bg-green-50 text-green-600'
            )}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{review.helpfulCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(review.id, false)}
            disabled={!isLoggedIn}
            className={cn(
              'gap-1',
              review.userVote === 'not_helpful' && 'bg-red-50 text-red-600'
            )}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{review.notHelpfulCount}</span>
          </Button>
        </div>
      </div>

      {/* Image lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

