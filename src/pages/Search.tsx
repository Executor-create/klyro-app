import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { FiSearch, FiUsers } from 'react-icons/fi';
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
  const navigate = useNavigate();

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

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto flex flex-col px-8 pt-8 pb-6 gap-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800"
        >
          {/* heading */}
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <FiSearch className="text-violet-300" size={14} />
              <span>Discover</span>
            </div>
            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Find your gaming community
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              Search for gamers to follow and games to play. Build your network
              and discover new titles.
            </p>
          </div>

          {/* search section */}
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users, games, or genres..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
              />
            </div>

            {/* tabs */}
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition border ${
                  activeTab === 'users'
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <FiUsers size={15} />
                <span>Users</span>
                <span className="text-xs text-zinc-500">({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('games')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition border ${
                  activeTab === 'games'
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <LuGamepad2 size={15} />
                <span>Games</span>
                <span className="text-xs text-zinc-500">({games.length})</span>
              </button>
            </div>
          </div>

          {/* content */}
          <div className="flex-1">
            {activeTab === 'users' ? (
              usersLoading && users.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <span className="text-4xl opacity-20">👥</span>
                  <p className="text-sm text-zinc-500">Searching users…</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <span className="text-4xl opacity-20">👥</span>
                  <p className="text-sm text-zinc-500">No users found.</p>
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
                        className="px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium transition hover:bg-violet-700 disabled:opacity-50"
                      >
                        {usersLoadingMore ? 'Loading...' : 'Load more users'}
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : gamesLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <span className="text-4xl opacity-20">🎮</span>
                <p className="text-sm text-zinc-500">Searching games…</p>
              </div>
            ) : games.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <span className="text-4xl opacity-20">🎮</span>
                <p className="text-sm text-zinc-500">No games found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((g) => (
                  <article
                    key={g.id}
                    onClick={() => navigate(`/games/${g.id}`)}
                    className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50"
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
                      <h2 className="text-sm font-bold text-white leading-snug tracking-tight truncate">
                        {g.name}
                      </h2>
                      <div className="text-sm text-zinc-500">
                        {g.release_date}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Search;
