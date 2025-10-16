import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/api/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctor(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        showMessage("error", "Failed to load doctor data.");
      }
    };

    fetchDoctorData();
  }, [id]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      profilePicture: file,
    }));
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSubmit = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "" && formData[key] !== undefined) {
        if (key === 'profilePicture' && typeof formData[key] === 'object') {
          // It's a file object
          dataToSubmit.append(key, formData[key]);
        } else if (key === 'price') {
          // Ensure price is sent as number
          dataToSubmit.append(key, formData[key] === '' ? 0 : parseFloat(formData[key]));
        } else {
          dataToSubmit.append(key, formData[key]);
        }
      }
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`http://localhost:5000/api/doctors/${id}`, dataToSubmit, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      showMessage("success", "Profile updated successfully!");
      setIsEditing(false);
      // Update doctor data with the response
      setDoctor(response.data.doctor || formData);
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      showMessage("error", error.response?.data?.error || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showMessage("error", "Password must be at least 8 characters long!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/doctors/auth/change-password`,
        passwordData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      showMessage("success", "Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage("error", error.response?.data?.error || "Failed to change password.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setFormData(doctor);
    setIsEditing(false);
  };

  // Cancel password change
  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangingPassword(false);
  };

  // Format price for display
  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return "Not set";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
          <p className="mt-2 text-gray-600">Manage your professional profile and settings</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === "success" 
              ? "bg-green-50 border border-green-200 text-green-700" 
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  {doctor.profilePicture ? (
                    <img
                      src={`http://localhost:5000/${doctor.profilePicture}`}
                      alt="Doctor Profile"
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-white text-2xl font-bold">
                        {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h2>
                  <p className="text-blue-100">{doctor.specialization}</p>
                  <p className="text-blue-100 text-sm">{doctor.department}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 bg-opacity-20 text-blue-100">
                      💰 Consultation Fee: {formatPrice(doctor.price)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                {!isEditing && (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition duration-200"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition duration-200"
                    >
                      Change Password
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {!isEditing ? (
              // Profile View Mode
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">
                        {doctor.firstName} {doctor.middleName && `${doctor.middleName} `}{doctor.lastName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gender</label>
                      <p className="text-gray-900">{doctor.gender}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-gray-900">
                        {new Date(doctor.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">National ID</label>
                      <p className="text-gray-900">{doctor.nationalId}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Professional Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{doctor.email}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <p className="text-gray-900">{doctor.phoneNumber}</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <label className="text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatPrice(doctor.price)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Per consultation session
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Specialization</label>
                      <p className="text-gray-900">{doctor.specialization}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p className="text-gray-900">{doctor.department}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Medical License</label>
                      <p className="text-gray-900">{doctor.medicalLicenseNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Profile Form Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        id="middleName"
                        name="middleName"
                        value={formData.middleName || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-1">
                        National ID *
                      </label>
                      <input
                        type="text"
                        id="nationalId"
                        name="nationalId"
                        value={formData.nationalId || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Consultation Fee (USD) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={formData.price || ""}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition duration-200"
                          required
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Set your consultation fee per session. This will be displayed to patients.
                      </p>
                      {formData.price && (
                        <p className="mt-1 text-sm font-medium text-green-600">
                          Current display: {formatPrice(formData.price)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization *
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        value={formData.specialization || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="medicalLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Medical License Number *
                      </label>
                      <input
                        type="text"
                        id="medicalLicenseNumber"
                        name="medicalLicenseNumber"
                        value={formData.medicalLicenseNumber || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Picture
                      </label>
                      <input
                        type="file"
                        id="profilePicture"
                        name="profilePicture"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-200"
                        accept="image/*"
                      />
                      {doctor.profilePicture && (
                        <p className="mt-1 text-sm text-gray-500">
                          Current: {doctor.profilePicture}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-6 border-t">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                    minLength="8"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition duration-200"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPasswordChange}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;