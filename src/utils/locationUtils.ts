export interface ParsedLocation {
  exactAddress: string;
  cleanPickup: string;
  pickupLat: number | null;
  pickupLng: number | null;
  mapsDirUrl: string;
  mapsPinUrl: string;
  mapsDropUrl: string;
}

export function parseLocationDetails(booking: any): ParsedLocation {
  if (!booking) {
    return {
      exactAddress: '',
      cleanPickup: '',
      pickupLat: null,
      pickupLng: null,
      mapsDirUrl: '',
      mapsPinUrl: '',
      mapsDropUrl: ''
    };
  }

  let exactAddress = booking.exact_address || booking.exactAddress || '';
  let pickupLat = booking.pickup_lat ?? booking.pickupLat ?? null;
  let pickupLng = booking.pickup_lng ?? booking.pickupLng ?? null;
  const notes = String(booking.notes || '');

  if (notes) {
    const doorstepMatch = notes.match(/🏠\s*(?:Exact\s*Doorstep(?:\s*Address)?|Doorstep(?:\s*Address)?|Exact(?:\s*Address)?|Home(?:\s*Address)?):\s*([^|]+)/i);
    if (doorstepMatch && !exactAddress) {
      exactAddress = doorstepMatch[1].trim();
    }
    const gpsMatch = notes.match(/📍\s*GPS(?:\s*Pin)?:\s*([0-9.-]+)\s*,\s*([0-9.-]+)/i) ||
                     notes.match(/query=([0-9.-]+)%2C([0-9.-]+)/i) ||
                     notes.match(/query=([0-9.-]+),([0-9.-]+)/i) ||
                     notes.match(/destination=([0-9.-]+),([0-9.-]+)/i);
    if (gpsMatch && (pickupLat === null || pickupLng === null)) {
      pickupLat = parseFloat(gpsMatch[1]);
      pickupLng = parseFloat(gpsMatch[2]);
    }
  }

  const cleanPickup = String(booking.pickup || '')
    .replace(/\(📍.*?\)/g, '')
    .replace(/📍/g, '')
    .replace(/Live GPS/gi, '')
    .trim();

  let mapsDirUrl = booking.mapsDirUrl || booking.maps_dir_url || '';
  let mapsPinUrl = booking.mapsPinUrl || booking.maps_pin_url || booking.pickup_google_maps_url || '';

  if (pickupLat !== null && pickupLng !== null && !isNaN(pickupLat) && !isNaN(pickupLng)) {
    if (!mapsDirUrl) mapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${pickupLat},${pickupLng}`;
    if (!mapsPinUrl) mapsPinUrl = `https://www.google.com/maps/search/?api=1&query=${pickupLat},${pickupLng}`;
  } else {
    const target = exactAddress ? `${exactAddress}, ${cleanPickup}` : cleanPickup;
    if (!mapsDirUrl) mapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
    if (!mapsPinUrl) mapsPinUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;
  }

  const cleanDestination = String(booking.destination || '')
    .replace(/\(📍.*?\)/g, '')
    .replace(/📍/g, '')
    .trim();
  const mapsDropUrl = booking.mapsDropUrl || booking.maps_drop_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cleanDestination)}`;

  return {
    exactAddress,
    cleanPickup: cleanPickup || String(booking.pickup || ''),
    pickupLat,
    pickupLng,
    mapsDirUrl,
    mapsPinUrl,
    mapsDropUrl
  };
}
