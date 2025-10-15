import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../App";

const SignIn: React.FC = () => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/auth/signin", { email, password });
      const profile = await axios.get("/profile");
      setUser(profile.data);
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Sign in failed");
    }
  };

  // return (
  // <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
  //   <h1 className="text-2xl mb-4">Sign In</h1>
  //   {error && <div className="mb-4 text-red-600">{error}</div>}
  //   <form onSubmit={handleSubmit} className="space-y-4">
  //     <input
  //       type="email"
  //       placeholder="Email"
  //       className="w-full border p-2"
  //       value={email} onChange={e => setEmail(e.target.value)} required />
  //     <input
  //       type="password"
  //       placeholder="Password"
  //       className="w-full border p-2"
  //       value={password} onChange={e => setPassword(e.target.value)} required />
  //     <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Sign In</button>
  //   </form>
  //   <p className="mt-4">Don't have an account? <Link to="/signup" className="text-blue-600 underline">Sign Up</Link></p>
  // </div>

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Welcome Back 
        </h1>

        {error && (
          <div className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 mb-1 text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
