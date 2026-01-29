import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Download, Calendar, CheckCircle, Clock, AlertCircle, FileDown, Pencil } from 'lucide-react';
import { payrollAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { Pagination } from './Pagination';

interface Employee {
  id: number | string;
  name: string;
  position: string;
  department: string;
  salary: number;
}

interface PayrollRecord {
  _id: string;
  employee: {
    _id: string;
    firstName?: string;
    lastName?: string;
    employeeCode?: string;
    department?: string;
    position?: string;
  };
  month: number;
  year: number;
  baseSalary: number;
  commission?: number;
  bonus?: number;
  totalDeductions?: number;
  totalAllowances?: number;
  netSalary: number;
  status: 'Draft' | 'Processed' | 'Paid' | 'On Hold';
  paymentDate?: string;
}

interface PayrollManagementProps {
  employees: Employee[];
}

const isSalesDepartment = (department?: string) => {
  if (!department) return false;
  return department.toLowerCase().includes('sales');
};

const formatPKR = (value: number) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(value || 0);

export function PayrollManagement({ employees }: PayrollManagementProps) {
  const { user } = useAuth();
  const isAuthorized = user?.role === 'admin' || user?.role === 'hr';
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingEmployees, setProcessingEmployees] = useState<string[]>([]);
  const [commissionInputs, setCommissionInputs] = useState<Record<string, string>>({});
  const [bonusInputs, setBonusInputs] = useState<Record<string, string>>({});
  const [processStep, setProcessStep] = useState(1);
  const [processPage, setProcessPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [editValues, setEditValues] = useState({ baseSalary: '', commission: '', bonus: '' });

  const departments = useMemo(() => {
    const uniqueDepartments = Array.from(
      new Set(employees.map(emp => emp.department).filter(Boolean))
    );
    return ['All', ...uniqueDepartments];
  }, [employees]);

  const { monthNumber, yearNumber } = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    return { monthNumber: Number(month), yearNumber: Number(year) };
  }, [selectedMonth]);

  const loadPayrolls = async () => {
    if (!isAuthorized) return;

    setIsLoading(true);
    setError(null);

    try {
      const filters: Record<string, any> = {
        month: monthNumber,
        year: yearNumber,
      };

      if (selectedDepartment !== 'All') {
        filters.department = selectedDepartment;
      }

      const response = await payrollAPI.getAll(1, 1000, filters);
      const data = response?.data || [];
      setPayrollRecords(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load payroll records';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayrolls();
  }, [selectedMonth, selectedDepartment, isAuthorized]);

  const getMonthlyStats = () => {
    const totalPayroll = payrollRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);
    const pending = payrollRecords.filter(r => r.status === 'Draft').length;
    const processed = payrollRecords.filter(r => r.status === 'Processed').length;
    const paid = payrollRecords.filter(r => r.status === 'Paid').length;

    return { totalPayroll, pending, processed, paid };
  };

  const processPayroll = async () => {
    if (processingEmployees.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      await Promise.all(
        processingEmployees.map(async (employeeId) => {
          const employee = employees.find(emp => String(emp.id) === employeeId);
          if (!employee) return;

          const isSales = isSalesDepartment(employee.department);

          const payload: Record<string, any> = {
            employeeId: String(employee.id),
            month: monthNumber,
            year: yearNumber,
            baseSalary: employee.salary,
            status: 'Processed'
          };

          if (isSales) {
            payload.commission = Number(commissionInputs[String(employeeId)] || 0);
            payload.bonus = Number(bonusInputs[String(employeeId)] || 0);
          }

          return payrollAPI.create(payload);
        })
      );

      await loadPayrolls();
      setProcessingEmployees([]);
      setCommissionInputs({});
      setBonusInputs({});
      setShowProcessModal(false);
      setProcessStep(1);
      setProcessPage(1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process payroll';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const updatePayrollStatus = async (recordId: string, status: PayrollRecord['status']) => {
    setUpdatingRecordId(recordId);
    setError(null);

    try {
      if (status === 'Paid') {
        await payrollAPI.process(recordId);
      } else {
        await payrollAPI.update(recordId, { status });
      }

      await loadPayrolls();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update payroll status';
      setError(message);
    } finally {
      setUpdatingRecordId(null);
    }
  };

  const downloadReceipt = async (record: PayrollRecord) => {
    setError(null);

    try {
      const blob = await payrollAPI.downloadReceipt(record._id);
      const fileName = `salary-receipt-${record.employee?.employeeCode || record._id}.html`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download receipt';
      setError(message);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const filters: Record<string, any> = {
        month: monthNumber,
        year: yearNumber,
      };

      if (selectedDepartment !== 'All') {
        filters.department = selectedDepartment;
      }

      const blob = await payrollAPI.exportExcel(filters);
      const fileName = `payroll-records-${selectedMonth}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export payroll';
      setError(message);
    } finally {
      setIsExporting(false);
    }
  };

  const openEditModal = (record: PayrollRecord) => {
    setEditingRecord(record);
    setEditValues({
      baseSalary: String(record.baseSalary ?? ''),
      commission: String(record.commission ?? ''),
      bonus: String(record.bonus ?? '')
    });
  };

  const saveEdit = async () => {
    if (!editingRecord) return;

    setUpdatingRecordId(editingRecord._id);
    setError(null);

    try {
      const isSales = isSalesDepartment(editingRecord.employee?.department);
      const payload: Record<string, any> = {
        baseSalary: Number(editValues.baseSalary || 0)
      };

      if (isSales) {
        payload.commission = Number(editValues.commission || 0);
        payload.bonus = Number(editValues.bonus || 0);
      }

      await payrollAPI.update(editingRecord._id, payload);
      await loadPayrolls();
      setEditingRecord(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update payroll';
      setError(message);
    } finally {
      setUpdatingRecordId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Processed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'On Hold':
        return 'bg-red-100 text-red-800 border-red-200';
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
      case 'Draft':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const filteredEmployees = selectedDepartment === 'All'
    ? employees
    : employees.filter(emp => emp.department === selectedDepartment);

  const employeesWithoutPayroll = filteredEmployees.filter(
    emp => !payrollRecords.some(r => r.employee?._id === String(emp.id))
  );

  const processPageSize = 8;
  const totalProcessPages = Math.max(1, Math.ceil(employeesWithoutPayroll.length / processPageSize));
  const pagedEmployees = employeesWithoutPayroll.slice(
    (processPage - 1) * processPageSize,
    processPage * processPageSize
  );
  const allSelected = employeesWithoutPayroll.length > 0 && employeesWithoutPayroll.every(emp => processingEmployees.includes(String(emp.id)));

  const showSalesColumns = payrollRecords.some(record =>
    isSalesDepartment(record.employee?.department)
  );

  const stats = getMonthlyStats();

  if (!isAuthorized) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-gray-900 mb-2">Payroll Management</h1>
        <p className="text-gray-500">You do not have access to payroll records.</p>
      </div>
    );
  }

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
            onClick={() => {
              setShowProcessModal(true);
              setProcessStep(1);
              setProcessPage(1);
            }}
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
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Download Excel'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Month Selector & Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Calendar className="w-5 h-5 text-gray-400" />
          <label className="text-gray-700">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <label className="text-gray-700">Department:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-gray-700 mb-1">Total Payroll</p>
            <p className="text-indigo-600">{formatPKR(stats.totalPayroll)}</p>
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
                {showSalesColumns && (
                  <th className="text-left px-6 py-4 text-gray-700">Commission</th>
                )}
                {showSalesColumns && (
                  <th className="text-left px-6 py-4 text-gray-700">Bonus</th>
                )}
                <th className="text-left px-6 py-4 text-gray-700">Deductions</th>
                <th className="text-left px-6 py-4 text-gray-700">Net Pay</th>
                <th className="text-left px-6 py-4 text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-gray-700">Payment Date</th>
                <th className="text-left px-6 py-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payrollRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-gray-900">
                      {`${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim() || 'Employee'}
                    </p>
                    <p className="text-gray-500 text-sm">{record.employee?.department || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatPKR(record.baseSalary)}
                  </td>
                  {showSalesColumns && (
                    <td className="px-6 py-4 text-green-600">
                      {isSalesDepartment(record.employee?.department)
                        ? `+${formatPKR(record.commission || 0)}`
                        : '-'}
                    </td>
                  )}
                  {showSalesColumns && (
                    <td className="px-6 py-4 text-green-600">
                      {isSalesDepartment(record.employee?.department)
                        ? `+${formatPKR(record.bonus || 0)}`
                        : '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-red-600">
                    -{formatPKR(record.totalDeductions || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{formatPKR(record.netSalary)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record.paymentDate ? new Date(record.paymentDate).toISOString().split('T')[0] : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {record.status === 'Processed' && (
                        <button
                          onClick={() => updatePayrollStatus(record._id, 'Paid')}
                          disabled={updatingRecordId === record._id}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {updatingRecordId === record._id ? (
                            <div className="w-3 h-3 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                          ) : null}
                          Mark Paid
                        </button>
                      )}
                      {record.status === 'Draft' && (
                        <button
                          onClick={() => updatePayrollStatus(record._id, 'Processed')}
                          disabled={updatingRecordId === record._id}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {updatingRecordId === record._id ? (
                            <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                          ) : null}
                          Process
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(record)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => downloadReceipt(record)}
                        className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        <FileDown className="w-4 h-4" />
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payrollRecords.length === 0 && !isLoading && (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payroll records for this month</p>
            <button
              onClick={() => {
                setShowProcessModal(true);
                setProcessStep(1);
                setProcessPage(1);
              }}
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
              <p className="text-gray-500 mt-1">
                {processStep === 1 ? 'Select employees to process payroll' : 'Review and confirm payroll'}
              </p>
            </div>

            <div className="p-6">
              {employeesWithoutPayroll.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-700">All employees have been processed for this month</p>
                </div>
              ) : processStep === 1 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProcessingEmployees(employeesWithoutPayroll.map(emp => String(emp.id)));
                          } else {
                            setProcessingEmployees([]);
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      Select all employees
                    </label>
                    <p className="text-sm text-gray-500">
                      Selected: {processingEmployees.length}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {pagedEmployees.map((employee) => {
                      const employeeKey = String(employee.id);
                      return (
                        <label
                          key={employee.id}
                          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={processingEmployees.includes(employeeKey)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProcessingEmployees([...processingEmployees, employeeKey]);
                              } else {
                                setProcessingEmployees(processingEmployees.filter(id => id !== employeeKey));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <p className="text-gray-900">{employee.name}</p>
                            <p className="text-gray-500">{employee.position} - {employee.department}</p>
                          </div>
                          <p className="text-gray-900">{formatPKR(employee.salary)}/mo</p>
                        </label>
                      );
                    })}
                  </div>

                  <Pagination
                    currentPage={processPage}
                    totalPages={totalProcessPages}
                    onPageChange={(page) => setProcessPage(page)}
                    itemsPerPage={processPageSize}
                    totalItems={employeesWithoutPayroll.length}
                  />
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-indigo-900">
                      Review and confirm payroll for <strong>{processingEmployees.length}</strong> employee{processingEmployees.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    {processingEmployees.map((employeeId) => {
                      const employee = employees.find(emp => String(emp.id) === employeeId);
                      if (!employee) return null;
                      const salesEmployee = isSalesDepartment(employee.department);
                      return (
                        <div
                          key={employeeId}
                          className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-white"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-900 font-medium">{employee.name}</p>
                              <p className="text-gray-500 text-sm">{employee.position} - {employee.department}</p>
                            </div>
                            <p className="text-gray-900 font-semibold">{formatPKR(employee.salary)}/mo</p>
                        </div>

                        {salesEmployee && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm text-gray-600">Commission (PKR)</label>
                              <input
                                type="number"
                                min="0"
                                value={commissionInputs[employeeId] || ''}
                                onChange={(e) =>
                                  setCommissionInputs({
                                    ...commissionInputs,
                                    [employeeId]: e.target.value
                                  })
                                }
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Bonus (PKR)</label>
                              <input
                                type="number"
                                min="0"
                                value={bonusInputs[employeeId] || ''}
                                onChange={(e) =>
                                  setBonusInputs({
                                    ...bonusInputs,
                                    [employeeId]: e.target.value
                                  })
                                }
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                {processStep === 1 ? (
                  <button
                    onClick={() => {
                      if (processingEmployees.length === 0) {
                        alert('Please select at least one employee');
                        return;
                      }
                      setProcessStep(2);
                    }}
                    disabled={processingEmployees.length === 0}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (processingEmployees.length === 0) {
                        alert('Please select at least one employee');
                        return;
                      }
                      processPayroll();
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
                )}
                {processStep === 2 && (
                  <button
                    onClick={() => setProcessStep(1)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setProcessingEmployees([]);
                    setCommissionInputs({});
                    setBonusInputs({});
                    setProcessStep(1);
                    setProcessPage(1);
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

      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-gray-900">Edit Payroll</h2>
              <p className="text-gray-500 mt-1">
                {`${editingRecord.employee?.firstName || ''} ${editingRecord.employee?.lastName || ''}`.trim()}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600">Base Salary (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={editValues.baseSalary}
                  onChange={(e) => setEditValues({ ...editValues, baseSalary: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {isSalesDepartment(editingRecord.employee?.department) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Commission (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      value={editValues.commission}
                      onChange={(e) => setEditValues({ ...editValues, commission: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Bonus (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      value={editValues.bonus}
                      onChange={(e) => setEditValues({ ...editValues, bonus: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={saveEdit}
                disabled={updatingRecordId === editingRecord._id}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingRecordId === editingRecord._id ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
