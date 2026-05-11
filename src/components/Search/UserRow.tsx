import { FiUserPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import type { NormalizedUser } from '../../api/users';

type UserRowProps = {
  user: NormalizedUser;
  isFollowed: boolean;
  isPending: boolean;
  onFollow: (id: string) => void;
};

function initials(name: string): string {
  return (
    name
      .split(' ')
      .map((n) => n[0] || '')
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );
}

export function UserRow({
  user,
  isFollowed,
  isPending,
  onFollow,
}: UserRowProps) {
  const navigate = useNavigate();

  return (
    <li className="bg-(--third-color) rounded-2xl border border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center text-white text-lg font-bold">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials(user.username || 'U')}</span>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() =>
              navigate(`/profile/${user.id}`, {
                state: { user: { ...user, isFollowing: isFollowed } },
              })
            }
            className="text-white font-bold text-lg text-left hover:underline cursor-pointer"
          >
            {user.username}
          </button>
          <div className="text-sm text-zinc-400">{user.tag}</div>
          {user.bio && (
            <div className="text-sm text-zinc-400 mt-1">{user.bio}</div>
          )}
          <div className="text-sm text-zinc-500 mt-2">
            {(user.followers || 0).toLocaleString()} followers &bull;{' '}
            {(user.following || 0).toLocaleString()} following
          </div>
        </div>
      </div>

      <button
        onClick={() => onFollow(user.id)}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition whitespace-nowrap ${
          isFollowed
            ? 'bg-zinc-800 text-white border border-zinc-700'
            : 'bg-linear-to-r from-violet-500 to-pink-500 text-white'
        } ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <FiUserPlus />
        {isPending ? 'Updating...' : isFollowed ? 'Unfollow' : 'Follow'}
      </button>
    </li>
  );
}
