import { FiUserPlus, FiX } from 'react-icons/fi';
import type { NormalizedUser } from '../../api/users';

type ProfileConnectionsModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  users: NormalizedUser[];
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onToggleFollow?: (user: NormalizedUser) => void;
  pendingFollowIds?: Record<string, boolean>;
  currentUserId?: string | null;
};

const ProfileConnectionsModal = ({
  open,
  title,
  subtitle,
  users,
  isLoading = false,
  error = null,
  onClose,
  onToggleFollow,
  pendingFollowIds,
  currentUserId,
}: ProfileConnectionsModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close connections dialog"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 text-zinc-900 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 transition hover:bg-zinc-100"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-zinc-500">No users found.</p>
          ) : (
            users.map((user) => {
              const handle = user.tag || '';
              const followers = user.followers ?? 0;
              const isFollowing = !!user.isFollowing;
              const isSelf = currentUserId && user.id === currentUserId;
              const isPending = !!pendingFollowIds?.[user.id];

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-200 text-zinc-700 flex items-center justify-center font-semibold">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{user.username?.trim()?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-zinc-900">
                        {user.username}
                      </div>
                      {handle && (
                        <div className="text-sm text-zinc-500">{handle}</div>
                      )}
                      <div className="text-xs text-zinc-500 mt-1">
                        {followers.toLocaleString()} followers
                      </div>
                    </div>
                  </div>

                  {onToggleFollow && !isSelf && (
                    <button
                      type="button"
                      onClick={() => onToggleFollow(user)}
                      disabled={isPending}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                        isFollowing
                          ? 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          : 'bg-linear-to-r from-violet-500 to-pink-500 text-white'
                      } ${isPending ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <FiUserPlus />
                      {isPending
                        ? 'Updating...'
                        : isFollowing
                          ? 'Unfollow'
                          : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileConnectionsModal;
