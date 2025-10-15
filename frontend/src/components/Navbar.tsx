/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../App";

const Navbar: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/auth/signout");
      setUser(null);
      navigate("/signin");
    } catch (e) {
      alert("Logout failed");
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-violet-500 text-white p-4 flex justify-between items-center">
      <div className="space-x-6 font-bold">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/vehicles" className="hover:underline">Vehicles</Link>
        <Link to="/fuel-entries" className="hover:underline">Fill-Ups</Link>
        <Link to="/stats" className="hover:underline">Statistics</Link>
        <Link to="/history" className="hover:underline">History</Link>
        <Link to="/legal" className="hover:underline">Legal Info</Link>

        
      </div>
      <button onClick={handleLogout} className="bg-red-500 font-bold cursor-pointer px-3 py-2 rounded hover:bg-red-700">
        Log Out
      </button>
      {/*hello  */}
    </nav>
  );
};

export default Navbar;