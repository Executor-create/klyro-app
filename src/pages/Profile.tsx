import { useMemo, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileTabs from '../components/Profile/ProfileTabs';
import ProfileReviewCard from '../components/Profile/ProfileReviewCard';
import { useProfileUser } from '../hooks/useProfileUser';
import { useProfileReviews } from '../hooks/useProfileReviews';

export const Profile = () => {
  const [selectedTab, setSelectedTab] = useState('Favorite Games');

  const {
    selectedUser,
    selectedUserLoading,
    selectedUserError,
    isExternalProfile,
    externalIsFollowing,
    followActionPending,
    toggleExternalFollow,
  } = useProfileUser();

  const { userReviews, reviewsLoading, reviewsError } = useProfileReviews(
    selectedTab,
    isExternalProfile,
  );

  const profileHeaderData = useMemo(() => {
    if (!isExternalProfile || !selectedUser) return undefined;

    return {
      displayName: selectedUser.username,
      handle: selectedUser.tag,
      bio: selectedUser.bio,
      avatarUrl: selectedUser.avatar,
      joinedAt: selectedUser.joinedAt,
      createdAt: selectedUser.createdAt,
      gamesPlayed: selectedUser.games_count,
      followers: selectedUser.followers,
      following: selectedUser.following,
    };
  }, [isExternalProfile, selectedUser]);

  const sampleGames = [
    {
      id: 1,
      title: 'Cyber Drift',
      img: 'https://images.unsplash.com/photo-1542751371-2d3a6a9b4a6d?auto=format&fit=crop&w=800&q=60',
    },
    {
      id: 2,
      title: 'Neon Racer',
      img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=60',
    },
    {
      id: 3,
      title: 'Arena Legends',
      img: 'https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?auto=format&fit=crop&w=800&q=60',
    },
  ];

  return (
    <div className="bg-(--fourth-color) h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto flex flex-col px-8 pt-8 pb-6 gap-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <ProfileHeader
            profileData={profileHeaderData}
            loading={isExternalProfile ? selectedUserLoading : false}
            error={isExternalProfile ? selectedUserError : null}
            showEditButton={!isExternalProfile}
            isFollowing={externalIsFollowing}
            onToggleFollow={
              isExternalProfile ? toggleExternalFollow : undefined
            }
            followActionPending={
              isExternalProfile ? followActionPending : false
            }
          />
          <ProfileTabs activeTab={selectedTab} onTabChange={setSelectedTab} />

          {selectedTab === 'Favorite Games' && (
            <div className="mx-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Favorite Games
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleGames.map((g) => (
                  <div
                    key={g.id}
                    className="bg-(--third-color) rounded-xl overflow-hidden border border-gray-700"
                  >
                    <img
                      src={g.img}
                      alt={g.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="text-white font-semibold">{g.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Short description of the game.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'Reviews' && (
            <div className="mx-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                My Reviews
              </h3>
              {reviewsLoading && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading reviews...</p>
                </div>
              )}
              {reviewsError && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-300 text-center">
                  {reviewsError}
                </div>
              )}
              {!reviewsLoading && !reviewsError && userReviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    You haven't written any reviews yet.
                  </p>
                </div>
              )}
              {!reviewsLoading && userReviews.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {userReviews.map((review) => (
                    <ProfileReviewCard
                      key={review.id}
                      gameTitle={review.gameName || 'Unknown Game'}
                      gameImage={review.gameImage}
                      rating={review.rating}
                      reviewText={review.review || ''}
                      date={review.date}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
