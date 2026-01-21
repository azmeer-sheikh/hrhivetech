import { useEffect, useState } from 'react';
import { Users, UserCheck, Building2, Clock, Calendar, Palmtree, FileText, TrendingUp, Bell, Award, FileCheck, Users2, Megaphone, Gift, BarChart3, DollarSign } from 'lucide-react';
import { announcementAPI, holidayAPI } from '../services/api';

export function DashboardOverview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const todayISO = new Date().toISOString().split('T')[0];

  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    title: string;
    time: string;
    icon: any;
    iconBg: string;
    iconColor: string;
  }>>([]);

  const [upcomingEvents, setUpcomingEvents] = useState<Array<{
    id: string;
    title: string;
    date: string;
    type: string;
    month: string;
    day: string;
    bgColor: string;
    badgeBg: string;
    badgeText: string;
  }>>([]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const res: any = await announcementAPI.getAll(1, 5);
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped = items.map((item: any) => ({
          id: item._id || item.id || crypto.randomUUID(),
          title: item.title || item.subject || 'Announcement',
          time: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recently',
          icon: Bell,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        }));
        setRecentActivities(mapped);
      } catch (err) {
        console.error('Failed to load announcements:', err);
        setRecentActivities([]);
      }
    };

    const loadHolidays = async () => {
      try {
        const res: any = await holidayAPI.getAll();
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const upcoming = items
          .filter((h: any) => h.date && h.date.split('T')[0] >= todayISO)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
          .map((h: any) => {
            const d = new Date(h.date);
            const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const day = String(d.getDate()).padStart(2, '0');
            return {
              id: h._id || h.id || crypto.randomUUID(),
              title: h.name || h.title || 'Holiday',
              date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              type: h.type || 'Holiday',
              month,
              day,
              bgColor: 'bg-emerald-500',
              badgeBg: 'bg-emerald-100',
              badgeText: 'text-emerald-700',
            };
          });
        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error('Failed to load holidays:', err);
        setUpcomingEvents([]);
      }
    };

    loadAnnouncements();
    loadHolidays();
  }, [todayISO]);
  const stats = [
    {
      title: 'Total Employees',
      value: '57',
      change: '+3 this month',
      icon: Users,
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Today',
      value: '48',
      change: '84% attendance',
      icon: UserCheck,
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'On Leave',
      value: '4',
      change: '2 pending approval',
      icon: Palmtree,
      iconBg: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Departments',
      value: '3',
      change: 'Sales & Tech',
      icon: Building2,
      iconBg: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const quickActions = [
    {
      title: 'Daily Attendance',
      icon: Clock,
      cardBg: 'bg-blue-50',
      border: 'border-blue-200',
      hover: 'hover:border-blue-300',
      accentText: 'text-blue-700',
      line: 'via-blue-400',
      iconBg: 'bg-blue-600',
      iconRing: 'ring-4 ring-blue-100',
      iconColor: 'text-white',
      tab: 'daily-attendance',
    },
    {
      title: 'Employees',
      icon: Users,
      cardBg: 'bg-emerald-50',
      border: 'border-emerald-200',
      hover: 'hover:border-emerald-300',
      accentText: 'text-emerald-700',
      line: 'via-emerald-400',
      iconBg: 'bg-emerald-600',
      iconRing: 'ring-4 ring-emerald-100',
      iconColor: 'text-white',
      tab: 'employees',
    },
    {
      title: 'Attendance Records',
      icon: Calendar,
      cardBg: 'bg-blue-50',
      border: 'border-cyan-200',
      hover: 'hover:border-cyan-300',
      accentText: 'text-cyan-700',
      line: 'via-cyan-400',
      iconBg: 'bg-blue-500',
      iconRing: 'ring-4 ring-sky-100 ring-offset-2 ring-offset-white',
      iconColor: 'text-white',
      tab: 'attendance',
    },
    {
      title: 'Leave Management',
      icon: Palmtree,
      cardBg: 'bg-amber-50',
      border: 'border-amber-200',
      hover: 'hover:border-amber-300',
      accentText: 'text-amber-700',
      line: 'via-amber-400',
      iconBg: 'bg-amber-600',
      iconRing: 'ring-4 ring-amber-100',
      iconColor: 'text-white',
      tab: 'leaves',
    },
    {
      title: 'Documents',
      icon: FileText,
      cardBg: 'bg-purple-50',
      border: 'border-purple-200',
      hover: 'hover:border-purple-300',
      accentText: 'text-purple-700',
      line: 'via-purple-400',
      iconBg: 'bg-purple-600',
      iconRing: 'ring-4 ring-purple-100',
      iconColor: 'text-white',
      tab: 'documents',
    },
    {
      title: 'Interviews',
      icon: Users2,
      cardBg: 'bg-orange-300',
      border: 'border-orange-200',
      hover: 'hover:border-orange-300',
      accentText: 'text-orange-700',
      line: 'via-orange-400',
      iconBg: 'bg-amber-600',
      iconRing: 'ring-4 ring-amber-100 ring-offset-2 ring-offset-white',
      iconColor: 'text-white',
      tab: 'interviews',
    },
    {
      title: 'Announcements',
      icon: Megaphone,
      cardBg: 'bg-red-50',
      border: 'border-red-200',
      hover: 'hover:border-red-300',
      accentText: 'text-red-700',
      line: 'via-red-400',
      iconBg: 'bg-red-600',
      iconRing: 'ring-4 ring-red-100',
      iconColor: 'text-white',
      tab: 'announcements',
    },
    {
      title: 'Holidays',
      icon: Gift,
      cardBg: 'bg-green-50',
      border: 'border-pink-200',
      hover: 'hover:border-pink-300',
      accentText: 'text-pink-700',
      line: 'via-pink-400',
      iconBg: 'bg-red-500',
      iconRing: 'ring-4 ring-rose-100 ring-offset-2 ring-offset-white',
      iconColor: 'text-white',
      tab: 'holidays',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      cardBg: 'bg-indigo-50',
      border: 'border-indigo-200',
      hover: 'hover:border-indigo-300',
      accentText: 'text-indigo-700',
      line: 'via-indigo-400',
      iconBg: 'bg-indigo-600',
      iconRing: 'ring-4 ring-indigo-100',
      iconColor: 'text-white',
      tab: 'analytics',
    },
    {
      title: 'Labor Cost',
      icon: DollarSign,
      cardBg: 'bg-yellow-500',
      border: 'border-yellow-200',
      hover: 'hover:border-yellow-300',
      accentText: 'text-yellow-700',
      line: 'via-yellow-400',
      iconBg: 'bg-yellow-500',
      iconRing: 'ring-4 ring-yellow-100',
      iconColor: 'text-gray-900',
      tab: 'labor-cost',
    },
  ];

  const activityList = recentActivities.length ? recentActivities : [
    {
      id: 'placeholder-activity',
      title: 'No recent activity yet',
      time: '—',
      icon: Bell,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-500',
    },
  ];

  const eventList = upcomingEvents.length ? upcomingEvents : [
    {
      id: 'placeholder-event',
      title: 'No upcoming events yet',
      date: '—',
      type: 'Upcoming',
      month: '--',
      day: '--',
      bgColor: 'bg-gray-300',
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-600',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.iconBg} p-2.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{stat.title}</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-1.5">{stat.value}</h2>
              <span className={`text-xs font-medium ${stat.textColor}`}>{stat.change}</span>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <h3 className="text-base font-bold text-gray-900">Quick Actions</h3>
          <p className="text-xs text-gray-500 mt-0.5">Navigate to key features</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(action.tab)}
                  className={`group relative overflow-hidden ${action.cardBg} border ${action.border} rounded-lg p-4 flex flex-col items-center gap-3 transition-all duration-200 hover:shadow-md cursor-pointer transform hover:scale-105 active:scale-95`}
                >
                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                  
                  {/* Icon */}
                  <div className="relative z-10">
                    <div className={`${action.iconBg} ${action.iconRing} p-3 rounded-lg shadow-sm group-hover:shadow group-hover:scale-110 transition-all duration-200 flex items-center justify-center`}> 
                      <Icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div className="relative z-10 text-center">
                    <span className="text-xs font-semibold text-gray-900 block leading-tight">{action.title}</span>
                  </div>
                  
                  {/* Bottom Accent Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent ${action.line} to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`}></div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {activityList.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-150 cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <div className={`${activity.iconBg} p-2 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 mb-1">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span className="truncate">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900">Upcoming Events</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {eventList.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                >
                  <div className={`${event.bgColor} min-w-[52px] h-[52px] rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                    <span className="text-[10px] font-bold uppercase opacity-90">
                      {event.month}
                    </span>
                    <span className="text-xl font-bold leading-none mt-0.5">
                      {event.day}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 mb-1">{event.title}</p>
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${event.badgeBg} ${event.badgeText} uppercase tracking-wide`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
