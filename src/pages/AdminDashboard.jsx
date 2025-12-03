import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [filteredApps, setFilteredApps] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        
        // ✅ Check if token exists
        if (!token) {
          toast.error("Please login first");
          navigate("/admin/login");
          return;
        }

        const { data } = await axios.get(
          `${API_BASE_URL}/api/admin/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("📥 Dashboard API response:", data);
        
        // ✅ FIXED: Correct data structure
        const apps = data.data?.pendingApplications || data.pendingApplications || [];
        setApplications(apps);
        setFilteredApps(apps);
        
        toast.success(`Loaded ${apps.length} pending applications`);
      } catch (error) {
        console.error("❌ Dashboard error:", error);
        toast.error(
          error.response?.data?.error || "Failed to fetch applications"
        );
        if (error.response?.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
    toast.success("Logged out successfully");
  };

  // Approve or Reject application - FIXED
  const processApplication = async (id, action, reason = "") => {
    try {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        toast.error("Please login first");
        navigate("/admin/login");
        return;
      }

      console.log(`🔄 Processing application ${id} with action: ${action}`);
      
      // ✅ FIXED: Correct API endpoint (removed double slash)
      const response = await fetch(`${API_BASE_URL}/api/admin/application/${id}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Remove from local state
        const updatedApps = applications.filter((app) => app._id !== id);
        setApplications(updatedApps);
        setFilteredApps(updatedApps);
        
        toast.success(`Application ${action}ed successfully!`);
      } else {
        toast.error(result.error || `Failed to ${action} application`);
      }
    } catch (err) {
      console.error("❌ Process application error:", err);
      toast.error("Failed to process application");
    }
  };

  // View application details
  const viewApplication = async (studentId) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        toast.error("Please login first");
        navigate("/admin/login");
        return;
      }

      // ✅ Navigate to view application page
      navigate(`/admin/application/${studentId}`);
      
    } catch (err) {
      console.error("❌ View application error:", err);
      toast.error("Failed to view application details");
    }
  };

  // Search - FIXED
  const handleSearch = (e) => {
    const value = e.target.value.trim().toLowerCase();
    setSearchId(value);

    if (value === "") {
      setFilteredApps(applications);
    } else {
      const filtered = applications.filter(
        (app) =>
          (app._id && app._id.toLowerCase().includes(value)) ||
          (app.trxId && app.trxId.toLowerCase().includes(value)) || // ✅ FIXED: trxId (capital I)
          (app.amount && app.amount.toString().includes(value)) ||
          (app.studentId && app.studentId.toLowerCase().includes(value)) ||
          (app.firstName && app.firstName.toLowerCase().includes(value)) ||
          (app.lastName && app.lastName.toLowerCase().includes(value)) ||
          (app.email && app.email.toLowerCase().includes(value))
      );
      setFilteredApps(filtered);
    }
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              {applications.length} pending application{applications.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
          >
            Logout
          </button>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID, Name, Email, TRX ID..."
              value={searchId}
              onChange={handleSearch}
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute right-3 top-3 text-gray-400">
              🔍
            </div>
          </div>
          {searchId && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {filteredApps.length} of {applications.length} applications
            </p>
          )}
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-gray-800">
              Pending Applications
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Review and process student ID card applications
            </p>
          </div>

          {filteredApps.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {applications.length === 0 ? "No Pending Applications" : "No Search Results"}
              </h3>
              <p className="text-gray-500">
                {applications.length === 0 
                  ? "All applications have been processed." 
                  : "No applications match your search criteria."
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Program
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedApps.map((app, index) => (
                      <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {app.firstName} {app.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {app.studentId}</div>
                            <div className="text-sm text-gray-500">{app.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.program || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>TRX: {app.trxId}</div>
                          <div>Amount: ৳{app.amount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            ⏳ Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => processApplication(app._id, "approve")}
                              className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors font-medium"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Enter reason for rejection:");
                                if (reason !== null && reason.trim() !== "") {
                                  processApplication(app._id, "reject", reason.trim());
                                }
                              }}
                              className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors font-medium"
                            >
                              ❌ Reject
                            </button>
                            <button
                              onClick={() => viewApplication(app.studentId)}
                              className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors font-medium"
                            >
                              👁️ View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredApps.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      ← Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;