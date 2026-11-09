import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LocationSuggestionField } from './LocationSuggestionField';
import { FareQuote, getFareQuotes } from '../services/fareQuotes';

const localDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
import {
  MapPin,
  Calendar,
  Search,
  ArrowLeft,
  CheckCircle2,
  Wifi,
  Battery,
  Signal,
  Car,
  CreditCard,
  User as UserIcon,
  Clock,
  Phone,
  ShieldCheck,
  Check,
  ChevronRight,
  Star,
  MessageSquare,
  Bell,
  Bus,
  AlertCircle,
  Compass,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Maximize2,
  Minimize2,
  Navigation,
  Lock,
  RotateCcw,
  Radio,
  Download,
  FileText
} from 'lucide-react';

export type UserAppSlide =
  | 1  // Splash Screen
  | 2  // Onboarding
  | 3  // Login Screen
  | 4  // Sign Up Screen
  | 5  // Home Screen
  | 6  // Search / Booking Form
  | 7  // Vehicle Selection
  | 8  // Booking Details
  | 9  // Finding Captain Radar
  | 10 // Ride Accepted & Payment
  | 11 // Live Tracking Map
  | 12 // On Trip (In Transit)
  | 13 // Trip Completed & Rating
  | 14 // My Bookings
  | 15; // My Profile

const SLIDE_LABELS: Record<UserAppSlide, string> = {
  1: 'Splash Screen',
  2: 'Onboarding',
  3: 'Login Screen',
  4: 'Sign Up Screen',
  5: 'Home Screen',
  6: 'Search / Booking Form',
  7: 'Vehicle Selection',
  8: 'Booking Details',
  9: 'Finding Captain Radar',
  10: 'Ride Accepted & Payment',
  11: 'Live Tracking Map',
  12: 'On Trip (In Transit)',
  13: 'Trip Completed & Rating',
  14: 'My Bookings',
  15: 'My Profile'
};

export const CustomerMobileApp: React.FC = () => {
  const {
    vehicles,
    loading,
    bookings,
    createBooking,
    currentUser,
    login,
    register,
    logout,
    standaloneMode,
    setActiveView,
    activeTripOtp,
    generateNewTripOtp
  } = useApp();

  // Slide navigation state (1 to 14)
  const [currentSlide, setCurrentSlide] = useState<UserAppSlide>(1);
  const [bezelMode, setBezelMode] = useState<boolean>(true);
  const [showSlidePicker, setShowSlidePicker] = useState<boolean>(false);

  // Form & Booking Flow State
  const [tripType, setTripType] = useState<'POINT_TO_POINT' | 'LOCAL' | 'AIRPORT' | 'OUTSTATION' | 'ROUND_TRIP'>('POINT_TO_POINT');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [liveLocationLoading, setLiveLocationLoading] = useState(false);
  const [pickupGoogleMapsUrl, setPickupGoogleMapsUrl] = useState('');
  const [journeyDate, setJourneyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [passengers, setPassengers] = useState<number>(3);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('ALL');
  const [vehicleSearchError, setVehicleSearchError] = useState('');
  const [fareQuotes, setFareQuotes] = useState<Record<string, FareQuote>>({});
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [routeDistanceRange, setRouteDistanceRange] = useState<string | null>(null);
  const [routeDurationText, setRouteDurationText] = useState<string | null>(null);
  const [routeVia, setRouteVia] = useState<string | null>(null);
  const [quotingFare, setQuotingFare] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('Outstanding ride! The Tempo Traveller was clean, driver Ramesh Kumar was punctual and courteous.');

  // Live Location Detection via Device GPS
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported on this device.');
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

        setFromCity(locationName);
        setLiveLocationLoading(false);
        setFareQuotes({});
      },
      (err) => {
        setLiveLocationLoading(false);
        alert(`Could not fetch live location: ${err.message}. Please select your pickup area in Karnataka from the list.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Login & Sign Up Forms
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [customerAuthLoading, setCustomerAuthLoading] = useState(false);
  const [customerAuthError, setCustomerAuthError] = useState('');

  // Active / Selected booking details
  const [activeBookingId, setActiveBookingId] = useState('');
  const [activeBookingData, setActiveBookingData] = useState<any>(null);
  const [bookingDispatch, setBookingDispatch] = useState<{ available_driver_count: number; status: 'OFFERED_TO_DRIVERS' | 'NO_DRIVER_AVAILABLE' | 'CHECK_FAILED' } | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [bookingAmount, setBookingAmount] = useState(5500);
  const [selectedVehicleName, setSelectedVehicleName] = useState('Tempo Traveller (17 Seater)');
  const [selectedVehicleImage, setSelectedVehicleImage] = useState('/tempo17.jpg');
  const [bookingsTab, setBookingsTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');

  // Live Map Simulation State
  const [driverEtaMins, setDriverEtaMins] = useState(5);
  const [carProgress, setCarProgress] = useState(35); // 0 to 100%

  const appVehicles = vehicles.map(vehicle => {
    const name = vehicle.name || '';
    const normalized = `${name} ${vehicle.category || ''}`.toLowerCase();
    const seats = Number(vehicle.seats || 0);
    const isSedan = seats <= 4 || /sedan|etios|dzire/.test(normalized);
    const isErtiga = /ertiga/.test(normalized) || seats === 6;
    const isHycross = /hycross/.test(normalized);
    const isInnova = /innova/.test(normalized) || seats === 7;
    const cityPerKmRate = isSedan ? 12 : isErtiga ? 15 : isHycross ? 22 : isInnova ? 18 : 24;

    const category = isSedan ? 'SEDAN'
      : /mini.?bus/.test(normalized) ? 'MINI_BUS'
      : /tempo/.test(normalized) ? 'TEMPO'
      : /\bbus\b/.test(normalized) ? 'BUS'
      : /innova|ertiga|hycross|suv|mpv/.test(normalized) ? 'SUV'
      : 'CAR';

    const quoteFare = fareQuotes[String(vehicle.id || vehicle._id || name)]?.fare;
    const fallbackCityFare = routeDistanceKm ? Math.max(150, Math.round(routeDistanceKm * cityPerKmRate)) : (isSedan ? 350 : 550);
    const fare = quoteFare || (tripType === 'POINT_TO_POINT' ? fallbackCityFare : (Number(vehicle.ratePerDay) || 2400));

    return {
      id: vehicle.id || vehicle._id || name,
      name,
      subtitle: `${vehicle.seats} Seater`,
      fare,
      image: vehicle.image || '/etios.jpg',
      category,
      seats,
      cityPerKmRate,
      status: vehicle.status
    };
  });

  const filteredAppVehicles = appVehicles.filter(vehicle => {
    const seats = Number(vehicle.seats);
    const isAvailable = !vehicle.status || vehicle.status === 'AVAILABLE';
    if (!isAvailable) return false;

    // In City Ride (POINT_TO_POINT), strictly restrict to 4-seater Sedan and 6/7-seater SUV
    if (tripType === 'POINT_TO_POINT') {
      const isSedan = seats <= 4 || vehicle.category === 'SEDAN';
      const isSuv = (seats >= 5 && seats <= 7) || vehicle.category === 'SUV';
      if (!isSedan && !isSuv) return false;

      if (selectedVehicleType === 'SEDAN') return isSedan;
      if (selectedVehicleType === 'SUV') return isSuv;
      if (passengers <= 4) return isSedan;
      return isSuv;
    }

    // If user explicitly picked a specific vehicle type filter:
    if (selectedVehicleType === 'SEDAN') return seats <= 4 || vehicle.category === 'SEDAN';
    if (selectedVehicleType === 'SUV') return (seats >= 6 && seats <= 7) || vehicle.category === 'SUV';
    if (selectedVehicleType === 'TEMPO') return (seats >= 9 && seats <= 17) || vehicle.category === 'TEMPO';
    if (selectedVehicleType === 'MINI_BUS') return (seats >= 18 && seats <= 25) || vehicle.category === 'MINI_BUS';
    if (selectedVehicleType === 'BUS') return seats > 25 || vehicle.category === 'BUS';

    // If 'ALL' ("Any vehicle that fits"): show strictly the related seater vehicles matching requested passengers:
    if (passengers <= 4) return seats <= 4;
    if (passengers <= 6) return seats >= 5 && seats <= 6;
    if (passengers <= 7) return seats === 7;
    if (passengers <= 12) return seats >= 8 && seats <= 12;
    if (passengers <= 17) return seats >= 13 && seats <= 17;
    if (passengers <= 25) return seats >= 18 && seats <= 25;
    return seats > 25;
  });

  const activeBooking = activeBookingData || bookings.find((item: any) => item.booking_code === activeBookingId || item.bookingCode === activeBookingId);

  // Poll for driver assignment from the tracking API
  useEffect(() => {
    if (currentSlide === 9 && activeBookingId) {
      const pollTimer = setInterval(async () => {
        try {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${apiBase}/api/bookings/track/${activeBookingId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.assigned_driver_id) {
              setActiveBookingData(data);
              setCurrentSlide(10);
            } else if (data.admin_message !== activeBookingData?.admin_message || data.status !== activeBookingData?.status) {
              setActiveBookingData(data);
            }
          }
        } catch (e) {
          console.error('Mobile poll error:', e);
        }
      }, 2000);
      return () => clearInterval(pollTimer);
    }
  }, [currentSlide, activeBookingId]);

  // Restore active customer booking on mount or app reload
  useEffect(() => {
    const savedId = localStorage.getItem('sjt_customer_active_booking_id');
    if (savedId && !activeBookingId) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      fetch(`${apiBase}/api/bookings/track/${encodeURIComponent(savedId)}`)
        .then(r => r.json())
        .then(d => {
          if (d && d.booking_code && !d.error && d.status !== 'CANCELLED') {
            setActiveBookingId(d.booking_code);
            setActiveBookingData(d);
            if (d.status === 'COMPLETED') {
              setCurrentSlide(13);
            } else if (d.status === 'IN_PROGRESS' || d.status === 'ON_TRIP') {
              setCurrentSlide(12);
            } else if (d.assigned_driver_id) {
              setCurrentSlide(10);
            } else {
              setCurrentSlide(9);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  // Auto-animate tracking car on slide 11 (Live Tracking) and slide 12 (On Trip)
  useEffect(() => {
    if (currentSlide === 11) {
      const interval = setInterval(() => {
        setCarProgress(prev => (prev >= 85 ? 25 : prev + 4));
        setDriverEtaMins(prev => (prev <= 1 ? 4 : Number((prev - 0.2).toFixed(1))));
      }, 1200);
      return () => clearInterval(interval);
    } else if (currentSlide === 12) {
      const interval = setInterval(() => {
        setCarProgress(prev => (prev >= 90 ? 20 : prev + 2));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSlide]);

  const handleSelectVehicle = (veh: typeof appVehicles[0]) => {
    setSelectedVehicleName(`${veh.name} (${veh.subtitle})`);
    setBookingAmount(veh.fare);
    setSelectedVehicleImage(veh.image);
    setSelectedVehicleId(String(veh.id));
    setCurrentSlide(8); // Proceed to Booking Details
  };

  const handleSearchVehicles = async () => {
    if (!fromCity.trim() || !toCity.trim()) {
      setVehicleSearchError('Enter both a pickup location and destination to search.');
      return;
    }
    if (fromCity.trim().toLocaleLowerCase() === toCity.trim().toLocaleLowerCase()) {
      setVehicleSearchError('Pickup and destination must be different places.');
      return;
    }
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 55) {
      setVehicleSearchError('Choose between 1 and 55 passengers to find a suitable vehicle.');
      return;
    }
    setQuotingFare(true);
    try {
      const result = await getFareQuotes({ 
        pickup: fromCity, 
        destination: toCity, 
        tripType, 
        passengers,
        journeyDate,
        returnDate: tripType === 'ROUND_TRIP' ? returnDate : undefined
      });
      setFareQuotes(Object.fromEntries(result.quotes.map(quote => [String(quote.vehicle_id), quote])));
      setRouteDistanceKm(result.distance_km);
      setRouteDistanceRange(result.distance_range || null);
      setRouteDurationText(result.duration_text || null);
      setRouteVia(result.route_via || null);
      if (!result.quotes.length) {
        setVehicleSearchError('No available vehicle matches this passenger count. Contact SJT for help.');
        return;
      }
      setVehicleSearchError('');
      setCurrentSlide(7);
    } catch (error) {
      setVehicleSearchError(error instanceof Error ? error.message : 'Could not calculate this route fare.');
    } finally {
      setQuotingFare(false);
    }
  };

  const handleCustomerAppLogin = async () => {
    setCustomerAuthError('');
    if (!loginId.trim() || !loginPassword) {
      setCustomerAuthError('Enter your customer email and password to sign in.');
      return;
    }
    setCustomerAuthLoading(true);
    try {
      await login(loginId.trim(), loginPassword, 'CUSTOMER', 'CUSTOMER_MOBILE');
      setCurrentSlide(selectedVehicleId ? 8 : 5);
    } catch (error) {
      setCustomerAuthError(error instanceof Error ? error.message : 'Sign-in failed. Please try again.');
    } finally {
      setCustomerAuthLoading(false);
    }
  };

  const handleCustomerAppRegistration = async () => {
    setCustomerAuthError('');
    if (!signUpName.trim() || !signUpPhone.trim() || !signUpEmail.trim() || !signUpPassword) {
      setCustomerAuthError('Enter your name, phone, email, and password to create your account.');
      return;
    }
    if (signUpPassword.length < 8) {
      setCustomerAuthError('Choose a password with at least 8 characters.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setCustomerAuthError('The passwords do not match.');
      return;
    }
    setCustomerAuthLoading(true);
    try {
      await register({ email: signUpEmail.trim(), password: signUpPassword, name: signUpName.trim(), phone: signUpPhone.trim(), role: 'CUSTOMER' }, 'CUSTOMER_MOBILE');
      setCurrentSlide(selectedVehicleId ? 8 : 5);
    } catch (error) {
      setCustomerAuthError(error instanceof Error ? error.message : 'Account creation failed. Please try again.');
    } finally {
      setCustomerAuthLoading(false);
    }
  };

  const handleRequestRide = async () => {
    if (currentUser?.role !== 'CUSTOMER') {
      setCustomerAuthError('Sign in or create a customer account before requesting a ride.');
      setCurrentSlide(3);
      return;
    }

    let bookingCode = '';
    const custName = currentUser.name;
    const custPhone = currentUser.phone;
    const custEmail = currentUser.email;

    const mapsLink = pickupGoogleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fromCity.trim())}`;
    const enrichedNotes = specialRequests.trim()
      ? `${specialRequests.trim()} | 📍 Driver Google Maps: ${mapsLink}`
      : `📍 Driver Google Maps: ${mapsLink}`;

    try {
      const created = await createBooking({
        customerName: custName,
        customerPhone: custPhone,
        customerEmail: custEmail,
        tripType,
        pickup: fromCity,
        destination: toCity,
        journeyDate,
        returnDate: tripType === 'ROUND_TRIP' ? returnDate : undefined,
        vehicleId: selectedVehicleId,
        vehicleName: selectedVehicleName,
        passengers: passengers,
        quotedAmount: bookingAmount,
        notes: enrichedNotes
      });
      if (created?.booking_code || (created as any)?.bookingCode) {
        bookingCode = created.booking_code || (created as any)?.bookingCode;
        setActiveBookingId(bookingCode);
        setActiveBookingData(created);
        localStorage.setItem('sjt_customer_active_booking_id', bookingCode);
        setBookingDispatch((created as any).dispatch || { available_driver_count: 3, status: 'OFFERED_TO_DRIVERS' });
        generateNewTripOtp();
      }
    } catch (e) {
      console.error('Booking could not be created:', e);
      alert('We could not save your booking. Please check your connection and try again.');
      return;
    }

    if (!bookingCode) {
      alert('We could not confirm your booking. Please try again.');
      return;
    }
    setCurrentSlide(9);
  };

  const handleSimulateCaptainAccept = async () => {
    if (!activeBookingId) return;
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/bookings/simulate-driver-accept/${activeBookingId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        setActiveBookingData(data.booking);
        setCurrentSlide(10);
      }
    } catch (e) {
      console.error('Simulate error:', e);
    }
  };

  return (
    <div className="py-6 px-3 min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start font-sans">
      {/* Top Header & Slide Quick Switcher */}
      <div className="w-full max-w-5xl mb-4 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  Interactive Prototype • 15 Screens
                </span>
                <span className="text-xs text-slate-400 font-medium">Ola / Uber Style High-Performance UI</span>
              </div>
              <h1 className="text-lg font-black text-white">
                SJT Customer App Prototype Walkthrough
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveView('CUSTOMER_WEB')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-900/50 hover:bg-blue-800 text-blue-200 transition-colors flex items-center gap-1 border border-blue-700/50 cursor-pointer"
            >
              🌐 Website
            </button>
            <button
              onClick={() => setActiveView('DRIVER_APP')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 transition-colors flex items-center gap-1 border border-emerald-700/50 cursor-pointer"
            >
              🚗 Driver App
            </button>
            <button
              onClick={() => setActiveView('ADMIN_PANEL')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-900/50 hover:bg-purple-800 text-purple-200 transition-colors flex items-center gap-1 border border-purple-700/50 cursor-pointer"
            >
              🏢 Admin ERP
            </button>
            <button
              onClick={() => setBezelMode(!bezelMode)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-600 cursor-pointer"
            >
              {bezelMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              <span>{bezelMode ? 'Full Width' : 'Phone Frame'}</span>
            </button>
          </div>
        </div>

        <p className="mb-4 w-full max-w-5xl rounded-xl border border-amber-400/30 bg-amber-950/40 px-4 py-3 text-xs leading-relaxed text-amber-100">
          This browser walkthrough uses sample data for driver arrival, map movement, ride OTP, trip completion, ratings, and invoices. Those screens are not connected to live tracking or dispatch.
        </p>

          {/* Demo screen selector (showcase mode only) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Active Screen: <strong className="text-white">Slide {currentSlide}: {SLIDE_LABELS[currentSlide]}</strong>
              </span>
              <span className="text-[11px] text-blue-300">
                Click any slide number below to inspect each wireframe page directly
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-700">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as UserAppSlide[]).map((slide) => (
                <button
                  key={slide}
                  onClick={() => setCurrentSlide(slide)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${currentSlide === slide
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 scale-105'
                      : 'bg-slate-800/90 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                    {slide}
                  </span>
                  <span className="hidden sm:inline">{SLIDE_LABELS[slide].split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Main Mobile Device Container */}
      <div
        className={`transition-all duration-300 w-full ${bezelMode ? 'max-w-[420px]' : 'max-w-2xl'
          }`}
      >
        <div className="relative bg-black rounded-[46px] p-3 shadow-2xl border-4 border-slate-700 shadow-blue-950/40">
          {/* Top Dynamic Island / Speaker Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
            <div className="w-2 h-2 rounded-full bg-blue-950/80"></div>
          </div>

          {/* Screen Content Wrapper */}
          <div className="bg-[#F8FAFC] text-slate-900 rounded-[38px] overflow-hidden min-h-[720px] max-h-[820px] flex flex-col relative shadow-inner select-none font-sans">
            {/* Status Bar */}
            <div className="bg-transparent px-6 pt-3 pb-1 flex items-center justify-between text-xs text-slate-700 font-semibold z-40 select-none">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* ============================================================ */}
            {/* SLIDE 1: SPLASH SCREEN */}
            {/* ============================================================ */}
            {currentSlide === 1 && (
              <div className="relative isolate flex-1 overflow-hidden bg-[#071B49] animate-sjt-entry">
                <img
                  src="/sjt-promo-poster.jpg"
                  alt="SJT Tours & Travels — Your Journey, Our Responsibility"
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#071B49]/5 via-transparent to-[#071B49]/80" />
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 p-5 pb-10 text-center animate-sjt-entry">
                  <span className="rounded-full border border-white/25 bg-[#071B49]/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    Bengaluru • Karnataka • Beyond
                  </span>
                  <button
                    onClick={() => setCurrentSlide(2)}
                    className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#ED1735] px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-950/25 transition hover:bg-red-700 active:scale-[0.98]"
                  >
                    <span>Explore SJT Travels</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => setCurrentSlide(3)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-white underline decoration-white/60 underline-offset-4 hover:text-blue-100">
                    Customer sign in
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 2: ONBOARDING */}
            {/* ============================================================ */}
            {currentSlide === 2 && (
              <div className="flex-1 flex flex-col justify-between p-6 bg-white">
                <div className="flex items-center justify-between">
                  <button onClick={() => setCurrentSlide(1)} className="p-1 rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <button onClick={() => setCurrentSlide(5)} className="text-xs font-bold text-blue-600 hover:underline">
                    Skip
                  </button>
                </div>

                <div className="space-y-4 my-auto">
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100 animate-sjt-entry">
                    <img
                      src="/etios.jpg"
                      alt="SJT sedan ready for your journey"
                      className="w-full h-52 object-cover object-center"
                    />
                  </div>

                  <div className="text-center space-y-2 pt-2">
                    <h2 className="text-2xl font-black text-[#071B49] leading-tight">
                      Your ride, your way.
                    </h2>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Choose a clean sedan, family car, or a larger SJT vehicle for travel across Karnataka and beyond.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pb-2">
                  <button
                    onClick={() => setCurrentSlide(3)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#0066FF] hover:bg-blue-600 active:scale-98 text-white font-black text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Sign in or create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCurrentSlide(5)} className="w-full rounded-xl py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                    Continue without signing in
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 3: LOGIN SCREEN */}
            {/* ============================================================ */}
            {currentSlide === 3 && (
              <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto">
                <button onClick={() => setCurrentSlide(2)} className="p-1 rounded-full hover:bg-slate-100 self-start">
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>

                <div className="my-auto space-y-5">
                  <div className="flex flex-col items-center text-center">
                    <img src="/sjt_logo.png" alt="SJT Logo" className="h-14 object-contain mb-2" />
                    <h2 className="text-xl font-black text-[#071B49]">Welcome Back</h2>
                    <p className="text-xs text-slate-500">Sign in to your SJT customer account</p>
                  </div>

                  {customerAuthError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{customerAuthError}</p>}

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Email address</label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          autoComplete="email"
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">Use the email address registered to your customer account.</p>

                    <button
                      type="button"
                      onClick={handleCustomerAppLogin}
                      disabled={customerAuthLoading}
                      className="w-full py-3 px-4 rounded-xl bg-[#0066FF] hover:bg-blue-600 disabled:opacity-60 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all"
                    >
                      {customerAuthLoading ? 'Signing in…' : 'Sign in'}
                    </button>
                  </div>

                  <div className="text-center text-xs text-slate-500">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setCurrentSlide(4)}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 4: SIGN UP SCREEN */}
            {/* ============================================================ */}
            {currentSlide === 4 && (
              <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto">
                <button onClick={() => setCurrentSlide(3)} className="p-1 rounded-full hover:bg-slate-100 self-start">
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>

                <div className="my-auto space-y-4">
                  <div className="text-center">
                    <img src="/sjt_logo.png" alt="SJT Logo" className="h-12 object-contain mx-auto mb-1.5" />
                    <h2 className="text-xl font-black text-[#071B49]">Create Your Account</h2>
                    <p className="text-xs text-slate-500">Create your SJT customer account</p>
                  </div>

                  {customerAuthError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{customerAuthError}</p>}

                  <div className="space-y-2.5">
                    <div>
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={signUpPhone}
                        onChange={(e) => setSignUpPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Create password (8+ characters)"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCustomerAppRegistration}
                      disabled={customerAuthLoading}
                      className="w-full py-3 px-4 rounded-xl bg-[#0066FF] hover:bg-blue-600 disabled:opacity-60 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all mt-1"
                    >
                      {customerAuthLoading ? 'Creating account…' : 'Create customer account'}
                    </button>
                  </div>

                  <div className="text-center text-xs text-slate-500">
                    Already have an account?{' '}
                    <button
                      onClick={() => setCurrentSlide(3)}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 5: HOME SCREEN */}
            {/* ============================================================ */}
            {currentSlide === 5 && (
              <div className="flex-1 flex flex-col justify-between bg-white overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 pt-3 pb-2 backdrop-blur-md animate-sjt-entry">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
                      <img src="/sjt_logo.png" alt="SJT Cabs logo" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <span className="block text-[15px] font-black leading-none tracking-tight text-[#071B49]">SJT Cabs</span>
                      <span className="mt-1 block text-[10px] font-semibold text-slate-400">Bengaluru, Karnataka</span>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200">
                      <Bell className="w-4 h-4" />
                    </button>
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Promo Banner */}
                  <button
                    type="button"
                    onClick={() => setCurrentSlide(6)}
                    className="group flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-[#071B49] to-[#1646A0] p-3.5 text-left text-white shadow-lg shadow-blue-950/15 transition hover:shadow-xl animate-sjt-entry"
                  >
                    <span className="min-w-0 flex-1 space-y-1.5">
                      <span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-200">SJT • Karnataka & beyond</span>
                      <span className="block text-sm font-black leading-snug">Your ride,<br />your way.</span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#ED1735] px-3 py-1.5 text-[10px] font-extrabold shadow-sm group-hover:bg-red-600">
                        Book a ride <ArrowRight className="h-3 w-3" />
                      </span>
                    </span>
                    <span className="relative h-28 w-[42%] shrink-0 overflow-hidden rounded-xl bg-white/10">
                      <img src="/etios.jpg" alt="SJT sedan" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute bottom-1.5 left-1.5 rounded-md bg-[#071B49]/85 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-white">Sedan • 4 seats</span>
                    </span>
                  </button>

                  {/* Vehicle Categories */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Vehicle Categories</span>
                      <span className="text-[11px] text-blue-600 font-bold">See All</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Sedan', icon: <Car className="w-5 h-5 text-blue-600" /> },
                        { label: 'Mini Bus', icon: <Car className="w-5 h-5 text-indigo-600" /> },
                        { label: 'Tempo Traveller', icon: <Bus className="w-5 h-5 text-emerald-600" /> },
                        { label: 'Car', icon: <Car className="w-5 h-5 text-rose-600" /> }
                      ].map((cat, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setSelectedVehicleType(cat.label === 'Mini Bus' ? 'MINI_BUS' : cat.label === 'Tempo Traveller' ? 'TEMPO' : cat.label === 'Sedan' ? 'SEDAN' : 'CAR');
                            setCurrentSlide(6);
                          }}
                          className="bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                            {cat.icon}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 leading-tight">
                            {cat.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Services */}
                  <div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide block mb-2">
                      Popular Services
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { title: 'Outstation Trips', desc: 'Mysuru, Coorg, Ooty & More', img: '/tempo17.jpg' },
                        { title: 'Airport Transfers', desc: 'On-time Kempegowda Drop', img: '/etios.jpg' },
                        { title: 'Corporate Travel', desc: 'IT Park & Office Shuttles', img: '/minibus.jpg' },
                        { title: 'Pilgrimage Tours', desc: 'Tirupati, Dharmasthala', img: '/tempo.jpg' }
                      ].map((serv, i) => (
                        <div
                          key={i}
                          onClick={() => setCurrentSlide(6)}
                          className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded-2xl border border-slate-200 flex items-center gap-2.5 cursor-pointer active:scale-98 transition-all"
                        >
                          <img src={serv.img} alt={serv.title} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                          <div className="overflow-hidden">
                            <span className="text-[11px] font-black text-slate-800 block truncate">{serv.title}</span>
                            <span className="text-[9px] text-slate-500 block truncate">{serv.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom App Navigation */}
                <div className="sticky bottom-0 z-20 flex items-center justify-around border-t border-slate-200/80 bg-white/95 px-5 pt-2.5 pb-3 text-slate-500 shadow-[0_-10px_30px_rgba(7,27,73,0.06)] backdrop-blur-md animate-sjt-entry">
                  <button onClick={() => setCurrentSlide(5)} className="group flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-3 py-1 text-blue-600 transition-all duration-300 active:scale-90">
                    <Compass className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    <span className="text-[9px] font-bold">Home</span>
                  </button>
                  <button onClick={() => setCurrentSlide(14)} className="group flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-3 py-1 transition-all duration-300 hover:text-blue-600 active:scale-90">
                    <Calendar className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    <span className="text-[9px] font-semibold">Bookings</span>
                  </button>
                  <button onClick={() => setCurrentSlide(15)} className="group flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-3 py-1 transition-all duration-300 hover:text-blue-600 active:scale-90">
                    <UserIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    <span className="text-[9px] font-semibold">Profile</span>
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 6: SEARCH / BOOKING FORM */}
            {/* ============================================================ */}
            {currentSlide === 6 && (
              <div className="flex-1 flex flex-col justify-between p-5 bg-white overflow-y-auto">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentSlide(5)} className="p-1 rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h2 className="text-base font-black text-[#071B49]">Book Your Ride</h2>
                </div>

                <div className="my-auto space-y-4">
                  {/* Trip Type Segmented Toggle */}
                  <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => { setTripType('POINT_TO_POINT'); setFareQuotes({}); }}
                      className={`flex-1 min-w-[90px] py-2 px-2 text-center rounded-lg transition-all ${tripType === 'POINT_TO_POINT' ? 'bg-[#0066FF] text-white shadow-sm font-black' : 'text-slate-600'}`}
                    >
                      City Ride
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTripType('LOCAL'); setFareQuotes({}); }}
                      className={`flex-1 min-w-[80px] py-2 px-2 text-center rounded-lg transition-all ${tripType === 'LOCAL' ? 'bg-[#0066FF] text-white shadow-sm' : 'text-slate-600'}`}
                    >
                      Local (8hr)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTripType('AIRPORT'); setFareQuotes({}); }}
                      className={`flex-1 min-w-[65px] py-2 px-2 text-center rounded-lg transition-all ${tripType === 'AIRPORT' ? 'bg-[#0066FF] text-white shadow-sm' : 'text-slate-600'}`}
                    >
                      Airport
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTripType('OUTSTATION'); setFareQuotes({}); }}
                      className={`flex-1 min-w-[75px] py-2 px-2 text-center rounded-lg transition-all ${tripType === 'OUTSTATION' ? 'bg-[#0066FF] text-white shadow-sm' : 'text-slate-600'}`}
                    >
                      Outstation
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTripType('ROUND_TRIP'); setFareQuotes({}); }}
                      className={`flex-1 min-w-[80px] py-2 px-2 text-center rounded-lg transition-all ${tripType === 'ROUND_TRIP' ? 'bg-[#0066FF] text-white shadow-sm' : 'text-slate-600'}`}
                    >
                      Round Trip
                    </button>
                  </div>

                  {/* Origin & Destination Inputs */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          From Pickup Location
                        </span>
                        <button
                          type="button"
                          onClick={handleDetectLiveLocation}
                          disabled={liveLocationLoading}
                          className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg transition-all"
                        >
                          <Navigation className={`w-3 h-3 text-emerald-600 ${liveLocationLoading ? 'animate-spin' : ''}`} />
                          <span>{liveLocationLoading ? 'Detecting…' : '📍 Use Live GPS'}</span>
                        </button>
                      </div>
                      <LocationSuggestionField
                        id="mobile-pickup-location"
                        value={fromCity}
                        onChange={(val) => {
                          setFromCity(val);
                          setFareQuotes({});
                          if (pickupGoogleMapsUrl && !val.includes('📍 Live GPS')) {
                            setPickupGoogleMapsUrl('');
                          }
                        }}
                        onUseLiveLocation={handleDetectLiveLocation}
                        isLocating={liveLocationLoading}
                        placeholder="Pickup area / airport / railway station"
                        required
                      />
                      {pickupGoogleMapsUrl && (
                        <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> GPS Pin Saved for Driver
                          </span>
                          <a
                            href={pickupGoogleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline font-bold"
                          >
                            Open Maps
                          </a>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        To Destination Location
                      </span>
                      <LocationSuggestionField
                        id="mobile-destination-location"
                        value={toCity}
                        onChange={(val) => {
                          setToCity(val);
                          setFareQuotes({});
                        }}
                        placeholder="Destination city, area, or landmark"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Journey Date
                        </span>
                        <div className="flex items-center gap-1.5 bg-white px-3 py-2.5 rounded-xl border border-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <input
                            type="date"
                            min={localDateInputValue(new Date())}
                            value={journeyDate}
                            onChange={(e) => {
                              const next = e.target.value;
                              setJourneyDate(next);
                              if (returnDate <= next) setReturnDate(next);
                            }}
                            className="w-full text-xs font-bold text-slate-800 outline-none"
                          />
                        </div>
                      </div>

                      {tripType === 'ROUND_TRIP' ? (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Return Date
                          </span>
                          <div className="flex items-center gap-1.5 bg-white px-3 py-2.5 rounded-xl border border-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <input
                              type="date"
                              min={journeyDate}
                              value={returnDate}
                              onChange={(e) => setReturnDate(e.target.value)}
                              className="w-full text-xs font-bold text-slate-800 outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Passengers
                          </span>
                          <div className="flex items-center gap-1.5 bg-white px-3 py-2.5 rounded-xl border border-slate-200">
                            <UserIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <input
                              type="number"
                              min={1}
                              max={55}
                              value={passengers}
                              onChange={(e) => { setPassengers(Number(e.target.value)); setFareQuotes({}); }}
                              className="w-full text-xs font-bold text-slate-800 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {tripType === 'ROUND_TRIP' && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Passengers
                        </span>
                        <div className="flex items-center gap-1.5 bg-white px-3 py-2.5 rounded-xl border border-slate-200">
                          <UserIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <input
                            type="number"
                            min={1}
                            max={55}
                            value={passengers}
                            onChange={(e) => { setPassengers(Number(e.target.value)); setFareQuotes({}); }}
                            className="w-full text-xs font-bold text-slate-800 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-1">
                      <label htmlFor="mobile-vehicle-type" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Vehicle type</label>
                      <select
                        id="mobile-vehicle-type"
                        value={selectedVehicleType}
                        onChange={e => setSelectedVehicleType(e.target.value)}
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        {tripType === 'POINT_TO_POINT' ? (
                          <>
                            <option value="ALL">All City Cabs (4 & 7 Seater)</option>
                            <option value="SEDAN">4-Seater Sedan (₹12/km)</option>
                            <option value="SUV">6-7 Seater SUV (₹15-₹18/km)</option>
                          </>
                        ) : (
                          <>
                            <option value="ALL">Any vehicle that fits</option>
                            <option value="SEDAN">Sedan</option>
                            <option value="SUV">SUV / MPV</option>
                            <option value="TEMPO">Tempo Traveller</option>
                            <option value="MINI_BUS">Mini bus</option>
                            <option value="BUS">Bus / mini bus</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSearchVehicles}
                    disabled={quotingFare}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#0066FF] hover:bg-blue-600 active:scale-98 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{quotingFare ? 'Calculating route fare' : 'Search Cars & Fare'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {vehicleSearchError && <p role="alert" className="text-xs font-semibold text-red-600">{vehicleSearchError}</p>}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 7: VEHICLE SELECTION */}
            {/* ============================================================ */}
            {currentSlide === 7 && (
              <div className="flex-1 flex flex-col justify-between p-4 bg-slate-50 overflow-y-auto">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setCurrentSlide(6)} className="p-1 rounded-full hover:bg-slate-200">
                      <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <div>
                      <h2 className="text-base font-black text-[#071B49]">Select Vehicle</h2>
                      <p className="text-[11px] text-slate-500">{fromCity} → {toCity} • {journeyDate}</p>
                    </div>
                  </div>

                  {/* Route Distance Banner */}
                  {(routeDistanceRange || routeDistanceKm) && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{routeDistanceRange ? `${routeDistanceRange} (${routeDistanceKm} km)` : `${routeDistanceKm} km by road`}</span>
                      </span>
                      {routeDurationText && (
                        <span className="text-slate-600 font-medium text-[11px]">⏱️ {routeDurationText}</span>
                      )}
                    </div>
                  )}

                  {/* Vehicle List Cards matching Mockup 1 */}
                  {filteredAppVehicles.length > 0 ? <div className="space-y-3">
                    {filteredAppVehicles.map((veh) => (
                      <div
                        key={veh.id}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-3"
                      >
                        <img
                          src={veh.image}
                          alt={veh.name}
                          className="w-20 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-sm text-[#071B49] leading-tight truncate">
                            {veh.name}
                          </h4>
                          <span className="text-[11px] text-slate-500 block">
                            {veh.subtitle}
                          </span>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="font-black text-sm text-blue-600 font-mono">
                              ₹{veh.fare.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {tripType === 'POINT_TO_POINT' ? `(@ ₹${veh.cityPerKmRate || (veh.seats <= 4 ? 12 : 18)}/km)` : tripType === 'LOCAL' ? '8hr/80km' : 'One Way'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectVehicle(veh)}
                          className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white text-xs font-black shadow-sm shrink-0"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div> : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                      <Car className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                      <h3 className="text-sm font-bold text-slate-800">{loading ? 'Loading available vehicles…' : 'No matching vehicles available'}</h3>
                      <p className="mt-1 text-xs text-slate-500">{loading ? 'Checking the live fleet.' : 'Try a different vehicle type or reduce the passenger count.'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 8: BOOKING DETAILS */}
            {/* ============================================================ */}
            {currentSlide === 8 && (
              <div className="flex-1 flex flex-col justify-between p-5 bg-white overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setCurrentSlide(7)} className="p-1 rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h2 className="text-base font-black text-[#071B49]">Booking Details</h2>
                </div>

                <div className="my-auto space-y-4">
                  {/* Vehicle Highlight Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <img
                      src={selectedVehicleImage}
                      alt={selectedVehicleName}
                      className="w-20 h-16 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                    <div>
                      <h4 className="font-black text-sm text-[#071B49]">{selectedVehicleName}</h4>
                      <span className="text-[11px] text-slate-500 block">Commercial Luxury Fleet</span>
                      <div className="font-black text-sm text-blue-600 font-mono mt-0.5">
                        ₹{bookingAmount.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">One Way</span>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details Checklist */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> From
                      </span>
                      <strong className="text-slate-800">{fromCity}</strong>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600" /> To
                      </span>
                      <strong className="text-slate-800">{toCity}</strong>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" /> Journey Date
                      </span>
                      <strong className="text-slate-800">{journeyDate}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-indigo-600" /> No. of Passengers
                      </span>
                      <strong className="text-slate-800">{passengers} Passengers</strong>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-blue-600" /> Distance & Route
                      </span>
                      <strong className="text-emerald-700 font-mono">
                        {routeDistanceRange ? `${routeDistanceRange} (${routeDistanceKm} km)` : (routeDistanceKm ? `${routeDistanceKm} km` : 'Route calculated')}
                      </strong>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="E.g. Pickup time, AC preferences, luggage count..."
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium resize-none"
                    />
                  </div>

                  {currentUser?.role !== 'CUSTOMER' && (
                    <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-900">
                      Sign in or create a customer account to attach this ride request to your bookings.
                    </p>
                  )}

                  <button
                    onClick={handleRequestRide}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#0066FF] hover:bg-blue-600 active:scale-98 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{currentUser?.role === 'CUSTOMER' ? 'Request Ride' : 'Sign in to request ride'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 9: FINDING CAPTAIN (RADAR) */}
            {/* ============================================================ */}
            {currentSlide === 9 && (
              <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-[#071B49] via-[#0F2864] to-[#071B49] text-white relative overflow-hidden">
                {/* Top Bar */}
                <div className="flex items-center justify-between z-10">
                  <button
                    onClick={() => setCurrentSlide(8)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1.5 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30 text-[11px] font-bold text-blue-300">
                    <span className={`w-2 h-2 rounded-full ${bookingDispatch?.status === 'OFFERED_TO_DRIVERS' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                    <span>{bookingDispatch?.status === 'OFFERED_TO_DRIVERS' ? 'Driver offer sent' : 'SJT confirmation pending'}</span>
                  </div>
                  <div className="w-7"></div>
                </div>

                {/* Radar Animation Center */}
                <div className="my-auto flex flex-col items-center justify-center relative py-6">
                  {/* Outer Concentric Animated Radar Rings */}
                  <div className="relative w-60 h-60 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping opacity-25"></div>
                    <div className="absolute inset-4 rounded-full border border-blue-400/30 animate-pulse"></div>
                    <div className="absolute inset-12 rounded-full border border-blue-300/40"></div>
                    <div className="absolute inset-20 rounded-full border border-blue-200/50 bg-blue-500/10 backdrop-blur-sm"></div>

                    {/* Radar Sweep Gradient */}
                    <div className="absolute inset-0 rounded-full border border-blue-500/30 overflow-hidden animate-spin [animation-duration:4s]">
                      <div className="w-1/2 h-1/2 bg-gradient-to-br from-blue-400/40 via-transparent to-transparent origin-bottom-right"></div>
                    </div>

                    {/* Center SJT Cab Vehicle Marker */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/50 border-2 border-white/80">
                      <Car className="w-8 h-8 text-white animate-bounce" />
                    </div>

                  </div>

                  {/* Status Text */}
                  <div className="text-center mt-5 space-y-1 z-10">
                    <h3 className="text-base font-black text-white tracking-tight">
                      {bookingDispatch?.status === 'OFFERED_TO_DRIVERS'
                        ? `Request sent to ${bookingDispatch.available_driver_count} available driver${bookingDispatch.available_driver_count === 1 ? '' : 's'}`
                        : bookingDispatch?.status === 'CHECK_FAILED'
                          ? 'Driver availability check is pending'
                          : 'No driver is online for this area right now'}
                    </h3>
                    <p className="text-xs text-blue-200 font-medium">
                      {bookingDispatch?.status === 'OFFERED_TO_DRIVERS' ? 'A driver must accept before the ride is confirmed.' : bookingDispatch?.status === 'CHECK_FAILED' ? 'We could not check driver availability. SJT will confirm shortly.' : 'Your request is saved. SJT will contact you to confirm availability.'}
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-mono font-bold text-white border border-white/20">
                        {selectedVehicleName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[11px] font-mono font-bold text-emerald-300 border border-emerald-400/30">
                        ₹{bookingAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 z-10">
                  {activeBooking?.admin_message && (
                    <div className="w-full p-3.5 rounded-2xl bg-amber-500/25 border-2 border-amber-400/60 backdrop-blur-md text-white space-y-2 animate-pulse-subtle shadow-lg">
                      <div className="flex items-center gap-2 font-black text-xs text-amber-300">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>SJT Control Room Notice</span>
                      </div>
                      <p className="text-xs font-semibold text-amber-100 bg-black/40 p-2.5 rounded-xl border border-amber-400/30">
                        "{activeBooking.admin_message}"
                      </p>
                      <a
                        href="tel:+919900975920"
                        className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call SJT Control Desk (+91 99009 75920)</span>
                      </a>
                    </div>
                  )}

                  <div className="w-full py-3 px-4 rounded-2xl bg-white/10 text-white font-bold text-xs border border-white/15 text-center">
                    {activeBooking?.assigned_driver_name || activeBooking?.assignedDriverName
                      ? `Captain ${activeBooking.assigned_driver_name || activeBooking.assignedDriverName} assigned`
                      : bookingDispatch?.status === 'OFFERED_TO_DRIVERS'
                        ? `Waiting for nearby driver to accept (${activeBookingId})`
                        : 'Waiting for SJT operations to confirm a driver'}
                  </div>

                  {import.meta.env.DEV && (
                    <>
                      {/* Simulator button for local testing only */}
                      <button
                        type="button"
                        onClick={handleSimulateCaptainAccept}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span>⚡ Simulate Captain Accept (Demo)</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setCurrentSlide(8)}
                    className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel Ride Request
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 10: RIDE ACCEPTED & PAYMENT FLOW */}
            {/* ============================================================ */}
            {currentSlide === 10 && (
              <div className="flex-1 flex flex-col justify-between p-4 bg-slate-50 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setCurrentSlide(9)} className="p-1 rounded-full hover:bg-slate-200">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ride Accepted!</span>
                  </div>
                  <div className="w-7"></div>
                </div>

                <div className="space-y-3">
                  {/* Driver Arrival ETA Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-3.5 text-white shadow-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">
                        Estimated Arrival
                      </span>
                      <h3 className="text-lg font-black leading-tight">
                        {activeBooking?.assigned_driver_name || activeBooking?.assignedDriverName ? `Driver ${activeBooking.assigned_driver_name || activeBooking.assignedDriverName} accepted` : 'Driver assignment confirmed'}
                      </h3>
                      <span className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-300" /> 1.6 km away • En route to pickup
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex flex-col items-center justify-center font-black">
                      <Clock className="w-5 h-5 text-emerald-300 animate-pulse" />
                      <span className="text-[10px] font-mono">4 MIN</span>
                    </div>
                  </div>

                  {/* Driver & Vehicle Details Card */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center text-sm border-2 border-white shadow">
                          RK
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-slate-800">Ramesh Kumar</h4>
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>4.9</span>
                            <span className="text-slate-400 font-normal">• 1,420 trips completed</span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600">
                            {selectedVehicleName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href="tel:+919876543210"
                          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => alert('Chatting with driver Ramesh Kumar')}
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center border border-blue-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500">Commercial Registration</span>
                      <strong className="font-mono text-xs text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                        KA 05 AB 1234
                      </strong>
                    </div>
                  </div>

                  {/* 4-Digit Secure Ride OTP Card (Rapido Style) */}
                  {(() => {
                    const otpDigits = String(activeBookingData?.start_otp || activeBooking?.start_otp || activeTripOtp || '4821').padEnd(4, '0').slice(0, 4);
                    return (
                      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                            <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider block">
                              Start Ride OTP (Rapido Style)
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-900 font-bold mt-0.5">
                            Tell Captain when ride starts
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-base font-black text-slate-900">
                          <span className="w-8 h-10 bg-white border-2 border-amber-400 rounded-xl flex items-center justify-center shadow-md text-slate-900 font-mono font-black text-lg">
                            {otpDigits[0]}
                          </span>
                          <span className="w-8 h-10 bg-white border-2 border-amber-400 rounded-xl flex items-center justify-center shadow-md text-slate-900 font-mono font-black text-lg">
                            {otpDigits[1]}
                          </span>
                          <span className="w-8 h-10 bg-white border-2 border-amber-400 rounded-xl flex items-center justify-center shadow-md text-slate-900 font-mono font-black text-lg">
                            {otpDigits[2]}
                          </span>
                          <span className="w-8 h-10 bg-white border-2 border-amber-400 rounded-xl flex items-center justify-center shadow-md text-slate-900 font-mono font-black text-lg">
                            {otpDigits[3]}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment option: Pay Directly to Driver */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-[#071B49] uppercase tracking-wide">
                        Fare Amount
                      </span>
                      <span className="text-sm font-black text-emerald-600 font-mono">
                        ₹{bookingAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Payment Method: Pay Directly to Driver</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Pay ₹{bookingAmount.toLocaleString('en-IN')} via Cash or UPI (GPay / PhonePe / Paytm) directly to Captain upon arrival or trip completion.
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentSlide(11)}
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Track Captain Live on Map →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 11: LIVE TRACKING MAP */}
            {/* ============================================================ */}
            {currentSlide === 11 && (
              <div className="flex-1 flex flex-col justify-between bg-slate-100 relative overflow-hidden">
                {/* Header */}
                <div className="p-3 flex items-center justify-between absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md shadow-sm">
                  <button onClick={() => setCurrentSlide(10)} className="p-1 rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <div className="text-center">
                    <h2 className="text-xs font-black text-[#071B49]">Live Driver Tracking</h2>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">En Route to Pickup</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold">
                    <span>OTP: {activeTripOtp}</span>
                  </div>
                </div>

                {/* Map Simulation Graphic */}
                <div className="flex-1 w-full relative bg-[#E2E8F0] overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid11" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid11)" />
                    {/* Simulated Approach Highway Route */}
                    <path
                      d="M 60 160 Q 140 100 200 240 T 340 420"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 60 160 Q 140 100 200 240 T 340 420"
                      fill="none"
                      stroke="#93C5FD"
                      strokeWidth="2"
                      strokeDasharray="6,6"
                    />
                  </svg>

                  {/* Floating Pill: ETA banner */}
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                    <span className="text-xs font-bold">Captain is arriving in {Math.round(driverEtaMins)} mins</span>
                  </div>

                  {/* Pickup Pin */}
                  <div className="absolute top-44 left-12 z-20 flex flex-col items-center">
                    <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow mb-1">
                      {fromCity} (Pickup)
                    </span>
                    <MapPin className="w-7 h-7 text-emerald-600 fill-emerald-600 drop-shadow" />
                  </div>

                  {/* Animated Moving Vehicle Marker */}
                  <div
                    className="absolute z-20 flex flex-col items-center transition-all duration-1000"
                    style={{
                      left: `${carProgress}%`,
                      top: `${32 + (carProgress % 18)}%`
                    }}
                  >
                    <div className="p-2 rounded-full bg-white shadow-xl border-2 border-blue-600 text-blue-600">
                      <Bus className="w-5 h-5" />
                    </div>
                    <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow mt-1">
                      KA 05 AB 1234
                    </span>
                  </div>
                </div>

                {/* Bottom Floating Card */}
                <div className="bg-white rounded-t-3xl p-4 shadow-2xl border-t border-slate-200 space-y-3 z-30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm border-2 border-white shadow">
                        RK
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-800">Ramesh Kumar</h4>
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>4.9</span>
                          <span className="text-slate-400 font-normal">• {selectedVehicleName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          KA 05 AB 1234
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="tel:+919876543210"
                        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => alert('Chat with Ramesh Kumar')}
                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Start Trip Trigger Button */}
                  <button
                    onClick={() => setCurrentSlide(12)}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Driver Arrived • Start Trip (Slide 12)</span>
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 12: ON TRIP (IN TRANSIT) */}
            {/* ============================================================ */}
            {currentSlide === 12 && (
              <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white relative overflow-hidden">
                {/* Top Trip Header */}
                <div className="p-3.5 flex items-center justify-between z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentSlide(11)} className="p-1 rounded-full hover:bg-slate-800 text-slate-300">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xs font-black text-white">Trip in Progress</h2>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {fromCity} → {toCity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="tel:+919900975920"
                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-[10px] flex items-center gap-1 shadow-lg shadow-red-600/30"
                    >
                      <span>Call SJT Support</span>
                    </a>
                  </div>
                </div>

                {/* Map Graphic Canvas */}
                <div className="flex-1 w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid12" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid12)" />
                    {/* Expressway Line */}
                    <path
                      d="M 40 380 Q 180 320 200 180 T 360 80"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 40 380 Q 180 320 200 180 T 360 80"
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="2"
                      strokeDasharray="6,6"
                    />
                  </svg>

                  {/* Destination Pin */}
                  <div className="absolute top-14 right-10 z-20 flex flex-col items-center">
                    <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow mb-1">
                      {toCity} (Drop)
                    </span>
                    <MapPin className="w-6 h-6 text-red-500 fill-red-500 drop-shadow" />
                  </div>

                  {/* Moving Vehicle */}
                  <div
                    className="absolute z-20 flex flex-col items-center transition-all duration-1000"
                    style={{
                      left: `${45 + (carProgress % 20)}%`,
                      top: `${40 + (carProgress % 15)}%`
                    }}
                  >
                    <div className="p-2 rounded-full bg-blue-600 shadow-2xl border-2 border-white text-white">
                      <Bus className="w-5 h-5" />
                    </div>
                    <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 shadow mt-1">
                      56 km/h
                    </span>
                  </div>

                  {/* Floating Telemetry Stats */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Speed</span>
                      <strong className="text-sm font-mono text-emerald-400">56 km/h</strong>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Remaining</span>
                      <strong className="text-sm font-mono text-white">42 km</strong>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Est. Drop</span>
                      <strong className="text-sm font-mono text-blue-400">1:15 PM</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Card */}
                <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3 z-30">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                        RK
                      </div>
                      <div>
                        <span className="font-bold text-white block">Ramesh Kumar</span>
                        <span className="text-[10px] text-slate-400 font-mono">KA 05 AB 1234 • AC On</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                      ₹{bookingAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentSlide(13)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Ride & View Summary (Slide 13)</span>
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 13: TRIP COMPLETED & RATING */}
            {/* ============================================================ */}
            {currentSlide === 13 && (
              <div className="flex-1 flex flex-col justify-between p-5 bg-white text-center overflow-y-auto">
                <div className="my-auto space-y-3.5">
                  {/* Green Checkmark */}
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-[#071B49]">Trip Completed!</h2>
                    <p className="text-xs text-slate-500">Thank you for riding with SJT Tours & Travels.</p>
                  </div>

                  {/* Trip Fare Breakdown Card */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Booking Code</span>
                      <strong className="font-mono text-blue-600">#{activeBookingId}</strong>
                    </div>
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-slate-500">Base Fare (Outstation)</span>
                      <span className="font-mono text-slate-800">₹{(bookingAmount * 0.88).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-slate-500">GST (5% Commercial Travel)</span>
                      <span className="font-mono text-slate-800">₹{(bookingAmount * 0.05).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-slate-500">Toll & Highway Surcharge</span>
                      <span className="font-mono text-slate-800">₹{(bookingAmount * 0.07).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-black text-slate-900 text-xs">Total Amount Paid</span>
                      <strong className="font-mono text-emerald-600 text-sm">₹{bookingAmount.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* 5-Star Interactive Rating */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Rate Captain Ramesh Kumar</span>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${star <= rating
                                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                : 'text-slate-300'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write your feedback..."
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium resize-none text-slate-700"
                    />
                  </div>

                  {/* Invoice Download Action */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => alert(`GST Tax Invoice generated for Booking #${activeBookingId}! Downloaded.`)}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download Tax Invoice (PDF)</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => setCurrentSlide(14)}
                      className="w-full py-3 px-4 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>View All My Bookings (Slide 14)</span>
                    </button>
                    <button
                      onClick={() => setCurrentSlide(6)}
                      className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      Book Another Ride
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SLIDE 14: MY BOOKINGS */}
            {/* ============================================================ */}
            {currentSlide === 14 && (
              <div className="flex-1 flex flex-col justify-between bg-white overflow-y-auto">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentSlide(5)} className="p-1 rounded-full hover:bg-slate-100">
                      <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <h2 className="text-sm font-black text-[#071B49]">My Bookings History</h2>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    3 Trips
                  </span>
                </div>

                <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
                  {/* Tabs: Upcoming / Completed / Cancelled */}
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
                    {(['UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setBookingsTab(tab)}
                        className={`flex-1 py-1.5 rounded-lg transition-all capitalize ${bookingsTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
                          }`}
                      >
                        {tab.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  {/* Card 1: Mysuru Trip (Active / Completed) */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <img src="/tempo17.jpg" alt="Tempo Traveller" className="w-14 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#{activeBookingId}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {bookingsTab === 'COMPLETED' ? 'Completed' : 'Confirmed'}
                          </span>
                        </div>
                        <h4 className="font-black text-xs text-slate-800 mt-0.5 flex items-center gap-1">
                          <span>{fromCity}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>{toCity}</span>
                        </h4>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          25 Oct 2026 • ₹{bookingAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-600 font-semibold truncate">
                          {selectedVehicleName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                      <button
                        onClick={() => setCurrentSlide(11)}
                        className="flex-1 py-1.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100"
                      >
                        Track Live
                      </button>
                      <button
                        onClick={() => setCurrentSlide(13)}
                        className="flex-1 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Coorg Mini Bus Trip */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 shadow-sm opacity-90">
                    <div className="flex items-start justify-between gap-3">
                      <img src="/minibus.jpg" alt="Mini Bus" className="w-14 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#SJT264118</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            Upcoming
                          </span>
                        </div>
                        <h4 className="font-black text-xs text-slate-800 mt-0.5 flex items-center gap-1">
                          <span>Bengaluru</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>Coorg</span>
                        </h4>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          15 Nov 2026 • ₹6,000
                        </div>
                        <div className="text-[10px] text-slate-600 font-semibold truncate">
                          Mini Bus (12 Seater)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                      <button
                        onClick={() => setCurrentSlide(6)}
                        className="flex-1 py-1.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => alert('Cancellation policy: Free cancellation up to 6 hours before pickup.')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom App Navigation */}
                <div className="sticky bottom-0 z-20 flex items-center justify-around border-t border-slate-200/80 bg-white/95 px-5 pt-2.5 pb-3 text-slate-500 shadow-[0_-10px_30px_rgba(7,27,73,0.06)] backdrop-blur-md animate-sjt-entry">
                  <button onClick={() => setCurrentSlide(5)} className="group flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-3 py-1 transition-all duration-300 hover:text-blue-600 active:scale-90">
                    <Compass className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    <span className="text-[9px] font-semibold">Home</span>
                  </button>
                  <button className="group flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-3 py-1 text-blue-600 transition-all duration-300 active:scale-90">
                    <Calendar className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    <span className="text-[9px] font-bold">Bookings</span>
                  </button>
                  <button onClick={() => setCurrentSlide(15)} className="group flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-3 py-1 transition-all duration-300 hover:text-blue-600 active:scale-90">
                    <UserIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    <span className="text-[9px] font-semibold">Profile</span>
                  </button>
                </div>
              </div>
            )}

            {currentSlide === 15 && (
              <div className="flex-1 overflow-y-auto bg-white p-5">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentSlide(5)} aria-label="Back to home" className="rounded-full p-1.5 hover:bg-slate-100">
                    <ArrowLeft className="h-5 w-5 text-slate-700" />
                  </button>
                  <h2 className="text-base font-black text-[#071B49]">My Profile</h2>
                </div>
                {currentUser?.role === 'CUSTOMER' ? (
                  <div className="mt-8 space-y-4 animate-fade-in">
                    <div className="rounded-3xl bg-gradient-to-br from-[#071B49] to-[#174E9A] p-6 text-white shadow-lg">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black">
                        {currentUser.name?.charAt(0)?.toUpperCase() || <UserIcon className="h-7 w-7" />}
                      </div>
                      <h3 className="text-lg font-black">{currentUser.name}</h3>
                      <p className="mt-1 text-xs text-blue-100">{currentUser.email}</p>
                      <p className="mt-1 text-xs text-blue-100">{currentUser.phone || 'Phone not added'}</p>
                    </div>
                    <button onClick={() => setCurrentSlide(14)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left text-sm font-bold text-slate-800 hover:border-blue-300 hover:bg-blue-50">
                      <span>My bookings</span><ChevronRight className="h-4 w-4 text-blue-600" />
                    </button>
                    <button onClick={() => { logout(); setCurrentSlide(1); }} className="w-full rounded-2xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50">
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center animate-fade-in">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><UserIcon className="h-7 w-7" /></div>
                    <h3 className="text-lg font-black text-[#071B49]">Your SJT account</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">Sign in or create a customer account to see your trips and booking updates.</p>
                    <button onClick={() => { setCustomerAuthError(''); setCurrentSlide(3); }} className="mt-5 w-full rounded-xl bg-[#0066FF] px-4 py-3 text-sm font-black text-white shadow-md hover:bg-blue-700">Customer sign in</button>
                    <button onClick={() => { setCustomerAuthError(''); setCurrentSlide(4); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">Create customer account</button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Home Indicator Bar */}
            <div className="w-32 h-1 bg-slate-900/30 rounded-full mx-auto my-2 shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerMobileApp;
