import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { attendanceAPI, employeeAPI } from '../services/api';

interface Employee {
  id: number;
  _id?: string; // MongoDB ObjectId
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [loading, setLoading] = useState(false);

  // Load attendance records from backend
  const loadAttendance = async () => {
    try {
      setLoading(true);
      const startOfMonth = selectedDate.substring(0, 8) + '01';
      const endOfMonth = new Date(selectedDate.substring(0, 7) + '-01');
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      const endDateStr = endOfMonth.toISOString().split('T')[0];

      const response = await attendanceAPI.getAll(1, 1000, {
        startDate: startOfMonth,
        endDate: endDateStr
      });

      // Map backend data to frontend format
      const mappedRecords = response.data.map((record: any) => ({
        employeeId: record.employee._id,
        date: record.date.split('T')[0],
        status: record.status === 'On Leave' ? 'Leave' : record.status,
        checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : undefined,
        checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : undefined,
      }));

      setAttendanceRecords(mappedRecords);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load attendance on mount and when date changes
  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

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

  const toggleAttendance = async (employeeId: number, status: AttendanceRecord['status']) => {
    try {
      const existingIndex = attendanceRecords.findIndex(
        r => r.employeeId === employeeId && r.date === selectedDate
      );

      const now = new Date();
      const dateTime = new Date(selectedDate);
      
      // Set check-in time
      let checkInTime = null;
      let checkOutTime = null;
      
      if (status === 'Present' || status === 'Late') {
        checkInTime = new Date(dateTime.setHours(9, 0, 0, 0));
        if (status === 'Present') {
          checkOutTime = new Date(dateTime.setHours(17, 0, 0, 0));
        }
      }

      const attendanceData = {
        employee: employees.find(e => e.id === employeeId)?._id || employeeId,
        date: selectedDate,
        status: status === 'Leave' ? 'On Leave' : status,
        checkIn: checkInTime,
        checkOut: checkOutTime,
      };

      if (existingIndex >= 0) {
        // Update existing record in backend
        const existingRecord = attendanceRecords[existingIndex];
        // Note: Need to find the _id from backend for update
        // For now, delete and recreate
        await attendanceAPI.create(attendanceData);
        
        const updated = [...attendanceRecords];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          checkIn: status === 'Present' || status === 'Late' ? '09:00 AM' : undefined,
          checkOut: status === 'Present' ? '05:00 PM' : undefined,
        };
        setAttendanceRecords(updated);
      } else {
        // Create new record in backend
        await attendanceAPI.create(attendanceData);
        
        setAttendanceRecords([
          ...attendanceRecords,
          {
            employeeId,
            date: selectedDate,
            status,
            checkIn: status === 'Present' || status === 'Late' ? '09:00 AM' : undefined,
            checkOut: status === 'Present' ? '05:00 PM' : undefined,
          },
        ]);
      }

      // Reload to sync with backend
      await loadAttendance();
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      alert(error.message || 'Failed to mark attendance');
    }
  };

  const getAttendanceForDate = (employeeId: number, date: string) => {
    return attendanceRecords.find(r => r.employeeId === employeeId && r.date === date);
  };

  const calculateMonthlyStats = (employeeId: number) => {
    const currentMonth = selectedDate.substring(0, 7);
    const monthRecords = attendanceRecords.filter(
      r => r.employeeId === employeeId && r.date.startsWith(currentMonth)
    );

    const present = monthRecords.filter(r => r.status === 'Present').length;
    const absent = monthRecords.filter(r => r.status === 'Absent').length;
    const late = monthRecords.filter(r => r.status === 'Late').length;
    const leave = monthRecords.filter(r => r.status === 'Leave').length;

    return { present, absent, late, leave, total: monthRecords.length };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Attendance Tracking</h1>
        <p className="text-gray-500">Monitor and manage employee attendance</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

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
              {employees.map((employee) => {
                const attendance = getAttendanceForDate(employee.id, selectedDate);
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
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(attendance.status)}`}>
                              {getStatusIcon(attendance.status)}
                              {attendance.status}
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleAttendance(employee.id, 'Present')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                              Present
                            </button>
                            <button
                              onClick={() => toggleAttendance(employee.id, 'Absent')}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => toggleAttendance(employee.id, 'Late')}
                              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                            >
                              Late
                            </button>
                            <button
                              onClick={() => toggleAttendance(employee.id, 'Leave')}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              Leave
                            </button>
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
    </div>
  );
}
