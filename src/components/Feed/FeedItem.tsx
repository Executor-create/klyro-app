import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';

interface FeedItemProps {
  postId?: string;
  linkToPost?: boolean;
  className?: string;
  user: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes?: number;
  comments?: number;
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
  linkToPost = true,
  className,
  user,
  avatar,
  content,
  timestamp,
  likes = 0,
  comments = 0,
  taggedGames,
}: FeedItemProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const userInitial = user?.trim()?.[0]?.toUpperCase() ?? 'U';

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
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

  const cardClassName = `bg-(--third-color) border-gray-700 w-full ${
    className ?? 'max-w-3xl'
  }`;

  return (
    <Card className={cardClassName}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          {avatar ? (
            <img
              src={avatar}
              alt={user}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-700 text-white flex items-center justify-center font-semibold shrink-0">
              {userInitial}
            </div>
          )}
          <div>
            <h3 className="text-white font-semibold">{user}</h3>
            <p className="text-gray-400 text-sm">{timestamp}</p>
          </div>
        </div>
        {contentNode}
        {taggedGames && taggedGames.length > 0 && (
          <div className="mb-4 space-y-3">
            {taggedGames.map(({ game }) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="flex items-center gap-4 rounded-xl border border-gray-700 bg-(--fourth-color) p-4 transition-colors hover:border-gray-500"
              >
                <img
                  src={
                    game.background_image || 'https://via.placeholder.com/64'
                  }
                  alt={game.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">
                    {game.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    View game details -&gt;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 text-gray-400 border-t border-gray-800 pt-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
              liked ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            <FiHeart size={20} className={liked ? 'fill-red-500' : ''} />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200 cursor-pointer">
            <FiMessageCircle size={20} />
            <span>{comments}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedItem;
