import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setEditForm({
        username: userObj.username || '',
        email: userObj.email || '',
        gender: userObj.gender || 'prefer-not-to-say',
        birthdate: userObj.birthdate ? userObj.birthdate.split('T')[0] : '',
        address: {
          street: userObj.address?.street || '',
          city: userObj.address?.city || '',
          state: userObj.address?.state || '',
          country: userObj.address?.country || 'US',
          zipCode: userObj.address?.zipCode || ''
        }
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = () => {
    // Mock data for dashboard
    const mockAppointments = [
      {
        id: 1,
        doctorName: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        date: '2024-01-20',
        time: '10:00 AM',
        status: 'confirmed'
      },
      {
        id: 2,
        doctorName: 'Dr. Mike Chen',
        specialty: 'Dermatology',
        date: '2024-01-22',
        time: '2:30 PM',
        status: 'pending'
      }
    ];
    setAppointments(mockAppointments);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      gender: user.gender || 'prefer-not-to-say',
      birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        country: user.address?.country || 'US',
        zipCode: user.address?.zipCode || ''
      }
    });
    setMessage('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          username: editForm.username,
          gender: editForm.gender,
          birthdate: editForm.birthdate,
          address: editForm.address
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage and state
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Update profile error:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">HealthCare Dashboard</h1>
              <p className="text-gray-600">
                {getGreeting()}, <strong>{user?.username}</strong>! 👋
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                🔔
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen">
          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'appointments', label: '📅 Appointments' },
              { id: 'doctors', label: '👨‍⚕️ Find Doctors' },
              { id: 'profile', label: '👤 Profile' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
                  <div className="text-3xl">📅</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                    <div className="text-sm text-gray-600 font-semibold">Total Appointments</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
                  <div className="text-3xl">✅</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {appointments.filter(a => a.status === 'confirmed').length}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Confirmed</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
                  <div className="text-3xl">👨‍⚕️</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">2</div>
                    <div className="text-sm text-gray-600 font-semibold">Doctors</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
                  <div className="text-3xl">⭐</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">4.8</div>
                    <div className="text-sm text-gray-600 font-semibold">Avg. Rating</div>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                  <Link to="/list" className="text-blue-600 hover:text-blue-700 font-semibold">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {appointments.slice(0, 3).map(appointment => (
                    <div key={appointment.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.doctorName}</h4>
                        <p className="text-gray-600 text-sm">{appointment.specialty}</p>
                        <p className="text-gray-900 font-medium text-sm">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link to="/list" className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer block">
                    <div className="text-2xl mb-3">🔍</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Find Doctors</h3>
                    <p className="text-gray-600 text-sm">
                      Browse specialists and book appointments
                    </p>
                  </Link>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="text-2xl mb-3">💊</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Medications</h3>
                    <p className="text-gray-600 text-sm">
                      View your prescribed medications
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="text-2xl mb-3">📋</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Medical History</h3>
                    <p className="text-gray-600 text-sm">
                      Access your health records
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="text-2xl mb-3">🏥</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Emergency</h3>
                    <p className="text-gray-600 text-sm">
                      Emergency contacts and info
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button 
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleCancelEdit} 
                      disabled={saveLoading}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile} 
                      disabled={saveLoading}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
                    >
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {message && (
                <div className={`p-4 rounded-lg mb-6 font-semibold ${
                  message.includes('successfully') 
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">Username:</span>
                        <span className="text-gray-900">{user?.username}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">Email:</span>
                        <span className="text-gray-900">{user?.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">Gender:</span>
                        <span className="text-gray-900 capitalize">
                          {user?.gender || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">Birthdate:</span>
                        <span className="text-gray-900">
                          {user?.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'Not provided'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Address Information */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Street:</span>
                          <span className="text-gray-900">{user?.address?.street || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">City:</span>
                          <span className="text-gray-900">{user?.address?.city || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">State:</span>
                          <span className="text-gray-900">{user?.address?.state || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Zip Code:</span>
                          <span className="text-gray-900">{user?.address?.zipCode || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Country:</span>
                          <span className="text-gray-900">{user?.address?.country || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={editForm.username}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                          disabled
                        />
                        <small className="text-gray-500 text-xs italic">Email cannot be changed</small>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={editForm.gender}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="prefer-not-to-say">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Birthdate
                        </label>
                        <input
                          type="date"
                          name="birthdate"
                          value={editForm.birthdate}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Street
                          </label>
                          <input
                            type="text"
                            name="address.street"
                            value={editForm.address.street}
                            onChange={handleEditChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter street address"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              name="address.city"
                              value={editForm.address.city}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              State
                            </label>
                            <input
                              type="text"
                              name="address.state"
                              value={editForm.address.state}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="State"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Zip Code
                            </label>
                            <input
                              type="text"
                              name="address.zipCode"
                              value={editForm.address.zipCode}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Zip Code"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Country
                            </label>
                            <input
                              type="text"
                              name="address.country"
                              value={editForm.address.country}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other tabs */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Appointments</h2>
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div key={appointment.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <h4 className="font-semibold text-gray-900">{appointment.doctorName}</h4>
                      <p className="text-gray-600 text-sm">{appointment.specialty}</p>
                      <p className="text-gray-900 font-medium text-sm">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Find Doctors</h2>
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Browse Qualified Healthcare Professionals
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Find the right specialist for your needs and book appointments easily.
                </p>
                <Link 
                  to="/list" 
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Browse Doctors
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;