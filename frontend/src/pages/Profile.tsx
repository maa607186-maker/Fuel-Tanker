import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext, type User} from "../App";

const Profile: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || "USD");
  const [preferredDistanceUnit, setPreferredDistanceUnit] = useState<"km" | "mi">(user?.preferredDistanceUnit || "km");
  const [preferredVolumeUnit, setPreferredVolumeUnit] = useState<"L" | "gal">(user?.preferredVolumeUnit || "L");
  const [timeZone, setTimeZone] = useState(user?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPreferredCurrency(user.preferredCurrency || "USD");
      setPreferredDistanceUnit(user.preferredDistanceUnit || "km");
      setPreferredVolumeUnit(user.preferredVolumeUnit || "L");
      setTimeZone(user.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const res = await axios.put("/profile", {
        displayName: displayName.trim() || null,
        preferredCurrency,
        preferredDistanceUnit,
        preferredVolumeUnit,
        timeZone,
      });
      setUser(res.data as User);
      setMessage("Profile updated successfully");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
//   <div className="max-w-md mx-auto p-6">
//   <h1 className="text-3xl mb-4 text-blue-700">Profile & Settings</h1>

//   {message && <div className="mb-4 text-green-600">{message}</div>}
//   {error && <div className="mb-4 text-red-600">{error}</div>}

//   <form onSubmit={handleSubmit} className="space-y-4">
//     <label className="block">
//       Display Name
//       <input
//         type="text"
//         className="w-full border p-2 rounded"
//         value={displayName}
//         onChange={(e) => setDisplayName(e.target.value)}
//         placeholder="Optional"
//       />
//     </label>

//     <label className="block">
//       Preferred Currency (ISO Code)
//       <input
//         type="text"
//         maxLength={3}
//         className="w-full border p-2 rounded uppercase"
//         value={preferredCurrency}
//         onChange={(e) => setPreferredCurrency(e.target.value.toUpperCase())}
//       />
//     </label>

//     <label className="block">
//       Preferred Distance Unit
//       <select
//         value={preferredDistanceUnit}
//         onChange={(e) =>
//           setPreferredDistanceUnit(e.target.value as "km" | "mi")
//         }
//         className="w-full border p-2 rounded"
//       >
//         <option value="km">Kilometers (km)</option>
//         <option value="mi">Miles (mi)</option>
//       </select>
//     </label>

//     <label className="block">
//       Preferred Volume Unit
//       <select
//         value={preferredVolumeUnit}
//         onChange={(e) => setPreferredVolumeUnit(e.target.value as "L" | "gal")}
//         className="w-full border p-2 rounded"
//       >
//         <option value="L">Liters (L)</option>
//         <option value="gal">Gallons (gal)</option>
//       </select>
//     </label>

//     <label className="block">
//       Time Zone
//       <input
//         type="text"
//         value={timeZone}
//         onChange={(e) => setTimeZone(e.target.value)}
//         className="w-full border p-2 rounded"
//         placeholder="e.g. UTC, America/New_York"
//       />
//     </label>

//     <button
//       type="submit"
//       className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
//     >
//       Save Changes
//     </button>
//   </form>
// </div>
<div className="max-w-md mx-auto p-6 mt-2 border-2 border-green-200 bg-white shadow-lg rounded-xl">
  <h1 className="text-[20px] font-bold mb-3 text-blue-700 text-center">Profile & Settings</h1>

  {message && (
    <div className="mb-2 px-4 py-2 bg-green-100 text-green-800 border border-green-200 rounded">
      {message}
    </div>
  )}
  {error && (
    <div className="mb-2 px-4 py-2 bg-red-100 text-red-800 border border-red-200 rounded">
      {error}
    </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-3">
    <div>
      <label className="block text-gray-700 font-medium mb-1">Display Name</label>
      <input
        type="text"
        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Optional"
      />
    </div>

    <div>
      <label className="block text-gray-700 font-medium mb-1">Preferred Currency (ISO Code)</label>
      <input
        type="text"
        maxLength={3}
        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none uppercase"
        value={preferredCurrency}
        onChange={(e) => setPreferredCurrency(e.target.value.toUpperCase())}
        placeholder="e.g. USD"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-gray-700 font-medium mb-1">Distance Unit</label>
        <select
          value={preferredDistanceUnit}
          onChange={(e) =>
            setPreferredDistanceUnit(e.target.value as "km" | "mi")
          }
          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="km">Kilometers (km)</option>
          <option value="mi">Miles (mi)</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">Volume Unit</label>
        <select
          value={preferredVolumeUnit}
          onChange={(e) => setPreferredVolumeUnit(e.target.value as "L" | "gal")}
          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="L">Litres (L)</option>
          <option value="gal">Gallons (gal)</option>
        </select>
      </div>
    </div>

    <div>
      <label className="block text-gray-700 font-medium mb-1">Time Zone</label>
      <input
        type="text"
        value={timeZone}
        onChange={(e) => setTimeZone(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        placeholder="e.g. UTC, America/New_York"
      />
    </div>

    <button
      type="submit"
      className="w-full bg-green-600 cursor-pointer text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
    >
      Save Changes
    </button>
  </form>
</div>


  );
};

export default Profile;