import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("today");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    const doctorIdFromLocalStorage = localStorage.getItem("doctorId");
    if (!doctorIdFromLocalStorage) {
      navigate("/doctor/login");
      return;
    }
    setDoctorId(doctorIdFromLocalStorage);
    fetchDoctorAppointments(doctorIdFromLocalStorage);
  }, [navigate]);

  const fetchDoctorAppointments = async (doctorId) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`http://localhost:5000/api/appointments/doctor/${doctorId}`);
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      const mockAppointments = generateMockAppointments();
      setAppointments(mockAppointments);
      setError("Connected to demo mode. Using sample appointment data.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAppointments = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        _id: "1",
        appointmentNumber: "APT-202412-0001",
        doctorId: doctorId,
        doctorName: "Dr. Apsara Chanuka",
        doctorSpecialization: "Neurology",
        price: 150.00,
        patientDetails: {
          fullName: "John Doe",
          email: "john@example.com",
          phoneNumber: "+1234567890",
          dateOfBirth: "1985-03-15",
          gender: "male",
          address: "123 Main Street, City, State",
          medicalConcern: "Headaches and migraine consultation",
          previousConditions: "Occasional migraines"
        },
        appointmentDate: today.toISOString(),
        timeSlot: {
          day: "Monday",
          startTime: "09:00",
          endTime: "09:30",
          slotId: "slot1"
        },
        status: "confirmed",
        createdAt: new Date().toISOString()
      },
      {
        _id: "2",
        appointmentNumber: "APT-202412-0002",
        doctorId: doctorId,
        doctorName: "Dr. Apsara Chanuka",
        doctorSpecialization: "Neurology",
        price: 150.00,
        patientDetails: {
          fullName: "Jane Smith",
          email: "jane@example.com",
          phoneNumber: "+1234567891",
          dateOfBirth: "1990-07-22",
          gender: "female",
          address: "456 Oak Avenue, City, State",
          medicalConcern: "Follow-up for previous treatment",
          previousConditions: "None"
        },
        appointmentDate: today.toISOString(),
        timeSlot: {
          day: "Monday",
          startTime: "10:00",
          endTime: "10:45",
          slotId: "slot2"
        },
        status: "pending",
        createdAt: new Date().toISOString()
      },
      {
        _id: "3",
        appointmentNumber: "APT-202412-0003",
        doctorId: doctorId,
        doctorName: "Dr. Apsara Chanuka",
        doctorSpecialization: "Neurology",
        price: 200.00,
        patientDetails: {
          fullName: "Robert Johnson",
          email: "robert@example.com",
          phoneNumber: "+1234567892",
          dateOfBirth: "1978-11-30",
          gender: "male",
          address: "789 Pine Road, City, State",
          medicalConcern: "Neurological examination",
          previousConditions: "High blood pressure"
        },
        appointmentDate: tomorrow.toISOString(),
        timeSlot: {
          day: "Tuesday",
          startTime: "14:00",
          endTime: "14:45",
          slotId: "slot3"
        },
        status: "confirmed",
        createdAt: new Date().toISOString()
      }
    ];
  };

  const filteredAppointments = appointments.filter(appointment => {
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case "today":
        const appointmentDay = new Date(appointmentDate);
        appointmentDay.setHours(0, 0, 0, 0);
        return appointmentDay.getTime() === today.getTime();
      case "upcoming":
        return appointmentDate >= now && (appointment.status === "pending" || appointment.status === "confirmed");
      case "pending":
        return appointment.status === "pending";
      case "all":
        return true;
      default:
        return true;
    }
  });

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/status`, { status: newStatus });
      setAppointments(prev => prev.map(apt => apt._id === appointmentId ? { ...apt, status: newStatus } : apt));
      setShowModal(false);
      setSelectedAppointment(null);
      alert(`Appointment ${newStatus} successfully.`);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionClick = (appointment, action) => {
    setSelectedAppointment(appointment);
    
    switch (action) {
      case "confirm":
        handleStatusUpdate(appointment._id, "confirmed");
        break;
      case "complete":
        handleStatusUpdate(appointment._id, "completed");
        break;
      case "cancel":
        handleStatusUpdate(appointment._id, "cancelled");
        break;
      case "view":
        setShowModal(true);
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return "✓";
      case "pending":
        return "⏳";
      case "cancelled":
        return "✕";
      case "completed":
        return "✓";
      default:
        return "●";
    }
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return "Not set";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAppointmentStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    });

    const upcomingAppointments = appointments.filter(apt => 
      new Date(apt.appointmentDate) >= new Date() && 
      (apt.status === "pending" || apt.status === "confirmed")
    );

    const totalRevenue = appointments
      .filter(apt => apt.status === "completed" || apt.status === "confirmed")
      .reduce((sum, apt) => sum + (apt.price || 0), 0);

    return {
      total: appointments.length,
      today: todayAppointments.length,
      upcoming: upcomingAppointments.length,
      pending: appointments.filter(apt => apt.status === "pending").length,
      totalRevenue
    };
  };

  const stats = getAppointmentStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Appointments</h3>
          <p className="text-gray-500 mt-2">Please wait while we load your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600 mt-1">Manage your patient appointments and schedule</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/doctor/schedule")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Manage Schedule
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Demo Mode Notice */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-800 font-medium">Demo Mode Active</p>
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Revenue Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Confirmed Revenue</p>
              <p className="text-2xl font-bold text-green-700">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending Revenue</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatPrice(appointments.filter(apt => apt.status === "pending").reduce((sum, apt) => sum + (apt.price || 0), 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Average per Appointment</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total > 0 ? formatPrice(stats.totalRevenue / stats.total) : formatPrice(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("today")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "today" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "upcoming" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "pending" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Appointments
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {filter === "today" && "Today's Appointments"}
              {filter === "upcoming" && "Upcoming Appointments"}
              {filter === "pending" && "Pending Approval"}
              {filter === "all" && "All Appointments"}
              <span className="text-gray-500 ml-2">({filteredAppointments.length})</span>
            </h2>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h4>
              <p className="text-gray-500">
                {filter === "today" 
                  ? "You don't have any appointments scheduled for today." 
                  : `No ${filter} appointments found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div key={appointment._id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patientDetails.fullName}
                          </h3>
                          <p className="text-gray-600">
                            {formatDate(appointment.appointmentDate)} • {formatTime(appointment.timeSlot.startTime)} - {formatTime(appointment.timeSlot.endTime)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                            <span className="mr-1">{getStatusIcon(appointment.status)}</span>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {formatPrice(appointment.price)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">
                            <strong>Contact:</strong> {appointment.patientDetails.phoneNumber}
                          </p>
                          <p className="text-gray-600">
                            <strong>Email:</strong> {appointment.patientDetails.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">
                            <strong>Appointment ID:</strong> {appointment.appointmentNumber}
                          </p>
                          <p className="text-gray-600">
                            <strong>Age/Gender:</strong> 
                            {` ${calculateAge(appointment.patientDetails.dateOfBirth)} years / ${appointment.patientDetails.gender || "Not specified"}`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <strong>Medical Concern:</strong> {appointment.patientDetails.medicalConcern}
                        </p>
                        {appointment.patientDetails.previousConditions && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Previous Conditions:</strong> {appointment.patientDetails.previousConditions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleActionClick(appointment, "view")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                      >
                        View Details
                      </button>
                      
                      {appointment.status === "pending" && (
                        <button
                          onClick={() => handleActionClick(appointment, "confirm")}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50"
                        >
                          {actionLoading ? "Confirming..." : "Confirm"}
                        </button>
                      )}
                      
                      {(appointment.status === "pending" || appointment.status === "confirmed") && (
                        <button
                          onClick={() => handleActionClick(appointment, "cancel")}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium disabled:opacity-50"
                        >
                          {actionLoading ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                      
                      {appointment.status === "confirmed" && (
                        <button
                          onClick={() => handleActionClick(appointment, "complete")}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-medium disabled:opacity-50"
                        >
                          {actionLoading ? "Completing..." : "Complete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Appointment Details</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Price Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-900 mb-2">Payment Information</h4>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-green-700 font-medium">Consultation Fee</p>
                      <p className="text-green-600 text-sm">Standard consultation charge</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">{formatPrice(selectedAppointment.price)}</p>
                      <p className="text-green-600 text-sm">
                        {selectedAppointment.status === "completed" ? "Paid" : 
                         selectedAppointment.status === "confirmed" ? "Confirmed" : 
                         selectedAppointment.status === "pending" ? "Pending Payment" : "Cancelled"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Full Name:</strong> {selectedAppointment.patientDetails.fullName}</p>
                      <p><strong>Phone:</strong> {selectedAppointment.patientDetails.phoneNumber}</p>
                      <p><strong>Email:</strong> {selectedAppointment.patientDetails.email}</p>
                    </div>
                    <div>
                      <p><strong>Gender:</strong> {selectedAppointment.patientDetails.gender || "Not specified"}</p>
                      <p><strong>Date of Birth:</strong> {selectedAppointment.patientDetails.dateOfBirth ? formatDate(selectedAppointment.patientDetails.dateOfBirth) : "Not provided"}</p>
                      {selectedAppointment.patientDetails.dateOfBirth && (
                        <p><strong>Age:</strong> {calculateAge(selectedAppointment.patientDetails.dateOfBirth)} years</p>
                      )}
                    </div>
                  </div>
                  {selectedAppointment.patientDetails.address && (
                    <p className="mt-2 text-sm"><strong>Address:</strong> {selectedAppointment.patientDetails.address}</p>
                  )}
                </div>

                {/* Appointment Details */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)}</p>
                      <p><strong>Time:</strong> {formatTime(selectedAppointment.timeSlot.startTime)} - {formatTime(selectedAppointment.timeSlot.endTime)}</p>
                      <p><strong>Day:</strong> {selectedAppointment.timeSlot.day}</p>
                    </div>
                    <div>
                      <p><strong>Appointment ID:</strong> {selectedAppointment.appointmentNumber}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                          {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                        </span>
                      </p>
                      <p><strong>Booked On:</strong> {formatDate(selectedAppointment.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm text-gray-700">Medical Concern:</p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
                        {selectedAppointment.patientDetails.medicalConcern}
                      </p>
                    </div>
                    {selectedAppointment.patientDetails.previousConditions && (
                      <div>
                        <p className="font-semibold text-sm text-gray-700">Previous Conditions:</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
                          {selectedAppointment.patientDetails.previousConditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;