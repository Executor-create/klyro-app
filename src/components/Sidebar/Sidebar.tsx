import {
  FiHome,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiUser,
  FiMessageSquare,
  FiFolder,
  FiCalendar,
  FiAward,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import { LuGamepad2 } from 'react-icons/lu';
import SidebarItem from './SidebarItem';

const items = [
  { name: 'Home Feed', href: '#', icon: FiHome },
  { name: 'Browse Games', href: '#', icon: LuGamepad2 },
  { name: 'Recommendations', href: '#', icon: FiStar },
  { name: 'Trending', href: '#', icon: FiTrendingUp },
  { name: 'Community', href: '#', icon: FiUsers },
  { name: 'Friends', href: '#', icon: FiUser },
  { name: 'Messages', href: '#', icon: FiMessageSquare },
  { name: 'Collections', href: '#', icon: FiFolder },
  { name: 'Events', href: '#', icon: FiCalendar },
  { name: 'Leaderboards', href: '#', icon: FiAward },
];

const Sidebar = () => {
  return (
    <div className="w-68 h-[calc(100vh-76px)] bg-(--third-color) text-white p-4 flex flex-col border-r border-gray-700 overflow-y-auto scrollbar-hide">
      <ul>
        {items.map((item) => (
          <SidebarItem
            key={item.name}
            name={item.name}
            href={item.href}
            icon={item.icon}
          />
        ))}
      </ul>
      <div className="mt-auto border-t border-gray-600 pt-4">
        <ul>
          <SidebarItem
            key="settings"
            name="Settings"
            href="#"
            icon={FiSettings}
          />
          <SidebarItem key="logout" name="Logout" href="#" icon={FiLogOut} />
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
