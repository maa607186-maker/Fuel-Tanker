import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../App";



import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

interface DashboardStats {
  currentRollingAverageConsumption: string | null;
  rollingAverageCostPerLiter: string | null;
  totalSpend: string;
  totalDistance: number;
  averageCostPerKm: string | null;
  averageDistancePerDay: string | null;
  brandStats: Array<{ brand: string; avgCostPerLiter: string; countFillUps: number }>;
}

interface CostData {
  date: string;
  cost: number;
}

interface ConsumptionData {
  date: string;
  consumption: number;
}

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  console.log("line 21 ", user)

  const [stats, setStats] = useState<DashboardStats | null>(null);
  console.log("line number 56", stats)

  const [loading, setLoading] = useState(true);


  const [costData, setCostData] = useState<CostData[]>([]);
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);


  

  useEffect(() => {
    setLoading(true);
    axios.get("/dashboard?period=30")
      .then((res) => {
        setStats(res.data);
    

        // Dummy: last 7 days cost per liter
        setCostData([
          { date: "Day -6", cost: parseFloat(res.data.rollingAverageCostPerLiter ?? "0") },
          { date: "Day -5", cost: 1.1 },
          { date: "Day -4", cost: 1.2 },
          { date: "Day -3", cost: 1.15 },
          { date: "Day -2", cost: 1.18 },
          { date: "Day -1", cost: 1.16 },
          { date: "Today", cost: parseFloat(res.data.rollingAverageCostPerLiter ?? "0") },
        ]);
        // Dummy: last 7 days consumption
        setConsumptionData([
          { date: "Day -6", consumption: parseFloat(res.data.currentRollingAverageConsumption ?? "0") },
          { date: "Day -5", consumption: 8.9 },
          { date: "Day -4", consumption: 9.2 },
          { date: "Day -3", consumption: 9.0 },
          { date: "Day -2", consumption: 9.1 },
          { date: "Day -1", consumption: 9.0 },
          { date: "Today", consumption: parseFloat(res.data.currentRollingAverageConsumption ?? "0") },
        ]);
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!stats) return <div className="p-6">No stats available.</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl mb-4 text-blue-700">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 rounded border shadow bg-pink-500">
          <h2 className="text-xl mb-2">Avg Consumption (L/100km)</h2>
          <p className="text-2xl">{stats.currentRollingAverageConsumption ?? "N/A"}</p>
        </div>
        <div className="p-4 rounded border shadow bg-red-200">
          <h2 className="text-xl mb-2">Avg Cost per Litre ({user?.preferredCurrency})</h2>
          <p className="text-2xl">{stats.rollingAverageCostPerLiter ?? "N/A"}</p>
        </div>
        <div className="p-4 rounded border shadow bg-red-500">
          <h2 className="text-xl mb-2">Total Spend ({user?.preferredCurrency})</h2>
          <p className="text-2xl">{stats.totalSpend}</p>
        </div>
        <div className="p-4 rounded border shadow bg-green-400">
          <h2 className="text-xl mb-2">Total Distance ({user?.preferredDistanceUnit})</h2>
          <p className="text-2xl">{stats.totalDistance}</p>
        </div>
        <div className="p-4 rounded border shadow bg-red-200">
          <h2 className="text-xl mb-2">Avg Cost per Km</h2>
          <p className="text-2xl">{stats.averageCostPerKm ?? "N/A"}</p>
        </div>
        <div className="p-4 rounded border shadow bg-purple-400">
          <h2 className="text-xl mb-2">Avg Distance per Day</h2>
          <p className="text-2xl">{stats.averageDistancePerDay ?? "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-xl mb-2 text-blue-800 font-bold">Cost per Litre Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={costData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cost" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-xl mb-2 text-blue-800 font-bold">Consumption Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={consumptionData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="consumption" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-xl mb-4 text-blue-800 font-bold">Brand Averages</h3>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className=" bg-sky-500">
              <th className="border border-gray-300 p-2 text-left">Brand</th>
              <th className="border border-gray-300 p-2 text-right">Avg Cost per Litre ({user?.preferredCurrency})</th>
              <th className="border border-gray-300 p-2 text-right">Number of Fill-Ups</th>
            </tr>
          </thead>
          <tbody>
            {stats.brandStats.length === 0 && (
              <tr>
                <td colSpan={3} className="p-2 text-center text-gray-500">No data available</td>
              </tr>
            )}
            {stats.brandStats.map((brand) => (
              <tr key={brand.brand} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{brand.brand}</td>
                <td className="border border-gray-300 p-2 text-right">{brand.avgCostPerLiter}</td>
                <td className="border border-gray-300 p-2 text-right">{brand.countFillUps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;