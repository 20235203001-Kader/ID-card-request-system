import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../../config";

export default function ApplicationDetailsInner() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        
        console.log("🔄 Fetching application for studentId:", studentId);
        console.log("🔑 Token exists:", !!token);
        
        const { data } = await axios.get(
          `${API_BASE_URL}/api/admin/application/${studentId}`,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );

        console.log("📥 Application API response:", data);
        
        // ✅ FIXED: Correct data structure
        const appData = data.data || data.application || data;
        setApplication(appData);
        
        if (!appData) {
          toast.error("Application data not found in response");
        } else {
          toast.success("Application loaded successfully");
        }
      } catch (error) {
        console.error("❌ Application fetch error:", error);
        console.error("Error response:", error.response);
        
        toast.error(error.response?.data?.error || "Failed to fetch application details");
        
        if (error.response?.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        } else {
          navigate("/admin/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [studentId, navigate]);

  // Debug function to check what's happening
  // const debugApplication = () => {
  //   console.log("🔍 Application Debug Info:");
  //   console.log("Student ID from URL:", studentId);
  //   console.log("Current application state:", application);
  //   console.log("API Base URL:", API_BASE_URL);
    
  //   // Test the API endpoint directly
  //   const token = localStorage.getItem("adminToken");
  //   fetch(`${API_BASE_URL}/api/admin/application/${studentId}`, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   })
  //   .then(r => r.json())
  //   .then(data => console.log("Direct API Response:", data))
  //   .catch(err => console.error("Direct API Error:", err));
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application details...</p>
          <p className="text-sm text-gray-500 mt-2">Student ID: {studentId}</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Application Not Found</h2>
          <p className="text-gray-600 mb-6">
            No application found for Student ID: <strong>{studentId}</strong>
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              ← Back to Dashboard
            </button>
            {/* <button
              onClick={debugApplication}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold ml-4"
            >
              🔧 Debug Info
            </button> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Debug Button */}
        <div className="text-right mb-4">
         
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Application Details</h2>
            <p className="text-gray-600">Student ID: {application.studentId}</p>
          </div>

          {/* Application Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Personal Information</h3>
                <p><strong>Full Name:</strong> {`${application.firstName || ""} ${application.lastName || ""}`}</p>
                <p><strong>Email:</strong> {application.email || "N/A"}</p>
                <p><strong>Student ID:</strong> {application.studentId}</p>
                <p><strong>Program:</strong> {application.program || "N/A"}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Payment Information</h3>
                <p><strong>Transaction ID:</strong> {application.trxId || "N/A"}</p>
                <p><strong>Amount:</strong> {application.amount || "N/A"} BDT</p>
                <p><strong>Payment Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    application.paymentStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                    application.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {application.paymentStatus || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Application Details</h3>
                <p><strong>Request Type:</strong> {application.requestType || "N/A"}</p>
                <p><strong>Card Type:</strong> {application.cardType || "N/A"}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    application.status === 'approved' ? 'bg-green-100 text-green-800' :
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {application.status || "N/A"}
                  </span>
                </p>
                {application.rejectionReason && (
                  <p><strong>Rejection Reason:</strong> {application.rejectionReason}</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Timestamps</h3>
                <p><strong>Created:</strong> {new Date(application.createdAt).toLocaleString()}</p>
                <p><strong>Updated:</strong> {new Date(application.updatedAt).toLocaleString()}</p>
                {application.approvedAt && (
                  <p><strong>Approved:</strong> {new Date(application.approvedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Documents & Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {application.photo && (
                <div className="text-center">
                  <p className="mb-2 font-semibold text-gray-700">Student Photo</p>
                  <img
                    src={`${API_BASE_URL}/uploads/${application.photo}`}
                    alt="Student Photo"
                    className="w-full h-48 object-cover rounded-lg shadow-md border"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/200';
                      e.target.alt = 'Image not found';
                      e.target.className = 'w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500';
                    }}
                  />
                </div>
              )}
              {application.gdCopy && (
                <div className="text-center">
                  <p className="mb-2 font-semibold text-gray-700">GD Copy</p>
                  <img
                    src={`${API_BASE_URL}/uploads/${application.gdCopy}`}
                    alt="GD Copy"
                    className="w-full h-48 object-cover rounded-lg shadow-md border"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/200';
                      e.target.alt = 'Image not found';
                      e.target.className = 'w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500';
                    }}
                  />
                </div>
              )}
              {application.oldIdImage && (
                <div className="text-center">
                  <p className="mb-2 font-semibold text-gray-700">Old ID Image</p>
                  <img
                    src={`${API_BASE_URL}/uploads/${application.oldIdImage}`}
                    alt="Old ID Image"
                    className="w-full h-48 object-cover rounded-lg shadow-md border"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/200';
                      e.target.alt = 'Image not found';
                      e.target.className = 'w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500';
                    }}
                  />
                </div>
              )}
            </div>
            
            {!application.photo && !application.gdCopy && !application.oldIdImage && (
              <div className="text-center py-8 text-gray-500">
                No documents or images uploaded
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold w-full sm:w-auto"
            >
              ← Back to Dashboard
            </button>
            

          </div>
        </div>
      </div>
    </div>
  );
}