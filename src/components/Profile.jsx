// src/components/Profile.jsx
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";

const Profile = () => {
  const [activeSection, setActiveSection] = useState("profile");
//   const [topupAmount, setTopupAmount] = useState("");
//   const [trxId, setTrxId] = useState("");
//   const [paymentHistory, setPaymentHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    phoneNumber: "",
  });

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Firebase theke user details
        const firebaseUser = {
          email: user.email,
          displayName: user.displayName || "",
          phoneNumber: user.phoneNumber || "",
          uid: user.uid,
          createdAt: user.metadata.creationTime,
          balance: 0, // Default balance
        };
        setUserDetails(firebaseUser);
        // await fetchPaymentHistory(user.email);

        setEditForm({
          displayName: user.displayName || "",
          phoneNumber: user.phoneNumber || "",
        });
      } else {
        setUser(null);
        setUserDetails(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

//   const fetchPaymentHistory = async (email) => {
//     try {
//       // MongoDB theke payment history anbo
//       const response = await fetch(
//         "https://bubt-server.onrender.com/api/payments/history",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ email }),
//         }
//       );

//     //   if (response.ok) {
//     //     const data = await response.json();
//     //     setPaymentHistory(data.payments || []);
//     //   } else {
//     //     console.log("No payment history found");
//     //     setPaymentHistory([]);
//     //   }
//     } catch (error) {
//       console.error("Error fetching payment history:", error);
//       setPaymentHistory([]);
//     }
//   };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Firebase profile update
      await updateProfile(auth.currentUser, {
        displayName: editForm.displayName,
      });

      // MongoDB te user update korbo (jodi API thake)
      try {
        const response = await fetch(
          "https://bubt-server.onrender.com/api/users/update",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              displayName: editForm.displayName,
              phoneNumber: editForm.phoneNumber,
            }),
          }
        );

        if (response.ok) {
          console.log("User updated in MongoDB");
        }
      } catch (mongoError) {
        console.log("MongoDB update failed, using Firebase only", mongoError);
      }

      // Local state update
      setUserDetails((prev) => ({
        ...prev,
        displayName: editForm.displayName,
        phoneNumber: editForm.phoneNumber,
      }));

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

// const handleTopup = async (e) => {
//   e.preventDefault();
//   if (!topupAmount || topupAmount <= 0) {
//     alert("Please enter a valid amount");
//     return;
//   }

//   if (!trxId || trxId.trim() === '') {
//     alert("Please enter your Transaction ID (TRX ID)");
//     return;
//   }

//   setIsProcessing(true);

//   try {
//     const paymentData = {
//       email: user.email,
//       trxId: trxId.trim(),
//       amount: parseInt(topupAmount),
//       type: "topup",
//       status: "pending",
//       createdAt: new Date().toISOString(),
//       userInfo: {
//         displayName: user.displayName || "",
//         email: user.email,
//         uid: user.uid
//       }
//     };

//     console.log("🚀 Sending payment data:", paymentData);

//     // Step 1: First check if server is responding
//     console.log("🔍 Checking server health...");
//     const healthResponse = await fetch('https://bubt-server.onrender.com/api/health');
//     console.log("Server health status:", healthResponse.status);

//     // Step 2: Try the payment endpoint
//     console.log("📤 Attempting payment API...");
//     const response = await fetch('https://bubt-server.onrender.com/api/payments/create', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(paymentData)
//     });

//     console.log("📥 Response status:", response.status);
//     console.log("📥 Response headers:", response.headers);

//     const responseText = await response.text();
//     console.log("📥 Response text:", responseText);

//     let result;
//     try {
//       result = JSON.parse(responseText);
//     } catch (parseError) {
//       console.log("❌ Response is not JSON:", responseText);
//       result = { error: "Invalid JSON response" };
//     }

//     console.log("📥 Parsed response:", result);

//     if (response.ok) {
//       if (result.success) {
//         alert(`✅ Payment Submitted Successfully!\n\nTRX ID: ${trxId}\nAmount: ${topupAmount} BDT\nStatus: Pending\n\nYour payment is under verification.`);
        
//         // Reset form
//         setTopupAmount("");
//         setTrxId("");
        
//         // Refresh payment history
//         await fetchPaymentHistory(user.email);
//       } else {
//         alert(`❌ API Error: ${result.error || "Unknown error"}`);
//       }
//     } else {
//       if (response.status === 404) {
//         alert(`❌ Backend Route Not Found!\n\nPlease tell backend developer to create:\nPOST /api/payments/create\n\nYour payment details:\n📧 Email: ${user.email}\n💰 Amount: ${topupAmount} BDT\n🔢 TRX ID: ${trxId}`);
//       } else {
//         alert(`❌ Server Error (${response.status}): ${result.error || "Please try again"}`);
//       }
//     }
    
//   } catch (error) {
//     console.error("🌐 Network error:", error);
//     alert(`❌ Network Error!\n\nPlease check your internet connection and try again.\n\nYour payment details for manual processing:\n📧 Email: ${user.email}\n💰 Amount: ${topupAmount} BDT\n🔢 TRX ID: ${trxId}`);
//   } finally {
//     setIsProcessing(false);
//   }
// };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        displayName: user?.displayName || "",
        phoneNumber: userDetails?.phoneNumber || "",
      });
    }
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">
              Please sign in to view your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>

        {/* Profile Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveSection("profile")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeSection === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Personal Information
            </button>
            {/* <button
              onClick={() => setActiveSection("topup")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeSection === "topup"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Topup Balance
            </button>
            <button
              onClick={() => setActiveSection("history")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeSection === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Payment History
            </button> */}
          </div>

          {/* Profile Information */}
          {activeSection === "profile" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {user.displayName || "User Name"}
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                    {userDetails?.balance !== undefined && (
                      <p className="text-green-600 font-medium mt-1">
                        {/* 💰 Balance: {userDetails.balance} BDT */}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleEditToggle}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.displayName}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+8801XXXXXXXXX"
                      />
                    </div> */}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded-md">
                      {user.displayName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded-md">
                      {user.email}
                    </p>
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded-md">
                      {user.phoneNumber || "Not provided"}
                    </p>
                  </div> */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded-md text-xs font-mono">
                      {user.uid}
                    </p>
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Created
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded-md">
                      {user.metadata.creationTime
                        ? new Date(
                            user.metadata.creationTime
                          ).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Balance
                    </label>
                    <p className="text-gray-900 bg-green-50 p-2 rounded-md font-semibold text-green-700 border border-green-200">
                      💰 {userDetails?.balance || 0} BDT
                    </p>
                  </div> */}
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default Profile;
