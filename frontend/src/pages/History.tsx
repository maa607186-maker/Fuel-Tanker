import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../App";
// import { Vehicle } from "./Vehicles";

interface FuelEntry {
  _id: string;
  vehicle: string;
  date: string;
  odometer: number;
  station: string;
  brand: string;
  grade: string;
  liters: number;
  totalAmount: number;
  notes?: string;
}

interface Vehicle {
  _id: string;
  label: string;
  make?: string;
  model?: string;
  year?: number;
  fuelType?: string;
}

const PAGE_SIZE = 10;

const History: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & pagination
  const [filterVehicle, setFilterVehicle] = useState("");
  const [filterStation, setFilterStation] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    // Fetch vehicles for filter dropdown
    axios.get("/vehicles")
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles([]));
  }, []);

  useEffect(() => {
    // Reset to page 1 on filter change
    setPage(1);
  }, [filterVehicle, filterStation, filterFromDate, filterToDate]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Prepare query params
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {
      _limit: PAGE_SIZE,
      _page: page,
      _sort: "date",
      _order: "desc"
    };
    if (filterVehicle) params.vehicleId = filterVehicle;
    if (filterStation) params.station = filterStation;
    if (filterFromDate) params.date_gte = filterFromDate;
    if (filterToDate) params.date_lte = filterToDate;

    axios.get("/fuel-entries", { params })
      .then((res) => {
        const fetchedEntries: FuelEntry[] = res.data;
        // For production backend, send total count in headers or in response

        if(page === 1) {
          setEntries(fetchedEntries);
        } else {
          setEntries((prev) => [...prev, ...fetchedEntries]);
        }
        setHasMore(fetchedEntries.length === PAGE_SIZE);
      })
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }, [filterVehicle, filterStation, filterFromDate, filterToDate, page]);

  const loadMore = () => setPage((prev) => prev + 1);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl mb-6 text-blue-700">History</h1>

      {/* Filters */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div>
          <label className="block font-semibold mb-1" htmlFor="filterVehicle">
            Vehicle
          </label>
          <select
            id="filterVehicle"
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="filterStation">
            Station Contains
          </label>
          <input
            id="filterStation"
            type="text"
            value={filterStation}
            placeholder="Search station"
            onChange={(e) => setFilterStation(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="filterFromDate">
            From Date
          </label>
          <input
            id="filterFromDate"
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-full border p-2 rounded"
            max={filterToDate || undefined}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="filterToDate">
            To Date
          </label>
          <input
            id="filterToDate"
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            className="w-full border p-2 rounded"
            min={filterFromDate || undefined}
          />
        </div>
      </form>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {loading && page === 1 ? (
        <p>Loading history...</p>
      ) : entries.length === 0 ? (
        <p>No history records found matching your criteria.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {entries.map((entry) => {
              const vehicle = vehicles.find((v) => v._id === entry.vehicle);
              return (
                <li
                  key={entry._id}
                  className="border rounded p-4 shadow hover:shadow-md transition-shadow cursor-default"
                  tabIndex={0}
                  aria-label={`Fill-up at ${entry.station} on ${entry.date.substring(
                    0,
                    10
                  )}, vehicle ${vehicle?.label || "Unknown"}`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
                    <div>
                      <p>
                        <strong>Date:</strong> {entry.date.substring(0, 10)}
                      </p>
                      <p>
                        <strong>Vehicle:</strong> {vehicle?.label ?? "Unknown"}
                      </p>
                      <p>
                        <strong>Odometer:</strong> {entry.odometer.toLocaleString()} {user?.preferredDistanceUnit}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Station:</strong> {entry.station}
                      </p>
                      <p>
                        <strong>Brand / Grade:</strong> {entry.brand} / {entry.grade}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Liters:</strong> {entry.liters.toFixed(2)} {user?.preferredVolumeUnit}
                      </p>
                      <p>
                        <strong>Total Cost:</strong> {entry.totalAmount.toFixed(2)}{" "}
                        {user?.preferredCurrency}
                      </p>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="mt-2 italic text-gray-600">Notes: {entry.notes}</p>
                  )}
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;