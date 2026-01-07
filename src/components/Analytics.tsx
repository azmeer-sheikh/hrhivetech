import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, BarChart3 } from 'lucide-react';

interface Employee {
  id: number | string;
  name: string;
  department: string;
  salary: number;
  joinDate: string;
  status: string;
}

interface AttendanceRecord {
  employeeId: number | string;
  date: string;
  status: string;
}

interface AnalyticsProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
}

export function Analytics({ employees, attendanceRecords }: AnalyticsProps) {
  // Department Distribution
  const departmentData = (employees || []).reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentChartData = Object.entries(departmentData).map(([name, value]) => ({
    name,
    value,
  }));

  // Monthly Salary Trend by Department
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: Math.floor(Math.random() * 2000000) + 3000000, // Mock data
    };
  });

  // Attendance Trend (Last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const attendanceTrendData = last7Days.map(date => {
    const dayRecords = attendanceRecords.filter(r => r.date === date);
    const present = dayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const absent = dayRecords.filter(r => r.status === 'Absent').length;
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      present,
      absent,
    };
  });

  // Employee Status Distribution
  const statusData = employees.reduce((acc, emp) => {
    const status = emp.status || 'Active';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value,
  }));

  // Salary Distribution by Department
  const salaryByDept = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    if (!acc[dept]) {
      acc[dept] = { total: 0, count: 0 };
    }
    acc[dept].total += emp.salary || 0;
    acc[dept].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const salaryDistributionData = Object.entries(salaryByDept).map(([department, data]) => ({
    department,
    average: Math.round(data.total / data.count),
  }));

  const totalEmployees = employees.length;
  const totalPayroll = Object.values(salaryByDept).reduce((sum, entry) => sum + (entry.total || 0), 0);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Analytics & Reports</h1>
        <p className="text-gray-500">Insights and trends across your organization</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8" />
            <div>
              <p className="opacity-90">Total Employees</p>
              <h3 className="text-white">{employees.length}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <TrendingUp className="w-4 h-4" />
            <span>Active workforce</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-8 h-8" />
            <div>
              <p className="opacity-90">Avg. Salary</p>
              <h3 className="text-white">
                PKR {employees.length > 0 
                  ? Math.round(employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length).toLocaleString()
                  : 0}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <TrendingUp className="w-4 h-4" />
            <span>Per employee/month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8" />
            <div>
              <p className="opacity-90">Departments</p>
              <h3 className="text-white">{departmentChartData.length}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <TrendingUp className="w-4 h-4" />
            <span>Active departments</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8" />
            <div>
              <p className="opacity-90">Attendance Rate</p>
              <h3 className="text-white">
                {attendanceRecords.length > 0
                  ? Math.round((attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length / attendanceRecords.length) * 100)
                  : 0}%
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <TrendingUp className="w-4 h-4" />
            <span>Overall average</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-4">Employee Distribution by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-4">Employee Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-4">Attendance Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" strokeWidth={2} />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-4">Average Salary by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip formatter={(value) => `PKR ${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="average" fill="#8b5cf6" name="Avg. Salary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payroll Trend */}
      {monthlyData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-4">Monthly Payroll Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `PKR ${value.toLocaleString()}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                name="Total Payroll" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Department Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-gray-900">Department Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-gray-700">Department</th>
                <th className="text-left px-6 py-4 text-gray-700">Employees</th>
                <th className="text-left px-6 py-4 text-gray-700">Avg. Salary</th>
                <th className="text-left px-6 py-4 text-gray-700">Total Payroll</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salaryDistributionData.map((dept, index) => {
                const deptInfo = salaryByDept[dept.department];
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{dept.department}</td>
                    <td className="px-6 py-4 text-gray-600">{deptInfo.count}</td>
                    <td className="px-6 py-4 text-gray-600">PKR {dept.average.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-900">PKR {deptInfo.total.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-800">
          <span className="font-medium">Total Employees: {totalEmployees}</span>
          <span className="font-medium">Total Payroll: PKR {totalPayroll.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}