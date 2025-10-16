import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: "",
    startTime: "",
    endTime: "",
    quantity: 0, // Add quantity to time slot
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchDoctorData = async () => {
      const token = localStorage.getItem("token");
      const doctorId = localStorage.getItem("doctorId");

      if (!token || !doctorId) {
        navigate("/doctor/login");
        return;
      }

      try {
        // Fetch doctor data
        const doctorResponse = await axios.get(
          `http://localhost:5000/api/doctors/${doctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDoctorData(doctorResponse.data);

        // Fetch available time slots
        const timeSlotsResponse = await axios.get(
          `http://localhost:5000/api/doctors/${doctorId}/time-slots`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailableTimeSlots(timeSlotsResponse.data.availableTimeSlots || []);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        showMessage("error", "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorData();
  }, [navigate]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTimeSlot({ ...newTimeSlot, [name]: value });
  };

  const handleAddTimeSlot = async () => {
    if (!newTimeSlot.day || !newTimeSlot.startTime || !newTimeSlot.endTime || !newTimeSlot.quantity) {
      showMessage("error", "Please fill all fields");
      return;
    }

    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      showMessage("error", "End time must be after start time");
      return;
    }

    setIsAddingSlot(true);
    const token = localStorage.getItem("token");
    const doctorId = localStorage.getItem("doctorId");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/doctors/${doctorId}/time-slots`,
        newTimeSlot,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableTimeSlots(response.data.availableTimeSlots || []);
      setNewTimeSlot({ day: "", startTime: "", endTime: "", quantity: 0 });
      showMessage("success", "Time slot added successfully!");
    } catch (error) {
      console.error("Error adding time slot:", error);
      showMessage("error", error.response?.data?.error || "Error adding time slot");
    } finally {
      setIsAddingSlot(false);
    }
  };

  const handleDeleteTimeSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this time slot?")) return;

    const token = localStorage.getItem("token");
    const doctorId = localStorage.getItem("doctorId");

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/doctors/${doctorId}/time-slots/${slotId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableTimeSlots(response.data.availableTimeSlots || []);
      showMessage("success", "Time slot deleted successfully!");
    } catch (error) {
      console.error("Error deleting time slot:", error);
      showMessage("error", "Error deleting time slot");
    }
  };

  const getDayColor = (day) => {
    const colors = {
      Monday: "bg-blue-100 text-blue-800 border-blue-200",
      Tuesday: "bg-green-100 text-green-800 border-green-200",
      Wednesday: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Thursday: "bg-purple-100 text-purple-800 border-purple-200",
      Friday: "bg-red-100 text-red-800 border-red-200",
      Saturday: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Sunday: "bg-pink-100 text-pink-800 border-pink-200"
    };
    return colors[day] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return "Not set";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Dashboard</h3>
          <p className="text-gray-500 mt-2">Please wait while we load your information...</p>
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
            <div className="flex items-center space-x-4">
              {doctorData?.profilePicture && (
                <img
                  src={`http://localhost:5000/${doctorData.profilePicture}`}
                  alt="Profile"
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, Dr. {doctorData?.firstName} {doctorData?.lastName}
                </h1>
                <p className="text-gray-600">{doctorData?.specialization}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-semibold text-gray-700">{doctorData?.department}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === "success" 
              ? "bg-green-50 border-green-200 text-green-700" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <div className="flex items-center">
              {message.type === "success" ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Add Time Slot Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Add New Time Slot</h2>
            <p className="text-gray-600 mt-1">Schedule your available time slots for appointments</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Day Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day <span className="text-red-500">*</span></label>
                <select
                  name="day"
                  value={newTimeSlot.day}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  name="startTime"
                  value={newTimeSlot.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  name="endTime"
                  value={newTimeSlot.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="quantity"
                  value={newTimeSlot.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
              </div>
            </div>

            <button
              onClick={handleAddTimeSlot}
              disabled={isAddingSlot}
              className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isAddingSlot ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Slot...
                </div>
              ) : (
                "Add Time Slot"
              )}
            </button>
          </div>
        </div>

        {/* Available Time Slots */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Available Time Slots</h3>
            <p className="text-gray-600 mt-1">Your scheduled availability for patient appointments</p>
          </div>

          <div className="p-6">
            {availableTimeSlots.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Time Slots Scheduled</h4>
                <p className="text-gray-500">Add your available time slots using the form above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTimeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200 relative"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDayColor(slot.day)}`}>
                        {slot.day}
                      </span>
                      <button
                        onClick={() => handleDeleteTimeSlot(slot._id)}
                        className="text-red-400 hover:text-red-600 transition duration-200 p-1 rounded"
                        title="Delete time slot"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700 mb-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-gray-900">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    {/* Price indicator on time slot card */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Fee:</span>
                      <span className="font-semibold text-green-700">
                        {formatPrice(doctorData?.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
