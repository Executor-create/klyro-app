import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import FeedItem from '../components/Feed/FeedItem';
import {
  createPostComment,
  getPostById,
  getPostComments,
  type Post,
  type PostComment,
} from '../api/posts';
import { useAuth } from '../contexts/AuthContext';

const formatRelativeTime = (value?: string) => {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const loadComments = useCallback(async (postId: string) => {
    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const data = await getPostComments(postId);
      setComments(data ?? []);
    } catch (error) {
      console.error('Failed to load comments', error);
      setComments([]);
      setCommentsError('Unable to load comments.');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    getPostById(id)
      .then((data) => setPost(data))
      .catch((error) => {
        console.error('Failed to load post', error);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadComments(id);
  }, [id, loadComments]);

  const userName =
    post?.user?.profile?.display_name ??
    post?.user?.username ??
    post?.author?.username ??
    'Gamer';
  const avatar =
    post?.user?.profile?.avatar_url ??
    post?.user?.avatar ??
    post?.author?.avatar;
  const timestamp = formatRelativeTime(
    post?.created_at ?? post?.createdAt ?? post?.updated_at ?? post?.updatedAt,
  );

  const userInitial = user?.username?.trim()?.[0]?.toUpperCase() ?? 'U';

  const commentCount = comments.length || post?.comments || 0;

  const handleSubmitComment = async () => {
    if (!id || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentsError(null);

    try {
      const created = await createPostComment(id, commentText.trim());
      setCommentText('');
      setComments((prev) => [created, ...prev]);
    } catch (error) {
      console.error('Failed to create comment', error);
      setCommentsError('Unable to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen">
      <Header />
      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />
        <main className="page-enter flex-1 overflow-y-auto p-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            ← Back
          </button>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
              <span className="text-4xl opacity-30">⏳</span>
              <p className="text-sm">Loading post...</p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
              <span className="text-4xl opacity-30">⚠️</span>
              <p className="text-sm">Could not load post.</p>
            </div>
          ) : !post ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
              <span className="text-4xl opacity-30">🕹️</span>
              <p className="text-sm">Post not found.</p>
            </div>
          ) : (
            <>
              <FeedItem
                postId={post.id}
                userId={user?.id}
                linkToPost={false}
                className="max-w-4xl"
                user={userName}
                avatar={avatar}
                content={post.content}
                image={post.image}
                timestamp={timestamp}
                likes={post.likes ?? 0}
                isLiked={post.isLiked ?? false}
                comments={commentCount}
                onCommentClick={() => {
                  commentInputRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                  commentInputRef.current?.focus();
                }}
                taggedGames={post.taggedGames}
              />
              <section className="mt-8 w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="text-lg font-semibold text-white">
                  Comments ({commentCount})
                </h3>
                <div className="mt-4 flex flex-wrap items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-700 text-white flex items-center justify-center font-semibold shrink-0">
                    {userInitial}
                  </div>
                  <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 min-h-13 resize-none rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/10"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiSend size={16} />
                    {isSubmittingComment ? 'Commenting...' : 'Comment'}
                  </button>
                </div>
                <div className="mt-6 space-y-4 border-t border-zinc-800 pt-6">
                  {commentsLoading ? (
                    <p className="text-sm text-zinc-500">Loading comments...</p>
                  ) : commentsError ? (
                    <p className="text-sm text-red-400">{commentsError}</p>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No comments yet. Be the first to share your thoughts.
                    </p>
                  ) : (
                    comments.map((comment) => {
                      const commentUser =
                        comment.user?.profile?.display_name ??
                        comment.user?.username ??
                        comment.author?.username ??
                        'User';
                      const commentAvatar =
                        comment.user?.profile?.avatar_url ??
                        comment.user?.avatar ??
                        comment.author?.avatar;
                      const commentTimestamp = formatRelativeTime(
                        comment.created_at ?? comment.createdAt,
                      );
                      const commentInitial =
                        commentUser.trim()?.[0]?.toUpperCase() ?? 'U';

                      return (
                        <div
                          key={
                            comment.id ?? `${commentUser}-${commentTimestamp}`
                          }
                          className="flex items-start gap-3"
                        >
                          {commentAvatar ? (
                            <img
                              src={commentAvatar}
                              alt={commentUser}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-zinc-700 text-white flex items-center justify-center font-semibold shrink-0">
                              {commentInitial}
                            </div>
                          )}
                          <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <span className="text-white font-semibold">
                                {commentUser}
                              </span>
                              <span>{commentTimestamp}</span>
                            </div>
                            <p className="mt-2 text-sm text-zinc-200">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default PostDetail;
