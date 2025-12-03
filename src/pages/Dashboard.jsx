// src/App.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import StudentApplications from "../components/StudentApplications";
import Profile from "../components/Profile";
import { API_BASE_URL } from "../../config";

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3 animate-slide-in`}>
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200 font-bold text-lg"
      >
        ×
      </button>
    </div>
  );
};

const App = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    cardType: "student",
    firstName: "",
    lastName: "",
    email: "",
    program: "",
    trxId: "",
    amount: "",
    photo: null,
    requestType: "new",
    gdCopy: null,
    oldIdImage: null,
  });
  
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [activeTab, setActiveTab] = useState("request");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [user, setUser] = useState(null);

  // Simulate user data fetching (replace with actual Firebase auth)
  useEffect(() => {
    // This would typically come from Firebase authentication
    const mockUser = {
      uid: "12345",
      displayName: "John Doe",
      email: "john.doe@student.bubt.edu.bd",
      photoURL: null,
      phoneNumber: "+8801XXXXXXXXX",
      createdAt: new Date().toISOString()
    };
    setUser(mockUser);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    
    if (type === "file" && files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Basic validation
    if (!formData.studentId || !formData.firstName || !formData.lastName || !formData.email || !formData.trxId) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    
    console.log("📋 Current Form Data:", formData);
    
    // ✅ Create FormData
    const submitData = new FormData();
    
    // ✅ Append all text fields with proper values
    submitData.append("studentId", formData.studentId.trim());
    submitData.append("cardType", formData.cardType);
    submitData.append("firstName", formData.firstName.trim());
    submitData.append("lastName", formData.lastName.trim());
    submitData.append("email", formData.email.trim());
    submitData.append("program", formData.program);
    submitData.append("trxId", formData.trxId.trim());
    submitData.append("amount", formData.amount);
    submitData.append("requestType", formData.requestType);

    // ✅ Append files
    if (formData.photo) {
      submitData.append("photo", formData.photo);
      console.log("📸 Photo file:", formData.photo.name);
    }
    if (formData.gdCopy) {
      submitData.append("gdCopy", formData.gdCopy);
      console.log("📄 GD Copy file:", formData.gdCopy.name);
    }
    if (formData.oldIdImage) {
      submitData.append("oldIdImage", formData.oldIdImage);
      console.log("🖼️ Old ID Image file:", formData.oldIdImage.name);
    }

    // ✅ Debug: Check FormData contents
    console.log("📤 FormData entries:");
    for (let [key, value] of submitData.entries()) {
      console.log(`  ${key}:`, value);
    }

    try {
      console.log("🚀 Sending request to API...");
      
      const response = await fetch('https://bubt-server.onrender.com/api/students', {
        method: 'POST',
        body: submitData
      });

      console.log("📥 Response status:", response.status);
      
      const result = await response.json();
      console.log("📥 Full response:", result);
      
      if (response.ok && result.success) {
        showToast("✅ Application submitted successfully!");
        
        // ✅ Form reset
        setFormData({
          studentId: "", 
          cardType: "student", 
          firstName: "", 
          lastName: "",
          email: "", 
          program: "", 
          trxId: "", 
          amount: "",
          photo: null, 
          requestType: "new", 
          gdCopy: null, 
          oldIdImage: null
        });

        // ✅ Show preview
        setPreviewData({
          studentId: formData.studentId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          program: formData.program,
          photo: formData.photo ? URL.createObjectURL(formData.photo) : null,
        });
        setPreviewModalVisible(true);
        
      } else {
        // ✅ Check if it's a TRX ID duplicate error
        const errorMessage = result.error || "Unknown error";
        
        if (errorMessage.includes("TRX ID") || errorMessage.includes("already exists")) {
          showToast("❌ This TRX ID is already used. Please use a different TRX ID.", "error");
        } else if (errorMessage.includes("Student ID")) {
          showToast("❌ This Student ID is already registered.", "error");
        } else {
          showToast(`❌ ${errorMessage}`, "error");
        }
      }
    } catch (error) {
      console.error("🌐 Network error:", error);
      showToast("🌐 Network error. Please check your connection and try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if card type is student
  const isStudentCard = formData.cardType === "student";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-blue-300">
      <Navbar />
      
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
      
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("request")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "request"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Request ID Card
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Applications
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="flex-grow">
        {activeTab === "request" && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Request Your ID Card
              </h2>
              
              <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white p-6 rounded-lg shadow-md"
              >
                {/* Student ID and Card Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="student-id"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ID Number *
                    </label>
                    <input
                      type="text"
                      id="student-id"
                      name="studentId"
                      required
                      value={formData.studentId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your student ID"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Type *
                    </label>
                    <select
                      id="card-type"
                      name="cardType"
                      required
                      value={formData.cardType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">Student Card</option>
                      <option value="staff">Staff Card</option>
                      <option value="visitor">Visitor Card</option>
                    </select>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="last-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Email and Program */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  {isStudentCard && (
                    <div>
                      <label
                        htmlFor="program"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Academic Program *
                      </label>
                      <select
                        id="program"
                        name="program"
                        required={isStudentCard}
                        value={formData.program}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select your program</option>
                        <option value="CSE">Computer Science & Engineering</option>
                        <option value="EEE">Electrical & Electronic Engineering</option>
                        <option value="BBA">Business Administration</option>
                        <option value="English">English</option>
                        <option value="Law">Law</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Photo Upload */}
                {isStudentCard && (
                  <div>
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Upload Photo (Max 5MB) *
                    </label>
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/*"
                      required={isStudentCard}
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: JPG, PNG, JPEG. Max size: 5MB
                    </p>
                  </div>
                )}

                {/* Request Type - Only for students */}
                {isStudentCard && (
                  <div>
                    <label
                      htmlFor="request-type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Request Type *
                    </label>
                    <select
                      id="request-type"
                      name="requestType"
                      required={isStudentCard}
                      value={formData.requestType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New Card</option>
                      <option value="lost">Lost Card</option>
                      <option value="damaged">Damaged Card</option>
                    </select>
                  </div>
                )}

                {/* GD Copy or Old ID Image Upload - Only for students */}
                {isStudentCard && formData.requestType === "lost" && (
                  <div>
                    <label
                      htmlFor="gd-copy"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Upload GD Copy (Max 5MB)
                    </label>
                    <input
                      type="file"
                      id="gd-copy"
                      name="gdCopy"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )}
                {isStudentCard && formData.requestType === "damaged" && (
                  <div>
                    <label
                      htmlFor="old-id-image"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Upload Old ID Image (Max 5MB)
                    </label>
                    <input
                      type="file"
                      id="old-id-image"
                      name="oldIdImage"
                      accept="image/*"
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )}

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="trxId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      id="trxId"
                      name="trxId"
                      required
                      value={formData.trxId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter transaction ID (e.g., abc10)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If this TRX ID is already used, you'll get an error message
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Amount *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      required
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition duration-200 shadow-md hover:shadow-lg ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <StudentApplications />
        )}

        {activeTab === "profile" && (
          <Profile user={user} />
        )}
      </main>

      {/* ID Card Preview Modal */}
      {previewModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 relative">
            <button
              onClick={() => setPreviewModalVisible(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Your ID Card Preview
            </h3>
            <div className="rounded-lg p-4 relative w-80 h-auto mx-auto">
              {previewData.photo && (
                <img
                  src={previewData.photo}
                  alt="ID card photo preview"
                  className="w-[150px] h-[150px] rounded-full border-2 border-white mx-auto mb-4"
                />
              )}
              <h1 className="university-logo text-xl font-bold mb-4 text-center">
                BUBT UNIVERSITY
              </h1>
              <p className="text-sm font-medium text-gray-800 text-center">{`${previewData.firstName} ${previewData.lastName}`}</p>
              <p className="text-xs text-gray-600 text-center">
                ID: {previewData.studentId}
              </p>
              {previewData.program && (
                <p className="text-xs text-gray-600 mt-1 text-center">
                  Program: {previewData.program}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;