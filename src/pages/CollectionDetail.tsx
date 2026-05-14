import { useEffect, useState, type ComponentType } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiBookmark,
  FiClock,
  FiGrid,
  FiHeart,
  FiLock,
  FiStar,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { IoAdd, IoHeartOutline, IoShareSocialOutline } from 'react-icons/io5';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  getCollectionById,
  type Collection as ApiCollection,
} from '../api/collections';
import type { Game } from '../api/games';
import { AddGamesModal } from '../components/Collections/AddGamesModal';

type IconComponent = ComponentType<{ size?: number; className?: string }>;

// ── local helpers ────────────────────────────────────────────────────────────

type CollectionStats = {
  games?: string;
  followers?: string;
  visibility: string;
  theme: string;
};

type CollectionViewModel = {
  id: string;
  title: string;
  description: string;
  accent: string;
  icon: IconComponent;
  visibility: 'Public' | 'Private';
  stats: CollectionStats;
};

const iconMap: Record<string, IconComponent> = {
  Heart: FiHeart,
  Star: FiStar,
  Trophy: FiBookmark,
  Clock: FiClock,
  Grid: FiGrid,
  Sparkles: HiSparkles,
  Flame: FiZap,
  Zap: FiZap,
};

const colorAccentMap: Record<string, string> = {
  Rose: 'from-rose-500/90 to-rose-500/30',
  Blue: 'from-blue-500/90 to-blue-500/30',
  Purple: 'from-violet-500/90 to-violet-500/30',
  Emerald: 'from-emerald-500/90 to-emerald-500/30',
  Orange: 'from-orange-500/90 to-orange-500/30',
  Pink: 'from-pink-500/90 to-pink-500/30',
  Indigo: 'from-indigo-500/90 to-indigo-500/30',
  Yellow: 'from-amber-400/90 to-amber-500/30',
};

const toTitle = (
  value: string | null | undefined,
  fallback: string,
): string => {
  if (!value) {
    return fallback;
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const readCount = (...values: unknown[]): number | null => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

function renderStars(rating: number) {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }).map((_, index) =>
    index < rounded ? (
      <FiStar key={index} className="fill-current text-yellow-400" size={14} />
    ) : (
      <FiStar key={index} className="text-zinc-600" size={14} />
    ),
  );
}

const buildCollectionViewModel = (
  collection: ApiCollection,
): CollectionViewModel => {
  const iconKey = toTitle(collection.icon, 'Grid');
  const colorKey = toTitle(collection.color, 'Purple');
  const accent = colorAccentMap[colorKey] ?? colorAccentMap.Purple;

  const gamesCount = readCount(
    collection.games_count,
    collection.gamesCount,
    collection.total_games_count,
    collection.totalGamesCount,
    (collection as any)?.stats?.games_count,
    (collection as any)?.stats?.gamesCount,
  );

  const followersCount = readCount(
    collection.followers_count,
    collection.followersCount,
    collection.follower_count,
    collection.followerCount,
    (collection as any)?.stats?.followers_count,
    (collection as any)?.stats?.followersCount,
  );

  return {
    id: collection.id,
    title: collection.name,
    description: collection.description?.trim() || 'A curated shelf of games.',
    accent,
    icon: iconMap[iconKey] ?? FiGrid,
    visibility: collection.visibility === 'Private' ? 'Private' : 'Public',
    stats: {
      games: gamesCount !== null ? `${gamesCount} games` : undefined,
      followers:
        followersCount !== null ? `${followersCount} followers` : undefined,
      visibility: collection.visibility === 'Private' ? 'Private' : 'Public',
      theme: colorKey,
    },
  };
};

type GameCardProps = {
  game: Game;
  onOpen: () => void;
};

function GameCard({ game, onOpen }: GameCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group text-left transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02]"
    >
      <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#15151f] shadow-lg shadow-black/20 transition-all duration-200 group-hover:border-white/12 group-hover:shadow-violet-950/30">
        <div className="relative aspect-4/5 overflow-hidden">
          <img
            src={game.background_image}
            alt={game.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent transition-opacity duration-200 group-hover:opacity-90" />
        </div>

        <div className="space-y-2 px-3 py-3">
          <h3 className="truncate text-sm font-semibold text-white">
            {game.name}
          </h3>
          <div className="flex items-center gap-1">
            {renderStars(game.rating)}
          </div>
          <span className="inline-flex rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            {game.genres[0] || 'Game'}
          </span>
        </div>
      </div>
    </button>
  );
}

function GameListRow({ game, onOpen }: GameCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-4 rounded-3xl border border-white/8 bg-white/5 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/7 hover:shadow-lg hover:shadow-black/20"
    >
      <img
        src={game.background_image}
        alt={game.name}
        className="h-20 w-16 rounded-2xl object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-white">
          {game.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          {game.genres.join(' · ') || 'Featured game'}
        </p>
      </div>
      <div className="flex items-center gap-1">{renderStars(game.rating)}</div>
    </button>
  );
}

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<CollectionViewModel | null>(
    null,
  );
  const [collectionGames, setCollectionGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddGamesOpen, setIsAddGamesOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'Grid' | 'List'>('Grid');

  const refreshCollection = async () => {
    if (!id) return;
    const updatedCollection = await getCollectionById(id);
    setCollection(buildCollectionViewModel(updatedCollection));
    const updatedGames =
      (updatedCollection as any).collectionGames?.map((cg: any) => cg.game) ||
      [];
    setCollectionGames(updatedGames);
  };

  useEffect(() => {
    if (!id) {
      setError('Collection not found.');
      return;
    }
    setLoading(true);
    setError(null);
    getCollectionById(id)
      .then((item) => {
        setCollection(buildCollectionViewModel(item));
        const games =
          (item as any).collectionGames?.map((cg: any) => cg.game) || [];
        setCollectionGames(games);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load collection details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const gameCountText = `${collectionGames.length} ${collectionGames.length === 1 ? 'game' : 'games'}`;

  return (
    <div className="bg-zinc-950 min-h-screen">
      <Header />
      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />
        <main className="page-enter flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition"
          >
            ← Back to collections
          </button>
          {loading ? (
            <p className="text-white">Loading collection details…</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : !collection ? (
            <p className="text-zinc-300">No collection found.</p>
          ) : (
            <article className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg shadow-violet-950/50">
              {/* Hero Section - Icon and Title */}
              <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] mb-6">
                <div
                  className={`grid h-48 w-48 place-items-center rounded-2xl bg-linear-to-br ${collection.accent} shadow-lg shadow-black/30`}
                >
                  <collection.icon size={60} className="text-white" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    {collection.title}
                  </h1>
                  <p className="text-sm text-zinc-400">
                    {collection.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <span className="inline-flex items-center gap-2 text-sm text-zinc-300 border border-zinc-700 rounded-full px-3 py-1">
                      <FiGrid size={16} className="text-zinc-400" />
                      {gameCountText}
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm text-zinc-300 border border-zinc-700 rounded-full px-3 py-1">
                      {collection.visibility === 'Private' ? (
                        <FiLock size={16} className="text-zinc-400" />
                      ) : (
                        <FiUsers size={16} className="text-zinc-400" />
                      )}
                      {collection.visibility}
                    </span>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => setIsAddGamesOpen(true)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                    >
                      <IoAdd size={20} />
                      <span>Add Games</span>
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-zinc-600 hover:text-white">
                      <IoHeartOutline size={20} />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-zinc-600 hover:text-white">
                      <IoShareSocialOutline size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Games Section - Full Width */}
              <div className="border-t border-zinc-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-zinc-200">Games</h2>
                  {collectionGames.length > 0 && (
                    <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
                      <button
                        onClick={() => setViewMode('Grid')}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          viewMode === 'Grid'
                            ? 'bg-violet-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode('List')}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          viewMode === 'List'
                            ? 'bg-violet-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        List
                      </button>
                    </div>
                  )}
                </div>
                {collectionGames.length > 0 ? (
                  viewMode === 'Grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {collectionGames.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          onOpen={() => navigate(`/games/${game.id}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {collectionGames.map((game) => (
                        <GameListRow
                          key={game.id}
                          game={game}
                          onOpen={() => navigate(`/games/${game.id}`)}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center text-zinc-400 py-8">
                    No games added to this collection yet.
                  </div>
                )}
              </div>
            </article>
          )}
        </main>
      </div>

      {isAddGamesOpen && id && collection && (
        <AddGamesModal
          collectionId={id}
          collectionTitle={collection.title}
          onClose={() => setIsAddGamesOpen(false)}
          onGamesAdded={refreshCollection}
        />
      )}
    </div>
  );
};

export default CollectionDetail;
