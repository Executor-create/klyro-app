import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import Feed from '../components/Feed/Feed';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-(--fourth-color)">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-(--fourth-color)">
        <p className="text-gray-400 text-lg">
          Please log in to view your feed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-(--fourth-color) h-screen overflow-hidden">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 h-[calc(100vh-76px)] overflow-y-auto">
          <Feed />
        </div>
      </div>
    </div>
  );
};

export default Home;
