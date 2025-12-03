// src/pages/StudentApplications.jsx
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import { API_BASE_URL } from "../../config";

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    const initializeStudentId = () => {
      // 1. প্রথমে localStorage থেকে studentId নেওয়ার চেষ্টা
      const savedStudentId = localStorage.getItem('studentId');
      if (savedStudentId) {
        setStudentId(savedStudentId);
        fetchApplications(savedStudentId);
      } else {
        // 2. localStorage এ না থাকলে manual input show
        setShowManualInput(true);
        setLoading(false);
      }
    };

    initializeStudentId();
  }, []);

  const fetchApplications = async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log("🔄 Fetching applications for:", id);
      
      const response = await fetch(`${API_BASE_URL}/api/applications?studentId=${id}`);
      console.log("📥 Response status:", response.status);
      
      const data = await response.json();
      console.log("📥 Full API response:", data);
      
      // ✅ FIXED: Correct data structure
      const apps = data.data || [];
      console.log("✅ Applications found:", apps.length);
      
      setApplications(apps);

      // ✅ Save to localStorage when applications are found
      if (apps.length > 0) {
        localStorage.setItem('studentId', id);
        
        // ✅ Save to recent applications history
        const recentApps = JSON.parse(localStorage.getItem('recentApplications') || '[]');
        const newRecent = [
          { 
            studentId: id, 
            name: apps[0]?.firstName + ' ' + apps[0]?.lastName,
            count: apps.length,
            timestamp: new Date().toISOString()
          },
          ...recentApps.filter(app => app.studentId !== id)
        ].slice(0, 3); // Keep only last 3
        
        localStorage.setItem('recentApplications', JSON.stringify(newRecent));
      }
      
    } catch (err) {
      console.error("❌ Error fetching applications:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (studentId.trim()) {
      fetchApplications(studentId.trim());
      setShowManualInput(false);
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem('studentId');
    setStudentId("");
    setApplications([]);
    setShowManualInput(true);
  };

  const handleUseDifferentId = () => {
    setShowManualInput(true);
  };

  // 3 days countdown calculator - FIXED
  const getCountdown = (approvedAt) => {
    if (!approvedAt) return 0;
    
    try {
      const approvedDate = new Date(approvedAt);
      const now = new Date();
      
      // Add 3 days to approved date
      const expiryDate = new Date(approvedDate);
      expiryDate.setDate(expiryDate.getDate() + 3);
      
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      console.error("Date calculation error:", error);
      return 0;
    }
  };

const generateIDCard = async (application) => {
  // Create a hidden div for the ID card design - FIXED SIZE
  const idCardElement = document.createElement("div");
  idCardElement.style.width = "85mm"; // Standard ID card width
  idCardElement.style.height = "54mm"; // Standard ID card height
  idCardElement.style.padding = "0";
  idCardElement.style.margin = "0";
  idCardElement.style.background = "white";
  idCardElement.style.position = "fixed";
  idCardElement.style.left = "-1000px";
  idCardElement.style.top = "0";
  idCardElement.style.boxSizing = "border-box";
  idCardElement.style.overflow = "hidden";

  // Preload image
  let photoHtml = `
    <div style="width: 70px; height: 70px; background: #e5e7eb; border: 1px solid #1e40af; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 8px; font-weight: bold; margin: 0 auto;">
      PHOTO
    </div>
  `;
  
  if (application.photo) {
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `${API_BASE_URL}/uploads/${application.photo}`;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
      photoHtml = `
        <img src="${API_BASE_URL}/uploads/${application.photo}" 
             alt="Photo" 
             style="width: 70px; height: 70px; object-fit: cover; border: 1px solid #1e40af; border-radius: 4px; margin: 0 auto;" />
      `;
    } catch (error) {
      console.error("Error loading image:", error);
    }
  }

  // Format program name
  const formatProgram = (program) => {
    const programMap = {
      'CSE': 'B.Sc. Engg. in CSE',
      'EEE': 'B.Sc. Engg. in EEE', 
      'BBA': 'Bachelor of Business Administration',
      'English': 'BA in English',
      'Law': 'LLB',
      'computer-science': 'B.Sc. Engg. in CSE',
      'business': 'BBA',
      'engineering': 'B.Sc. Engineering',
      'arts': 'BA',
      'medicine': 'MBBS'
    };
    return programMap[program] || program;
  };

  const userType = application.cardType === 'student' ? 'Student' : 
                  application.cardType === 'staff' ? 'Staff' : 'Visitor';

  // ✅ FIXED: Optimized HTML for exact 85x54mm size
  idCardElement.innerHTML = `
    <div style="
      width: 85mm;
      height: 54mm;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      border: 1px solid #e1e8ed;
      padding: 8px;
      position: relative;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    ">

      <!-- Watermark -->
      <div style="
        position: absolute;
        bottom: 10px;
        right: 10px;
        opacity: 0.03;
        font-size: 40px;
        font-weight: bold;
        color: #1e40af;
        transform: rotate(-30deg);
        pointer-events: none;
      ">
        BUBT
      </div>

      <!-- Header -->
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid #1e40af;
      ">
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4ff;
          border: 1px solid #dbe4ff;
          flex-shrink: 0;
        ">
          <div style="width: 20px; height: 20px; background: #1e40af; border-radius: 50%;"></div>
        </div>

        <div style="flex-grow:1;">
          <div style="font-size:10px; font-weight:bold; color:#1e3a8a; line-height:1.1;">
            Bangladesh University of<br/>
            <span style="font-size:8px; color:#1e40af;">
              Business & Technology
            </span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div style="
        display:flex;
        gap:8px;
        margin-bottom:6px;
        height: 45mm;
      ">
        <!-- Photo Section -->
        <div style="width: 70px; flex-shrink: 0;">

          <div style="
            width: 70px;
            height: 70px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9fafb;
            margin-bottom: 4px;
          ">
            ${photoHtml}
          </div>

          <div style="
            text-align:center;
            font-size:8px;
            color:#dc2626;
            font-weight:bold;
            background:#fef2f2;
            padding:2px 4px;
            border-radius:3px;
            border:1px solid #fecaca;
          ">
            ${userType}
          </div>
        </div>

        <!-- Details -->
        <div style="flex-grow:1;">

          <div style="
            margin-bottom:6px;
            padding-bottom:4px;
            border-bottom:1px solid #d1d5db;
          ">
            <div style="
              font-size:12px;
              font-weight:bold;
              color:#1e3a8a;
              line-height:1.2;
            ">
              ${application.firstName} ${application.lastName}
            </div>
          </div>

          ${
            application.program
              ? `
              <div style="margin-bottom:3px; font-size:8px;">
                <strong style="color:#374151;">Program:</strong>
                <span style="color:#4b5563;">
                  ${formatProgram(application.program)}
                </span>
              </div>
            `
              : ""
          }

          <div style="margin-bottom:3px; font-size:8px;">
            <strong style="color:#374151;">ID:</strong>
            <span style="color:#4b5563;">${application.studentId}</span>
          </div>

          <div style="margin-bottom:3px; font-size:8px; word-break:break-all;">
            <strong style="color:#374151;">Email:</strong> 
            <span style="color:#4b5563;">${application.email}</span>
          </div>

          <!-- Validity -->
          <div style="
            margin-top:8px;
            padding-top:6px;
            border-top:1px dashed #d1d5db;
          ">
            <div style="
              font-size:7px;
              color:#dc2626;
              text-align:center;
              font-weight:bold;
              margin-bottom:1px;
            ">
              Valid for: ${getCountdown(application.approvedAt)} days • Temporary ID
            </div>

            <div style="
              font-size:6px;
              color:#6b7280;
              text-align:center;
            ">
              Issued: ${
                application.approvedAt
                  ? new Date(application.approvedAt).toLocaleDateString()
                  : "N/A"
              }
            </div>
          </div>

        </div>
      </div>

      <!-- Barcode -->
      <div style="
        height:15px;
        background: repeating-linear-gradient(
          90deg,
          #000,
          #000 1px,
          transparent 1px,
          transparent 2px
        );
        border-radius:2px;
        margin-top:4px;
      "></div>

      <div style="
        text-align:center;
        font-size:7px;
        color:#6b7280;
        margin-top:2px;
      ">
        ID: ${application.studentId}
      </div>

      <!-- Footer -->
      <div style="
        text-align:center;
        margin-top:6px;
        padding-top:4px;
        border-top:1px solid #d1d5db;
      ">
        <div style="
          font-size:9px;
          font-weight:bold;
          color:#1e3a8a;
          letter-spacing:0.5px;
        ">
          BUBT ID CARD
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(idCardElement);

  try {
    // ✅ FIXED: Use exact dimensions for html2canvas
    const canvas = await html2canvas(idCardElement, {
      scale: 3, // Reduced scale for better performance
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: idCardElement.offsetWidth,
      height: idCardElement.offsetHeight,
      windowWidth: idCardElement.scrollWidth,
      windowHeight: idCardElement.scrollHeight
    });

    // ✅ FIXED: Create PDF with exact ID card dimensions
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85, 54], // Exact ID card size
      compress: true
    });

    // Calculate image dimensions to fit exactly
    const imgWidth = 85;
    const imgHeight = 54;

    const imgData = canvas.toDataURL('image/png', 0.8); // Reduced quality for smaller file

    // Add image to fill entire PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
    
    pdf.save(`BUBT-ID-${application.studentId}.pdf`);
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating ID card. Please try again.");
  } finally {
    document.body.removeChild(idCardElement);
  }
};

  const handleDownload = (application) => {
    generateIDCard(application);
  };

  // Get recent applications from localStorage
  const recentApplications = JSON.parse(localStorage.getItem('recentApplications') || '[]');

  // ✅ Show applications for current studentId only
  const visibleApplications = applications.filter(app => 
    app.studentId === studentId
  );

  console.log("👀 Visible applications for", studentId, ":", visibleApplications);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-grow">
        <div className="container px-4 mx-auto py-8">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Your Applications</h2>
          <p className="text-center text-gray-600 mb-8">View and download your approved ID cards</p>
          
          {/* Student ID Header */}
          {studentId && !showManualInput && (
            <div className="max-w-2xl mx-auto mb-6 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Showing applications for: 
                  <span className="font-bold text-blue-600 ml-2">{studentId}</span>
                </p>
                <div className="flex gap-4 justify-center mt-2">
                  <button
                    onClick={handleUseDifferentId}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    🔄 Use Different ID
                  </button>
                  <button
                    onClick={handleClearStorage}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    🗑️ Clear Saved ID
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Input Form */}
          {showManualInput && (
            <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Enter Your Student ID</h3>
              
              {/* Recent IDs Quick Select */}
              {recentApplications.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Recent IDs:</p>
                  <div className="flex flex-wrap gap-2">
                    {recentApplications.map((app, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setStudentId(app.studentId);
                          fetchApplications(app.studentId);
                          setShowManualInput(false);
                        }}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition border border-blue-200"
                      >
                        <div className="font-medium">{app.studentId}</div>
                        <div className="text-xs text-blue-600">{app.count} applications</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your Student ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  View My Applications
                </button>
              </form>
            </div>
          )}

          {/* Debug Info */}
          {studentId && (
            <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                <strong>Applications Status:</strong> Student ID: <strong>{studentId}</strong> | 
                Found: {visibleApplications.length} application(s)
              </p>
            </div>
          )}
          
          {visibleApplications.length === 0 && studentId ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Applications Found</h3>
              <p className="text-gray-600 mb-6 text-lg">
                No applications found for Student ID: <strong>{studentId}</strong>
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <p className="mb-2">✅ Make sure you entered the correct Student ID</p>
                <p>📝 You can submit a new application from the "Request ID Card" tab</p>
              </div>
              <button
                onClick={handleUseDifferentId}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Try different Student ID
              </button>
            </div>
          ) : visibleApplications.length > 0 ? (
            <div className="grid gap-6 max-w-6xl mx-auto">
              {visibleApplications.map((app, index) => (
                <div
                  key={app._id || app.studentId || index}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-start gap-4 flex-grow">
                      <div className="flex-shrink-0">
                        {app.photo ? (
                          <img
                            src={`${API_BASE_URL}/uploads/${app.photo}`}
                            alt="Student"
                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-300 shadow-md"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div className={`w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-300 flex items-center justify-center text-gray-500 text-sm font-medium shadow-md ${
                          app.photo ? "hidden" : "flex"
                        }`}>
                          No Photo
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">Name:</span>
                            <span className="text-gray-900 text-lg font-medium">{app.firstName} {app.lastName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">ID:</span>
                            <span className="text-gray-900 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{app.studentId}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">Email:</span>
                            <span className="text-gray-900 text-sm">{app.email}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {app.program && (
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-700 min-w-20">Program:</span>
                              <span className="text-gray-900 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">{app.program}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">Approved:</span>
                            <span className="text-gray-900 text-sm bg-green-50 px-3 py-1 rounded-full">
                              {app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : "Not Approved"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">Status:</span>
                            <span className={`font-bold text-lg ${
                              app.approvedAt 
                                ? (getCountdown(app.approvedAt) > 0 ? "text-green-600" : "text-red-600")
                                : "text-orange-600"
                            }`}>
                              {app.approvedAt 
                                ? (getCountdown(app.approvedAt) > 0 
                                    ? `✅ Valid (${getCountdown(app.approvedAt)} days left)` 
                                    : "❌ Expired")
                                : "⏳ Pending Approval"
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {app.approvedAt && getCountdown(app.approvedAt) > 0 ? (
                        <button
                          onClick={() => handleDownload(app)}
                          className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          📥 Download ID Card
                        </button>
                      ) : (
                        <div className="text-center text-gray-500 text-sm bg-gray-100 px-4 py-3 rounded-lg">
                          {app.approvedAt ? "🕒 ID Card Expired" : "⏳ Awaiting Approval"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentApplications;