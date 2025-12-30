import { useEffect, useState } from 'react';
import { Palmtree, Plus, Calendar, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { leaveAPI } from '../services/api';

interface Employee {
  _id?: string;
  id?: number | string;
  name: string;
  position: string;
  department: string;
}

export interface LeaveRequest {
  _id?: string;
  id?: number | string;
  employeeId: string | number;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Emergency' | 'Unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  approvedBy?: string;
}

interface LeaveBalance {
  employeeId: number | string;
  annual: number;
  sick: number;
  casual: number;
}

interface LeaveManagementProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  setLeaveRequests: (requests: LeaveRequest[]) => void;
  leaveBalances: LeaveBalance[];
  setLeaveBalances: (balances: LeaveBalance[]) => void;
}

export function LeaveManagement({ 
  employees, 
  leaveRequests, 
  setLeaveRequests,
  leaveBalances,
  setLeaveBalances 
}: LeaveManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadLeaves();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;
    fetchBalance(selectedEmployee);
  }, [selectedEmployee]);

  const mapBackendTypeToUI = (type: string): LeaveRequest['leaveType'] => {
    switch (type) {
      case 'Annual Leave':
        return 'Annual';
      case 'Sick Leave':
        return 'Sick';
      case 'Casual Leave':
        return 'Casual';
      case 'Unpaid Leave':
        return 'Unpaid';
      default:
        return 'Emergency';
    }
  };

  const mapUITypeToBackend = (type: LeaveRequest['leaveType']) => {
    switch (type) {
      case 'Annual':
        return 'Annual Leave';
      case 'Sick':
        return 'Sick Leave';
      case 'Casual':
        return 'Casual Leave';
      case 'Unpaid':
        return 'Unpaid Leave';
      default:
        return 'Casual Leave';
    }
  };

  const loadLeaves = async () => {
    try {
      const response = await leaveAPI.getAll(1, 500);
      const raw = Array.isArray(response?.data) ? response.data : [];

      const formatted: LeaveRequest[] = raw.map((item: any) => {
        const employeeName = item.employee?.firstName
          ? `${item.employee.firstName} ${item.employee.lastName || ''}`.trim()
          : item.employeeName || 'Employee';

        return {
          _id: item._id,
          id: item._id,
          employeeId: item.employee?._id || item.employee,
          employeeName,
          leaveType: mapBackendTypeToUI(item.leaveType),
          startDate: item.startDate,
          endDate: item.endDate,
          days: item.numberOfDays,
          reason: item.reason,
          status: item.status,
          appliedOn: item.createdAt || item.startDate,
          approvedBy: item.approvedBy?.username || item.approvedBy?.email,
        };
      });

      setLeaveRequests(formatted);
    } catch (err) {
      console.error('Failed to load leaves', err);
    }
  };

  const fetchBalance = async (employeeId: string | number) => {
    try {
      const response = await leaveAPI.getBalance(String(employeeId));
      const data = response?.data || {};

      const annual = data['Annual Leave']?.remaining ?? 20;
      const sick = data['Sick Leave']?.remaining ?? 10;
      const casual = data['Casual Leave']?.remaining ?? 5;

      const updated = leaveBalances.filter(b => String(b.employeeId) !== String(employeeId));
      updated.push({ employeeId, annual, sick, casual });
      setLeaveBalances(updated);
    } catch (err) {
      console.error('Failed to fetch leave balance', err);
    }
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startD = new Date(start);
    const endD = new Date(end);
    const diffTime = Math.abs(endD.getTime() - startD.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const employee = employees.find(emp => String(emp._id || emp.id) === String(selectedEmployee));
    const days = calculateDays(startDate, endDate);

    const payload = {
      employee: selectedEmployee,
      leaveType: mapUITypeToBackend(leaveType),
      startDate,
      endDate,
      numberOfDays: days,
      reason,
      status: 'Pending',
    };

    try {
      await leaveAPI.create(payload);
      await loadLeaves();
      // Reset form
      setShowAddModal(false);
      setSelectedEmployee('');
      setLeaveType('Annual');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      console.error('Failed to create leave', err);
    }
  };

  const handleApprove = async (leaveId: string | number | undefined) => {
    if (!leaveId) return;
    try {
      await leaveAPI.approve(String(leaveId), 'Approved');
      await loadLeaves();
    } catch (err) {
      console.error('Failed to approve leave', err);
    }
  };

  const handleReject = async (leaveId: string | number | undefined) => {
    if (!leaveId) return;
    try {
      await leaveAPI.reject(String(leaveId), 'Rejected by admin');
      await loadLeaves();
    } catch (err) {
      console.error('Failed to reject leave', err);
    }
  };

  const getEmployeeBalance = (employeeId: string | number) => {
    return leaveBalances.find(b => String(b.employeeId) === String(employeeId)) || { employeeId, annual: 20, sick: 10, casual: 5 };
  };

  const filteredRequests = leaveRequests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: leaveRequests.filter(r => r.status === 'Pending').length,
    approved: leaveRequests.filter(r => r.status === 'Approved').length,
    rejected: leaveRequests.filter(r => r.status === 'Rejected').length,
    total: leaveRequests.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl stat-gradient-purple flex items-center justify-center">
              <Palmtree className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 mb-0">Leave Management</h1>
              <p className="text-sm text-gray-600 mb-0">Manage employee leave requests and balances</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Apply Leave</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-700 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent min-w-[200px]"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Days</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((leave) => (
                <tr key={leave._id || leave.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{leave.employeeName}</p>
                      <p className="text-sm text-gray-500">Applied: {new Date(leave.appliedOn).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      leave.leaveType === 'Annual' ? 'bg-blue-100 text-blue-800' :
                      leave.leaveType === 'Sick' ? 'bg-red-100 text-red-800' :
                      leave.leaveType === 'Casual' ? 'bg-green-100 text-green-800' :
                      leave.leaveType === 'Emergency' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{new Date(leave.startDate).toLocaleDateString()}</p>
                      <p className="text-gray-500">to {new Date(leave.endDate).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{leave.days} days</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">{leave.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {leave.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(leave._id || leave.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(leave._id || leave.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {leave.status !== 'Pending' && (
                      <span className="text-sm text-gray-500">By {leave.approvedBy}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Palmtree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        )}
      </div>

      {/* Add Leave Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-down">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 border-b border-emerald-700">
              <h2 className="!text-white !mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Palmtree className="w-5 h-5 !text-white" />
                </div>
                Apply for Leave
              </h2>
              <p className="!text-emerald-100 text-sm !mb-0">
                Submit a new leave request for approval
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitLeave} className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Employee Selection */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Select Employee
                    <span className="!text-red-500">*</span>
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                    required
                  >
                    <option value="">Choose an employee</option>
                    {employees.map(emp => (
                      <option key={emp._id || emp.id} value={emp._id || emp.id}>
                        {emp.name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Leave Balance Display */}
                {selectedEmployee && (
                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl p-6">
                    <h4 className="!text-gray-900 !mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <Calendar className="w-4 h-4 !text-white" />
                      </div>
                      Available Leave Balance
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {(() => {
                        const balance = getEmployeeBalance(selectedEmployee);
                        return (
                          <>
                            <div className="bg-white rounded-lg p-4 border border-emerald-200">
                              <p className="text-xs !text-emerald-700 !mb-1 font-medium">Annual Leave</p>
                              <p className="!text-2xl font-bold !text-emerald-600 !mb-0">{balance.annual} <span className="text-sm !text-gray-600">days</span></p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <p className="text-xs !text-blue-700 !mb-1 font-medium">Sick Leave</p>
                              <p className="!text-2xl font-bold !text-blue-600 !mb-0">{balance.sick} <span className="text-sm !text-gray-600">days</span></p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                              <p className="text-xs !text-purple-700 !mb-1 font-medium">Casual Leave</p>
                              <p className="!text-2xl font-bold !text-purple-600 !mb-0">{balance.casual} <span className="text-sm !text-gray-600">days</span></p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Leave Type */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Leave Type
                    <span className="!text-red-500">*</span>
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                    required
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block !text-gray-900 font-medium flex items-center gap-2">
                      Start Date
                      <span className="!text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block !text-gray-900 font-medium flex items-center gap-2">
                      End Date
                      <span className="!text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300"
                      required
                    />
                  </div>
                </div>

                {/* Total Days Calculator */}
                {startDate && endDate && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 !text-white" />
                    </div>
                    <div>
                      <p className="text-sm !text-gray-700 !mb-1">Total Leave Duration</p>
                      <p className="!text-3xl font-bold !text-amber-600 !mb-0">
                        {calculateDays(startDate, endDate)} <span className="text-lg">days</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Reason for Leave
                    <span className="!text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300 resize-none"
                    rows={4}
                    placeholder="Please provide a detailed reason for your leave request..."
                    required
                  />
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
                onClick={handleSubmitLeave}
                className="flex-1 px-6 py-3.5 bg-emerald-600 !text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30 font-medium"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}