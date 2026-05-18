import type { User } from '../types/user.type';

export function hasPremiumAccess(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.plan !== 'PREMIUM') return false;
  if (user.subscriptionStatus === 'EXPIRED') return false;
  if (!user.subscriptionEndDate) return true;
  return new Date(user.subscriptionEndDate).getTime() >= Date.now();
}

export function formatSubscriptionStatus(user: User | null | undefined): string {
  if (!user) return 'Free Plan';

  const plan = user.plan ?? 'FREE';
  const status = user.subscriptionStatus ?? 'ACTIVE';
  const endDate = user.subscriptionEndDate ?? null;

  if (plan !== 'PREMIUM' || status === 'EXPIRED') {
    return 'Free Plan';
  }

  const formattedEnd = endDate
    ? new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    : null;

  if (status === 'CANCELED') {
    return formattedEnd
      ? `Premium — expires ${formattedEnd} (canceled)`
      : 'Premium (canceled)';
  }

  return formattedEnd ? `Premium — renews ${formattedEnd}` : 'Premium';
}

export function getPlanLabel(user: User | null | undefined): 'Free' | 'Premium' {
  return hasPremiumAccess(user) ? 'Premium' : 'Free';
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const FEATURE_LABELS: Record<string, string> = {
  profile: 'Public profile',
  basic_game_lists: 'Game lists (up to 3)',
  basic_recommendations: 'Game recommendations',
  comments_and_reviews: 'Comments & reviews',
  extended_profile_analytics: 'Extended profile analytics',
  profile_customization: 'Profile customization',
  more_game_lists: 'Unlimited game lists',
  premium_badge: 'Premium badge',
};

export function featureLabel(key: string): string {
  return FEATURE_LABELS[key] ?? key.replace(/_/g, ' ');
}
