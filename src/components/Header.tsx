import { LuGamepad2 } from 'react-icons/lu';
import { FiSearch } from 'react-icons/fi';
import { FaRegBell } from 'react-icons/fa';
import { FiHome } from 'react-icons/fi';
import { MdAccountCircle } from 'react-icons/md';
import Input from './ui/Input';
import { useForm } from 'react-hook-form';

const Header = () => {
  const {
    register,
    formState: { errors },
  } = useForm<Record<string, unknown>>();

  return (
    <header className="flex flex-row justify-between items-center text-white p-4 pl-7 pr-7 bg-(--third-color) bg-opacity-95 border-b border-gray-700 backdrop-blur-sm">
      <div className="flex flex-row items-center gap-3">
        <a href="/" className="flex items-center gap-3">
          <LuGamepad2
            size={50}
            className={`text-white rounded-2xl p-3`}
            style={{
              background:
                'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))',
            }}
          />
          <h1
            className="text-3xl font-google font-bold font"
            style={{
              background:
                'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Klyro
          </h1>
        </a>
      </div>
      <div className="flex items-center relative">
        <Input
          className="w-125 pl-10 pr-4 py-2 text-white rounded-lg bg-(--third-color) border border-gray-500"
          type="text"
          placeholder="Search games, users..."
          name="search"
          register={register}
          errors={errors}
        />
        <FiSearch size={20} className="absolute left-3 text-gray-400" />
      </div>
      <div className="flex items-center gap-6">
        <a href="/">
          <FiHome
            size={38}
            className="cursor-pointer hover:bg-(--primary-color) icon-glow p-2 rounded-xl bg-(--third-color) transition-colors duration-300"
          />
        </a>
        <a href="/">
          <LuGamepad2
            size={38}
            className="cursor-pointer hover:bg-(--primary-color) icon-glow p-2 rounded-xl bg-(--third-color) transition-colors duration-300"
          />
        </a>
        <a href="/">
          <FiHome
            size={38}
            className="cursor-pointer hover:bg-(--primary-color) icon-glow p-2 rounded-xl bg-(--third-color) transition-colors duration-300"
          />
        </a>
        <a href="/">
          <FaRegBell
            size={38}
            className="cursor-pointer hover:bg-(--primary-color) icon-glow p-2 rounded-xl bg-(--third-color) transition-colors duration-300"
          />
        </a>
        <a href="/profile">
          <MdAccountCircle
            size={44}
            className="cursor-pointer hover:bg-(--primary-color) icon-glow p-2 rounded-xl bg-(--third-color) transition-colors duration-300"
          />
        </a>
      </div>
    </header>
  );
};

export default Header;
