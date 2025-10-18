import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  const features = [
    {
      icon: '👨‍⚕️',
      title: 'Expert Doctors',
      description: 'Highly qualified and experienced medical professionals'
    },
    {
      icon: '🩺',
      title: 'Medical Checkups',
      description: 'Comprehensive health screenings and diagnostics'
    },
    {
      icon: '💊',
      title: 'Pharmacy',
      description: 'Complete pharmacy services with genuine medicines'
    },
    {
      icon: '🏥',
      title: 'Emergency Care',
      description: '24/7 emergency services with quick response'
    },
    {
      icon: '📱',
      title: 'Online Booking',
      description: 'Easy appointment scheduling from anywhere'
    },
    {
      icon: '❤️',
      title: 'Patient Care',
      description: 'Compassionate and personalized healthcare'
    }
  ];

  const services = [
    {
      name: 'Cardiology',
      description: 'Heart care and cardiovascular treatments',
      icon: '❤️'
    },
    {
      name: 'Neurology',
      description: 'Brain and nervous system specialists',
      icon: '🧠'
    },
    {
      name: 'Orthopedics',
      description: 'Bone and joint treatment',
      icon: '🦴'
    },
    {
      name: 'Pediatrics',
      description: 'Specialized care for children',
      icon: '👶'
    },
    {
      name: 'Dermatology',
      description: 'Skin and cosmetic treatments',
      icon: '🌟'
    },
    {
      name: 'Dental Care',
      description: 'Complete oral health services',
      icon: '🦷'
    }
  ];

  const stats = [
    { number: '50+', label: 'Expert Doctors' },
    { number: '10k+', label: 'Happy Patients' },
    { number: '24/7', label: 'Emergency Services' },
    { number: '15+', label: 'Medical Departments' }
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Health is Our 
                <span className="text-blue-200"> Priority</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Experience world-class healthcare with our team of expert doctors, 
                state-of-the-art facilities, and compassionate care. Your journey 
                to better health starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/appointments"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors text-center"
                >
                  📅 Book Appointment
                </Link>
                <Link
                  to="/doctors"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors text-center"
                >
                  👨‍⚕️ Find Doctors
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white bg-opacity-20 rounded-2xl p-8 backdrop-blur-sm">
                <div className="bg-blue-500 rounded-lg w-full h-80 flex items-center justify-center">
                  <span className="text-6xl">🏥</span>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white text-blue-600 p-6 rounded-2xl shadow-2xl">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm font-semibold">Emergency Care</div>
                </div>
                <div className="absolute -top-6 -right-6 bg-green-500 text-white p-6 rounded-2xl shadow-2xl">
                  <div className="text-3xl font-bold">99%</div>
                  <div className="text-sm font-semibold">Patient Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose MediCare+?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to providing the highest quality healthcare services 
              with compassion, innovation, and excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Medical Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare services delivered by specialized medical professionals 
              using the latest technology and treatment methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {service.description}
                </p>
                <Link
                  to="/appointments"
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                >
                  Learn More
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              View All Services
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-red-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h3 className="text-2xl font-bold mb-2">Emergency Medical Care</h3>
              <p className="text-red-100">Available 24/7 for urgent medical needs</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:911"
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-50 transition-colors text-center"
              >
                🚨 Call 911
              </a>
              <a
                href="tel:+1234567890"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-colors text-center"
              >
                📞 Emergency Line
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from our satisfied patients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Cardiology Patient",
                content: "The care I received at MediCare+ was exceptional. The doctors were knowledgeable and compassionate.",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Orthopedics Patient",
                content: "From diagnosis to recovery, the entire team provided outstanding support and treatment.",
                rating: 5
              },
              {
                name: "Emily Davis",
                role: "Pediatrics",
                content: "They made my child feel comfortable and safe throughout the treatment process. Highly recommended!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex text-yellow-400 mb-4">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who trust MediCare+ for their healthcare needs. 
            Book your appointment today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              Get Started Today
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;