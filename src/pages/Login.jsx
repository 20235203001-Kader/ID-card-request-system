import React from "react";
import { signInWithGoogle } from "../firebase";
import { useNavigate } from "react-router-dom";
import bubtLogo from "../assets/bubt-withoutbg.png";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { auth } from "../firebase";

function Home() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      console.log("Starting Google Sign In...");
      
      const result = await signInWithGoogle();
      console.log("Google Sign In Success:", result);
      
      const email = result.user.email;
      const displayName = result.user.displayName;

      if (email.endsWith("@cse.bubt.edu.bd")) {
        alert(`Welcome ${displayName}!`);
        
        // Save user info
        localStorage.setItem('user', JSON.stringify({
          name: displayName,
          email: email,
          photo: result.user.photoURL
        }));
        
        navigate("/dashboard");
      } else {
        alert("Only @cse.bubt.edu.bd emails are allowed!");
        // Sign out if wrong email
        await auth.signOut();
      }
    } catch (error) {
      console.error("Google Sign In Error:", error);
      
      // Specific error messages
      if (error.code === 'auth/popup-blocked') {
        alert("Popup was blocked! Please allow popups for this site.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the popup");
      } else {
        alert("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <img src={bubtLogo} alt="BUBT Logo" className="h-40 w-40 mb-8" />
        <h2 className="text-xl md:text-2xl lg:text-4xl font-extrabold text-gray-800 mb-4">
          Welcome to the BUBT University ID Portal
        </h2>
        <p className="text-gray-600 max-w-lg mb-8">
          Easily request lost/damaged ID card replacements online. Login with your official university email to continue.
        </p>

        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition my-4"
        >
          Login with Google
        </button>
      </main>

      <Footer />
    </div>
  );
}

export default Home;