'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Camera,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  Loader2,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

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
  createdAt: string;
  user?: { name?: string; image?: string };
  media?: { id: string; type: string; url: string; thumbnail?: string }[];
  userVote?: 'helpful' | 'not_helpful' | null;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  rating5Count: number;
  rating4Count: number;
  rating3Count: number;
  rating2Count: number;
  rating1Count: number;
  verifiedCount: number;
  withMediaCount: number;
}

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

// Star rating component
function StarRating({
  rating,
  size = 'md',
  interactive = false,
  onRatingChange,
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div
      className={cn('flex items-center gap-0.5', interactive && 'cursor-pointer')}
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            'transition-colors',
            star <= displayRating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200',
            interactive && 'hover:scale-110'
          )}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onClick={() => interactive && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
}

// Rating distribution bar
function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <button className="group flex w-full items-center gap-2 text-sm">
      <span className="w-6 font-medium text-slate-600">{rating}</span>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <div className="flex-1">
        <Progress value={percentage} className="h-2" />
      </div>
      <span className="w-8 text-right text-xs text-slate-500">
        {count}
      </span>
    </button>
  );
}

export function ProductReviewsSection({ productId, productName }: ProductReviewsSectionProps) {
  const { data: session } = useSession();
  const t = useTranslations('reviews');

  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState<string>('all');

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    overallRating: 0,
    qualityRating: 0,
    valueRating: 0,
    title: '',
    content: '',
    pros: '',
    cons: '',
    isAnonymous: false,
  });

  // Fetch reviews
  const fetchReviews = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({
        productId,
        page: currentPage.toString(),
        limit: '5',
        sortBy,
        ...(filterRating !== 'all' && { rating: filterRating }),
      });

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setReviews(data.data.reviews);
        } else {
          setReviews((prev) => [...prev, ...data.data.reviews]);
        }
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/reviews/stats?productId=${productId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchReviews(true);
  }, [productId]);

  useEffect(() => {
    if (page > 1) {
      fetchReviews();
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchReviews(true);
  }, [sortBy, filterRating]);

  // Submit review
  const handleSubmitReview = async () => {
    if (formData.overallRating === 0) {
      toast.error(t('pleaseSelectRating'));
      return;
    }
    if (formData.content.length < 20) {
      toast.error(t('reviewTooShort'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(t('reviewSubmitted'));
        setShowReviewForm(false);
        setFormData({
          overallRating: 0,
          qualityRating: 0,
          valueRating: 0,
          title: '',
          content: '',
          pros: '',
          cons: '',
          isAnonymous: false,
        });
        fetchStats();
        fetchReviews(true);
      } else {
        toast.error(data.error?.message || t('submitError'));
      }
    } catch (error) {
      toast.error(t('submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Vote on review
  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!session) {
      toast.error(t('loginToVote'));
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHelpful }),
      });

      if (response.ok) {
        toast.success(t('voteRecorded'));
        fetchReviews(true);
      }
    } catch (error) {
      toast.error(t('voteError'));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Stats Summary */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Big rating */}
          <div className="text-center sm:text-left">
            <div className="text-5xl font-bold text-slate-900">
              {stats?.averageRating.toFixed(1) || '0.0'}
            </div>
            <StarRating rating={stats?.averageRating || 0} size="md" />
            <p className="mt-1 text-sm text-slate-500">
              {stats?.totalReviews || 0} {t('reviews')}
            </p>
          </div>

          {/* Distribution */}
          <div className="w-full space-y-1.5 sm:w-48">
            <RatingBar rating={5} count={stats?.rating5Count || 0} total={stats?.totalReviews || 0} />
            <RatingBar rating={4} count={stats?.rating4Count || 0} total={stats?.totalReviews || 0} />
            <RatingBar rating={3} count={stats?.rating3Count || 0} total={stats?.totalReviews || 0} />
            <RatingBar rating={2} count={stats?.rating2Count || 0} total={stats?.totalReviews || 0} />
            <RatingBar rating={1} count={stats?.rating1Count || 0} total={stats?.totalReviews || 0} />
          </div>
        </div>

        {/* Write Review Button */}
        <div className="flex flex-col items-start gap-2">
          {session ? (
            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2 sm:w-auto">
                  <MessageSquare className="h-4 w-4" />
                  {t('writeReview')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>{t('writeReviewFor', { product: productName })}</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  {/* Overall Rating */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t('overallRating')} *</label>
                    <StarRating
                      rating={formData.overallRating}
                      size="lg"
                      interactive
                      onRatingChange={(r) => setFormData((prev) => ({ ...prev, overallRating: r }))}
                    />
                  </div>

                  {/* Sub-ratings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm text-slate-600">{t('qualityRating')}</label>
                      <StarRating
                        rating={formData.qualityRating}
                        size="sm"
                        interactive
                        onRatingChange={(r) => setFormData((prev) => ({ ...prev, qualityRating: r }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm text-slate-600">{t('valueRating')}</label>
                      <StarRating
                        rating={formData.valueRating}
                        size="sm"
                        interactive
                        onRatingChange={(r) => setFormData((prev) => ({ ...prev, valueRating: r }))}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t('reviewTitle')}</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder={t('reviewTitlePlaceholder')}
                      maxLength={200}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t('yourReview')} *</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder={t('reviewContentPlaceholder')}
                      rows={4}
                      maxLength={5000}
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      {formData.content.length}/5000 ({t('min20Chars')})
                    </p>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-emerald-600">{t('pros')}</label>
                      <Textarea
                        value={formData.pros}
                        onChange={(e) => setFormData((prev) => ({ ...prev, pros: e.target.value }))}
                        placeholder={t('prosPlaceholder')}
                        rows={2}
                        className="border-emerald-200 focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-rose-600">{t('cons')}</label>
                      <Textarea
                        value={formData.cons}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cons: e.target.value }))}
                        placeholder={t('consPlaceholder')}
                        rows={2}
                        className="border-rose-200 focus:border-rose-400"
                      />
                    </div>
                  </div>

                  {/* Anonymous option */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">{t('postAnonymously')}</span>
                  </label>

                  {/* Submit */}
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('submitReview')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button asChild>
              <Link href="/login">{t('loginToReview')}</Link>
            </Button>
          )}

          <p className="text-xs text-slate-500">
            {stats?.verifiedCount || 0} {t('verifiedPurchases')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('newest')}</SelectItem>
            <SelectItem value="helpful">{t('mostHelpful')}</SelectItem>
            <SelectItem value="rating_high">{t('highestRating')}</SelectItem>
            <SelectItem value="rating_low">{t('lowestRating')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t('allRatings')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allRatings')}</SelectItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <SelectItem key={r} value={r.toString()}>
                {r} {t('stars')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-600">{t('noReviewsYet')}</p>
          <p className="mt-1 text-sm text-slate-500">{t('beFirstToReview')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {review.isAnonymous ? t('anonymous') : review.user?.name || t('anonymous')}
                      </span>
                      {review.isVerifiedPurchase && (
                        <Badge className="gap-1 bg-emerald-100 text-emerald-700" variant="secondary">
                          <CheckCircle2 className="h-3 w-3" />
                          {t('verifiedPurchase')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <StarRating rating={review.overallRating} size="sm" />
                      <span>•</span>
                      <span>{formatRelativeTime(new Date(review.createdAt))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mt-4">
                {review.title && (
                  <h4 className="mb-2 font-semibold text-slate-900">{review.title}</h4>
                )}
                <p className="text-slate-700">{review.content}</p>

                {/* Pros & Cons */}
                {(review.pros || review.cons) && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {review.pros && (
                      <div className="rounded-lg bg-emerald-50 p-3">
                        <p className="mb-1 text-xs font-semibold text-emerald-700">{t('pros')}</p>
                        <p className="text-sm text-emerald-800">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div className="rounded-lg bg-rose-50 p-3">
                        <p className="mb-1 text-xs font-semibold text-rose-700">{t('cons')}</p>
                        <p className="text-sm text-rose-800">{review.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Media */}
                {review.media && review.media.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.media.map((m) => (
                      <div
                        key={m.id}
                        className="h-16 w-16 overflow-hidden rounded-lg border"
                      >
                        <img
                          src={m.thumbnail || m.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleVote(review.id, true)}
                  className={cn(
                    'flex items-center gap-1.5 text-sm transition-colors',
                    review.userVote === 'helpful'
                      ? 'font-medium text-emerald-600'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {t('helpful')} ({review.helpfulCount})
                </button>
                <button
                  onClick={() => handleVote(review.id, false)}
                  className={cn(
                    'flex items-center gap-1.5 text-sm transition-colors',
                    review.userVote === 'not_helpful'
                      ? 'font-medium text-rose-600'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <ThumbsDown className="h-4 w-4" />
                  ({review.notHelpfulCount})
                </button>
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                {t('loadMore')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

