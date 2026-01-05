import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2, Calendar } from 'lucide-react';
import { Palmtree } from 'lucide-react';
import { holidayAPI } from '../services/api';
import { toast } from 'sonner';

export interface Holiday {
  _id?: string;
  id?: string | number;
  name: string;
  date: string;
  type: 'National' | 'Religious' | 'Company';
  description: string;
}

interface HolidaysProps {
  holidays: Holiday[];
  setHolidays: (holidays: Holiday[]) => void;
}

export function Holidays({ holidays, setHolidays }: HolidaysProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<Holiday['type']>('National');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadHolidays();
  }, []);

  const mapTypeToBackend = (t: Holiday['type']) => {
    switch (t) {
      case 'National':
        return 'National Holiday';
      case 'Religious':
        return 'Regional Holiday';
      case 'Company':
        return 'Company Holiday';
      default:
        return 'Company Holiday';
    }
  };

  const mapTypeFromBackend = (t: string): Holiday['type'] => {
    if (t === 'National Holiday') return 'National';
    if (t === 'Regional Holiday') return 'Religious';
    if (t === 'Company Holiday') return 'Company';
    if (t === 'Optional Holiday') return 'Company';
    return 'Company';
  };

  const loadHolidays = async () => {
    try {
      const response = await holidayAPI.getAll();
      const raw = Array.isArray(response?.data) ? response.data : [];

      const formatted: Holiday[] = raw.map((h: any) => ({
        _id: h._id,
        id: h._id,
        name: h.name,
        date: h.date,
        type: mapTypeFromBackend(h.type),
        description: h.description || '',
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setHolidays(formatted);
    } catch (err) {
      console.error('Failed to load holidays', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await holidayAPI.create({
        name,
        date,
        type: mapTypeToBackend(type),
        description,
        isActive: true,
      });
      await loadHolidays();

      setShowAddModal(false);
      setName('');
      setDate('');
      setType('National');
      setDescription('');
      toast.success('Holiday added successfully', {
        position: 'top-center'
      });
    } catch (err) {
      console.error('Failed to create holiday', err);
      toast.error('Failed to add holiday', {
        position: 'top-center'
      });
    }
  };

  const deleteHoliday = async (id?: string | number) => {
    if (!id) return;

    let dismissed = false;

    toast.custom(
      (t) => (
        <div className="bg-white shadow-2xl border border-gray-200 max-w-sm overflow-hidden" style={{ borderRadius: '5px' }}>
          
        <div className="p-6">
            <p className="text-gray-800 text-base leading-relaxed mb-6 font-medium">
              Are you sure you want to delete this holiday? 
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!dismissed) {
                    dismissed = true;
                    toast.dismiss(t);
                  }
                }}
                className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors font-semibold text-sm"
                style={{ borderRadius: '5px' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!dismissed) {
                    dismissed = true;
                    try {
                      await holidayAPI.delete(String(id));
                      await loadHolidays();
                      toast.dismiss(t);
                      toast.success('Holiday deleted successfully', {
                        position: 'top-center'
                      });
                    } catch (err) {
                      toast.error('Failed to delete holiday', {
                        position: 'top-center'
                      });
                    }
                  }
                }}
                className="flex-1 px-5 py-2.5 text-sm font-bold transition-colors shadow-lg"
                style={{ borderRadius: '5px', backgroundColor: '#dc2626', color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
      { position: 'top-center' }
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'National': return 'bg-green-100 text-green-800 border-green-200';
      case 'Religious': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Company': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= new Date());
  const pastHolidays = holidays.filter(h => new Date(h.date) < new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl stat-gradient-yellow flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 mb-0">Company Holidays</h1>
              <p className="text-sm text-gray-600 mb-0">Manage and view company holiday calendar</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Holiday</span>
          </button>
        </div>
      </div>

      {/* Upcoming Holidays */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-gray-900 mb-0">Upcoming Holidays ({upcomingHolidays.length})</h3>
        </div>
        <div className="p-6">
          {upcomingHolidays.length > 0 ? (
            <div className="space-y-4">
              {upcomingHolidays.map((holiday) => (
                <div 
                  key={holiday._id || holiday.id} 
                  className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xs text-gray-500 uppercase">
                      {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {new Date(holiday.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1">{holiday.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{holiday.description}</p>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(holiday.type)}`}>
                            {holiday.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHoliday(holiday._id || holiday.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming holidays</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Holidays */}
      {pastHolidays.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-gray-900 mb-0">Past Holidays ({pastHolidays.length})</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {pastHolidays.map((holiday) => (
                <div 
                  key={holiday._id || holiday.id} 
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-75"
                >
                  <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-400 uppercase">
                      {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-gray-600">
                      {new Date(holiday.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-700 mb-1">{holiday.name}</h4>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(holiday.type)}`}>
                        {holiday.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(holiday.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteHoliday(holiday._id || holiday.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style={{ borderRadius: '5px' }}>
            {/* Header */}
            <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #9333ea, #7e22ce)' }}>
              <h2 className="text-base font-bold" style={{ color: '#ffffff', margin: 0 }}>
                Add Holiday
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '4px 0 0 0' }}>
                Add a new holiday to the company calendar
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Holiday Name */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Holiday Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                    placeholder="e.g., Memorial Day, Independence Day"
                    required
                  />
                </div>

                {/* Date and Type Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-gray-900 font-medium text-sm">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ borderRadius: '5px' }}
                      required
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <label className="block text-gray-900 font-medium text-sm">
                      Holiday Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as Holiday['type'])}
                      className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                      style={{ borderRadius: '5px' }}
                      required
                    >
                      <option value="National">National Holiday</option>
                      <option value="Religious">Religious Holiday</option>
                      <option value="Company">Company Holiday</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    style={{ borderRadius: '5px' }}
                    rows={4}
                    placeholder="Add a brief description of the holiday (optional)"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4" style={{ borderRadius: '5px' }}>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 font-medium mb-1">Holiday Information</p>
                      <p className="text-sm text-gray-700">
                        This holiday will be visible to all employees and will be marked as a non-working day in the system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Move inside form */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors font-semibold text-sm"
                  style={{ borderRadius: '5px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-2.5 text-white hover:bg-purple-700 transition-colors shadow-lg font-bold text-sm"
                  style={{ borderRadius: '5px', backgroundColor: '#9333ea' }}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}