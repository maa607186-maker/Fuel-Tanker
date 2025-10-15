import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../App";

interface BrandStat {
  brand: string;
  avgCostPerLiter: string;
  countFillUps: number;
}

const Stats: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [brandStats, setBrandStats] = useState<BrandStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get("/dashboard") // Pull same dashboard endpoint; brandStats included
      .then((res) => {
        setBrandStats(res.data.brandStats || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl mb-6 text-blue-700">Brand and Grade Comparison</h1>

      {loading ? (
        <p>Loading data...</p>
      ) : brandStats.length === 0 ? (
        <p>No data available yet.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-pink-200">
              <th className="border border-gray-300 p-2 text-left">Brand</th>
              <th className="border border-gray-300 p-2 text-right">Average Cost per Litre ({user?.preferredCurrency})</th>
              <th className="border border-gray-300 p-2 text-right">Number of Fill-Ups</th>
            </tr>
          </thead>
          <tbody>
            {brandStats.map(stat => (
              <tr key={stat.brand} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{stat.brand}</td>
                <td className="border border-gray-300 p-2 text-right">{stat.avgCostPerLiter}</td>
                <td className="border border-gray-300 p-2 text-right">{stat.countFillUps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Stats;