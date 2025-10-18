import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, past, cancelled
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const navigate = useNavigate();

  // Get user ID from localStorage (in real app, get from auth context)
  const userId = localStorage.getItem("userId") || "demo-user-123";

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log(`📋 Fetching appointments for user: ${userId}`);

      const response = await axios.get(
        `http://localhost:5000/api/appointments/user/${userId}`,
        {
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setAppointments(response.data.appointments);
        console.log(`✅ Found ${response.data.appointments.length} appointments`);
      } else {
        throw new Error(response.data.error || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      setError(
        error.response?.data?.error ||
        error.message ||
        "Failed to load appointments. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    const now = new Date();
    
    let filtered = appointments;
    
    switch (filter) {
      case "upcoming":
        filtered = appointments.filter(apt => 
          new Date(apt.appointmentDate) >= now && 
          apt.status !== "cancelled"
        );
        break;
      case "past":
        filtered = appointments.filter(apt => 
          new Date(apt.appointmentDate) < now && 
          apt.status !== "cancelled"
        );
        break;
      case "cancelled":
        filtered = appointments.filter(apt => apt.status === "cancelled");
        break;
      default:
        filtered = appointments;
    }
    
    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setCancellingId(appointmentId);
      
      const response = await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
        { userId: userId }
      );

      if (response.data.success) {
        // Update local state
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, status: "cancelled" }
              : apt
          )
        );
        
        setShowCancelModal(false);
        setSelectedAppointment(null);
        
        console.log("✅ Appointment cancelled successfully");
      }
    } catch (error) {
      console.error("❌ Error cancelling appointment:", error);
      alert(
        error.response?.data?.error ||
        "Failed to cancel appointment. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      confirmed: { color: "bg-green-100 text-green-800", text: "Confirmed" },
      cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" },
      completed: { color: "bg-blue-100 text-blue-800", text: "Completed" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const isAppointmentUpcoming = (appointmentDate) => {
    return new Date(appointmentDate) >= new Date();
  };

  const canCancelAppointment = (appointment) => {
    return (
      isAppointmentUpcoming(appointment.appointmentDate) && 
      ["pending", "confirmed"].includes(appointment.status)
    );
  };

  const getAppointmentStats = () => {
    const now = new Date();
    
    const total = appointments.length;
    const upcoming = appointments.filter(apt => 
      new Date(apt.appointmentDate) >= now && 
      apt.status !== "cancelled"
    ).length;
    const past = appointments.filter(apt => 
      new Date(apt.appointmentDate) < now && 
      apt.status !== "cancelled"
    ).length;
    const cancelled = appointments.filter(apt => apt.status === "cancelled").length;

    return { total, upcoming, past, cancelled };
  };

  const stats = getAppointmentStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700">Loading Your Appointments</h3>
            <p className="text-gray-500 mt-2">Please wait while we load your appointment history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Appointments</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchAppointments}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-lg text-gray-600">
            Manage and view your medical appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.past}</div>
            <div className="text-sm text-gray-600">Past</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Appointments
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "upcoming"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "past"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter("cancelled")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-4">
                {filter === "all" 
                  ? "You don't have any appointments yet." 
                  : `No ${filter} appointments found.`}
              </p>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  View All Appointments
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div key={appointment._id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Appointment Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Dr. {appointment.doctorName}
                          </h3>
                          <p className="text-gray-600">{appointment.doctorSpecialization}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(appointment.status)}
                          <p className="text-sm text-gray-500 mt-1">
                            #{appointment.appointmentNumber}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Date & Time</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(appointment.appointmentDate)} •{" "}
                            {formatTime(appointment.timeSlot.startTime)} -{" "}
                            {formatTime(appointment.timeSlot.endTime)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Patient</p>
                          <p className="font-semibold text-gray-900">
                            {appointment.patientDetails.fullName}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {appointment.patientDetails.phoneNumber}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600">Medical Concern</p>
                          <p className="font-semibold text-gray-900">
                            {appointment.patientDetails.medicalConcern}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600">Booked On</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(appointment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
                      {canCancelAppointment(appointment) && (
                        <button
                          onClick={() => openCancelModal(appointment)}
                          disabled={cancellingId === appointment._id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
                        >
                          {cancellingId === appointment._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Cancelling...
                            </>
                          ) : (
                            "Cancel Appointment"
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/appointments/${appointment._id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                      >
                        View Details
                      </button>
                      
                      {isAppointmentUpcoming(appointment.appointmentDate) && (
                        <button
                          onClick={() => navigate(`/doctordetails/${appointment.doctorId}`)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                        >
                          View Doctor
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-6">
          <button
            onClick={fetchAppointments}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Refresh Appointments
          </button>
        </div>
      </div>

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Cancel Appointment</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to cancel your appointment with{" "}
                <strong>Dr. {selectedAppointment.doctorName}</strong>?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Appointment Details:</strong><br />
                  Date: {formatDate(selectedAppointment.appointmentDate)}<br />
                  Time: {formatTime(selectedAppointment.timeSlot.startTime)} - {formatTime(selectedAppointment.timeSlot.endTime)}<br />
                  Patient: {selectedAppointment.patientDetails.fullName}
                </p>
              </div>

              <p className="text-red-600 text-sm mb-4">
                This action cannot be undone. The time slot will become available for other patients.
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={() => handleCancelAppointment(selectedAppointment._id)}
                  disabled={cancellingId === selectedAppointment._id}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {cancellingId === selectedAppointment._id ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;