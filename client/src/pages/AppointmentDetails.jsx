import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/appointments/${id}`);
      setAppointment(response.data);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      setError("Failed to load appointment details.");
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700">Loading Appointment Details</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error || "Appointment not found"}</p>
              <button
                onClick={() => navigate("/my-appointments")}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Back to Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate("/my-appointments")}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Appointments
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Appointment Details
          </h1>
          <p className="text-lg text-gray-600">
            #{appointment.appointmentNumber}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Status Badge */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Dr. {appointment.doctorName}
              </h2>
              <p className="text-blue-600 font-medium">{appointment.doctorSpecialization}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              appointment.status === "confirmed" ? "bg-green-100 text-green-800" :
              appointment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
              appointment.status === "cancelled" ? "bg-red-100 text-red-800" :
              "bg-blue-100 text-blue-800"
            }`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appointment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Appointment Information</h3>
              
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{formatDate(appointment.appointmentDate)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold text-gray-900">
                  {formatTime(appointment.timeSlot.startTime)} - {formatTime(appointment.timeSlot.endTime)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Appointment Number</p>
                <p className="font-semibold text-gray-900">#{appointment.appointmentNumber}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Booked On</p>
                <p className="font-semibold text-gray-900">
                  {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
              
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">{appointment.patientDetails.fullName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-semibold text-gray-900">{appointment.patientDetails.phoneNumber}</p>
              </div>
              
              {appointment.patientDetails.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{appointment.patientDetails.email}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600">Medical Concern</p>
                <p className="font-semibold text-gray-900">{appointment.patientDetails.medicalConcern}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(appointment.patientDetails.previousConditions || appointment.patientDetails.address) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointment.patientDetails.previousConditions && (
                  <div>
                    <p className="text-sm text-gray-600">Previous Conditions</p>
                    <p className="font-semibold text-gray-900">{appointment.patientDetails.previousConditions}</p>
                  </div>
                )}
                
                {appointment.patientDetails.address && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-gray-900">{appointment.patientDetails.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/my-appointments")}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
              >
                Back to Appointments
              </button>
              <button
                onClick={() => navigate(`/doctordetails/${appointment.doctorId}`)}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
              >
                View Doctor Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;