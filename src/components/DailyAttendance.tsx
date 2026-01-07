import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Coffee, Search, Calendar as CalendarIcon, Users, Lock, Eye, EyeOff, Download, Filter, TrendingUp } from 'lucide-react';
import { Pagination } from './Pagination';
import { attendanceAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

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
  markedAt?: string;
}

interface DailyAttendanceProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
}

const ATTENDANCE_PASSWORD = 'hivetech2024';

export function DailyAttendance({ employees, attendanceRecords, setAttendanceRecords }: DailyAttendanceProps) {
  const { isAuthenticated } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'marked' | 'unmarked'>('all');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'status'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid
  const [loading, setLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

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
    date: record?.date ? String(record.date).split('T')[0] : selectedDate,
    status: record?.status === 'On Leave' ? 'Leave' : record?.status,
    checkIn: formatTime(record?.checkIn),
    checkOut: formatTime(record?.checkOut),
    markedAt: record?.createdAt,
  });

  // Load attendance from backend
  const loadAttendance = async (dateToLoad?: string) => {
    try {
      setLoading(true);
      const dateForQuery = dateToLoad || selectedDate;
      console.log('[LOAD] Fetching attendance for date:', dateForQuery);
      
      const response = await attendanceAPI.getAll(1, 1000, {
        startDate: dateForQuery,
        endDate: dateForQuery
      });

      console.log('[LOAD] Raw attendance response:', response);

      // Map backend data to frontend format
      const data = response?.data || response || [];
      const mappedRecords = (Array.isArray(data) ? data : []).map(mapBackendRecord);

      console.log('[LOAD] Mapped attendance records:', mappedRecords);
      // Replace only this date's records to keep other dates intact
      setAttendanceRecords(prev => {
        const filtered = prev.filter(r => r.date !== dateForQuery);
        return [...filtered, ...mappedRecords];
      });
      
      console.log('[LOAD] State updated successfully');
    } catch (error) {
      console.error('[LOAD] Failed to load attendance:', error);
      // Don't show error toast to avoid spam
    } finally {
      setLoading(false);
    }
  };

  // Load attendance on mount and when date/auth changes
  useEffect(() => {
    if (isAuthenticated && isPasswordAuthenticated) {
      console.log('Loading attendance data for:', selectedDate);
      loadAttendance(selectedDate).finally(() => {
        // Clear pending IDs after any load (success or error)
        setPendingIds(new Set());
      });
    }
  }, [isAuthenticated, isPasswordAuthenticated, selectedDate]);

  // Auto-absent notice only (do not auto-lock records on frontend)
  // Previously this auto-marked unmarked employees as Absent at 9 PM,
  // which caused records to lock without user action. We now avoid
  // mutating state here and leave any auto-processing to the backend.
  // If needed later, we can show a warning banner or trigger a refresh.

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ATTENDANCE_PASSWORD) {
      setIsPasswordAuthenticated(true);
      setPasswordError('');
      // Load attendance data after password authentication
      setTimeout(() => loadAttendance(selectedDate), 100);
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const markAttendance = async (employeeId: number | string, status: AttendanceRecord['status']) => {
    const employeeKey = normalizeId(employeeId);

    // Mark as pending IMMEDIATELY before any async work
    setPendingIds(prev => new Set(prev).add(employeeKey));
    
    try {
      const now = new Date();
      
      // Find the employee
      const employee = employees.find(
        e => normalizeId(e.id) === employeeKey || normalizeId(e._id) === employeeKey
      );
      
      if (!employee) {
        toast.error('Employee not found');
        setPendingIds(prev => {
          const next = new Set(prev);
          next.delete(employeeKey);
          return next;
        });
        return;
      }

      // Set check-in time based on status
      let checkInTime = null;
      
      if (status === 'Present' || status === 'Late') {
        checkInTime = now;
      }

      // Use _id if available, otherwise use id (for mock data compatibility)
      const employeeIdForBackend = employee._id || employee.id;
      
      if (!employeeIdForBackend) {
        console.error('Employee has no valid ID:', employee);
        toast.error('Invalid employee ID');
        setPendingIds(prev => {
          const next = new Set(prev);
          next.delete(employeeKey);
          return next;
        });
        return;
      }

      const attendanceData = {
        employee: employeeIdForBackend,
        date: selectedDate,
        status: status === 'Leave' ? 'On Leave' : status,
        checkIn: checkInTime,
        checkOut: null,
      };
      
      console.log('[MARK] Employee found:', employee.name);
      console.log('[MARK] Employee ID for backend:', employeeIdForBackend);
      console.log('[MARK] Sending attendance data:', attendanceData);

      // Show loading toast
      const toastId = toast.loading(`Marking ${employee.name} as ${status}...`);

      // Create in backend
      const response = await attendanceAPI.create(attendanceData);
      
      console.log('[MARK] Attendance API response:', response);

      // Update local state with the response data
      const employeeRecordId = normalizeId(employee._id || employee.id);
      const newRecord: AttendanceRecord = {
        employeeId: employeeRecordId,
        date: selectedDate,
        status,
        checkIn: status === 'Present' || status === 'Late' ? getCurrentTime() : undefined,
        checkOut: undefined,
        markedAt: new Date().toISOString(),
      };

      // Upsert parent state (App.tsx) with new record - buttons stay disabled until reload
      setAttendanceRecords(prev => {
        const filtered = prev.filter(r => !(r.date === selectedDate && normalizeId(r.employeeId) === employeeKey));
        return [...filtered, newRecord];
      });
      
      // Dismiss loading toast
      toast.dismiss(toastId);
      toast.success(`${employee.name} marked as ${status}`);
      
      console.log('[MARK] Attendance marked locally:', newRecord);
      
      // Reload from backend after delay to ensure data is persisted
      setTimeout(async () => {
        console.log('[MARK] Reloading attendance data from backend after mark...');
        try {
          await loadAttendance(selectedDate);
          console.log('[MARK] Reload successful, clearing pending state');
          // Clear pending AFTER reload confirms data
          setPendingIds(prev => {
            const next = new Set(prev);
            next.delete(employeeKey);
            return next;
          });
        } catch (reloadError) {
          console.error('[MARK] Reload failed:', reloadError);
          // Clear pending on error too
          setPendingIds(prev => {
            const next = new Set(prev);
            next.delete(employeeKey);
            return next;
          });
        }
      }, 1000);
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      toast.error(error.message || 'Failed to mark attendance. Please try again.');
      // Clear pending on error so user can retry
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(employeeKey);
        return next;
      });
    }
    // NOTE: Do NOT clear pending here - let the reload response clear it
    // This keeps button disabled until data is confirmed from backend
  };

  const markAllPresent = async () => {
    if (!confirm('Mark all unmarked employees as Present for ' + selectedDate + '?')) return;
    
    const unmarkedEmployees = employees.filter(emp => 
      !attendanceRecords.some(r => String(r.employeeId) === String(emp.id) && r.date === selectedDate)
    );

    if (unmarkedEmployees.length === 0) {
      toast.info('All employees are already marked');
      return;
    }

    try {
      const now = new Date();
      let successCount = 0;
      
      // Create records in backend
      for (const emp of unmarkedEmployees) {
        try {
          await attendanceAPI.create({
            employee: emp._id || emp.id,
            date: selectedDate,
            status: 'Present',
            checkIn: now,
            checkOut: null,
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to mark ${emp.name}:`, err);
        }
      }

      const newRecords = unmarkedEmployees.map(emp => ({
        employeeId: String(emp.id),
        date: selectedDate,
        status: 'Present' as const,
        checkIn: getCurrentTime(),
        checkOut: undefined,
        markedAt: new Date().toISOString(),
      }));

      setAttendanceRecords([...attendanceRecords, ...newRecords]);
      
      toast.success(`Marked ${successCount} employees as Present`);
      
      // Reload to sync with backend
      await loadAttendance(selectedDate);
    } catch (error: any) {
      console.error('Failed to mark all present:', error);
      toast.error(error.message || 'Failed to mark all present');
    }
  };

  const markAllAbsent = async () => {
    if (!confirm('Mark all unmarked employees as Absent for ' + selectedDate + '?')) return;
    
    const unmarkedEmployees = employees.filter(emp => 
      !attendanceRecords.some(r => String(r.employeeId) === String(emp.id) && r.date === selectedDate)
    );

    if (unmarkedEmployees.length === 0) {
      toast.info('All employees are already marked');
      return;
    }

    try {
      let successCount = 0;
      
      // Create records in backend
      for (const emp of unmarkedEmployees) {
        try {
          await attendanceAPI.create({
            employee: emp._id || emp.id,
            date: selectedDate,
            status: 'Absent',
            checkIn: null,
            checkOut: null,
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to mark ${emp.name}:`, err);
        }
      }

      const newRecords = unmarkedEmployees.map(emp => ({
        employeeId: String(emp.id),
        date: selectedDate,
        status: 'Absent' as const,
        markedAt: new Date().toISOString(),
      }));

      setAttendanceRecords([...attendanceRecords, ...newRecords]);
      
      toast.success(`Marked ${successCount} employees as Absent`);
      
      // Reload to sync with backend
      await loadAttendance(selectedDate);
    } catch (error: any) {
      console.error('Failed to mark all absent:', error);
      toast.error(error.message || 'Failed to mark all absent');
    }
  };

  const exportToCSV = () => {
    const selectedDateRecords = attendanceRecords.filter(r => r.date === selectedDate);
    const csvData = [
      ['Name', 'Department', 'Position', 'Status', 'Check In', 'Marked At'],
      ...selectedDateRecords.map(record => {
        const emp = employees.find(e => String(e.id) === String(record.employeeId) || String(e._id) === String(record.employeeId));
        return [
          emp?.name || '',
          emp?.department || '',
          emp?.position || '',
          record.status,
          record.checkIn || 'N/A',
          new Date(record.markedAt || '').toLocaleString()
        ];
      })
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
  };

  const getTodayAttendance = (employeeId: number | string) => {
    // Check attendance by numeric id, _id, or string comparison
    return attendanceRecords.find(r => {
      const rEmpId = normalizeId(r.employeeId);
      const numId = normalizeId(employeeId);
      return rEmpId === numId && r.date === selectedDate;
    });
  };

  const departments = ['all', ...new Set(employees.map(e => e.department))];

  let filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    
    const attendance = getTodayAttendance(emp.id);
    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'marked' ? !!attendance :
      filterStatus === 'unmarked' ? !attendance : true;
    
    return matchesSearch && matchesDept && matchesFilter;
  });

  // Sort employees
  filteredEmployees = filteredEmployees.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'department') return a.department.localeCompare(b.department);
    if (sortBy === 'status') {
      const aStatus = getTodayAttendance(a.id)?.status || 'Unmarked';
      const bStatus = getTodayAttendance(b.id)?.status || 'Unmarked';
      return aStatus.localeCompare(bStatus);
    }
    return 0;
  });

  const todayStats = {
    total: employees.length,
    present: attendanceRecords.filter(r => r.date === selectedDate && r.status === 'Present').length,
    late: attendanceRecords.filter(r => r.date === selectedDate && r.status === 'Late').length,
    absent: attendanceRecords.filter(r => r.date === selectedDate && r.status === 'Absent').length,
    leave: attendanceRecords.filter(r => r.date === selectedDate && r.status === 'Leave').length,
    unmarked: employees.length - attendanceRecords.filter(r => r.date === selectedDate).length,
  };

  const attendanceRate = ((todayStats.present + todayStats.late) / todayStats.total * 100).toFixed(1);

  // Password Protection Screen
  if (!isPasswordAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 !text-blue-400" />
            </div>
          </div>
          
          <h2 className="!text-gray-900 text-center !mb-3">Daily Attendance</h2>
          <p className="!text-gray-600 text-center !mb-10">Enter password to access attendance marking</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-3">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 !text-gray-400 hover:!text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="!text-red-600 !mt-3 text-sm">{passwordError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 !text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium text-base"
            >
              Access Attendance
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm !text-gray-700 !mb-2"><strong>USA Night Shift Hours:</strong></p>
            <p className="text-sm !text-gray-600 !mb-0">7:00 PM - 4:00 AM PKT</p>
            <p className="text-sm !text-gray-600 !mt-3 !mb-0"><strong>Auto-Absent:</strong> Unmarked at 9:00 PM</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <CalendarIcon className="w-6 h-6 !text-white" />
            </div>
            <div>
              <h1 className="!text-gray-900 !mb-1">Daily Attendance</h1>
              <p className="!text-gray-600 !mb-0 text-sm">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={todayStats.total === todayStats.unmarked}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 !text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setIsPasswordAuthenticated(false)}
              className="px-4 py-2 bg-gray-100 !text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg !mb-6">
          <Clock className="w-5 h-5 !text-blue-700" />
          <div>
            <p className="text-sm font-medium !text-blue-900 !mb-0">USA Night Shift: 7:00 PM - 4:00 AM PKT • Auto-absent at 9:00 PM</p>
          </div>
        </div>

        {/* Date Picker */} 
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium !text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentPage(1); // Reset pagination when date changes
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <button
            onClick={() => {
              setSelectedDate(today);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-blue-100 !text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            Today
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-xs !text-gray-600 !mb-1">Total</p>
            <p className="!text-2xl font-bold !text-gray-900 !mb-0">{todayStats.total}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-xs !text-emerald-700 !mb-1">Present</p>
            <p className="!text-2xl font-bold !text-emerald-700 !mb-0">{todayStats.present}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p className="text-xs !text-amber-700 !mb-1">Late</p>
            <p className="!text-2xl font-bold !text-amber-700 !mb-0">{todayStats.late}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-xs !text-red-700 !mb-1">Absent</p>
            <p className="!text-2xl font-bold !text-red-700 !mb-0">{todayStats.absent}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs !text-blue-700 !mb-1">Leave</p>
            <p className="!text-2xl font-bold !text-blue-700 !mb-0">{todayStats.leave}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs !text-gray-600 !mb-1">Unmarked</p>
            <p className="!text-2xl font-bold !text-gray-900 !mb-0">{todayStats.unmarked}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-xs !text-purple-700 !mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Rate
            </p>
            <p className="!text-2xl font-bold !text-purple-700 !mb-0">{attendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 !text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-w-[200px]"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="marked">Marked</option>
            <option value="unmarked">Unmarked</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-w-[150px]"
          >
            <option value="name">Sort by Name</option>
            <option value="department">Sort by Dept</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Removed Mark All buttons as per requirement */}
        </div>
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((employee) => {
          const attendance = getTodayAttendance(employee.id);
          const isMarked = !!attendance;
          const isPending = pendingIds.has(normalizeId(employee.id));

          return (
            <div
              key={employee.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6 space-y-4">
                {/* Employee Info */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                    {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="!text-gray-900 !mb-1 truncate">{employee.name}</h4>
                    <p className="text-sm !text-gray-600 !mb-0.5 truncate">{employee.position}</p>
                    <p className="text-xs !text-gray-500 !mb-0 truncate">{employee.department}</p>
                  </div>
                </div>

                {/* Status Badge */}
                {attendance ? (
                  <div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        attendance.status === 'Present'
                          ? 'bg-emerald-50 !text-emerald-700 border border-emerald-200'
                          : attendance.status === 'Late'
                          ? 'bg-amber-50 !text-amber-700 border border-amber-200'
                          : attendance.status === 'Absent'
                          ? 'bg-red-50 !text-red-700 border border-red-200'
                          : 'bg-blue-50 !text-blue-700 border border-blue-200'
                      }`}
                    >
                      {attendance.status === 'Present' && <CheckCircle className="w-4 h-4" />}
                      {attendance.status === 'Late' && <Clock className="w-4 h-4" />}
                      {attendance.status === 'Absent' && <XCircle className="w-4 h-4" />}
                      {attendance.status === 'Leave' && <Coffee className="w-4 h-4" />}
                      <span>{attendance.status}</span>
                      {attendance.checkIn && (
                        <span className="ml-1 opacity-75">• {attendance.checkIn}</span>
                      )}
                    </div>
                    <p className="text-xs !text-gray-500 !mt-2 !mb-0">✓ Marked (tap to update)</p>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 !text-gray-600 border border-gray-200 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Not Marked</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => markAttendance(employee.id, 'Present')}
                    disabled={isPending || !!attendance}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isPending || !!attendance
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 !text-white hover:bg-emerald-700'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => markAttendance(employee.id, 'Absent')}
                    disabled={isPending || !!attendance}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isPending || !!attendance
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 !text-white hover:bg-red-700'
                    }`}
                  >
                    Absent
                  </button>
                  <button
                    onClick={() => markAttendance(employee.id, 'Late')}
                    disabled={isPending || !!attendance}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isPending || !!attendance
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-amber-600 !text-white hover:bg-amber-700'
                    }`}
                  >
                    Late
                  </button>
                  <button
                    onClick={() => markAttendance(employee.id, 'Leave')}
                    disabled={isPending || !!attendance}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isPending || !!attendance
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 !text-white hover:bg-blue-700'
                    }`}
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <Users className="w-16 h-16 !text-gray-300 mx-auto !mb-4" />
          <p className="!text-gray-500 text-lg !mb-0">No employees found</p>
        </div>
      )}

      {/* Pagination */}
      {filteredEmployees.length > 0 && (
        <Pagination
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredEmployees.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}