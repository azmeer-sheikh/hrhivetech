import { useState } from 'react';
import { CalendarDays, Plus, Trash2, Calendar } from 'lucide-react';
import { Palmtree } from 'lucide-react';

export interface Holiday {
  id: number;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newHoliday: Holiday = {
      id: holidays.length + 1,
      name,
      date,
      type,
      description,
    };

    setHolidays([...holidays, newHoliday].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
    
    // Reset form
    setShowAddModal(false);
    setName('');
    setDate('');
    setType('National');
    setDescription('');
  };

  const deleteHoliday = (id: number) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      setHolidays(holidays.filter(h => h.id !== id));
    }
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
                  key={holiday.id} 
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
                        onClick={() => deleteHoliday(holiday.id)}
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
                  key={holiday.id} 
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
                    onClick={() => deleteHoliday(holiday.id)}
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-down">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 border-b border-purple-700">
              <h2 className="!text-white !mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Palmtree className="w-5 h-5 !text-white" />
                </div>
                Add Holiday
              </h2>
              <p className="!text-purple-100 text-sm !mb-0">
                Add a new holiday to the company calendar
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Holiday Name */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Holiday Name
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                    placeholder="e.g., Memorial Day, Independence Day"
                    required
                  />
                </div>

                {/* Date and Type Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block !text-gray-900 font-medium flex items-center gap-2">
                      Date
                      <span className="!text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <label className="block !text-gray-900 font-medium flex items-center gap-2">
                      Holiday Type
                      <span className="!text-red-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as Holiday['type'])}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
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
                  <label className="block !text-gray-900 font-medium">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300 resize-none"
                    rows={4}
                    placeholder="Add a brief description of the holiday (optional)"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 !text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm !text-gray-900 font-medium !mb-1">Holiday Information</p>
                      <p className="text-sm !text-gray-600 !mb-0">
                        This holiday will be visible to all employees and will be marked as a non-working day in the system.
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
                className="flex-1 px-6 py-3.5 bg-purple-600 !text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/30 font-medium"
              >
                Add Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}