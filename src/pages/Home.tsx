import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiArrowRight, FiFeather } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import Feed from '../components/Feed/Feed';
import {
  getRecommendations,
  type RecommendedGame,
} from '../api/recommendations';
import { renderStars } from '../utils/renderStars';

const Home = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendedGame[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const data = await getRecommendations(6);
        setRecommendations(data.data);
        setPersonalized(data.personalized);
      } catch (err) {
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
              <FiFeather className="text-violet-300" size={14} />
              <span>Feed</span>
            </div>
            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Stay updated with your community
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              Follow your favorite gamers, read reviews, and discover what's
              trending in your gaming community.
            </p>
          </div>

          {/* content */}
          <div className="flex gap-6">
            {/* Feed - left column */}
            <div className="flex-1 max-w-4xl">
              <Feed />
            </div>

            {/* Recommendations widget - right column */}
            <div className="w-80 flex flex-col gap-4 h-fit">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FiStar className="text-violet-400" size={16} />
                    <h3 className="text-white font-semibold text-sm">
                      AI Recommendations
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {personalized ? 'For you' : 'Popular picks'}
                  </p>
                </div>

                {loading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-zinc-800 h-24 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="p-4 space-y-3">
                    {recommendations.map((game) => (
                      <div
                        key={game.id}
                        onClick={() => navigate(`/games/${game.id}`)}
                        className="group cursor-pointer"
                      >
                        <div className="relative h-20 overflow-hidden bg-zinc-800 rounded-lg mb-2">
                          <img
                            src={
                              game.background_image ||
                              'https://via.placeholder.com/300x200'
                            }
                            alt={game.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            <span>📈</span>
                            <span>{Math.round(game.score * 100)}%</span>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-white truncate group-hover:text-violet-400 transition">
                          {game.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(game.rating)}
                          <span className="text-[10px] text-zinc-400 ml-1">
                            {game.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="p-4 border-t border-zinc-800">
                  <button
                    onClick={() => navigate('/recommendations')}
                    className="w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    View All
                    <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
