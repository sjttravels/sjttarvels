import React, { useMemo, useState } from 'react';
import { MapPin, Navigation, Sparkles } from 'lucide-react';

export const KARNATAKA_PLACES = [
  // --- BENGALURU AIRPORT & TRANSPORT HUBS ---
  'Kempegowda International Airport (BLR) Terminal 1',
  'Kempegowda International Airport (BLR) Terminal 2',
  'KSR Bengaluru City Railway Station (Majestic)',
  'Yeshwanthpur Junction Railway Station, Bengaluru',
  'Bangalore Cantonment Railway Station',
  'Sir M. Visvesvaraya Terminal (SMVB Byappanahalli)',
  'KR Puram Railway Station, Bengaluru',
  'Kempegowda Bus Station (Majestic), Bengaluru',
  'Shantinagar Bus Station (BMTC/KSRTC), Bengaluru',

  // --- BENGALURU MAJOR LOCALITIES & TECH PARKS ---
  'Indiranagar, Bengaluru',
  'Koramangala, Bengaluru',
  'Whitefield, Bengaluru',
  'Electronic City Phase 1, Bengaluru',
  'Electronic City Phase 2, Bengaluru',
  'HSR Layout, Bengaluru',
  'BTM Layout, Bengaluru',
  'Jayanagar, Bengaluru',
  'JP Nagar, Bengaluru',
  'Banashankari, Bengaluru',
  'Malleshwaram, Bengaluru',
  'Rajajinagar, Bengaluru',
  'Yelahanka, Bengaluru',
  'Hebbal, Bengaluru',
  'Manyata Tech Park, Nagavara, Bengaluru',
  'Bagmane Tech Park, CV Raman Nagar, Bengaluru',
  'ITPL, Whitefield, Bengaluru',
  'Marathahalli, Bengaluru',
  'Bellandur, Outer Ring Road, Bengaluru',
  'Sarjapur Road, Bengaluru',
  'Bannerghatta Road, Bengaluru',
  'Basavanagudi, Bengaluru',
  'MG Road & Brigade Road, Bengaluru',
  'Richmond Town, Bengaluru',
  'Frazer Town, Bengaluru',
  'RT Nagar, Bengaluru',
  'Kalyan Nagar, Bengaluru',
  'Kammanahalli, Bengaluru',
  'Hennur Road, Bengaluru',
  'Sahakar Nagar, Bengaluru',
  'Vidyaranyapura, Bengaluru',
  'Peenya Industrial Area, Bengaluru',
  'Vijayanagar, Bengaluru',
  'Kengeri Satellite Town, Bengaluru',
  'Kanakapura Road, Bengaluru',
  'Nelamangala, Bengaluru Rural',
  'Hosakote, Bengaluru Rural',
  'Devenahalli, Bengaluru Rural',

  // --- KARNATAKA CITIES, DISTRICTS & TOURIST HUBS ---
  'Mysuru (Mysore), Karnataka',
  'Mysore Palace, Mysuru',
  'Chamundi Hills, Mysuru',
  'Srirangapatna, Mandya',
  'Coorg (Madikeri), Karnataka',
  'Kushalnagar, Coorg',
  'Chikmagalur (Chikkamagaluru), Karnataka',
  'Mullayanagiri Peak, Chikmagalur',
  'Baba Budangiri, Chikmagalur',
  'Sakleshpur, Hassan',
  'Hassan, Karnataka',
  'Belur & Halebeedu, Hassan',
  'Shivamogga (Shimoga), Karnataka',
  'Jog Falls, Shivamogga',
  'Bhadravathi, Shivamogga',
  'Davangere, Karnataka',
  'Chitradurga Fort, Karnataka',
  'Tumakuru (Tumkur), Karnataka',
  'Mandya, Karnataka',
  'Ramanagara (Silk City), Karnataka',
  'Channapatna, Karnataka',
  'Chamarajanagar, Karnataka',
  'Bandipur National Park, Karnataka',
  'Kabini Wildlife Sanctuary / Nagarhole',
  'Mangaluru (Mangalore), Karnataka',
  'Panambur Beach, Mangaluru',
  'Udupi & Malpe Beach, Karnataka',
  'Sri Krishna Matha, Udupi',
  'Manipal, Udupi',
  'Murudeshwar Shiva Temple, Karnataka',
  'Gokarna & Om Beach, Karnataka',
  'Karwar, Uttara Kannada',
  'Dandeli Adventure Hub, Karnataka',
  'Belagavi (Belgaum), Karnataka',
  'Hubballi (Hubli), Karnataka',
  'Dharwad, Karnataka',
  'Bagalkot, Karnataka',
  'Badami Cave Temples, Bagalkot',
  'Pattadakal & Aihole, Karnataka',
  'Vijayapura (Bijapur - Gol Gumbaz)',
  'Kalaburagi (Gulbarga), Karnataka',
  'Bidar Fort, Karnataka',
  'Raichur, Karnataka',
  'Ballari (Bellary), Karnataka',
  'Hampi (UNESCO World Heritage Site)',
  'Hospet (Hosapete), Karnataka',
  'Kolar & KGF (Kolar Gold Fields)',
  'Chikkaballapur, Karnataka',
  'Nandi Hills, Chikkaballapur',

  // --- POPULAR OUTSTATION ROUTES FROM KARNATAKA ---
  'Tirupati Balaji Temple, Andhra Pradesh',
  'Ooty (Udhagamandalam), Tamil Nadu',
  'Coonoor, Nilgiris, Tamil Nadu',
  'Wayanad, Kerala',
  'Kannur, Kerala',
  'Goa (Panaji & Beaches)',
  'Chennai, Tamil Nadu',
  'Coimbatore, Tamil Nadu',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Mumbai, Maharashtra'
];

interface LocationSuggestionFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  onUseLiveLocation?: () => void;
  isLocating?: boolean;
}

export const LocationSuggestionField: React.FC<LocationSuggestionFieldProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Type any Karnataka area, city or landmark...',
  required,
  onUseLiveLocation,
  isLocating
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    if (!query) {
      // Popular quick-picks when user focuses before typing
      return [
        'Kempegowda International Airport (BLR) Terminal 1',
        'KSR Bengaluru City Railway Station (Majestic)',
        'Indiranagar, Bengaluru',
        'Whitefield, Bengaluru',
        'Koramangala, Bengaluru',
        'Mysuru (Mysore), Karnataka',
        'Coorg (Madikeri), Karnataka',
        'Chikmagalur (Chikkamagaluru), Karnataka',
        'Ooty (Udhagamandalam), Tamil Nadu',
        'Hampi (UNESCO World Heritage Site)'
      ];
    }

    // Match any place containing the typed characters
    const matches = KARNATAKA_PLACES
      .filter(place => place.toLocaleLowerCase().includes(query))
      .sort((a, b) => {
        const aLower = a.toLocaleLowerCase();
        const bLower = b.toLocaleLowerCase();
        const aStarts = aLower.startsWith(query);
        const bStarts = bLower.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aLower.localeCompare(bLower);
      })
      .slice(0, 8);

    if (!matches.some(place => place.toLocaleLowerCase() === query)) {
      matches.push(`Use custom: ${value.trim()}`);
    }
    return matches;
  }, [value]);

  const chooseSuggestion = (suggestion: string) => {
    onChange(suggestion.startsWith('Use custom: ') ? suggestion.slice(12) : suggestion);
    setIsOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="relative">
      <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#ED1735]" />
      <input
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen && suggestions.length > 0}
        aria-controls={`${id}-suggestions`}
        value={value}
        onFocus={() => setIsOpen(true)}
        onChange={event => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(0);
        }}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 200)}
        onKeyDown={event => {
          if (!isOpen || suggestions.length === 0) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex(index => (index + 1) % suggestions.length);
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex(index => (index - 1 + suggestions.length) % suggestions.length);
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            chooseSuggestion(suggestions[activeIndex] || suggestions[0]);
          }
          if (event.key === 'Escape') setIsOpen(false);
        }}
        placeholder={placeholder}
        required={required}
        className="w-full h-11 rounded-xl border border-slate-200 pl-9 pr-9 text-xs font-semibold text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-slate-400 bg-white shadow-xs"
      />

      {/* Optional Live GPS Icon Button directly inside input */}
      {onUseLiveLocation && (
        <button
          type="button"
          onClick={onUseLiveLocation}
          title="Detect Current Live Location via GPS"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      )}

      {/* Dropdown Suggestions */}
      {isOpen && (suggestions.length > 0 || onUseLiveLocation) && (
        <div
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1"
        >
          {/* Prominent Live Location Option inside the Dropdown */}
          {onUseLiveLocation && (
            <div className="p-0.5 mb-1.5 border-b border-slate-100">
              <button
                type="button"
                onPointerDown={event => {
                  event.preventDefault();
                  onUseLiveLocation();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 hover:from-emerald-100 hover:to-teal-100 border border-emerald-300 text-emerald-950 transition-all cursor-pointer shadow-xs group text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-xs font-black text-emerald-950 block truncate">
                        {isLocating ? 'Detecting Live GPS Position…' : '📍 Use My Current Live Location'}
                      </strong>
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shrink-0">
                        GPS
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 block truncate font-medium">
                      Tap to auto-detect current pickup area & Google Maps pin
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-700 ml-2 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </button>
            </div>
          )}

          <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {value.trim() ? 'Matching Karnataka Locations' : 'Popular Karnataka Destinations'}
            </span>
            <span className="text-[9px] text-emerald-600 font-semibold">Instant Search</span>
          </div>

          {suggestions.map((suggestion, index) => {
            const isCustom = suggestion.startsWith('Use custom: ');
            return (
              <button
                key={suggestion}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onPointerDown={event => event.preventDefault()}
                onClick={() => chooseSuggestion(suggestion)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
                  index === activeIndex
                    ? 'bg-red-50 text-[#ED1735]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MapPin className={`h-3.5 w-3.5 shrink-0 ${isCustom ? 'text-blue-500' : 'text-emerald-600'}`} />
                <span className="min-w-0 flex-1 truncate">
                  {isCustom ? suggestion.slice(12) : suggestion}
                </span>
                {isCustom && (
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700">
                    Custom
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
