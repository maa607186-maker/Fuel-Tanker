import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../App";
// import { Vehicle } from "./Vehicles"; // reuse Vehicle interface if you export or redefine here

interface Vehicle {
  _id: string;
  label: string;
  make?: string;
  model?: string;
  year?: number;
  fuelType?: string;
}

interface FuelEntry {
  _id: string;
  vehicle: string;    // vehicle ID
  date: string;       // ISO date string
  odometer: number;
  station: string;
  brand: string;
  grade: string;
  liters: number;
  totalAmount: number;
  notes?: string;
}

const FuelEntries: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters:
  const [filterVehicleId, setFilterVehicleId] = useState<string>("");

  // Modal states for Add/Edit form
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<FuelEntry | null>(null);

  // Form fields
  const [vehicle, setVehicle] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [odometer, setOdometer] = useState<number>(0);
  const [station, setStation] = useState("");
  const [brand, setBrand] = useState("");
  const [grade, setGrade] = useState("");
  const [liters, setLiters] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicles and entries
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const vehiclesRes = await axios.get("/vehicles");
        setVehicles(vehiclesRes.data);

        const vehicleForFilter = filterVehicleId || "";

        const fuelEntriesRes = await axios.get("/fuel-entries", {
          params: vehicleForFilter ? { vehicleId: vehicleForFilter } : {},
        });

        setFuelEntries(fuelEntriesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterVehicleId]);

  const resetForm = () => {
    setVehicle("");
    setDate(new Date().toISOString().substring(0, 10));
    setOdometer(0);
    setStation("");
    setBrand("");
    setGrade("");
    setLiters(0);
    setTotalAmount(0);
    setNotes("");
    setError(null);
    setEditEntry(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (entry: FuelEntry) => {
    setEditEntry(entry);
    setVehicle(entry.vehicle);
    setDate(entry.date.substring(0, 10));
    setOdometer(entry.odometer);
    setStation(entry.station);
    setBrand(entry.brand);
    setGrade(entry.grade);
    setLiters(entry.liters);
    setTotalAmount(entry.totalAmount);
    setNotes(entry.notes ?? "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) {
      setError("Vehicle is required");
      return;
    }
    if (!station.trim() || !brand.trim() || !grade.trim()) {
      setError("Station, Brand, and Grade are required");
      return;
    }
    if (liters <= 0 || totalAmount <= 0 || odometer <= 0) {
      setError("Liters, Total Amount and Odometer must be positive");
      return;
    }
    setError(null);

    try {
      if (editEntry) {
        await axios.put(`/fuel-entries/${editEntry._id}`, {
          vehicle, date, odometer, station, brand, grade, liters, totalAmount, notes,
        });
      } else {
        await axios.post("/fuel-entries", {
          vehicle, date, odometer, station, brand, grade, liters, totalAmount, notes,
        });
      }
      setShowForm(false);
      resetForm();
      // Reload entries
      const fuelEntriesRes = await axios.get("/fuel-entries", {
        params: filterVehicleId ? { vehicleId: filterVehicleId } : {}
      });
      setFuelEntries(fuelEntriesRes.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save entry");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this fuel entry?")) return;
    try {
      await axios.delete(`/fuel-entries/${id}`);
      setFuelEntries(fuelEntries.filter(entry => entry._id !== id));
    } catch {
      alert("Failed to delete fuel entry");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl mb-4 text-blue-700">Fuel Entries</h1>

      {/* Vehicle filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by vehicle:</label>
        <select
          value={filterVehicleId}
          onChange={e => setFilterVehicleId(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="">All Vehicles</option>
          {vehicles.map(v => (
            <option key={v._id} value={v._id}>{v.label}</option>
          ))}
        </select>
        <button
          onClick={openAddForm}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Fill-Up
        </button>
      </div>

      {loading ? (
        <div>Loading fuel entries...</div>
      ) : fuelEntries.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        <table className="w-full table-auto border-2 border-gray-300 border-collapse">
          <thead>
            <tr className="bg-pink-200">
              <th className="border p-2">Date</th>
              <th className="border p-2">Vehicle</th>
              <th className="border p-2">Odometer</th>
              <th className="border p-2">Station</th>
              <th className="border p-2">Brand</th>
              <th className="border p-2">Grade</th>
              <th className="border p-2">Litres</th>
              <th className="border p-2">Total Amount ({user?.preferredCurrency})</th>
              <th className="border p-2">Notes</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fuelEntries.map(entry => {
              const vehicleObj = vehicles.find(v => v._id === entry.vehicle);
              return (
                <tr key={entry._id} className="hover:bg-gray-50">
                  <td className="border p-1 text-center">{entry.date.substring(0,10)}</td>
                  <td className="border p-1">{vehicleObj?.label ?? "Unknown"}</td>
                  <td className="border p-1 text-right">{entry.odometer}</td>
                  <td className="border p-1">{entry.station}</td>
                  <td className="border p-1">{entry.brand}</td>
                  <td className="border p-1">{entry.grade}</td>
                  <td className="border p-1 text-right">{entry.liters.toFixed(2)}</td>
                  <td className="border p-1 text-right">{entry.totalAmount.toFixed(2)}</td>
                  <td className="border p-1">{entry.notes ?? ""}</td>
                  <td className="border p-1 text-center space-x-2">
                    <button
                      onClick={() => openEditForm(entry)}
                      className="text-blue-600  hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Add/Edit Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl mb-4">{editEntry ? "Edit Fill-Up" : "Add Fill-Up"}</h2>
            {error && <div className="mb-2 text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">

              <label className="block">
                Vehicle <span className="text-red-600">*</span>
                <select
                  required
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                Date <span className="text-red-600">*</span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </label>

              <label className="block">
                Odometer (km) <span className="text-red-600">*</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={odometer}
                  onChange={e => setOdometer(Number(e.target.value))}
                  className="w-full border p-2 rounded"
                />
              </label>

              <label className="block">
                Station <span className="text-red-600">*</span>
                <input
                  type="text"
                  required
                  value={station}
                  onChange={e => setStation(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </label>

              <label className="block">
                Brand <span className="text-red-600">*</span>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </label>

              <label className="block">
                Grade <span className="text-red-600">*</span>
                <input
                  type="text"
                  required
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </label>

              <label className="block">
                Litres <span className="text-red-600">*</span>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="0.01"
                  value={liters}
                  onChange={e => setLiters(Number(e.target.value))}
                  className="w-full border p-2 rounded"
                />
              </label>

              <label className="block">
                Total Amount ({user?.preferredCurrency}) <span className="text-red-600">*</span>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="0.01"
                  value={totalAmount}
                  onChange={e => setTotalAmount(Number(e.target.value))}
                  className="w-full border p-2 rounded"
                />
              </label>

              <label className="block">
                Notes (optional)
                <textarea
                  maxLength={500}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border p-2 rounded"
                  rows={3}
                />
              </label>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelEntries;