import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import { likePost, unlikePost } from '../../api/posts';
import { motion } from 'framer-motion';

interface FeedItemProps {
  postId?: string;
  userId?: string;
  linkToPost?: boolean;
  className?: string;
  user: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes?: number;
  isLiked?: boolean;
  comments?: number;
  onCommentClick?: () => void;
  taggedGames?: Array<{
    game: {
      id: string;
      name: string;
      background_image?: string | null;
    };
  }>;
}

const FeedItem = ({
  postId,
  userId,
  linkToPost = true,
  user,
  avatar,
  content,
  timestamp,
  likes = 0,
  isLiked = false,
  comments = 0,
  onCommentClick,
  taggedGames,
}: FeedItemProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLikePending, setIsLikePending] = useState(false);

  // Sync liked/likeCount when props update (e.g. after async data load)
  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLikeCount(likes);
  }, [likes]);

  const userInitial = user?.trim()?.[0]?.toUpperCase() ?? 'U';

  const handleLike = async () => {
    if (!postId || isLikePending) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));
    setIsLikePending(true);

    try {
      if (nextLiked) {
        await likePost(postId, userId ?? '');
      } else {
        await unlikePost(postId, userId ?? '');
      }
    } catch (error) {
      console.error('Failed to update like', error);
      setLiked(!nextLiked);
      setLikeCount((prev) => prev + (nextLiked ? -1 : 1));
    } finally {
      setIsLikePending(false);
    }
  };

  const contentNode =
    postId && linkToPost ? (
      <Link
        to={`/posts/${postId}`}
        className="block text-white mb-4 hover:text-gray-100 transition-colors"
      >
        {content}
      </Link>
    ) : (
      <p className="text-white mb-4">{content}</p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full"
    >
      <div className="flex items-center gap-3 mb-3">
        {avatar ? (
          <motion.img
            src={avatar}
            alt={user}
            className="w-10 h-10 rounded-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        ) : (
          <motion.div
            className="h-10 w-10 rounded-full bg-zinc-700 text-white flex items-center justify-center font-semibold shrink-0"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {userInitial}
          </motion.div>
        )}
        <div>
          <button
            type="button"
            onClick={() => {
              if (userId) navigate(`/profile/${userId}`);
            }}
            className="text-white font-semibold text-left hover:underline"
          >
            {user}
          </button>
          <p className="text-zinc-400 text-sm">{timestamp}</p>
        </div>
      </div>
      {contentNode}
      {taggedGames && taggedGames.length > 0 && (
        <div className="mb-4 space-y-3">
          {taggedGames.map(({ game }) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-800 p-4 transition-colors hover:border-zinc-700"
            >
              <img
                src={game.background_image || 'https://via.placeholder.com/64'}
                alt={game.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{game.name}</p>
                <p className="text-sm text-zinc-400">View game details -&gt;</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-zinc-400 border-t border-zinc-800 pt-4">
        <motion.button
          onClick={handleLike}
          disabled={!postId || isLikePending}
          whileTap={postId && !isLikePending ? { scale: 1.3 } : {}}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className={`flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
            liked ? 'text-red-500' : 'hover:text-red-500'
          } ${isLikePending ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <motion.span
            animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FiHeart size={20} className={liked ? 'fill-red-500' : ''} />
          </motion.span>
          <span>{likeCount}</span>
        </motion.button>
        <motion.button
          onClick={() => {
            if (onCommentClick) {
              onCommentClick();
            } else if (postId && linkToPost) {
              navigate(`/posts/${postId}`);
            }
          }}
          disabled={!postId && !onCommentClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200 cursor-pointer disabled:cursor-default"
        >
          <FiMessageCircle size={20} />
          <span>{comments}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FeedItem;
