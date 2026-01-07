import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Mail, Phone, Briefcase, MapPin, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { interviewAPI } from '../services/api';

interface Interview {
  _id?: string;
  id?: string | number;
  candidateName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  date: string;
  time: string;
  interviewer?: string;
  location: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'In Progress';
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

  // Load interviews from the API so new entries persist to the database
  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const response = await interviewAPI.getAll(1, 1000);
      const rawData = Array.isArray(response?.data) ? response.data : [];

      const formatted = rawData.map((item: any) => ({
        _id: item._id,
        id: item._id,
        candidateName: item.candidateName,
        email: item.candidateEmail,
        phone: item.candidatePhone,
        position: item.position,
        department: item.department,
        date: item.interviewDate ? new Date(item.interviewDate).toISOString().slice(0, 10) : '',
        time: item.interviewTime,
        interviewer: item.interviewerName,
        location: item.location || '',
        status: item.status,
        notes: item.notes,
        resume: item.resume,
      }));

      setInterviews(formatted);
    } catch (err) {
      console.error('Failed to load interviews', err);
    }
  };

  const filteredInterviews = interviews.filter(
    interview => filterStatus === 'all' || interview.status === filterStatus
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      candidateName: formData.candidateName,
      candidateEmail: formData.email,
      candidatePhone: formData.phone,
      position: formData.position,
      department: formData.department,
      interviewDate: formData.date,
      interviewTime: formData.time,
      location: formData.location,
      status: formData.status,
      notes: formData.notes,
      interviewerName: formData.interviewer,
      interviewType: 'In-Person',
    };

    try {
      if (editingInterview && (editingInterview._id || editingInterview.id)) {
        const id = String(editingInterview._id || editingInterview.id);
        await interviewAPI.update(id, payload);
      } else {
        await interviewAPI.create(payload);
      }

      await loadInterviews();
      resetForm();
    } catch (err) {
      console.error('Failed to save interview', err);
    }
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
      interviewer: interview.interviewer || '',
      location: interview.location,
      status: interview.status,
      notes: interview.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id?: string | number) => {
    if (!id) return;

    let dismissed = false;

    toast.custom(
      (t) => (
        <div className="bg-white shadow-2xl border border-gray-200 max-w-sm overflow-hidden" style={{ borderRadius: '5px' }}>
          
          <div className="p-6">
            <p className="text-gray-800 text-base leading-relaxed mb-6 font-medium">
              Are you sure you want to delete this interview? 
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
                      await interviewAPI.delete(String(id));
                      await loadInterviews();
                      toast.dismiss(t);
                      toast.success('Interview deleted successfully', {
                        position: 'top-center'
                      });
                    } catch (err) {
                      toast.error('Failed to delete interview', {
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
          <div key={interview._id || interview.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                  <span>Interviewer: {interview.interviewer || 'N/A'}</span>
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
                  onClick={() => handleDelete(interview._id || interview.id)}
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
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style={{ borderRadius: '5px' }}>
            {/* Header */}
            <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #9333ea, #7e22ce)' }}>
              <h2 className="text-base font-bold" style={{ color: '#ffffff', margin: 0 }}>
                {editingInterview ? 'Edit Interview' : 'Schedule New Interview'}
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '4px 0 0 0' }}>
                {editingInterview ? 'Update interview details' : 'Schedule a new interview with candidate'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Candidate Name */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Candidate Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.candidateName}
                    onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                    placeholder="Enter candidate's full name"
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="candidate@email.com"
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 XXX XXXXXXX"
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Position Applied <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Frontend Developer"
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                    style={{ borderRadius: '5px' }}
                  >
                    <option value="">Select Department</option>
                    <option value="Sales Operations (Phase-4)">Sales Operations (Phase-4)</option>
                    <option value="Sales Operations">Sales Operations</option>
                    <option value="Tech Department">Tech Department</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Interview Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Interview Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                  />
                </div>

                {/* Interviewer */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Interviewer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.interviewer}
                    onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                    placeholder="Enter interviewer name"
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Location/Platform <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Conference Room A, Zoom, etc."
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Interview Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                    style={{ borderRadius: '5px' }}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="Add any additional notes about the interview..."
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    style={{ borderRadius: '5px' }}
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors font-semibold text-sm"
                style={{ borderRadius: '5px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-5 py-2.5 text-white hover:bg-purple-700 transition-colors shadow-lg font-bold text-sm"
                style={{ borderRadius: '5px', backgroundColor: '#9333ea' }}
              >
                {editingInterview ? 'Update Interview' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}