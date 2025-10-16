import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DoctorProfile from "./Doctor/DoctorProfile";
import AddDoctor from "./admin/AddDoctor";
import ViewDoctor from "./admin/ViewDoctor";
import EditDeleteDoctor from "./admin/EditDeleteDoctor";
import DoctorLogin from "./Doctor/DoctorLogin";
import DoctorRegister from "./Doctor/DoctorRegister";
import DoctorDashboard from "./Doctor/DoctorDashboard";
import DoctorSchedule from "./Doctor/DoctorSchedule";
import DoctorDetails from "./pages/DoctorDetails";
import BookAppointment from "./pages/BookAppointment";
import List from "./pages/DoctorList";
import AppointmentConfirmation from "./pages/AppointmentConfirmation";
import UserDashboard from "./pages/UserDashBoard";
import DoctorAppointments from "./Doctor/DoctorAppointments";
import DashBoard from "./pages/UserProfile";
import UsersManagement from "./admin/UsersManagement";









const App = () => {
  return (
    <BrowserRouter>
      {/* <nav>
        <Link to="/register">Register</Link> | <Link to="/login">Login</Link> | <Link to="/doctor">doctor</Link>
      </nav> */}
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/" element={<h1>Welcome to MERN Auth App</h1>} /> */}
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/adddoctor" element={<AddDoctor />} />
        <Route path="/editdoctor" element={<ViewDoctor />} />
        <Route path="/editdelete/:id" element={<EditDeleteDoctor />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/doctordashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/schedule" element={<DoctorSchedule />} />
        <Route path="/doctordetails/:id" element={<DoctorDetails />} />
        <Route path="/book/:id" element={<BookAppointment />} />
        <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/list" element={<List />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/profile" element={<DashBoard />} />
        <Route path="/usersmanagement" element={<UsersManagement />} />




       
        {/* <Route path="/doctordetails/:id" element={<DoctorDetails />} /> Single doctor details */}
      
      
      
        
        
      
       
       
        

      </Routes>
    </BrowserRouter>
  );
};

export default App;
