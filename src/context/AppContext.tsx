import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Vehicle, Booking, User, TripType } from '../types';

export type AppView = 'CUSTOMER_WEB' | 'CUSTOMER_MOBILE' | 'DRIVER_APP' | 'ADMIN_PANEL' | 'SHOWCASE';

interface AppContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  standaloneMode: boolean;
  vehicles: Vehicle[];
  bookings: Booking[];
  loading: boolean;
  activeTripOtp: string;
  generateNewTripOtp: () => string;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  login: (email: string, password: string, expectedRole?: any, targetView?: any) => Promise<User>;
  register: (payload: any, targetView?: any) => Promise<User>;
  logout: () => void;
  createBooking: (booking: Partial<Booking>) => Promise<Booking>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  openRazorpayModal: (bookingData: Partial<Booking>, amount: number, onSuccess: (paymentId: string) => void) => void;
  closeRazorpayModal: () => void;
  openClientMailModal: (data?: any) => void;
  razorpayModal: {
    open: boolean;
    bookingData?: Partial<Booking>;
    amount?: number;
    onSuccess?: (paymentId: string) => void;
  };
  refreshData?: (force?: boolean) => Promise<void>;
}

const DEFAULT_FLEET: Vehicle[] = [
  {
    id: 'etios',
    _id: 'etios',
    name: 'Toyota Etios / Sedan',
    category: 'Sedans',
    seats: 4,
    ac: true,
    ratePerDay: 2200,
    ratePerKm: 12,
    minKmPerDay: 250,
    driverAllowancePerDay: 400,
    image: '/etios.jpg',
    regNumber: 'KA01AE1234',
    features: ['Air Conditioning', '4 Passenger Comfort', 'Spacious Boot (400L)'],
    status: 'AVAILABLE'
  },
  {
    id: 'ertiga',
    _id: 'ertiga',
    name: 'Maruti Suzuki Ertiga',
    category: 'Ertiga MPV',
    seats: 6,
    ac: true,
    ratePerDay: 2800,
    ratePerKm: 14,
    minKmPerDay: 250,
    driverAllowancePerDay: 450,
    image: '/ertiga.jpg',
    regNumber: 'KA04ME5678',
    features: ['Dual AC Vents', '6 Passenger Seating', 'Foldable 3rd Row'],
    status: 'AVAILABLE'
  },
  {
    id: 'innova',
    _id: 'innova',
    name: 'Toyota Innova Crysta',
    category: 'Innova Crysta / Hycross',
    seats: 7,
    ac: true,
    ratePerDay: 3500,
    ratePerKm: 17,
    minKmPerDay: 300,
    driverAllowancePerDay: 500,
    image: '/innova.jpg',
    regNumber: 'KA05NB9012',
    features: ['Captain Seat Comfort', 'Powerful AC Climatic Control', 'Luxury Executive Ride'],
    status: 'AVAILABLE'
  },
  {
    id: 'hycross',
    _id: 'hycross',
    name: 'Toyota Innova Hycross',
    category: 'Innova Crysta / Hycross',
    seats: 6,
    ac: true,
    ratePerDay: 4500,
    ratePerKm: 22,
    minKmPerDay: 300,
    driverAllowancePerDay: 600,
    image: '/hycross.jpg',
    regNumber: 'KA03MH3456',
    features: ['Hybrid Silent Luxury', 'Ottoman Reclining Seats', 'Panoramic Sunroof'],
    status: 'AVAILABLE'
  },
  {
    id: 'tempo',
    _id: 'tempo',
    name: 'Tempo Traveller (12 Seater)',
    category: 'Tempo Travellers',
    seats: 12,
    ac: true,
    ratePerDay: 4500,
    ratePerKm: 24,
    minKmPerDay: 300,
    driverAllowancePerDay: 600,
    image: '/tempo.jpg',
    regNumber: 'KA02TT7890',
    features: ['Individual Pushback Seats', '2x1 Luxury Layout', 'High Roof Standing Height'],
    status: 'AVAILABLE'
  },
  {
    id: 'tempo17',
    _id: 'tempo17',
    name: 'Tempo Traveller (17 Seater)',
    category: 'Tempo Travellers',
    seats: 17,
    ac: true,
    ratePerDay: 7500,
    ratePerKm: 28,
    minKmPerDay: 350,
    driverAllowancePerDay: 700,
    image: '/tempo17.jpg',
    regNumber: 'KA01TL2345',
    features: ['17 Luxury Reclining Seats', 'Twin High-Power AC Blowers', 'Large Luggage Boot'],
    status: 'AVAILABLE'
  },
  {
    id: 'minibus',
    _id: 'minibus',
    name: 'Mini Bus (25 Seater)',
    category: 'Tempo Travellers',
    seats: 25,
    ac: true,
    ratePerDay: 8500,
    ratePerKm: 34,
    minKmPerDay: 350,
    driverAllowancePerDay: 800,
    image: '/minibus.jpg',
    regNumber: 'KA51MB6789',
    features: ['25 Deluxe Pushback Seats', 'Air Suspension Ride', 'PA Mic & Audio System'],
    status: 'AVAILABLE'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

function getInitialView(): AppView {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view')?.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    if (
      hash === '#app' ||
      hash === '#mobile' ||
      hash === '#user-app' ||
      viewParam === 'app' ||
      viewParam === 'mobile' ||
      viewParam === 'user-app' ||
      pathname.startsWith('/app')
    ) {
      return 'CUSTOMER_MOBILE';
    }
  }
  return 'CUSTOMER_WEB';
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>(getInitialView());
  const [standaloneMode] = useState<boolean>(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEFAULT_FLEET);
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('sjt_bookings_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sjt_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const [activeTripOtp, setActiveTripOtp] = useState<string>(() => {
    try {
      return localStorage.getItem('sjt_active_trip_otp') || '4821';
    } catch {
      return '4821';
    }
  });

  const generateNewTripOtp = useCallback((): string => {
    const freshOtp = String(Math.floor(1000 + Math.random() * 9000));
    setActiveTripOtp(freshOtp);
    try {
      localStorage.setItem('sjt_active_trip_otp', freshOtp);
    } catch {}
    return freshOtp;
  }, []);

  const [razorpayModal, setRazorpayModal] = useState<{
    open: boolean;
    bookingData?: Partial<Booking>;
    amount?: number;
    onSuccess?: (paymentId: string) => void;
  }>({ open: false });

  const openRazorpayModal = (
    bookingData: Partial<Booking>,
    amount: number,
    onSuccess: (paymentId: string) => void
  ) => {
    setRazorpayModal({ open: true, bookingData, amount, onSuccess });
  };

  const closeRazorpayModal = () => {
    setRazorpayModal({ open: false });
  };

  const openClientMailModal = () => {
    window.location.href = 'mailto:sjttravels2025@gmail.com';
  };

  // Sync initial view from URL
  useEffect(() => {
    const handleHashChange = () => {
      setActiveView(getInitialView());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch live fleet if API available
  const fetchFleet = useCallback(async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiBase}/api/vehicles`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Vehicle[] = data.map((v: any) => ({
            id: v.id,
            _id: v.id,
            name: v.name,
            category: v.category,
            seats: Number(v.seats),
            ac: v.ac ?? true,
            regNumber: v.reg_number || v.regNumber || 'KA01AE1234',
            image: v.image,
            ratePerDay: Number(v.rate_per_day || v.ratePerDay || 2200),
            ratePerKm: Number(v.rate_per_km || v.ratePerKm || 12),
            minKmPerDay: Number(v.min_km_per_day || v.minKmPerDay || 250),
            driverAllowancePerDay: Number(v.driver_allowance_per_day || v.driverAllowancePerDay || 400),
            status: v.status || 'AVAILABLE',
            features: v.features || []
          }));
          setVehicles(mapped);
        }
      }
    } catch (e) {
      // Graceful fallback to DEFAULT_FLEET
    }
  }, []);

  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  const login = async (email: string, password: string, _role?: any, _targetView?: any): Promise<User> => {
    const user: User = {
      id: 'cust_' + Date.now(),
      email,
      name: email.split('@')[0].toUpperCase(),
      phone: '+91 99009 75920',
      role: 'CUSTOMER'
    };
    setCurrentUser(user);
    try {
      localStorage.setItem('sjt_user', JSON.stringify(user));
    } catch {}
    setLoginModalOpen(false);
    return user;
  };

  const register = async (payload: any, _targetView?: any): Promise<User> => {
    const user: User = {
      id: 'cust_' + Date.now(),
      email: payload.email || 'customer@sjttravels.com',
      name: payload.name || 'Valued Passenger',
      phone: payload.phone || '+91 99009 75920',
      role: 'CUSTOMER'
    };
    setCurrentUser(user);
    try {
      localStorage.setItem('sjt_user', JSON.stringify(user));
    } catch {}
    setLoginModalOpen(false);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sjt_user');
    } catch {}
  };

  const createBooking = async (payload: Partial<Booking>): Promise<Booking> => {
    setLoading(true);
    try {
      const code = `SJT-${Math.floor(100000 + Math.random() * 900000)}`;
      const freshOtp = String(Math.floor(1000 + Math.random() * 9000));
      setActiveTripOtp(freshOtp);

      const newBooking: Booking = {
        id: 'bk_' + Date.now(),
        _id: 'bk_' + Date.now(),
        bookingCode: code,
        booking_code: code,
        customerName: payload.customerName || payload.customer_name || 'Valued Passenger',
        customerPhone: payload.customerPhone || payload.customer_phone || '+91 99009 75920',
        customerEmail: payload.customerEmail || payload.customer_email || 'booking@sjttravels.com',
        tripType: (payload.tripType || payload.trip_type || 'POINT_TO_POINT') as TripType,
        pickup: payload.pickup || 'Bengaluru, Karnataka',
        destination: payload.destination || 'Indiranagar, Bengaluru',
        journeyDate: payload.journeyDate || payload.journey_date || new Date().toISOString().slice(0, 10),
        journeyTime: payload.journeyTime || payload.journey_time || '10:00 AM',
        returnDate: payload.returnDate || payload.return_date,
        vehicleId: payload.vehicleId || payload.vehicle_id || 'etios',
        vehicleName: payload.vehicleName || payload.vehicle_name || 'Toyota Etios / Sedan',
        passengers: Number(payload.passengers || 4),
        quotedAmount: Number(payload.quotedAmount || payload.quoted_amount || 2200),
        advancePaid: 0,
        paymentStatus: 'PENDING',
        status: 'CONFIRMED',
        rideOtp: freshOtp,
        ride_otp: freshOtp,
        notes: payload.notes || '',
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      // Try serverless API
      try {
        const apiBase = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiBase}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBooking)
        });
        if (res.ok) {
          const serverCreated = await res.json();
          if (serverCreated && serverCreated.booking_code) {
            Object.assign(newBooking, serverCreated);
          }
        }
      } catch (err) {
        // Safe client fallback
      }

      const updated = [newBooking, ...bookings];
      setBookings(updated);
      try {
        localStorage.setItem('sjt_bookings_list', JSON.stringify(updated.slice(0, 20)));
        localStorage.setItem('sjt_last_booking_code', newBooking.booking_code || newBooking.bookingCode);
        localStorage.setItem('sjt_active_trip_otp', freshOtp);
      } catch {}

      return newBooking;
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>): Promise<void> => {
    setBookings(prev => {
      const next = prev.map(b => (b.id === id || b.bookingCode === id || b.booking_code === id ? { ...b, ...updates } : b));
      try {
        localStorage.setItem('sjt_bookings_list', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      await fetch(`${apiBase}/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {}
  };

  const refreshData = async () => {
    await fetchFleet();
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        standaloneMode,
        vehicles,
        bookings,
        loading,
        activeTripOtp,
        generateNewTripOtp,
        currentUser,
        setCurrentUser,
        loginModalOpen,
        setLoginModalOpen,
        login,
        register,
        logout,
        createBooking,
        updateBooking,
        openRazorpayModal,
        closeRazorpayModal,
        openClientMailModal,
        razorpayModal,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
