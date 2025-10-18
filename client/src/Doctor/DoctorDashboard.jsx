// src/pages/DoctorDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      const doctorId = localStorage.getItem("doctorId");

      if (!token || !doctorId) {
        navigate("/doctor/login");
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch doctor data
        const doctorResponse = await axios.get(
          `http://localhost:5000/api/doctors/${doctorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDoctorData(doctorResponse.data);

        // Fetch dashboard stats
        await fetchStats(token, doctorId);
        
        // Fetch recent appointments
        await fetchRecentAppointments(token, doctorId);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const fetchStats = async (token, doctorId) => {
    try {
      const statsResponse = await axios.get(
        `http://localhost:5000/api/appointments/doctor/${doctorId}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(statsResponse.data);
    } catch (error) {
      console.log("Stats endpoint not available, using mock data");
      // Fallback mock data
      setStats({
        totalAppointments: 24,
        todayAppointments: 3,
        pendingAppointments: 8,
        completedAppointments: 16
      });
    }
  };

  const fetchRecentAppointments = async (token, doctorId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await axios.get(
        `http://localhost:5000/api/appointments/doctor/${doctorId}?date=${today}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecentAppointments(appointmentsResponse.data.slice(0, 5));
    } catch (error) {
      console.log("Appointments endpoint not available, using mock data");
      // Fallback mock data
      setRecentAppointments([
        {
          _id: 1,
          patientName: "John Doe",
          date: "2024-01-15",
          time: "10:00 AM",
          status: "confirmed",
          type: "Consultation"
        },
        {
          _id: 2,
          patientName: "Jane Smith",
          date: "2024-01-15",
          time: "11:30 AM",
          status: "pending",
          type: "Follow-up"
        },
        {
          _id: 3,
          patientName: "Mike Johnson",
          date: "2024-01-15",
          time: "2:00 PM",
          status: "completed",
          type: "Checkup"
        }
      ]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const goToDoctorSchedule = () => {
    navigate("/doctor/schedule");
  };

  const goToAppointments = () => {
    navigate("/doctor/appointments");
  };

  const goToMedicalRecords = () => {
    navigate("/doctor/medical-records");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "scheduled":
        return "bg-green-100 text-green-800";
      case "pending":
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
      case "finished":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Handle both "HH:MM" and "HH:MM AM/PM" formats
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    // Convert "HH:MM" to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getInitials = (name) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Dr. {doctorData?.firstName} {doctorData?.lastName}
                </p>
                <p className="text-sm text-gray-500">{doctorData?.specialization}</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  {doctorData?.profilePicture ? (
                    <img
                      src={`http://localhost:5000/${doctorData.profilePicture}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {getInitials(`${doctorData?.firstName} ${doctorData?.lastName}`)}
                      </span>
                    </div>
                  )}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to={`/doctor/${doctorData?._id}`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"

                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {["overview", "appointments", "patients", "schedule"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-6 mb-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold">
                  Welcome back, Dr. {doctorData?.firstName}!
                </h2>
                <p className="text-blue-100 mt-2">
                  Here's what's happening with your practice today.
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-100">Today</p>
                <p className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                label: "Today's Appointments", 
                value: stats.todayAppointments, 
                color: "blue",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              },
              { 
                label: "Completed", 
                value: stats.completedAppointments, 
                color: "green",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              },
              { 
                label: "Pending", 
                value: stats.pendingAppointments, 
                color: "yellow",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              },
              { 
                label: "Total Patients", 
                value: stats.totalAppointments, 
                color: "purple",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 bg-${stat.color}-500 rounded-full flex items-center justify-center`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                        <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Appointments */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Today's Appointments
                  </h3>
                  <button 
                    onClick={goToAppointments}
                    className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((appointment) => (
                      <div key={appointment._id || appointment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {getInitials(appointment.patientName)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.patientName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatTime(appointment.time)} • {appointment.type}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                      <p className="mt-1 text-sm text-gray-500">You don't have any appointments scheduled for today.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Profile Summary */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Quick Actions
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <Link
                    to=  {`/doctor/${doctorData?._id}`}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200 group"
                  >
                    <svg className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Update Profile</span>
                  </Link>

                  <button
                    onClick={goToDoctorSchedule}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200 w-full text-left group"
                  >
                    <svg className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Manage Schedule</span>
                  </button>

                  <button 
                    onClick={goToAppointments}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200 w-full text-left group"
                  >
                    <svg className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">View Appointments</span>
                  </button>

                  <button 
                    onClick={goToMedicalRecords}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200 w-full text-left group"
                  >
                    <svg className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Medical Records</span>
                  </button>
                </div>
              </div>

              {/* Profile Summary */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Profile Summary
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Specialization</span>
                    <span className="text-sm font-medium text-gray-900">{doctorData?.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Department</span>
                    <span className="text-sm font-medium text-gray-900">{doctorData?.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">License No.</span>
                    <span className="text-sm font-medium text-gray-900">{doctorData?.medicalLicenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm font-medium text-gray-900">{doctorData?.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900 truncate">{doctorData?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;