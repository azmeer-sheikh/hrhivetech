import { useState, useEffect, useMemo } from 'react';
import { DollarSign, Users, TrendingUp, Clock, Filter, Download, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: number;
  hourlyRate?: number;
  status: 'Active' | 'On Leave' | 'Inactive';
}

interface AttendanceRecord {
  employeeId: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  checkIn?: string;
  checkOut?: string;
}

interface LaborCostDashboardProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
}

interface ActiveEmployee {
  id: number;
  name: string;
  department: string;
  hourlyRate: number;
  clockInTime: string;
  hoursWorked: number;
  costSoFar: number;
}

export function LaborCostDashboard({ employees, attendanceRecords }: LaborCostDashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const [currentCost, setCurrentCost] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cost' | 'time' | 'name'>('cost');

  // Calculate hourly rate from monthly salary (160 hours/month)
  const getHourlyRate = (employee: Employee): number => {
    if (employee.hourlyRate) return employee.hourlyRate;
    return employee.salary / 160; // Convert monthly salary to hourly
  };

  // Get active employees (clocked in today without checkout)
  const activeEmployees = useMemo((): ActiveEmployee[] => {
    const todayRecords = attendanceRecords.filter(r => r.date === today);
    
    return todayRecords
      .filter(record => {
        // Active means: Present or Late status, has checkIn, no checkOut
        return (record.status === 'Present' || record.status === 'Late') && 
               record.checkIn && 
               !record.checkOut;
      })
      .map(record => {
        const employee = employees.find(e => e.id === record.employeeId);
        if (!employee) return null;

        const hourlyRate = getHourlyRate(employee);
        const clockInTime = record.checkIn || '';
        
        // Calculate hours worked
        const clockInDate = new Date(`${today}T${convertTo24Hour(clockInTime)}`);
        const now = new Date();
        const hoursWorked = (now.getTime() - clockInDate.getTime()) / (1000 * 60 * 60);
        const costSoFar = hoursWorked * hourlyRate;

        return {
          id: employee.id,
          name: employee.name,
          department: employee.department,
          hourlyRate,
          clockInTime,
          hoursWorked,
          costSoFar,
        };
      })
      .filter(emp => emp !== null) as ActiveEmployee[];
  }, [employees, attendanceRecords, today]);

  // Calculate burn rate and initial cost
  const { burnRatePerSecond, totalDailyCost, burnRatePerHour } = useMemo(() => {
    const totalHourlyRate = activeEmployees.reduce((sum, emp) => sum + emp.hourlyRate, 0);
    const initialCost = activeEmployees.reduce((sum, emp) => sum + emp.costSoFar, 0);
    
    return {
      burnRatePerSecond: totalHourlyRate / 3600,
      burnRatePerHour: totalHourlyRate,
      totalDailyCost: initialCost,
    };
  }, [activeEmployees]);

  // Initialize current cost on mount or when activeEmployees change
  useEffect(() => {
    setCurrentCost(totalDailyCost);
  }, [totalDailyCost]);

  // Live ticker - increment every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCost(prev => prev + burnRatePerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [burnRatePerSecond]);

  // Convert 12-hour time to 24-hour format for calculations
  function convertTo24Hour(time12h: string): string {
    try {
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      
      if (hours === '12') {
        hours = '00';
      }
      
      if (modifier?.toUpperCase() === 'PM') {
        hours = String(parseInt(hours, 10) + 12);
      }
      
      return `${hours.padStart(2, '0')}:${minutes}:00`;
    } catch {
      return '00:00:00';
    }
  }

  // Format hours and minutes
  const formatHoursMinutes = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Filter and sort active employees
  const filteredEmployees = useMemo(() => {
    let filtered = activeEmployees;

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'cost') return b.costSoFar - a.costSoFar;
      if (sortBy === 'time') return b.hoursWorked - a.hoursWorked;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return filtered;
  }, [activeEmployees, selectedDepartment, sortBy]);

  // Get unique departments
  const departments = ['all', ...new Set(employees.map(e => e.department))];

  // Calculate filtered totals
  const filteredTotals = useMemo(() => {
    const totalCost = filteredEmployees.reduce((sum, emp) => sum + emp.costSoFar, 0);
    const count = filteredEmployees.length;
    const avgHourlyRate = count > 0 ? filteredEmployees.reduce((sum, emp) => sum + emp.hourlyRate, 0) / count : 0;
    
    return { totalCost, count, avgHourlyRate };
  }, [filteredEmployees]);

  // Export to CSV
  const exportToCSV = () => {
    const csvData = [
      ['Employee Name', 'Department', 'Hourly Rate (PKR)', 'Clock-In Time', 'Hours Worked', 'Cost So Far (PKR)'],
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.department,
        emp.hourlyRate.toFixed(2),
        emp.clockInTime,
        formatHoursMinutes(emp.hoursWorked),
        emp.costSoFar.toFixed(2),
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `labor-cost-${today}.csv`;
    a.click();
  };

  // Calculate projected daily total (if all work 8 hours)
  const projectedDailyTotal = useMemo(() => {
    return activeEmployees.reduce((sum, emp) => {
      const remainingHours = Math.max(0, 8 - emp.hoursWorked);
      return sum + emp.costSoFar + (remainingHours * emp.hourlyRate);
    }, 0);
  }, [activeEmployees]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-2">Live Labor Cost Dashboard</h1>
        <p className="text-slate-600">
          Real-time monitoring of active employee labor costs - Management View
        </p>
      </div>

      {/* Fixed Ticker Widget - Hero Section */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl border-2 border-blue-200 shadow-lg p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Ticker */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
              <span className="uppercase tracking-wide">Live Labor Cost Today</span>
            </div>
            <div className="text-5xl font-mono text-blue-900 tracking-tight">
              {formatCurrency(currentCost)}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Burn Rate: {formatCurrency(burnRatePerHour)}/hour</span>
              </div>
              <div className="text-slate-400">•</div>
              <span>{formatCurrency(burnRatePerSecond * 60)}/min</span>
              <div className="text-slate-400">•</div>
              <span>{formatCurrency(burnRatePerSecond)}/sec</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Active Employees</div>
              <div className="text-3xl text-blue-900">{activeEmployees.length}</div>
              <div className="text-xs text-slate-500 mt-1">On the clock</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Projected Total</div>
              <div className="text-2xl text-emerald-700">{formatCurrency(projectedDailyTotal)}</div>
              <div className="text-xs text-slate-500 mt-1">If all work 8hrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Who's on the Clock?
              </CardTitle>
              <CardDescription>
                {filteredEmployees.length} active employee{filteredEmployees.length !== 1 ? 's' : ''} • 
                {selectedDepartment === 'all' ? ' All Departments' : ` ${selectedDepartment}`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[220px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Highest Cost</SelectItem>
                  <SelectItem value="time">Longest Time</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Filtered Total Cost</div>
              <div className="text-2xl text-blue-900">{formatCurrency(filteredTotals.totalCost)}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="text-sm text-emerald-700 mb-1">Active Count</div>
              <div className="text-2xl text-emerald-900">{filteredTotals.count} employees</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-sm text-amber-700 mb-1">Avg Hourly Rate</div>
              <div className="text-2xl text-amber-900">{formatCurrency(filteredTotals.avgHourlyRate)}</div>
            </div>
          </div>

          {/* Breakdown Table */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No employees currently clocked in</p>
              <p className="text-sm text-slate-500 mt-1">Labor costs will appear when employees mark attendance</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left p-3 text-slate-700">Employee Name</th>
                    <th className="text-left p-3 text-slate-700">Department</th>
                    <th className="text-right p-3 text-slate-700">Hourly Rate</th>
                    <th className="text-center p-3 text-slate-700">Clock-In Time</th>
                    <th className="text-center p-3 text-slate-700">Hours Worked</th>
                    <th className="text-right p-3 text-slate-700">Cost So Far</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{emp.name}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {emp.department}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-slate-700">
                        {formatCurrency(emp.hourlyRate)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>{emp.clockInTime}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center text-slate-700">
                        {formatHoursMinutes(emp.hoursWorked)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="text-emerald-700 font-mono">
                          {formatCurrency(emp.costSoFar)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={5} className="p-3 text-right text-slate-700">
                      <strong>Total ({filteredEmployees.length} employees):</strong>
                    </td>
                    <td className="p-3 text-right">
                      <strong className="text-emerald-700 font-mono text-lg">
                        {formatCurrency(filteredTotals.totalCost)}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Footer */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-blue-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            How Labor Costs are Calculated
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>Hourly Rate:</strong> Monthly salary ÷ 160 hours (standard work month: 8 hours × 20 days)</p>
            <p>• <strong>Active Employees:</strong> Currently clocked in (Present/Late status with check-in time, no check-out)</p>
            <p>• <strong>Burn Rate:</strong> Sum of all active hourly rates, calculated per second for live updates</p>
            <p>• <strong>Cost So Far:</strong> Hours worked × hourly rate (updates live every second)</p>
            <p>• <strong>Projected Total:</strong> Assumes all active employees complete a full 8-hour shift</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
