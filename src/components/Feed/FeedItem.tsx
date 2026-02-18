import { Card, CardContent } from '../ui/Card';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';

interface FeedItemProps {
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes?: number;
  comments?: number;
}

const FeedItem = ({
  user,
  avatar,
  content,
  timestamp,
  likes = 0,
  comments = 0,
}: FeedItemProps) => {
  return (
    <Card className="bg-(--third-color) border-gray-700 max-w-3xl">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-3">
          <img src={avatar} alt={user} className="w-10 h-10 rounded-full" />
          <div>
            <h3 className="text-white font-semibold">{user}</h3>
            <p className="text-gray-400 text-sm">{timestamp}</p>
          </div>
        </div>
        <p className="text-white mb-10">{content}</p>
        <div className="flex items-center gap-4 text-gray-400 border-t border-gray-800 pt-6">
          <button className="flex items-center gap-2 hover:text-red-500 transition-colors duration-200 cursor-pointer">
            <FiHeart size={20} />
            <span>{likes}</span>
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
