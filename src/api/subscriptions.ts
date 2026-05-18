import api from '../config/api';
import type { Plan, SubscriptionStatus } from '../types/user.type';

export type { Plan, SubscriptionStatus };

export interface SubscriptionResponse {
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

export interface FeaturesResponse {
  free: string[];
  premium: string[];
  userPlan: Plan;
  hasPremiumAccess: boolean;
}

export const getSubscription = async (): Promise<SubscriptionResponse> => {
  const response = await api.get<SubscriptionResponse>('/subscriptions/me');
  return response.data;
};

export const getFeatures = async (): Promise<FeaturesResponse> => {
  const response = await api.get<FeaturesResponse>('/subscriptions/features');
  return response.data;
};

export const activateSubscription = async (): Promise<SubscriptionResponse> => {
  const response = await api.post<SubscriptionResponse>(
    '/subscriptions/activate',
    {},
  );
  return response.data;
};

export const cancelSubscription = async (): Promise<SubscriptionResponse> => {
  const response = await api.post<SubscriptionResponse>(
    '/subscriptions/cancel',
    {},
  );
  return response.data;
};
