import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { attendanceAPI, employeeAPI } from '../services/api';

interface Employee {
  id: number | string;
  _id?: string; // MongoDB ObjectId
  name: string;
  position: string;
  department: string;
}

interface AttendanceRecord {
  employeeId: number | string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  checkIn?: string;
  checkOut?: string;
}

interface AttendanceTrackingProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
}

export function AttendanceTracking({ 
  employees, 
  attendanceRecords, 
  setAttendanceRecords 
}: AttendanceTrackingProps) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [loading, setLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeModalType, setTimeModalType] = useState<'checkin' | 'checkout'>('checkin');
  const [selectedEmployeeForTime, setSelectedEmployeeForTime] = useState<Employee | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceRecord['status']>('Present');
  const [customTime, setCustomTime] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'department'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const normalizeId = (value?: string | number) => String(value ?? '');

  const formatTime = (value?: string | Date | null) => {
    if (!value) return undefined;
    return new Date(value).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const mapBackendRecord = (record: any): AttendanceRecord => ({
    employeeId: normalizeId(record?.employee?._id || record?.employee),
    // Use local date to avoid UTC-day shifts (e.g., timezone offsets)
    date: record?.date ? new Date(record.date).toLocaleDateString('en-CA') : selectedDate,
    status: record?.status === 'On Leave' ? 'Leave' : record?.status,
    // Prefer formatted times; fall back to raw strings if already formatted upstream
    checkIn: record?.checkIn ? formatTime(record.checkIn) || record.checkIn : undefined,
    checkOut: record?.checkOut ? formatTime(record.checkOut) || record.checkOut : undefined,
  });

  // Load attendance records from backend
  const loadAttendance = async () => {
    try {
      setLoading(true);
      // For daily view, fetch a ±1 day window to avoid UTC/day boundary gaps; monthly fetches the full month
      const { startDate, endDate } = (() => {
        if (viewMode === 'daily') {
          const start = new Date(selectedDate);
          start.setDate(start.getDate() - 1);
          const end = new Date(selectedDate);
          end.setDate(end.getDate() + 1);
          return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
          };
        }
        const start = selectedDate.substring(0, 8) + '01';
        const endOfMonth = new Date(selectedDate.substring(0, 7) + '-01');
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        return {
          startDate: start,
          endDate: endOfMonth.toISOString().split('T')[0],
        };
      })();

      console.log('[AT-LOAD] Fetching attendance from', startDate, 'to', endDate, 'mode:', viewMode);

      const response: any = await attendanceAPI.getAll(1, 1000, {
        startDate,
        endDate
      });

      // Map backend data to frontend format
      const records = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      console.log('[AT-LOAD] Raw records:', records);
      
      const mappedRecords = records.map(mapBackendRecord);
      console.log('[AT-LOAD] Mapped records:', mappedRecords);

      setAttendanceRecords(mappedRecords);
    } catch (error) {
      console.error('[AT-LOAD] Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load attendance on mount and when date changes
  useEffect(() => {
    loadAttendance();
  }, [selectedDate, viewMode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Leave':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="w-4 h-4" />;
      case 'Absent':
        return <XCircle className="w-4 h-4" />;
      case 'Late':
        return <Clock className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const toggleAttendance = async (employeeId: string | number, status: AttendanceRecord['status'], time?: string, date?: string) => {
    const employeeKey = normalizeId(employeeId);
    setPendingIds(prev => {
      const next = new Set(prev);
      next.add(employeeKey);
      return next;
    });

    try {
      console.log('[AT-MARK] Starting mark for employee', employeeKey, 'status', status);
      
      const targetDate = date || selectedDate;
      const existingIndex = attendanceRecords.findIndex(
        r => normalizeId(r.employeeId) === employeeKey && r.date === targetDate
      );

      const employee = employees.find(
        e => normalizeId(e.id) === employeeKey || normalizeId(e._id) === employeeKey
      );

      if (!employee) {
        throw new Error('Employee not found. Please refresh employees.');
      }

      console.log('[AT-MARK] Found employee:', employee);

      let checkInTime = null;
      
      if (status === 'Present' || status === 'Late') {
        if (time) {
          const [hours, minutes] = time.split(':');
          checkInTime = new Date(targetDate);
          checkInTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          checkInTime = new Date(`${targetDate}T09:00:00`);
        }
      }

      const attendanceData = {
        employee: employee._id || employee.id,
        date: targetDate,
        status: status === 'Leave' ? 'On Leave' : status,
        checkIn: checkInTime,
        checkOut: null,
      };

      console.log('[AT-MARK] Sending to API:', attendanceData);

      const response = await attendanceAPI.create(attendanceData);
      
      const saved = (response as any)?.data || response;
      const mapped = mapBackendRecord(saved);
      console.log('[AT-MARK] Mapped record:', mapped);

      setAttendanceRecords((prev: AttendanceRecord[]) => {
        if (existingIndex >= 0) {
          const copy = [...prev];
          copy[existingIndex] = mapped;
          console.log('[AT-MARK] Updated existing record at index', existingIndex);
          return copy;
        }
        console.log('[AT-MARK] Adding new record');
        return [...prev, mapped];
      });

      toast.success(`${employee.name} marked as ${status}`);

      // Reload to sync with backend and ensure aggregation stats stay current
      console.log('[AT-MARK] Reloading data from backend...');
      setTimeout(() => {
        loadAttendance();
      }, 800);
    } catch (error: any) {
      console.error('[AT-MARK] Failed to mark attendance:', error);
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(employeeKey);
        return next;
      });
    }
  };

  const getAttendanceForDate = (employeeId: string | number, date: string) => {
    const employeeKey = normalizeId(employeeId);
    return attendanceRecords.find(r => normalizeId(r.employeeId) === employeeKey && r.date === date);
  };

  const openTimeModal = (employee: Employee, status: AttendanceRecord['status'], type: 'checkin' | 'checkout', date?: string) => {
    setSelectedEmployeeForTime(employee);
    setSelectedStatus(status);
    setTimeModalType(type);
    const now = new Date();
    setCustomTime(now.toTimeString().slice(0, 5));
    setCustomDate(date || selectedDate);
    setShowTimeModal(true);
  };

  const handleTimeModalSubmit = () => {
    if (timeModalType === 'checkin' && selectedEmployeeForTime) {
      toggleAttendance(selectedEmployeeForTime.id, selectedStatus, customTime, customDate);
    } else if (timeModalType === 'checkout' && selectedEmployeeForTime) {
      markCheckout(selectedEmployeeForTime.id, customTime, customDate);
    }
    setShowTimeModal(false);
  };

  const calculateMonthlyStats = (employeeId: string | number) => {
    const employeeKey = normalizeId(employeeId);
    const currentMonth = selectedDate.substring(0, 7);
    const monthRecords = attendanceRecords.filter(
      r => normalizeId(r.employeeId) === employeeKey && r.date.startsWith(currentMonth)
    );

    const present = monthRecords.filter(r => r.status === 'Present').length;
    const absent = monthRecords.filter(r => r.status === 'Absent').length;
    const late = monthRecords.filter(r => r.status === 'Late').length;
    const leave = monthRecords.filter(r => r.status === 'Leave').length;

    return { present, absent, late, leave, total: monthRecords.length };
  };

  const markCheckout = async (employeeId: string | number, time?: string, date?: string) => {
    const employeeKey = normalizeId(employeeId);
    setPendingIds(prev => new Set(prev).add(employeeKey));
    try {
      const targetDate = date || selectedDate;
      const employee = employees.find(
        e => normalizeId(e.id) === employeeKey || normalizeId(e._id) === employeeKey
      );
      if (!employee) throw new Error('Employee not found');

      let checkOutTime = new Date();
      
      if (time) {
        const [hours, minutes] = time.split(':');
        checkOutTime = new Date(targetDate);
        checkOutTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      try {
        await attendanceAPI.checkOut(String(employee._id || employee.id), targetDate, undefined, checkOutTime.toISOString());
      } catch (err) {
        // Fallback: locate the record and update checkOut by id
        const res: any = await attendanceAPI.getAll(1, 50, {
          employeeId: String(employee._id || employee.id),
          startDate: targetDate,
          endDate: targetDate,
        });
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const target = items.find((a: any) => !a.checkOut);
        if (!target) throw err;
        await attendanceAPI.update(String(target._id || target.id), { checkOut: checkOutTime.toISOString() });
      }

      // Optimistic update
      setAttendanceRecords(prev => prev.map(r => {
        if (r.date === targetDate && normalizeId(r.employeeId) === employeeKey) {
          return { ...r, checkOut: formatTime(checkOutTime) || new Date().toLocaleTimeString() };
        }
        return r;
      }));

      toast.success('Checked out successfully');

      // Reload to ensure data is synced
      setTimeout(() => {
        loadAttendance();
      }, 800);
    } catch (error: any) {
      console.error('[AT-CHECKOUT] Failed:', error);
      toast.error(error.message || 'Failed to check out');
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(employeeKey);
        return next;
      });
    }
  };

  const getDailyStats = () => {
    const dayRecords = attendanceRecords.filter(r => r.date === selectedDate);
    return {
      present: dayRecords.filter(r => r.status === 'Present').length,
      absent: dayRecords.filter(r => r.status === 'Absent').length,
      late: dayRecords.filter(r => r.status === 'Late').length,
      leave: dayRecords.filter(r => r.status === 'Leave').length,
    };
  };

  const stats = getDailyStats();

  // Filter and sort employees based on search and filter criteria
  const filteredAndSortedEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
    
    if (statusFilter === 'All') {
      return matchesSearch && matchesDept;
    }
    
    const attendance = getAttendanceForDate(emp.id, selectedDate);
    const matchesStatus = attendance?.status === statusFilter || (!attendance && statusFilter === 'Not marked');
    return matchesSearch && matchesDept && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return a.department.localeCompare(b.department);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredAndSortedEmployees.slice(startIndex, endIndex);

  const handleExportReport = () => {
    try {
      // Prepare data for export
      const exportData: any[] = [];

      if (viewMode === 'daily') {
        // Daily export
        exportData.push(['Attendance Report - Daily']);
        exportData.push(['Date: ' + new Date(selectedDate).toLocaleDateString()]);
        exportData.push([]);
        exportData.push(['Employee', 'Position', 'Department', 'Status', 'Check-In', 'Check-Out']);

        employees.forEach(emp => {
          const record = getAttendanceForDate(emp.id, selectedDate);
          exportData.push([
            emp.name,
            emp.position,
            emp.department,
            record?.status || 'No Record',
            record?.checkIn || '-',
            record?.checkOut || '-',
          ]);
        });

        exportData.push([]);
        exportData.push(['Summary']);
        exportData.push(['Present', stats.present]);
        exportData.push(['Absent', stats.absent]);
        exportData.push(['Late', stats.late]);
        exportData.push(['On Leave', stats.leave]);
      } else {
        // Monthly export
        exportData.push(['Attendance Report - Monthly']);
        exportData.push(['Month: ' + selectedDate.substring(0, 7)]);
        exportData.push([]);

        // Create header row with dates
        const monthStart = new Date(selectedDate.substring(0, 7) + '-01');
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        const daysInMonth = monthEnd.getDate();

        const header = ['Employee', 'Position', 'Department'];
        for (let i = 1; i <= daysInMonth; i++) {
          header.push(i.toString());
        }
        header.push('Total Present', 'Total Absent', 'Total Late', 'Total Leave');
        exportData.push(header);

        // Add employee data
        employees.forEach(emp => {
          const row: (string | number)[] = [emp.name, emp.position, emp.department];
          const monthStats = calculateMonthlyStats(emp.id);

          for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = selectedDate.substring(0, 8) + (i < 10 ? '0' : '') + i;
            const record = getAttendanceForDate(emp.id, dateStr);
            row.push(record?.status?.charAt(0) || '-'); // First letter of status
          }

          row.push(monthStats.present, monthStats.absent, monthStats.late, monthStats.leave);
          exportData.push(row);
        });
      }

      // Create CSV content
      let csvContent = 'data:text/csv;charset=utf-8,';
      exportData.forEach(row => {
        csvContent += row.map((cell: any) => {
          // Escape quotes and wrap in quotes if contains comma or quotes
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return '"' + cell.replace(/"/g, '""') + '"';
          }
          return cell;
        }).join(',') + '\n';
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      
      // Create filename with date
      const dateStr = viewMode === 'daily' ? selectedDate : selectedDate.substring(0, 7);
      link.setAttribute('download', `attendance_${viewMode}_${dateStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Attendance report exported successfully`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => {
                  const next = e.target.value;
                  setSelectedDate(next > today ? today : next);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">View Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'daily'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'monthly'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      {viewMode === 'daily' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search by name/position/department */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Search</label>
              <input
                type="text"
                placeholder="Name, position, or department..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Departments</option>
                {[...new Set(employees.map(e => e.department))].map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
                <option value="Not marked">Not marked</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Name</option>
                <option value="department">Department</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || departmentFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('All');
                setStatusFilter('All');
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          )}

          {/* Results Counter */}
          <p className="text-sm text-gray-600">
            Showing {paginatedEmployees.length} of {filteredAndSortedEmployees.length} employees
          </p>
        </div>
      )}

      {/* Stats */}
      {viewMode === 'daily' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-gray-700">Present</p>
            </div>
            <p className="text-green-600">{stats.present}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-gray-700">Absent</p>
            </div>
            <p className="text-red-600">{stats.absent}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-gray-700">Late</p>
            </div>
            <p className="text-yellow-600">{stats.late}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <p className="text-gray-700">On Leave</p>
            </div>
            <p className="text-blue-600">{stats.leave}</p>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-gray-700">Employee</th>
                <th className="text-left px-6 py-4 text-gray-700">Department</th>
                {viewMode === 'daily' ? (
                  <>
                    <th className="text-left px-6 py-4 text-gray-700">Status</th>
                    <th className="text-left px-6 py-4 text-gray-700">Check In</th>
                    <th className="text-left px-6 py-4 text-gray-700">Check Out</th>
                    <th className="text-left px-6 py-4 text-gray-700">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="text-center px-6 py-4 text-gray-700">Present</th>
                    <th className="text-center px-6 py-4 text-gray-700">Absent</th>
                    <th className="text-center px-6 py-4 text-gray-700">Late</th>
                    <th className="text-center px-6 py-4 text-gray-700">Leave</th>
                    <th className="text-center px-6 py-4 text-gray-700">Rate</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEmployees.map((employee) => {
                const attendance = getAttendanceForDate(employee.id, selectedDate);
                const isPending = pendingIds.has(normalizeId(employee.id));
                const monthlyStats = calculateMonthlyStats(employee.id);
                const attendanceRate = monthlyStats.total > 0
                  ? ((monthlyStats.present + monthlyStats.late) / monthlyStats.total * 100).toFixed(1)
                  : '0';

                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{employee.name}</p>
                        <p className="text-gray-500">{employee.position}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{employee.department}</td>
                    
                    {viewMode === 'daily' ? (
                      <>
                        <td className="px-6 py-4">
                          {attendance ? (
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(attendance.status)}`}>
                              {getStatusIcon(attendance.status)}
                              <span>{attendance.status}</span>
                              {attendance.checkIn && (
                                <span className="opacity-75">• {attendance.checkIn}</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not marked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {attendance?.checkIn || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {attendance?.checkOut || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap items-center">
                            {!attendance && (
                              <>
                                <button
                                  onClick={() => openTimeModal(employee, 'Present', 'checkin')}
                                  disabled={!!attendance || isPending}
                                  className={`px-3 py-1 rounded transition-colors ${
                                    attendance || isPending
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => toggleAttendance(employee.id, 'Absent')}
                                  disabled={!!attendance || isPending}
                                  className={`px-3 py-1 rounded transition-colors ${
                                    attendance || isPending
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                >
                                  Absent
                                </button>
                                <button
                                  onClick={() => openTimeModal(employee, 'Late', 'checkin')}
                                  disabled={!!attendance || isPending}
                                  className={`px-3 py-1 rounded transition-colors ${
                                    attendance || isPending
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  }`}
                                >
                                  Late
                                </button>
                                <button
                                  onClick={() => toggleAttendance(employee.id, 'Leave')}
                                  disabled={!!attendance || isPending}
                                  className={`px-3 py-1 rounded transition-colors ${
                                    attendance || isPending
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  Leave
                                </button>
                              </>
                            )}

                            {attendance && !attendance.checkOut && (attendance.status === 'Present' || attendance.status === 'Late') && (
                              <button
                                onClick={() => openTimeModal(employee, attendance.status, 'checkout')}
                                disabled={isPending}
                                className={`px-3 py-1 rounded transition-colors ${
                                  isPending
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-slate-800 text-white hover:bg-slate-900'
                                }`}
                              >
                                Check Out
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-center text-green-600">
                          {monthlyStats.present}
                        </td>
                        <td className="px-6 py-4 text-center text-red-600">
                          {monthlyStats.absent}
                        </td>
                        <td className="px-6 py-4 text-center text-yellow-600">
                          {monthlyStats.late}
                        </td>
                        <td className="px-6 py-4 text-center text-blue-600">
                          {monthlyStats.leave}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full ${
                            parseFloat(attendanceRate) >= 95 ? 'bg-green-100 text-green-800' :
                            parseFloat(attendanceRate) >= 85 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {attendanceRate}%
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {viewMode === 'daily' && filteredAndSortedEmployees.length > itemsPerPage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedEmployees.length)} of {filteredAndSortedEmployees.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const diff = Math.abs(page - currentPage);
                  return diff <= 2 || page === 1 || page === totalPages;
                })
                .map((page, index, arr) => {
                  if (index > 0 && arr[index - 1] !== page - 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-2 py-2 text-gray-600">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Time Selection Modal */}
      {showTimeModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" 
          style={{ backdropFilter: 'blur(2px)' }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {timeModalType === 'checkin' ? 'Select Check-In Time' : 'Select Check-Out Time'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowTimeModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTimeModalSubmit}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
