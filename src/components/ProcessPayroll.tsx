import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { payrollAPI } from '../services/api';
import { Pagination } from './Pagination';

interface Employee {
  id: number | string;
  name: string;
  position: string;
  department: string;
  salary: number;
}

interface ProcessPayrollProps {
  employees: Employee[];
}

const isSalesDepartment = (department?: string) => {
  if (!department) return false;
  return department.toLowerCase().includes('sales');
};

const formatPKR = (value: number) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(value || 0);

export function ProcessPayroll({ employees }: ProcessPayrollProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month') || new Date().toISOString().substring(0, 7);
  
  const [year, monthStr] = month.split('-');
  const monthNumber = Number(monthStr);
  const yearNumber = Number(year);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [processStep, setProcessStep] = useState(1);
  const [processPage, setProcessPage] = useState(1);
  const [processingEmployees, setProcessingEmployees] = useState<string[]>([]);
  const [commissionInputs, setCommissionInputs] = useState<Record<string, string>>({});
  const [bonusInputs, setBonusInputs] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingPayrolls, setExistingPayrolls] = useState<Set<string>>(new Set());
  const [isLoadingPayrolls, setIsLoadingPayrolls] = useState(true);

  const processPageSize = 8;

  const departments = useMemo(() => {
    const uniqueDepartments = Array.from(
      new Set(employees.map(emp => emp.department).filter(Boolean))
    );
    return ['All', ...uniqueDepartments];
  }, [employees]);

  useEffect(() => {
    loadExistingPayrolls();
  }, [month]);

  const loadExistingPayrolls = async () => {
    setIsLoadingPayrolls(true);
    try {
      const filters = {
        month: monthNumber,
        year: yearNumber
      };
      const response = await payrollAPI.getAll(filters);
      const existing = new Set(
        response.data.map((record: any) => String(record.employee?._id || record.employee))
      );
      setExistingPayrolls(existing);
    } catch (err) {
      console.error('Failed to load existing payrolls:', err);
    } finally {
      setIsLoadingPayrolls(false);
    }
  };

  const employeesWithoutPayroll = employees.filter(
    emp => !existingPayrolls.has(String(emp.id)) && 
           (selectedDepartment === 'All' || emp.department === selectedDepartment)
  );

  const totalProcessPages = Math.ceil(employeesWithoutPayroll.length / processPageSize);
  const pagedEmployees = employeesWithoutPayroll.slice(
    (processPage - 1) * processPageSize,
    processPage * processPageSize
  );

  const allSelected = employeesWithoutPayroll.length > 0 &&
    processingEmployees.length === employeesWithoutPayroll.length;

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

      navigate('/payroll?success=true');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process payroll';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingPayrolls) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/payroll')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Payroll
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Process Payroll for {new Date(yearNumber, monthNumber - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h1>
            <p className="text-gray-600 mt-1">
              {processStep === 1 ? 'Select employees to process payroll' : 'Review and confirm payroll'}
            </p>
          </div>
          
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Department:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setProcessPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {employeesWithoutPayroll.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 text-lg">All employees have been processed for this month</p>
              <button
                onClick={() => navigate('/payroll')}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Back to Payroll
              </button>
            </div>
          ) : processStep === 1 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200">
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
                  Selected: <span className="font-semibold text-gray-900">{processingEmployees.length}</span> of {employeesWithoutPayroll.length}
                </p>
              </div>

              <div className="space-y-3">
                {pagedEmployees.map((employee) => {
                  const employeeKey = String(employee.id);
                  return (
                    <label
                      key={employee.id}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
                        <p className="text-gray-900 font-medium">{employee.name}</p>
                        <p className="text-gray-500 text-sm">{employee.position} - {employee.department}</p>
                      </div>
                      <p className="text-gray-900 font-semibold">{formatPKR(employee.salary)}/mo</p>
                    </label>
                  );
                })}
              </div>

              {totalProcessPages > 1 && (
                <Pagination
                  currentPage={processPage}
                  totalPages={totalProcessPages}
                  onPageChange={(page) => setProcessPage(page)}
                  itemsPerPage={processPageSize}
                  totalItems={employeesWithoutPayroll.length}
                />
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-900">
                  Review and confirm payroll for <strong>{processingEmployees.length}</strong> employee{processingEmployees.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
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
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

        {/* Footer Actions */}
        {employeesWithoutPayroll.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3 justify-end">
              {processStep === 2 && (
                <button
                  onClick={() => setProcessStep(1)}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => navigate('/payroll')}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {processStep === 1 ? (
                <button
                  onClick={() => {
                    if (processingEmployees.length === 0) {
                      setError('Please select at least one employee');
                      return;
                    }
                    setError(null);
                    setProcessStep(2);
                  }}
                  disabled={processingEmployees.length === 0}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={processPayroll}
                  disabled={processingEmployees.length === 0 || isProcessing}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
