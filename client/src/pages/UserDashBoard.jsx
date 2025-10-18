import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserAppointments();
    }
  }, [user, filter]);

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
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  };

  const fetchUserAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData || !userData._id) {
        console.error('User data not found');
        setAppointments([]);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/appointments/user/${userData._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        let filteredAppointments = data.appointments || [];

        // Apply filters
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filter) {
          case 'upcoming':
            filteredAppointments = filteredAppointments.filter(apt => 
              new Date(apt.appointmentDate) >= today && apt.status !== 'cancelled'
            );
            break;
          case 'past':
            filteredAppointments = filteredAppointments.filter(apt => 
              new Date(apt.appointmentDate) < today
            );
            break;
          case 'cancelled':
            filteredAppointments = filteredAppointments.filter(apt => 
              apt.status === 'cancelled'
            );
            break;
          default:
            // Show all appointments
            break;
        }

        // Sort by date (most recent first)
        filteredAppointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        
        setAppointments(filteredAppointments);
      } else {
        console.error('Failed to fetch appointments');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData._id
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Appointment cancelled successfully!');
        fetchUserAppointments(); // Refresh the list
      } else {
        alert(data.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Network error. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'scheduled': { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      'confirmed': { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      'completed': { color: 'bg-gray-100 text-gray-800', label: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isUpcomingAppointment = (appointmentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(appointmentDate) >= today;
  };

  const canCancelAppointment = (appointment) => {
    const today = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    const timeDiff = appointmentDate.getTime() - today.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return (appointment.status === 'scheduled' || appointment.status === 'confirmed') && hoursDiff > 24;
  };

  const formatAppointmentDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading your appointments...</div>
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
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/list" 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Book New Appointment
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex space-x-4">
            {[
              { id: 'all', label: 'All Appointments', count: appointments.length },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'past', label: 'Past' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'upcoming' ? 'No Upcoming Appointments' :
                 filter === 'past' ? 'No Past Appointments' :
                 filter === 'cancelled' ? 'No Cancelled Appointments' : 'No Appointments Found'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {filter === 'all' 
                  ? "You haven't booked any appointments yet. Start by booking your first appointment with one of our qualified doctors."
                  : `No ${filter} appointments found.`}
              </p>
              {filter === 'all' && (
                <Link 
                  to="/list" 
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Book Your First Appointment
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.doctorName}
                        </h3>
                        {getStatusBadge(appointment.status)}
                        {appointment.appointmentNumber && (
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{appointment.appointmentNumber}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Specialty:</span>
                          <p className="text-gray-900">{appointment.doctorSpecialization}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Date:</span>
                          <p className="text-gray-900">
                            {formatAppointmentDate(appointment.appointmentDate)}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Time:</span>
                          <p className="text-gray-900">
                            {appointment.timeSlot?.startTime} - {appointment.timeSlot?.endTime}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Patient:</span>
                          <p className="text-gray-900">{appointment.patientDetails?.fullName}</p>
                        </div>
                      </div>

                      {appointment.patientDetails?.medicalConcern && (
                        <div className="mt-3">
                          <span className="font-semibold text-gray-700">Medical Concern:</span>
                          <p className="text-gray-900 mt-1">{appointment.patientDetails.medicalConcern}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {canCancelAppointment(appointment) && (
                        <button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm"
                        >
                          Cancel
                        </button>
                      )}
                      
                      {isUpcomingAppointment(appointment.appointmentDate) && appointment.status !== 'cancelled' && (
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm">
                          Reschedule
                        </button>
                      )}
                      
                      <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {appointments.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {appointments.filter(apt => isUpcomingAppointment(apt.appointmentDate) && apt.status !== 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Upcoming Appointments</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Confirmed</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {appointments.filter(apt => apt.status === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Cancelled</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;