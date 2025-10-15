
const express = require("express");
const { ensureAuth } = require("../middleware/auth");
const Vehicle = require("../models/Vehicle");
const FuelEntry = require("../models/FuelEntry");

const router = express.Router();
router.use(ensureAuth);

/**
 * Calculate rolling stats, per-brand averages, etc.
 * Accept query parameters:
 *  - vehicleId (optional)
 *  - period (days): last N days, default 30
 */
router.get("/", async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const vehicleId = req.query.vehicleId;
    const periodDays = parseInt(req.query.period) || 30;
    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Filter user's vehicles
    let vehicleFilter = {};

    if (vehicleId) {
      // Verify ownership
      const vehicle = await Vehicle.findOne({ _id: vehicleId, user: userId });
      if (!vehicle) {
        return res.status(403).json({ message: "Forbidden" });
      }
      vehicleFilter = { vehicle: vehicle._id };
    } else {
      const vehicles = await Vehicle.find({ user: userId }).select("_id");
      vehicleFilter = { vehicle: { $in: vehicles.map(v => v._id) } };
    }

    // Filter for period
    const dateFilter = { date: { $gte: periodStart } };

    // Fetch entries in period
    const entries = await FuelEntry.find({ ...vehicleFilter, ...dateFilter })
      .sort({ date: 1 })
      .lean();

    // If not enough data, return defaults
    // if (entries.length < 2) {
    //   return res.json({
    //     currentRollingAverageConsumption: null,
    //     rollingAverageCostPerLiter: null,
    //     totalSpend: 0,
    //     totalDistance: 0,
    //     averageCostPerKm: null,
    //     averageDistancePerDay: null,
    //     brandStats: [],
    //   });
    // }

    if (entries.length === 0) {
  return res.json({
    currentRollingAverageConsumption: null,
    rollingAverageCostPerLiter: null,
    totalSpend: 0,
    totalDistance: 0,
    averageCostPerKm: null,
    averageDistancePerDay: null,
    brandStats: []
  });
}

if (entries.length === 1) {
  const entry = entries[0];
  const costPerLiter = entry.totalAmount / entry.liters;
  return res.json({
    currentRollingAverageConsumption: null, // can't calculate yet
    rollingAverageCostPerLiter: costPerLiter.toFixed(2),
    totalSpend: entry.totalAmount.toFixed(2),
    totalDistance: 0,
    averageCostPerKm: null,
    averageDistancePerDay: null,
    brandStats: []
  });
}


    // Initialize totals
    let totalLiters = 0;
    let totalCost = 0;
    let totalDistance = 0;
    let sumCostPerLiterTimesLiters = 0;

    const firstDate = entries[0].date;
    const lastDate = entries[entries.length - 1].date;

    // Compute per-entry metrics
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1];
      const curr = entries[i];

      curr.distance_since_last = curr.odometer - prev.odometer; // km
      curr.unit_price = curr.totalAmount / curr.liters;
      curr.consumption_L_100km =
        curr.distance_since_last > 0
          ? (curr.liters / curr.distance_since_last) * 100
          : null;
      curr.cost_per_km =
        curr.distance_since_last > 0
          ? curr.totalAmount / curr.distance_since_last
          : null;
    }

    // Aggregate totals
    for (let i = 1; i < entries.length; i++) {
      const curr = entries[i];
      if (curr.distance_since_last && curr.distance_since_last > 0) {
        totalDistance += curr.distance_since_last;
        totalLiters += curr.liters;
        totalCost += curr.totalAmount;
        sumCostPerLiterTimesLiters += curr.unit_price * curr.liters;
      }
    }

    // Compute summary metrics
    const rollingAverageConsumption = (totalLiters / totalDistance) * 100;
    const rollingAverageCostPerLiter = totalCost / totalLiters;
    const averageCostPerKm = totalCost / totalDistance;
    const daySpan =
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24) || 1;
    const averageDistancePerDay = totalDistance / daySpan;

    // Brand stats (all time, not limited to period)
    const allUserVehicles = await Vehicle.find({ user: userId }).select("_id");
    const allVehicleIds = allUserVehicles.map(v => v._id);

    const brandStatsRaw = await FuelEntry.aggregate([
      { $match: { vehicle: { $in: allVehicleIds } } },
      {
        $group: {
          _id: "$brand",
          avgCostPerLiter: {
            $avg: { $divide: ["$totalAmount", "$liters"] },
          },
        //   avgConsumption_L_100km: {
        //     $avg: 100 * { $divide: ["$liters", 1] }, // placeholder
        //   },
          
          countFillUps: { $sum: 1 },
        },
      },
    ]);

    // Return JSON response
    res.json({
      currentRollingAverageConsumption: rollingAverageConsumption.toFixed(1),
      rollingAverageCostPerLiter: rollingAverageCostPerLiter.toFixed(2),
      totalSpend: totalCost.toFixed(2),
      totalDistance: Math.round(totalDistance),
      averageCostPerKm: averageCostPerKm.toFixed(2),
      averageDistancePerDay: averageDistancePerDay.toFixed(1),
      brandStats: brandStatsRaw.map(b => ({
        brand: b._id,
        avgCostPerLiter: b.avgCostPerLiter.toFixed(2),
        countFillUps: b.countFillUps,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


/**
 * routes/stats.js
 * 
 * This route calculates summary and rolling fuel consumption stats
 * for the logged-in user’s vehicles.
 * 
 * It supports optional filtering by:
 *  - specific vehicle (via ?vehicleId=)
 *  - time period in days (via ?period=)
 */

// const express = require("express");
// const { ensureAuth } = require("../middleware/auth");
// const Vehicle = require("../models/Vehicle");
// const FuelEntry = require("../models/FuelEntry");

// const router = express.Router();

// // ✅ Protect all routes under this router — requires authentication
// router.use(ensureAuth);

// router.get("/", async (req, res, next) => {
//   try {
//     // ----------------------------------------------------
//     // 1️⃣ Read user and query parameters
//     // ----------------------------------------------------
//     const userId = req.session.userId; // from session
//     const vehicleId = req.query.vehicleId; // optional filter
//     const periodDays = parseInt(req.query.period) || 30; // default: last 30 days
//     const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

//     // ----------------------------------------------------
//     // 2️⃣ Filter vehicles belonging to this user
//     // ----------------------------------------------------
//     let vehicleFilter = {};

//     if (vehicleId) {
//       // ✅ User requested a specific vehicle — check ownership
//       const vehicle = await Vehicle.findOne({ _id: vehicleId, user: userId });
//       if (!vehicle) {
//         return res.status(403).json({ message: "Forbidden" });
//       }
//       vehicleFilter = { vehicle: vehicle._id };
//     } else {
//       // ✅ Include all vehicles owned by this user
//       const vehicles = await Vehicle.find({ user: userId }).select("_id");
//       vehicleFilter = { vehicle: { $in: vehicles.map(v => v._id) } };
//     }

//     // ----------------------------------------------------
//     // 3️⃣ Filter entries by date range
//     // ----------------------------------------------------
//     const dateFilter = { date: { $gte: periodStart } };

//     // ----------------------------------------------------
//     // 4️⃣ Fetch all fuel entries for the chosen filter
//     // ----------------------------------------------------
//     const entries = await FuelEntry.find({ ...vehicleFilter, ...dateFilter })
//       .sort({ date: 1 }) // oldest → newest
//       .lean();

//     // ----------------------------------------------------
//     // 5️⃣ Handle edge cases: 0 or 1 fuel entry
//     // ----------------------------------------------------
//     if (entries.length === 0) {
//       // 🟢 No data for this period
//       return res.json({
//         currentRollingAverageConsumption: null,
//         rollingAverageCostPerLiter: null,
//         totalSpend: 0,
//         totalDistance: 0,
//         averageCostPerKm: null,
//         averageDistancePerDay: null,
//         brandStats: []
//       });
//     }

//     if (entries.length === 1) {
//       // 🟡 Only one fill-up — can’t compute distance or consumption yet
//       const entry = entries[0];
//       const costPerLiter = entry.totalAmount / entry.liters;
//       return res.json({
//         currentRollingAverageConsumption: null,
//         rollingAverageCostPerLiter: costPerLiter.toFixed(2),
//         totalSpend: entry.totalAmount.toFixed(2),
//         totalDistance: 0,
//         averageCostPerKm: null,
//         averageDistancePerDay: null,
//         brandStats: []
//       });
//     }

//     // ----------------------------------------------------
//     // 6️⃣ Initialize totals for rolling calculations
//     // ----------------------------------------------------
//     let totalLiters = 0;
//     let totalCost = 0;
//     let totalDistance = 0;
//     let sumCostPerLiterTimesLiters = 0;

//     const firstDate = entries[0].date;
//     const lastDate = entries[entries.length - 1].date;

//     // ----------------------------------------------------
//     // 7️⃣ Compute per-entry metrics (distance, consumption, cost)
//     // ----------------------------------------------------
//     for (let i = 1; i < entries.length; i++) {
//       const prev = entries[i - 1];
//       const curr = entries[i];

//       // Distance since last fill-up (km)
//       curr.distance_since_last = curr.odometer - prev.odometer;

//       // Cost per liter
//       curr.unit_price = curr.totalAmount / curr.liters;

//       // Fuel consumption (L/100km)
//       curr.consumption_L_100km =
//         curr.distance_since_last > 0
//           ? (curr.liters / curr.distance_since_last) * 100
//           : null;

//       // Cost per km driven
//       curr.cost_per_km =
//         curr.distance_since_last > 0
//           ? curr.totalAmount / curr.distance_since_last
//           : null;
//     }

//     // ----------------------------------------------------
//     // 8️⃣ Aggregate totals across all entries
//     // ----------------------------------------------------
//     for (let i = 1; i < entries.length; i++) {
//       const curr = entries[i];
//       if (curr.distance_since_last && curr.distance_since_last > 0) {
//         totalDistance += curr.distance_since_last;
//         totalLiters += curr.liters;
//         totalCost += curr.totalAmount;
//         sumCostPerLiterTimesLiters += curr.unit_price * curr.liters;
//       }
//     }

//     // ----------------------------------------------------
//     // 9️⃣ Compute summary statistics
//     // ----------------------------------------------------
//     const rollingAverageConsumption = (totalLiters / totalDistance) * 100;
//     const rollingAverageCostPerLiter = totalCost / totalLiters;
//     const averageCostPerKm = totalCost / totalDistance;
//     const daySpan =
//       (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24) || 1;
//     const averageDistancePerDay = totalDistance / daySpan;

//     // ----------------------------------------------------
//     // 🔟 Compute per-brand average cost (across all user vehicles)
//     // ----------------------------------------------------
//     const allUserVehicles = await Vehicle.find({ user: userId }).select("_id");
//     const allVehicleIds = allUserVehicles.map(v => v._id);

//     const brandStatsRaw = await FuelEntry.aggregate([
//       { $match: { vehicle: { $in: allVehicleIds } } },
//       {
//         $group: {
//           _id: "$brand",
//           avgCostPerLiter: {
//             $avg: { $divide: ["$totalAmount", "$liters"] },
//           },
//           countFillUps: { $sum: 1 },
//         },
//       },
//     ]);

//     // ----------------------------------------------------
//     // 11️⃣ Send final computed response to frontend
//     // ----------------------------------------------------
//     res.json({
//       currentRollingAverageConsumption: rollingAverageConsumption.toFixed(1),
//       rollingAverageCostPerLiter: rollingAverageCostPerLiter.toFixed(2),
//       totalSpend: totalCost.toFixed(2),
//       totalDistance: Math.round(totalDistance),
//       averageCostPerKm: averageCostPerKm.toFixed(2),
//       averageDistancePerDay: averageDistancePerDay.toFixed(1),
//       brandStats: brandStatsRaw.map(b => ({
//         brand: b._id,
//         avgCostPerLiter: b.avgCostPerLiter.toFixed(2),
//         countFillUps: b.countFillUps,
//       })),
//     });

//   } catch (err) {
//     // ----------------------------------------------------
//     // 🔴 Error handling
//     // ----------------------------------------------------
//     next(err);
//   }
// });

// module.exports = router;

