import React from 'react';

type LegalPageKey = 'privacy' | 'terms' | 'deletion';

const pageTitle: Record<LegalPageKey, string> = {
  privacy: 'Privacy policy',
  terms: 'Terms of service',
  deletion: 'Account and data deletion'
};

const pageHref: Record<LegalPageKey, string> = {
  privacy: '/?legal=privacy',
  terms: '/?legal=terms',
  deletion: '/?legal=deletion'
};

export const LegalCenter: React.FC<{ page: LegalPageKey }> = ({ page }) => (
  <div className="min-h-screen bg-slate-50 text-slate-800">
    <header className="bg-[#071B49] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <a href="/" className="flex items-center gap-3">
          <img src="/sjt_logo.png" alt="SJT Tours & Travels" className="h-12 w-12 rounded-xl bg-white object-contain p-1" />
          <span><span className="block text-lg font-black">SJT Tours & Travels</span><span className="block text-xs text-blue-200">Bengaluru, Karnataka</span></span>
        </a>
        <a href="/" className="w-fit rounded-xl border border-white/30 px-4 py-2 text-sm font-bold hover:bg-white/10">Back to website</a>
      </div>
    </header>
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Legal pages" className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="px-3 pb-2 pt-1 text-[11px] font-black uppercase tracking-wider text-slate-400">Information</p>
          {(Object.keys(pageTitle) as LegalPageKey[]).map(key => <a key={key} href={pageHref[key]} className={page === key ? 'mb-1 block rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-[#071B49]' : 'mb-1 block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50'}>{pageTitle[key]}</a>)}
          <a href="mailto:sjttravels2025@gmail.com?subject=SJT%20Privacy%20Request" className="mt-2 block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Contact privacy support</a>
        </nav>
        <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-wider text-[#ED1735]">SJT Tours & Travels Pvt. Ltd.</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#071B49] sm:text-4xl">{pageTitle[page]}</h1>
          <p className="mt-3 text-xs text-slate-500">Last updated: 27 October 2026</p>

          {page === 'privacy' && <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Information SJT handles</h2><p className="mt-2">For customer bookings, SJT receives the name, phone number, optional email, pickup and destination details, requested dates and times, passenger count, booking notes, vehicle choice, and booking or payment status that you provide.</p><p className="mt-2">For driver onboarding, SJT receives contact and profile details, licence and badge details, Aadhaar and PAN numbers where entered, address and vehicle details, expiry dates, copies of vehicle and driver documents, and a selfie submitted for manual review.</p><p className="mt-2">The driver app records odometer readings, company or booking identifiers, duty times, and submitted allowances. The current apps do not request device GPS permission or continuously collect precise/background location. Pickup and destination are details entered for a booking.</p></section>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">How information is used</h2><p className="mt-2">SJT uses booking details to respond to requests, confirm and dispatch trips, contact customers and drivers, and maintain service and payment records. Driver details and uploaded files are used by authorized operations staff for onboarding, document review, vehicle allocation, and duty administration.</p><p className="mt-2">A selfie is reviewed by an administrator. SJT does not currently use automated facial recognition, biometric matching, liveness detection, or automated government registry checks.</p></section>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Payments</h2><p className="mt-2">Online payment processing is not currently enabled in the app. SJT may record the payment method, amount, status, and reference for a booking or payment made directly to SJT. Do not treat an in-app screen or reference number as proof that an online payment was processed. If an online payment provider is introduced, this policy will be updated before the feature is enabled.</p></section>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Service providers and sharing</h2><p className="mt-2">The backend can use Render for application hosting, Voroa for managed PostgreSQL database hosting, and a configured private S3-compatible object store for driver documents. Production startup requires private object-storage settings; local development may use the server filesystem. The live provider configuration should be checked before launch. Booking information needed for a trip is shared with the assigned driver and operations staff. If you choose the WhatsApp contact link, WhatsApp handles that communication under its own terms. SJT does not publish identity documents or selfies as public files.</p></section>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Retention, security, and your requests</h2><p className="mt-2">SJT keeps information while it is needed to provide and administer services, resolve disputes, maintain financial or operational records, and meet applicable legal obligations. Access to driver documents is restricted to authorized review workflows. SJT applies access controls and HTTPS for hosted services where supported, but no internet transmission or storage system can be guaranteed completely risk-free.</p><p className="mt-2">You can ask to access, correct, or delete information by contacting <a className="font-bold text-blue-700 underline" href="mailto:sjttravels2025@gmail.com?subject=SJT%20Privacy%20Request">sjttravels2025@gmail.com</a>. SJT may verify your identity before acting. Some booking, payment, duty, or tax records may need to be retained; if so, SJT will explain what is retained and why.</p></section>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Contact</h2><p className="mt-2">For privacy questions, contact <a className="font-bold text-blue-700 underline" href="mailto:sjttravels2025@gmail.com">sjttravels2025@gmail.com</a> or call <a className="font-bold text-blue-700 underline" href="tel:+919900975920">+91 99009 75920</a>.</p></section>
          </div>}

          {page === 'terms' && <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Bookings</h2><p className="mt-2">A submitted request is subject to availability and confirmation by SJT. The trip details, vehicle, fare, pickup and drop-off arrangements, and any applicable taxes or charges are confirmed with you before travel. Keep your booking confirmation for reference.</p></section>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Payment status</h2><p className="mt-2">The current app does not process online payments. A booking marked pending is not a receipt. Follow the payment instructions confirmed by SJT and retain any receipt or reference issued for a payment made directly to SJT.</p></section>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Changes and cancellations</h2><p className="mt-2">Contact SJT as soon as possible to request a change or cancellation. Any applicable cancellation, refund, waiting, toll, parking, or extra-distance charges will be explained in the trip confirmation or directly by SJT. No fixed cancellation window or refund is promised by this page.</p></section>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Driver onboarding</h2><p className="mt-2">Drivers must provide complete, accurate, and current information and documents. A selfie is reviewed manually and does not by itself establish identity or liveness. A driver may not receive trips until the required documents and profile are approved by SJT.</p></section>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">Contact</h2><p className="mt-2">For booking support, contact <a className="font-bold text-blue-700 underline" href="mailto:sjttravels2025@gmail.com">sjttravels2025@gmail.com</a> or call <a className="font-bold text-blue-700 underline" href="tel:+919900975920">+91 99009 75920</a>.</p></section>
          </div>}

          {page === 'deletion' && <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5"><h2 className="text-lg font-extrabold text-[#071B49]">Request deletion of your account or personal data</h2><p className="mt-2">Send the request from the email address associated with your SJT account. Include your name, registered phone number, and whether the account is for a customer or driver. Do not attach Aadhaar, PAN, licence images, passwords, or other identity documents to the email.</p><a className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#071B49] px-5 py-3 font-bold text-white hover:bg-blue-900" href="mailto:sjttravels2025@gmail.com?subject=Account%20and%20data%20deletion%20request&body=Name%3A%0ARegistered%20phone%3A%0AAccount%20type%20(customer%20or%20driver)%3A%0AI%20request%20deletion%20of%20my%20SJT%20account%20and%20personal%20data%20where%20retention%20is%20not%20required.">Email a deletion request</a></div>
            <section><h2 className="text-lg font-extrabold text-[#071B49]">What happens next</h2><p className="mt-2">SJT will verify the request and may ask for limited information to confirm account ownership. SJT will delete or de-identify account and profile information that is no longer needed. Booking, payment, duty, payroll, dispute, or tax records may be retained for operational or legal reasons, with access restricted to those purposes.</p><p className="mt-2">If you cannot access your registered email, call <a className="font-bold text-blue-700 underline" href="tel:+919900975920">+91 99009 75920</a> and ask how to verify the request without sending identity documents through an unsecured channel.</p></section>
            <p>Contact: <a className="font-bold text-blue-700 underline" href="mailto:sjttravels2025@gmail.com">sjttravels2025@gmail.com</a></p>
          </div>}
        </article>
      </div>
    </main>
  </div>
);
