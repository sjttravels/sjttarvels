# SJT CABS • Karnataka Commercial Fleet Portal

Official Customer Booking Website and Interactive Customer Mobile App for **SJT Tours & Travels Pvt. Ltd.** (Bengaluru, Karnataka).

---

## 🌟 Included Portals

This repository is dedicated exclusively to the **SJT CABS User Facing Experience**:
1. **User Booking Website** (`CustomerWebsite.tsx`):
   - Fast, transparent cab booking engine with live route pricing.
   - **City Ride (Point-to-Point Drop)**: Dynamic per-km market rates:
     - 4-Seater Sedan (Dzire / Etios): **₹12 / km**
     - 6-Seater MPV (Ertiga): **₹15 / km**
     - 7-Seater SUV (Innova Crysta): **₹18 / km**
     - Luxury Hybrid SUV (Innova Hycross): **₹22 / km**
   - **Local Rental Packages**: 8 Hours / 80 km flexible city disposal.
   - **Airport Transfers**: Kempegowda International Airport (BLR T1/T2) fixed transfers.
   - **Outstation & Round Trip**: Commercial tariffs with driver daily bata and verified yellow-board commercial cars.
   - Clean, single-line header with button-type 24x7 dispatch hotline: `+91 99009 75920`.
   - Real-time **Track Ride** modal with live GPS coordinates, driver assignment display, and 4-digit ride OTP.
2. **User Booking App (14 Slides)** (`CustomerMobileApp.tsx`):
   - Interactive smartphone simulation walking through the complete booking lifecycle.
   - Accessible via the top experience toggle or directly via `/app` or `#app`.

---

## 🚀 Instant Vercel Deployment

### Step 1: Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select this repository (`sjttravels/sjttarvels`).
3. Vercel will automatically detect **Vite** framework settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **Deploy**.

### Step 2: (Optional) Remote API Backend
If you want to sync bookings with a dedicated backend, add this Environment Variable in your Vercel Project Settings:
```env
VITE_API_URL=https://your-backend-domain.com
```
*Note: If omitted, the portal automatically uses the included Vercel Serverless Functions (`/api/*`) and instant client-side calculation fallback for 100% uptime.*

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Production build test
npm run build
```

---

## 📞 Support & Dispatch
* **Central Dispatch Hotline**: `+91 99009 75920`
* **Email**: `sjttravels2025@gmail.com`
* **Head Office**: Bengaluru, Karnataka, India
