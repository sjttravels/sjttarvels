export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const vehicles = [
    {
      id: "etios",
      name: "Toyota Etios / Sedan",
      category: "Sedans",
      seats: 4,
      ac: true,
      rate_per_day: 2200,
      rate_per_km: 12,
      min_km_per_day: 250,
      driver_allowance_per_day: 400,
      image: "/etios.jpg",
      reg_number: "KA01AE1234",
      features: [
        "Air Conditioning",
        "4 Passenger Comfort",
        "Spacious Boot (400L)"
      ],
      status: "AVAILABLE"
    },
    {
      id: "ertiga",
      name: "Maruti Suzuki Ertiga",
      category: "Ertiga MPV",
      seats: 6,
      ac: true,
      rate_per_day: 2800,
      rate_per_km: 14,
      min_km_per_day: 250,
      driver_allowance_per_day: 450,
      image: "/ertiga.jpg",
      reg_number: "KA04ME5678",
      features: [
        "Dual AC Vents",
        "6 Passenger Seating",
        "Foldable 3rd Row"
      ],
      status: "AVAILABLE"
    },
    {
      id: "innova",
      name: "Toyota Innova Crysta",
      category: "Innova Crysta / Hycross",
      seats: 7,
      ac: true,
      rate_per_day: 3500,
      rate_per_km: 17,
      min_km_per_day: 300,
      driver_allowance_per_day: 500,
      image: "/innova.jpg",
      reg_number: "KA05NB9012",
      features: [
        "Captain Seat Comfort",
        "Powerful AC Climatic Control",
        "Luxury Executive Ride"
      ],
      status: "AVAILABLE"
    },
    {
      id: "hycross",
      name: "Toyota Innova Hycross",
      category: "Innova Crysta / Hycross",
      seats: 6,
      ac: true,
      rate_per_day: 4500,
      rate_per_km: 22,
      min_km_per_day: 300,
      driver_allowance_per_day: 600,
      image: "/hycross.jpg",
      reg_number: "KA03MH3456",
      features: [
        "Hybrid Silent Luxury",
        "Ottoman Reclining Seats",
        "Panoramic Sunroof"
      ],
      status: "AVAILABLE"
    },
    {
      id: "tempo",
      name: "Tempo Traveller (12 Seater)",
      category: "Tempo Travellers",
      seats: 12,
      ac: true,
      rate_per_day: 4500,
      rate_per_km: 24,
      min_km_per_day: 300,
      driver_allowance_per_day: 600,
      image: "/tempo.jpg",
      reg_number: "KA02TT7890",
      features: [
        "Individual Pushback Seats",
        "2x1 Luxury Layout",
        "High Roof Standing Height"
      ],
      status: "AVAILABLE"
    },
    {
      id: "tempo17",
      name: "Tempo Traveller (17 Seater)",
      category: "Tempo Travellers",
      seats: 17,
      ac: true,
      rate_per_day: 7500,
      rate_per_km: 28,
      min_km_per_day: 350,
      driver_allowance_per_day: 700,
      image: "/tempo17.jpg",
      reg_number: "KA01TL2345",
      features: [
        "17 Luxury Reclining Seats",
        "Twin High-Power AC Blowers",
        "Large Luggage Boot"
      ],
      status: "AVAILABLE"
    },
    {
      id: "minibus",
      name: "Mini Bus (25 Seater)",
      category: "Tempo Travellers",
      seats: 25,
      ac: true,
      rate_per_day: 8500,
      rate_per_km: 34,
      min_km_per_day: 350,
      driver_allowance_per_day: 800,
      image: "/minibus.jpg",
      reg_number: "KA51MB6789",
      features: [
        "25 Deluxe Pushback Seats",
        "Air Suspension Ride",
        "PA Mic & Audio System"
      ],
      status: "AVAILABLE"
    }
  ];

  return res.status(200).json(vehicles);
}

