import {
  LayoutDashboard,
  Users,
  Calendar,
  UserPlus,
  BarChart3,
  Menu,
  X,
  ClipboardList,
  Palmtree,
  FileText,
  Bell,
  Settings,
  CalendarDays,
  LogOut,
  Shield,
  ChevronRight,
  ChevronDown,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';
import logoImage from 'figma:asset/c925f6086a012a655204c0b0c72411a7f42246f3.png';
import { useAuth } from './AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSection(prev => prev === sectionTitle ? null : sectionTitle);
  };

  const menuSections = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'daily-attendance', label: 'Daily Attendance', icon: ClipboardList },
      ]
    },
    {
      title: 'EMPLOYEE MANAGEMENT',
      items: [
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'attendance', label: 'Attendance Records', icon: Calendar },
        { id: 'leaves', label: 'Leave Management', icon: Palmtree },
        { id: 'documents', label: 'Documents', icon: FileText },
      ]
    },
    {
      title: 'RECRUITMENT',
      items: [
        { id: 'interviews', label: 'Interviews', icon: UserPlus },
      ]
    },
    {
      title: 'ORGANIZATION',
      items: [
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'holidays', label: 'Holidays', icon: CalendarDays },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'labor-cost', label: 'Labor Cost Dashboard', icon: DollarSign },
      ]
    }
  ];

  if (user?.role === 'Super Admin') {
    menuSections.push({
      title: 'ADMINISTRATION',
      items: [
        { id: 'user-management', label: 'User Management', icon: Shield },
      ]
    });
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl border border-slate-700/50 hover:from-slate-800 hover:to-slate-700 transition-all duration-300 backdrop-blur-xl"
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Position */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-all duration-300 ease-out flex flex-col shadow-2xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Background with Advanced Styling */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
       
        {/* Animated Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Border Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"></div>
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"></div>

        {/* Content Container */}
        <div className="relative h-full flex flex-col">
          {/* Logo Section */}
          <div className="relative px-6 py-7 border-b border-white/5 backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-blue-500/30 rounded-tl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-purple-500/30 rounded-br-2xl"></div>
           
            <div className="relative">
              <div className="group mb-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="flex items-center justify-center">
                  <img
                    src={logoImage}
                    alt="Hive Tech Solutions"
                    className="h-14 w-auto object-contain transition-transform duration-500"
                  />
                </div>
              </div>
             
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
                </div>
                <h3 className="text-sm font-bold text-white mb-1 tracking-[0.2em] uppercase bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
                  Hive Tech
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mb-0">HR Management Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {menuSections.map((section, sectionIdx) => {
                const isExpanded = expandedSection === section.title;
               
                return (
                  <div key={sectionIdx} className="mb-6">
                    {/* Section Header - Only toggles collapse, does NOT close sidebar */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full group"
                    >
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                        <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full group-hover:h-6 transition-all"></div>
                       
                        <h3 className="flex-1 text-[12px] font-bold text-slate-400 tracking-[0.15em] uppercase text-left group-hover:text-slate-200 transition-colors">
                          {section.title}
                        </h3>
                       
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-all duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                   
                    {/* Menu Items - Collapsible */}
                    <div className={`mt-2 space-y-1 overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                       
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              // Only close mobile sidebar when selecting an actual menu item
                              if (window.innerWidth < 1024) {
                                setIsOpen(false);
                              }
                            }}
                            className={`relative w-full group ${
                              isActive ? 'active-menu-item' : ''
                            }`}
                          >
                            <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}>
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-white rounded-r-full shadow-lg shadow-white/50"></div>
                              )}
                             
                              {!isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/5 group-hover:to-transparent transition-all duration-500 rounded-xl"></div>
                              )}
                             
                              <div className={`relative flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 transition-all duration-300 ${
                                isActive
                                  ? 'bg-white/20 shadow-lg'
                                  : 'bg-white/5 group-hover:bg-white/10'
                              }`}>
                                <Icon className={`w-4 h-4 ${isActive ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]' : ''}`} />
                              </div>
                             
                              <span className="flex-1 text-sm font-semibold text-left">
                                {item.label}
                              </span>
                             
                              {isActive && (
                                <ChevronRight className="w-4 h-4 opacity-80" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section (User Profile can go here later) */}
          <div className="relative border-t border-white/5 backdrop-blur-xl mt-auto">
            {/* Reserved for user profile / logout */}
          </div>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        @keyframes border-pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.3; }
        }

        .active-menu-item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          padding: 2px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
        }
      `}</style>
    </>
  );
}