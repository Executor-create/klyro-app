import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import Feed from '../components/Feed/Feed';

const Home = () => {
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
