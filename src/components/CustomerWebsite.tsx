import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle, TripType, Booking } from '../types';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Plane, 
  Building, 
  HeartHandshake, 
  CreditCard,
  MessageCircle,
  Database,
  Award,
  Navigation,
  FileCheck,
  X,
  Menu,
  Lock,
  Check,
  RotateCcw,
  Star,
  Phone,
  Info,
  Luggage,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  GraduationCap,
  Bell,
  Smartphone,
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LocationSuggestionField } from './LocationSuggestionField';
import { FareQuote, getFareQuotes } from '../services/fareQuotes';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : 'http://localhost:5000');

const toLocalDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDaysToDateInput = (value: string, days: number) => {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateInput(date);
};

export const CustomerWebsite: React.FC = () => {
  const { 
    vehicles,
    createBooking, 
    refreshData,
    openClientMailModal,
    setActiveView,
    currentUser,
    setLoginModalOpen
  } = useApp();

  // Search Parameters
  const [tripType, setTripType] = useState<TripType>('OUTSTATION');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [journeyDate, setJourneyDate] = useState(() => toLocalDateInput(new Date()));
  const [returnDate, setReturnDate] = useState(() => addDaysToDateInput(toLocalDateInput(new Date()), 1));
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const [passengers, setPassengers] = useState<number>(2);
  const [selectedCategory, setSelectedCategory] = useState<string>('RELATED');

  // Customer Contact Fields (Always starts blank for user to enter their real details)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Location & Google Maps
  const [liveLocationLoading, setLiveLocationLoading] = useState(false);
  const [pickupGoogleMapsUrl, setPickupGoogleMapsUrl] = useState('');

  // Live Tracking Modal State
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingInputCode, setTrackingInputCode] = useState('');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Selected Vehicle & Quotes
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [fareQuotes, setFareQuotes] = useState<Record<string, FareQuote>>({});
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [routeDistanceRange, setRouteDistanceRange] = useState<string | null>(null);
  const [routeDurationText, setRouteDurationText] = useState<string | null>(null);
  const [routeVia, setRouteVia] = useState<string | null>(null);
  const [quotingFare, setQuotingFare] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  // Booking Flow & Real-time Driver State
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [driverAcceptSimulating, setDriverAcceptSimulating] = useState(false);
  const pollingRef = useRef<any>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // User App Launching Soon Banner State
  const [userAppPhone, setUserAppPhone] = useState('');
  const [userAppNotified, setUserAppNotified] = useState(false);

  // Quick Karnataka Destinations
  const popularDestinations = [
    'Mysore', 'Coorg', 'Ooty', 'Chikmagalur', 'Tirupati', 'Hampi', 'Kempegowda Airport'
  ];

  // Geolocation Handler: Captures live coordinates and constructs direct Google Maps link for driver
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLiveLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        setPickupGoogleMapsUrl(mapsLink);

        let locationName = `Live Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
            const city = data.address?.city || data.address?.town || data.address?.county || 'Bengaluru';
            const state = data.address?.state || 'Karnataka';
            if (road) {
              locationName = `${road}, ${city}, ${state} (📍 Live GPS)`;
            } else {
              locationName = `${city}, ${state} (📍 Live GPS)`;
            }
          }
        } catch {
          locationName = `Bengaluru (📍 Live GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        }

        setPickup(locationName);
        setLiveLocationLoading(false);
        if (destination.trim()) {
          fetchQuotes(tripType, locationName, destination, passengers);
        }
      },
      (err) => {
        setLiveLocationLoading(false);
        alert(`Could not fetch live location: ${err.message}. Please select your pickup area in Karnataka from the suggestion list.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Track Booking Handler
  const handleTrackBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = trackingInputCode.trim().toUpperCase();
    if (!code) {
      setTrackingError('Please enter your Booking Code (e.g. SJT-654321).');
      return;
    }
    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/track/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No booking found with this code.');
      }
      setTrackingResult(data);
    } catch (err: any) {
      setTrackingError(err.message || 'Could not find booking.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Auto-fetch quotes for accurate pricing
  const fetchQuotes = async (currentTripType = tripType, currentPickup = pickup, currentDest = destination, currentPass = passengers) => {
    if (!currentPickup.trim() || !currentDest.trim()) return;
    setQuotingFare(true);
    setSearchMessage('');
    try {
      const result = await getFareQuotes({
        pickup: currentPickup,
        destination: currentDest,
        tripType: currentTripType,
        passengers: currentPass,
        journeyDate,
        returnDate: currentTripType === 'ROUND_TRIP' ? returnDate : undefined
      });
      const quoteMap = Object.fromEntries(result.quotes.map(q => [String(q.vehicle_id), q]));
      setFareQuotes(quoteMap);
      setRouteDistanceKm(result.distance_km);
      setRouteDistanceRange(result.distance_range || null);
      setRouteDurationText(result.duration_text || null);
      setRouteVia(result.route_via || null);

      const matchingVeh = vehicles.find(v => Number(v.seats) >= currentPass && quoteMap[String(v._id || v.id)]);
      if (matchingVeh) {
        setSelectedVehicle(matchingVeh);
      }
    } catch (err: any) {
      setSearchMessage(err.message || 'Could not calculate route fare.');
    } finally {
      setQuotingFare(false);
    }
  };

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      const defaultVeh = vehicles.find(v => v.id === 'innova' || v.id === 'etios') || vehicles[0];
      setSelectedVehicle(defaultVeh);
    }
  }, [vehicles, selectedVehicle]);

  useEffect(() => {
    if (vehicles.length > 0 && Object.keys(fareQuotes).length === 0 && pickup.trim() && destination.trim()) {
      fetchQuotes();
    }
  }, [vehicles.length]);

  // Restore active customer booking on mount or page refresh
  useEffect(() => {
    const savedCode = localStorage.getItem('sjt_last_booking_code');
    if (savedCode && !confirmedBooking) {
      fetch(`${API_BASE}/api/bookings/track/${encodeURIComponent(savedCode)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.booking_code && !data.error && data.status !== 'CANCELLED') {
            setConfirmedBooking(data);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Polling confirmed booking for real-time driver acceptance
  useEffect(() => {
    if (!confirmedBooking?.booking_code) return;
    const code = confirmedBooking.booking_code;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookings/track/${code}`);
        if (!res.ok) return;
        const data = await res.json();
        if (
          data.assigned_driver_id !== confirmedBooking.assigned_driver_id ||
          data.status !== confirmedBooking.status ||
          data.admin_message !== confirmedBooking.admin_message
        ) {
          setConfirmedBooking(data);
          if (data.assigned_driver_id && !confirmedBooking.assigned_driver_id) {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          }
        }
      } catch (e) {
        console.error('Status poll error:', e);
      }
    };

    pollingRef.current = setInterval(checkStatus, 2500);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [confirmedBooking?.booking_code, confirmedBooking?.assigned_driver_id, confirmedBooking?.admin_message, confirmedBooking?.status]);

  // Filter vehicles strictly to matching seater capacity for the selected passenger count
  const filteredVehicles = vehicles.filter(v => {
    const seats = Number(v.seats);
    const vehicleName = `${v.name} ${v.category || ''}`.toLowerCase();

    // In City Ride (POINT_TO_POINT), only 4-seater Sedans and 6/7-seater SUVs are allowed for city drop
    if (tripType === 'POINT_TO_POINT') {
      const isSedan = seats <= 4 || /sedan|etios|dzire/.test(vehicleName);
      const isSuv = (seats >= 5 && seats <= 7) || /ertiga|innova|suv|mpv|hycross/.test(vehicleName);
      if (!isSedan && !isSuv) return false;

      if (selectedCategory === 'SEDAN') return isSedan;
      if (selectedCategory === 'SUV') return isSuv;
      if (selectedCategory === 'ALL') return isSedan || isSuv;

      // Default RELATED:
      if (passengers <= 4) return isSedan;
      return isSuv;
    }

    // User explicitly chose a category pill tab:
    if (selectedCategory === 'ALL') {
      return seats >= passengers;
    }
    if (selectedCategory === 'SEDAN') return seats <= 4 || /sedan|etios|dzire/.test(vehicleName);
    if (selectedCategory === 'SUV') return (seats >= 6 && seats <= 7) || /innova|ertiga|hycross|suv|mpv/.test(vehicleName);
    if (selectedCategory === 'TEMPO') return (seats >= 9 && seats <= 17) || /tempo|traveller/.test(vehicleName);
    if (selectedCategory === 'MINI_BUS') return (seats >= 18 && seats <= 25) || /mini.?bus/.test(vehicleName);
    if (selectedCategory === 'BUS') return seats > 25 || /\bbus\b|coach/.test(vehicleName);

    // Default 'RELATED' (Strictly matching the user's selected seater tier):
    if (passengers <= 4) return seats <= 4;
    if (passengers <= 6) return seats >= 5 && seats <= 6;
    if (passengers <= 7) return seats === 7;
    if (passengers <= 12) return seats >= 8 && seats <= 12;
    if (passengers <= 17) return seats >= 13 && seats <= 17;
    if (passengers <= 25) return seats >= 18 && seats <= 25;
    return seats > 25;
  });

  // Automatically keep selectedVehicle in sync with the filtered list
  useEffect(() => {
    if (filteredVehicles.length > 0) {
      const isStillInFiltered = selectedVehicle && filteredVehicles.some(
        v => String(v._id || v.id) === String(selectedVehicle._id || selectedVehicle.id)
      );
      if (!isStillInFiltered) {
        setSelectedVehicle(filteredVehicles[0]);
      }
    }
  }, [filteredVehicles, selectedVehicle]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim()) {
      if (!pickup.trim() && !destination.trim()) {
        setSearchMessage('Please enter both pickup location and destination to see vehicles and fares.');
        document.getElementById('customer-pickup-location')?.focus();
      } else if (!pickup.trim()) {
        setSearchMessage('Please enter your pickup location in Karnataka.');
        document.getElementById('customer-pickup-location')?.focus();
      } else {
        setSearchMessage('Please enter your destination city or landmark.');
        document.getElementById('customer-destination-location')?.focus();
      }
      return;
    }
    setSearchMessage('');
    setSelectedCategory('RELATED');
    setConfirmedBooking(null);
    fetchQuotes(tripType, pickup.trim(), destination.trim(), passengers);
    document.getElementById('booking-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRequestBooking = async () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle from the list.');
      return;
    }
    if (!pickup.trim() || !destination.trim()) {
      alert('Please enter both your pickup location and destination in Karnataka before submitting a booking request.');
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
      if (!pickup.trim()) {
        document.getElementById('customer-pickup-location')?.focus();
      } else {
        document.getElementById('customer-destination-location')?.focus();
      }
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your full name and mobile number.');
      return;
    }

    const quote = fareQuotes[String(selectedVehicle._id || selectedVehicle.id)];
    const finalFare = quote?.fare || Number(selectedVehicle.ratePerDay) || 2400;

    setSubmittingBooking(true);
    try {
      const mapsLink = pickupGoogleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickup.trim())}`;
      const notesWithMap = notes.trim()
        ? `${notes.trim()} | 📍 Driver Google Maps: ${mapsLink}`
        : `📍 Driver Google Maps: ${mapsLink}`;

      const created = await createBooking({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        pickup: pickup.trim(),
        destination: destination.trim(),
        journeyDate,
        returnDate: tripType === 'ROUND_TRIP' ? returnDate : undefined,
        journeyTime: pickupTime,
        tripType,
        vehicleId: String(selectedVehicle._id || selectedVehicle.id),
        vehicleName: selectedVehicle.name,
        passengers,
        quotedAmount: finalFare,
        notes: notesWithMap
      });

      setConfirmedBooking(created);
      if (created?.booking_code) {
        localStorage.setItem('sjt_last_booking_code', created.booking_code);
      }
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    } catch (err: any) {
      alert(`Booking Error: ${err.message}`);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleSimulateDriverAccept = async () => {
    if (!confirmedBooking?.booking_code) return;
    setDriverAcceptSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/simulate-driver-accept/${confirmedBooking.booking_code}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        setConfirmedBooking(data.booking);
        if (refreshData) await refreshData(true);
        confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setDriverAcceptSimulating(false);
    }
  };

  const getTripTypeLabel = () => {
    switch (tripType) {
      case 'POINT_TO_POINT': return 'City Ride';
      case 'LOCAL': return 'Local • 8 hrs / 80 km Rental';
      case 'AIRPORT': return 'Airport Transfer';
      case 'ROUND_TRIP': return 'Round Trip';
      case 'OUTSTATION': return 'Outstation • One Way';
      default: return 'City Ride';
    }
  };

  const getVehicleFareBreakdown = (veh: Vehicle) => {
    const quote = fareQuotes[String(veh._id || veh.id)];
    const seats = Number(veh.seats) || 4;
    const isSedan = seats <= 4 || /sedan|etios|dzire/i.test(veh.name);
    const isErtiga = /ertiga/i.test(veh.name) || seats === 6;
    const isHycross = /hycross/i.test(veh.name);
    const isInnova = /innova/i.test(veh.name) || seats === 7;
    
    // Market city drop per-km rates: 4-seater Sedan: ₹12/km, 6-seater Ertiga: ₹15/km, 7-seater Innova: ₹18/km, Hycross: ₹22/km
    const cityPerKmRate = isSedan ? 12 : isErtiga ? 15 : isHycross ? 22 : isInnova ? 18 : 24;

    const baseFare = quote 
      ? quote.fare 
      : tripType === 'POINT_TO_POINT' && routeDistanceKm
        ? Math.max(150, Math.round(routeDistanceKm * cityPerKmRate))
        : (Number(veh.ratePerDay) || 2400);

    const extraKmRate = quote?.extra_km_rate || (tripType === 'POINT_TO_POINT' ? cityPerKmRate : veh.ratePerKm || cityPerKmRate);
    const extraHrRate = quote?.extra_hour_rate || (seats <= 4 ? 200 : seats <= 7 ? 250 : 400);
    const minKmText = tripType === 'POINT_TO_POINT' 
      ? 'Per-KM Drop' 
      : tripType === 'OUTSTATION' 
        ? '250 km / day' 
        : tripType === 'LOCAL' 
          ? '8 hrs / 80 km' 
          : 'Direct transfer';

    return {
      fare: baseFare,
      extraKmRate,
      extraHrRate,
      minKmText,
      cityPerKmRate,
      rateNote: quote?.rate_note || (
        tripType === 'POINT_TO_POINT' 
          ? `₹${extraKmRate}/km for ${veh.name} (Market rate city drop)` 
          : tripType === 'LOCAL' 
            ? 'Package fare (8 hrs / 80 km)' 
            : 'Standard Karnataka commercial fare'
      )
    };
  };

  const selectedBreakdown = selectedVehicle ? getVehicleFareBreakdown(selectedVehicle) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      

      {/* ======================================================== */}
      {/* 1. SINGLE CLEAN LUXURY HEADER (UNIFIED & UNCLUTTERED) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
        {/* Main Single-Line Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
            {/* Brand Logo & Slogan */}
            <a href="#booking-form" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="h-10 w-10 sm:h-11 sm:w-11 bg-white rounded-2xl shadow-md p-1 border border-slate-100 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <img src="/sjt_logo.png" alt="SJT Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black tracking-tight text-[#071B49] leading-none whitespace-nowrap">
                  SJT <span className="text-[#ED1735]">CABS</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mt-0.5 whitespace-nowrap">
                  Karnataka Commercial Fleet
                </span>
              </div>
            </a>

            {/* Nav Menu Links (Desktop) */}
            <nav className="hidden xl:flex items-center gap-4 2xl:gap-5 text-xs font-bold text-slate-700 whitespace-nowrap">
              <a href="#booking-form" className="text-[#ED1735] hover:text-[#ED1735] transition-colors whitespace-nowrap">Home</a>
              <button 
                type="button" 
                onClick={() => { setTripType('POINT_TO_POINT'); if (pickup.trim() && destination.trim()) fetchQuotes('POINT_TO_POINT'); }} 
                className={`transition-colors cursor-pointer font-black whitespace-nowrap ${tripType === 'POINT_TO_POINT' ? 'text-[#ED1735]' : 'hover:text-[#ED1735] text-blue-600'}`}
              >
                City Ride
              </button>
              <button 
                type="button" 
                onClick={() => { setTripType('LOCAL'); if (pickup.trim() && destination.trim()) fetchQuotes('LOCAL'); }} 
                className={`transition-colors cursor-pointer whitespace-nowrap ${tripType === 'LOCAL' ? 'text-[#ED1735]' : 'hover:text-[#ED1735]'}`}
              >
                Local (8hr/80km)
              </button>
              <button 
                type="button" 
                onClick={() => { setTripType('AIRPORT'); if (pickup.trim() && destination.trim()) fetchQuotes('AIRPORT'); }} 
                className={`transition-colors cursor-pointer whitespace-nowrap ${tripType === 'AIRPORT' ? 'text-[#ED1735]' : 'hover:text-[#ED1735]'}`}
              >
                Airport Transfers
              </button>
              <button 
                type="button" 
                onClick={() => { setTripType('OUTSTATION'); if (pickup.trim() && destination.trim()) fetchQuotes('OUTSTATION'); }} 
                className={`transition-colors cursor-pointer whitespace-nowrap ${tripType === 'OUTSTATION' ? 'text-[#ED1735]' : 'hover:text-[#ED1735]'}`}
              >
                Outstation
              </button>
              <button 
                type="button" 
                onClick={() => { setTripType('ROUND_TRIP'); if (pickup.trim() && destination.trim()) fetchQuotes('ROUND_TRIP'); }} 
                className={`transition-colors cursor-pointer whitespace-nowrap ${tripType === 'ROUND_TRIP' ? 'text-[#ED1735]' : 'hover:text-[#ED1735]'}`}
              >
                Round Trip
              </button>
              <a href="#fleet-section" className="hover:text-[#ED1735] transition-colors whitespace-nowrap">Fleet Matrix</a>
              <button type="button" onClick={() => setTrackingModalOpen(true)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer font-extrabold whitespace-nowrap">
                <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Track Ride
              </button>
            </nav>

            {/* Actions: Dispatch Hotline (Single-Line Button) & Book a Cab CTA */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Single Button Type Central Dispatch Hotline (Never Wraps) */}
              <a 
                href="tel:+919900975920" 
                className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 shadow-xs transition-all font-mono whitespace-nowrap shrink-0 cursor-pointer"
                title="Call 24x7 SJT Dispatch Hotline: +91 99009 75920"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#ED1735] shrink-0" />
                <span className="whitespace-nowrap font-black tracking-tight">+91 99009 75920</span>
              </a>

              {/* Book a Cab CTA */}
              <a
                href="#booking-form"
                className="hidden md:inline-flex bg-[#ED1735] hover:bg-[#c91029] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs shadow-md shadow-red-500/25 active:scale-95 transition-all whitespace-nowrap cursor-pointer items-center gap-1.5 shrink-0"
              >
                <span>Book a Cab</span>
              </a>

              {/* Mobile Hamburger Menu Toggle (for < xl screens) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer (when hamburger clicked) */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2.5 shadow-xl animate-fade-in">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
              <a 
                href="#booking-form" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#ED1735] flex items-center gap-1.5"
              >
                🏠 Home
              </a>
              <button 
                type="button" 
                onClick={() => { setTripType('POINT_TO_POINT'); setMobileMenuOpen(false); if (pickup.trim() && destination.trim()) fetchQuotes('POINT_TO_POINT'); }} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left font-black text-blue-600 flex items-center gap-1.5 cursor-pointer"
              >
                ⚡ City Ride
              </button>
              <button 
                type="button" 
                onClick={() => { setTripType('LOCAL'); setMobileMenuOpen(false); if (pickup.trim() && destination.trim()) fetchQuotes('LOCAL'); }} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left cursor-pointer"
              >
                ⏱️ Local (8hr/80km)
              </button>
              <button 
                type="button" 
                onClick={() => { setTripType('AIRPORT'); setMobileMenuOpen(false); if (pickup.trim() && destination.trim()) fetchQuotes('AIRPORT'); }} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left cursor-pointer"
              >
                ✈️ Airport Transfers
              </button>
              <button 
                type="button" 
                onClick={() => { setTripType('OUTSTATION'); setMobileMenuOpen(false); if (pickup.trim() && destination.trim()) fetchQuotes('OUTSTATION'); }} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left cursor-pointer"
              >
                🛣️ Outstation
              </button>
              <button 
                type="button" 
                onClick={() => { setTripType('ROUND_TRIP'); setMobileMenuOpen(false); if (pickup.trim() && destination.trim()) fetchQuotes('ROUND_TRIP'); }} 
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left cursor-pointer"
              >
                🔄 Round Trip
              </button>
              <a 
                href="#fleet-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100"
              >
                🚗 Fleet Matrix
              </a>
              <button 
                type="button" 
                onClick={() => { setTrackingModalOpen(true); setMobileMenuOpen(false); }} 
                className="p-2.5 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center gap-1.5 cursor-pointer text-left"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" /> Track Ride
              </button>
            </div>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <a
                href="#booking-form"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 bg-[#ED1735] hover:bg-[#c91029] text-white py-2.5 rounded-xl font-black text-xs text-center shadow-md shadow-red-500/20"
              >
                Book a Cab Now
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION WITH SEARCH WIDGET */}
      {/* ======================================================== */}
      <section className="relative bg-gradient-to-br from-[#071B49] via-[#0B2568] to-[#174E9A] text-white py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
          <img 
            src="/sjt_banner.jpg" 
            alt="SJT Travels Karnataka Fleet" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-blue-200 mb-3 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Bangalore's #1 Commercial Fleet Partner for Outstation, Local & Airport Rental</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Cabs, Innova Crysta, Tempo Traveller & Luxury Coach Rentals in Bangalore & Karnataka
            </h1>
            <p className="mt-3 text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Transparent per-km commercial fares, sanitized yellow-board commercial fleet, and trusted verified chauffeurs for pilgrimages, corporate duty & family tours.
            </p>
          </div>

          {/* Interactive Search Card */}
          <div id="booking-form" className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-5 sm:p-7 text-slate-800 border border-slate-100">
            {/* Trip Type Tabs */}
            <div className="flex flex-wrap gap-2 pb-5 mb-5 border-b border-slate-100">
              {[
                { id: 'POINT_TO_POINT', label: 'City Ride' },
                { id: 'LOCAL', label: 'Local (8hr/80km)' },
                { id: 'AIRPORT', label: 'Airport Transfers' },
                { id: 'OUTSTATION', label: 'Outstation' },
                { id: 'ROUND_TRIP', label: 'Round Trip' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    const nextType = t.id as TripType;
                    setTripType(nextType);
                    fetchQuotes(nextType);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tripType === t.id
                      ? 'bg-[#ED1735] text-white shadow-md shadow-red-500/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {/* Pickup Location */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5 h-5">
                    <MapPin className="w-3.5 h-3.5 text-[#ED1735] shrink-0" />
                    <span>Pickup Location</span>
                  </label>
                  <LocationSuggestionField 
                    id="customer-pickup-location" 
                    value={pickup} 
                    onChange={val => {
                      setPickup(val);
                      if (pickupGoogleMapsUrl && !val.includes('📍 Live GPS')) {
                        setPickupGoogleMapsUrl('');
                      }
                      if (destination.trim()) {
                        fetchQuotes(tripType, val, destination, passengers);
                      }
                    }} 
                    onUseLiveLocation={handleDetectLiveLocation}
                    isLocating={liveLocationLoading}
                    placeholder="Enter pickup locality or airport in Karnataka" 
                    required 
                  />
                  {pickupGoogleMapsUrl && (
                    <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> GPS Captured for Maps
                      </span>
                      <a
                        href={pickupGoogleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
                      >
                        Pin <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5 h-5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Destination</span>
                  </label>
                  <LocationSuggestionField 
                    id="customer-destination-location" 
                    value={destination} 
                    onChange={val => {
                      setDestination(val);
                      if (pickup.trim()) {
                        fetchQuotes(tripType, pickup, val, passengers);
                      }
                    }} 
                    placeholder="Enter destination city or landmark" 
                    required 
                  />
                </div>

                {/* Journey Date */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5 h-5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Journey Date</span>
                  </label>
                  <input
                    type="date"
                    min={toLocalDateInput(new Date())}
                    value={journeyDate}
                    onChange={e => {
                      const nextDate = e.target.value;
                      setJourneyDate(nextDate);
                      if (returnDate <= nextDate) setReturnDate(addDaysToDateInput(nextDate, 1));
                    }}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none bg-white transition shadow-xs"
                  />
                </div>

                {/* Return Date (if Round Trip) OR Pickup Time */}
                {tripType === 'ROUND_TRIP' ? (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5 h-5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Return Date</span>
                    </label>
                    <input
                      type="date"
                      min={journeyDate}
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none bg-white transition shadow-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5 h-5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Pickup Time</span>
                    </label>
                    <select
                      value={pickupTime}
                      onChange={e => setPickupTime(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none bg-white transition shadow-xs cursor-pointer"
                    >
                      {['05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM'].map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Passengers Dropdown */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5 h-5">
                  <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Passengers & Seating Category</span>
                </label>
                <select
                  value={passengers}
                  onChange={e => {
                    const count = Number(e.target.value);
                    setPassengers(count);
                    setSelectedCategory('RELATED');
                    fetchQuotes(tripType, pickup, destination, count);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none bg-white transition shadow-xs cursor-pointer"
                >
                  {tripType === 'POINT_TO_POINT' ? (
                    <>
                      <option value={4}>1 - 4 Passengers (Sedan: Dzire / Etios · ₹12/km)</option>
                      <option value={6}>5 - 6 Passengers (SUV: Maruti Ertiga · ₹15/km)</option>
                      <option value={7}>7 Passengers (SUV: Toyota Innova Crysta · ₹18/km)</option>
                    </>
                  ) : (
                    <>
                      <option value={4}>1 - 4 Passengers (Sedan: Dzire / Etios)</option>
                      <option value={6}>5 - 6 Passengers (SUV / MUV: Ertiga / Innova)</option>
                      <option value={7}>7 Passengers (Premium SUV: Innova Crysta)</option>
                      <option value={12}>8 - 12 Passengers (Tempo Traveller 12 Seater)</option>
                      <option value={17}>13 - 17 Passengers (Tempo Traveller 17 Seater)</option>
                      <option value={25}>18 - 25 Passengers (Mini Bus 25 Seater)</option>
                      <option value={45}>26 - 50 Passengers (Luxury Tourist Coach Bus 45 Seater)</option>
                    </>
                  )}
                </select>
              </div>

              {searchMessage && (
                <p className="text-xs font-bold text-[#ED1735] bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {searchMessage}
                </p>
              )}

              {/* Submit CTA */}
              <div>
                <button
                  type="submit"
                  disabled={quotingFare}
                  className="w-full bg-[#ED1735] hover:bg-[#c91029] text-white py-3.5 rounded-xl font-black text-sm shadow-xl shadow-red-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{quotingFare ? 'Calculating Vehicles & Live Fare…' : 'Search Vehicles & Fare'}</span>
                </button>
              </div>
            </form>

            {/* Popular quick route suggestions */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-bold text-[11px]">Popular from Bangalore:</span>
              {popularDestinations.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    const dest = `${d}, Karnataka`;
                    setDestination(dest);
                    fetchQuotes(tripType, pickup, dest);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Social Proof Rating Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto text-xs text-white">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400 shrink-0" />
              <div>
                <strong className="block text-sm font-black">4.9 / 5.0 Rating</strong>
                <span className="text-[11px] text-blue-200">2,800+ Verified Google Reviews</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-sm font-black">100% Yellow Board</strong>
                <span className="text-[11px] text-blue-200">RTO Commercial Passenger Compliant</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-300 shrink-0" />
              <div>
                <strong className="block text-sm font-black">24x7 Help Desk</strong>
                <span className="text-[11px] text-blue-200">Booking assistance & dispatch</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-300 shrink-0" />
              <div>
                <strong className="block text-sm font-black">Zero Hidden Costs</strong>
                <span className="text-[11px] text-blue-200">Fixed Rates, Tolls at Actuals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. 2-COLUMN BOOKING ENGINE (Matches Screenshot 5) */}
      {/* ======================================================== */}
      <section id="booking-results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1 (LEFT, 7 cols): "1 Available vehicles" */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            
            {/* Column 1 Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                  1
                </span>
                <div>
                  <h2 className="text-xl font-black text-[#071B49] leading-tight">
                    Available vehicles
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the best vehicle for your trip
                  </p>
                </div>
              </div>

              <a 
                href="#booking-form" 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
              >
                ✏️ Modify Search
              </a>
            </div>

            {/* Route Summary Strip */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#ED1735] shrink-0" />
                  {pickup}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {destination}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {journeyDate}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Trip Type</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                  <Car className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  {getTripTypeLabel()}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Passengers</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                  <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  {passengers} Passengers
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Road Distance & Time</span>
                <span className="font-mono font-bold text-emerald-700 mt-0.5 block">
                  {routeDistanceRange ? `${routeDistanceRange} (${routeDistanceKm} km)` : (routeDistanceKm ? `${routeDistanceKm} km by road` : 'Route calculated')}
                </span>
                {routeDurationText && (
                  <span className="text-[10px] text-slate-500 font-medium block truncate" title={routeVia || ''}>
                    ⏱️ {routeDurationText} {routeVia ? `• ${routeVia}` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Smart Banner: Upgrade from 8hr Rental to Point-to-Point Per-KM Drop */}
            {tripType === 'LOCAL' && routeDistanceKm && routeDistanceKm <= 35 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-sm animate-pulse">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">💡</span>
                  <div>
                    <p className="font-black text-amber-950 text-sm">
                      Need a one-way city drop across Bengaluru ({routeDistanceRange || `${routeDistanceKm} km`})?
                    </p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Save over ₹1,900! Switch to <strong>City Ride</strong> to pay based on actual distance (from ₹12/km for 4-seater Sedan, ₹15-₹18/km for 7-seater SUV) instead of the full-day ₹2,200 rental package.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTripType('POINT_TO_POINT');
                    fetchQuotes('POINT_TO_POINT');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs whitespace-nowrap shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  Switch to City Ride →
                </button>
              </div>
            )}

            {/* Vehicle Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(tripType === 'POINT_TO_POINT' ? [
                { id: 'ALL', label: 'All City Cabs (4 & 7 Seater)' },
                { id: 'SEDAN', label: '4-Seater Sedan (₹12/km)' },
                { id: 'SUV', label: '6-7 Seater SUV (₹15-₹18/km)' }
              ] : [
                { 
                  id: 'RELATED', 
                  label: `Exact Match (${passengers <= 4 ? '4 Seater Sedan' : passengers <= 6 ? '6 Seater SUV' : passengers <= 7 ? '7 Seater Crysta' : passengers <= 12 ? '12 Seater Tempo' : passengers <= 17 ? '17 Seater Tempo' : passengers <= 25 ? '25 Seater Mini Bus' : '45 Seater Coach'})` 
                },
                { id: 'ALL', label: 'All Fleet Vehicles' },
                { id: 'SEDAN', label: 'Sedans (4)' },
                { id: 'SUV', label: 'SUV / MUV (6-7)' },
                { id: 'TEMPO', label: 'Tempo Traveller (12-17)' },
                { id: 'MINI_BUS', label: 'Mini Bus (25)' },
                { id: 'BUS', label: 'Coach Bus (45)' }
              ]).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#ED1735] text-white shadow-md shadow-red-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Vehicle Cards Stack */}
            <div className="space-y-4">
              {filteredVehicles.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
                  <Car className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <p className="font-bold text-slate-700">No vehicles match this category for {passengers} passengers.</p>
                  <p className="mt-1 text-xs text-slate-500">Select "All Vehicles" or adjust your passenger count.</p>
                </div>
              )}

              {filteredVehicles.map(veh => {
                const isSelected = selectedVehicle && String(selectedVehicle._id || selectedVehicle.id) === String(veh._id || veh.id);
                const breakdown = getVehicleFareBreakdown(veh);

                return (
                  <div
                    key={veh._id || veh.id}
                    onClick={() => setSelectedVehicle(veh)}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'border-[#ED1735] ring-2 ring-red-500/20 bg-red-50/10 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center gap-5">
                      
                      {/* Left: Thumbnail & Availability */}
                      <div className="flex flex-col items-center gap-2 shrink-0 w-full md:w-36">
                        <div className="h-24 w-full bg-slate-50 rounded-xl p-1 flex items-center justify-center border border-slate-100">
                          <img
                            src={veh.image}
                            alt={veh.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                          <Check className="w-3 h-3 text-emerald-600" /> Available for this trip
                        </span>
                      </div>

                      {/* Middle: Details & Specs */}
                      <div className="flex-1 min-w-0 space-y-2 text-left w-full">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-[#071B49]">
                              {veh.name}
                            </h3>
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {veh.regNumber}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {Number(veh.seats) <= 4 ? 'Toyota Dzire / Etios or Similar' : Number(veh.seats) <= 7 ? 'Innova Crysta / Ertiga or Similar' : Number(veh.seats) <= 17 ? 'Force Traveller or Similar' : 'Luxury Tourist Coach or Similar'}
                          </p>
                        </div>

                        {/* Specs row */}
                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold">
                            <Users className="w-3.5 h-3.5 text-blue-600" /> Up to {veh.seats} passengers
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            ❄️ {veh.ac ? 'AC' : 'Non-AC'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Luggage className="w-3.5 h-3.5 text-amber-600" /> {Number(veh.seats) <= 4 ? '2 Bags' : Number(veh.seats) <= 7 ? '4 Bags' : '8+ Bags'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 italic">
                          {Number(veh.seats) <= 4 ? '🎯 Comfortable for city and airport travel' : Number(veh.seats) <= 7 ? '🎯 Ideal for family and group tours' : '🎯 Executive travel with pushback seats'}
                        </p>
                      </div>

                      {/* Right: Pricing Table & Action */}
                      <div className="shrink-0 w-full md:w-56 text-right md:border-l md:border-slate-100 md:pl-5 space-y-3">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>
                              {tripType === 'POINT_TO_POINT' 
                                ? 'City Drop Fare:' 
                                : tripType === 'LOCAL' 
                                  ? 'Package (8hr/80km):' 
                                  : 'Base package:'}
                            </span>
                            <span className="font-bold text-slate-800">₹{breakdown.fare.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>{tripType === 'POINT_TO_POINT' ? 'Vehicle Rate / km:' : 'Extra km rate:'}</span>
                            <span className="font-bold text-emerald-700">₹{breakdown.extraKmRate} / km</span>
                          </div>
                          {tripType !== 'POINT_TO_POINT' && (
                            <div className="flex justify-between text-slate-500 text-[11px]">
                              <span>Extra hr / allowance:</span>
                              <span className="font-semibold text-slate-700">₹{breakdown.extraHrRate} / hr</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">
                            {tripType === 'POINT_TO_POINT' ? 'Total Trip Fare' : 'Estimated Total'}
                          </div>
                          <div className="text-xl font-black text-[#ED1735]">
                            ₹{breakdown.fare.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            {tripType === 'POINT_TO_POINT' ? `(${routeDistanceKm || 0} km @ ₹${breakdown.extraKmRate}/km)` : '(Illustrative fare)'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVehicle(veh);
                          }}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                              : 'bg-[#ED1735] hover:bg-[#c91029] text-white shadow-md shadow-red-500/20'
                          }`}
                        >
                          <span>{isSelected ? 'Selected ✓' : 'Select vehicle'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-5 py-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Vehicle availability and fare confirmed by SJT operations.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2 (RIGHT, 5 cols): "2 Booking details" */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl space-y-6 lg:sticky lg:top-28">
            
            {/* Column 2 Header */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                  2
                </span>
                <div>
                  <h2 className="text-xl font-black text-[#071B49] leading-tight">
                    Booking details
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review your trip details and submit a booking request
                  </p>
                </div>
              </div>

              {/* Notice */}
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Booking will be confirmed after a driver accepts.</span>
              </div>
            </div>

            {/* Selected Vehicle Card */}
            {selectedVehicle ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
                <img
                  src={selectedVehicle.image}
                  alt={selectedVehicle.name}
                  className="w-20 h-16 object-contain bg-white rounded-xl p-1 border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Selected vehicle</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <h4 className="font-black text-sm text-[#071B49] truncate mt-0.5">
                    {selectedVehicle.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>👥 Up to {selectedVehicle.seats} seats</span>
                    <span>•</span>
                    <span>❄️ {selectedVehicle.ac ? 'AC' : 'Non-AC'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                Please select a vehicle from Column 1
              </div>
            )}

            {/* Trip Details Checklist */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/80">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-600" /> Trip type
                </span>
                <strong className="text-slate-800">{getTripTypeLabel()}</strong>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/80">
                <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#ED1735]" /> Pickup location
                </span>
                <strong className={`text-right max-w-[220px] truncate ${!pickup.trim() ? 'text-amber-600 italic font-medium' : 'text-slate-800'}`}>
                  {pickup.trim() || 'Enter in search box above 👆'}
                </strong>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/80">
                <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Destination
                </span>
                <strong className={`text-right max-w-[220px] truncate ${!destination.trim() ? 'text-amber-600 italic font-medium' : 'text-slate-800'}`}>
                  {destination.trim() || 'Enter in search box above 👆'}
                </strong>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/80">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Journey date
                </span>
                <strong className="text-slate-800">{journeyDate}</strong>
              </div>

              {tripType === 'ROUND_TRIP' && (
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Return date
                  </span>
                  <strong className="text-slate-800">{returnDate}</strong>
                </div>
              )}

              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/80">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Pickup time
                </span>
                <strong className="text-slate-800">{pickupTime}</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" /> Passengers
                </span>
                <strong className="text-slate-800">{passengers} Passengers</strong>
              </div>

              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Distance & Route
                </span>
                <div className="text-right">
                  <strong className="text-emerald-700 block font-mono">
                    {routeDistanceRange ? `${routeDistanceRange} (${routeDistanceKm} km)` : (routeDistanceKm ? `${routeDistanceKm} km by road` : 'Route calculated')}
                  </strong>
                  {routeDurationText && (
                    <span className="text-[10px] text-slate-500 block">
                      ⏱️ {routeDurationText} {routeVia ? `(${routeVia})` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Helper notice if route is incomplete */}
            {(!pickup.trim() || !destination.trim()) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Enter pickup & destination above to calculate route fare.</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                    if (!pickup.trim()) {
                      document.getElementById('customer-pickup-location')?.focus();
                    } else {
                      document.getElementById('customer-destination-location')?.focus();
                    }
                  }}
                  className="text-xs font-bold text-amber-800 underline hover:text-amber-950 shrink-0 ml-2 cursor-pointer"
                >
                  Enter Now
                </button>
              </div>
            )}

            {/* Customer Contact Details */}
            {!confirmedBooking && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter your real full name"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#071B49] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobile Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#071B49] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="Enter your email address (optional)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#071B49] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Special Notes / Flight No. / Luggage
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Flight 6E-241, luggage for 4, need infant seat"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#071B49] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Fare Details */}
            {selectedBreakdown && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>
                    {tripType === 'POINT_TO_POINT' ? 'City Drop Fare:' : `Package fare (${selectedBreakdown.minKmText})`}
                  </span>
                  <span className="font-bold text-slate-800">₹{selectedBreakdown.fare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>{tripType === 'POINT_TO_POINT' ? 'Vehicle Rate / km:' : 'Extra km (after limit)'}</span>
                  <span className="font-bold text-emerald-700">₹{selectedBreakdown.extraKmRate} / km</span>
                </div>
                {tripType !== 'POINT_TO_POINT' ? (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Extra hour (after package)</span>
                    <span>₹{selectedBreakdown.extraHrRate} / hour</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Billable Distance:</span>
                    <span className="font-bold text-slate-800">{routeDistanceKm || 0} km</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-black text-sm text-[#071B49] block">
                      {tripType === 'POINT_TO_POINT' ? 'Total Trip Fare' : 'Estimated total'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {tripType === 'POINT_TO_POINT' ? `(${routeDistanceKm || 0} km @ ₹${selectedBreakdown.extraKmRate}/km)` : '(Illustrative fare)'}
                    </span>
                  </div>
                  <span className="text-xl font-black text-[#ED1735]">
                    ₹{selectedBreakdown.fare.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1">
                  ⓘ Final fare is calculated by SJT server and confirmed before booking confirmation. Tolls, state permits & parking at actuals.
                </p>
              </div>
            )}

            {/* Booking Flow Stepper */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                Booking flow
              </span>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {/* Step 1 */}
                <div className="space-y-1">
                  <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                    confirmedBooking ? 'bg-emerald-600 text-white' : 'bg-[#ED1735] text-white ring-4 ring-red-100'
                  }`}>
                    {confirmedBooking ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <div className="font-bold text-[11px] text-slate-800">Request submitted</div>
                  <div className="text-[9px] text-slate-400 leading-tight">Sent to nearby drivers</div>
                </div>

                {/* Step 2 */}
                <div className="space-y-1">
                  <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                    confirmedBooking?.assigned_driver_id
                      ? 'bg-emerald-600 text-white'
                      : confirmedBooking
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {confirmedBooking?.assigned_driver_id ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <div className="font-bold text-[11px] text-slate-800">Driver accepts</div>
                  <div className="text-[9px] text-slate-400 leading-tight">Captain confirms ride</div>
                </div>

                {/* Step 3 */}
                <div className="space-y-1">
                  <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                    confirmedBooking?.assigned_driver_id
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {confirmedBooking?.assigned_driver_id ? <Check className="w-4 h-4" /> : '3'}
                  </div>
                  <div className="font-bold text-[11px] text-slate-800">Pay driver directly</div>
                  <div className="text-[9px] text-slate-400 leading-tight">Cash / UPI on pickup</div>
                </div>
              </div>

              {/* Awaiting Driver State */}
              {confirmedBooking && !confirmedBooking.assigned_driver_id && (
                <div className="space-y-3">
                  {confirmedBooking.admin_message && (
                    <div className="p-4 bg-gradient-to-r from-amber-500/15 via-red-500/15 to-orange-500/15 border-2 border-amber-500/60 rounded-2xl shadow-md space-y-2.5 animate-pulse-subtle">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>SJT Operations Dispatch Update</span>
                        {confirmedBooking.admin_message_time && (
                          <span className="ml-auto text-[10px] text-slate-500 font-mono">
                            {new Date(confirmedBooking.admin_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="p-3 bg-white/95 rounded-xl border border-amber-300 text-xs font-bold text-slate-800 leading-relaxed shadow-xs">
                        "{confirmedBooking.admin_message}"
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px]">
                        <span className="text-slate-600">Need urgent help or fast-track allocation?</span>
                        <a
                          href="tel:+919900975920"
                          className="w-full sm:w-auto px-3 py-1.5 bg-[#ED1735] hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Dispatch: +91 99009 75920</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Awaiting driver confirmation…</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      We have received your request (Ref: <strong className="font-mono text-slate-900">{confirmedBooking.booking_code}</strong>). Dispatching request to nearby SJT commercial drivers now.
                    </p>

                    <div className="mt-2 p-2.5 rounded-xl bg-white/80 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2 font-medium">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Payment is not available until a driver accepts your booking.</span>
                    </div>

                    {import.meta.env.DEV && (
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={driverAcceptSimulating}
                          onClick={handleSimulateDriverAccept}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95 cursor-pointer"
                        >
                          {driverAcceptSimulating ? 'Simulating…' : '⚡ Simulate Driver Acceptance (Test Flow)'}
                        </button>
                        <span className="text-[9px] text-amber-600 block text-center mt-1">
                          Click to test the live transition when a driver confirms the ride
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Confirmed Driver Profile Card */}
              {confirmedBooking && confirmedBooking.assigned_driver_id && (
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 space-y-3 animate-fade-in shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Driver Confirmed!
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-600">
                      Ref: {confirmedBooking.booking_code}
                    </span>
                  </div>

                  {/* Driver Profile */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black flex items-center justify-center text-base shadow">
                        {(confirmedBooking.assigned_driver_name || 'SJT').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-sm text-[#071B49] flex items-center gap-1.5">
                          <span>{confirmedBooking.assigned_driver_name || 'Assigned SJT driver'}</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified driver</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-700 mt-0.5">
                          Cab Reg: <strong>{confirmedBooking.vehicle_reg || 'KA-05-MJ-4491'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {confirmedBooking.assigned_driver_phone && (
                        <a
                          href={`tel:${confirmedBooking.assigned_driver_phone}`}
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow"
                          title="Call Driver"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 4-Digit Passenger Start OTP Card (Rapido Style) */}
                  {confirmedBooking.start_otp && confirmedBooking.status !== 'COMPLETED' && (
                    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 rounded-2xl p-4 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                          <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                            Start Ride OTP (Rapido Style)
                          </span>
                        </div>
                        <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                          Tell Captain upon arrival
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            Share this 4-digit PIN with Captain {confirmedBooking.assigned_driver_name || 'Driver'}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            Trip starts only when driver verifies this secret code
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-base font-black text-slate-900">
                          {String(confirmedBooking.start_otp).padStart(4, '0').slice(0, 4).split('').map((d: string, i: number) => (
                            <span key={i} className="w-9 h-11 bg-white border-2 border-amber-400 rounded-xl flex items-center justify-center shadow-md text-slate-900 font-mono font-black text-xl">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Ride Summary */}
                  {confirmedBooking.status === 'COMPLETED' && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ride Completed
                        </span>
                        <span className="text-[10px] font-black bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                          PAID & CLOSED
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Total Distance: <strong>{confirmedBooking.actual_km || 0} KM</strong>. Thank you for riding with SJT Travels!
                      </p>
                    </div>
                  )}

                  {/* Step 3 UNLOCKED */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-black text-xs text-emerald-800">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Payment Option: Pay Directly to Driver</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Pay your confirmed driver directly by <strong>cash or UPI</strong>. The confirmed fare is <strong className="text-emerald-700 font-black">₹{Number(confirmedBooking.quoted_amount).toLocaleString('en-IN')}</strong>. Payment remains outstanding until the driver records money actually received.
                    </p>
                    <div className="text-[11px] text-slate-600">
                      Outstanding: <strong>₹{Math.max(0, Number(confirmedBooking.balance_amount ?? (Number(confirmedBooking.quoted_amount) - Number(confirmedBooking.advance_paid || 0)))).toLocaleString('en-IN')}</strong>
                      {' · '}Status: <strong>{confirmedBooking.payment_status || 'PENDING'}</strong>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                      <Check className="w-3 h-3 text-emerald-600" /> No in-app payment is taken; collect only after payment is received.
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openClientMailModal(confirmedBooking)}
                      className="flex-1 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Trip Voucher ✉️
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmedBooking(null);
                        alert('You can now search and book another ride.');
                      }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Book Another Ride
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}
            {!confirmedBooking && (
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={submittingBooking || !selectedVehicle}
                  onClick={handleRequestBooking}
                  className="w-full bg-[#ED1735] hover:bg-[#c91029] text-white py-3.5 rounded-xl font-black text-sm shadow-xl shadow-red-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <Car className="w-4 h-4" />
                  <span>{submittingBooking ? 'Submitting Request…' : 'Request this vehicle'}</span>
                </button>

                <a
                  href="#booking-form"
                  className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 block"
                >
                  ✏️ Edit trip parameters
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. EXCLUSIVE EVENT-BASED RENTALS & SERVICES (Tejas Style) */}
      {/* ======================================================== */}
      <section id="services-section" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#ED1735] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Custom Fleet Packages Across South India
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#071B49] tracking-tight">
              Exclusive Event-Based Vehicle Rentals & Luxury Transportation Services
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              From corporate employee commuting to destination weddings and pilgrimage circuits, SJT Travels provides dedicated yellow-board commercial transport tailored to your schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Service 1: Corporate & Employee Transport */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Building className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#071B49] group-hover:text-blue-600 transition-colors">
                  Corporate & Employee Transport
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Point-to-point transport requests for teams in Electronic City, Manyata Tech Park, and Whitefield. Contact SJT to discuss recurring staff transport and billing; driver duty records are handled through the operations team.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Driver and vehicle documents reviewed by SJT</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Driver assignment status and direct driver contact</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Corporate invoice requests handled by SJT operations</li>
                </ul>
              </div>
              <button 
                onClick={() => {
                  setTripType('LOCAL');
                  document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book Corporate Transport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 2: Wedding & VIP Delegations */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#071B49] group-hover:text-amber-600 transition-colors">
                  Wedding & VIP Delegations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Make your special celebrations unforgettable with coordinated fleets of Innova Crystas, luxury sedans, and air-conditioned Tempo Travellers for wedding guests, VIP dignitaries, and airport pickup convoys.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Uniformed chauffeurs experienced in VIP etiquette</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Coordinated multi-vehicle dispatch with supervisor</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Decorated bridal & groom luxury cars on request</li>
                </ul>
              </div>
              <button 
                onClick={() => {
                  setTripType('ROUND_TRIP');
                  document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book Wedding Convoy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 3: Outstation Holiday Getaways */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#071B49] group-hover:text-emerald-600 transition-colors">
                  Outstation Holiday Getaways
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explore Karnataka, Tamil Nadu, and Kerala hill stations in comfort. Special holiday packages for Coorg coffee homestays, Ooty tea gardens, Chikmagalur peaks, and Wayanad rainforests.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Experienced hill-station & ghat-section drivers</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Multi-day flexible sightseeing with driver allowance</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Pushback luxury seating with mobile charging ports</li>
                </ul>
              </div>
              <button 
                onClick={() => {
                  setTripType('ROUND_TRIP');
                  setDestination('Coorg, Karnataka');
                  document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Plan Outstation Holiday</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 4: Pilgrimage & Temple Circuits */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#071B49] group-hover:text-rose-600 transition-colors">
                  Pilgrimage & Sacred Circuits
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Smooth spiritual journeys with your elders and family. Direct pilgrimage tours to Tirupati Balaji (VIP Sheegra Darshan assistance), Hampi UNESCO Heritage, Dharmasthala, and Kukke Subramanya.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Polite, family-friendly and pure-veg drivers</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Ample luggage space for puja offerings and prasad</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Inter-state permit handling for Andhra and Tamil Nadu</li>
                </ul>
              </div>
              <button 
                onClick={() => {
                  setTripType('OUTSTATION');
                  setDestination('Tirupati, Andhra Pradesh');
                  document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book Pilgrimage Tour</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 5: Kempegowda Airport Transfers */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Plane className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#071B49] group-hover:text-indigo-600 transition-colors">
                  Kempegowda Airport (T1 & T2) Transfers
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Request a pickup or drop between Bengaluru and Kempegowda International Airport (T1/T2). Add your flight number to the booking notes and contact SJT to coordinate schedule changes. Automated flight monitoring and guaranteed waiting periods are not currently available.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Server-calculated fare shown before you request a booking</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Driver details appear after a driver accepts</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Tolls, parking, and permits are payable at actuals</li>
                </ul>
              </div>
              <button 
                onClick={() => {
                  setTripType('AIRPORT');
                  setDestination('Kempegowda International Airport (BLR)');
                  document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-800 hover:bg-indigo-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book Airport Transfer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 6: Educational & Industrial Group Buses */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#071B49] group-hover:text-purple-600 transition-colors">
                  Educational & Group Tours
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Large group transport made seamless with 25-seater Mini Buses and 45/50-seater luxury air-suspension coaches. Ideal for school excursions, university seminars, and industrial factory visits.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> RTO passenger safety fitness certified coaches</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Full passenger group accidental insurance</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> PA sound system, mic & emergency first aid onboard</li>
                </ul>
              </div>
              <button 
                onClick={() => {
                  setPassengers(25);
                  document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book Group Coach</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. WHY CHOOSE SJT TRAVELS (Key Advantages) */}
      {/* ======================================================== */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#ED1735] uppercase tracking-wider">
              The SJT Travel Advantage
            </span>
            <h2 className="text-3xl font-black text-[#071B49] tracking-tight">
              Why 10,000+ Travellers Choose SJT Across Karnataka
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-red-50 text-[#ED1735] rounded-2xl shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-[#071B49]">100% Commercial Yellow-Board</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Zero private-white-board risk. Every vehicle is legally permitted by Karnataka RTO with valid fitness certificates, speed governors, and commercial passenger insurance.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-[#071B49]">Driver Documents Reviewed</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Drivers submit identity, licence, and vehicle documents for SJT administrator review. Automated police or government-registry verification is not available.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-[#071B49]">Pay Directly to Driver</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  No forced online advances. Book with complete peace of mind and pay your driver directly via Cash or UPI (GPay / PhonePe / Paytm) upon vehicle arrival or trip completion.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-[#071B49]">Booking Status & Driver Contact</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Refresh your booking to check driver acceptance and see assigned driver details. Live vehicle GPS tracking and emergency dispatch are not currently available.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-[#071B49]">Corporate Invoice Support</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Contact SJT operations about an invoice for your business trip. Instant GST invoice email delivery is not currently available through this website.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-[#071B49]">Booking Request & Driver Dispatch</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your request is checked against eligible drivers. A trip is confirmed only after a driver accepts; if no driver is available, SJT operations will follow up.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. VERIFIED CUSTOMER REVIEWS (Google Ratings Style) */}
      {/* ======================================================== */}
      <section id="reviews-section" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black text-[#ED1735] uppercase tracking-wider">
                Real Customer Feedback
              </span>
              <h2 className="text-3xl font-black text-[#071B49] tracking-tight mt-1">
                What Our Customers Say About SJT Travels
              </h2>
            </div>
            
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl shrink-0">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-black text-sm text-slate-800">4.9 / 5.0</span>
              <span className="text-xs text-slate-500">• 2,840+ Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "Booked a 17-seater Force Tempo Traveller for our 3-day family trip to Coorg and Madikeri. The vehicle was spotlessly clean, pushback seats were comfortable, and driver Ramesh Kumar drove safely through mountain hairpin curves. Highly recommended!"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-[#071B49]">Ananth Narayan</h4>
                  <span className="text-[10px] text-slate-500">Bangalore to Coorg Holiday</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Verified Trip</span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "Needed an urgent airport drop from Banashankari to KIA Terminal 2 at 3:30 AM for an international flight. The driver arrived 15 minutes before time in a clean Toyota Etios. No midnight surcharge drama, paid directly via UPI."
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-[#071B49]">Priya Sundaram</h4>
                  <span className="text-[10px] text-slate-500">Early Morning Airport Drop</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Verified Trip</span>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "We arranged 3 Innova Crystas and a 25-seater coach for our company offsite at Kabini jungle lodge. Punctuality was 100%, official GST invoice was emailed within hours, and the pricing was much more transparent than online aggregators."
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-[#071B49]">Vikramaditya Rao</h4>
                  <span className="text-[10px] text-slate-500">Corporate HR, Whitefield</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Corporate Client</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. TRUSTED BY LEADING CORPORATES & BRANDS */}
      {/* ======================================================== */}
      <section className="py-12 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            Trusted by Leading Enterprises & Karnataka Tourism
          </span>
          <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-black text-lg text-slate-700 tracking-tight">INFOSYS</span>
            <span className="font-black text-lg text-slate-700 tracking-tight">WIPRO</span>
            <span className="font-black text-lg text-slate-700 tracking-tight">TCS</span>
            <span className="font-black text-lg text-slate-700 tracking-tight">FLIPKART</span>
            <span className="font-black text-lg text-slate-700 tracking-tight">AMAZON</span>
            <span className="font-black text-lg text-slate-700 tracking-tight">BOSCH</span>
            <span className="font-black text-lg text-slate-700 tracking-tight">KARNATAKA TOURISM</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. SJT CABS USER APP - LAUNCHING SOON BANNER */}
      {/* ======================================================== */}
      <section className="py-12 bg-gradient-to-b from-[#071B49] via-[#09225c] to-[#051336] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Main Official Banner Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#030e2e] via-[#071B49] to-slate-900 border border-blue-500/40 p-4 sm:p-6 lg:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              
              {/* Official Banner Image */}
              <div className="w-full lg:w-7/12 relative group overflow-hidden rounded-2xl shadow-2xl border border-blue-400/30 bg-blue-950/50">
                <img 
                  src="/sjt_user_app_launching_soon.jpg" 
                  alt="SJT Cabs User App Launching Soon" 
                  className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500"
                />
              </div>

              {/* Banner Details, Value Proposition & Notify Me */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="bg-[#ED1735] text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>Launching Next Month End!</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Android & iOS App
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    SJT Cabs User App <span className="text-[#00D4FF]">Coming Soon!</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                    Your SJT Cabs customer app for easy, reliable, and comfortable cab bookings across Karnataka. Book verified yellow-board commercial vehicles with zero commission and transparent per-km billing!
                  </p>
                </div>

                {/* 4 Feature Highlights from Banner */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                      <Car className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Book Your Trip</div>
                      <div className="text-[10px] text-slate-300">Instant & Scheduled</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Track Status</div>
                      <div className="text-[10px] text-slate-300">Live Driver Dispatch</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Contact Driver</div>
                      <div className="text-[10px] text-slate-300">Call / WhatsApp Direct</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Pay Driver Directly</div>
                      <div className="text-[10px] text-slate-300">Cash / Direct UPI</div>
                    </div>
                  </div>
                </div>

                {/* Pre-register Notification Form */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span>Stay Tuned! Get Notified On Launch Day:</span>
                  </div>
                  {userAppNotified ? (
                    <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Thank you! We will notify you on WhatsApp as soon as the app goes live.</span>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (userAppPhone.trim()) {
                          setUserAppNotified(true);
                          confetti({ particleCount: 40, spread: 60 });
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <input 
                        type="tel"
                        value={userAppPhone}
                        onChange={(e) => setUserAppPhone(e.target.value)}
                        placeholder="Enter WhatsApp # (e.g. 98450 12345)"
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notify Me</span>
                      </button>
                    </form>
                  )}
                  <p className="text-[10px] text-slate-400">
                    * Early subscribers receive exclusive ₹250 launch coupons for their first outstation ride.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ Accordion) */}
      {/* ======================================================== */}
      <section id="faq-section" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-[#ED1735] uppercase tracking-wider">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black text-[#071B49] tracking-tight">
              Frequently Asked Questions (FAQs)
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does payment work for SJT Cabs?',
                a: 'You do not need to pay online. After you submit a request, an eligible driver may accept it; if no driver is available, SJT operations will follow up. Once a driver accepts, pay that driver directly by cash or UPI after the service is provided.'
              },
              {
                q: 'What is the difference between Outstation One-Way and Round Trip?',
                a: 'Outstation One-Way is a direct drop from Bangalore to your destination with no return charges for select routes. Round Trip includes multi-day vehicle availability for local sightseeing and return journey, with driver allowance (bata) calculated based on the number of days.'
              },
              {
                q: 'Are tolls, parking, and state permits included in the quoted fare?',
                a: 'The quoted fare covers vehicle rental, fuel, and driver charges. Toll gate fees, parking slips, and inter-state border permits (for Tamil Nadu, Andhra Pradesh, Kerala) are payable at actual receipts directly during the trip.'
              },
              {
                q: 'What large-group vehicles are available for family and corporate trips?',
                a: 'We operate Force Tempo Travellers (12 & 17 seater luxury pushback), Mini Buses (25 seater), and Luxury Tourist Coaches (45 & 50 seater) equipped with air-conditioning, music systems, and luggage carriers.'
              },
              {
                q: 'Is air conditioning (AC) operational in hill station ghat roads?',
                a: 'Yes, AC is operational throughout the plains and highway journeys. In steep ghat climbs (such as Ooty Kalhatty ghats or Bababudangiri hills), AC may be intermittently paused for vehicle engine safety as per standard transport safety norms.'
              },
              {
                q: 'How and when will I receive driver and vehicle details?',
                a: 'After a driver accepts your request, their contact and vehicle details appear in your booking status. SMS and WhatsApp booking notifications are not currently available.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-black text-sm text-[#071B49] flex items-center justify-between gap-4 cursor-pointer hover:text-[#ED1735] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 shrink-0 text-[#ED1735]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. POPULAR KARNATAKA ROUTES SEO DIRECTORY GRID */}
      {/* ======================================================== */}
      <section className="py-12 bg-slate-50 border-t border-slate-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h3 className="font-black text-sm text-[#071B49] uppercase tracking-wider">
            Popular Karnataka & South India Routes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-500">
            <ul className="space-y-1.5">
              <li><button onClick={() => { setDestination('Mysuru, Karnataka'); fetchQuotes(tripType, pickup, 'Mysuru, Karnataka'); }} className="hover:text-[#ED1735] text-left">Bangalore to Mysuru Palace Cab</button></li>
              <li><button onClick={() => { setDestination('Coorg, Karnataka'); fetchQuotes(tripType, pickup, 'Coorg, Karnataka'); }} className="hover:text-[#ED1735] text-left">Bangalore to Coorg Homestays</button></li>
              <li><button onClick={() => { setDestination('Ooty, Tamil Nadu'); fetchQuotes(tripType, pickup, 'Ooty, Tamil Nadu'); }} className="hover:text-[#ED1735] text-left">Bangalore to Ooty Hill Station</button></li>
              <li><button onClick={() => { setDestination('Chikmagalur, Karnataka'); fetchQuotes(tripType, pickup, 'Chikmagalur, Karnataka'); }} className="hover:text-[#ED1735] text-left">Bangalore to Chikmagalur Coffee Tour</button></li>
            </ul>

            <ul className="space-y-1.5">
              <li><button onClick={() => { setDestination('Tirupati, Andhra Pradesh'); fetchQuotes(tripType, pickup, 'Tirupati, Andhra Pradesh'); }} className="hover:text-[#ED1735] text-left">Bangalore to Tirupati Balaji Darshan</button></li>
              <li><button onClick={() => { setDestination('Hampi, Karnataka'); fetchQuotes(tripType, pickup, 'Hampi, Karnataka'); }} className="hover:text-[#ED1735] text-left">Bangalore to Hampi Heritage Circuit</button></li>
              <li><button onClick={() => { setDestination('Wayanad, Kerala'); fetchQuotes(tripType, pickup, 'Wayanad, Kerala'); }} className="hover:text-[#ED1735] text-left">Bangalore to Wayanad Rainforest</button></li>
              <li><button onClick={() => { setDestination('Mangalore, Karnataka'); fetchQuotes(tripType, pickup, 'Mangalore, Karnataka'); }} className="hover:text-[#ED1735] text-left">Bangalore to Mangalore Coastal Drive</button></li>
            </ul>

            <ul className="space-y-1.5">
              <li><span className="font-bold text-slate-700">Tempo Traveller Rentals:</span></li>
              <li>Bangalore to Coorg 12-Seater Tempo</li>
              <li>Bangalore to Ooty 17-Seater Luxury Tempo</li>
              <li>Bangalore to Tirupati Group Pilgrim Tempo</li>
              <li>Corporate IT Shuttle Tempo Bangalore</li>
            </ul>

            <ul className="space-y-1.5">
              <li><span className="font-bold text-slate-700">Airport & Corporate Fleet:</span></li>
              <li>Bangalore Airport Pickups T1 & T2</li>
              <li>Whitefield IT Park Staff Shuttles</li>
              <li>Electronic City Employee Commute</li>
              <li>Wedding Convoy Rentals Bengaluru</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. CORPORATE ENTERPRISE FOOTER */}
      {/* ======================================================== */}
      <footer className="bg-[#051336] text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
            
            {/* Column 1: Brand & Credentials */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-lg">
                  <img src="/sjt_logo.png" alt="SJT Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight text-white leading-tight">
                    SJT TOURS & TRAVELS
                  </h3>
                  <span className="text-[10px] font-bold text-[#ED1735] tracking-widest uppercase block">
                    PVT. LTD. • BENGALURU
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Karnataka Tourism Approved Commercial Passenger Transport Operator. Operating verified yellow-board commercial sedans, Innova Crystas, Tempo Travellers, and luxury coaches.
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Commercial RTO Fleet</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>GSTIN: <strong className="font-mono text-white">29AAGCS9482F1Z8</strong></span>
                </div>
              </div>
            </div>

            {/* Column 2: Popular Outstation Routes */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-[#ED1735] pl-2.5">
                Popular Outstation Routes
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#booking-form" className="hover:text-white transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-[#ED1735]" /> Bangalore to Mysuru Palace</a></li>
                <li><a href="#booking-form" className="hover:text-white transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-[#ED1735]" /> Bangalore to Coorg Homestays</a></li>
                <li><a href="#booking-form" className="hover:text-white transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-[#ED1735]" /> Bangalore to Ooty Hill Station</a></li>
                <li><a href="#booking-form" className="hover:text-white transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-[#ED1735]" /> Bangalore to Chikmagalur Estates</a></li>
                <li><a href="#booking-form" className="hover:text-white transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-[#ED1735]" /> Bangalore to Tirupati Balaji Darshan</a></li>
                <li><a href="#booking-form" className="hover:text-white transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-[#ED1735]" /> Kempegowda Airport Transfers (T1/T2)</a></li>
              </ul>
            </div>

            {/* Column 3: Fleet Portfolio */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2.5">
                Commercial Fleet Rates
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex justify-between items-center pb-1 border-b border-slate-800">
                  <span>Toyota Etios / Dzire (4+1)</span>
                  <span className="font-mono text-emerald-400 font-bold">₹12 / km</span>
                </li>
                <li className="flex justify-between items-center pb-1 border-b border-slate-800">
                  <span>Maruti Ertiga (6+1)</span>
                  <span className="font-mono text-emerald-400 font-bold">₹14 / km</span>
                </li>
                <li className="flex justify-between items-center pb-1 border-b border-slate-800">
                  <span>Innova Crysta (7+1)</span>
                  <span className="font-mono text-emerald-400 font-bold">₹17 / km</span>
                </li>
                <li className="flex justify-between items-center pb-1 border-b border-slate-800">
                  <span>Tempo Traveller (12 Seater)</span>
                  <span className="font-mono text-emerald-400 font-bold">₹24 / km</span>
                </li>
                <li className="flex justify-between items-center pb-1 border-b border-slate-800">
                  <span>Tempo Traveller (17 Seater)</span>
                  <span className="font-mono text-emerald-400 font-bold">₹28 / km</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Luxury Tourist Bus (45 Seater)</span>
                  <span className="font-mono text-emerald-400 font-bold">₹42 / km</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Central Dispatch Hotline */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2.5">
                24x7 Central Dispatch
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Emergency Booking Line</span>
                  <a href="tel:+919900975920" className="text-base font-black text-white font-mono flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                    <PhoneCall className="w-4 h-4 text-[#ED1735]" />
                    +91 99009 75920
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Inquiries</span>
                  <a href="mailto:sjttravels2025@gmail.com" className="text-white font-mono hover:underline">
                    sjttravels2025@gmail.com
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Head Office Address</span>
                  <p className="text-slate-300">
                    #142, 5th Main, Outer Ring Road, Near Silk Board, Bengaluru - 560068, Karnataka
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2026 <strong>SJT Tours & Travels Pvt. Ltd.</strong> All rights reserved. Commercial Road Passenger Transport Division.</p>
            <div className="flex gap-4">
              <span>RTO Yellow Board Approved</span>
              <span>•</span>
              <span>Commercial Passenger Insurance</span>
              <span>•</span>
              <span>GST Registered</span>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Contact Button */}
      <a
        href="https://wa.me/919900975920?text=Hello%20SJT%20Tours%20and%20Travels,%20I%20would%20like%20to%20book%20a%20cab"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 animate-bounce cursor-pointer"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* ======================================================== */}
      {/* LIVE CAB & LOCATION TRACKING MODAL */}
      {/* ======================================================== */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
                  <Navigation className="w-5 h-5 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071B49]">Live Ride & Location Tracking</h3>
                  <p className="text-[11px] text-slate-500">Track chauffeur status, cab location and ride details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setTrackingModalOpen(false); setTrackingResult(null); setTrackingError(''); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tracking Search Form */}
            <form onSubmit={handleTrackBooking} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Booking Reference Code or Phone
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingInputCode}
                    onChange={e => setTrackingInputCode(e.target.value)}
                    placeholder="e.g. SJT-654321 or 9900975920"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{trackingLoading ? 'Checking…' : 'Track'}</span>
                  </button>
                </div>
              </div>

              {trackingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{trackingError}</span>
                </div>
              )}
            </form>

            {/* Tracking Result View */}
            {trackingResult && (
              <div className="mt-5 space-y-4 pt-4 border-t border-slate-100">
                {/* Status Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Ref: <strong className="text-slate-900">{trackingResult.booking_code}</strong>
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 ${
                    trackingResult.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : trackingResult.status === 'IN_PROGRESS' || trackingResult.status === 'ASSIGNED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                    {trackingResult.status === 'CONFIRMED' ? 'Awaiting Driver Acceptance' : trackingResult.status}
                  </span>
                </div>

                {trackingResult.admin_message && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-black text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>SJT Operations Dispatch Notice</span>
                    </div>
                    <p className="text-slate-800 font-medium bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      "{trackingResult.admin_message}"
                    </p>
                  </div>
                )}

                {/* Driver & Cab Details */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Chauffeur & Vehicle</span>
                  {trackingResult.assigned_driver_name ? (
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                          {trackingResult.assigned_driver_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-xs font-black text-slate-900 block">{trackingResult.assigned_driver_name}</strong>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {trackingResult.vehicle_name || 'Commercial Fleet'} • {trackingResult.vehicle_reg || 'KA Commercial'}
                          </span>
                        </div>
                      </div>
                      {trackingResult.assigned_driver_phone && (
                        <a
                          href={`tel:${trackingResult.assigned_driver_phone}`}
                          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                          title="Call Driver"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
                      Dispatching to nearest commercial verified captain in Karnataka...
                    </div>
                  )}
                </div>

                {/* Route & Google Maps Link */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                      <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#ED1735] shrink-0" />
                        {trackingResult.pickup}
                      </strong>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trackingResult.pickup)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Navigation className="w-3 h-3 text-blue-600" />
                      Google Maps
                    </a>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Drop Destination</span>
                    <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {trackingResult.destination}
                    </strong>
                  </div>

                  {/* 4-Digit Passenger Start OTP Card (Rapido Style) */}
                  {trackingResult.start_otp && trackingResult.status === 'ASSIGNED' && (
                    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 rounded-2xl p-3.5 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                          <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider">
                            Start Ride OTP (Rapido Style)
                          </span>
                        </div>
                        <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                          Tell Captain upon arrival
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <p className="text-[11px] text-slate-700 font-medium">
                          Share this 4-digit PIN with driver to start ride:
                        </p>
                        <div className="flex items-center gap-1 font-mono">
                          {String(trackingResult.start_otp).padStart(4, '0').slice(0, 4).split('').map((d: string, i: number) => (
                            <span key={i} className="w-8 h-10 bg-white border-2 border-amber-400 rounded-lg flex items-center justify-center shadow text-slate-900 font-mono font-black text-lg">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Ride Summary */}
                  {trackingResult.status === 'COMPLETED' && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ride Completed Successfully
                        </span>
                        <span className="text-[10px] font-black bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                          PAID IN FULL
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="bg-white p-2 rounded-lg border border-emerald-100">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Actual Run</span>
                          <strong className="text-xs font-black text-emerald-800">{trackingResult.actual_km || 0} KM</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-emerald-100">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Start Odo</span>
                          <strong className="text-xs font-mono font-black text-slate-700">{trackingResult.start_odometer || 'N/A'}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-emerald-100">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">End Odo</span>
                          <strong className="text-xs font-mono font-black text-slate-700">{trackingResult.end_odometer || 'N/A'}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Journey Schedule:</span>
                    <strong className="text-slate-800">{trackingResult.journey_date} at {trackingResult.journey_time}</strong>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Quoted Fare:</span>
                    <strong className="text-emerald-700 font-mono font-black text-sm">₹{Number(trackingResult.quoted_amount).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Payment status:</span>
                    <strong className="text-slate-800">{trackingResult.payment_status || 'PENDING'}</strong>
                  </div>
                  {trackingResult.assigned_driver_id ? (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                      Pay your assigned driver directly by cash or UPI. Outstanding: <strong>₹{Math.max(0, Number(trackingResult.balance_amount ?? (Number(trackingResult.quoted_amount) - Number(trackingResult.advance_paid || 0)))).toLocaleString('en-IN')}</strong>.
                      The app does not collect payment.
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                      No payment is due until a driver accepts this booking.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleTrackBooking()}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Refresh Live Status
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
