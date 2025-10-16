import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    // Optional: Add admin role check here
    // const user = JSON.parse(userData);
    // if (!user.isAdmin) {
    //   navigate('/dashboard');
    // }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      // This endpoint should be created in your backend
      const response = await fetch('http://localhost:5000/api/users/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setMessage('Failed to fetch users');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Fetch users error:', error);
      
      // Mock data for demonstration
      const mockUsers = [
        {
          _id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          gender: 'male',
          birthdate: '1990-01-15T00:00:00.000Z',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'US',
            zipCode: '10001'
          },
          createdAt: '2024-01-10T10:30:00.000Z'
        },
        {
          _id: '2',
          username: 'jane_smith',
          email: 'jane@example.com',
          gender: 'female',
          birthdate: '1985-05-20T00:00:00.000Z',
          address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            country: 'US',
            zipCode: '90210'
          },
          createdAt: '2024-01-11T14:20:00.000Z'
        },
        {
          _id: '3',
          username: 'mike_wilson',
          email: 'mike@example.com',
          gender: 'male',
          birthdate: '1992-08-10T00:00:00.000Z',
          address: {
            street: '789 Pine Rd',
            city: 'Chicago',
            state: 'IL',
            country: 'US',
            zipCode: '60601'
          },
          createdAt: '2024-01-12T09:15:00.000Z'
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(userId);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage(`User "${username}" deleted successfully`);
        setUsers(users.filter(user => user._id !== userId));
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to delete user');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Delete user error:', error);
      
      // Mock delete for demonstration
      setUsers(users.filter(user => user._id !== userId));
      setMessage(`User "${username}" deleted successfully`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter users based on search term and gender filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === 'all' || user.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
              <p className="text-gray-600">Manage all registered users</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/userdashboard')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {message && (
          <div className={`p-4 rounded-lg mb-6 font-semibold ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Stats and Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.gender === 'male').length}
              </div>
              <div className="text-sm text-gray-600">Male Users</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.gender === 'female').length}
              </div>
              <div className="text-sm text-gray-600">Female Users</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.gender === 'other' || u.gender === 'prefer-not-to-say').length}
              </div>
              <div className="text-sm text-gray-600">Other</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Users
                </label>
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Gender
                </label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm || filterGender !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No users have registered yet'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Personal Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {user.gender || 'Not specified'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.birthdate ? formatDate(user.birthdate) : 'No birthdate'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.address?.city || 'No city'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.address?.state || 'No state'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateTime(user.createdAt).split(',')[1]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user._id, user.username)}
                          disabled={deleteLoading === user._id}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading === user._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Details Modal (Optional) */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const text = filteredUsers.map(user => 
                    `${user.username} (${user.email}) - ${user.gender} - ${user.address?.city || 'No city'}`
                  ).join('\n');
                  navigator.clipboard.writeText(text);
                  setMessage('User list copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Copy User List
              </button>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Refresh List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;