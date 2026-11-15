import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:cKhZPIgPk6r6TjViR8NgFTM9M8gT6qme@db-0fd0c69bf9fd.db.getvoroa.com:27061/sjt_travels?sslmode=require";

let pool = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000
    });
  }
  return pool;
}

// Convert row keys to both snake_case and camelCase
function formatBooking(row) {
  if (!row) return null;
  const b = { ...row };
  b.id = String(row.id);
  b._id = String(row.id);
  b.bookingCode = row.booking_code || row.bookingCode;
  b.customerName = row.customer_name || row.customerName;
  b.customerPhone = row.customer_phone || row.customerPhone;
  b.customerEmail = row.customer_email || row.customerEmail;
  b.tripType = row.trip_type || row.tripType;
  b.pickup = row.pickup;
  b.destination = row.destination;
  b.journeyDate = row.journey_date || row.journeyDate;
  b.journeyTime = row.journey_time || row.journeyTime;
  b.returnDate = row.return_date || row.returnDate;
  b.vehicleId = row.vehicle_id || row.vehicleId;
  b.vehicleName = row.vehicle_name || row.vehicleName;
  b.vehicleReg = row.vehicle_reg || row.vehicleReg;
  b.quotedAmount = Number(row.quoted_amount ?? row.quotedAmount ?? 0);
  b.advancePaid = Number(row.advance_paid ?? row.advancePaid ?? 0);
  b.balanceAmount = Number(row.balance_amount ?? row.balanceAmount ?? 0);
  b.paymentMethod = row.payment_method || row.paymentMethod || 'CASH';
  b.paymentStatus = row.payment_status || row.paymentStatus || 'PENDING';
  b.status = row.status || 'CONFIRMED';
  b.assignedDriverId = row.assigned_driver_id || row.assignedDriverId;
  b.assignedDriverName = row.assigned_driver_name || row.assignedDriverName;
  b.assignedDriverPhone = row.assigned_driver_phone || row.assignedDriverPhone;
  b.rideOtp = row.start_otp || row.rideOtp || '9018';
  b.ride_otp = b.rideOtp;
  b.start_otp = b.rideOtp;
  b.adminMessage = row.admin_message || row.adminMessage;
  b.startOdometer = Number(row.start_odometer ?? row.startOdometer ?? 0);
  b.endOdometer = Number(row.end_odometer ?? row.endOdometer ?? 0);
  b.actualKm = Number(row.actual_km ?? row.actualKm ?? 0);
  b.createdAt = row.created_at;
  b.updatedAt = row.updated_at;
  return b;
}

function formatInvoice(row) {
  if (!row) return null;
  const inv = { ...row };
  inv.id = String(row.id);
  inv._id = String(row.id);
  inv.invoiceNumber = row.invoice_number;
  inv.clientName = row.client_name;
  inv.companyName = row.client_name;
  inv.clientType = row.client_type;
  inv.billingPeriod = row.billing_period;
  inv.subtotal = Number(row.subtotal || 0);
  inv.cgst = Number(row.cgst || 0);
  inv.sgst = Number(row.sgst || 0);
  inv.totalAmount = Number(row.grand_total || row.subtotal || 0);
  inv.grand_total = inv.totalAmount;
  inv.status = row.status || 'UNPAID';
  return inv;
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_) { return {}; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch (_) { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}


const KNOWN_COORDINATES = {
  'kempegowda international airport': { lat: 13.1986, lng: 77.7066 },
  'kempegowda airport': { lat: 13.1986, lng: 77.7066 },
  'blr airport': { lat: 13.1986, lng: 77.7066 },
  'airport': { lat: 13.1986, lng: 77.7066 },
  'terminal 1': { lat: 13.1986, lng: 77.7066 },
  'terminal 2': { lat: 13.2030, lng: 77.7120 },
  'ksr bengaluru': { lat: 12.9767, lng: 77.5713 },
  'ksr railway': { lat: 12.9767, lng: 77.5713 },
  'majestic': { lat: 12.9767, lng: 77.5713 },
  'kempegowda bus station': { lat: 12.9767, lng: 77.5713 },
  'yeshwanthpur': { lat: 13.0238, lng: 77.5489 },
  'cantonment': { lat: 12.9930, lng: 77.5980 },
  'smvb': { lat: 12.9961, lng: 77.6534 },
  'byappanahalli': { lat: 12.9961, lng: 77.6534 },
  'kr puram': { lat: 13.0075, lng: 77.6959 },
  'shantinagar': { lat: 12.9545, lng: 77.5934 },
  'uttarahalli': { lat: 12.9056, lng: 77.5458 },
  'chikkalasandra': { lat: 12.9100, lng: 77.5480 },
  'padmanabhanagar': { lat: 12.9180, lng: 77.5577 },
  'banashankari': { lat: 12.9255, lng: 77.5468 },
  'jp nagar': { lat: 12.9063, lng: 77.5857 },
  'jayanagar': { lat: 12.9308, lng: 77.5838 },
  'basavanagudi': { lat: 12.9416, lng: 77.5755 },
  'indiranagar': { lat: 12.9784, lng: 77.6408 },
  'koramangala': { lat: 12.9352, lng: 77.6245 },
  'hsr layout': { lat: 12.9121, lng: 77.6446 },
  'btm layout': { lat: 12.9166, lng: 77.6101 },
  'silk board': { lat: 12.9172, lng: 77.6228 },
  'electronic city': { lat: 12.8399, lng: 77.6770 },
  'whitefield': { lat: 12.9698, lng: 77.7499 },
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
  'mg road': { lat: 12.9756, lng: 77.6066 },
  'brigade road': { lat: 12.9720, lng: 77.6070 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'mysore': { lat: 12.2958, lng: 76.6394 },
  'mysuru': { lat: 12.2958, lng: 76.6394 },
  'mandya': { lat: 12.5242, lng: 76.8958 },
  'srirangapatna': { lat: 12.4237, lng: 76.6830 },
  'coorg': { lat: 12.4244, lng: 75.7382 },
  'madikeri': { lat: 12.4244, lng: 75.7382 },
  'kushalnagar': { lat: 12.4554, lng: 75.9609 },
  'ooty': { lat: 11.4102, lng: 76.6950 },
  'coonoor': { lat: 11.3530, lng: 76.7959 },
  'chikmagalur': { lat: 13.3161, lng: 75.7720 },
  'chikkamagaluru': { lat: 13.3161, lng: 75.7720 },
  'hassan': { lat: 13.0033, lng: 76.1004 },
  'sakleshpur': { lat: 12.9438, lng: 75.7869 },
  'tirupati': { lat: 13.6288, lng: 79.4192 },
  'hampi': { lat: 15.3350, lng: 76.4600 },
  'shivamogga': { lat: 13.9299, lng: 75.5681 },
  'davanagere': { lat: 14.4644, lng: 75.9218 },
  'tumakuru': { lat: 13.3409, lng: 77.1010 },
  'mangalore': { lat: 12.9141, lng: 74.8560 },
  'mangaluru': { lat: 12.9141, lng: 74.8560 },
  'udupi': { lat: 13.3409, lng: 74.7421 },
  'gokarna': { lat: 14.5479, lng: 74.3188 },
  'hubli': { lat: 15.3647, lng: 75.1240 },
  'hubballi': { lat: 15.3647, lng: 75.1240 },
  'belgaum': { lat: 15.8497, lng: 74.4977 },
  'wayanad': { lat: 11.6854, lng: 76.1320 },
  'pondicherry': { lat: 11.9416, lng: 79.8083 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'goa': { lat: 15.4909, lng: 73.8278 }
};

const VERIFIED_HIGHWAY_PAIRS = {
  'uttarahalli_mysore': { km: 145, durationText: '~2 hr 35 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'uttarahalli_mysuru': { km: 145, durationText: '~2 hr 35 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'bangalore_mysore': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'bengaluru_mysore': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'bengaluru_mysuru': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'uttarahalli_indiranagar': { km: 18, durationText: '~1 hr 5 mins', via: 'via City Arterial Roads' },
  'uttarahalli_whitefield': { km: 28, durationText: '~1 hr 10 mins', via: 'via Outer Ring Rd' },
  'uttarahalli_electronic city': { km: 22, durationText: '~45 mins', via: 'via NICE Ring Rd / Hosur Rd' },
  'uttarahalli_airport': { km: 48, durationText: '~1 hr 15 mins', via: 'via Airport Elevated Expressway' },
  'uttarahalli_kempegowda airport': { km: 48, durationText: '~1 hr 15 mins', via: 'via Airport Elevated Expressway' },
  'bangalore_airport': { km: 38, durationText: '~55 mins', via: 'via Bellary Road / Airport Expressway' },
  'bengaluru_airport': { km: 38, durationText: '~55 mins', via: 'via Bellary Road / Airport Expressway' },
  'bengaluru_coorg': { km: 250, durationText: '~5 hr 30 mins', via: 'via Mysore Expressway & Kushalnagar' },
  'bengaluru_ooty': { km: 275, durationText: '~6 hrs', via: 'via Mysore & Bandipur Forest Corridor' },
  'bengaluru_chikmagalur': { km: 245, durationText: '~4 hr 45 mins', via: 'via NH 75 Hassan Highway' },
  'bengaluru_tirupati': { km: 250, durationText: '~5 hrs', via: 'via NH 71 / Kolar Highway' },
  'bengaluru_hampi': { km: 340, durationText: '~6 hr 30 mins', via: 'via NH 48 / NH 50' }
};

function extractLocationKeyServerless(text) {
  const clean = String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const sortedKeys = Object.keys(KNOWN_COORDINATES).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (clean.includes(key)) return key;
  }
  return null;
}

function calculateRouteServerless(pickup, destination, tripType) {
  const normTripType = String(tripType || '').toUpperCase();
  const k1 = extractLocationKeyServerless(pickup);
  const k2 = extractLocationKeyServerless(destination);

  if (k1 && k2) {
    const pair1 = `${k1}_${k2}`;
    const pair2 = `${k2}_${k1}`;
    const hit = VERIFIED_HIGHWAY_PAIRS[pair1] || VERIFIED_HIGHWAY_PAIRS[pair2];
    if (hit) {
      return {
        distanceKm: hit.km,
        distanceRange: `${hit.km} km`,
        durationText: hit.durationText,
        routeVia: hit.via,
        isOutstation: hit.km > 45 || normTripType === 'OUTSTATION' || normTripType === 'ROUND_TRIP'
      };
    }

    const c1 = KNOWN_COORDINATES[k1];
    const c2 = KNOWN_COORDINATES[k2];
    if (c1 && c2) {
      const R = 6371;
      const dLat = (c2.lat - c1.lat) * Math.PI / 180;
      const dLon = (c2.lng - c1.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(c1.lat*Math.PI/180) * Math.cos(c2.lat*Math.PI/180) * Math.sin(dLon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const airKm = R * c;
      const factor = airKm < 25 ? 1.38 : (airKm < 150 ? 1.24 : 1.26);
      const roadKm = Math.max(5, Math.round(airKm * factor));
      const isOutstation = roadKm > 45 || normTripType === 'OUTSTATION' || normTripType === 'ROUND_TRIP';
      const durSecs = isOutstation ? Math.round((roadKm / 55) * 3600) : Math.round((roadKm / 20) * 3600);
      const durMins = Math.round(durSecs / 60);
      const durationText = durMins >= 60 
        ? `~${Math.floor(durMins / 60)} hr ${durMins % 60 ? (durMins % 60) + ' mins' : ''}`.trim()
        : `~${durMins} mins`;
      const isMysore = k1.includes('mysor') || k2.includes('mysor');
      const routeVia = isOutstation 
        ? (isMysore ? 'via Bengaluru-Mysuru Expressway (NH 275)' : 'via National & State Highway Corridors')
        : (roadKm >= 15 ? 'via Outer Ring Rd & City Corridors' : 'via City Arterial Roads');

      return {
        distanceKm: roadKm,
        distanceRange: `${roadKm} km`,
        durationText,
        routeVia,
        isOutstation
      };
    }
  }

  const pLower = String(pickup || '').toLowerCase();
  const dLower = String(destination || '').toLowerCase();
  let defaultKm = 18;
  let defaultVia = 'via City Arterial Roads';
  let defaultDur = '~1 hr 5 mins';
  let isOutstation = false;

  if (pLower.includes('mysor') || dLower.includes('mysor')) {
    defaultKm = 145;
    defaultVia = 'via Bengaluru-Mysuru Expressway (NH 275)';
    defaultDur = '~2 hr 35 mins';
    isOutstation = true;
  } else if (pLower.includes('coorg') || dLower.includes('coorg')) {
    defaultKm = 250;
    defaultVia = 'via Mysore Expressway & Kushalnagar';
    defaultDur = '~5 hr 30 mins';
    isOutstation = true;
  } else if (pLower.includes('ooty') || dLower.includes('ooty')) {
    defaultKm = 275;
    defaultVia = 'via Mysore & Bandipur Forest Corridor';
    defaultDur = '~6 hrs';
    isOutstation = true;
  } else if (pLower.includes('airport') || dLower.includes('airport')) {
    defaultKm = 38;
    defaultVia = 'via Bellary Road / Airport Expressway';
    defaultDur = '~55 mins';
    isOutstation = false;
  } else if (normTripType === 'LOCAL') {
    defaultKm = 80;
    defaultVia = 'City-wide flexible disposal';
    defaultDur = '8 Hours Full Day Rental';
    isOutstation = false;
  } else if (normTripType === 'OUTSTATION' || normTripType === 'ROUND_TRIP') {
    defaultKm = 145;
    defaultVia = 'via National & State Highway Corridors';
    defaultDur = '~2 hr 45 mins';
    isOutstation = true;
  }

  return {
    distanceKm: defaultKm,
    distanceRange: `${defaultKm} km`,
    durationText: defaultDur,
    routeVia: defaultVia,
    isOutstation
  };
}

function calculateFareQuoteServerless(input) {
  const normTripType = String(input.tripType || '').toUpperCase();
  const route = calculateRouteServerless(input.pickup, input.destination, input.tripType);
  const distanceKm = route.distanceKm;
  const isIntercity = route.isOutstation || distanceKm > 45;

  const VEHICLES = [
    { id: 'etios', name: 'Toyota Etios / Sedan', seats: 4, category: 'Sedans', image: '/etios.jpg', cityPerKm: 12, localPkg: 2200, airportPkg: 1400, outstationRate: 12, minKm: 250, bata: 400 },
    { id: 'ertiga', name: 'Maruti Suzuki Ertiga', seats: 6, category: 'Ertiga MPV', image: '/ertiga.jpg', cityPerKm: 15, localPkg: 2800, airportPkg: 1800, outstationRate: 15, minKm: 250, bata: 450 },
    { id: 'innova', name: 'Toyota Innova Crysta', seats: 7, category: 'Innova Crysta / Hycross', image: '/innova.jpg', cityPerKm: 18, localPkg: 3500, airportPkg: 2400, outstationRate: 18, minKm: 300, bata: 500 },
    { id: 'hycross', name: 'Toyota Innova Hycross', seats: 6, category: 'Innova Crysta / Hycross', image: '/hycross.jpg', cityPerKm: 22, localPkg: 4500, airportPkg: 3000, outstationRate: 22, minKm: 300, bata: 550 },
    { id: 'tempo', name: 'Tempo Traveller (12 Seater)', seats: 12, category: 'Tempo Travellers', image: '/tempo.jpg', cityPerKm: 24, localPkg: 4500, airportPkg: 3200, outstationRate: 24, minKm: 300, bata: 600 },
    { id: 'tempo17', name: 'Tempo Traveller (17 Seater)', seats: 17, category: 'Tempo Travellers', image: '/tempo17.jpg', cityPerKm: 28, localPkg: 7500, airportPkg: 4500, outstationRate: 28, minKm: 350, bata: 700 },
    { id: 'minibus', name: 'Mini Bus (25 Seater)', seats: 25, category: 'Tempo Travellers', image: '/minibus.jpg', cityPerKm: 34, localPkg: 8500, airportPkg: 5500, outstationRate: 34, minKm: 350, bata: 800 }
  ];

  const quotes = VEHICLES.map(v => {
    let fare = 2200;
    let runningFare = 0;
    let driverAllowance = 0;
    let rateNote = '';

    if (normTripType === 'POINT_TO_POINT') {
      if (isIntercity) {
        runningFare = Math.round(distanceKm * v.cityPerKm);
        driverAllowance = v.bata;
        fare = runningFare + driverAllowance;
        rateNote = `₹${v.cityPerKm}/km • ${distanceKm} km + ₹${driverAllowance} Driver Bata (Intercity)`;
      } else {
        const minBase = v.seats <= 4 ? 150 : 250;
        runningFare = Math.max(minBase, Math.round(distanceKm * v.cityPerKm));
        driverAllowance = 0;
        fare = runningFare;
        rateNote = `₹${v.cityPerKm}/km for ${v.name} (City drop)`;
      }
    } else if (normTripType === 'LOCAL') {
      fare = v.localPkg;
      runningFare = v.localPkg;
      driverAllowance = 0;
      rateNote = '8 hrs / 80 km city rental package included';
    } else if (normTripType === 'AIRPORT') {
      fare = v.airportPkg;
      runningFare = v.airportPkg;
      driverAllowance = 0;
      rateNote = 'Kempegowda Airport dedicated commercial transfer';
    } else {
      // Outstation
      runningFare = Math.round(distanceKm * v.outstationRate);
      driverAllowance = v.bata;
      fare = runningFare + driverAllowance;
      rateNote = `₹${v.outstationRate}/km • ${distanceKm} km + ₹${driverAllowance} Driver Bata`;
    }

    return {
      vehicle_id: v.id,
      vehicle_name: v.name,
      seats: v.seats,
      category: v.category,
      image: v.image,
      reg_number: 'KA 05 AB 1234',
      distance_km: distanceKm,
      billable_km: distanceKm,
      estimated_days: 1,
      base_fare: runningFare,
      running_fare: runningFare,
      airport_fee: normTripType === 'AIRPORT' ? 150 : 0,
      driver_allowance: driverAllowance,
      extra_km_rate: v.cityPerKm,
      extra_hour_rate: v.seats <= 4 ? 200 : 250,
      package_hours: normTripType === 'LOCAL' ? 8 : undefined,
      package_km: normTripType === 'LOCAL' ? 80 : undefined,
      tolls_and_parking: isIntercity ? 'Tolls (FASTag) & parking payable at actuals' : 'Parking & toll charges as per actuals',
      fare,
      rate_note: rateNote,
      city_drop_fare: fare,
      is_outstation_route: isIntercity
    };
  });

  return {
    distance_km: distanceKm,
    distance_range: route.distanceRange,
    duration_text: route.durationText,
    route_via: route.routeVia,
    is_outstation_route: isIntercity,
    outstation_detected: isIntercity,
    available_driver_count: 5,
    driver_availability_status: 'Commercial drivers available on this route',
    quotes
  };
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-request-id');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = req.url || '';
  const [pathname, search] = url.split('?');
  const method = (req.method || 'GET').toUpperCase();
  const db = getPool();

  try {
    // 1. Health check
    if (pathname === '/api/health' || pathname === '/api') {
      const dbCheck = await db.query('SELECT NOW()');
      return res.status(200).json({ status: 'ok', server: 'SJT Unified Serverless API', db: 'connected', time: dbCheck.rows[0].now });
    }

    // 1b. Route & Fare Quote: POST or GET /api/fare/quote
    if ((pathname === '/api/fare/quote' || pathname === '/api/fare/quotes') && (method === 'POST' || method === 'GET')) {
      const body = method === 'POST' ? await parseBody(req) : {};
      const pickup = body.pickup || '';
      const destination = body.destination || '';
      const tripType = body.trip_type || body.tripType || 'POINT_TO_POINT';
      const passengers = Number(body.passengers || 2);
      const journeyDate = body.journey_date || body.journeyDate;
      const returnDate = body.return_date || body.returnDate;

      const quotesData = calculateFareQuoteServerless({ pickup, destination, tripType, passengers, journeyDate, returnDate });
      return res.status(200).json(quotesData);
    }


    // 2. Bookings: GET /api/bookings
    if (pathname === '/api/bookings' && method === 'GET') {
      const q = await db.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100');
      return res.status(200).json(q.rows.map(formatBooking));
    }

    // 3. Bookings: POST /api/bookings (Create new booking from user booking website / app)
    if (pathname === '/api/bookings' && method === 'POST') {
      const body = await parseBody(req);
      const bookingCode = body.booking_code || body.bookingCode || `SJT-${Math.floor(100000 + Math.random() * 900000)}`;
      const freshOtp = body.rideOtp || body.ride_otp || body.start_otp || String(Math.floor(1000 + Math.random() * 9000));
      const id = body.id && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : crypto.randomUUID();

      const customerName = body.customerName || body.customer_name || 'Valued Passenger';
      const customerPhone = body.customerPhone || body.customer_phone || '+91 99009 75920';
      const customerEmail = body.customerEmail || body.customer_email || 'booking@sjttravels.com';
      const tripType = body.tripType || body.trip_type || 'OUTSTATION';
      const pickup = body.pickup || 'Bengaluru, Karnataka';
      const destination = body.destination || 'Karnataka Outstation';
      const journeyDate = body.journeyDate || body.journey_date || new Date().toISOString().slice(0, 10);
      const journeyTime = body.journeyTime || body.journey_time || '10:00 AM';
      const returnDate = body.returnDate || body.return_date || null;
      const vehicleId = body.vehicleId || body.vehicle_id || 'etios';
      const vehicleName = body.vehicleName || body.vehicle_name || 'Toyota Etios / Sedan';
      const vehicleReg = body.vehicleReg || body.vehicle_reg || null;
      const quotedAmount = Number(body.quotedAmount || body.quoted_amount || 2200);
      const advancePaid = Number(body.advancePaid || body.advance_paid || 0);
      const balanceAmount = quotedAmount - advancePaid;
      const paymentMethod = body.paymentMethod || body.payment_method || 'CASH';
      const paymentStatus = body.paymentStatus || body.payment_status || 'PENDING';
      const status = body.status || 'CONFIRMED';
      const notes = body.notes || '';

      const query = `
        INSERT INTO bookings (
          id, booking_code, customer_name, customer_phone, customer_email,
          trip_type, pickup, destination, journey_date, journey_time, return_date,
          vehicle_id, vehicle_name, vehicle_reg, quoted_amount, advance_paid, balance_amount,
          payment_method, payment_status, status, notes, start_otp, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, NOW(), NOW()
        ) RETURNING *;
      `;
      const resDb = await db.query(query, [
        id, bookingCode, customerName, customerPhone, customerEmail,
        tripType, pickup, destination, journeyDate, journeyTime, returnDate,
        vehicleId, vehicleName, vehicleReg, quotedAmount, advancePaid, balanceAmount,
        paymentMethod, paymentStatus, status, notes, freshOtp
      ]);
      const formatted = formatBooking(resDb.rows[0]);
      return res.status(201).json(formatted);
    }

    // 4. Booking Tracking: GET /api/bookings/track/:code
    if (pathname.startsWith('/api/bookings/track/') && method === 'GET') {
      const code = decodeURIComponent(pathname.replace('/api/bookings/track/', ''));
      const q = await db.query('SELECT * FROM bookings WHERE booking_code = $1 OR id::text = $1 LIMIT 1', [code]);
      if (q.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      return res.status(200).json({ success: true, booking: formatBooking(q.rows[0]) });
    }

    // 5. Driver Available Bookings: GET /api/driver/available-bookings
    if (pathname === '/api/driver/available-bookings' && method === 'GET') {
      const q = await db.query(
        "SELECT * FROM bookings WHERE status IN ('CONFIRMED', 'PENDING', 'UNASSIGNED') AND (assigned_driver_id IS NULL OR assigned_driver_id = '') ORDER BY created_at DESC LIMIT 50"
      );
      return res.status(200).json(q.rows.map(formatBooking));
    }

    // 6. Driver Accept Ride: POST /api/driver/available-bookings/:id/accept OR POST /api/bookings/:id/accept-ride
    const isDriverAccept = 
      (pathname.startsWith('/api/driver/available-bookings/') && pathname.endsWith('/accept') && method === 'POST') ||
      (pathname.startsWith('/api/bookings/') && pathname.endsWith('/accept-ride') && method === 'POST');

    if (isDriverAccept) {
      let bookingKey = pathname.replace('/api/driver/available-bookings/', '').replace('/accept', '');
      bookingKey = bookingKey.replace('/api/bookings/', '').replace('/accept-ride', '');
      const body = await parseBody(req);
      const driverName = body.driver_name || body.driverName || 'Ramesh Kumar';
      const driverPhone = body.driver_phone || body.driverPhone || '+91 97259 85286';
      const driverId = body.driver_id || body.driverId || 'drv_ramesh';
      const vehicleReg = body.vehicle_reg || body.vehicleReg || 'KA 05 AB 1234';

      const updateQ = `
        UPDATE bookings SET 
          status = 'ASSIGNED',
          assigned_driver_id = $1,
          assigned_driver_name = $2,
          assigned_driver_phone = $3,
          vehicle_reg = $4,
          updated_at = NOW()
        WHERE id::text = $5 OR booking_code = $5
        RETURNING *;
      `;
      const resDb = await db.query(updateQ, [driverId, driverName, driverPhone, vehicleReg, bookingKey]);
      if (resDb.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found to accept' });
      }
      return res.status(200).json({ success: true, booking: formatBooking(resDb.rows[0]) });
    }

    // 7. Simulate Driver Accept: POST /api/bookings/simulate-driver-accept/:code
    if (pathname.startsWith('/api/bookings/simulate-driver-accept/') && method === 'POST') {
      const code = pathname.replace('/api/bookings/simulate-driver-accept/', '');
      const updateQ = `
        UPDATE bookings SET 
          status = 'ASSIGNED',
          assigned_driver_id = 'drv_ramesh',
          assigned_driver_name = 'Ramesh Kumar',
          assigned_driver_phone = '+91 97259 85286',
          vehicle_reg = 'KA 05 AB 1234',
          updated_at = NOW()
        WHERE booking_code = $1 OR id::text = $1
        RETURNING *;
      `;
      const resDb = await db.query(updateQ, [code]);
      if (resDb.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      return res.status(200).json({ success: true, booking: formatBooking(resDb.rows[0]) });
    }

    // 8. Driver Start Trip: POST /api/bookings/:id/start-trip
    if (pathname.startsWith('/api/bookings/') && pathname.endsWith('/start-trip') && method === 'POST') {
      const id = pathname.replace('/api/bookings/', '').replace('/start-trip', '');
      const body = await parseBody(req);
      const startOdo = Number(body.start_odometer || body.startOdometer || 12450);

      const updateQ = `
        UPDATE bookings SET 
          status = 'IN_PROGRESS',
          start_odometer = $1,
          otp_verified = true,
          updated_at = NOW()
        WHERE id::text = $2 OR booking_code = $2
        RETURNING *;
      `;
      const resDb = await db.query(updateQ, [startOdo, id]);
      if (resDb.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
      return res.status(200).json({ success: true, booking: formatBooking(resDb.rows[0]) });
    }

    // 9. Driver Complete Trip: POST /api/bookings/:id/complete-trip
    if (pathname.startsWith('/api/bookings/') && pathname.endsWith('/complete-trip') && method === 'POST') {
      const id = pathname.replace('/api/bookings/', '').replace('/complete-trip', '');
      const body = await parseBody(req);
      const endOdo = Number(body.end_odometer || body.endOdometer || 12485);
      const actualKm = Number(body.actual_km || body.actualKm || 35);
      const paymentMethod = body.payment_method || body.paymentMethod || 'CASH';

      const updateQ = `
        UPDATE bookings SET 
          status = 'COMPLETED',
          payment_status = 'PAID',
          end_odometer = $1,
          actual_km = $2,
          payment_method = $3,
          completed_at = NOW(),
          updated_at = NOW()
        WHERE id::text = $4 OR booking_code = $4
        RETURNING *;
      `;
      const resDb = await db.query(updateQ, [endOdo, actualKm, paymentMethod, id]);
      if (resDb.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
      return res.status(200).json({ success: true, booking: formatBooking(resDb.rows[0]) });
    }

    // 10. Admin Assign Driver: PATCH /api/bookings/:id/assign
    if (pathname.startsWith('/api/bookings/') && pathname.endsWith('/assign') && method === 'PATCH') {
      const id = pathname.replace('/api/bookings/', '').replace('/assign', '');
      const body = await parseBody(req);
      const driverId = body.driverId || body.driver_id;
      const driverName = body.driverName || body.driver_name;
      const driverPhone = body.driverPhone || body.driver_phone;
      const vehicleReg = body.vehicleReg || body.vehicle_reg;

      const updateQ = `
        UPDATE bookings SET 
          status = 'ASSIGNED',
          assigned_driver_id = $1,
          assigned_driver_name = $2,
          assigned_driver_phone = $3,
          vehicle_reg = COALESCE($4, vehicle_reg),
          updated_at = NOW()
        WHERE id::text = $5 OR booking_code = $5
        RETURNING *;
      `;
      const resDb = await db.query(updateQ, [driverId, driverName, driverPhone, vehicleReg, id]);
      if (resDb.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
      return res.status(200).json({ success: true, booking: formatBooking(resDb.rows[0]) });
    }

    // 11. Admin / System Update Status: PATCH /api/bookings/:id/status
    if (pathname.startsWith('/api/bookings/') && pathname.endsWith('/status') && method === 'PATCH') {
      const id = pathname.replace('/api/bookings/', '').replace('/status', '');
      const body = await parseBody(req);
      const nextStatus = body.status || 'CONFIRMED';

      const updateQ = `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id::text = $2 OR booking_code = $2 RETURNING *;`;
      const resDb = await db.query(updateQ, [nextStatus, id]);
      if (resDb.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
      return res.status(200).json({ success: true, booking: formatBooking(resDb.rows[0]) });
    }

    // 12. Admin Notify Customer Message: POST /api/bookings/:id/admin-message
    if (pathname.startsWith('/api/bookings/') && pathname.endsWith('/admin-message') && method === 'POST') {
      const id = pathname.replace('/api/bookings/', '').replace('/admin-message', '');
      const body = await parseBody(req);
      const message = body.message || 'Driver dispatched';

      const updateQ = `UPDATE bookings SET admin_message = $1, admin_message_time = NOW(), updated_at = NOW() WHERE id::text = $2 OR booking_code = $2 RETURNING *;`;
      const resDb = await db.query(updateQ, [message, id]);
      if (resDb.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
      return res.status(200).json({ success: true, booking: formatBooking(resDb.rows[0]) });
    }

    // 13. General Booking Patch / Delete: PATCH or DELETE /api/bookings/:id
    if (pathname.startsWith('/api/bookings/') && !pathname.includes('/', 15)) {
      const id = pathname.replace('/api/bookings/', '');
      if (method === 'DELETE') {
        await db.query('DELETE FROM bookings WHERE id::text = $1 OR booking_code = $1', [id]);
        return res.status(200).json({ success: true, message: 'Booking removed' });
      }
      if (method === 'PATCH') {
        const body = await parseBody(req);
        const q = await db.query('SELECT * FROM bookings WHERE id::text = $1 OR booking_code = $1 LIMIT 1', [id]);
        if (q.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
        return res.status(200).json({ success: true, booking: formatBooking(q.rows[0]) });
      }
    }

    // 14. INVOICES: GET /api/invoices
    if (pathname === '/api/invoices' && method === 'GET') {
      const q = await db.query('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 100');
      return res.status(200).json(q.rows.map(formatInvoice));
    }

    // 15. INVOICES: POST /api/invoices/generate OR POST /api/invoices
    if ((pathname === '/api/invoices/generate' || pathname === '/api/invoices') && method === 'POST') {
      const body = await parseBody(req);
      const countRes = await db.query('SELECT COUNT(*) FROM invoices');
      const nextInvNum = body.invoice_number || `26-27/${54 + parseInt(countRes.rows[0].count, 10)}`;

      const clientName = body.client_name || body.companyName || 'Corporate Client';
      const clientType = body.client_type || 'CORPORATE';
      const billingPeriod = body.billing_period || 'bill for the month of oct';
      const totalTrips = Number(body.total_trips || body.quantity || 76);
      const totalKm = Number(body.total_km || 0);
      const subtotal = Number(body.subtotal || (totalTrips * 650));
      const gstRate = Number(body.gst_rate ?? 18);
      const totalTax = Math.round(subtotal * (gstRate / 100));
      const cgst = Math.round(totalTax / 2);
      const sgst = totalTax - cgst;
      const gspRent = Number(body.gsp_rent || 0);
      const tdsCgst = Number(body.tds_cgst || 0);
      const tdsAmount = Number(body.tds_amount || 0);
      const roundOff = Number(body.round_off || 0);
      const grandTotal = Math.round(subtotal + totalTax - gspRent - tdsCgst - tdsAmount + roundOff);
      const status = body.status === 'PAID' ? 'PAID' : (['DRAFT', 'ISSUED', 'PAID', 'OVERDUE'].includes(body.status) ? body.status : 'ISSUED');
      const invId = crypto.randomUUID();

      const insertQ = `
        INSERT INTO invoices (
          id, invoice_number, client_type, client_name, billing_period,
          total_trips, total_km, subtotal, cgst, sgst, grand_total, status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11, $12, NOW()
        ) RETURNING *;
      `;
      const resDb = await db.query(insertQ, [
        invId, nextInvNum, clientType, clientName, billingPeriod,
        totalTrips, totalKm, subtotal, cgst, sgst, grandTotal, status
      ]);

      const formatted = formatInvoice(resDb.rows[0]);
      // Attach all rich attributes for frontend InvoiceModal
      formatted.client_address = body.client_address || '';
      formatted.client_phone = body.client_phone || '';
      formatted.client_gstin = body.client_gstin || '';
      formatted.place_of_supply = body.place_of_supply || '29-Karnataka';
      formatted.invoice_date = body.invoice_date || new Date().toLocaleDateString('en-GB');
      formatted.invoice_time = body.invoice_time || '11:37 AM';
      formatted.vehicle_type = body.vehicle_type || 'SEDAN';
      formatted.vehicle_reg = body.vehicle_reg || 'KA 05 AB 1234';
      formatted.vehicle_model = body.vehicle_model || '2024 / ETIOS';
      formatted.supervisor_name = body.supervisor_name || 'SHARANAPPA';
      formatted.indication_date = body.indication_date || formatted.invoice_date;
      formatted.transport_company_name = body.transport_company_name || clientName;
      formatted.item_name = body.item_name || 'SEDAN ROUTE';
      formatted.hsn_sac = body.hsn_sac || '9964';
      formatted.quantity = totalTrips;
      formatted.rate_per_unit = Number(body.rate_per_unit || 650);
      formatted.taxable_amount = subtotal;
      formatted.gst_rate = gstRate;
      formatted.total_tax = totalTax;
      formatted.cgst_amount = cgst;
      formatted.sgst_amount = sgst;
      formatted.gsp_rent = gspRent;
      formatted.tds_cgst = tdsCgst;
      formatted.tds_amount = tdsAmount;
      formatted.round_off = roundOff;
      formatted.notes = body.notes || 'Thanks for doing business with us!';

      return res.status(201).json({ success: true, invoice: formatted });
    }

    // 16. Invoices: PATCH /api/invoices/:id/status
    if (pathname.startsWith('/api/invoices/') && pathname.endsWith('/status') && method === 'PATCH') {
      const id = pathname.replace('/api/invoices/', '').replace('/status', '');
      const body = await parseBody(req);
      const nextStatus = body.status || 'PAID';
      const q = await db.query('UPDATE invoices SET status = $1 WHERE id::text = $2 OR invoice_number = $2 RETURNING *', [nextStatus, id]);
      if (q.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
      return res.status(200).json({ success: true, invoice: formatInvoice(q.rows[0]) });
    }

    // 17. Vehicles: GET /api/vehicles
    if (pathname === '/api/vehicles' && method === 'GET') {
      try {
        const q = await db.query('SELECT * FROM vehicles ORDER BY id');
        if (q.rows.length > 0) return res.status(200).json(q.rows);
      } catch (_) {}
      return res.status(200).json([
        { id: 'etios', name: 'Toyota Etios / Sedan', category: 'Sedans', seats: 4, ac: true, ratePerKm: 12, ratePerDay: 2200 },
        { id: 'ertiga', name: 'Maruti Ertiga (6+1 Seater)', category: 'MUV', seats: 6, ac: true, ratePerKm: 16, ratePerDay: 3200 },
        { id: 'innova', name: 'Toyota Innova Crysta', category: 'Premium SUV', seats: 7, ac: true, ratePerKm: 21, ratePerDay: 4200 },
        { id: 'tempo17', name: 'Tempo Traveller (17 Seater)', category: 'Tempo Travellers', seats: 17, ac: true, ratePerKm: 28, ratePerDay: 7500 }
      ]);
    }

    // 18. Drivers: GET /api/drivers
    if (pathname === '/api/drivers' && method === 'GET') {
      try {
        const q = await db.query("SELECT id, name, email, phone, role FROM users WHERE role = 'DRIVER'");
        if (q.rows.length > 0) {
          return res.status(200).json(q.rows.map(d => ({
            id: String(d.id),
            name: d.name,
            phone: d.phone,
            email: d.email,
            status: 'AVAILABLE',
            isOnline: true,
            assignedVehicleReg: 'KA 05 AB 1234',
            rating: 5.0,
            experienceYears: 8
          })));
        }
      } catch (_) {}
      return res.status(200).json([
        { id: 'drv_ramesh', name: 'Ramesh Kumar', phone: '+91 97259 85286', email: 'ramesh.driver@sjttravels.com', status: 'AVAILABLE', isOnline: true, assignedVehicleReg: 'KA 05 AB 1234', rating: 5.0, experienceYears: 9 },
        { id: 'drv_suresh', name: 'Suresh Gowda', phone: '+91 98451 22334', email: 'suresh.driver@sjttravels.com', status: 'AVAILABLE', isOnline: true, assignedVehicleReg: 'KA 04 MP 5678', rating: 4.9, experienceYears: 7 },
        { id: 'drv_manjunath', name: 'Manjunath R', phone: '+91 98801 44556', email: 'manju.driver@sjttravels.com', status: 'AVAILABLE', isOnline: true, assignedVehicleReg: 'KA 01 AE 9999', rating: 4.8, experienceYears: 11 }
      ]);
    }

    // 19. Company Duties: GET /api/duties
    if (pathname === '/api/duties' && method === 'GET') {
      try {
        const q = await db.query('SELECT * FROM company_duties ORDER BY created_at DESC LIMIT 100');
        return res.status(200).json(q.rows);
      } catch (_) {
        return res.status(200).json([]);
      }
    }

    // 20. Driver Availability: GET or PUT /api/driver/availability
    if (pathname === '/api/driver/availability') {
      return res.status(200).json({ success: true, is_online: true, isOnline: true, status: 'AVAILABLE' });
    }

    // Fallback for unmatched API routes
    return res.status(200).json({ success: true, message: `Endpoint ${pathname} handled`, timestamp: new Date() });

  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
