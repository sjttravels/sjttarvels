export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.body || {};
  const pickup = String(body.pickup || 'Uttarahalli, Bengaluru').toLowerCase();
  const destination = String(body.destination || 'Indiranagar, Bengaluru').toLowerCase();
  const tripType = String(body.tripType || body.trip_type || 'POINT_TO_POINT').toUpperCase();

  let distanceKm = 18;
  if (tripType === 'LOCAL') {
    distanceKm = 80;
  } else if (tripType === 'AIRPORT') {
    distanceKm = 38;
  } else if (tripType === 'POINT_TO_POINT') {
    distanceKm = 18;
  } else {
    if (pickup.includes('mysor') || destination.includes('mysor')) distanceKm = 145;
    else if (pickup.includes('coorg') || destination.includes('coorg')) distanceKm = 250;
    else if (pickup.includes('ooty') || destination.includes('ooty')) distanceKm = 275;
    else if (pickup.includes('chikmagalur') || destination.includes('chikmagalur')) distanceKm = 245;
    else if (pickup.includes('tirupati') || destination.includes('tirupati')) distanceKm = 250;
    else if (pickup.includes('hampi') || destination.includes('hampi')) distanceKm = 340;
    else distanceKm = 145;
  }

  const vehiclesData = [
    { id: 'etios', name: 'Toyota Etios / Sedan', seats: 4, category: 'Sedans', image: '/etios.jpg', cityPerKm: 12, localPkg: 2200, airportPkg: 1400, outstationRate: 12, minKm: 250, bata: 400 },
    { id: 'ertiga', name: 'Maruti Suzuki Ertiga', seats: 6, category: 'Ertiga MPV', image: '/ertiga.jpg', cityPerKm: 15, localPkg: 2800, airportPkg: 1800, outstationRate: 14, minKm: 250, bata: 450 },
    { id: 'innova', name: 'Toyota Innova Crysta', seats: 7, category: 'Innova Crysta / Hycross', image: '/innova.jpg', cityPerKm: 18, localPkg: 3500, airportPkg: 2400, outstationRate: 17, minKm: 300, bata: 500 },
    { id: 'hycross', name: 'Toyota Innova Hycross', seats: 6, category: 'Innova Crysta / Hycross', image: '/hycross.jpg', cityPerKm: 22, localPkg: 4500, airportPkg: 3000, outstationRate: 22, minKm: 300, bata: 600 },
    { id: 'tempo', name: 'Tempo Traveller (12 Seater)', seats: 12, category: 'Tempo Travellers', image: '/tempo.jpg', cityPerKm: 24, localPkg: 4500, airportPkg: 3200, outstationRate: 24, minKm: 300, bata: 600 },
    { id: 'tempo17', name: 'Tempo Traveller (17 Seater)', seats: 17, category: 'Tempo Travellers', image: '/tempo17.jpg', cityPerKm: 28, localPkg: 7500, airportPkg: 4500, outstationRate: 28, minKm: 350, bata: 700 },
    { id: 'minibus', name: 'Mini Bus (25 Seater)', seats: 25, category: 'Tempo Travellers', image: '/minibus.jpg', cityPerKm: 34, localPkg: 8500, airportPkg: 5500, outstationRate: 34, minKm: 350, bata: 800 }
  ];

  const quotes = vehiclesData.map(v => {
    let fare = 2200;
    let rateNote = '';

    if (tripType === 'POINT_TO_POINT') {
      fare = Math.max(150, Math.round(distanceKm * v.cityPerKm));
      rateNote = `₹${v.cityPerKm}/km for ${v.name} (Market rate city drop)`;
    } else if (tripType === 'LOCAL') {
      fare = v.localPkg;
      rateNote = '8 hrs / 80 km city rental package included';
    } else if (tripType === 'AIRPORT') {
      fare = v.airportPkg;
      rateNote = 'Kempegowda Airport dedicated commercial transfer';
    } else {
      const billable = Math.max(distanceKm, v.minKm);
      fare = Math.round(billable * v.outstationRate + v.bata);
      rateNote = `₹${v.outstationRate}/km • Min ${v.minKm}km/day + ₹${v.bata} Driver Bata`;
    }

    return {
      vehicle_id: v.id,
      vehicle_name: v.name,
      seats: v.seats,
      category: v.category,
      image: v.image,
      reg_number: 'KA01AE1234',
      distance_km: distanceKm,
      billable_km: tripType === 'POINT_TO_POINT' ? distanceKm : Math.max(distanceKm, v.minKm),
      estimated_days: 1,
      base_fare: fare,
      airport_fee: tripType === 'AIRPORT' ? 150 : 0,
      driver_allowance: v.bata,
      extra_km_rate: v.cityPerKm,
      extra_hour_rate: 250,
      package_hours: tripType === 'LOCAL' ? 8 : undefined,
      package_km: tripType === 'LOCAL' ? 80 : undefined,
      tolls_and_parking: 'Tolls, parking and state taxes as per actuals',
      fare,
      rate_note: rateNote,
      city_drop_fare: fare
    };
  });

  return res.status(200).json({
    distance_km: distanceKm,
    distance_range: tripType === 'POINT_TO_POINT' ? '17 km to 22 km' : `${distanceKm} km`,
    duration_seconds: 3900,
    duration_text: tripType === 'LOCAL' ? '8 Hours' : '~1 hr 5 mins',
    route_via: tripType === 'POINT_TO_POINT' ? 'via City Arterial Roads' : 'via National Highway',
    available_driver_count: 5,
    driver_availability_status: 'Commercial drivers available on this route',
    quotes
  });
}
