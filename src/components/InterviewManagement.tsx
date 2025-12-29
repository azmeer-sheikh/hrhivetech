import { useState } from 'react';
import { Plus, Calendar, Clock, User, Mail, Phone, Briefcase, MapPin, Edit2, Trash2 } from 'lucide-react';

interface Interview {
  id: number;
  candidateName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  date: string;
  time: string;
  interviewer: string;
  location: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes?: string;
  resume?: string;
}

interface InterviewManagementProps {
  interviews: Interview[];
  setInterviews: (interviews: Interview[]) => void;
}

export function InterviewManagement({ interviews, setInterviews }: InterviewManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    date: '',
    time: '',
    interviewer: '',
    location: '',
    status: 'Scheduled' as const,
    notes: '',
  });

  const filteredInterviews = interviews.filter(
    interview => filterStatus === 'all' || interview.status === filterStatus
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingInterview) {
      setInterviews(interviews.map(interview =>
        interview.id === editingInterview.id
          ? { ...interview, ...formData }
          : interview
      ));
    } else {
      const newInterview: Interview = {
        id: Math.max(0, ...interviews.map(i => i.id)) + 1,
        ...formData,
      };
      setInterviews([...interviews, newInterview]);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingInterview(null);
    setFormData({
      candidateName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      date: '',
      time: '',
      interviewer: '',
      location: '',
      status: 'Scheduled',
      notes: '',
    });
  };

  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview);
    setFormData({
      candidateName: interview.candidateName,
      email: interview.email,
      phone: interview.phone,
      position: interview.position,
      department: interview.department,
      date: interview.date,
      time: interview.time,
      interviewer: interview.interviewer,
      location: interview.location,
      status: interview.status,
      notes: interview.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this interview?')) {
      setInterviews(interviews.filter(interview => interview.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Rescheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusCounts = () => {
    return {
      all: interviews.length,
      Scheduled: interviews.filter(i => i.status === 'Scheduled').length,
      Completed: interviews.filter(i => i.status === 'Completed').length,
      Cancelled: interviews.filter(i => i.status === 'Cancelled').length,
      Rescheduled: interviews.filter(i => i.status === 'Rescheduled').length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-2">Interview Management</h1>
          <p className="text-gray-500">Schedule and track candidate interviews</p>
        </div>
        <button
          onClick={() => {
            setEditingInterview(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Schedule Interview
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-xl border transition-colors ${
            filterStatus === 'all'
              ? 'bg-indigo-50 border-indigo-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <p className="text-gray-700 mb-1">Total</p>
          <p className="text-indigo-600">{counts.all}</p>
        </button>
        <button
          onClick={() => setFilterStatus('Scheduled')}
          className={`p-4 rounded-xl border transition-colors ${
            filterStatus === 'Scheduled'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <p className="text-gray-700 mb-1">Scheduled</p>
          <p className="text-blue-600">{counts.Scheduled}</p>
        </button>
        <button
          onClick={() => setFilterStatus('Completed')}
          className={`p-4 rounded-xl border transition-colors ${
            filterStatus === 'Completed'
              ? 'bg-green-50 border-green-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <p className="text-gray-700 mb-1">Completed</p>
          <p className="text-green-600">{counts.Completed}</p>
        </button>
        <button
          onClick={() => setFilterStatus('Rescheduled')}
          className={`p-4 rounded-xl border transition-colors ${
            filterStatus === 'Rescheduled'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <p className="text-gray-700 mb-1">Rescheduled</p>
          <p className="text-yellow-600">{counts.Rescheduled}</p>
        </button>
        <button
          onClick={() => setFilterStatus('Cancelled')}
          className={`p-4 rounded-xl border transition-colors ${
            filterStatus === 'Cancelled'
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <p className="text-gray-700 mb-1">Cancelled</p>
          <p className="text-red-600">{counts.Cancelled}</p>
        </button>
      </div>

      {/* Interview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInterviews.map((interview) => (
          <div key={interview.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 mb-1">{interview.candidateName}</h3>
                  <p className="text-gray-600">{interview.position}</p>
                </div>
                <span className={`px-3 py-1 rounded-full border ${getStatusColor(interview.status)}`}>
                  {interview.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{interview.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{interview.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{interview.department}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{interview.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{interview.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Interviewer: {interview.interviewer}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{interview.location}</span>
                </div>
              </div>

              {interview.notes && (
                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <p className="text-gray-700 mb-1">Notes:</p>
                  <p className="text-gray-600">{interview.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(interview)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(interview.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInterviews.length === 0 && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No interviews found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-down">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 border-b border-purple-700">
              <h2 className="!text-white !mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 !text-white" />
                </div>
                {editingInterview ? 'Edit Interview' : 'Schedule New Interview'}
              </h2>
              <p className="!text-purple-100 text-sm !mb-0">
                {editingInterview ? 'Update interview details' : 'Schedule a new interview with candidate'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Candidate Name */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Candidate Name
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.candidateName}
                    onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                    placeholder="Enter candidate's full name"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Email Address
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="candidate@email.com"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Phone Number
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 XXX XXXXXXX"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Position Applied
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Frontend Developer"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Department
                    <span className="!text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="">Select Department</option>
                    <option value="Sales Operations (Phase-4)">Sales Operations (Phase-4)</option>
                    <option value="Sales Operations">Sales Operations</option>
                    <option value="Tech Department">Tech Department</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Interview Date
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Interview Time
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Interviewer */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Interviewer
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.interviewer}
                    onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                    placeholder="Enter interviewer name"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Location/Platform
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Conference Room A, Zoom, etc."
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Interview Status
                    <span className="!text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block !text-gray-900 font-medium">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="Add any additional notes about the interview..."
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300 resize-none"
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3.5 bg-white !text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border-2 border-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-6 py-3.5 bg-purple-600 !text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/30 font-medium"
              >
                {editingInterview ? 'Update Interview' : 'Schedule Interview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}