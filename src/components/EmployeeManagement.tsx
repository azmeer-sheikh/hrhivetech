import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, Upload, X } from 'lucide-react';
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
    position: '',
    department: '',
    salary: '',
    joiningDate: '',
    status: 'Active' as const,
    imageUrl: '' as string | undefined,
  });

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

  const handleDelete = async (id: string | number | undefined) => {
    if (!id || !window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      setLoading(true);
      await employeeAPI.delete(String(id));
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

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
                    onClick={() => handleEdit(employee)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee._id || employee.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-down">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 border-b border-blue-700">
              <h2 className="!text-white !mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 !text-white" />
                </div>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="!text-blue-100 text-sm !mb-0">
                {editingEmployee ? 'Update employee information' : 'Enter employee details to add to the system'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    First Name
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Last Name
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Email Address
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="employee@hivetechsolutions.com"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Phone Number
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 XXX XXXXXXX"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Position/Title
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Senior Developer"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Department
                    <span className="!text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="">Select Department</option>
                    <option value="Sales Operations (Phase-4)">Sales Operations (Phase-4)</option>
                    <option value="Sales Operations">Sales Operations</option>
                    <option value="Tech Department">Tech Department</option>
                  </select>
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Monthly Salary (PKR)
                    <span className="!text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 !text-gray-500 font-medium">
                      PKR
                    </span>
                    <input
                      type="number"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="100000"
                      className="w-full pl-16 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Join Date */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Join Date
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Employment Status
                    <span className="!text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Image Upload - Full Width */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Preview Circle */}
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
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
            </form>

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
                onClick={handleSubmit}
                className="flex-1 px-6 py-3.5 bg-blue-600 !text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 font-medium"
              >
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}