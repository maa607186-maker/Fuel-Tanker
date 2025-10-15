import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../App";

const SignUp: React.FC = () => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validatePassword = () => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[a-zA-Z]/.test(password)) return "Password must include at least one letter";
    if (!/\d/.test(password)) return "Password must include at least one number";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdError = validatePassword();
    if (pwdError) {
      setError(pwdError);
      return;
    }
    try {
      await axios.post("/auth/signup", { email, password });
      const profile = await axios.get("/profile");
      setUser(profile.data);
      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Sign up failed");
    }
  };

  return (
    // <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
    //   <h1 className="text-2xl mb-4">Sign Up</h1>
    //   {error && <div className="mb-4 text-red-600">{error}</div>}
    //   <form onSubmit={handleSubmit} className="space-y-4">
    //     <input
    //       type="email"
    //       placeholder="Email"
    //       className="w-full border p-2"
    //       value={email} onChange={e => setEmail(e.target.value)} required
    //     />
    //     <input
    //       type="password"
    //       placeholder="Password"
    //       className="w-full border p-2"
    //       value={password} onChange={e => setPassword(e.target.value)} required
    //     />
    //     <input
    //       type="password"
    //       placeholder="Confirm Password"
    //       className="w-full border p-2"
    //       value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
    //     />
    //     <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Sign Up</button>
    //   </form>
    //   <p className="mt-4">
    //     Already have an account? <Link to="/signin" className="text-blue-600 underline">Sign In</Link>
    //   </p>
    // </div>
    <div className="max-w-md mx-auto mt-24 p-8 bg-white rounded-2xl border-2 border-green-100 shadow-lg">
  <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Create Account</h1>

  {error && (
    <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
      {error}
    </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-5">
    <input
      type="email"
      placeholder="Email"
      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
      value={email}
      onChange={e => setEmail(e.target.value)}
      required
    />
    
    <input
      type="password"
      placeholder="Password"
      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
      value={password}
      onChange={e => setPassword(e.target.value)}
      required
    />

    <input
      type="password"
      placeholder="Confirm Password"
      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
      value={confirmPassword}
      onChange={e => setConfirmPassword(e.target.value)}
      required
    />

    <button
      type="submit"
      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition"
    >
      Sign Up
    </button>
  </form>

  <p className="mt-6 text-center text-sm text-gray-500">
    Already have an account?{' '}
    <Link to="/signin" className="text-green-600 hover:underline font-medium">
      Sign In
    </Link>
  </p>
</div>

  );
};

export default SignUp;