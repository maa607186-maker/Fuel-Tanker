/* eslint-disable react-refresh/only-export-components */
// import React, { useEffect, useState } from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import axios from "axios";
// import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
// import Dashboard from "./pages/Dashboard";
// import Vehicles from "./pages/Vehicles";
// import FuelEntries from "./pages/FuelEntries";
// import Profile from "./pages/Profile";

// // import SignIn from "./pages/SignIn";
// // import SignUp from "./pages/SignUp";
// // import Dashboard from "./pages/Dashboard";
// // import Vehicles from "./pages/Vehicles";
// // import FuelEntries from "./pages/FuelEntries";
// // import Profile from "./pages/Profile";

// export interface User {
//   email: string;
//   displayName?: string;
//   preferredCurrency: string;
//   preferredDistanceUnit: "km" | "mi";
//   preferredVolumeUnit: "L" | "gal";
//   timeZone: string;
// }

// export const AuthContext = React.createContext<{
//   user: User | null;
//   setUser: React.Dispatch<React.SetStateAction<User | null>>;
// }>({ user: null, setUser: () => {} });

// axios.defaults.baseURL = "http://localhost:4000/api";
// axios.defaults.withCredentials = true;

// const App: React.FC = () => {
//   const [user, setUser] = useState<User | null>(null);

//   // Load profile on app startup to check session
//   useEffect(() => {
//     axios.get("/profile").then(res => setUser(res.data))
//       .catch(() => setUser(null));
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" />} />
//           <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
//           <Route path="/" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
//           <Route path="/vehicles" element={user ? <Vehicles /> : <Navigate to="/signin" />} />
//           <Route path="/fuel-entries" element={user ? <FuelEntries /> : <Navigate to="/signin" />} />
//           <Route path="/profile" element={user ? <Profile /> : <Navigate to="/signin" />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthContext.Provider>
//   );
// };

// export default App;

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import FuelEntries from "./pages/FuelEntries";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar"; // 👈 Add this import
import Stats from "./pages/Stats";
import History from "./pages/History";
import Legal from "./pages/Legal";

export interface User {
  email: string;
  displayName?: string;
  preferredCurrency: string;
  preferredDistanceUnit: "km" | "mi";
  preferredVolumeUnit: "L" | "gal";
  timeZone: string;
}

export const AuthContext = React.createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}>({ user: null, setUser: () => {} });

axios.defaults.baseURL = "http://localhost:4000/api";
axios.defaults.withCredentials = true;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Load profile on app startup to check session
  useEffect(() => {
    axios.get("/profile")
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        {/* 👇 Only show Navbar if user is logged in */}
        {user && <Navbar />}

        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />

          {/* Protected Routes */}
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
          <Route path="/stats" element={user ? <Stats/> : <Navigate to="/signin" />} />
          <Route path="/history" element={user ? <History/> : <Navigate to="/signin" />} />
          <Route path="/vehicles" element={user ? <Vehicles /> : <Navigate to="/signin" />} />
          <Route path="/legal" element={user ? <Legal/> : <Navigate to="/signin" />} />

          <Route path="/fuel-entries" element={user ? <FuelEntries /> : <Navigate to="/signin" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/signin" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
