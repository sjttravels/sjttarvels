// Dynamic Ola-Style Route & Fare Quote Serverless Function
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = {};
  if (req.method === 'POST') {
    if (typeof req.body === 'string') {
      try { body = JSON.parse(req.body); } catch { body = {}; }
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }
  } else {
    body = req.query || {};
  }

  const pickup = String(body.pickup || req.query?.pickup || 'Uttarahalli, Bengaluru').trim();
  const destination = String(body.destination || req.query?.destination || 'Indiranagar, Bengaluru').trim();
  const tripType = String(body.tripType || body.trip_type || req.query?.tripType || req.query?.trip_type || 'POINT_TO_POINT').toUpperCase();
  const passengers = Number(body.passengers || req.query?.passengers || 2);
  const journeyDate = body.journeyDate || body.journey_date || req.query?.journeyDate;
  const returnDate = body.returnDate || body.return_date || req.query?.returnDate;

  // --- KNOWN COORDINATES FOR BENGALURU & KARNATAKA ---
  const KNOWN_COORDINATES = {
    // Cross-town Bengaluru Localities
    'uttarahalli': { lat: 12.9056, lng: 77.5458 },
    'uttarahalli hobli': { lat: 12.9056, lng: 77.5458 },
    'chikkalasandra': { lat: 12.9100, lng: 77.5480 },
    'padmanabhanagar': { lat: 12.9180, lng: 77.5577 },
    'banashankari': { lat: 12.9255, lng: 77.5468 },
    'jp nagar': { lat: 12.9063, lng: 77.5857 },
    'jayanagar': { lat: 12.9308, lng: 77.5838 },
    'basavanagudi': { lat: 12.9416, lng: 77.5755 },
    'indiranagar': { lat: 12.9784, lng: 77.6408 },
    '100 feet road': { lat: 12.9784, lng: 77.6408 },
    'koramangala': { lat: 12.9352, lng: 77.6245 },
    'hsr layout': { lat: 12.9121, lng: 77.6446 },
    'btm layout': { lat: 12.9166, lng: 77.6101 },
    'silk board': { lat: 12.9172, lng: 77.6228 },
    'electronic city': { lat: 12.8399, lng: 77.6770 },
    'whitefield': { lat: 12.9698, lng: 77.7499 },
    'itpl': { lat: 12.9860, lng: 77.7340 },
    'marathahalli': { lat: 12.9591, lng: 77.6974 },
    'bellandur': { lat: 12.9304, lng: 77.6784 },
    'sarjapur': { lat: 12.8601, lng: 77.7865 },
    'bannerghatta': { lat: 12.8009, lng: 77.5777 },
    'kengeri': { lat: 12.9081, lng: 77.4862 },
    'rr nagar': { lat: 12.9274, lng: 77.5154 },
    'rajarajeshwari nagar': { lat: 12.9274, lng: 77.5154 },
    'vijayanagar': { lat: 12.9719, lng: 77.5306 },
    'nagarbhavi': { lat: 12.9610, lng: 77.5097 },
    'rajajinagar': { lat: 12.9982, lng: 77.5530 },
    'malleshwaram': { lat: 13.0031, lng: 77.5643 },
    'peenya': { lat: 13.0285, lng: 77.5197 },
    'hebbal': { lat: 13.0358, lng: 77.5970 },
    'yelahanka': { lat: 13.1007, lng: 77.5963 },
    'manyata': { lat: 13.0480, lng: 77.6200 },
    'rt nagar': { lat: 13.0247, lng: 77.5948 },
    'kalyan nagar': { lat: 13.0280, lng: 77.6392 },
    'kammanahalli': { lat: 13.0159, lng: 77.6378 },
    'mg road': { lat: 12.9756, lng: 77.6066 },
    'brigade road': { lat: 12.9720, lng: 77.6070 },
    'majestic': { lat: 12.9767, lng: 77.5713 },
    'airport': { lat: 13.1986, lng: 77.7066 },
    'kempegowda airport': { lat: 13.1986, lng: 77.7066 },
    'blr airport': { lat: 13.1986, lng: 77.7066 },

    // Generic city fallbacks
    'bengaluru': { lat: 12.9716, lng: 77.5946 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },

    // Karnataka Hubs
    'mysore': { lat: 12.2958, lng: 76.6394 },
    'mysuru': { lat: 12.2958, lng: 76.6394 },
    'coorg': { lat: 12.4244, lng: 75.7382 },
    'madikeri': { lat: 12.4244, lng: 75.7382 },
    'ooty': { lat: 11.4102, lng: 76.6950 },
    'chikmagalur': { lat: 13.3161, lng: 75.7720 },
    'chikkamagaluru': { lat: 13.3161, lng: 75.7720 },
    'tirupati': { lat: 13.6288, lng: 79.4192 },
    'hampi': { lat: 15.3350, lng: 76.4600 },
    'mangalore': { lat: 12.9141, lng: 74.8560 },
    'mangaluru': { lat: 12.9141, lng: 74.8560 },
    'hassan': { lat: 13.0033, lng: 76.1004 },
    'wayanad': { lat: 11.6854, lng: 76.1320 },
    'hubli': { lat: 15.3647, lng: 75.1240 },
    'hubballi': { lat: 15.3647, lng: 75.1240 }
  };

  const VERIFIED_HIGHWAY_PAIRS = {
    // City cross-town routes
    'uttarahalli_indiranagar': { km: 18, durationText: '~1 hr 5 mins', via: 'via City Arterial Roads' },
    'uttarahalli_whitefield': { km: 28, durationText: '~1 hr 10 mins', via: 'via Outer Ring Rd' },
    'uttarahalli_electronic city': { km: 22, durationText: '~45 mins', via: 'via NICE Ring Rd / Hosur Rd' },
    'uttarahalli_airport': { km: 48, durationText: '~1 hr 15 mins', via: 'via Airport Elevated Expressway' },
    'uttarahalli_kempegowda airport': { km: 48, durationText: '~1 hr 15 mins', via: 'via Airport Elevated Expressway' },
    'uttarahalli_majestic': { km: 13, durationText: '~35 mins', via: 'via Mysore Road & KR Market' },
    'uttarahalli_koramangala': { km: 14, durationText: '~40 mins', via: 'via Inner Ring Rd' },
    'uttarahalli_jayanagar': { km: 9, durationText: '~25 mins', via: 'via Kanakapura Road' },
    'uttarahalli_jp nagar': { km: 6, durationText: '~20 mins', via: 'via 24th Main' },
    'uttarahalli_banashankari': { km: 5, durationText: '~15 mins', via: 'via Outer Ring Rd' },
    'uttarahalli_hebbal': { km: 24, durationText: '~1 hr', via: 'via Outer Ring Rd' },
    'uttarahalli_yelahanka': { km: 32, durationText: '~1 hr 15 mins', via: 'via Outer Ring Rd & Bellary Rd' },

    'whitefield_yelahanka': { km: 28, durationText: '~1 hr 5 mins', via: 'via SH 104 / Budigere & Bagalur' },
    'whitefield_indiranagar': { km: 16, durationText: '~45 mins', via: 'via Old Airport Road' },
    'whitefield_koramangala': { km: 18, durationText: '~50 mins', via: 'via Marathahalli & Sarjapur Rd' },
    'whitefield_electronic city': { km: 26, durationText: '~55 mins', via: 'via Sarjapur Rd & Hosur Rd' },
    'whitefield_hebbal': { km: 24, durationText: '~55 mins', via: 'via Outer Ring Rd & Nagavara' },
    'whitefield_majestic': { km: 22, durationText: '~1 hr', via: 'via Old Madras Rd' },
    'whitefield_banashankari': { km: 26, durationText: '~1 hr 5 mins', via: 'via Outer Ring Rd' },

    'indiranagar_koramangala': { km: 7, durationText: '~20 mins', via: 'via Inner Ring Rd' },
    'indiranagar_hebbal': { km: 13, durationText: '~35 mins', via: 'via Old Madras Rd & Outer Ring Rd' },
    'indiranagar_electronic city': { km: 20, durationText: '~45 mins', via: 'via Hosur Road Elevated Expressway' },
    'indiranagar_majestic': { km: 9, durationText: '~25 mins', via: 'via MG Road & Cubbon Park' },
    'indiranagar_yelahanka': { km: 21, durationText: '~50 mins', via: 'via Bellary Road NH 44' },

    'koramangala_electronic city': { km: 15, durationText: '~30 mins', via: 'via Hosur Road Elevated Expressway' },
    'koramangala_hebbal': { km: 17, durationText: '~45 mins', via: 'via Outer Ring Rd' },
    'koramangala_majestic': { km: 10, durationText: '~30 mins', via: 'via Hosur Road & Richmond Circle' },
    'koramangala_yelahanka': { km: 24, durationText: '~55 mins', via: 'via Bellary Road' },

    'hebbal_electronic city': { km: 32, durationText: '~1 hr 10 mins', via: 'via Outer Ring Rd & Hosur Rd' },
    'hebbal_yelahanka': { km: 12, durationText: '~25 mins', via: 'via Bellary Road NH 44' },
    'hebbal_majestic': { km: 11, durationText: '~30 mins', via: 'via Bellary Road' },

    'banashankari_indiranagar': { km: 14, durationText: '~40 mins', via: 'via Marenahalli Rd & Inner Ring Rd' },
    'banashankari_whitefield': { km: 26, durationText: '~1 hr 5 mins', via: 'via Outer Ring Rd' },
    'banashankari_electronic city': { km: 19, durationText: '~40 mins', via: 'via NICE Road / Bannerghatta Rd' },
    'banashankari_yelahanka': { km: 28, durationText: '~1 hr', via: 'via Outer Ring Rd & Bellary Rd' },

    'kengeri_hebbal': { km: 25, durationText: '~55 mins', via: 'via Outer Ring Rd' },
    'kengeri_whitefield': { km: 34, durationText: '~1 hr 20 mins', via: 'via Mysore Road & ORR' },
    'kengeri_electronic city': { km: 24, durationText: '~45 mins', via: 'via NICE Ring Road' },
    'kengeri_indiranagar': { km: 21, durationText: '~55 mins', via: 'via Mysore Road' },
    'kengeri_yelahanka': { km: 31, durationText: '~1 hr 10 mins', via: 'via Outer Ring Rd' },

    'jp nagar_yelahanka': { km: 27, durationText: '~1 hr', via: 'via Bellary Road' },
    'jayanagar_yelahanka': { km: 24, durationText: '~55 mins', via: 'via Bellary Road' },
    'majestic_yelahanka': { km: 16, durationText: '~40 mins', via: 'via Bellary Road' },

    // Outstation corridors
    'uttarahalli_mysore': { km: 145, durationText: '~2 hr 35 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
    'uttarahalli_mysuru': { km: 145, durationText: '~2 hr 35 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
    'bangalore_mysore': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
    'bengaluru_mysore': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
    'bengaluru_mysuru': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
    'bangalore_coorg': { km: 250, durationText: '~5 hr 30 mins', via: 'via Mysore Expressway & Kushalnagar' },
    'bengaluru_coorg': { km: 250, durationText: '~5 hr 30 mins', via: 'via Mysore Expressway & Kushalnagar' },
    'bangalore_ooty': { km: 275, durationText: '~6 hrs', via: 'via Mysore & Bandipur Forest Corridor' },
    'bengaluru_ooty': { km: 275, durationText: '~6 hrs', via: 'via Mysore & Bandipur Forest Corridor' },
    'bangalore_chikmagalur': { km: 245, durationText: '~4 hr 45 mins', via: 'via NH 75 Hassan Highway' },
    'bengaluru_chikmagalur': { km: 245, durationText: '~4 hr 45 mins', via: 'via NH 75 Hassan Highway' },
    'bangalore_tirupati': { km: 250, durationText: '~5 hrs', via: 'via NH 71 / Kolar Highway' },
    'bengaluru_tirupati': { km: 250, durationText: '~5 hrs', via: 'via NH 71 / Kolar Highway' },
    'bangalore_hampi': { km: 340, durationText: '~6 hr 30 mins', via: 'via NH 48 / NH 50' },
    'bengaluru_hampi': { km: 340, durationText: '~6 hr 30 mins', via: 'via NH 48 / NH 50' }
  };

  const GENERIC_KEYS = new Set(['bangalore', 'bengaluru', 'karnataka', 'city']);

  function extractKey(text) {
    const clean = String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return null;
    const all = Object.keys(KNOWN_COORDINATES);
    const specific = all.filter(k => !GENERIC_KEYS.has(k)).sort((a, b) => b.length - a.length);
    for (const k of specific) {
      if (clean.includes(k)) return k;
    }
    for (const k of GENERIC_KEYS) {
      if (clean.includes(k)) return k;
    }
    return null;
  }

  const k1 = extractKey(pickup);
  const k2 = extractKey(destination);

  let distanceKm = 18;
  let distanceRange = '17 km to 22 km';
  let durationText = '~1 hr 5 mins';
  let durationSeconds = 3900;
  let routeVia = 'via City Arterial Roads';
  let isOutstation = false;

  if (k1 && k2) {
    const pair1 = `${k1}_${k2}`;
    const pair2 = `${k2}_${k1}`;
    const hit = VERIFIED_HIGHWAY_PAIRS[pair1] || VERIFIED_HIGHWAY_PAIRS[pair2];
    if (hit) {
      distanceKm = hit.km;
      durationText = hit.durationText;
      routeVia = hit.via;
      isOutstation = hit.km > 45 || tripType === 'OUTSTATION' || tripType === 'ROUND_TRIP';
      const minR = Math.max(1, Math.round(hit.km * 0.94));
      const maxR = Math.round(hit.km * 1.16);
      distanceRange = isOutstation ? `${hit.km} km` : `${minR} km to ${maxR} km`;
    } else {
      const c1 = KNOWN_COORDINATES[k1];
      const c2 = KNOWN_COORDINATES[k2];
      if (c1 && c2) {
        const R = 6371;
        const dLat = (c2.lat - c1.lat) * Math.PI / 180;
        const dLon = (c2.lng - c1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const airKm = R * c;
        const factor = airKm < 25 ? 1.38 : (airKm < 150 ? 1.25 : 1.28);
        distanceKm = Math.max(5, Math.round(airKm * factor));
        isOutstation = distanceKm > 45 || tripType === 'OUTSTATION' || tripType === 'ROUND_TRIP';
        const durSecs = isOutstation ? Math.round((distanceKm / 55) * 3600) : Math.round((distanceKm / 20) * 3600);
        durationSeconds = durSecs;
        const durMins = Math.round(durSecs / 60);
        durationText = durMins >= 60 
          ? `~${Math.floor(durMins / 60)} hr ${durMins % 60 ? (durMins % 60) + ' mins' : ''}`.trim()
          : `~${durMins} mins`;
        const minR = Math.max(1, Math.round(distanceKm * 0.94));
        const maxR = Math.round(distanceKm * 1.16);
        distanceRange = isOutstation ? `${distanceKm} km` : `${minR} km to ${maxR} km`;
        routeVia = isOutstation
          ? (k1.includes('mysor') || k2.includes('mysor') ? 'via Bengaluru-Mysuru Expressway (NH 275)' : 'via National Highway')
          : (distanceKm >= 15 ? 'via Outer Ring Rd & City Corridors' : 'via City Arterial Roads');
      }
    }
  } else {
    // Intelligent heuristic fallbacks
    const pLower = pickup.toLowerCase();
    const dLower = destination.toLowerCase();
    if (pLower.includes('mysor') || dLower.includes('mysor')) {
      distanceKm = 145;
      distanceRange = '145 km';
      durationText = '~2 hr 35 mins';
      routeVia = 'via Bengaluru-Mysuru Expressway (NH 275)';
      isOutstation = true;
    } else if (pLower.includes('coorg') || dLower.includes('coorg') || pLower.includes('madikeri') || dLower.includes('madikeri')) {
      distanceKm = 250;
      distanceRange = '250 km';
      durationText = '~5 hr 30 mins';
      routeVia = 'via Mysore Expressway & Kushalnagar';
      isOutstation = true;
    } else if (pLower.includes('ooty') || dLower.includes('ooty')) {
      distanceKm = 275;
      distanceRange = '275 km';
      durationText = '~6 hrs';
      routeVia = 'via Mysore & Bandipur Forest Corridor';
      isOutstation = true;
    } else if (pLower.includes('chikmagalur') || dLower.includes('chikmagalur')) {
      distanceKm = 245;
      distanceRange = '245 km';
      durationText = '~4 hr 45 mins';
      routeVia = 'via NH 75 Hassan Highway';
      isOutstation = true;
    } else if (pLower.includes('tirupati') || dLower.includes('tirupati')) {
      distanceKm = 250;
      distanceRange = '250 km';
      durationText = '~5 hrs';
      routeVia = 'via NH 71 / Kolar Highway';
      isOutstation = true;
    } else if (pLower.includes('airport') || dLower.includes('airport')) {
      distanceKm = 38;
      distanceRange = '35 km to 42 km';
      durationText = '~55 mins';
      routeVia = 'via Airport Elevated Expressway';
      isOutstation = false;
    } else if (tripType === 'LOCAL') {
      distanceKm = 80;
      distanceRange = '80 km included';
      durationText = '8 Hours Full Day Rental';
      routeVia = 'City-wide flexible disposal';
      isOutstation = false;
    } else if (tripType === 'OUTSTATION' || tripType === 'ROUND_TRIP') {
      distanceKm = 145;
      distanceRange = '145 km';
      durationText = '~2 hr 45 mins';
      routeVia = 'via National & State Highway Corridors';
      isOutstation = true;
    }
  }

  // Master fleet rate cards matching Ola / Uber Outstation & Tejas Travels Karnataka Commercial Standards
  const vehiclesData = [
    { id: 'etios', name: 'Toyota Etios / Sedan', seats: 4, category: 'Sedans', image: '/etios.jpg', cityPerKm: 12, localPkg: 2200, airportPkg: 1400, outstationRate: 12, minKm: 250, bata: 400, cityMin: 150 },
    { id: 'ertiga', name: 'Maruti Suzuki Ertiga', seats: 6, category: 'Ertiga MPV', image: '/ertiga.jpg', cityPerKm: 15, localPkg: 2800, airportPkg: 1800, outstationRate: 15, minKm: 250, bata: 450, cityMin: 220 },
    { id: 'innova', name: 'Toyota Innova Crysta', seats: 7, category: 'Innova Crysta / Hycross', image: '/innova.jpg', cityPerKm: 18, localPkg: 3500, airportPkg: 2400, outstationRate: 18, minKm: 300, bata: 500, cityMin: 280 },
    { id: 'hycross', name: 'Toyota Innova Hycross', seats: 6, category: 'Innova Crysta / Hycross', image: '/hycross.jpg', cityPerKm: 22, localPkg: 4500, airportPkg: 3000, outstationRate: 22, minKm: 300, bata: 550, cityMin: 350 },
    { id: 'tempo', name: 'Tempo Traveller (12 Seater)', seats: 12, category: 'Tempo Travellers', image: '/tempo.jpg', cityPerKm: 24, localPkg: 4500, airportPkg: 3200, outstationRate: 24, minKm: 300, bata: 600, cityMin: 500 },
    { id: 'tempo17', name: 'Tempo Traveller (17 Seater)', seats: 17, category: 'Tempo Travellers', image: '/tempo17.jpg', cityPerKm: 28, localPkg: 7500, airportPkg: 4500, outstationRate: 28, minKm: 350, bata: 700, cityMin: 700 },
    { id: 'minibus', name: 'Mini Bus (25 Seater)', seats: 25, category: 'Tempo Travellers', image: '/minibus.jpg', cityPerKm: 34, localPkg: 8500, airportPkg: 5500, outstationRate: 34, minKm: 350, bata: 800, cityMin: 1000 }
  ];

  let days = 1;
  if (journeyDate && returnDate) {
    try {
      const s = new Date(journeyDate).getTime();
      const e = new Date(returnDate).getTime();
      days = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1);
    } catch { days = 1; }
  }

  const quotes = vehiclesData.map(v => {
    let fare = 2200;
    let runningFare = 0;
    let driverAllowance = 0;
    let rateNote = '';
    let billableKm = distanceKm;

    if (tripType === 'POINT_TO_POINT') {
      if (isOutstation || distanceKm > 45) {
        runningFare = Math.round(distanceKm * v.cityPerKm);
        driverAllowance = v.bata;
        fare = runningFare + driverAllowance;
        billableKm = distanceKm;
        rateNote = `₹${v.cityPerKm}/km • ${distanceKm} km + ₹${driverAllowance} Driver Bata (Intercity)`;
      } else {
        // Ola Cabs Bangalore City Ride rate: Distance * Rate with minimum fare
        runningFare = Math.max(v.cityMin, Math.round(distanceKm * v.cityPerKm));
        driverAllowance = 0;
        fare = runningFare;
        billableKm = distanceKm;
        rateNote = `₹${v.cityPerKm}/km for ${v.name} (Market rate city drop)`;
      }
    } else if (tripType === 'LOCAL') {
      fare = v.localPkg;
      runningFare = v.localPkg;
      driverAllowance = 0;
      billableKm = 80;
      rateNote = '8 hrs / 80 km city rental package included';
    } else if (tripType === 'AIRPORT') {
      fare = v.airportPkg;
      runningFare = v.airportPkg;
      driverAllowance = 0;
      billableKm = distanceKm;
      rateNote = 'Kempegowda Airport dedicated commercial transfer';
    } else if (tripType === 'ROUND_TRIP') {
      const roundTripActualKm = distanceKm * 2;
      const minRequiredKm = days * v.minKm;
      billableKm = Math.max(roundTripActualKm, minRequiredKm);
      runningFare = Math.round(billableKm * v.outstationRate);
      driverAllowance = days * v.bata;
      fare = runningFare + driverAllowance;
      rateNote = `₹${v.outstationRate}/km • ${billableKm} billable km (${days} days) + ₹${driverAllowance} Driver Bata`;
    } else {
      // Outstation One-Way
      const dist = Math.max(distanceKm, 250);
      billableKm = dist;
      runningFare = Math.round(dist * v.outstationRate);
      driverAllowance = v.bata;
      fare = runningFare + driverAllowance;
      rateNote = `₹${v.outstationRate}/km • ${dist} km + ₹${driverAllowance} Driver Allowance (Bata)`;
    }

    return {
      vehicle_id: v.id,
      vehicle_name: v.name,
      seats: v.seats,
      category: v.category,
      image: v.image,
      reg_number: 'KA 05 AB 1234',
      distance_km: distanceKm,
      billable_km: billableKm,
      estimated_days: days,
      base_fare: runningFare,
      running_fare: runningFare,
      airport_fee: tripType === 'AIRPORT' ? 150 : 0,
      driver_allowance: driverAllowance,
      extra_km_rate: v.cityPerKm,
      extra_hour_rate: v.seats <= 4 ? 200 : v.seats <= 7 ? 250 : 400,
      package_hours: tripType === 'LOCAL' ? 8 : undefined,
      package_km: tripType === 'LOCAL' ? 80 : undefined,
      tolls_and_parking: isOutstation ? 'Tolls (FASTag), state taxes & parking as per actuals' : 'Parking & toll charges as per actuals',
      fare,
      rate_note: rateNote,
      city_drop_fare: fare,
      is_outstation_route: isOutstation || distanceKm > 45
    };
  });

  return res.status(200).json({
    trip_type: tripType,
    pickup,
    destination,
    distance_km: distanceKm,
    distance_range: distanceRange,
    duration_seconds: durationSeconds,
    duration_text: durationText,
    route_via: routeVia,
    is_outstation_route: isOutstation || distanceKm > 45,
    outstation_detected: isOutstation || distanceKm > 45,
    available_driver_count: 5,
    driver_availability_status: 'Commercial drivers available on this route',
    quotes
  });
}
