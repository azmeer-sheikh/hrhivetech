import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, Upload, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Pagination } from './Pagination';
import { employeeAPI } from '../services/api';

interface Employee {
  _id?: string;
  id?: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  joinDate?: string;
  joiningDate?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  imageUrl?: string;
  [key: string]: any;
}

interface EmployeeManagementProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
}

export function EmployeeManagement({ employees, setEmployees }: EmployeeManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 9; // 3x3 grid
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeCode: '',
    dateOfBirth: '',
    gender: '',
    position: '',
    department: '',
    salary: '',
    joiningDate: '',
    status: 'Active' as const,
    imageUrl: '' as string | undefined,
  });
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Load employees from API on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      // Request a high limit so the UI can load the full employee list (e.g., all 57 records)
      const response = await employeeAPI.getAll(1, 1000);
      const data = response?.data || [];
      const formattedEmployees = data.map((emp: any) => ({
        _id: emp._id,
        id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        phone: emp.phone,
        position: emp.position,
        department: emp.department,
        salary: emp.salary,
        joiningDate: emp.joiningDate,
        status: emp.status,
        imageUrl: emp.imageUrl,
        ...emp
      }));
      setEmployees(formattedEmployees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        employeeCode: formData.employeeCode,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        position: formData.position,
        department: formData.department,
        salary: parseFloat(formData.salary),
        joiningDate: formData.joiningDate,
        status: formData.status,
      };

      if (editingEmployee && (editingEmployee._id || editingEmployee.id)) {
        const empId = editingEmployee._id || editingEmployee.id;
        await employeeAPI.update(String(empId), submitData);
      } else {
        await employeeAPI.create(submitData);
      }

      // Reload employees from API
      await loadEmployees();

      setShowModal(false);
      setEditingEmployee(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeCode: '',
        dateOfBirth: '',
        gender: '',
        position: '',
        department: '',
        salary: '',
        joiningDate: '',
        status: 'Active',
        imageUrl: '',
      });
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName || employee.name?.split(' ')[0] || '',
      lastName: employee.lastName || employee.name?.split(' ').slice(1).join(' ') || '',
      email: employee.email,
      phone: employee.phone,
      employeeCode: employee.employeeCode || '',
      dateOfBirth: employee.dateOfBirth || '',
      gender: employee.gender || '',
      position: employee.position,
      department: employee.department,
      salary: employee.salary.toString(),
      joiningDate: employee.joiningDate || '',
      status: employee.status,
      imageUrl: employee.imageUrl,
    });
    setImagePreview(employee.imageUrl || null);
    setShowModal(true);
  };

  const handleDelete = useCallback((id: string | number | undefined) => {
    if (!id) return;

    let dismissed = false;

    toast.custom(
      (t) => (
        <div className="bg-white shadow-2xl border border-gray-200 max-w-sm overflow-hidden" style={{ borderRadius: '5px' }}>
          {/* Header */}
     
          {/* Content */}
          <div className="p-6">
            <p className="text-gray-800 text-base leading-relaxed mb-6 font-medium">
              Are you sure you want to delete this employee? 
            </p>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!dismissed) {
                    dismissed = true;
                    toast.dismiss(t);
                  }
                }}
                className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm font-semibold transition-colors"
                style={{ borderRadius: '5px' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!dismissed) {
                    dismissed = true;
                    try {
                      setLoading(true);
                      await employeeAPI.delete(String(id));
                      await loadEmployees();
                      toast.dismiss(t);
                      toast.success('Employee deleted successfully', {
                        position: 'top-center'
                      });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Failed to delete employee', {
                        position: 'top-center'
                      });
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                className="flex-1 px-5 py-2.5 text-sm font-bold transition-colors shadow-lg"
                style={{ borderRadius: '5px', backgroundColor: '#dc2626', color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
      { position: 'top-center' }
    );
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-2">Employee Management</h1>
          <p className="text-gray-500">Manage your workforce efficiently</p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              employeeCode: '',
              dateOfBirth: '',
              gender: '',
              position: '',
              department: '',
              salary: '',
              joiningDate: '',
              status: 'Active',
              imageUrl: '',
            });
            setImagePreview(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">Processing...</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees by name, email, position, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((employee) => (
          <div key={employee._id || employee.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Employee Avatar - Display uploaded image or initials */}
                  {employee.imageUrl ? (
                    <img
                      src={employee.imageUrl}
                      alt={employee.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      {((employee.firstName || '')[0] || '') + ((employee.lastName || '')[0] || '')}
                    </div>
                  )}
                  <div>
                    <h4 className="text-gray-900">{employee.name || `${employee.firstName} ${employee.lastName}`}</h4>
                    <p className="text-gray-500">{employee.position}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(employee.status)}`}>
                  {employee.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{employee.department}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-gray-500">Salary</p>
                  <p className="text-gray-900">PKR {employee.salary.toLocaleString()}/mo</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingEmployee(employee)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Employee"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee._id || employee.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No employees found</p>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-down border-l-4 border-blue-600">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b-2 border-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 flex items-center justify-center">
                    <Plus className="w-5 h-5 !text-white" />
                  </div>
                  <div>
                    <h2 className="!text-white !mb-0 text-lg font-bold tracking-wide">
                      {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                    </h2>
                    <p className="!text-slate-300 text-xs !mb-0 mt-0.5">
                      {editingEmployee ? 'Update employee information' : 'Enter employee details to add to the system'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[calc(90vh-160px)] bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    First Name <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Last Name <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Email <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@company.com"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Phone <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 XXX XXXXXXX"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Employee Code */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Employee Code <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    placeholder="EMP001"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Date of Birth <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Gender <span className="!text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Position <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Senior Developer"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Department <span className="!text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="IT">IT</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Salary */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Salary (PKR) <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="100000"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Join Date */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Join Date <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Status <span className="!text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Image Upload - Full Width */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Preview Circle */}
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-16 h-16 object-cover border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border-2 border-blue-200 hover:border-blue-300 flex items-center justify-center gap-2 font-medium">
                          <Upload className="w-5 h-5" />
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                                setFormData({ ...formData, imageUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, imageUrl: '' });
                          }}
                          className="mt-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Remove Image
                        </button>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Recommended: Square image, at least 400x400px</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3.5 bg-white !text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border-2 border-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3.5 bg-blue-600 !text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 font-medium"
                >
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-l-4 border-blue-600" style={{ borderRadius: '5px' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b-2 border-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="!text-white !mb-0 text-lg font-bold tracking-wide">Employee Details</h2>
                    <p className="!text-slate-300 text-xs !mb-0 mt-0.5">Complete employee information</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingEmployee(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Full Name</p>
                  <p className="text-sm text-slate-900 font-medium">{viewingEmployee.firstName} {viewingEmployee.lastName}</p>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Employee Code</p>
                  <p className="text-sm text-slate-900 font-medium">{viewingEmployee.employeeCode}</p>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Email</p>
                  <p className="text-sm text-slate-900 font-medium">{viewingEmployee.email}</p>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Phone</p>
                  <p className="text-sm text-slate-900 font-medium">{viewingEmployee.phone}</p>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Position</p>
                  <p className="text-sm text-slate-900 font-medium">{viewingEmployee.position}</p>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Department</p>
                  <p className="text-sm text-slate-900 font-medium">{viewingEmployee.department}</p>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Salary</p>
                  <p className="text-sm text-slate-900 font-medium">PKR {viewingEmployee.salary.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold ${
                    viewingEmployee.status === 'Active' ? 'bg-green-100 text-green-800' :
                    viewingEmployee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`} style={{ borderRadius: '5px' }}>
                    {viewingEmployee.status}
                  </span>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Gender</p>
                  <p className="text-sm text-slate-900 font-medium">{viewingEmployee.gender}</p>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Date of Birth</p>
                  <p className="text-sm text-slate-900 font-medium">{viewingEmployee.dateOfBirth ? new Date(viewingEmployee.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="bg-white p-4 border-l-4 border-blue-500 shadow-sm md:col-span-2">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Joining Date</p>
                  <p className="text-sm text-slate-900 font-medium">{viewingEmployee.joiningDate ? new Date(viewingEmployee.joiningDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-100 border-t-2 border-slate-300 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingEmployee(null)}
                className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 transition-colors border-l-4 border-slate-400 font-semibold text-sm uppercase tracking-wide shadow-sm"
                style={{ borderRadius: '5px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}