import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import bubtLogo from "../assets/bubt-withoutbg.png";
import { API_BASE_URL } from "../../config";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email }
      );

      toast.success(data.message || "Password reset link sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={bubtLogo} alt="bubtLogo" className="h-20 w-20" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
          Forgot Password
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Enter your email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to login */}
        <div className="text-sm text-center mt-4">
          <a
            href="/admin/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
