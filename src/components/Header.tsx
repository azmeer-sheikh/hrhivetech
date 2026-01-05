import { Globe, MapPin, Menu, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  setActiveTab?: (tab: string) => void;
}

export function Header({ onMenuClick, setActiveTab }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const usaTime = currentTime.toLocaleTimeString('en-US', { 
    timeZone: 'America/New_York',
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  });
  
  const usaDate = currentTime.toLocaleDateString('en-US', { 
    timeZone: 'America/New_York',
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const pakTime = currentTime.toLocaleTimeString('en-US', { 
    timeZone: 'Asia/Karachi',
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  });

  const handleSettingsClick = () => {
    if (setActiveTab) {
      setActiveTab('settings');
    }
    setDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      {/* Top Bar */}
      <div className="px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Menu + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            
          </div>

          {/* Right: Time Zones & User Dropdown */}
          <div className="flex items-center gap-3">
            {/* USA Time */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-blue-600 mb-0 uppercase tracking-wider">USA (EST)</p>
                <p className="text-sm font-mono text-gray-900 mb-0 mt-0.5 font-semibold">{usaTime}</p>
              </div>
            </div>
            
            {/* Pakistan Time */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-emerald-600 mb-0 uppercase tracking-wider">PAKISTAN (PKT)</p>
                <p className="text-sm font-mono text-gray-900 mb-0 mt-0.5 font-semibold">{pakTime}</p>
              </div>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-md transition-all duration-300"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white">
                    {user?.username ? user.username.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-dropdown">


                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Settings */}
                    <button
                      onClick={handleSettingsClick}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors duration-200 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors duration-200">
                        <Settings className="w-4 h-4 text-slate-600 group-hover:text-slate-900" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900 mb-0">Settings</p>
                      </div>
                    </button>

                    {/* Divider */}
                    <div className="my-2 border-t border-gray-100"></div>

                    {/* Logout */}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors duration-200">
                        <LogOut className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-red-600 group-hover:text-red-700 mb-0">Logout</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Date */}
      <div className="border-t border-gray-100 px-6 lg:px-8 py-3 bg-gray-50">
        <p className="text-sm text-gray-600 mb-0">
          <span className="font-semibold text-gray-900">Today:</span> {usaDate}
        </p>
      </div>

      <style>{`
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-dropdown {
          animation: dropdown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
