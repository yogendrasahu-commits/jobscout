/**
 * Smart Commute & Transit Estimator Service for JobScout
 * Calculates distance, travel times (Metro, Bike, Cab, Walking),
 * monthly expenses, carbon savings, and work-life balance scores across Indian cities.
 */

// Haversine formula to compute great-circle distance in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (!Number.isFinite(nLat1) || !Number.isFinite(nLon1) || !Number.isFinite(nLat2) || !Number.isFinite(nLon2)) {
    return 5.0; // fallback avg 5km
  }
  const R = 6371; // Radius of the Earth in km
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(Math.max(0, Math.min(1, a))), Math.sqrt(Math.max(0, 1 - a)));
  const straightDist = R * c;
  // Multiply by road tortuosity factor (~1.28 for Indian urban grids)
  return Math.round(straightDist * 1.28 * 10) / 10;
}

/**
 * Calculates complete multi-modal commute profile for a given origin & destination
 */
export function estimateCommuteProfile({ userCoords, jobCoords, userAddress, jobAddress }) {
  const uLat = userCoords?.lat || 19.076;
  const uLng = userCoords?.lng || 72.8777;
  const jLat = jobCoords?.lat || 19.082;
  const jLng = jobCoords?.lng || 72.885;

  const distanceKm = calculateDistanceKm(uLat, uLng, jLat, jLng);

  // 1. Metro / Local Train Transit Model
  // Avg urban speed: 32 km/h + 6 mins first/last mile + 5 mins station wait
  const metroMins = Math.max(12, Math.round((distanceKm / 32) * 60 + 10));
  const metroFareOneWay = Math.min(60, Math.max(20, Math.round(distanceKm * 2.5 + 10)));
  const metroMonthlyCost = metroFareOneWay * 2 * 22; // 22 working days

  // 2. Two-Wheeler / Bike Model
  // Avg speed in Indian traffic: 26 km/h. Fuel mileage: 45 km/L @ Rs 104/L
  const bikeMins = Math.max(8, Math.round((distanceKm / 26) * 60 + 3));
  const bikeFuelCostPerKm = 104 / 45; // ~2.31 Rs/km
  const bikeMonthlyCost = Math.round(distanceKm * 2 * 22 * bikeFuelCostPerKm + 200); // +200 wear

  // 3. Auto / Cab Model
  // Avg speed: 20 km/h in peak traffic
  const cabMins = Math.max(10, Math.round((distanceKm / 20) * 60 + 5));
  const cabFareOneWay = Math.round(Math.max(50, 40 + distanceKm * 18));
  const cabMonthlyCost = cabFareOneWay * 2 * 22;

  // 4. Walking Model (feasible up to 3.5 km)
  // Walking speed: 4.8 km/h
  const walkMins = Math.round((distanceKm / 4.8) * 60);
  const isWalkable = distanceKm <= 3.5;

  // Work-Life Balance Score (0 - 100)
  // Optimal: < 30 mins one-way (Score 90-100)
  // Strenuous: > 75 mins one-way (Score < 50)
  const bestCommuteMins = Math.min(metroMins, bikeMins);
  const totalDailyCommuteMins = bestCommuteMins * 2;
  let workLifeScore = Math.max(25, Math.min(100, Math.round(100 - (totalDailyCommuteMins - 30) * 0.75)));
  if (totalDailyCommuteMins <= 30) workLifeScore = 98;

  // Carbon Footprint Savings (Kg of CO2 saved choosing Metro/Bike over Cab per month)
  // Car: ~140g CO2/km, Metro: ~30g CO2/km
  const monthlyKm = distanceKm * 2 * 22;
  const co2SavedKg = Math.round(((monthlyKm * 110) / 1000) * 10) / 10;

  // Recommendation Badge
  let recommendation = {
    mode: 'metro',
    title: 'Metro / Rapid Transit Recommended',
    desc: 'Most predictable transit time with zero traffic delays and lowest monthly expense.',
    icon: '🚇'
  };

  if (distanceKm <= 2.5) {
    recommendation = {
      mode: 'walk',
      title: 'Walking / Active Commute Recommended',
      desc: 'Prime location! Less than 20 mins walking distance from your doorstep.',
      icon: '🚶'
    };
  } else if (bikeMins + 15 < metroMins && distanceKm <= 12) {
    recommendation = {
      mode: 'bike',
      title: 'Two-Wheeler Fastest Option',
      desc: 'Quickest commute door-to-door with minimal parking overhead.',
      icon: '🛵'
    };
  }

  // Google Maps Direction Link
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    userAddress || `${uLat},${uLng}`
  )}&destination=${encodeURIComponent(jobAddress || `${jLat},${jLng}`)}&travelmode=transit`;

  return {
    distanceKm,
    workLifeScore,
    co2SavedKg,
    recommendation,
    gmapsUrl,
    modes: [
      {
        id: 'metro',
        name: 'Metro / Local Train',
        icon: '🚇',
        timeMins: metroMins,
        oneWayFare: `₹${metroFareOneWay}`,
        monthlyCost: `₹${metroMonthlyCost.toLocaleString('en-IN')}`,
        monthlyCostNum: metroMonthlyCost,
        trafficSensitivity: 'Zero Traffic Delay',
        reliability: '98% On-Time',
        badge: 'Lowest Cost & Eco-Friendly',
        color: 'emerald'
      },
      {
        id: 'bike',
        name: 'Bike / Two-Wheeler',
        icon: '🛵',
        timeMins: bikeMins,
        oneWayFare: `₹${Math.round(distanceKm * bikeFuelCostPerKm)}`,
        monthlyCost: `₹${bikeMonthlyCost.toLocaleString('en-IN')}`,
        monthlyCostNum: bikeMonthlyCost,
        trafficSensitivity: 'Low Traffic Sensitivity',
        reliability: '92% Door-to-Door',
        badge: 'Fastest in Congestion',
        color: 'indigo'
      },
      {
        id: 'cab',
        name: 'Cab / Ride Share',
        icon: '🚗',
        timeMins: cabMins,
        oneWayFare: `₹${cabFareOneWay}`,
        monthlyCost: `₹${cabMonthlyCost.toLocaleString('en-IN')}`,
        monthlyCostNum: cabMonthlyCost,
        trafficSensitivity: 'High Peak-Hour Delay',
        reliability: '80% Subject to Traffic',
        badge: 'Maximum Comfort',
        color: 'amber'
      },
      {
        id: 'walk',
        name: 'Walking / Bicycle',
        icon: '🚶',
        timeMins: walkMins,
        oneWayFare: '₹0 (Free)',
        monthlyCost: '₹0 / Month',
        monthlyCostNum: 0,
        trafficSensitivity: 'Zero Traffic',
        reliability: '100% Reliable',
        badge: isWalkable ? 'Healthy & 100% Green' : 'Long Distance Walk',
        color: 'teal'
      }
    ]
  };
}

/**
 * Calculates net in-hand savings after subtracting monthly commute expenses.
 */
export function calculateNetInHand({ grossMonthlySalary, commuteMonthlyCost = 0, taxPercent = 0 }) {
  const salary = Math.max(0, Number(grossMonthlySalary) || 0);
  const commute = Math.max(0, Number(commuteMonthlyCost) || 0);
  const tax = Math.max(0, Math.min(50, Number(taxPercent) || 0));
  const afterTax = salary * (1 - tax / 100);
  const net = Math.max(0, Math.round(afterTax - commute));
  const savingsRate = salary > 0 ? Math.round((net / salary) * 100) : 0;
  return {
    netInHand: net,
    commuteExpense: commute,
    savingsRatePercent: savingsRate
  };
}

