import { getItemFromLocalStorage, setItemToLocalStorage } from './localStorage';

export const FOLLOWED_USERS_STORAGE_KEY = 'klyro_followed_users';

export type FollowedUsersState = Record<string, boolean>;

type FollowableUser = {
  id: string;
  isFollowing?: boolean;
};

export const readFollowedUsersState = (): FollowedUsersState => {
  try {
    const raw = getItemFromLocalStorage(FOLLOWED_USERS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<FollowedUsersState>((acc, [key, value]) => {
      if (typeof value === 'boolean') {
        acc[key] = value;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

export const persistFollowedUsersState = (value: FollowedUsersState): void => {
  setItemToLocalStorage(FOLLOWED_USERS_STORAGE_KEY, JSON.stringify(value));
};

export const mergeFollowedStateFromUsers = <T extends FollowableUser>(
  prev: FollowedUsersState,
  items: T[],
  /** When true, backend values always win (e.g. on a fresh full-page load). */
  trustBackend = false,
): FollowedUsersState => {
  const next = { ...prev };

  for (const user of items) {
    if (typeof user.isFollowing !== 'boolean') {
      continue;
    }

    if (user.isFollowing) {
      // Backend true always wins so stale local false recovers.
      next[user.id] = true;
      continue;
    }

    // Backend false: always write when trustBackend is set, otherwise only
    // write when there is no existing local value (preserves optimistic state).
    if (trustBackend || !(user.id in next)) {
      next[user.id] = false;
    }
  }

  return next;
};

export const resolveFollowedState = (
  followed: FollowedUsersState,
  userId: string,
  backendIsFollowing?: boolean,
): boolean => {
  if (userId in followed) {
    return followed[userId];
  }

  return !!backendIsFollowing;
};
