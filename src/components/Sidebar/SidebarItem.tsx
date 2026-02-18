const SidebarItem = ({
  name,
  href,
  icon: Icon,
}: {
  name: string;
  href: string;
  icon: React.ComponentType<{ size: number }>;
}) => {
  return (
    <li className="mb-2">
      <a
        href={href}
        className="font-google text-sm font-bold hover:text-white hover:bg-(--primary-color) hover:rounded-md flex items-center gap-2 p-2 transition-all duration-200"
      >
        <Icon size={20} />
        {name}
      </a>
    </li>
  );
};

export default SidebarItem;
