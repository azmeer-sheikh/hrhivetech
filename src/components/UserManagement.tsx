import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Shield, UserPlus, Edit2, Trash2, Key, Search, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function UserManagement() {
  const { user, users, addUser, updateUser, deleteUser, changePassword } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'admin' as 'admin' | 'super-admin' | 'hr' | 'manager' | 'employee',
    department: '',
    password: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!formData.username || !formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (users.some(u => u.username === formData.username)) {
      toast.error('Username already exists');
      return;
    }

    setIsSubmittingAdd(true);
    setTimeout(() => {
      addUser(formData);
      toast.success('User added successfully');
      setShowAddDialog(false);
      setFormData({
        username: '',
        name: '',
        email: '',
        role: 'admin',
        department: '',
        password: '',
      });
      setIsSubmittingAdd(false);
    }, 500);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    setIsSubmittingEdit(true);
    setTimeout(() => {
      updateUser(selectedUser.id, {
        name: formData.name,
        email: formData.email,
          role: formData.role.toLowerCase(),
        department: formData.department,
      });
      
      toast.success('User updated successfully');
      setShowEditDialog(false);
      setSelectedUser(null);
      setIsSubmittingEdit(false);
    }, 500);
  };

  const handleDeleteUser = (userId: string) => {
    setIsDeletingId(userId);
    let dismissed = false;

    toast.custom(
      (t) => (
        <div className="bg-white shadow-2xl border border-gray-200 max-w-sm overflow-hidden" style={{ borderRadius: '5px' }}>
          <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #ef4444, #dc2626)' }}>
            <h3 className="text-base font-bold" style={{ color: '#ffffff', margin: 0 }}>Delete User</h3>
          </div>
          
          <div className="p-6">
            <p className="text-gray-800 text-base leading-relaxed mb-6 font-medium">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!dismissed) {
                    dismissed = true;
                    setIsDeletingId(null);
                    toast.dismiss(t);
                  }
                }}
                className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors font-semibold text-sm"
                style={{ borderRadius: '5px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!dismissed) {
                    dismissed = true;
                    deleteUser(userId);
                    toast.dismiss(t);
                    toast.success('User deleted successfully', {
                      position: 'top-center'
                    });
                    setIsDeletingId(null);
                  }
                }}
                className="flex-1 px-5 py-2.5 text-sm font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
                style={{ borderRadius: '5px', backgroundColor: '#dc2626', color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                {isDeletingId === userId ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      ),
      { position: 'top-center' }
    );
  };

  const handleChangePassword = () => {
    if (!selectedUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmittingPassword(true);
    setTimeout(() => {
      const success = changePassword(
        selectedUser.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (success) {
        toast.success('Password changed successfully');
        setShowPasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error('Current password is incorrect');
      }
      setIsSubmittingPassword(false);
    }, 500);
  };

  const openEditDialog = (u: any) => {
    setSelectedUser(u);
    setFormData({
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department || '',
      password: '',
    });
    setShowEditDialog(true);
  };

  const openPasswordDialog = (u: any) => {
    setSelectedUser(u);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordDialog(true);
  };

  // Only Super Admin can access
  if (user?.role !== 'super-admin' && user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="!text-gray-900 !mb-2">Access Denied</h3>
          <p className="!text-gray-600 !mb-0">Only Admins can access user management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="!text-white !mb-2 !text-3xl no-underline">User Management</h1>
              <p className="!text-blue-100 !mb-0">Manage system users and roles</p>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              disabled={isSubmittingAdd || isSubmittingEdit || isSubmittingPassword}
              className="bg-white hover:bg-blue-50 disabled:bg-gray-100 disabled:cursor-not-allowed !text-blue-700 px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg"
            >
              {isSubmittingAdd ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Add User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold !text-gray-700">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold !text-gray-700">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold !text-gray-700">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold !text-gray-700">Department</th>
                <th className="text-right px-6 py-4 text-sm font-semibold !text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold !text-gray-900 !mb-0">{u.name}</p>
                      <p className="text-sm !text-gray-500 !mb-0">@{u.username}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 !text-gray-700">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'super-admin'
                        ? 'bg-purple-100 text-purple-700'
                        : u.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : u.role === 'hr'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {u.role.replace('-', ' ').toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 !text-gray-700">{u.department || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openPasswordDialog(u)}
                        disabled={isSubmittingPassword || isDeletingId === u.id}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Change Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditDialog(u)}
                        disabled={isSubmittingEdit || isDeletingId === u.id}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        title="Delete User"
                        disabled={users.filter(usr => usr.role === 'super-admin').length === 1 && u.role === 'super-admin' || isDeletingId === u.id}
                      >
                        {isDeletingId === u.id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
              <h2 className="!text-white !mb-0 !text-2xl">Add New User</h2>
              <button onClick={() => setShowAddDialog(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold !text-gray-700 mb-2">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold !text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold !text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold !text-gray-700 mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value.toLowerCase() as 'admin' | 'super-admin' | 'hr' | 'manager' | 'employee' })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                    <option value="hr">HR</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold !text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold !text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddUser}
                  disabled={isSubmittingAdd}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 !text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingAdd ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  ) : null}
                  <span>{isSubmittingAdd ? 'Adding...' : 'Add User'}</span>
                </button>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 !text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {showEditDialog && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
              <h2 className="!text-white !mb-0 !text-2xl">Edit User</h2>
              <button onClick={() => setShowEditDialog(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold !text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold !text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold !text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold !text-gray-700 mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value.toLowerCase() as 'admin' | 'super-admin' | 'hr' | 'manager' | 'employee' })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                    <option value="hr">HR</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold !text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditUser}
                  disabled={isSubmittingEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed !text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmittingEdit ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  ) : null}
                  <span>{isSubmittingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => setShowEditDialog(false)}
                  disabled={isSubmittingEdit}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 disabled:cursor-not-allowed !text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Dialog */}
      {showPasswordDialog && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-6 flex items-center justify-between">
              <h2 className="!text-white !mb-0 !text-2xl">Change Password</h2>
              <button onClick={() => setShowPasswordDialog(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <p className="!text-gray-600 !mb-4">
                Changing password for: <span className="font-semibold !text-gray-900">{selectedUser.name}</span>
              </p>
              <div>
                <label className="block text-sm font-semibold !text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold !text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold !text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={isSubmittingPassword}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-500 disabled:cursor-not-allowed !text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmittingPassword ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  ) : null}
                  <span>{isSubmittingPassword ? 'Changing...' : 'Change Password'}</span>
                </button>
                <button
                  onClick={() => setShowPasswordDialog(false)}
                  disabled={isSubmittingPassword}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 disabled:cursor-not-allowed !text-gray-700 py-3 rounded-lg font-semibold transition-colors"
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
