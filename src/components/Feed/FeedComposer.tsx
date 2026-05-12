import { useState } from 'react';
import { FiImage, FiTag, FiX } from 'react-icons/fi';
import type { Game } from '../../api/games';
import { createPost, type CreatePostPayload } from '../../api/posts';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import TagGameModal from './TagGameModal';

type FeedComposerProps = {
  onPostCreated?: () => void | Promise<void>;
};

const FeedComposer = ({ onPostCreated }: FeedComposerProps) => {
  const { user } = useAuth();
  const userInitial = user?.username?.trim()?.[0]?.toUpperCase() ?? 'U';

  const [isTagGameOpen, setIsTagGameOpen] = useState(false);
  const [taggedGame, setTaggedGame] = useState<Game | null>(null);
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSelectGame = (game: Game) => {
    setTaggedGame(game);
    setIsTagGameOpen(false);
  };

  const handlePost = async () => {
    if (!postText.trim() || isPosting) return;

    const payload: CreatePostPayload = {
      content: postText.trim(),
    };

    if (taggedGame) {
      payload.taggedGameIds = [taggedGame.id];
    }

    setIsPosting(true);

    try {
      await createPost(payload);
      await onPostCreated?.();
      setPostText('');
      setTaggedGame(null);
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setIsPosting(false);
    }
  };

  const canPost = postText.trim().length > 0;

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-zinc-700 text-white flex items-center justify-center font-semibold shrink-0">
            {userInitial}
          </div>
          <div className="flex-1">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full min-h-[110px] resize-none rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/10"
              placeholder="What's on your mind? Share your gaming thoughts..."
            />
            {taggedGame && (
              <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                <span className="flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1">
                  <FiTag size={12} />
                  <span className="text-zinc-200">{taggedGame.name}</span>
                  <button
                    type="button"
                    onClick={() => setTaggedGame(null)}
                    className="text-zinc-400 hover:text-white"
                    aria-label="Remove tagged game"
                  >
                    <FiX size={12} />
                  </button>
                </span>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4">
              <button
                type="button"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <FiImage size={18} />
                <span>Image</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTagGameOpen(true)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <FiTag size={18} />
                <span>Tag Game</span>
              </button>
              <div className="ml-auto">
                <Button
                  type="button"
                  onClick={handlePost}
                  disabled={!canPost || isPosting}
                  className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TagGameModal
        open={isTagGameOpen}
        onClose={() => setIsTagGameOpen(false)}
        onSelect={handleSelectGame}
        selectedGameId={taggedGame?.id}
      />
    </>
  );
};

export default FeedComposer;
