import { useEffect, useState } from 'react';
import { Users, UserCheck, Building2, Clock, Calendar, Palmtree, FileText, TrendingUp, Bell, Award } from 'lucide-react';
import { announcementAPI, holidayAPI } from '../services/api';

export function DashboardOverview() {
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
    { title: 'Mark Attendance', icon: Clock, color: 'blue', bg: 'bg-blue-500', border: 'border-blue-200', hover: 'hover:border-blue-300', cardBg: 'bg-blue-50' },
    { title: 'Apply Leave', icon: Palmtree, color: 'emerald', bg: 'bg-emerald-500', border: 'border-emerald-200', hover: 'hover:border-emerald-300', cardBg: 'bg-emerald-50' },
    { title: 'Upload Document', icon: FileText, color: 'purple', bg: 'bg-purple-500', border: 'border-purple-200', hover: 'hover:border-purple-300', cardBg: 'bg-purple-50' },
    { title: 'View Reports', icon: TrendingUp, color: 'amber', bg: 'bg-amber-500', border: 'border-amber-200', hover: 'hover:border-amber-300', cardBg: 'bg-amber-50' },
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-gray-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.iconBg} p-3 rounded-lg shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-2">{stat.title}</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h2>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${stat.textColor}`}>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-0">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className={`${action.cardBg} border ${action.border} ${action.hover} rounded-xl p-6 flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-md group`}
                >
                  <div className={`${action.bg} p-4 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-semibold text-${action.color}-700`}>{action.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-0">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activityList.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <div className={`${activity.iconBg} p-3 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-0">Upcoming Events</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {eventList.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <div className={`${event.bgColor} min-w-[64px] h-[64px] rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                    <span className="text-xs font-bold uppercase opacity-90">
                      {event.month}
                    </span>
                    <span className="text-2xl font-bold leading-none mt-1">
                      {event.day}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-2">{event.title}</p>
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{event.date}</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold ${event.badgeBg} ${event.badgeText} uppercase tracking-wide`}>
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
