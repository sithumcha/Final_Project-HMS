




import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useReactToPrint } from 'react-to-print';

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [doctor, setDoctor] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // NEW: User ID state - in a real app, this would come from auth context
  const [userId, setUserId] = useState("");
  
  // Get selected slot from navigation state
  const preselectedSlot = location.state?.selectedSlot;
  
  const [selectedSlot, setSelectedSlot] = useState(preselectedSlot || null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [patientDetails, setPatientDetails] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    medicalConcern: "",
    previousConditions: ""
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
    upiId: "",
    insuranceProvider: "",
    insuranceId: "",
    policyNumber: ""
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const billRef = useRef();

  // NEW: Initialize user ID (in real app, get from auth context/localStorage)
  useEffect(() => {
    // For demo purposes - in real app, get from authentication context
    const currentUserId = localStorage.getItem("userId") || "demo-user-123";
    setUserId(currentUserId);
    
    // If no user ID found, you might want to redirect to login
    if (!currentUserId) {
      console.warn("No user ID found. User might need to log in.");
      // navigate("/login"); // Uncomment to redirect to login
    }
  }, [navigate]);

  // Print bill functionality
  const handlePrint = useReactToPrint({
    content: () => billRef.current,
    documentTitle: `Appointment-Bill-${patientDetails.fullName}-${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => console.log("Bill printed successfully")
  });

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch doctor basic information
        const doctorResponse = await axios.get(
          `http://localhost:5000/api/doctors/${id}`
        );
        setDoctor(doctorResponse.data);

        // Fetch doctor's available time slots
        const timeSlotsResponse = await axios.get(
          `http://localhost:5000/api/doctors/${id}/`
        );
        const slots = timeSlotsResponse.data.availableTimeSlots || [];
        setAvailableTimeSlots(slots);

        // Fetch appointment statistics to check availability
        try {
          const statsResponse = await axios.get(
            `http://localhost:5000/api/appointments/stats/${id}`
          );
          setAppointmentStats(statsResponse.data);
        } catch (statsError) {
          console.warn("Could not fetch appointment stats:", statsError);
        }

        // If we have a preselected slot, validate it's still available
        if (preselectedSlot) {
          const isSlotStillAvailable = slots.some(slot => 
            slot._id === preselectedSlot._id &&
            slot.day === preselectedSlot.day &&
            slot.startTime === preselectedSlot.startTime &&
            slot.endTime === preselectedSlot.endTime
          );
          
          if (!isSlotStillAvailable) {
            setSelectedSlot(null);
            alert("The previously selected time slot is no longer available. Please choose another slot.");
          } else {
            // Check if the preselected slot is fully booked
            const stats = appointmentStats[preselectedSlot._id];
            if (stats && typeof stats === 'number' && stats >= (preselectedSlot.quantity || 20)) {
              setSelectedSlot(null);
              alert("The previously selected time slot is now fully booked. Please choose another slot.");
            }
          }
        }
        
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        setError("Failed to load doctor details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDoctorDetails();
    }
  }, [id, preselectedSlot]);

  // Calculate slot statistics
  const calculateSlotStats = (slot) => {
    const stats = appointmentStats[slot._id];
    
    if (stats && typeof stats === 'number') {
      const total = slot.quantity || 20;
      const booked = stats;
      const available = total - booked;
      const nextAppointmentNumber = booked + 1;
      
      return { total, booked, available, nextAppointmentNumber };
    } else {
      const total = slot.quantity || 20;
      const booked = 0;
      const available = total;
      const nextAppointmentNumber = 1;
      
      return { total, booked, available, nextAppointmentNumber };
    }
  };

  // Filter available slots for the selected date
  const getAvailableSlotsForDate = () => {
    if (!appointmentDate) return [];
    
    const selectedDate = new Date(appointmentDate);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const slotsForDay = availableTimeSlots.filter(slot => 
      slot.day.toLowerCase() === dayName.toLowerCase()
    );

    // Filter out fully booked slots
    return slotsForDay.filter(slot => {
      const stats = calculateSlotStats(slot);
      return stats.available > 0;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSlotSelection = (slot) => {
    // Check if slot is available before selecting
    const stats = calculateSlotStats(slot);
    if (stats.available > 0) {
      const appointmentNumber = stats.nextAppointmentNumber;
      setSelectedSlot({
        ...slot,
        appointmentNumber: appointmentNumber
      });
    } else {
      alert("This time slot is no longer available. Please choose another slot.");
    }
  };

  const handleDateChange = (date) => {
    setAppointmentDate(date);
    // If a slot was selected but doesn't match the new date, clear it
    if (selectedSlot) {
      const selectedDate = new Date(date);
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (selectedSlot.day.toLowerCase() !== dayName.toLowerCase()) {
        setSelectedSlot(null);
      }
    }
  };

  // Process payment
  const processPayment = async () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success (in real app, integrate with payment gateway)
      const isSuccess = Math.random() > 0.1; // 90% success rate for demo
      
      if (isSuccess) {
        setPaymentSuccess(true);
        return true;
      } else {
        throw new Error("Payment failed. Please try again.");
      }
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };






  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // NEW: Check if user ID is available
    if (!userId) {
      alert("Please log in to book an appointment.");
      // navigate("/login"); // Uncomment to redirect to login
      return;
    }
    
    if (!selectedSlot || !appointmentDate) {
      alert("Please select both date and time slot");
      return;
    }

    if (!patientDetails.fullName || !patientDetails.phoneNumber || !patientDetails.medicalConcern) {
      alert("Please fill in all required fields (Name, Phone, and Medical Concern)");
      return;
    }

    // Process payment first
    if (paymentMethod !== 'cash') {
      const paymentResult = await processPayment();
      if (!paymentResult) {
        return; // Stop if payment failed
      }
    }

    setIsSubmitting(true);

    try {
      // NEW: Include userId in appointment data
      const appointmentData = {
        userId: userId, // ADDED: Include user ID
        doctorId: id,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        doctorSpecialization: doctor.specialization,
        patientDetails: {
          fullName: patientDetails.fullName.trim(),
          email: patientDetails.email?.trim() || "",
          phoneNumber: patientDetails.phoneNumber.trim(),
          dateOfBirth: patientDetails.dateOfBirth || "",
          gender: patientDetails.gender || "",
          address: patientDetails.address || "",
          medicalConcern: patientDetails.medicalConcern.trim(),
          previousConditions: patientDetails.previousConditions || ""
        },
        appointmentDate: new Date(appointmentDate).toISOString(),
        timeSlot: {
          day: selectedSlot.day,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime
        },
        timeSlotId: selectedSlot._id,
        appointmentNumber: selectedSlot.appointmentNumber,
        payment: {
          method: paymentMethod,
          amount: doctor.price,
          status: paymentMethod === 'cash' ? 'pending' : 'paid',
          transactionId: paymentMethod !== 'cash' ? `TXN${Date.now()}` : null,
          details: paymentMethod !== 'cash' ? paymentDetails : null
        }
      };

      console.log('📤 Sending appointment data with userId:', userId, appointmentData);






      // Save appointment to database
      const response = await axios.post(
        "http://localhost:5000/api/appointments",
        appointmentData,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        console.log('✅ Appointment created successfully with userId:', userId, response.data);
        // Show bill preview instead of immediately navigating
        setShowBillPreview(true);
      }
    } catch (error) {
      console.error("❌ Error booking appointment:", error);
      
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        
        if (errorData.available === 0) {
          // Slot is fully booked
          alert(`This time slot is fully booked. Only ${errorData.capacity} appointments allowed. Please choose another time.`);
        } else if (errorData.existingAppointment) {
          // Patient already has appointment
          alert("You already have an appointment booked for this time slot.");
        } else {
          // General conflict
          alert("This time slot is already booked. Please choose another time.");
        }
        
        // Refresh available data
        await refreshDoctorData();
        
      } else if (error.response?.status === 400) {
        alert("Invalid data. Please check your information and try again.");
      } else if (error.code === 'ECONNABORTED') {
        alert("Request timeout. Please check your connection and try again.");
      } else {
        alert("Failed to book appointment. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };





  

  // Refresh function to update slots and stats
  const refreshDoctorData = async () => {
    try {
      const timeSlotsResponse = await axios.get(
        `http://localhost:5000/api/doctors/${id}/time-slots`
      );
      setAvailableTimeSlots(timeSlotsResponse.data.availableTimeSlots || []);

      const statsResponse = await axios.get(
        `http://localhost:5000/api/appointments/stats/${id}`
      );
      setAppointmentStats(statsResponse.data);
      
      setSelectedSlot(null);
    } catch (refreshError) {
      console.error("Error refreshing data:", refreshError);
    }
  };

  const getNextAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Generate dates for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const getDatesForSelectedSlot = () => {
    if (!selectedSlot) return getNextAvailableDates();
    
    const dates = [];
    const today = new Date();
    const targetDay = selectedSlot.day.toLowerCase();
    
    // Find next 4 occurrences of the selected slot's day
    let count = 0;
    let currentDate = new Date(today);
    
    while (count < 4) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      if (dayName === targetDay) {
        dates.push(currentDate.toISOString().split('T')[0]);
        count++;
      }
    }
    
    return dates;
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

  const calculateAge = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAvailabilityBadge = (slot) => {
    const stats = calculateSlotStats(slot);
    
    if (stats.available === 0) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Fully Booked</span>;
    } else if (stats.available < stats.total / 2) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Limited</span>;
    } else {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Available</span>;
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  // Payment Method Components
  const CreditCardForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="cardNumber"
          value={formatCardNumber(paymentDetails.cardNumber)}
          onChange={handlePaymentInputChange}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="expiryDate"
            value={formatExpiryDate(paymentDetails.expiryDate)}
            onChange={handlePaymentInputChange}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="cvv"
            value={paymentDetails.cvv}
            onChange={handlePaymentInputChange}
            placeholder="123"
            maxLength={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Holder Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="cardHolder"
          value={paymentDetails.cardHolder}
          onChange={handlePaymentInputChange}
          placeholder="John Doe"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />
      </div>
      
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>Secure SSL encrypted payment</span>
      </div>
    </div>
  );

  const UPIForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          UPI ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="upiId"
          value={paymentDetails.upiId}
          onChange={handlePaymentInputChange}
          placeholder="yourname@upi"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          You will be redirected to your UPI app to complete the payment.
        </p>
      </div>
    </div>
  );

  const InsuranceForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Insurance Provider <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="insuranceProvider"
          value={paymentDetails.insuranceProvider}
          onChange={handlePaymentInputChange}
          placeholder="e.g., Blue Cross, Aetna, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Insurance ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="insuranceId"
          value={paymentDetails.insuranceId}
          onChange={handlePaymentInputChange}
          placeholder="Your insurance identification number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Policy Number
        </label>
        <input
          type="text"
          name="policyNumber"
          value={paymentDetails.policyNumber}
          onChange={handlePaymentInputChange}
          placeholder="Policy number (if different)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        />
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-700">
          Note: Insurance claims are subject to verification and approval. You may be responsible for any uncovered amounts.
        </p>
      </div>
    </div>
  );

  const CashPaymentInfo = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
      <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
      <h4 className="text-lg font-semibold text-green-800 mb-2">Pay at Clinic</h4>
      <p className="text-green-700 mb-4">
        You can pay the consultation fee when you visit the clinic. Please bring exact change if possible.
      </p>
      <div className="text-sm text-green-600">
        <p>Accepted: Cash, Credit/Debit Cards</p>
        <p>Please arrive 15 minutes before your appointment for payment processing.</p>
      </div>
    </div>
  );

  // Bill Preview Component
  const BillPreview = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Appointment Bill</h2>
            <button
              onClick={() => setShowBillPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div ref={billRef} className="p-6 space-y-6">
          {/* Clinic Header */}
          <div className="text-center border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-blue-800">MediCare Clinic</h1>
            <p className="text-gray-600 mt-2">123 Health Street, Medical City, MC 12345</p>
            <p className="text-gray-600">Phone: (555) 123-4567 | Email: info@medicare.com</p>
          </div>

          {/* Bill Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {patientDetails.fullName}</p>
                <p><span className="font-medium">Phone:</span> {patientDetails.phoneNumber}</p>
                <p><span className="font-medium">Email:</span> {patientDetails.email || 'N/A'}</p>
                <p><span className="font-medium">Gender:</span> {patientDetails.gender || 'N/A'}</p>
                {patientDetails.dateOfBirth && (
                  <p><span className="font-medium">Age:</span> {calculateAge(patientDetails.dateOfBirth)} years</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Appointment #:</span> {selectedSlot?.appointmentNumber}</p>
                <p><span className="font-medium">Date:</span> {new Date(appointmentDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><span className="font-medium">Time:</span> {formatTime(selectedSlot?.startTime)} - {formatTime(selectedSlot?.endTime)}</p>
                <p><span className="font-medium">Doctor:</span> Dr. {doctor?.firstName} {doctor?.lastName}</p>
                <p><span className="font-medium">Specialization:</span> {doctor?.specialization}</p>
                {/* NEW: Display User ID */}
                <p><span className="font-medium">User ID:</span> {userId}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Payment Method:</span> {paymentMethod.toUpperCase()}</p>
              <p><span className="font-medium">Payment Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  paymentMethod === 'cash' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {paymentMethod === 'cash' ? 'PENDING' : 'PAID'}
                </span>
              </p>
              {paymentMethod !== 'cash' && paymentSuccess && (
                <p><span className="font-medium">Transaction ID:</span> TXN{Date.now()}</p>
              )}
            </div>
          </div>

          {/* Medical Concern */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Concern</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {patientDetails.medicalConcern}
            </p>
          </div>

          {/* Charges Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Charges Breakdown</h3>
            <div className="border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 text-sm font-medium text-gray-700">Description</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 text-sm text-gray-700">Consultation Fee</td>
                    <td className="p-3 text-sm text-gray-700 text-right">{formatPrice(doctor?.price)}</td>
                  </tr>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="p-3 text-sm font-medium text-gray-900">Total Amount</td>
                    <td className="p-3 text-sm font-medium text-gray-900 text-right">{formatPrice(doctor?.price)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">
              {paymentMethod === 'cash' ? 'Payment Instructions' : 'Important Notes'}
            </h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              {paymentMethod === 'cash' ? (
                <>
                  <li>• Payment to be made at the reception before the appointment</li>
                  <li>• Cash, Credit Card, and Insurance accepted</li>
                </>
              ) : (
                <>
                  <li>• Payment completed successfully</li>
                  <li>• Keep this receipt for your records</li>
                </>
              )}
              <li>• Please bring this bill and your ID card</li>
              <li>• Arrive 15 minutes before your scheduled time</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
            <p>Thank you for choosing MediCare Clinic</p>
            <p>For any queries, contact: (555) 123-4567</p>
            <p className="mt-2">Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Bill
            </button>
            <button
              onClick={() => {
                setShowBillPreview(false);
                navigate("/appointment-confirmation", { 
                  state: { 
                    appointment: {
                      patientDetails,
                      appointmentDate,
                      timeSlot: selectedSlot,
                      doctor,
                      appointmentNumber: selectedSlot?.appointmentNumber,
                      userId: userId, // NEW: Include userId in navigation state
                      payment: {
                        method: paymentMethod,
                        amount: doctor.price,
                        status: paymentMethod === 'cash' ? 'pending' : 'paid',
                        transactionId: paymentMethod !== 'cash' ? `TXN${Date.now()}` : null
                      }
                    },
                    doctor 
                  } 
                });
              }}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
            >
              Continue to Confirmation
            </button>
            <button
              onClick={() => setShowBillPreview(false)}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Appointment Booking</h3>
          <p className="text-gray-500 mt-2">Please wait while we load the information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Doctor</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Doctor Not Found</h3>
          <p className="text-gray-500 mb-4">The doctor you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const availableSlots = getAvailableSlotsForDate();
  const availableDates = getDatesForSelectedSlot();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <button 
              onClick={() => navigate(`/doctors/${id}`)}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Doctor Details
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Book Appointment
            </h1>
            <p className="text-lg text-gray-600">
              with Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
            </p>
            {/* NEW: Display User ID */}
            <div className="mt-2 text-sm text-gray-500">
              User ID: {userId}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Appointment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                {/* Preselected Slot Banner */}
                {preselectedSlot && selectedSlot && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-green-800 font-semibold">Time slot pre-selected from doctor's page</p>
                        <p className="text-green-700">
                          {selectedSlot.day} • {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                        </p>
                        {selectedSlot.appointmentNumber && (
                          <p className="text-green-600 text-sm mt-1">
                            Your Appointment #: <span className="font-bold">{selectedSlot.appointmentNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Appointment Date <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={appointmentDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      required
                    >
                      <option value="">Choose a date</option>
                      {availableDates.map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </option>
                      ))}
                    </select>
                    {selectedSlot && (
                      <p className="text-sm text-gray-500 mt-2">
                        Showing dates for {selectedSlot.day}s only
                      </p>
                    )}
                  </div>

                  {/* Time Slot Selection */}
                  {appointmentDate && !selectedSlot && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Available Time Slots for {new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} <span className="text-red-500">*</span>
                      </label>
                      {availableSlots.length === 0 ? (
                        <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-200">
                          <svg className="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-yellow-700 font-medium">No available slots for this day</p>
                          <p className="text-yellow-600 text-sm mt-1">Please select a different date</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableSlots.map((slot, index) => {
                            const stats = calculateSlotStats(slot);
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleSlotSelection(slot)}
                                className={`p-4 border rounded-lg text-left transition duration-200 ${
                                  selectedSlot?._id === slot._id
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-gray-900">
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </span>
                                  {getAvailabilityBadge(slot)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  <div>Available: {stats.available}/{stats.total}</div>
                                  <div className="text-blue-600 font-medium mt-1">
                                    Next Appointment #: {stats.nextAppointmentNumber}
                                  </div>
                                </div>
                                {selectedSlot?._id === slot._id && (
                                  <div className="flex items-center mt-2 text-blue-600">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">Selected - Appointment #{selectedSlot.appointmentNumber}</span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Slot Display */}
                  {selectedSlot && appointmentDate && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-800 font-semibold">Selected Time Slot</p>
                          <p className="text-blue-700">
                            {new Date(appointmentDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })} • {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                          </p>
                          <div className="text-blue-600 text-sm mt-1">
                            <div>Available: {calculateSlotStats(selectedSlot).available}/{calculateSlotStats(selectedSlot).total}</div>
                            {selectedSlot.appointmentNumber && (
                              <div className="font-bold text-blue-800 mt-1">
                                Your Appointment #: {selectedSlot.appointmentNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedSlot(null)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Patient Details */}
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={patientDetails.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={patientDetails.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={patientDetails.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={patientDetails.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                        {patientDetails.dateOfBirth && (
                          <p className="text-sm text-gray-500 mt-1">
                            Age: {calculateAge(patientDetails.dateOfBirth)} years
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={patientDetails.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={patientDetails.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Concern <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="medicalConcern"
                        value={patientDetails.medicalConcern}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        placeholder="Please describe your symptoms or reason for visit..."
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Medical Conditions (if any)
                      </label>
                      <textarea
                        name="previousConditions"
                        value={patientDetails.previousConditions}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        placeholder="Any existing medical conditions, allergies, or current medications..."
                      />
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 border rounded-lg text-center transition duration-200 ${
                          paymentMethod === 'cash'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                      >
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-sm font-medium">Cash</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 border rounded-lg text-center transition duration-200 ${
                          paymentMethod === 'card'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                      >
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-sm font-medium">Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-4 border rounded-lg text-center transition duration-200 ${
                          paymentMethod === 'upi'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                      >
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                        <span className="text-sm font-medium">UPI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('insurance')}
                        className={`p-4 border rounded-lg text-center transition duration-200 ${
                          paymentMethod === 'insurance'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                      >
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm font-medium">Insurance</span>
                      </button>
                    </div>

                    {/* Payment Form */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      {paymentMethod === 'cash' && <CashPaymentInfo />}
                      {paymentMethod === 'card' && <CreditCardForm />}
                      {paymentMethod === 'upi' && <UPIForm />}
                      {paymentMethod === 'insurance' && <InsuranceForm />}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedSlot || !appointmentDate || isProcessingPayment || !userId}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Processing Payment...
                      </div>
                    ) : isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Booking Appointment...
                      </div>
                    ) : (
                      `Confirm Appointment #${selectedSlot?.appointmentNumber || ''} - ${formatPrice(doctor.price)}`
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Doctor Summary & Appointment Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-center">
                  {doctor.profilePicture ? (
                    <img
                      src={`http://localhost:5000/${doctor.profilePicture}`}
                      alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                      className="h-24 w-24 rounded-full object-cover border-4 border-blue-100 mx-auto mb-4"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200 mx-auto mb-4">
                      <svg className="h-12 w-12 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">{doctor.specialization}</p>
                  <p className="text-gray-600 text-sm">{doctor.department}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{doctor.phoneNumber}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{doctor.email}</span>
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-green-800 font-semibold">Consultation Fee</p>
                    <p className="text-2xl font-bold text-green-700">{formatPrice(doctor.price)}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Summary */}
              {selectedSlot && appointmentDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Appointment Summary</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-700">Date</p>
                      <p className="font-semibold text-blue-900">
                        {new Date(appointmentDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Time</p>
                      <p className="font-semibold text-blue-900">
                        {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Appointment Number</p>
                      <p className="font-semibold text-blue-900 text-xl">
                        #{selectedSlot.appointmentNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Doctor</p>
                      <p className="font-semibold text-blue-900">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Specialization</p>
                      <p className="font-semibold text-blue-900">{doctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Fee</p>
                      <p className="font-semibold text-green-700">{formatPrice(doctor.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Payment Method</p>
                      <p className="font-semibold text-blue-900 capitalize">{paymentMethod}</p>
                    </div>
                    {/* NEW: Display User ID in summary */}
                    <div>
                      <p className="text-sm text-blue-700">User ID</p>
                      <p className="font-semibold text-blue-900 text-sm">{userId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Help Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-yellow-900 mb-3">Before Your Visit</h4>
                <ul className="text-yellow-800 text-sm space-y-2">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Arrive 15 minutes before your scheduled time
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Bring your ID and insurance card
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Bring a list of current medications
                  </li>
                  {selectedSlot?.appointmentNumber && (
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Remember your appointment number: <span className="font-bold ml-1">#{selectedSlot.appointmentNumber}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Preview Modal */}
      {showBillPreview && <BillPreview />}
    </>
  );
};

export default BookAppointment;



