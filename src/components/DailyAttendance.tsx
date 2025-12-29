import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Coffee, Search, Calendar as CalendarIcon, Users, Lock, Eye, EyeOff, Download, Filter, TrendingUp } from 'lucide-react';
import { Pagination } from './Pagination';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
}

interface AttendanceRecord {
  employeeId: number;
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
  const today = new Date().toISOString().split('T')[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'marked' | 'unmarked'>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'status'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Auto-mark absent at 9 PM
  useEffect(() => {
    const checkAndMarkAbsent = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Check if it's 9 PM (21:00)
      if (currentHour === 21) {
        const unmarkedEmployees = employees.filter(emp => 
          !attendanceRecords.some(r => r.employeeId === emp.id && r.date === today)
        );

        if (unmarkedEmployees.length > 0) {
          const absentRecords = unmarkedEmployees.map(emp => ({
            employeeId: emp.id,
            date: today,
            status: 'Absent' as const,
            markedAt: new Date().toISOString(),
          }));

          setAttendanceRecords([...attendanceRecords, ...absentRecords]);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkAndMarkAbsent, 60000);
    checkAndMarkAbsent(); // Check immediately

    return () => clearInterval(interval);
  }, [employees, attendanceRecords, today, setAttendanceRecords]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ATTENDANCE_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const markAttendance = (employeeId: number, status: AttendanceRecord['status']) => {
    const existingRecord = attendanceRecords.find(
      r => r.employeeId === employeeId && r.date === today
    );

    // Check if already marked today
    if (existingRecord) {
      alert('Attendance already marked for today. Cannot change once marked.');
      return;
    }

    const newRecord: AttendanceRecord = {
      employeeId,
      date: today,
      status,
      checkIn: status === 'Present' || status === 'Late' ? getCurrentTime() : undefined,
      checkOut: undefined,
      markedAt: new Date().toISOString(),
    };

    setAttendanceRecords([...attendanceRecords, newRecord]);
  };

  const markAllPresent = () => {
    if (!confirm('Mark all unmarked employees as Present?')) return;
    
    const unmarkedEmployees = employees.filter(emp => 
      !attendanceRecords.some(r => r.employeeId === emp.id && r.date === today)
    );

    const newRecords = unmarkedEmployees.map(emp => ({
      employeeId: emp.id,
      date: today,
      status: 'Present' as const,
      checkIn: getCurrentTime(),
      checkOut: undefined,
      markedAt: new Date().toISOString(),
    }));

    setAttendanceRecords([...attendanceRecords, ...newRecords]);
  };

  const markAllAbsent = () => {
    if (!confirm('Mark all unmarked employees as Absent?')) return;
    
    const unmarkedEmployees = employees.filter(emp => 
      !attendanceRecords.some(r => r.employeeId === emp.id && r.date === today)
    );

    const newRecords = unmarkedEmployees.map(emp => ({
      employeeId: emp.id,
      date: today,
      status: 'Absent' as const,
      markedAt: new Date().toISOString(),
    }));

    setAttendanceRecords([...attendanceRecords, ...newRecords]);
  };

  const exportToCSV = () => {
    const todayRecords = attendanceRecords.filter(r => r.date === today);
    const csvData = [
      ['Name', 'Department', 'Position', 'Status', 'Check In', 'Marked At'],
      ...todayRecords.map(record => {
        const emp = employees.find(e => e.id === record.employeeId);
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
    a.download = `attendance-${today}.csv`;
    a.click();
  };

  const getTodayAttendance = (employeeId: number) => {
    return attendanceRecords.find(r => r.employeeId === employeeId && r.date === today);
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
    present: attendanceRecords.filter(r => r.date === today && r.status === 'Present').length,
    late: attendanceRecords.filter(r => r.date === today && r.status === 'Late').length,
    absent: attendanceRecords.filter(r => r.date === today && r.status === 'Absent').length,
    leave: attendanceRecords.filter(r => r.date === today && r.status === 'Leave').length,
    unmarked: employees.length - attendanceRecords.filter(r => r.date === today).length,
  };

  const attendanceRate = ((todayStats.present + todayStats.late) / todayStats.total * 100).toFixed(1);

  // Password Protection Screen
  if (!isAuthenticated) {
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
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
              onClick={() => setIsAuthenticated(false)}
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
          
          return (
            <div 
              key={employee.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                {/* Employee Info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center !text-white font-semibold text-sm flex-shrink-0">
                    {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="!text-gray-900 !mb-1 truncate">{employee.name}</h4>
                    <p className="text-sm !text-gray-600 !mb-0.5 truncate">{employee.position}</p>
                    <p className="text-xs !text-gray-500 truncate !mb-0">{employee.department}</p>
                  </div>
                </div>

                {/* Status Badge */}
                {attendance ? (
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      attendance.status === 'Present' ? 'bg-emerald-50 !text-emerald-700 border border-emerald-200' :
                      attendance.status === 'Late' ? 'bg-amber-50 !text-amber-700 border border-amber-200' :
                      attendance.status === 'Absent' ? 'bg-red-50 !text-red-700 border border-red-200' :
                      'bg-blue-50 !text-blue-700 border border-blue-200'
                    }`}>
                      {attendance.status === 'Present' && <CheckCircle className="w-4 h-4" />}
                      {attendance.status === 'Late' && <Clock className="w-4 h-4" />}
                      {attendance.status === 'Absent' && <XCircle className="w-4 h-4" />}
                      {attendance.status === 'Leave' && <Coffee className="w-4 h-4" />}
                      <span>{attendance.status}</span>
                      {attendance.checkIn && (
                        <span className="ml-1 opacity-75">• {attendance.checkIn}</span>
                      )}
                    </div>
                    <p className="text-xs !text-gray-500 !mt-2 !mb-0">✓ Marked (Locked)</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 !text-gray-600 border border-gray-200 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      <span>Not Marked</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!attendance && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => markAttendance(employee.id, 'Present')}
                      className="px-3 py-2.5 bg-emerald-600 !text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(employee.id, 'Absent')}
                      className="px-3 py-2.5 bg-red-600 !text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => markAttendance(employee.id, 'Late')}
                      className="px-3 py-2.5 bg-amber-600 !text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                    >
                      Late
                    </button>
                    <button
                      onClick={() => markAttendance(employee.id, 'Leave')}
                      className="px-3 py-2.5 bg-blue-600 !text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Leave
                    </button>
                  </div>
                )}
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