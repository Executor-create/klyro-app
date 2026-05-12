import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  getRecommendations,
  type RecommendedGame,
} from '../api/recommendations';
import { renderStars } from '../utils/renderStars';

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="h-40 bg-zinc-800 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-zinc-800 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-zinc-800 rounded-full w-2/5 animate-pulse" />
        <div className="h-3 bg-zinc-800 rounded-full w-1/2 animate-pulse mt-3" />
      </div>
    </div>
  );
}

const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendedGame[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getRecommendations(12);
        setRecommendations(data.data);
        setPersonalized(data.personalized);
      } catch (err) {
        setError('Unable to load recommendations.');
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto flex flex-col px-8 pt-8 pb-6 gap-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          {/* heading */}
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <FiStar className="text-violet-300" size={14} />
              <span>AI Recommendations</span>
            </div>
            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {personalized ? 'Recommended for You' : 'Popular This Week'}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              {personalized
                ? 'Personalized game suggestions based on your gaming preferences and activity'
                : 'Discover popular games based on community ratings and activity'}
            </p>
          </div>

          {/* info box */}
          <div className="max-w-2xl border border-white/10 bg-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-violet-400 mt-0.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="10" cy="10" r="9" />
                  <path d="M10 6v4m0 4h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  How recommendations work
                </h3>
                <p className="text-sm text-zinc-400 leading-6">
                  Our AI analyzes your favorite games, play history, reviews,
                  and the preferences of users with similar tastes to suggest
                  games you'll love. The confidence score shows how well each
                  game matches your profile.
                </p>
              </div>
            </div>
          </div>

          {/* recommendations grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <span className="text-4xl opacity-20">⚠</span>
              <p className="text-sm text-zinc-500">{error}</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <span className="text-4xl opacity-20">🎮</span>
              <p className="text-sm text-zinc-500">No recommendations yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((game) => (
                <article
                  key={game.id}
                  onClick={() => navigate(`/games/${game.id}`)}
                  className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/60 transition-all duration-200 cursor-pointer"
                >
                  {/* Confidence badge */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                    <span>📈</span>
                    <span>{Math.round(game.score * 100)}%</span>
                  </div>

                  <div className="relative h-40 overflow-hidden bg-zinc-800 shrink-0">
                    {game.background_image ? (
                      <img
                        src={game.background_image}
                        alt={game.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-zinc-900 to-transparent" />
                  </div>

                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug tracking-tight truncate">
                      {game.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {game.release_date}
                    </p>
                    <div className="flex items-center gap-1 mt-auto pt-2 border-t border-zinc-800">
                      {renderStars(game.rating ?? 0)}
                      <span className="text-xs font-semibold text-white ml-1 font-mono">
                        {(game.rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Recommendations;
