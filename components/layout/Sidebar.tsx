
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Microscope, FlaskConical, Target, Bot } from 'lucide-react';
import Icon from '../common/Icon';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/lab', label: 'Design Lab', icon: FlaskConical },
  { path: '/observatory', label: 'Observatory', icon: Microscope },
  { path: '/evaluation', label: 'Evaluation', icon: Target },
  { path: '/collaboration', label: 'AI Workshop', icon: Bot },
];

const Sidebar: React.FC = () => {
  const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-brand-dark-accent hover:text-white transition-colors duration-200 rounded-lg";
  const activeLinkClasses = "bg-brand-primary text-white";

  return (
    <div className="w-64 bg-brand-dark text-white flex flex-col p-4">
      <div className="flex items-center mb-8 px-2">
        <MessageSquare className="w-8 h-8 text-brand-secondary" />
        <h1 className="text-2xl font-bold ml-2">EduPlanner</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <Icon icon={item.icon} className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-4">
        <ThemeToggle />
        <div className="px-2 text-center text-xs text-gray-500">
          <p>Version 1.0</p>
          <p>Teacher in the Loop Interface</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;