import { useEffect, useState } from 'react';
import { Bell, Plus, Pin, Calendar, User, Trash2, Edit } from 'lucide-react';
import { announcementAPI } from '../services/api';

export interface Announcement {
  _id?: string;
  id?: string | number;
  title: string;
  content: string;
  category: 'General' | 'Holiday' | 'Policy' | 'Event' | 'Important';
  isPinned: boolean;
  createdBy: string;
  createdAt: string;
}

const mapTypeToCategory = (type?: string): Announcement['category'] => {
  switch (type) {
    case 'Policy Update':
      return 'Policy';
    case 'Event':
      return 'Event';
    case 'Holiday':
      return 'Holiday';
    case 'Important':
      return 'Important';
    default:
      return 'General';
  }
};

const mapCategoryToType = (category: Announcement['category']): string => {
  switch (category) {
    case 'Policy':
      return 'Policy Update';
    case 'Event':
      return 'Event';
    case 'Holiday':
      return 'Holiday';
    case 'Important':
      return 'Important';
    default:
      return 'General';
  }
};

interface AnnouncementsProps {
  announcements: Announcement[];
  setAnnouncements: (announcements: Announcement[]) => void;
}

export function Announcements({ announcements, setAnnouncements }: AnnouncementsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('General');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await announcementAPI.getAll(1, 1000);
      const raw = Array.isArray(response?.data) ? response.data : [];

      const formatted = raw.map((item: any) => ({
        _id: item._id,
        id: item._id,
        title: item.title,
        content: item.content,
        category: mapTypeToCategory(item.type),
        isPinned: Boolean(item.isPinned),
        createdBy: item.createdBy?.username || item.createdBy?.email || 'System',
        createdAt: item.publishDate || item.createdAt || new Date().toISOString(),
      }));

      setAnnouncements(formatted);
    } catch (err) {
      console.error('Failed to load announcements', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAnnouncement();
  };

  const saveAnnouncement = async () => {
    const payload = {
      title,
      content,
      type: mapCategoryToType(category),
      isPinned,
      priority: 'Medium',
      targetAudience: 'All Employees',
    };

    try {
      await announcementAPI.create(payload);
      await loadAnnouncements();
      // Reset form
      setShowAddModal(false);
      setTitle('');
      setContent('');
      setCategory('General');
      setIsPinned(false);
    } catch (err) {
      console.error('Failed to create announcement', err);
    }
  };

  const togglePin = (announcementId?: string | number, currentPinned?: boolean) => {
    handlePin(announcementId, !currentPinned);
  };

  const deleteAnnouncement = (announcementId?: string | number) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      handleDelete(announcementId);
    }
  };

  const handlePin = async (id?: number | string, isPinnedValue?: boolean) => {
    if (!id) return;
    try {
      await announcementAPI.update(String(id), { isPinned: isPinnedValue });
      await loadAnnouncements();
    } catch (err) {
      console.error('Failed to pin announcement', err);
    }
  };

  const handleDelete = async (id?: number | string) => {
    if (!id) return;
    try {
      await announcementAPI.delete(String(id));
      await loadAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement', err);
    }
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Important': return 'bg-red-100 text-red-800 border-red-200';
      case 'Holiday': return 'bg-green-100 text-green-800 border-green-200';
      case 'Policy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Event': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl stat-gradient-blue flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 mb-0">Announcements</h1>
              <p className="text-sm text-gray-600 mb-0">Company-wide notifications and updates</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Announcement</span>
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {sortedAnnouncements.map((announcement) => (
          <div 
            key={announcement._id || announcement.id} 
            className={`bg-white rounded-xl border shadow-sm p-6 transition-all hover:shadow-md ${
              announcement.isPinned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {announcement.isPinned && (
                    <Pin className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                  )}
                  <h3 className="text-gray-900 mb-0">{announcement.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">{announcement.content}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(announcement.category)}`}>
                    {announcement.category}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {announcement.createdBy}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePin(announcement._id || announcement.id, announcement.isPinned)}
                  className={`p-2 rounded-lg transition-colors ${
                    announcement.isPinned 
                      ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200' 
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                  title={announcement.isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement._id || announcement.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sortedAnnouncements.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No announcements yet</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-down">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-6 border-b border-amber-700">
              <h2 className="!text-white !mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 !text-white" />
                </div>
                Create Announcement
              </h2>
              <p className="!text-amber-100 text-sm !mb-0">
                Broadcast an important message to all employees
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Announcement Title
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-gray-300"
                    placeholder="Enter a clear and concise title..."
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Category
                    <span className="!text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Policy">Policy</option>
                    <option value="Event">Event</option>
                    <option value="Important">Important</option>
                  </select>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Announcement Content
                    <span className="!text-red-500">*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-gray-300 resize-none"
                    rows={8}
                    placeholder="Write your announcement message here. Be clear and provide all necessary details..."
                    required
                  />
                </div>

                {/* Pin Checkbox */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="isPinned"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="isPinned" className="!text-gray-900 font-medium !mb-1 cursor-pointer flex items-center gap-2">
                        📌 Pin this announcement
                      </label>
                      <p className="text-sm !text-gray-600 !mb-0">
                        Pinned announcements will appear at the top of the list for better visibility
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3.5 bg-white !text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border-2 border-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-6 py-3.5 bg-amber-600 !text-white rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/30 font-medium"
              >
                Publish Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}