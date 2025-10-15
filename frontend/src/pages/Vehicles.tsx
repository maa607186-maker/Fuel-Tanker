import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../App";

interface Vehicle {
  _id: string;
  label: string;
  make?: string;
  model?: string;
  year?: number;
  fuelType?: string;
}

const Vehicles: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  // Form state
  const [label, setLabel] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [fuelType, setFuelType] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = () => {
    setLoading(true);
    axios
      .get("/vehicles")
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const resetForm = () => {
    setLabel("");
    setMake("");
    setModel("");
    setYear(undefined);
    setFuelType("");
    setError(null);
    setEditVehicle(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (vehicle: Vehicle) => {
    setLabel(vehicle.label);
    setMake(vehicle.make ?? "");
    setModel(vehicle.model ?? "");
    setYear(vehicle.year);
    setFuelType(vehicle.fuelType ?? "");
    setEditVehicle(vehicle);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError("Label is required");
      return;
    }

    try {
      if (editVehicle) {
        await axios.put(`/vehicles/${editVehicle._id}`, {
          label,
          make,
          model,
          year,
          fuelType,
        });
      } else {
        await axios.post("/vehicles", { label, make, model, year, fuelType });
      }
      setShowForm(false);
      resetForm();
      fetchVehicles();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Error saving vehicle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this vehicle? This action cannot be undone."))
      return;
    try {
      await axios.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch {
      alert("Failed to delete vehicle");
    }
  };

  return (
    <div className="container mx-auto p-6">
      {user && (
        <div className="mb-4 text-gray-700">
          Logged in as:{" "}
          <span className="font-semibold">{user.displayName}</span> (
          {user.email})
        </div>
      )}
      <h1 className="text-3xl mb-4 text-blue-700">Vehicles</h1>

      <button
        onClick={openAddForm}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Add Vehicle
      </button>

      {loading ? (
        <div>Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <p>No vehicles found. Add one!</p>
      ) : (
        <table className="w-full table-auto border-collapse border-2 border-gray-300">
          <thead>
            <tr className="bg-pink-200">
              <th className="border border-gray-300 p-2 text-left">Label</th>
              <th className="border border-gray-300 p-2">Make</th>
              <th className="border border-gray-300 p-2">Model</th>
              <th className="border border-gray-300 p-2">Year</th>
              <th className="border border-gray-300 p-2">Fuel Type</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{v.label}</td>
                <td className="border border-gray-300 p-2">{v.make ?? "-"}</td>
                <td className="border border-gray-300 p-2">{v.model ?? "-"}</td>
                <td className="border border-gray-300 p-2">{v.year ?? "-"}</td>
                <td className="border border-gray-300 p-2">
                  {v.fuelType ?? "-"}
                </td>
                <td className="border text-center border-gray-300 p-2 space-x-2">
                  <button
                    onClick={() => openEditForm(v)}
                    className="text-blue-600 cursor-pointer hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v._id)}
                    className="text-red-600 cursor-pointer hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded w-full max-w-md shadow-lg">
            <h2 className="text-xl mb-4">
              {editVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </h2>
            {error && <div className="mb-2 text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Label *"
                className="w-full border p-2 rounded"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Make"
                className="w-full border p-2 rounded"
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
              <input
                type="text"
                placeholder="Model"
                className="w-full border p-2 rounded"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <input
                type="number"
                placeholder="Year"
                className="w-full border p-2 rounded"
                value={year ?? ""}
                onChange={(e) =>
                  setYear(e.target.value ? parseInt(e.target.value) : undefined)
                }
                min={1900}
                max={new Date().getFullYear()}
              />
              <input
                type="text"
                placeholder="Fuel Type"
                className="w-full border p-2 rounded"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              />

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
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

export default Vehicles;
