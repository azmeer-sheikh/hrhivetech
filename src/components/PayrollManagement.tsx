import { useState } from 'react';
import { DollarSign, Download, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: number;
}

interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: 'Pending' | 'Processed' | 'Paid';
  paymentDate?: string;
}

interface PayrollManagementProps {
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  setPayrollRecords: (records: PayrollRecord[]) => void;
}

export function PayrollManagement({ 
  employees, 
  payrollRecords, 
  setPayrollRecords 
}: PayrollManagementProps) {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingEmployees, setProcessingEmployees] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [updatingRecordId, setUpdatingRecordId] = useState<number | null>(null);

  const getMonthRecords = () => {
    return payrollRecords.filter(record => record.month === selectedMonth);
  };

  const getMonthlyStats = () => {
    const records = getMonthRecords();
    const totalPayroll = records.reduce((sum, r) => sum + r.netPay, 0);
    const pending = records.filter(r => r.status === 'Pending').length;
    const processed = records.filter(r => r.status === 'Processed').length;
    const paid = records.filter(r => r.status === 'Paid').length;

    return { totalPayroll, pending, processed, paid };
  };

  const processPayroll = (employeeIds: number[]) => {
    setIsProcessing(true);
    setTimeout(() => {
      const newRecords: PayrollRecord[] = employeeIds.map(empId => {
        const employee = employees.find(e => e.id === empId)!;
        const bonus = Math.floor(Math.random() * 1000) + 500;
        const deductions = Math.floor(employee.salary * 0.15); // Tax and benefits
        const netPay = employee.salary + bonus - deductions;

        return {
          id: Math.max(0, ...payrollRecords.map(r => r.id)) + empId,
          employeeId: empId,
          employeeName: employee.name,
          month: selectedMonth,
          baseSalary: employee.salary,
          bonus,
          deductions,
          netPay,
          status: 'Processed',
          paymentDate: new Date(new Date(selectedMonth).setMonth(new Date(selectedMonth).getMonth() + 1, 1)).toISOString().split('T')[0],
        };
      });

      const otherRecords = payrollRecords.filter(
        r => !employeeIds.includes(r.employeeId) || r.month !== selectedMonth
      );

      setPayrollRecords([...otherRecords, ...newRecords]);
      setProcessingEmployees([]);
      setShowProcessModal(false);
      setIsProcessing(false);
    }, 1000);
  };

  const updatePayrollStatus = (recordId: number, status: PayrollRecord['status']) => {
    setUpdatingRecordId(recordId);
    setTimeout(() => {
      setPayrollRecords(
        payrollRecords.map(record =>
          record.id === recordId
            ? { ...record, status, paymentDate: status === 'Paid' ? new Date().toISOString().split('T')[0] : record.paymentDate }
            : record
        )
      );
      setUpdatingRecordId(null);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Processed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'Processed':
        return <Clock className="w-4 h-4" />;
      case 'Pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const employeesWithoutPayroll = employees.filter(
    emp => !payrollRecords.some(r => r.employeeId === emp.id && r.month === selectedMonth)
  );

  const stats = getMonthlyStats();
  const monthRecords = getMonthRecords();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-2">Payroll Management</h1>
          <p className="text-gray-500">Process and track employee payments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowProcessModal(true)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <DollarSign className="w-5 h-5" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Process Payroll'}</span>
          </button>
          <button 
            disabled={isExporting}
            onClick={() => {
              setIsExporting(true);
              setTimeout(() => setIsExporting(false), 1000);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Month Selector & Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="w-5 h-5 text-gray-400" />
          <label className="text-gray-700">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-gray-700 mb-1">Total Payroll</p>
            <p className="text-indigo-600">${stats.totalPayroll.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-gray-700 mb-1">Pending</p>
            <p className="text-yellow-600">{stats.pending}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-700 mb-1">Processed</p>
            <p className="text-blue-600">{stats.processed}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-gray-700 mb-1">Paid</p>
            <p className="text-green-600">{stats.paid}</p>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-gray-700">Employee</th>
                <th className="text-left px-6 py-4 text-gray-700">Base Salary</th>
                <th className="text-left px-6 py-4 text-gray-700">Bonus</th>
                <th className="text-left px-6 py-4 text-gray-700">Deductions</th>
                <th className="text-left px-6 py-4 text-gray-700">Net Pay</th>
                <th className="text-left px-6 py-4 text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-gray-700">Payment Date</th>
                <th className="text-left px-6 py-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{record.employeeName}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ${record.baseSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-green-600">
                    +${record.bonus.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-red-600">
                    -${record.deductions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">${record.netPay.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record.paymentDate || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {record.status === 'Processed' && (
                      <button
                        onClick={() => updatePayrollStatus(record.id, 'Paid')}
                        disabled={updatingRecordId === record.id}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {updatingRecordId === record.id ? (
                          <div className="w-3 h-3 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                        ) : null}
                        Mark Paid
                      </button>
                    )}
                    {record.status === 'Pending' && (
                      <button
                        onClick={() => updatePayrollStatus(record.id, 'Processed')}
                        disabled={updatingRecordId === record.id}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {updatingRecordId === record.id ? (
                          <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                        ) : null}
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {monthRecords.length === 0 && (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payroll records for this month</p>
            <button
              onClick={() => setShowProcessModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Process Payroll
            </button>
          </div>
        )}
      </div>

      {/* Process Payroll Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-gray-900">Process Payroll for {selectedMonth}</h2>
              <p className="text-gray-500 mt-1">Select employees to process payroll</p>
            </div>

            <div className="p-6">
              {employeesWithoutPayroll.length > 0 ? (
                <div className="space-y-2">
                  {employeesWithoutPayroll.map((employee) => (
                    <label
                      key={employee.id}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={processingEmployees.includes(employee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProcessingEmployees([...processingEmployees, employee.id]);
                          } else {
                            setProcessingEmployees(processingEmployees.filter(id => id !== employee.id));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900">{employee.name}</p>
                        <p className="text-gray-500">{employee.position} - {employee.department}</p>
                      </div>
                      <p className="text-gray-900">${employee.salary.toLocaleString()}/mo</p>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-700">All employees have been processed for this month</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (processingEmployees.length === 0) {
                      alert('Please select at least one employee');
                      return;
                    }
                    processPayroll(processingEmployees);
                  }}
                  disabled={processingEmployees.length === 0 || isProcessing}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{`Process ${processingEmployees.length} Employee${processingEmployees.length !== 1 ? 's' : ''}`}</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setProcessingEmployees([]);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
