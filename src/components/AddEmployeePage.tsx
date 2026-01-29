import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
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
  joiningDate?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  imageUrl?: string;
  [key: string]: any;
}

interface AddEmployeePageProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
}

export function AddEmployeePage({ employees, setEmployees }: AddEmployeePageProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnic: '',
    employeeCode: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    position: '',
    department: '',
    salary: '',
    joiningDate: '',
    status: 'Active' as const,
    imageUrl: '' as string | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        cnic: formData.cnic || undefined,
        employeeCode: formData.employeeCode,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        address: formData.address,
        position: formData.position,
        department: formData.department,
        salary: parseFloat(formData.salary),
        joiningDate: formData.joiningDate || undefined,
        status: formData.status,
      };

      const response = await employeeAPI.create(submitData);
      toast.success('Employee created successfully! Welcome email will be sent shortly.', { position: 'top-center' });

      if (response?.data) {
        const newEmployee = {
          _id: response.data._id,
          id: response.data._id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          name: `${response.data.firstName} ${response.data.lastName}`,
          email: response.data.email,
          phone: response.data.phone,
          position: response.data.position,
          department: response.data.department,
          salary: response.data.salary,
          joiningDate: response.data.joiningDate,
          status: response.data.status,
          imageUrl: response.data.imageUrl,
          ...response.data,
        };
        setEmployees([newEmployee, ...employees]);
      }

      navigate('/employees');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save employee');
      toast.error(err instanceof Error ? err.message : 'Failed to save employee', { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>

        </div>
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Employees
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="bg-white shadow-2xl border-l-4 border-blue-600">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b-2 border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 flex items-center justify-center">
                <Plus className="w-5 h-5 !text-white" />
              </div>
              <div>
                <h2 className="!text-white !mb-0 text-lg font-bold tracking-wide">Add New Employee</h2>
                <p className="!text-slate-300 text-xs !mb-0 mt-0.5">Enter employee details to add to the system</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-1.5">
              <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                CNIC
              </label>
              <input
                type="text"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                placeholder="XXXXX-XXXXXXX-X"
                className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

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

            <div className="space-y-1.5">
              <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

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

            <div className="md:col-span-3 space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="!text-slate-800 text-sm font-semibold uppercase tracking-wide !mb-3">Address Information</h4>

              <div className="space-y-1.5">
                <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  placeholder="House no., Street name"
                  className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                    placeholder="City"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">State/Province</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                    placeholder="State/Province"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">Zip/Postal Code</label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                    placeholder="12345"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">Country</label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                    placeholder="Country"
                    className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">Join Date</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 border-l-4 border-blue-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

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

            <div className="md:col-span-3 space-y-1.5">
              <label className="block !text-slate-800 text-xs font-semibold uppercase tracking-wide">Profile Image</label>
              <div className="flex items-center gap-4">
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
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('Image size exceeds 10MB limit. Please select a smaller image.', { position: 'top-center' });
                            return;
                          }
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

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              disabled={submitting}
              className="flex-1 px-6 py-3.5 bg-white !text-gray-700 rounded-xl hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors border-2 border-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3.5 bg-blue-600 !text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/30 font-medium flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Employee</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
