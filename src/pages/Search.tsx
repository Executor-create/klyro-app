import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { FiSearch, FiUsers, FiX } from 'react-icons/fi';
import { UserRow } from '../components/Search/UserRow';
import { LuGamepad2 } from 'react-icons/lu';
import { fetchGames, type Game } from '../api/games';
import {
  fetchUsers,
  followUser,
  unfollowUser,
  type NormalizedUser,
} from '../api/users';
import { useNavigate } from 'react-router-dom';
import {
  mergeFollowedStateFromUsers,
  persistFollowedUsersState,
  readFollowedUsersState,
  resolveFollowedState,
} from '../utils/followedUsersState';

type SearchUser = NormalizedUser;

const QUICK_PICKS = [
  { label: 'Co-op nights', value: 'co-op' },
  { label: 'Indie gems', value: 'indie' },
  { label: 'Strategy', value: 'strategy' },
  { label: 'Roguelike', value: 'roguelike' },
  { label: 'Story-driven', value: 'story' },
  { label: 'Multiplayer', value: 'multiplayer' },
];

function UserRowSkeleton() {
  return (
    <li className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-zinc-800 animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded-full bg-zinc-800 animate-shimmer" />
          <div className="h-3 w-28 rounded-full bg-zinc-800 animate-shimmer" />
          <div className="h-3 w-56 rounded-full bg-zinc-800 animate-shimmer" />
        </div>
        <div className="h-9 w-24 rounded-lg bg-zinc-800 animate-shimmer" />
      </div>
    </li>
  );
}

function GameCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden">
      <div className="h-36 bg-zinc-800 animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-4/5 rounded-full bg-zinc-800 animate-shimmer" />
        <div className="flex gap-2">
          <div className="h-3 w-12 rounded-full bg-zinc-800 animate-shimmer" />
          <div className="h-3 w-16 rounded-full bg-zinc-800 animate-shimmer" />
        </div>
        <div className="h-3 w-24 rounded-full bg-zinc-800 animate-shimmer" />
      </div>
    </div>
  );
}

const Search = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'games'>('users');

  const [users, setUsers] = useState<SearchUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoadingMore, setUsersLoadingMore] = useState(false);
  const [usersNextCursor, setUsersNextCursor] = useState<string | null>(null);
  const [usersHasMore, setUsersHasMore] = useState(false);

  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);

  const [followed, setFollowed] = useState<Record<string, boolean>>(() =>
    readFollowedUsersState(),
  );
  const [followingPending, setFollowingPending] = useState<
    Record<string, boolean>
  >({});

  const usersController = useRef<AbortController | null>(null);
  const gamesController = useRef<AbortController | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable
      ) {
        return;
      }

      const isSlash = event.key === '/' && !event.metaKey && !event.ctrlKey;
      const isCommandK =
        event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey);

      if (isSlash || isCommandK) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    persistFollowedUsersState(followed);
  }, [followed]);

  useEffect(() => {
    if (usersController.current) usersController.current.abort();
    if (gamesController.current) gamesController.current.abort();

    const uCtrl = new AbortController();
    const gCtrl = new AbortController();
    usersController.current = uCtrl;
    gamesController.current = gCtrl;

    const t = setTimeout(async () => {
      const trimmedQuery = query.trim();

      setUsersLoading(true);
      setUsersLoadingMore(false);
      setGamesLoading(true);

      try {
        if (trimmedQuery.length > 0) {
          let allUsers: SearchUser[] = [];
          let next: string | undefined = undefined;

          do {
            const page = await fetchUsers(50, next, {
              search: trimmedQuery,
              signal: uCtrl.signal,
            });
            allUsers = [...allUsers, ...page.data];
            next = page.nextCursor || undefined;
          } while (next && !uCtrl.signal.aborted);

          setUsers(allUsers);
          setFollowed((prev) => mergeFollowedStateFromUsers(prev, allUsers));
          setUsersNextCursor(null);
          setUsersHasMore(false);
        } else {
          const page = await fetchUsers(9, undefined, { signal: uCtrl.signal });
          const initialUsers = page.data;
          setUsers(initialUsers);
          setFollowed((prev) =>
            mergeFollowedStateFromUsers(prev, initialUsers),
          );
          setUsersNextCursor(page.nextCursor || null);
          setUsersHasMore(!!page.hasMore);
        }
      } catch (err) {
        if (!uCtrl.signal.aborted) {
          setUsers([]);
          setUsersNextCursor(null);
          setUsersHasMore(false);
        }
      } finally {
        setUsersLoading(false);
      }

      try {
        const gResp = await fetchGames(9, undefined, {
          search: trimmedQuery,
          signal: gCtrl.signal,
        });
        setGames(gResp.data || []);
      } catch (err) {
        if (
          (err as any)?.name !== 'Canceled' &&
          gCtrl.signal.aborted === false
        ) {
          setGames([]);
        }
      } finally {
        setGamesLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(t);
      uCtrl.abort();
      gCtrl.abort();
    };
  }, [query]);

  const loadMoreUsers = async () => {
    if (!usersHasMore || usersLoadingMore || !usersNextCursor) return;

    setUsersLoadingMore(true);

    try {
      const page = await fetchUsers(9, usersNextCursor, {
        search: query.trim() || undefined,
      });
      const newUsers = page.data;
      setUsers((prev) => [...prev, ...newUsers]);
      setFollowed((prev) => mergeFollowedStateFromUsers(prev, newUsers));
      setUsersNextCursor(page.nextCursor || null);
      setUsersHasMore(!!page.hasMore);
    } catch {
      // ignore
    } finally {
      setUsersLoadingMore(false);
    }
  };

  const updateUserFollowState = (id: string, isFollowing: boolean) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== id) return user;
        const currentFollowers = user.followers ?? 0;
        return {
          ...user,
          isFollowing,
          followers: Math.max(0, currentFollowers + (isFollowing ? 1 : -1)),
        };
      }),
    );
  };

  const toggleFollow = async (id: string) => {
    if (followingPending[id]) return;

    const currentUser = users.find((user) => user.id === id);
    const wasFollowing = resolveFollowedState(
      followed,
      id,
      currentUser?.isFollowing,
    );
    const nextFollowing = !wasFollowing;

    setFollowingPending((prev) => ({ ...prev, [id]: true }));
    setFollowed((prev) => ({ ...prev, [id]: nextFollowing }));
    updateUserFollowState(id, nextFollowing);

    try {
      if (nextFollowing) {
        await followUser(id);
      } else {
        await unfollowUser(id);
      }
    } catch (err) {
      setFollowed((prev) => ({ ...prev, [id]: wasFollowing }));
      updateUserFollowState(id, wasFollowing);
      console.error('Failed to toggle follow for', id, err);
    } finally {
      setFollowingPending((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const userCountLabel = usersLoading ? '...' : users.length.toString();
  const gameCountLabel = gamesLoading ? '...' : games.length.toString();
  const showUsersSkeleton = usersLoading && users.length === 0;
  const showGamesSkeleton = gamesLoading && games.length === 0;

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main
          ref={mainRef}
          className="relative flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 right-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),rgba(16,185,129,0))] blur-3xl" />
            <div className="absolute top-24 left-[-10%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.16),rgba(14,165,233,0))] blur-3xl" />
            <div className="absolute bottom-16 right-[-15%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12),rgba(251,191,36,0))] blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col px-8 pt-8 pb-6 gap-8">
            {/* heading */}
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                <FiSearch className="text-emerald-300" size={14} />
                <span>Discover</span>
              </div>
              <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Find your gaming community
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
                Search for gamers to follow and games to play. Build your
                network and discover new titles.
              </p>
            </div>

            {/* search section */}
            <div className="flex flex-col gap-4 max-w-3xl">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  width="15"
                  height="15"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="8.5" cy="8.5" r="5.5" />
                  <path d="M15 15l-3-3" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users, games, or genres..."
                  aria-label="Search users and games"
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition"
                />
                {hasQuery && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    aria-label="Clear search"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>

              {!hasQuery && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    Quick picks
                  </span>
                  {QUICK_PICKS.map((pick) => (
                    <button
                      key={pick.value}
                      type="button"
                      onClick={() => {
                        setQuery(pick.value);
                        setActiveTab('games');
                        searchInputRef.current?.focus();
                      }}
                      className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white transition"
                    >
                      {pick.label}
                    </button>
                  ))}
                  <span className="sm:ml-auto hidden sm:flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="rounded border border-zinc-700/70 bg-zinc-900/60 px-1.5 py-0.5 text-[10px]">
                      /
                    </span>
                    Focus search
                  </span>
                </div>
              )}

              {/* tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition border ${
                    activeTab === 'users'
                      ? 'bg-linear-to-r from-emerald-500 to-sky-500 text-zinc-950 border-transparent shadow-lg shadow-emerald-500/20'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <FiUsers size={15} />
                  <span>Users</span>
                  <span className="text-xs text-zinc-500">
                    ({users.length})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('games')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition border ${
                    activeTab === 'games'
                      ? 'bg-linear-to-r from-amber-300 to-rose-400 text-zinc-950 border-transparent shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <LuGamepad2 size={15} />
                  <span>Games</span>
                  <span className="text-xs text-zinc-500">
                    ({games.length})
                  </span>
                </button>
              </div>
            </div>

            {/* content */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    Results
                  </div>
                  <h2 className="font-google text-lg text-white">
                    {hasQuery
                      ? `Results for "${trimmedQuery}"`
                      : 'Trending right now'}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {hasQuery
                      ? 'Searching across people and games'
                      : 'Fresh picks from the community'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <div className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5">
                    Users <span className="text-white">{userCountLabel}</span>
                  </div>
                  <div className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5">
                    Games <span className="text-white">{gameCountLabel}</span>
                  </div>
                  {(usersLoading || gamesLoading) && (
                    <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Updating
                    </div>
                  )}
                </div>
              </div>
              {activeTab === 'users' ? (
                showUsersSkeleton ? (
                  <ul className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <UserRowSkeleton key={index} />
                    ))}
                  </ul>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <span className="text-4xl opacity-20">👥</span>
                    <p className="text-sm text-zinc-500">
                      {hasQuery
                        ? `No users found for "${trimmedQuery}".`
                        : 'No users found.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ul className="space-y-4">
                      {users.map((u) => {
                        const isUserFollowed = resolveFollowedState(
                          followed,
                          u.id,
                          u.isFollowing,
                        );
                        return (
                          <UserRow
                            key={u.id}
                            user={u}
                            isFollowed={isUserFollowed}
                            isPending={!!followingPending[u.id]}
                            onFollow={toggleFollow}
                          />
                        );
                      })}
                    </ul>
                    {usersHasMore && (
                      <div className="flex justify-center pt-4">
                        <button
                          type="button"
                          onClick={async (e) => {
                            const prevScroll = mainRef.current?.scrollTop ?? 0;
                            await loadMoreUsers();
                            if (mainRef.current) {
                              requestAnimationFrame(() => {
                                mainRef.current!.scrollTop = prevScroll;
                              });
                            }
                            (e.currentTarget as HTMLButtonElement).blur();
                          }}
                          disabled={usersLoadingMore}
                          className="px-4 py-2.5 bg-linear-to-r from-emerald-500 to-sky-500 text-zinc-950 rounded-lg text-sm font-semibold transition hover:from-emerald-400 hover:to-sky-400 disabled:opacity-50"
                        >
                          {usersLoadingMore ? 'Loading...' : 'Load more users'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : showGamesSkeleton ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <GameCardSkeleton key={index} />
                  ))}
                </div>
              ) : games.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <span className="text-4xl opacity-20">🎮</span>
                  <p className="text-sm text-zinc-500">
                    {hasQuery
                      ? `No games found for "${trimmedQuery}".`
                      : 'No games found.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map((g) => (
                    <article
                      key={g.id}
                      onClick={() => navigate(`/games/${g.id}`)}
                      className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50"
                    >
                      <div className="relative h-36 overflow-hidden bg-zinc-800 shrink-0">
                        {g.background_image ? (
                          <img
                            src={g.background_image}
                            alt={g.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-zinc-900 to-transparent" />
                      </div>

                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-sm font-bold text-white leading-snug tracking-tight truncate">
                            {g.name}
                          </h2>
                          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                            {Number.isFinite(g.rating)
                              ? g.rating.toFixed(1)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400">
                          {(g.genres || []).slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-0.5"
                            >
                              {genre}
                            </span>
                          ))}
                          {(g.genres || []).length === 0 && (
                            <span className="text-zinc-500">Genres TBD</span>
                          )}
                        </div>
                        <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
                          <span>{g.release_date || 'Release date TBD'}</span>
                          <span className="text-zinc-400">
                            {(g.platforms || []).slice(0, 2).join(' · ') ||
                              'Platforms TBD'}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Search;
