import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AppointmentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get appointment data from navigation state or fetch from API
    if (location.state?.appointment && location.state?.doctor) {
      setAppointment(location.state.appointment);
      setDoctor(location.state.doctor);
      setIsLoading(false);
    } else {
      // If no state, redirect to home
      navigate("/");
    }
  }, [location, navigate]);

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simple text version for download
    const content = `
Appointment Confirmation
=======================

Appointment Number: ${appointment?.appointmentNumber}
Status: ${appointment?.status}

Doctor Information:
------------------
Name: Dr. ${doctor?.firstName} ${doctor?.lastName}
Specialization: ${doctor?.specialization}
Department: ${doctor?.department}

Appointment Details:
-------------------
Date: ${formatDate(appointment?.appointmentDate)}
Time: ${formatTime(appointment?.timeSlot.startTime)} - ${formatTime(appointment?.timeSlot.endTime)}
Day: ${appointment?.timeSlot.day}

Patient Information:
-------------------
Name: ${appointment?.patientDetails.fullName}
Phone: ${appointment?.patientDetails.phoneNumber}
Email: ${appointment?.patientDetails.email}
Gender: ${appointment?.patientDetails.gender}
Date of Birth: ${appointment?.patientDetails.dateOfBirth ? new Date(appointment.patientDetails.dateOfBirth).toLocaleDateString() : 'Not provided'}

Medical Concern:
${appointment?.patientDetails.medicalConcern}

Previous Conditions:
${appointment?.patientDetails.previousConditions || 'None provided'}

Address:
${appointment?.patientDetails.address || 'Not provided'}

Important Notes:
---------------
- Please arrive 15 minutes before your scheduled time
- Bring your ID and insurance card
- Bring a list of current medications
- Contact the clinic if you need to reschedule

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-${appointment?.appointmentNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Confirmation</h3>
          <p className="text-gray-500 mt-2">Please wait while we load your appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Appointment Not Found</h3>
          <p className="text-gray-500 mb-4">We couldn't find your appointment details.</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 border border-green-200 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Appointment Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your appointment has been successfully booked
          </p>
          <div className="mt-4 bg-blue-100 border border-blue-200 rounded-lg px-4 py-2 inline-block">
            <span className="text-blue-800 font-semibold">
              Appointment Number: {appointment.appointmentNumber}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-700 text-white p-6 print:bg-black print:text-black">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Appointment Confirmation</h2>
                <p className="text-green-100">Medical Appointment System</p>
              </div>
              <div className="mt-4 md:mt-0 text-center md:text-right">
                <p className="text-lg font-semibold">{appointment.appointmentNumber}</p>
                <p className="text-green-100 capitalize">{appointment.status}</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Appointment Details */}
              <div className="space-y-6">
                {/* Doctor Information */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Doctor Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Doctor</p>
                      <p className="font-semibold text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-semibold text-gray-900">{doctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-semibold text-gray-900">{doctor.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-semibold text-gray-900">{doctor.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Appointment Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-semibold text-gray-900">
                        {formatTime(appointment.timeSlot.startTime)} - {formatTime(appointment.timeSlot.endTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Day</p>
                      <p className="font-semibold text-gray-900">{appointment.timeSlot.day}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Booked On</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(appointment.createdAt).toLocaleDateString()} at {new Date(appointment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Patient Information */}
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Patient Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold text-gray-900">{appointment.patientDetails.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-semibold text-gray-900">{appointment.patientDetails.phoneNumber}</p>
                    </div>
                    {appointment.patientDetails.email && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900">{appointment.patientDetails.email}</p>
                      </div>
                    )}
                    {appointment.patientDetails.gender && (
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-semibold text-gray-900 capitalize">{appointment.patientDetails.gender}</p>
                      </div>
                    )}
                    {appointment.patientDetails.dateOfBirth && (
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(appointment.patientDetails.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {appointment.patientDetails.address && (
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-semibold text-gray-900">{appointment.patientDetails.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Medical Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Medical Concern</p>
                      <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {appointment.patientDetails.medicalConcern}
                      </p>
                    </div>
                    {appointment.patientDetails.previousConditions && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Previous Conditions</p>
                        <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {appointment.patientDetails.previousConditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Important Instructions
              </h3>
              <ul className="text-yellow-800 space-y-2">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Please arrive <strong>15 minutes before</strong> your scheduled appointment time
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Bring your <strong>government-issued ID</strong> and <strong>insurance card</strong>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Bring a list of your <strong>current medications</strong> and <strong>allergies</strong>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Contact the clinic at least <strong>24 hours in advance</strong> if you need to reschedule
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Bring any relevant <strong>medical records</strong> or <strong>test results</strong>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center print:hidden">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Confirmation
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Details
              </button>
              <Link
                to="/"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>If you have any questions, please contact the clinic at {doctor.phoneNumber}</p>
          <p className="mt-1">This confirmation was generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;