import React, { useState } from 'react';
import { Search, ChevronDown, Menu } from 'lucide-react';
import { useOrganization } from '../../contexts/OrganizationContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const {
    selectedOrgId,
    setSelectedOrgId,
    availableOrganizations,
    currentOrganization,
    loading
  } = useOrganization();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const displayName = currentOrganization?.name || 'Select Organization';

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between flex-shrink-0">
      {/* Left side - Menu button (mobile) + Organization Selector */}
      <div className="flex items-center space-x-3 lg:space-x-4 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors max-w-[180px] sm:max-w-none"
            disabled={loading}
          >
            <span className="font-medium text-gray-900 truncate text-sm sm:text-base">
              {loading ? 'Loading...' : displayName}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </button>

          {isDropdownOpen && availableOrganizations.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {availableOrganizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setSelectedOrgId(org.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    org.id === selectedOrgId ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  {org.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Organization name - hidden on small screens since it's in dropdown */}
        <div className="hidden md:block text-xl lg:text-2xl font-bold text-gray-900 truncate">
          {displayName}
        </div>
      </div>

      {/* Right side - Search and Notifications */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search Bar - hidden on mobile, icon only on tablet */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-40 md:w-56 lg:w-80 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        {/* Mobile search button */}
        <button className="sm:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">A</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
