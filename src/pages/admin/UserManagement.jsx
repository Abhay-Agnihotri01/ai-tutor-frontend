import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Users, Search, Filter, Edit, Trash2,
  UserCheck, UserX, Shield, Eye, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { TableSkeleton } from '../../components/common/Skeleton';
import Pagination from '../../components/common/Pagination';
import { API_URL } from '../../config/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [paginatedUsers, setPaginatedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const { user, isAuthenticated } = useAuth();

  const itemsPerPage = 10;

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    paginateUsers();
  }, [filteredUsers, currentPage]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const paginateUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedUsers(filteredUsers.slice(startIndex, endIndex));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ));
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to admin?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'admin' })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, role: 'admin' } : user
        ));
        toast.success('User promoted to admin successfully');
      }
    } catch (error) {
      toast.error('Failed to promote user');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAdminData)
      });

      if (response.ok) {
        toast.success('Admin created successfully');
        setShowAddAdminModal(false);
        setNewAdminData({ firstName: '', lastName: '', email: '', password: '' });
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to create admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">
              User Management
            </h1>
            <p className="theme-text-secondary">
              Manage all platform users and their permissions
            </p>
          </div>
          <Button onClick={() => setShowAddAdminModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Admin
          </Button>
        </div>

        <div className="theme-card p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="text-sm theme-text-secondary flex items-center">
              {filteredUsers.length > 0 ? (
                <>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</>
              ) : (
                'No users found'
              )}
            </div>
          </div>
        </div>

        <div className="theme-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedUsers.map((listUser) => (
                  <tr key={listUser.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {listUser.firstName?.[0]}{listUser.lastName?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium theme-text-primary">
                            {listUser.firstName} {listUser.lastName}
                          </div>
                          <div className="text-sm theme-text-secondary">
                            {listUser.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${listUser.role === 'admin'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : listUser.role === 'instructor'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                        {listUser.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${listUser.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {listUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary">
                      {new Date(listUser.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {listUser.id !== user.id && (
                          <button
                            onClick={() => handleStatusToggle(listUser.id, listUser.isActive)}
                            className={`p-2 rounded-lg transition-colors ${listUser.isActive
                              ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                              : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                              }`}
                            title={listUser.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {listUser.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}

                        {listUser.id !== user.id && listUser.role !== 'admin' && (
                          <button
                            onClick={() => handlePromoteToAdmin(listUser.id)}
                            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                            title="Promote to Admin"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}

                        {listUser.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(listUser.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {listUser.id === user.id && (
                          <span className="text-xs text-gray-500 italic px-2 py-1">
                            (You)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 theme-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold theme-text-primary mb-2">
                No users found
              </h3>
              <p className="theme-text-secondary">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Add Admin Modal */}
        {showAddAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-card p-6 rounded-lg w-full max-w-md mx-4">
              <h3 className="text-lg font-bold theme-text-primary mb-4">Add New Admin</h3>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newAdminData.firstName}
                    onChange={(e) => setNewAdminData({ ...newAdminData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 theme-bg theme-text"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newAdminData.lastName}
                    onChange={(e) => setNewAdminData({ ...newAdminData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 theme-bg theme-text"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newAdminData.email}
                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 theme-bg theme-text"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={newAdminData.password}
                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 theme-bg theme-text"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <Button type="submit" className="flex-1">
                    Create Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddAdminModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;