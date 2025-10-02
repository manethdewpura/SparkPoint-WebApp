import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { login } from "../services/auth.service";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleId = user.roleId;
      if (roleId === 1) navigate("/admin");
      else if (roleId === 2) navigate("/operator");
    }
  }, [isAuthenticated, user, navigate]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Transform formData to match server expected format
      const loginData = {
        Username: formData.username,
        Password: formData.password,
      };

      const response = await login(loginData);
      if (response?.user) {
        const roleId = response.user.roleId;
        if (roleId === 1) navigate("/admin");
        if (roleId === 2) navigate("/operator");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#051238]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#051238]">
          SparkPoint Login
        </h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="username"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={onChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7600]"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={onChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7600] pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="h-5 w-5" />
              ) : (
                <AiOutlineEye className="h-5 w-5" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-[#ff7600] text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
