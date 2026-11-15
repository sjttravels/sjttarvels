import { calculateRoute, calculateRouteSync, RouteInfo } from './distanceService';

export type FareQuote = {
  vehicle_id: string;
  vehicle_name: string;
  seats: number;
  category?: string;
  image?: string;
  reg_number?: string;
  distance_km: number;
  billable_km: number;
  estimated_days: number;
  base_fare: number;
  running_fare: number;
  airport_fee: number;
  driver_allowance: number;
  extra_km_rate?: number;
  extra_hour_rate?: number;
  package_hours?: number;
  package_km?: number;
  tolls_and_parking: string;
  fare: number;
  rate_note: string;
  city_drop_fare?: number;
  is_outstation_route?: boolean;
};

const apiBase = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : '');

// Master fleet rate cards matching Ola / Uber Outstation & Tejas Travels Karnataka Commercial Standards
export const VEHICLES_DATA = [
  { id: 'etios', name: 'Toyota Etios / Sedan', seats: 4, category: 'Sedans', image: '/etios.jpg', cityPerKm: 12, localPkg: 2200, airportPkg: 1400, outstationRate: 12, minKm: 250, bata: 400 },
  { id: 'ertiga', name: 'Maruti Suzuki Ertiga', seats: 6, category: 'Ertiga MPV', image: '/ertiga.jpg', cityPerKm: 15, localPkg: 2800, airportPkg: 1800, outstationRate: 15, minKm: 250, bata: 450 },
  { id: 'innova', name: 'Toyota Innova Crysta', seats: 7, category: 'Innova Crysta / Hycross', image: '/innova.jpg', cityPerKm: 18, localPkg: 3500, airportPkg: 2400, outstationRate: 18, minKm: 300, bata: 500 },
  { id: 'hycross', name: 'Toyota Innova Hycross', seats: 6, category: 'Innova Crysta / Hycross', image: '/hycross.jpg', cityPerKm: 22, localPkg: 4500, airportPkg: 3000, outstationRate: 22, minKm: 300, bata: 550 },
  { id: 'tempo', name: 'Tempo Traveller (12 Seater)', seats: 12, category: 'Tempo Travellers', image: '/tempo.jpg', cityPerKm: 24, localPkg: 4500, airportPkg: 3200, outstationRate: 24, minKm: 300, bata: 600 },
  { id: 'tempo17', name: 'Tempo Traveller (17 Seater)', seats: 17, category: 'Tempo Travellers', image: '/tempo17.jpg', cityPerKm: 28, localPkg: 7500, airportPkg: 4500, outstationRate: 28, minKm: 350, bata: 700 },
  { id: 'minibus', name: 'Mini Bus (25 Seater)', seats: 25, category: 'Tempo Travellers', image: '/minibus.jpg', cityPerKm: 34, localPkg: 8500, airportPkg: 5500, outstationRate: 34, minKm: 350, bata: 800 }
];

function calculateDays(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 1;
  try {
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  } catch {
    return 1;
  }
}

// Client-side pricing calculator for 100% reliable local & Vercel execution
export function calculateClientSideQuotes(input: {
  pickup: string;
  destination: string;
  tripType: string;
  passengers: number;
  journeyDate?: string;
  returnDate?: string;
  routeInfo?: RouteInfo;
}) {
  const normTripType = input.tripType.toUpperCase();
  const route = input.routeInfo || calculateRouteSync(input.pickup, input.destination, input.tripType);
  const distanceKm = route.distanceKm;
  const isIntercity = route.isOutstation || distanceKm > 45;
  const days = calculateDays(input.journeyDate, input.returnDate);

  const quotes: FareQuote[] = VEHICLES_DATA.map(v => {
    let fare = 2200;
    let runningFare = 0;
    let driverAllowance = 0;
    let rateNote = '';
    let billableKm = distanceKm;

    if (normTripType === 'POINT_TO_POINT') {
      if (isIntercity) {
        // Ola/Uber Intercity One-Way Drop: Actual Road KM * per-km + Outstation Driver Allowance
        runningFare = Math.round(distanceKm * v.cityPerKm);
        driverAllowance = v.bata;
        fare = runningFare + driverAllowance;
        billableKm = distanceKm;
        rateNote = `₹${v.cityPerKm}/km • ${distanceKm} km + ₹${driverAllowance} Driver Bata (Intercity)`;
      } else {
        // Intra-city Point-to-Point Drop: Distance KM * City Per-KM (Min ₹150 for Sedan, ₹250 for SUV)
        const minBase = v.seats <= 4 ? 150 : v.seats <= 6 ? 250 : 350;
        runningFare = Math.max(minBase, Math.round(distanceKm * v.cityPerKm));
        driverAllowance = 0;
        fare = runningFare;
        billableKm = distanceKm;
        rateNote = `₹${v.cityPerKm}/km for ${v.name} (City drop)`;
      }
    } else if (normTripType === 'LOCAL') {
      fare = v.localPkg;
      runningFare = v.localPkg;
      driverAllowance = 0;
      billableKm = 80;
      rateNote = '8 hrs / 80 km city rental package included';
    } else if (normTripType === 'AIRPORT') {
      fare = v.airportPkg;
      runningFare = v.airportPkg;
      driverAllowance = 0;
      billableKm = distanceKm;
      rateNote = 'Kempegowda Airport dedicated commercial transfer';
    } else if (normTripType === 'ROUND_TRIP') {
      // Outstation Round Trip: Min 250/300 km per day * outstation rate + daily driver bata
      const roundTripActualKm = distanceKm * 2;
      const minRequiredKm = days * v.minKm;
      billableKm = Math.max(roundTripActualKm, minRequiredKm);
      runningFare = Math.round(billableKm * v.outstationRate);
      driverAllowance = days * v.bata;
      fare = runningFare + driverAllowance;
      rateNote = `₹${v.outstationRate}/km • ${billableKm} billable km (${days} day${days > 1 ? 's' : ''}) + ₹${driverAllowance} Driver Bata`;
    } else {
      // Outstation One-Way
      runningFare = Math.round(distanceKm * v.outstationRate);
      driverAllowance = v.bata;
      fare = runningFare + driverAllowance;
      billableKm = distanceKm;
      rateNote = `₹${v.outstationRate}/km • ${distanceKm} km + ₹${driverAllowance} Driver Allowance (Bata)`;
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
      airport_fee: normTripType === 'AIRPORT' ? 150 : 0,
      driver_allowance: driverAllowance,
      extra_km_rate: v.cityPerKm,
      extra_hour_rate: v.seats <= 4 ? 200 : v.seats <= 7 ? 250 : 400,
      package_hours: normTripType === 'LOCAL' ? 8 : undefined,
      package_km: normTripType === 'LOCAL' ? 80 : undefined,
      tolls_and_parking: isIntercity ? 'Tolls (FASTag), state taxes & parking as per actuals' : 'Parking & toll charges as per actuals',
      fare,
      rate_note: rateNote,
      city_drop_fare: fare,
      is_outstation_route: isIntercity
    };
  });

  return {
    distance_km: distanceKm,
    distance_range: route.distanceRange,
    duration_seconds: route.durationSeconds,
    duration_text: route.durationText,
    route_via: route.routeVia,
    is_outstation_route: isIntercity,
    outstation_detected: isIntercity,
    available_driver_count: 5,
    driver_availability_status: 'Commercial drivers available on this route',
    quotes
  };
}

export async function getFareQuotes(input: {
  pickup: string;
  destination: string;
  tripType: string;
  passengers: number;
  journeyDate?: string;
  returnDate?: string;
}): Promise<{ 
  distance_km: number; 
  distance_range?: string;
  duration_seconds?: number;
  duration_text?: string;
  route_via?: string;
  is_outstation_route?: boolean;
  outstation_detected?: boolean;
  available_driver_count: number; 
  driver_availability_status?: string; 
  quotes: FareQuote[];
}> {
  // First calculate accurate road route
  const routeInfo = await calculateRoute(input.pickup, input.destination, input.tripType);

  try {
    const response = await fetch(`${apiBase}/api/fare/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...input, 
        trip_type: input.tripType,
        journey_date: input.journeyDate,
        return_date: input.returnDate,
        distance_km: routeInfo.distanceKm,
        duration_text: routeInfo.durationText,
        route_via: routeInfo.routeVia
      })
    });
    if (response.ok) {
      const result = await response.json();
      if (result && Array.isArray(result.quotes) && result.quotes.length > 0) {
        return {
          ...result,
          distance_km: result.distance_km || routeInfo.distanceKm,
          distance_range: result.distance_range || routeInfo.distanceRange,
          duration_text: result.duration_text || routeInfo.durationText,
          route_via: result.route_via || routeInfo.routeVia,
          is_outstation_route: (result.distance_km || routeInfo.distanceKm) > 45 || result.is_outstation_route
        };
      }
    }
  } catch {
    // Fall back to synchronized client calculation
  }

  return calculateClientSideQuotes({ ...input, routeInfo });
}
