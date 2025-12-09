import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users2,
  Building2,
  DollarSign,
  X,
  LogOut
} from 'lucide-react';
import authService from '../../services/authService';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Sessions', href: '/sessions', icon: Users2 },
  { name: 'Groups', href: '/groups', icon: Building2 },
  { name: 'Finances', href: '/finances', icon: DollarSign },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          w-64 h-screen bg-primary flex flex-col flex-shrink-0 fixed top-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo/Brand */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="PitchPro"
              className="w-12 h-12 rounded-lg mr-3"
            />
            <span className="text-white font-semibold text-lg">PitchPro</span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-warning text-white'
                        : 'text-white/80 hover:text-white hover:bg-primary-600'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary-400">
          <button
            onClick={handleLogout}
            className="flex items-center text-white/60 hover:text-white text-sm mb-2 transition-colors w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </button>
          <div className="text-white/60 text-xs">
            © 2025 PitchPro
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
