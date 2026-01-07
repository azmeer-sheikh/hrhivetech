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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900 shadow-lg border border-slate-700 hover:bg-slate-800 transition-all"
        style={{ borderRadius: '5px' }}
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Position */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-all duration-300 ease-out flex flex-col shadow-2xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Modern Background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}></div>
       
        {/* Subtle Accent Line */}
        <div className="absolute inset-y-0 right-0 w-px" style={{ background: 'linear-gradient(180deg, transparent 0%, #3b82f6 50%, transparent 100%)' }}></div>

        {/* Content Container */}
        <div className="relative h-full flex flex-col">
          {/* Logo Section */}
          <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="relative">
              {/* Logo Container */}
              <div className="mb-4 p-4 bg-white rounded-lg shadow-lg">
                <img
                  src={logoImage}
                  alt="Hive Tech Solutions"
                  className="h-20 w-auto object-contain mx-auto"
                />
              </div>
             
              {/* Company Info */}
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">HR Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {menuSections.map((section, sectionIdx) => {
                const isExpanded = expandedSection === section.title;
               
                return (
                  <div key={sectionIdx} className="mb-5">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full group"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 transition-all" style={{ borderRadius: '5px' }}>
                        <h3 className="flex-1 text-xs font-bold text-slate-400 tracking-wide uppercase text-left group-hover:text-slate-200 transition-colors">
                          {section.title}
                        </h3>
                       
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-all duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                   
                    {/* Menu Items */}
                    <div className={`mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
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
                              if (window.innerWidth < 1024) {
                                setIsOpen(false);
                              }
                            }}
                            className="relative w-full group"
                          >
                            <div 
                              className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-200 ${
                                isActive
                                  ? 'text-white shadow-md'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                              style={{
                                borderRadius: '5px',
                                backgroundColor: isActive ? '#3b82f6' : 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                             
                              <span className={`flex-1 text-sm font-medium text-left ${isActive ? 'font-semibold' : ''}`}>
                                {item.label}
                              </span>
                             
                              {isActive && (
                                <div className="w-1.5 h-1.5 bg-white" style={{ borderRadius: '50%' }}></div>
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

          {/* Bottom Section */}
          <div className="border-t px-4 py-4" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              style={{ borderRadius: '5px' }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </>
  );
}