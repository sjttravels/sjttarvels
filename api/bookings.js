// Simple in-memory/serverless store with graceful persistence
let memoryBookings = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    const code = payload.booking_code || payload.bookingCode || `SJT-${Math.floor(100000 + Math.random() * 900000)}`;
    const otp = payload.ride_otp || payload.rideOtp || String(Math.floor(1000 + Math.random() * 9000));

    const booking = {
      id: 'bk_' + Date.now(),
      _id: 'bk_' + Date.now(),
      booking_code: code,
      bookingCode: code,
      customer_name: payload.customer_name || payload.customerName || 'Valued Passenger',
      customerName: payload.customer_name || payload.customerName || 'Valued Passenger',
      customer_phone: payload.customer_phone || payload.customerPhone || '+91 99009 75920',
      customerPhone: payload.customer_phone || payload.customerPhone || '+91 99009 75920',
      customer_email: payload.customer_email || payload.customerEmail || 'booking@sjttravels.com',
      trip_type: payload.trip_type || payload.tripType || 'POINT_TO_POINT',
      tripType: payload.trip_type || payload.tripType || 'POINT_TO_POINT',
      pickup: payload.pickup || 'Bengaluru, Karnataka',
      destination: payload.destination || 'Indiranagar, Bengaluru',
      journey_date: payload.journey_date || payload.journeyDate || new Date().toISOString().slice(0, 10),
      journeyDate: payload.journey_date || payload.journeyDate || new Date().toISOString().slice(0, 10),
      journey_time: payload.journey_time || payload.journeyTime || '10:00 AM',
      vehicle_id: payload.vehicle_id || payload.vehicleId || 'etios',
      vehicle_name: payload.vehicle_name || payload.vehicleName || 'Toyota Etios / Sedan',
      vehicleName: payload.vehicle_name || payload.vehicleName || 'Toyota Etios / Sedan',
      passengers: Number(payload.passengers || 4),
      quoted_amount: Number(payload.quoted_amount || payload.quotedAmount || 2200),
      quotedAmount: Number(payload.quoted_amount || payload.quotedAmount || 2200),
      advance_paid: 0,
      payment_status: 'PENDING',
      status: 'CONFIRMED',
      ride_otp: otp,
      rideOtp: otp,
      notes: payload.notes || '',
      created_at: new Date().toISOString()
    };

    memoryBookings.unshift(booking);
    if (memoryBookings.length > 50) memoryBookings.pop();

    return res.status(200).json(booking);
  }

  // GET
  return res.status(200).json(memoryBookings);
}
