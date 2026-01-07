import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { User, Mail, Building2, Shield, Key, Save, Eye, EyeOff, Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { userAPI } from '../services/api';

interface AdminUser {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  role: 'admin' | 'hr' | 'manager';
  department?: string;
  password?: string;
}

export function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'hr' as 'admin' | 'hr' | 'manager',
    department: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Load admin users
  useEffect(() => {
    if (activeSection === 'users') {
      loadAdminUsers();
    }
  }, [activeSection]);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      // Ensure we always have an array
      const users = Array.isArray(response) ? response : (response?.data || []);
      setAdminUsers(users);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
      setAdminUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'hr',
      department: '',
    });
    setShowModal(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingUser) {
        // Update existing user
        const updateData: any = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          department: formData.department,
        };

        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        await userAPI.update(editingUser._id || editingUser.id || '', updateData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        if (!formData.password) {
          toast.error('Password is required for new users');
          return;
        }

        await userAPI.create(formData);
        toast.success('User created successfully');
      }

      await loadAdminUsers();
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'hr',
        department: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }

    toast.custom((t) => (
      <div className="bg-white shadow-2xl border border-gray-200 max-w-sm overflow-hidden" style={{ borderRadius: '5px' }}>
        <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #ef4444, #dc2626)' }}>
          <h3 className="text-base font-bold" style={{ color: '#ffffff', margin: 0 }}>Delete User</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => toast.dismiss(t)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('Deleting user:', userId);
                  await userAPI.delete(userId);
                  console.log('User deleted successfully');
                  await loadAdminUsers();
                  toast.success('User deleted successfully');
                  toast.dismiss(t);
                } catch (error: any) {
                  console.error('Error deleting user:', error);
                  const errorMsg = error?.message || error?.response?.data?.message || 'Failed to delete user';
                  toast.error(errorMsg);
                  toast.dismiss(t);
                }
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ), { position: 'top-center' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-6">
          <h1 className="!text-white !mb-2 !text-3xl no-underline">Settings</h1>
          <p className="!text-slate-300 !mb-0">Manage admin users and system settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeSection === 'profile'
                    ? 'bg-blue-50 !text-blue-700 border-2 border-blue-200'
                    : '!text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-semibold">My Profile</span>
              </button>
              <button
                onClick={() => setActiveSection('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeSection === 'users'
                    ? 'bg-blue-50 !text-blue-700 border-2 border-blue-200'
                    : '!text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Admin Users</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200 bg-slate-50">
                <h2 className="!text-gray-900 !mb-1 !text-2xl">My Profile</h2>
                <p className="!text-gray-600 !mb-0 text-sm">View your profile information</p>
              </div>
              <div className="p-8 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center !text-white shadow-xl">
                    <span className="text-3xl font-bold">
                      {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold !text-gray-900 !mb-1">{user?.username}</p>
                    <p className="text-sm !text-gray-600 !mb-0">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      <Shield className="w-3 h-3" />
                      {user?.role.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Info Display */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4" />
                      Username
                    </div>
                    <p className="text-gray-900 font-medium">{user?.username}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Shield className="w-4 h-4" />
                      Role
                    </div>
                    <p className="text-gray-900 font-medium capitalize">{user?.role}</p>
                  </div>

                  {user?.department && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Building2 className="w-4 h-4" />
                        Department
                      </div>
                      <p className="text-gray-900 font-medium">{user?.department}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="!text-gray-900 !mb-1 !text-2xl">Admin Users</h2>
                  <p className="!text-gray-600 !mb-0 text-sm">Manage system administrators and HR staff</p>
                </div>
                <button
                  onClick={handleAddUser}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add User
                </button>
              </div>

              <div className="p-8">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading users...</p>
                  </div>
                ) : adminUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No admin users found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {adminUsers.map((adminUser) => (
                      <div
                        key={adminUser._id || adminUser.id}
                        className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {adminUser.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{adminUser.username}</h3>
                            <p className="text-sm text-gray-600">{adminUser.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                <Shield className="w-3 h-3" />
                                {adminUser.role.toUpperCase()}
                              </span>
                              {adminUser.department && (
                                <span className="text-xs text-gray-500">• {adminUser.department}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(adminUser)}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(adminUser._id || adminUser.id || '')}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style={{ borderRadius: '5px' }}>
            <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="email@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter department (optional)"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}