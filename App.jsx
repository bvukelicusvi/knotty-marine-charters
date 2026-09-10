import { useState, useEffect, useRef } from "react";
import boatSide from './boat-side.jpg';
import boatSunset from './boat-sunset.jpg';
import boatAction from './boat-action.jpg';
import familyPhoto from './family.jpg';

/* ════════════════════════════════════════════════════════
   SETUP — FILL THESE IN
   ════════════════════════════════════════════════════════

   1. FORM EMAIL (Formspree — free):
      a. Go to https://formspree.io and sign up with KMCUSVI@gmail.com
      b. Click "New Form" → name it "KMC Booking"
      c. Copy your endpoint (e.g. https://formspree.io/f/xpzgdabk)
      d. Paste it below replacing YOUR_FORMSPREE_ENDPOINT

   2. BOOKED DATES — add any dates already booked:
      Format: 'YYYY-MM-DD'  e.g. '2026-06-15'
      These show as red/unavailable on the calendar.
   ════════════════════════════════════════════════════════ */

const FORMSPREE_ENDPOINT = "YOUR_FORMSPREE_ENDPOINT";
// Example: "https://formspree.io/f/xpzgdabk"

const BOOKED_DATES = new Set([
  // '2026-06-01',
  // '2026-06-15',
  // Add your booked/unavailable dates here
]);
import lunaPhoto from './luna.jpg';

/* ─── Brand Tokens ─── */
const C = {
  navy: "#0b1d33",
  deepNavy: "#061222",
  midNavy: "#152d4a",
  gold: "#c8a55a",
  lightGold: "#e2cc8a",
  cream: "#f5f0e4",
  warmWhite: "#faf7f0",
  rust: "#b54a32",
  sea: "#2a8a9a",
  sand: "#d4c9b0",
};

/* ─── Responsive Hook ─── */
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

/* ─── Backend Placeholder Functions ─── */
async function sendBookingEmail(data) {
  // PRIMARY: Formspree (uncomment and add your endpoint once set up at formspree.io)
  if (FORMSPREE_ENDPOINT && FORMSPREE_ENDPOINT !== "YOUR_FORMSPREE_ENDPOINT") {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New Charter Request — ${data.tripLabel} on ${data.date}`,
        _replyto: data.email,
        "Guest Name": data.name,
        "Email": data.email,
        "Phone": data.phone,
        "Charter": data.tripLabel,
        "Date": data.date,
        "Time": data.time,
        "Guests": `${data.guests} guests`,
        "Pickup Location": data.pickup || "Not specified",
        "Special Requests": data.requests || "None",
        "Submitted": new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.errors?.[0]?.message || "Submission failed — please call us directly.");
    }
    return res.json();
  }

  // FALLBACK: mailto — opens guest's email client with all booking details pre-filled.
  // Works immediately with zero setup. Brian receives the email at KMCUSVI@gmail.com.
  const subject = encodeURIComponent(
    `Charter Booking Request — ${data.tripLabel} on ${data.date}`
  );
  const body = encodeURIComponent(
    `Hi Captain Brian,\n\nI'd like to book a charter aboard Luna's Wake.\n\n` +
    `Name: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    `Email: ${data.email}\n\n` +
    `Charter: ${data.tripLabel}\n` +
    `Date: ${data.date}\n` +
    `Start Time: ${data.time}\n` +
    `Number of Guests: ${data.guests}\n` +
    `Pickup Location: ${data.pickup || "Not specified"}\n\n` +
    `Special Requests:\n${data.requests || "None"}\n\n` +
    `I have read and accept the weather and cancellation policy.\n\n` +
    `Please confirm my booking. Thank you!`
  );
  window.open(`mailto:KMCUSVI@gmail.com?subject=${subject}&body=${body}`);
  return { success: true, method: "mailto" };
}

async function sendBookingTextAlert(data) {
  // Future SMS integration — connect to Twilio for captain alerts
  // await fetch('/api/sms', { method:'POST', body: JSON.stringify({ to: '+15712327040', body: `New booking: ${data.name} wants ${data.tripLabel} on ${data.date}` }) });
  console.log("[KMC] SMS placeholder — booking from:", data.name, "on", data.date);
  return { success: true };
}

/* ─── Availability Config ─── */
const AVAIL = {
  available: { label: "Available",          bg: "#E8F5E9", color: "#1B5E20", dot: "#4CAF50" },
  limited:   { label: "Limited Availability", bg: "#FFF8E1", color: "#E65100", dot: "#FFC107" },
  request:   { label: "Request to Book",     bg: "#E3F2FD", color: "#0D47A1", dot: "#64B5F6" },
  booked:    { label: "Booked / Unavailable", bg: "#F5F5F5", color: "#757575", dot: "#BDBDBD" },
};

/* ─── Booking Trip Cards Data ─── */
const BOOKING_TRIPS = [
  {
    id: "half-day",
    title: "Half-Day Charter",
    duration: "4 Hours",
    icon: "☀️",
    desc: "Snorkel crystal reefs, swim with sea turtles, and beach hop around St. Thomas aboard Luna's Wake — the 2025 Boat of the Year.",
    price: "From $700",
    capacity: "Up to 10 guests",
    includes: ["Snorkel gear for all", "Cooler with water & ice", "Bluetooth sound system"],
    availability: "available",
  },
  {
    id: "full-day",
    title: "Full-Day Island Hop",
    duration: "7–8 Hours",
    icon: "🏝️",
    desc: "The ultimate USVI experience — circle St. John, stop at Lime Out floating taco bar, snorkel Trunk Bay, and choose your own lunch stop.",
    price: "From $1,300",
    capacity: "Up to 10 guests",
    includes: ["All Half-Day inclusions", "Lunch stop of your choice*", "Multi-island route"],
    availability: "limited",
  },
  {
    id: "sunset",
    title: "Sunset Cruise",
    duration: "2.5 Hours",
    icon: "🌅",
    desc: "Watch the Caribbean sky ignite from the water. Perfect for proposals, anniversaries, bachelorette parties, and celebrations.",
    price: "From $450",
    capacity: "Up to 10 guests",
    includes: ["Cooler with water & ice", "Prime sunset route", "Bluetooth sound"],
    availability: "available",
  },
  {
    id: "custom",
    title: "Custom Charter",
    duration: "You Decide",
    icon: "🧭",
    desc: "Your route, your pace, your day. Tell Captain Brian what you want and he'll chart the perfect course just for you.",
    price: "From $1,300",
    capacity: "Up to 10 guests",
    includes: ["100% custom itinerary", "Any stops you choose", "Fully flexible schedule"],
    availability: "request",
  },
];

/* ─── Gallery Categories & Items ─── */
const GALLERY_CATS = [
  { id: "all",      label: "All Photos" },
  { id: "underway", label: "Boat Underway" },
  { id: "engines",  label: "Twin Mercury" },
  { id: "interior", label: "Interior" },
  { id: "snorkel",  label: "Snorkeling" },
  { id: "beach",    label: "Beach Stops" },
  { id: "sunset",   label: "Sunset" },
  { id: "guests",   label: "Guest Moments" },
];

const GALLERY_ITEMS = [
  { src: boatAction,  category: "underway", caption: "Luna's Wake at full speed" },
  { src: boatSide,    category: "underway", caption: "2025 Monterey Elite 30" },
  { src: boatSunset,  category: "sunset",   caption: "Caribbean sunset from the water" },
  { src: familyPhoto, category: "guests",   caption: "Captain Brian with family" },
  { src: lunaPhoto,   category: "guests",   caption: "Luna — the inspiration behind the name" },
  { placeholder: true, category: "engines",  caption: "Twin Mercury 300XXL outboards", icon: "⚙️", grad: `linear-gradient(135deg, #1a3a5c, ${C.navy})` },
  { placeholder: true, category: "engines",  caption: "600 HP ready to go", icon: "🔧", grad: `linear-gradient(135deg, ${C.midNavy}, #0a1f38)` },
  { placeholder: true, category: "interior", caption: "Premium interior seating", icon: "🛥️", grad: `linear-gradient(135deg, ${C.sea}50, ${C.navy})` },
  { placeholder: true, category: "interior", caption: "Wet bar and shade hardtop", icon: "🍹", grad: `linear-gradient(135deg, ${C.midNavy}, ${C.sea}30)` },
  { placeholder: true, category: "snorkel",  caption: "Snorkeling at Buck Island", icon: "🤿", grad: `linear-gradient(135deg, #0a6b8a, #0b3d5c)` },
  { placeholder: true, category: "snorkel",  caption: "Sea turtles at Water Island", icon: "🐢", grad: `linear-gradient(135deg, #1a7a6a, #0b4a4a)` },
  { placeholder: true, category: "beach",    caption: "Honeymoon Beach, Water Island", icon: "🏖️", grad: `linear-gradient(135deg, #c8a55a30, ${C.midNavy})` },
  { placeholder: true, category: "beach",    caption: "Megan's Bay shore stop", icon: "🌴", grad: `linear-gradient(135deg, #2a5a3a, ${C.navy})` },
  { placeholder: true, category: "guests",   caption: "Guests enjoying the ride", icon: "😄", grad: `linear-gradient(135deg, ${C.gold}30, ${C.navy})` },
];

/* ─── Scroll Animation Hook ─── */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── SVG Components ─── */
function KnotIcon({ size = 40, color = C.gold, strokeW = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 80" fill="none">
      <g stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 2 L30 18 C30 24,20 28,15 28 C9 28,5 24,5 18 C5 12,11 7,16 10 C21 13,26 18,24 24 C22 30,16 33,11 31" />
        <path d="M30 18 L30 45 C30 52,36 57,43 57 C50 57,55 52,55 45 C55 38,48 33,42 35 C36 37,32 42,30 48" />
        <path d="M30 48 L30 78" />
      </g>
    </svg>
  );
}

function WavesDivider({ color = C.navy, flip = false }) {
  return (
    <div style={{ lineHeight: 0, transform: flip ? "scaleY(-1)" : "none", marginTop: flip ? 0 : "-1px", marginBottom: flip ? "-1px" : 0 }}>
      <svg viewBox="0 0 1440 60" fill="none" style={{ width: "100%", display: "block" }}>
        <path d="M0 30 C240 0, 480 60, 720 30 C960 0, 1200 60, 1440 30 L1440 60 L0 60 Z" fill={color} />
      </svg>
    </div>
  );
}

function AnchorLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="10" r="5" stroke={C.gold} strokeWidth="2" fill="none" />
      <line x1="24" y1="15" x2="24" y2="42" stroke={C.gold} strokeWidth="2" />
      <path d="M10 34 L24 46 L38 34" stroke={C.gold} strokeWidth="2" fill="none" />
      <line x1="16" y1="10" x2="32" y2="10" stroke={C.gold} strokeWidth="2" />
    </svg>
  );
}

function StarSeparator() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", margin: "16px 0" }}>
      <div style={{ width: "60px", height: "1px", background: `${C.gold}40` }} />
      <svg width="12" height="12" viewBox="0 0 12 12" fill={C.gold}>
        <polygon points="6,0 7.5,4 12,4.5 8.5,7.5 9.5,12 6,9.5 2.5,12 3.5,7.5 0,4.5 4.5,4" />
      </svg>
      <div style={{ width: "60px", height: "1px", background: `${C.gold}40` }} />
    </div>
  );
}

/* ─── Availability Calendar ─── */
function AvailabilityCalendar({ onSelectDate, selectedDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const width = useWindowWidth();
  const isMobile = width < 600;

  const fmt = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("default", { month: "long", year: "numeric" });
  const dayNames = isMobile ? ["S","M","T","W","T","F","S"] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const getStatus = (y, m, d) => {
    const date = new Date(y, m, d);
    if (date < today) return "past";
    if (BOOKED_DATES.has(fmt(y, m, d))) return "booked";
    return "available";
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ background: C.deepNavy, borderRadius: "16px", padding: isMobile ? "20px 16px" : "28px", border: `1px solid ${C.gold}20` }}>
      {/* Month nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={prevMonth} style={{ background: `${C.cream}10`, border: `1px solid ${C.gold}30`, color: C.cream, width: "38px", height: "38px", borderRadius: "8px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: isMobile ? "17px" : "20px", fontWeight: 700, color: C.cream, margin: 0 }}>{monthLabel}</h3>
        <button onClick={nextMonth} style={{ background: `${C.cream}10`, border: `1px solid ${C.gold}30`, color: C.cream, width: "38px", height: "38px", borderRadius: "8px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px", marginBottom: "6px" }}>
        {dayNames.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontFamily: "'Oswald',sans-serif", fontSize: "11px", letterSpacing: "1px", color: `${C.sand}70`, padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dateStr = fmt(viewYear, viewMonth, day);
          const status = getStatus(viewYear, viewMonth, day);
          const isSelected = selectedDate === dateStr;
          const isToday = fmt(today.getFullYear(), today.getMonth(), today.getDate()) === dateStr;
          const canClick = status === "available";

          let bg = "transparent", fg = `${C.sand}40`, border = "1px solid transparent";
          if (isSelected)        { bg = C.gold;              fg = C.navy;               border = "none"; }
          else if (isToday)      { bg = `${C.sea}30`;        fg = C.sea;                border = `1px solid ${C.sea}60`; }
          else if (status === "available") { bg = `${C.gold}10`; fg = C.cream;          border = `1px solid ${C.gold}22`; }
          else if (status === "booked")    { bg = `${C.rust}12`; fg = `${C.rust}50`;    border = `1px solid ${C.rust}18`; }

          return (
            <div key={dateStr} onClick={() => canClick && onSelectDate(dateStr)}
              style={{ height: isMobile ? "36px" : "44px", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: bg, border, cursor: canClick ? "pointer" : "default", gap: "2px", transition: "all 0.15s" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobile ? "12px" : "13px", fontWeight: isSelected ? 700 : 500, color: fg, lineHeight: 1 }}>{day}</span>
              {status === "available" && !isSelected && (
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#4CAF50" }} />
              )}
              {status === "booked" && (
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: C.rust, opacity: 0.5 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "14px", marginTop: "18px", flexWrap: "wrap", justifyContent: "center" }}>
        {[{ dot: "#4CAF50", label: "Available" }, { dot: C.rust, label: "Booked" }, { dot: C.sea, label: "Today" }, { dot: C.gold, label: "Selected" }].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: l.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: C.sand, opacity: 0.8 }}>{l.label}</span>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: C.sand, opacity: 0.45, margin: "12px 0 0", textAlign: "center", fontStyle: "italic" }}>
        Tap an available date to select it. To add booked dates, update BOOKED_DATES at the top of App.jsx.
      </p>
    </div>
  );
}

/* ─── Gallery Modal ─── */
function GalleryModal({ onClose }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    setUploading(true);
    const incoming = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        incoming.push({ src: e.target.result, name: file.name, date: new Date().toLocaleDateString() });
        if (incoming.length === files.length) {
          setPhotos((p) => [...p, ...incoming]);
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(6,18,34,0.97)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "5px", color: C.gold, margin: "0 0 4px" }}>KNOTTY MARINE CHARTERS</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: C.cream, margin: 0 }}>Photo Gallery</h2>
          </div>
          <button onClick={onClose} style={{ background: `${C.cream}10`, border: `1px solid ${C.cream}20`, color: C.cream, width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current.click()}
          style={{ border: `2px dashed ${C.gold}50`, borderRadius: "14px", padding: "36px", textAlign: "center", cursor: "pointer", marginBottom: "28px", background: `${C.gold}05` }}>
          <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>📷</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: C.cream, margin: "0 0 6px", fontWeight: 700 }}>{uploading ? "Uploading..." : "Add Your Photos"}</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, margin: 0, opacity: 0.7 }}>Drag & drop or click to select — share your Knotty Marine memories!</p>
        </div>
        {photos.length === 0 ? (
          <p style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: C.sand, opacity: 0.4, padding: "40px 0" }}>No photos yet — be the first to share your charter memories!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
            {photos.map((p, i) => (
              <div key={i} style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${C.gold}20` }}>
                <img src={p.src} alt={p.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                <div style={{ padding: "6px 10px", background: C.deepNavy }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: C.sand, margin: 0, opacity: 0.7 }}>{p.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sticky Mobile Book Button ─── */
function StickyBookButton() {
  const width = useWindowWidth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (width >= 768 || !show) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, padding: "12px 16px 20px", background: `${C.deepNavy}f4`, backdropFilter: "blur(10px)", borderTop: `2px solid ${C.gold}40` }}>
      <a href="#book-a-trip" style={{ display: "block", textAlign: "center", padding: "16px", background: C.gold, color: C.navy, borderRadius: "12px", fontFamily: "'DM Sans', sans-serif", fontSize: "17px", fontWeight: 700, textDecoration: "none", letterSpacing: "0.3px" }}>
        ⚓ Book Your Charter
      </a>
    </div>
  );
}

/* ─── Navigation ─── */
function Nav({ scrolled }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 920;

  const links = [
    { label: "Charters",     href: "#charters" },
    { label: "Book a Trip",  href: "#book-a-trip", highlight: true },
    { label: "Destinations", href: "#destinations" },
    { label: "About",        href: "#about" },
    { label: "The Boat",     href: "#the-boat" },
    { label: "Veterans",     href: "#veterans" },
  ];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "10px 24px" : "16px 24px",
        background: scrolled ? `${C.deepNavy}f0` : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.gold}20` : "1px solid transparent",
        transition: "all 0.4s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <AnchorLogo size={scrolled ? 28 : 32} />
          <div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: scrolled ? "15px" : "18px", fontWeight: 700, color: C.cream, letterSpacing: "-0.02em", display: "block", transition: "font-size 0.3s" }}>Knotty Marine</span>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "8px", letterSpacing: "4px", color: C.gold, display: "block", fontWeight: 300 }}>CHARTERS</span>
          </div>
        </a>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            {links.map((l) => (
              <a key={l.label} href={l.href} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: l.highlight ? 700 : 500,
                color: l.highlight ? C.navy : C.sand,
                padding: l.highlight ? "8px 18px" : "0",
                background: l.highlight ? C.gold : "transparent",
                borderRadius: l.highlight ? "6px" : "0",
                textDecoration: "none", letterSpacing: "0.3px", transition: "opacity 0.2s",
              }}>
                {l.label}
              </a>
            ))}
            <button onClick={() => setGalleryOpen(true)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, background: "transparent", border: `1px solid ${C.gold}40`, borderRadius: "6px", padding: "7px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
              📷 Gallery
            </button>
          </div>
        )}

        {/* Mobile: Book Now + Hamburger */}
        {isMobile && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <a href="#book-a-trip" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700, color: C.navy, background: C.gold, padding: "10px 16px", borderRadius: "8px", textDecoration: "none", whiteSpace: "nowrap" }}>
              Book Now
            </a>
            <button onClick={() => setMenuOpen(true)} style={{ background: `${C.cream}10`, border: `1px solid ${C.gold}30`, borderRadius: "8px", width: "44px", height: "44px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px" }}>
              <div style={{ width: "18px", height: "2px", background: C.cream }} />
              <div style={{ width: "18px", height: "2px", background: C.cream }} />
              <div style={{ width: "14px", height: "2px", background: C.cream }} />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile menu overlay */}
      {isMobile && menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, background: C.deepNavy, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.gold}15` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AnchorLogo size={28} />
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: C.cream }}>Knotty Marine</span>
            </div>
            <button onClick={() => setMenuOpen(false)} style={{ background: `${C.cream}10`, border: `1px solid ${C.cream}20`, color: C.cream, width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
          <div style={{ flex: 1, padding: "8px 0" }}>
            {links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: `1px solid ${C.gold}10`, fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: l.highlight ? 700 : 400, color: l.highlight ? C.gold : C.cream, textDecoration: "none" }}>
                {l.label}
                <span style={{ fontSize: "14px", opacity: 0.4 }}>→</span>
              </a>
            ))}
            <button onClick={() => { setGalleryOpen(true); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "18px 28px", borderBottom: `1px solid ${C.gold}10`, fontFamily: "'Playfair Display', serif", fontSize: "22px", color: C.cream, background: "transparent", border: "none", textAlign: "left", cursor: "pointer" }}>
              📷 Photo Gallery
              <span style={{ fontSize: "14px", opacity: 0.4 }}>→</span>
            </button>
          </div>
          <div style={{ padding: "24px 28px", borderTop: `1px solid ${C.gold}15` }}>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "3px", color: C.gold, margin: "0 0 10px" }}>CONTACT</p>
            <a href="tel:+15712327040" style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "17px", color: C.cream, textDecoration: "none", marginBottom: "6px" }}>(571) 232-7040</a>
            <a href="https://wa.me/15712327040" style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "17px", color: "#25D366", textDecoration: "none", marginBottom: "6px" }}>💬 WhatsApp</a>
            <a href="mailto:KMCUSVI@gmail.com" style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "17px", color: C.sand, textDecoration: "none" }}>KMCUSVI@gmail.com</a>
          </div>
        </div>
      )}

      {galleryOpen && <GalleryModal onClose={() => setGalleryOpen(false)} />}
    </>
  );
}

/* ─── Hero ─── */
function Hero() {
  const width = useWindowWidth();
  const isMobile = width < 768;

  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 30% 20%, ${C.midNavy}90 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, ${C.sea}20 0%, transparent 45%), linear-gradient(170deg, ${C.deepNavy} 0%, ${C.navy} 50%, ${C.midNavy} 100%)`,
      position: "relative", overflow: "hidden", textAlign: "center",
      padding: isMobile ? "100px 20px 80px" : "120px 24px 80px",
    }}>
      {/* Decorative top stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `repeating-linear-gradient(90deg, ${C.gold} 0px, ${C.gold} 14px, transparent 14px, transparent 22px)`, opacity: 0.5 }} />

      {/* Compass watermark */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.025, pointerEvents: "none" }}>
        <svg width="600" height="600" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="95" stroke={C.gold} strokeWidth="0.5" />
          <circle cx="100" cy="100" r="70" stroke={C.gold} strokeWidth="0.3" />
          {[0,45,90,135,180,225,270,315].map(a => (
            <line key={a} x1={100+Math.cos(a*Math.PI/180)*30} y1={100+Math.sin(a*Math.PI/180)*30} x2={100+Math.cos(a*Math.PI/180)*95} y2={100+Math.sin(a*Math.PI/180)*95} stroke={C.gold} strokeWidth={a%90===0?"1":"0.3"} />
          ))}
          <polygon points="100,10 106,90 100,85 94,90" fill={C.gold} />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "820px", width: "100%" }}>
        <FadeIn>
          <div style={{ marginBottom: "20px" }}><KnotIcon size={isMobile ? 40 : 50} color={C.gold} strokeW={2} /></div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: isMobile ? "13px" : "16px", letterSpacing: isMobile ? "5px" : "8px", color: C.gold, marginBottom: "14px", fontWeight: 500 }}>
            U.S. VIRGIN ISLANDS
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "clamp(36px, 10vw, 56px)" : "clamp(48px, 8vw, 88px)", fontWeight: 800, color: C.cream, margin: "0 0 10px", letterSpacing: "-0.04em", lineHeight: 1 }}>
            Private Boat Charters
          </h1>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "clamp(20px, 6vw, 32px)" : "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.gold, margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            in St. Thomas, USVI
          </h2>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: isMobile ? "15px" : "18px", color: C.sand, margin: "0 0 10px", opacity: 0.85, lineHeight: 1.5, maxWidth: "620px", marginLeft: "auto", marginRight: "auto" }}>
            Explore the Virgin Islands aboard a 2025 Monterey Elite 30 OB with twin white Mercury outboards.
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", fontSize: isMobile ? "14px" : "16px", color: `${C.sand}99`, margin: "0 0 36px", lineHeight: 1.4 }}>
            "Sun, Fun, Saltwater Memories"
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={0.5}>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
            <a href="#book-a-trip" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? "16px" : "15px", fontWeight: 700, color: C.navy, background: C.gold, padding: isMobile ? "16px 28px" : "14px 32px", borderRadius: "10px", textDecoration: "none", letterSpacing: "0.3px", boxShadow: `0 6px 28px ${C.gold}35`, width: isMobile ? "100%" : "auto", textAlign: "center" }}>
              Book Your Charter
            </a>
            <a href="#charters" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? "16px" : "15px", fontWeight: 500, color: C.cream, background: "transparent", padding: isMobile ? "16px 28px" : "14px 32px", borderRadius: "10px", textDecoration: "none", border: `1.5px solid ${C.cream}30`, width: isMobile ? "100%" : "auto", textAlign: "center" }}>
              View Charters
            </a>
            <a href="tel:+15712327040" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? "16px" : "15px", fontWeight: 500, color: C.cream, background: "transparent", padding: isMobile ? "16px 28px" : "14px 32px", borderRadius: "10px", textDecoration: "none", border: `1.5px solid ${C.rust}60`, width: isMobile ? "100%" : "auto", textAlign: "center" }}>
              Call / Text Us
            </a>
          </div>
        </FadeIn>

        {/* Veteran badge */}
        <FadeIn delay={0.65}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 24px", borderRadius: "30px", border: `1px solid ${C.gold}25`, background: `${C.gold}06` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: isMobile ? "13px" : "15px", color: C.rust, letterSpacing: "2px", fontWeight: 700 }}>★ SERVICE DISABLED VETERAN OWNED</span>
              <span style={{ color: C.gold, fontSize: "7px" }}>◆</span>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: isMobile ? "12px" : "14px", color: C.sand, letterSpacing: "1.5px", fontWeight: 500 }}>USMC RETIRED • 26 YEARS</span>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.sand, opacity: 0.65, letterSpacing: "1px" }}>
              St. Thomas, USVI  •  Up to 10 Guests  •  No Passport Required
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.8}>
          <div style={{ marginTop: "18px", display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "30px", background: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.5)" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4CAF50", boxShadow: "0 0 8px #4CAF50" }} />
            <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "12px", letterSpacing: "2px", color: C.cream, fontWeight: 500 }}>NOW BOOKING — SUMMER &amp; FALL 2026</span>
          </div>
        </FadeIn>
      </div>

      {/* Bottom wave */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <svg viewBox="0 0 1440 60" fill="none" style={{ width: "100%", display: "block" }}>
          <path d="M0 40 C360 0,720 60,1080 30 C1260 15,1380 50,1440 40 L1440 60 L0 60 Z" fill={C.cream} opacity="0.05" />
        </svg>
      </div>
    </section>
  );
}

/* ─── Rates Strip ─── */
function RatesStrip() {
  const width = useWindowWidth();
  const isMobile = width < 600;
  const rates = [
    { title: "Half-Day", sub: "4 Hours  •  Up to 10 guests", price: "From $700", color: C.sea, bg: `${C.sea}14` },
    { title: "Full-Day", sub: "7–8 Hours  •  Up to 10 guests", price: "From $1,300", color: C.gold, bg: `${C.gold}18`, popular: true },
    { title: "Sunset Cruise", sub: "2.5 Hours  •  Up to 10 guests", price: "From $450", color: C.rust, bg: `${C.rust}14` },
  ];
  return (
    <div style={{ background: C.warmWhite, padding: "28px 20px 16px", borderBottom: `1px solid ${C.sand}30` }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", marginBottom: "14px" }}>
          {rates.map((r, i) => (
            <div key={i} style={{ flex: `1 1 ${isMobile ? "100%" : "180px"}`, maxWidth: isMobile ? "100%" : "260px", background: r.bg, borderRadius: "12px", padding: "18px 20px", border: `1.5px solid ${r.color}30`, position: "relative" }}>
              {r.popular && <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: C.gold, color: C.navy, padding: "2px 12px", borderRadius: "20px", fontFamily: "'Oswald', sans-serif", fontSize: "9px", letterSpacing: "2px", fontWeight: 700, whiteSpace: "nowrap" }}>MOST POPULAR</div>}
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: C.navy, margin: "0 0 4px" }}>{r.title}</p>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "1.5px", color: r.color, margin: "0 0 8px" }}>{r.sub}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: C.navy, margin: 0 }}>{r.price}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.rust, fontWeight: 700, margin: 0 }}>
          ⚠ Price does not include Fuel or Gratuity  •  Military, veterans &amp; locals: 10% off — code <strong>USMC10</strong>
        </p>
      </div>
    </div>
  );
}

/* ─── Inclusions Strip ─── */
function InclusionsStrip() {
  const width = useWindowWidth();
  const cols = width < 480 ? 2 : width < 768 ? 3 : 6;
  const items = [
    { icon: "⚓", label: "Licensed Captain" },
    { icon: "🤿", label: "Snorkel Gear for All" },
    { icon: "💧", label: "Water & Ice" },
    { icon: "🎵", label: "Bluetooth Sound" },
    { icon: "🔒", label: "100% Private" },
    { icon: "⛽", label: "Fuel Transparent" },
  ];
  return (
    <div style={{ background: C.cream, padding: "20px", borderTop: `1px solid ${C.gold}20`, borderBottom: `1px solid ${C.gold}20` }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "10px", marginBottom: "12px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", padding: "12px 8px", background: "#fff", borderRadius: "10px", border: `1px solid ${C.sand}50` }}>
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, color: C.navy, textAlign: "center", letterSpacing: "0.3px" }}>{item.label}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700, color: C.navy, margin: 0 }}>
          All charters are private — your group only. No strangers, no shared tours.
        </p>
      </div>
    </div>
  );
}

/* ─── Booking Section ─── */
function AvailabilityBadge({ status }) {
  const cfg = AVAIL[status] || AVAIL.available;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", background: cfg.bg }}>
      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

function BookingSection() {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [selectedTrip, setSelectedTrip] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    pickup: "",
    requests: "",
    policyAccepted: false,
  });
  const [formStatus, setFormStatus] = useState("idle");
  const formRef = useRef(null);

  const handleCardSelect = (id) => {
    setSelectedTrip(id);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const set = (field, val) => setFormData((p) => ({ ...p, [field]: val }));

  const [errorMsg, setErrorMsg] = useState("");

  const handleDateSelect = (dateStr) => {
    setFormData((p) => ({ ...p, date: dateStr }));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrip) { alert("Please select a charter type from the cards above."); return; }
    if (!formData.date) { alert("Please select a date from the availability calendar above."); return; }
    if (!formData.policyAccepted) { alert("Please accept the weather and cancellation policy to continue."); return; }

    setFormStatus("submitting");
    const payload = {
      ...formData,
      tripId: selectedTrip,
      tripLabel: BOOKING_TRIPS.find((t) => t.id === selectedTrip)?.title || "Custom",
      submittedAt: new Date().toISOString(),
      source: "kmcusvi.com booking form",
    };
    try {
      await sendBookingEmail(payload);
      await sendBookingTextAlert(payload);
      setFormStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please call us directly.");
      setFormStatus("error");
    }
  };

  const cardCols = isMobile ? 1 : isTablet ? 2 : 4;
  const inputStyle = { width: "100%", padding: "14px 16px", borderRadius: "8px", border: `1px solid ${C.sand}80`, fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: C.navy, background: "#fff", outline: "none", boxSizing: "border-box", minHeight: "48px" };
  const labelStyle = { fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: C.navy, display: "block", marginBottom: "6px", letterSpacing: "0.3px" };

  return (
    <section id="book-a-trip" style={{ padding: isMobile ? "60px 16px 80px" : "80px 24px", background: `linear-gradient(180deg, ${C.cream}, ${C.warmWhite})` }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        {/* Header */}
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>NOW ACCEPTING BOOKINGS</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "32px" : "44px", fontWeight: 800, color: C.navy, margin: "0 0 12px", letterSpacing: "-0.03em" }}>Book a Trip</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#8b8378", maxWidth: "520px", margin: "0 auto 8px", lineHeight: 1.6 }}>
              Pick your charter, select a date on the calendar below, and send your request. Captain Brian responds within 2 hours.
            </p>
          </div>
        </FadeIn>

        {/* Trip Cards */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cardCols}, 1fr)`, gap: "18px", marginBottom: "56px" }}>
          {BOOKING_TRIPS.map((trip, i) => {
            const isSelected = selectedTrip === trip.id;
            const avail = AVAIL[trip.availability];
            const isUnavailable = trip.availability === "booked";
            return (
              <FadeIn key={trip.id} delay={i * 0.08}>
                <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: isSelected ? `2px solid ${C.gold}` : `1px solid ${C.sand}50`, boxShadow: isSelected ? `0 8px 32px ${C.gold}20` : "0 3px 16px rgba(0,0,0,0.05)", transition: "all 0.25s", display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Card header */}
                  <div style={{ padding: "24px 22px 16px", background: isSelected ? `linear-gradient(135deg, ${C.navy}, ${C.midNavy})` : `linear-gradient(135deg, ${C.cream}80, ${C.warmWhite})` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <span style={{ fontSize: "30px" }}>{trip.icon}</span>
                      <AvailabilityBadge status={trip.availability} />
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: isSelected ? C.cream : C.navy, margin: "0 0 4px" }}>{trip.title}</h3>
                    <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "2px", color: isSelected ? C.gold : C.rust, margin: "0 0 6px", fontWeight: 500 }}>{trip.duration}  •  {trip.capacity}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "20px", fontWeight: 800, color: isSelected ? C.gold : C.navy, margin: 0 }}>{trip.price}</p>
                  </div>
                  {/* Card body */}
                  <div style={{ padding: "16px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", lineHeight: 1.7, color: "#6b655e", margin: "0 0 16px" }}>{trip.desc}</p>
                    <div style={{ marginBottom: "20px" }}>
                      {trip.includes.map((f, j) => (
                        <div key={j} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "4px 0" }}>
                          <span style={{ color: C.sea, fontSize: "12px", flexShrink: 0 }}>✓</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#5a554e" }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => !isUnavailable && handleCardSelect(trip.id)} disabled={isUnavailable} style={{
                      display: "block", width: "100%", padding: "13px 16px", borderRadius: "8px", textAlign: "center", cursor: isUnavailable ? "not-allowed" : "pointer", border: "none",
                      background: isSelected ? C.gold : isUnavailable ? "#E0E0E0" : `${C.navy}08`,
                      color: isSelected ? C.navy : isUnavailable ? "#9E9E9E" : C.navy,
                      border: isSelected ? "none" : isUnavailable ? "none" : `1.5px solid ${C.navy}20`,
                      fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700,
                      transition: "all 0.2s", minHeight: "48px",
                    }}>
                      {isUnavailable ? "Not Available" : isSelected ? "✓ Selected" : trip.availability === "request" ? "Request to Book" : "Check Availability"}
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Step 2 — Availability Calendar */}
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", marginTop: "8px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${C.gold}` }}>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "14px", color: C.gold, fontWeight: 700 }}>2</span>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: 700, color: C.navy, margin: 0 }}>Check Availability &amp; Select Your Date</h3>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#8b8378", margin: "2px 0 0" }}>Green dot = available · Red = booked · Tap a date to select it</p>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div style={{ maxWidth: "520px", marginBottom: "52px" }}>
            <AvailabilityCalendar onSelectDate={handleDateSelect} selectedDate={formData.date} />
          </div>
        </FadeIn>

        {/* Step 3 — Booking Form */}
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${C.gold}` }}>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "14px", color: C.gold, fontWeight: 700 }}>3</span>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: 700, color: C.navy, margin: 0 }}>Complete Your Booking Request</h3>
          </div>
        </FadeIn>
        <div ref={formRef} style={{ maxWidth: "720px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ background: "#fff", borderRadius: "20px", padding: isMobile ? "28px 20px" : "40px", border: `1px solid ${C.sand}40`, boxShadow: "0 6px 32px rgba(0,0,0,0.06)" }}>
              {/* Selected summary */}
              {(selectedTrip || formData.date) && (
                <div style={{ marginBottom: "24px", padding: "14px 18px", borderRadius: "10px", background: `${C.navy}08`, border: `1px solid ${C.navy}15` }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: C.navy, margin: 0, lineHeight: 1.6 }}>
                    {selectedTrip && <span>Charter: <strong>{BOOKING_TRIPS.find((t) => t.id === selectedTrip)?.title}</strong>{"  "}</span>}
                    {formData.date && <span>Date: <strong>{new Date(formData.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</strong></span>}
                  </p>
                </div>
              )}

              {formStatus === "success" ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "52px", marginBottom: "16px" }}>⚓</div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "26px", color: C.navy, margin: "0 0 10px" }}>Booking Request Sent!</h3>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", color: "#6b655e", margin: "0 0 8px", lineHeight: 1.6 }}>
                    Your email client has opened with all your booking details pre-filled to send to Captain Brian.<br />
                    <strong>Hit Send in your email app</strong> — Brian will confirm within 2 hours.
                  </p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "#8b8378", margin: "0 0 24px" }}>
                    Prefer to call or text? We're ready: <strong>(571) 232-7040</strong>
                  </p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                    <a href="tel:+15712327040" style={{ padding: "12px 22px", borderRadius: "8px", background: C.navy, color: C.cream, fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Call (571) 232-7040</a>
                    <a href="https://wa.me/15712327040" target="_blank" rel="noopener noreferrer" style={{ padding: "12px 22px", borderRadius: "8px", background: "#25D366", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>💬 WhatsApp</a>
                  </div>
                </div>

              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Row 1: Name + Email */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input required style={inputStyle} type="text" placeholder="Your full name" value={formData.name} onChange={(e) => set("name", e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address *</label>
                      <input required style={inputStyle} type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => set("email", e.target.value)} />
                    </div>
                  </div>

                  {/* Row 2: Phone + Guests */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={labelStyle}>Phone Number *</label>
                      <input required style={inputStyle} type="tel" placeholder="(555) 000-0000" value={formData.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Number of Guests *</label>
                      <select required style={inputStyle} value={formData.guests} onChange={(e) => set("guests", e.target.value)}>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Charter type */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Charter Type *</label>
                    <select required style={inputStyle} value={selectedTrip} onChange={(e) => setSelectedTrip(e.target.value)}>
                      <option value="">— Select a charter —</option>
                      {BOOKING_TRIPS.map((t) => (
                        <option key={t.id} value={t.id} disabled={t.availability === "booked"}>{t.title} — {t.price}{t.availability === "booked" ? " (Unavailable)" : ""}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 4: Date + Time */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={labelStyle}>
                        Preferred Date *{" "}
                        {formData.date && <span style={{ color: "#4CAF50", fontWeight: 400, fontSize: "12px" }}>✓ Selected from calendar</span>}
                      </label>
                      <input required style={{ ...inputStyle, borderColor: formData.date ? "#4CAF50" : `${C.sand}80` }} type="date" min={new Date().toISOString().split("T")[0]} value={formData.date} onChange={(e) => set("date", e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Preferred Start Time *</label>
                      <select required style={inputStyle} value={formData.time} onChange={(e) => set("time", e.target.value)}>
                        <option value="">— Select a time —</option>
                        {["7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM (Sunset)","5:30 PM (Sunset)"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pickup */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Pickup Location / Hotel or Villa</label>
                    <input style={inputStyle} type="text" placeholder="e.g. Red Hook Marina, Havensight Dock, or hotel name" value={formData.pickup} onChange={(e) => set("pickup", e.target.value)} />
                  </div>

                  {/* Special requests */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={labelStyle}>Special Requests or Questions</label>
                    <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Occasion (birthday, proposal, anniversary), dietary needs, preferred destinations, anything else..." value={formData.requests} onChange={(e) => set("requests", e.target.value)} />
                  </div>

                  {/* Policy checkbox */}
                  <div style={{ marginBottom: "28px", padding: "16px 18px", background: `${C.cream}`, borderRadius: "10px", border: `1px solid ${C.sand}50` }}>
                    <label style={{ display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer" }}>
                      <input type="checkbox" checked={formData.policyAccepted} onChange={(e) => set("policyAccepted", e.target.checked)} style={{ width: "20px", height: "20px", marginTop: "2px", flexShrink: 0, accentColor: C.navy, cursor: "pointer" }} />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#5a554e", lineHeight: 1.6 }}>
                        <strong>I acknowledge the weather and cancellation policy:</strong> If conditions are unsafe, Captain Brian will contact me at least 24 hours in advance to reschedule at no charge. Cancellations by the guest with less than 48 hours notice may be subject to a rebooking fee. All charters are private and priced as listed. Fuel and gratuity are not included in the base charter price.
                      </span>
                    </label>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={formStatus === "submitting"} style={{ display: "block", width: "100%", padding: "18px", borderRadius: "12px", background: formStatus === "submitting" ? `${C.gold}80` : C.gold, color: C.navy, fontFamily: "'DM Sans', sans-serif", fontSize: "17px", fontWeight: 700, border: "none", cursor: formStatus === "submitting" ? "wait" : "pointer", letterSpacing: "0.3px", boxShadow: `0 4px 20px ${C.gold}30`, minHeight: "56px" }}>
                    {formStatus === "submitting" ? "Sending Booking Request..." : "Send Booking Request ⚓"}
                  </button>

                  {formStatus === "error" && (
                    <div style={{ marginTop: "14px", padding: "14px 18px", borderRadius: "10px", background: `${C.rust}08`, border: `1px solid ${C.rust}25`, textAlign: "center" }}>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: C.rust, margin: "0 0 8px", fontWeight: 600 }}>
                        {errorMsg || "Something went wrong. Please try again."}
                      </p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#8b8378", margin: 0 }}>
                        Or reach us directly: <a href="tel:+15712327040" style={{ color: C.navy, fontWeight: 600 }}>(571) 232-7040</a> · <a href="https://wa.me/15712327040" style={{ color: "#25D366", fontWeight: 600 }}>WhatsApp</a>
                      </p>
                    </div>
                  )}

                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#9b9590", textAlign: "center", margin: "12px 0 0", lineHeight: 1.5 }}>
                    We respond within 2 hours during charter season. Your info is never shared or sold.
                  </p>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── Photo Gallery Section ─── */
function PhotoGallerySection() {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const filtered = activeCategory === "all" ? GALLERY_ITEMS : GALLERY_ITEMS.filter((p) => p.category === activeCategory);
  const cols = isMobile ? 1 : width < 1024 ? 2 : 3;

  return (
    <section id="photo-gallery" style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy} 60%, ${C.midNavy})` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.gold, marginBottom: "10px", fontWeight: 500 }}>LIFE ON THE WATER</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "30px" : "42px", fontWeight: 800, color: C.cream, margin: 0, letterSpacing: "-0.03em" }}>Photo Gallery</h2>
          </div>
        </FadeIn>

        {/* Category tabs */}
        <FadeIn delay={0.1}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "32px" }}>
            {GALLERY_CATS.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ padding: "8px 16px", borderRadius: "20px", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: activeCategory === cat.id ? 700 : 500, background: activeCategory === cat.id ? C.gold : `${C.cream}12`, color: activeCategory === cat.id ? C.navy : C.sand, transition: "all 0.2s", minHeight: "36px" }}>
                {cat.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Photo grid */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px" }}>
          {filtered.map((photo, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div onClick={() => !photo.placeholder && setLightboxSrc(photo.src)} style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.gold}15`, cursor: photo.placeholder ? "default" : "zoom-in", position: "relative", aspectRatio: "4/3" }}>
                {photo.placeholder ? (
                  <div style={{ width: "100%", height: "100%", background: photo.grad, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <span style={{ fontSize: "32px" }}>{photo.icon}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, opacity: 0.7, textAlign: "center", padding: "0 16px" }}>{photo.caption}</span>
                    
                  </div>
                ) : (
                  <img src={photo.src} alt={photo.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s" }} />
                )}
                {!photo.placeholder && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(6,18,34,0.8))", padding: "20px 14px 12px" }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.cream, margin: 0, opacity: 0.9 }}>{photo.caption}</p>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, opacity: 0.6, margin: "0 0 10px" }}>
              Follow us on Instagram for real charter photos from every trip — updated after every sail
            </p>
            <a href="https://www.instagram.com/KnottyMarineUSVI" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.gold, textDecoration: "none", fontWeight: 600 }}>
              📸 @KnottyMarineUSVI
            </a>
          </div>
        </FadeIn>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div onClick={() => setLightboxSrc(null)} style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", cursor: "zoom-out" }}>
          <img src={lightboxSrc} alt="Charter photo" style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: "10px" }} />
          <button onClick={() => setLightboxSrc(null)} style={{ position: "fixed", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      )}
    </section>
  );
}

/* ─── Charter Card Data ─── */
const charters = [
  { title: "Half-Day Adventure", hours: "4 Hours", price: "From $700", bestFor: "Best for: Families • First-timers • Cruise ship guests", desc: "Swim with sea turtles at Buck Island, beach hop to Water Island, and explore hidden coves around St. Thomas.", features: ["Snorkel gear provided", "Cooler with water & ice", "Bluetooth sound system", "Up to 10 guests", "No passport required"], icon: "☀️", popular: false },
  { title: "Full-Day Expedition", hours: "7-8 Hours", price: "From $1,300", bestFor: "Best for: Groups who want everything", desc: "Circle St. John's north shore, snorkel world-class reefs, and anchor for a lunch stop — Cruz Bay, Lime Out, or Pizza Pi Vi.", features: ["Everything in Half-Day", "Cooler with water & ice", "Lunch stop included*", "Multi-island route", "Up to 10 guests"], icon: "🏝️", popular: true, lunchNote: true, urgency: true },
  { title: "Sunset Cruise", hours: "2.5 Hours", price: "From $450", bestFor: "Best for: Couples • Proposals • Anniversaries", desc: "Watch the Caribbean sun melt into the horizon aboard Luna's Wake. Perfect for proposals and celebrations.", features: ["Cooler with ice & water", "Prime sunset route", "Bluetooth sound system", "Up to 10 guests"], icon: "🌅", popular: false },
  { title: "Bachelorette / Bachelor Party", hours: "7-8 Hours", price: "From $1,300", bestFor: "Best for: Parties • Birthdays • Celebrations", desc: "Celebrate Knotty style — beach bar crawl, snorkeling, music, and the most scenic backdrop in the USVI.", features: ["Party-ready sound system", "Cooler with water & ice", "Beach bar & snorkel stops", "Decorations welcome", "Up to 10 guests"], icon: "🎉", popular: false },
  { title: "Cruise Ship Express", hours: "4 Hours", price: "From $1,300", bestFor: "Best for: Cruise passengers • Havensight departure", desc: "Only in port for the day? Skip the crowds. Havensight pickup, best snorkeling, beaches, and Lime Out — all in 4 hours.", features: ["Havensight pickup & dropoff", "Snorkel & beach stop", "Lime Out floating taco bar", "Cooler with water & ice", "Up to 10 guests"], icon: "🚢", popular: false },
  { title: "Circumnavigate STJ & STT", hours: "7-8 Hours", price: "From $1,300", bestFor: "Best for: Explorers • Photography buffs", desc: "See it all from the water. Circle St. John and/or St. Thomas — hidden coves, cliffs, snorkel spots, and landmarks.", features: ["Full island circumnavigation", "Snorkel stops at top spots", "Scenic coastal exploration", "Cooler with water & ice", "Up to 10 guests"], icon: "🗺️", popular: false },
  { title: "Circle St. John Foodie Tour", hours: "7-8 Hours", price: "From $1,500", bestFor: "Best for: Food lovers • Full island experience", desc: "Eat and snorkel your way around St. John. Choose your lunch: Lovango Beach Club, Cruz Bay, Pizza Pi Vi, or Lime Out.", features: ["Your choice of lunch spot", "Trunk Bay snorkeling", "Full circumnavigation", "Cooler with water & ice", "Up to 10 guests"], icon: "🍕", popular: false, lunchNote: true },
  { title: "Build Your Own Charter", hours: "Full Day", price: "From $1,300", bestFor: "Best for: Repeat visitors • Anyone with a vision", desc: "You pick it, we run it. Captain Brian will chart the perfect course for whatever day you have in mind.", features: ["Custom route — you decide", "Choose your lunch spot", "Snorkel where you want", "Cooler with water & ice", "Up to 10 guests"], icon: "🧭", popular: false },
];

function CharterCard({ charter, index }) {
  const width = useWindowWidth();
  const isMobile = width < 600;
  return (
    <FadeIn delay={index * 0.08} style={{ flex: "1 1 260px", maxWidth: isMobile ? "100%" : "340px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: charter.popular ? `2px solid ${C.gold}` : `1px solid ${C.sand}50`, boxShadow: charter.popular ? `0 10px 36px ${C.gold}15` : "0 4px 18px rgba(0,0,0,0.04)", position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
        {charter.popular && <div style={{ position: "absolute", top: "14px", right: "14px", background: C.gold, color: C.navy, padding: "3px 10px", borderRadius: "20px", fontFamily: "'Oswald', sans-serif", fontSize: "9px", letterSpacing: "2px", fontWeight: 600 }}>MOST POPULAR</div>}
        <div style={{ padding: "28px 24px 18px", background: charter.popular ? `linear-gradient(135deg, ${C.navy}, ${C.midNavy})` : `linear-gradient(135deg, ${C.cream}80, ${C.warmWhite})` }}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "10px" }}>{charter.icon}</span>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "21px", fontWeight: 700, color: charter.popular ? C.cream : C.navy, margin: "0 0 4px" }}>{charter.title}</h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: charter.popular ? `${C.gold}cc` : C.rust, margin: "0 0 6px", fontStyle: "italic" }}>{charter.bestFor}</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "2px", color: charter.popular ? C.gold : C.rust, fontWeight: 500 }}>{charter.hours}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "19px", fontWeight: 700, color: charter.popular ? C.gold : C.navy }}>{charter.price}</span>
          </div>
        </div>
        <div style={{ padding: "16px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", lineHeight: 1.7, color: "#6b655e", margin: "0 0 16px" }}>{charter.desc}</p>
          {charter.lunchNote && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#8b8378", margin: "-8px 0 12px", fontStyle: "italic", lineHeight: 1.5 }}>* Lunch options: Cruz Bay · Lime Out · Pizza Pi Vi — cost not included.</p>}
          <div style={{ marginTop: "auto" }}>
            {charter.features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderTop: i === 0 ? `1px solid ${C.sand}30` : "none" }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={C.sea} strokeWidth="1.5" /><path d="M4 7 L6 9 L10 5" stroke={C.sea} strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#5a554e" }}>{f}</span>
              </div>
            ))}
          </div>
          <a href="#book-a-trip" style={{ display: "block", textAlign: "center", marginTop: "18px", padding: "12px", borderRadius: "8px", background: charter.popular ? C.gold : "transparent", color: C.navy, border: charter.popular ? "none" : `1.5px solid ${C.navy}20`, fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, textDecoration: "none", minHeight: "44px", lineHeight: "20px" }}>
            {charter.popular ? "Book This Charter" : "Check Availability"}
          </a>
          {charter.urgency && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.rust, margin: "8px 0 0", textAlign: "center", fontStyle: "italic" }}>📅 Reserve early — fills fast December–April</p>}
        </div>
      </div>
    </FadeIn>
  );
}

/* ─── Help Me Choose ─── */
function HelpMeChoose() {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const opts = [
    { time: "2–4 hours available", rec: "Half-Day Adventure ($700) or Sunset Cruise ($450)", icon: "☀️" },
    { time: "Full day, want everything", rec: "Full-Day Island Hop ($1,300) — most popular", icon: "🏝️" },
    { time: "Special occasion or party", rec: "Bachelorette/Bachelor Party ($1,300) or Build Your Own", icon: "🎉" },
    { time: "Just off a cruise ship", rec: "Cruise Ship Express ($1,300) — Havensight pickup", icon: "🚢" },
    { time: "Want to eat your way around St. John", rec: "Circle St. John Foodie Tour ($1,500)", icon: "🍕" },
  ];
  return (
    <FadeIn>
      <div style={{ maxWidth: "680px", margin: "40px auto 0", background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, borderRadius: "16px", padding: isMobile ? "24px 20px" : "32px", border: `1px solid ${C.gold}20` }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: C.cream, margin: "0 0 6px", textAlign: "center" }}>Not sure which charter is right for you?</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, textAlign: "center", margin: "0 0 18px", opacity: 0.8 }}>Here's a quick guide:</p>
        {opts.map((o, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderTop: `1px solid ${C.gold}10` }}>
            <span style={{ fontSize: "16px", flexShrink: 0 }}>{o.icon}</span>
            <div>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "1px", color: C.gold, margin: "0 0 2px", fontWeight: 500 }}>{o.time}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, margin: 0 }}>→ {o.rec}</p>
            </div>
          </div>
        ))}
        <p style={{ textAlign: "center", marginTop: "18px", marginBottom: 0 }}>
          <a href="mailto:KMCUSVI@gmail.com" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.gold, textDecoration: "none", fontStyle: "italic" }}>
            Still not sure? Email or text us — we'll help plan your perfect day →
          </a>
        </p>
      </div>
    </FadeIn>
  );
}

const studentTrip = {
  title: "USVI Student Discovery Trip", price: "$125 per student", hours: "3-4 Hours",
  desc: "Giving back to the community that gave us a home. Educational snorkeling, marine life identification, island geography, and ocean safety — led by a retired Marine Corps Lieutenant Colonel.",
  requirements: ["Must be a USVI school or youth organization", "Minimum 6 students, up to 10", "Snacks, water & ice provided", "Advance booking required"],
};

const testimonials = [
  { name: "Jake & Michelle R.", loc: "Austin, TX", text: "Best day of our entire trip. Captain Brian knew every hidden cove and had the music cranked. Absolutely coming back." },
  { name: "SSgt Davis (Ret.)", loc: "Camp Lejeune, NC", text: "It's not every day you find a fellow Marine running a charter in paradise. The vet discount was a nice touch but the experience was worth full price. Semper Fi, brother." },
  { name: "The Henderson Family", loc: "Chicago, IL", text: "We did the full-day with our two teenagers and it was the first time in years nobody looked at their phone. Luna's Wake is a beautiful boat and Brian is the real deal." },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function KnottyMarineSite() {
  const [scrolled, setScrolled] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 768;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.warmWhite, fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Oswald:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <Nav scrolled={scrolled} />
      <StickyBookButton />
      <Hero />

      {/* Social proof bar */}
      <div style={{ background: C.cream, padding: "18px 20px", display: "flex", justifyContent: "center", gap: isMobile ? "24px" : "48px", flexWrap: "wrap", borderBottom: `1px solid ${C.sand}40` }}>
        {[
          { num: "2024", label: "Boat of the Year" },
          { num: "600 HP", label: "Twin Mercury Power" },
          { num: "26", label: "Years USMC Service" },
          { num: "30'", label: "Monterey Elite OB" },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "22px" : "26px", fontWeight: 800, color: C.navy, display: "block" }}>{s.num}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: "#8b8378", letterSpacing: "1px" }}>{s.label}</span>
            </div>
          </FadeIn>
        ))}
      </div>

      <RatesStrip />
      <InclusionsStrip />

      {/* ── 3 WAYS TO BOOK BAR ── */}
      <div style={{ background: C.navy, padding: isMobile ? "20px 16px" : "18px 24px", borderBottom: `2px solid ${C.gold}30` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", letterSpacing: "4px", color: C.gold, textAlign: "center", margin: "0 0 14px", fontWeight: 500 }}>3 WAYS TO BOOK YOUR CHARTER</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#book-a-trip" style={{ flex: "1 1 160px", maxWidth: "220px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 18px", borderRadius: "10px", background: C.gold, color: C.navy, fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
              📋 Fill Out the Form
            </a>
            <a href="tel:+15712327040" style={{ flex: "1 1 160px", maxWidth: "220px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 18px", borderRadius: "10px", background: `${C.cream}12`, color: C.cream, border: `1px solid ${C.cream}25`, fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
              📞 Call (571) 232-7040
            </a>
            <a href="https://wa.me/15712327040" target="_blank" rel="noopener noreferrer" style={{ flex: "1 1 160px", maxWidth: "220px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 18px", borderRadius: "10px", background: "#25D366", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
              💬 Text / WhatsApp
            </a>
          </div>
          <p style={{ textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: C.sand, margin: "12px 0 0", opacity: 0.65 }}>
            Captain Brian responds within 2 hours  •  Military &amp; locals 10% off with code <strong style={{ color: C.gold }}>USMC10</strong>
          </p>
        </div>
      </div>

      {/* Charters */}
      <section id="charters" style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(180deg, ${C.warmWhite}, ${C.cream})` }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>CHOOSE YOUR ADVENTURE</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "30px" : "44px", fontWeight: 800, color: C.navy, margin: "0 0 10px", letterSpacing: "-0.03em" }}>Charter Experiences</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#8b8378", maxWidth: "520px", margin: "0 auto 10px", lineHeight: 1.6 }}>Private charters for every occasion — half-day adventures to full-day island expeditions.</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.rust, fontWeight: 700, margin: 0 }}>⚠ Price does not include Fuel or Gratuity</p>
            </div>
          </FadeIn>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", alignItems: "stretch" }}>
            {charters.map((c, i) => <CharterCard key={i} charter={c} index={i} />)}
          </div>
          <HelpMeChoose />

          {/* Student + Shuttle */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginTop: "36px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
            <FadeIn>
              <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, borderRadius: "16px", padding: "24px", border: `2px solid ${C.sea}40` }}>
                <span style={{ fontSize: "24px", display: "block", marginBottom: "10px" }}>🎓</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: C.cream, margin: "0 0 4px" }}>{studentTrip.title}</h3>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "16px", color: C.gold, margin: "0 0 10px", fontWeight: 600 }}>{studentTrip.price}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, lineHeight: 1.6, margin: "0 0 14px" }}>{studentTrip.desc}</p>
                {studentTrip.requirements.map((r, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ color: C.sea, fontSize: "10px", marginTop: "2px" }}>●</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.sand }}>{r}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, borderRadius: "16px", padding: "24px", border: `2px solid ${C.gold}30` }}>
                <span style={{ fontSize: "24px", display: "block", marginBottom: "10px" }}>⛴️</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: C.cream, margin: "0 0 4px" }}>Private Shuttle — St. John</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, lineHeight: 1.6, margin: "12px 0 14px" }}>Skip the ferry lines. Private water shuttle between St. Thomas and St. John — in style aboard Luna's Wake.</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.gold, fontWeight: 600 }}>Contact us for shuttle pricing and availability.</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div style={{ textAlign: "center", marginTop: "36px", padding: "20px", background: "#fff", borderRadius: "12px", border: `1px solid ${C.sand}40` }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8b8378", margin: "0 0 6px" }}>All charters include snorkel gear, water, ice, and Bluetooth speakers. No passport required for USVI trips.</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.rust, margin: "0 0 4px", fontWeight: 700 }}>⚠ Price does not include Fuel or Gratuity.</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.rust, margin: 0, fontWeight: 600 }}>Military, veterans &amp; locals receive 10% off — use code <strong>USMC10</strong></p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Book a Trip Section */}
      <BookingSection />

      {/* Photo Gallery */}
      <PhotoGallerySection />

      {/* Destinations */}
      <section id="destinations" style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy} 55%, ${C.midNavy})`, position: "relative" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "44px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.gold, marginBottom: "10px", fontWeight: 500 }}>WHERE WE TAKE YOU</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "28px" : "40px", fontWeight: 800, color: C.cream, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Popular Destinations</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.sand, opacity: 0.8 }}>No passport required — all within the U.S. Virgin Islands</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : width < 1024 ? "1fr 1fr" : "repeat(3, 1fr)", gap: "14px" }}>
            {[
              { name: "Buck Island", desc: "Swim with sea turtles and snorkel a sunken Navy barge in 30 feet of crystal-clear water.", icon: "🐢" },
              { name: "Water Island / Honeymoon Beach", desc: "The 'fourth Virgin Island' — white sand, beach bars, and total relaxation minutes from St. Thomas.", icon: "🏖️" },
              { name: "St. John North Shore", desc: "Trunk Bay, Cinnamon Bay, Maho Bay — the Virgin Islands National Park's most beautiful beaches.", icon: "🌴" },
              { name: "Pizza Pi Vi", desc: "The legendary floating pizza boat anchored in Christmas Cove. Order from the water, eat the best pizza in the Caribbean.", icon: "🍕", link: "https://pizza-pi.com/" },
              { name: "Lime Out", desc: "Floating taco bar in Coral Harbor. Craft tacos, cold drinks, Instagram-worthy views — by boat only.", icon: "🌮", link: "https://limeoutvi.com/" },
              { name: "Lovango Beach Club", desc: "Upscale private island beach club with stunning views. Accessible only by boat — a true USVI hidden gem.", icon: "🍹", link: "https://www.lovangovi.com/" },
              { name: "Christmas Cove", desc: "Protected anchorage with great snorkeling, calm water, and easy access to Pizza Pi.", icon: "⚓" },
              { name: "Megan's Bay", desc: "One of the world's most beautiful beaches — white sand, calm turquoise water, stunning mountains.", icon: "🌊" },
              { name: "Brewer's Bay", desc: "A quiet locals' favorite. Great snorkeling and a relaxed, off-the-beaten-path vibe.", icon: "🏄" },
              { name: "Sunset Cruise Route", desc: "Watch the Caribbean sun melt into the horizon from the water — unforgettable golden skies.", icon: "🌇" },
              { name: "Island Hopping", desc: "St. Thomas, St. John, Water Island, and beyond — every stop brings a new adventure.", icon: "🗺️" },
              { name: "Private Island Beach", desc: "Secluded beaches accessible only by boat. Drop anchor and have paradise all to yourselves.", icon: "🌅" },
              { name: "Day Drinking on the Boat", desc: "Sometimes the itinerary is simple: good music, cold drinks, warm water, great company.", icon: "🍺" },
              { name: "Family Experience", desc: "Captain Brian is a grandfather himself. Kid-friendly routes, life jackets for all sizes.", icon: "👨‍👩‍👧‍👦" },
              { name: "Daddy Daughter Day", desc: "Make memories she'll talk about forever. A private charter just for the two of you.", icon: "💛" },
            ].map((d, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div style={{ background: `${C.cream}06`, borderRadius: "12px", padding: "18px", border: `1px solid ${C.gold}12` }}>
                  <span style={{ fontSize: "22px", display: "block", marginBottom: "8px" }}>{d.icon}</span>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: C.cream, margin: "0 0 6px" }}>
                    {d.link ? <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ color: C.gold, textDecoration: "none" }}>{d.name} ↗</a> : d.name}
                  </h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, lineHeight: 1.6, margin: 0, opacity: 0.8 }}>{d.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <WavesDivider color={C.navy} flip />
      <section id="about" style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy} 55%, ${C.midNavy})`, position: "relative" }}>
        <div style={{ maxWidth: "880px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.gold, marginBottom: "10px", fontWeight: 500, textAlign: "center" }}>THE CAPTAIN'S STORY</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "28px" : "44px", fontWeight: 800, color: C.cream, margin: "0 0 8px", letterSpacing: "-0.03em", textAlign: "center" }}>From Dress Blues to Ocean Blues</h2>
            <StarSeparator />
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr", gap: "28px", marginTop: "36px", alignItems: "start" }}>
              {/* Family photo */}
              <div style={{ aspectRatio: "3/4", borderRadius: "12px", overflow: "hidden", border: `2px solid ${C.gold}25`, display: isMobile ? "none" : "block" }}>
                <img src={familyPhoto} alt="Captain Brian with family" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
              </div>
              {/* Text */}
              <div>
                {isMobile && <div style={{ borderRadius: "12px", overflow: "hidden", border: `2px solid ${C.gold}25`, marginBottom: "24px", aspectRatio: "4/3" }}><img src={familyPhoto} alt="Captain Brian with family" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", lineHeight: 1.8, color: C.sand, margin: "0 0 18px" }}>After 26 years in the United States Marine Corps, Captain Brian traded his dress blues for a boat and flip flops — and his Assault Amphibian Vehicle for a boat slip in the U.S. Virgin Islands.</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", lineHeight: 1.8, color: C.sand, margin: "0 0 18px" }}>Captain Brian served as a Lieutenant Colonel — leading Marines through training and deployments where the cost of a bad decision is measured in lives. That same standard applies aboard Luna's Wake. Safety briefings are thorough. Routes are planned, not improvised. Guests are looked after the same way his Marines were: with discipline, care, and genuine responsibility.</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", lineHeight: 1.8, color: C.sand, margin: "0 0 18px" }}>A proud grandfather, father, and husband — Brian named the boat Luna's Wake after his granddaughter Luna. Every charter is a family affair, and every guest is treated like one of our own.</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "18px", lineHeight: 1.5, color: C.cream, margin: "0 0 22px" }}>"I served my country for 26 years. Now I serve rum punch."</p>
                {/* Why Veteran-Owned Matters */}
                <div style={{ background: C.deepNavy, borderRadius: "10px", padding: "18px 22px", border: `1px solid ${C.gold}20`, borderLeft: `4px solid ${C.gold}`, marginBottom: "20px" }}>
                  <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "2px", color: C.gold, margin: "0 0 10px", fontWeight: 500 }}>WHAT VETERAN-OWNED MEANS FOR YOUR CHARTER:</p>
                  {["Safety without shortcuts — the standards that kept Marines alive apply on the water", "Accountability — if something isn't right, Captain Brian fixes it personally", "Local knowledge — 26 years of discipline applied to every reef, cove, and beach bar in the USVI", "When you book with KMC, you support a service-disabled veteran's livelihood"].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={{ color: C.gold, fontSize: "9px", marginTop: "5px", flexShrink: 0 }}>◆</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
                {/* Veteran credentials */}
                <div style={{ display: "inline-flex", flexDirection: "column", gap: "5px", padding: "14px 20px", borderRadius: "8px", border: `1.5px solid ${C.rust}60`, background: `${C.rust}10` }}>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "16px", letterSpacing: "2px", color: C.rust, fontWeight: 600 }}>★ SERVICE DISABLED VETERAN OWNED &amp; OPERATED</span>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "14px", letterSpacing: "3px", color: C.gold }}>UNITED STATES MARINE CORPS</span>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "2px", color: C.sand }}>LIEUTENANT COLONEL (RETIRED)  •  26 YEARS</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.gold, fontStyle: "italic" }}>Owner-operated. Captain Brian is your captain — not a hired crew member.</span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.gold, fontStyle: "italic", margin: "10px 0 0" }}>
                  Follow our adventures{" "}
                  <a href="https://www.instagram.com/KnottyMarineUSVI" target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>@KnottyMarineUSVI</a>
                </p>
              </div>
              {/* Luna photo */}
              {!isMobile && (
                <div style={{ borderRadius: "12px", overflow: "hidden", border: `2px solid ${C.gold}25`, position: "relative" }}>
                  <img src={lunaPhoto} alt="Luna" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(6,18,34,0.9))", padding: "24px 12px 12px" }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", color: C.cream, margin: "0 0 2px", fontWeight: 700 }}>Meet Luna</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: C.sand, margin: 0, opacity: 0.8 }}>The inspiration behind Luna's Wake</p>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>
      <WavesDivider color={C.navy} />

      {/* The Boat */}
      <section id="the-boat" style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(180deg, ${C.warmWhite}, ${C.cream})` }}>
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "44px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>YOUR VESSEL</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "28px" : "44px", fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Luna's Wake</h2>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "16px", color: "#8b8378" }}>Named after Captain Brian's granddaughter</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ borderRadius: "18px", overflow: "hidden", background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, border: `1px solid ${C.gold}20`, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
              <div style={{ overflow: "hidden", minHeight: isMobile ? "240px" : "auto" }}>
                <img src={boatSide} alt="2025 Monterey 30 Elite — Luna's Wake" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: isMobile ? "24px 20px" : "32px 28px" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: C.cream, margin: "0 0 4px" }}>Vessel Specifications</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, margin: "0 0 20px", opacity: 0.7 }}>Comfort, safety, and style on the water</p>
                {[["Length","30 ft — 2025 Monterey 30 Elite"],["Awards","2024 Boat of the Year • Miami Innovation Award"],["Capacity","Up to 10 guests"],["Max Power","600 HP Twin Mercury 300XXL Outboards"],["Top Speed","54+ MPH"],["Fuel Capacity","200 Gallons"],["Electronics","Simrad 15\" GPS/Chartplotter"],["Sound","Fusion Apollo, 6 JL Speakers + 2 Subs"],["Features","Hardtop, wetbar, electric head, trim tabs"],["Safety","USCG compliant, NMMA certified"],["Snorkel Gear","Included for all guests"],["Home Port","St. Thomas, USVI"]].map(([l,v],i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "8px 0", borderBottom: `1px solid ${C.gold}12` }}>
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "1.5px", color: C.gold, fontWeight: 500, flexShrink: 0 }}>{l.toUpperCase()}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Boat Gallery */}
      <section style={{ padding: isMobile ? "48px 16px" : "60px 24px", background: `linear-gradient(175deg, ${C.cream}, ${C.warmWhite})` }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>YOUR RIDE</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "26px" : "38px", fontWeight: 800, color: C.navy, margin: 0, letterSpacing: "-0.03em" }}>The 2025 Monterey Elite 30</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8b8378", marginTop: "8px" }}>Boating Magazine's 2024 Boat of the Year • Miami Innovation Award Winner</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "14px" }}>
            <FadeIn>
              <div style={{ borderRadius: "14px", overflow: "hidden" }}>
                <img src={boatSunset} alt="Monterey 30 Elite at sunset" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: "240px" }} />
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div style={{ borderRadius: "14px", overflow: "hidden", minHeight: "180px" }}>
                <img src={boatAction} alt="Monterey 30 Elite cruising" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* What to Bring */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(180deg, ${C.warmWhite}, ${C.cream})` }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "44px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>BEFORE YOU BOARD</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "28px" : "40px", fontWeight: 800, color: C.navy, margin: 0, letterSpacing: "-0.03em" }}>What to Bring</h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px" }}>
            <FadeIn>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${C.sand}40` }}>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "3px", color: C.sea, marginBottom: "16px", fontWeight: 600 }}>✓ BRING WITH YOU</h3>
                {["1 towel per person","Reef-safe sunscreen — LOTION ONLY","Sunglasses with a strap (Croakies)","Hat that fits snugly (it's windy!)","Waterproof phone case","Cash for beach bars and food stops","Light cover-up or rash guard","Dry bag for electronics","Snacks if desired (cooler space available)","Valid ID (for beach bar stops)","Sense of adventure"].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span style={{ color: C.sea, fontSize: "13px", marginTop: "1px", flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#5a554e", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: `2px solid ${C.rust}25` }}>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "3px", color: C.rust, marginBottom: "16px", fontWeight: 600 }}>✗ DO NOT BRING</h3>
                {[{ i: "NO spray sunscreen", n: "Damages gel coat and marine environment" },{ i: "NO glass bottles", n: "Safety hazard on the water" },{ i: "NO hard-soled shoes", n: "Soft soles or bare feet only" },{ i: "NO bananas", n: "Old sailor superstition — we keep it fun!" },{ i: "NO bad vibes", n: "This is your best day of vacation!" }].map((x, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ color: C.rust, fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>✗</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.navy, fontWeight: 600 }}>{x.i}</span>
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#8b8378", margin: "2px 0 0 22px", lineHeight: 1.4 }}>{x.n}</p>
                  </div>
                ))}
                <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "8px", background: `${C.rust}08`, border: `1px solid ${C.rust}20` }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.rust, margin: 0, lineHeight: 1.5, fontWeight: 600 }}>Apply sunscreen BEFORE arriving. Spray sunscreen is strictly prohibited aboard Luna's Wake.</p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: `2px solid ${C.sea}40` }}>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "3px", color: C.sea, marginBottom: "16px", fontWeight: 600 }}>📸 FOR GREAT PHOTOS</h3>
                {["Waterproof phone case or housing","GoPro or underwater camera","Extra battery or portable charger","Polarized sunglasses reduce glare","Captain Brian takes group photos — just ask!","Tag us @KnottyMarineUSVI on Instagram"].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span style={{ color: C.sea, fontSize: "12px", marginTop: "2px", flexShrink: 0 }}>📍</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#5a554e", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy})` }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "44px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.gold, marginBottom: "10px", fontWeight: 500 }}>QUESTIONS?</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "28px" : "40px", fontWeight: 800, color: C.cream, margin: 0, letterSpacing: "-0.03em" }}>Frequently Asked</h2>
            </div>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { q: "What's included in the charter price?", a: "Snorkel gear, cooler with water and ice, Bluetooth sound system, and your USCG-licensed captain. Fuel and gratuity are not included." },
              { q: "How does fuel cost work?", a: "Fuel is paid by guests at the end of the trip based on current market price. USVI fuel typically runs $4.50–$6.00 per gallon. Estimated ranges: Half-Day ~$80–$130 | Full-Day ~$130–$200 | Sunset ~$60–$90 | Circumnavigate STJ ~$180–$250. No markups — you pay exactly what the fuel costs." },
              { q: "What is your cancellation policy?", a: "We hold your date with no deposit required. If you need to cancel, please notify us at least 48 hours in advance at no charge. If we cancel due to unsafe weather or mechanical issues, you owe nothing and we will prioritize rescheduling." },
              { q: "What if the weather is bad?", a: "Safety is our top priority. We monitor weather 48 hours out and communicate early if there are concerns. If conditions are unsafe, we'll reschedule at no charge." },
              { q: "How do I claim the military or veterans discount?", a: "Use code USMC10 when booking, or mention it when you call or email. Valid ID required at the dock. Active duty military, veterans of any branch, and USVI locals qualify for 10% off." },
              { q: "Where do we meet?", a: "Red Hook, Havensight (cruise ship dock), or St. John — confirmed when you book." },
              { q: "Do we need passports?", a: "No — all USVI charters are U.S. territory, no passport required. Passports are required for BVI trips only." },
              { q: "Can we bring our own food and drinks?", a: "Yes — cooler space available. We also stop at Pizza Pi, Lime Out, Lovango, and other waterfront spots." },
              { q: "Is this good for kids?", a: "Yes! Captain Brian is a grandfather. Kid-friendly routes, life jackets in all sizes, and memories that last a lifetime." },
              { q: "How far in advance should we book?", a: "As early as possible — peak season (December–April) books 2-4 weeks out. Book today to secure your date." },
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div style={{ background: `${C.cream}06`, borderRadius: "10px", padding: "18px 20px", border: `1px solid ${C.gold}10` }}>
                  <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: C.cream, margin: "0 0 8px" }}>{faq.q}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, lineHeight: 1.7, margin: 0, opacity: 0.85 }}>{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Veterans */}
      <section id="veterans" style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, background: `repeating-linear-gradient(45deg, ${C.gold} 0px, ${C.gold} 1px, transparent 1px, transparent 20px)` }} />
        <div style={{ maxWidth: "580px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ display: "inline-block", padding: "14px 28px", borderRadius: "10px", border: `2px solid ${C.rust}`, background: `${C.rust}10`, marginBottom: "24px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: isMobile ? "16px" : "20px", letterSpacing: "4px", color: C.rust, margin: "0 0 4px", fontWeight: 600 }}>★ SERVICE DISABLED VETERAN OWNED ★</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", letterSpacing: "2px", color: C.sand, margin: 0 }}>UNITED STATES MARINE CORPS • 26 YEARS</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "26px" : "38px", fontWeight: 800, color: C.cream, margin: "0 0 12px", letterSpacing: "-0.03em" }}>We Take Care of Our Own</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", lineHeight: 1.8, color: C.sand, margin: "0 0 28px" }}>Knotty Marine was built on the values of service. Active military, veterans, and USVI locals always receive a discount — because this community is family.</p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div style={{ padding: isMobile ? "24px 20px" : "32px 40px", borderRadius: "16px", background: `linear-gradient(135deg, ${C.deepNavy}, ${C.navy})`, border: `2px solid ${C.gold}30`, boxShadow: `0 12px 48px rgba(0,0,0,0.3)` }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: C.cream, margin: "0 0 8px", fontWeight: 700 }}>Military, Veterans &amp; Locals</p>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "48px", color: C.gold, margin: "0 0 8px", fontWeight: 600, letterSpacing: "3px", lineHeight: 1 }}>10% OFF</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "17px", color: C.gold, margin: "0 0 4px", fontWeight: 700, letterSpacing: "2px" }}>Use code: USMC10</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, margin: "0 0 20px" }}>Book online with code USMC10 — or mention it when you call or email. Valid ID required at the dock.</p>
              <a href="#book-a-trip" style={{ display: "inline-block", padding: isMobile ? "14px 28px" : "12px 32px", borderRadius: "8px", background: C.gold, color: C.navy, fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 700, textDecoration: "none" }}>Book with Military Discount</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(180deg, ${C.cream}, ${C.warmWhite})` }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "44px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>WHAT THEY SAY</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "28px" : "40px", fontWeight: 800, color: C.navy, margin: 0, letterSpacing: "-0.03em" }}>Straight from the Crew</h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px" }}>
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${C.sand}40`, height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
                    {[1,2,3,4,5].map(s => <svg key={s} width="14" height="14" viewBox="0 0 16 16" fill={C.gold}><polygon points="8,1 10,6 15,6.5 11,9.5 12.5,14.5 8,11.5 3.5,14.5 5,9.5 1,6.5 6,6" /></svg>)}
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", lineHeight: 1.7, color: "#5a554e", margin: "0 0 18px", flex: 1, fontStyle: "italic" }}>"{t.text}"</p>
                  <div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: C.navy, margin: "0 0 2px" }}>{t.name}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#8b8378", margin: 0 }}>{t.loc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section style={{ padding: isMobile ? "48px 16px" : "60px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy})` }}>
        <div style={{ maxWidth: "780px", margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.gold, marginBottom: "10px", fontWeight: 500 }}>ISLAND PARTNERS</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "26px" : "36px", fontWeight: 800, color: C.cream, margin: "0 0 12px", letterSpacing: "-0.03em" }}>Friends We Do Business With</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.sand, margin: "0 0 36px", opacity: 0.8 }}>Trusted local partners who share our commitment to exceptional USVI experiences.</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <a href="https://www.everlongexcursions.com/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "18px", padding: isMobile ? "20px 24px" : "22px 36px", borderRadius: "14px", background: `${C.cream}06`, border: `1.5px solid ${C.gold}30`, textDecoration: "none" }}>
              <span style={{ fontSize: "32px" }}>🚙</span>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: C.gold, margin: "0 0 4px" }}>Everlong Excursions</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, margin: "0 0 4px", opacity: 0.8 }}>Premier USVI jeep tours and land excursions</p>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "2px", color: C.gold, opacity: 0.7 }}>www.everlongexcursions.com ↗</span>
              </div>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Booking CTA */}
      <section id="book-now" style={{ padding: isMobile ? "60px 16px" : "80px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy})`, textAlign: "center", position: "relative" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <KnotIcon size={40} color={C.gold} strokeW={2} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "28px" : "48px", fontWeight: 800, color: C.cream, margin: "16px 0 8px", letterSpacing: "-0.03em" }}>Ready to Get Knotty?</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", lineHeight: 1.7, color: C.sand, margin: "0 0 14px", opacity: 0.85 }}>Book your private charter aboard Luna's Wake.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.gold, fontWeight: 700, margin: "0 0 4px" }}>Peak season runs December through April — charters book out 2–4 weeks in advance.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, fontStyle: "italic", margin: "0 0 32px", opacity: 0.8 }}>Secure your date early to avoid missing out.</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "12px" }}>
              <a href="#book-a-trip" style={{ display: "inline-flex", alignItems: "center", padding: isMobile ? "16px 24px" : "16px 32px", borderRadius: "10px", background: C.gold, color: C.navy, fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 700, textDecoration: "none", boxShadow: `0 6px 24px ${C.gold}30` }}>Book Your Date ⚓</a>
              <a href="tel:+15712327040" style={{ display: "inline-flex", alignItems: "center", padding: isMobile ? "16px 24px" : "16px 32px", borderRadius: "10px", background: "transparent", color: C.cream, border: `1.5px solid ${C.cream}30`, fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 500, textDecoration: "none" }}>Call Us Direct</a>
              <a href="https://wa.me/15712327040" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: isMobile ? "16px 24px" : "16px 32px", borderRadius: "10px", background: "#25D366", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 600, textDecoration: "none" }}>💬 WhatsApp</a>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, fontStyle: "italic", margin: "0 0 8px", opacity: 0.8, textAlign: "center" }}>
              Use the form above or reach us directly — we respond within 2 hours, guaranteed.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.gold, margin: "0 0 28px", opacity: 0.9, textAlign: "center", fontWeight: 600 }}>
              Now booking Summer &amp; Fall 2026 — peak season fills fast.
            </p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
              {[{ label: "Email", value: "KMCUSVI@gmail.com" },{ label: "Phone / Text", value: "(571) 232-7040" },{ label: "WhatsApp", value: "wa.me/15712327040" },{ label: "Location", value: "St. Thomas, USVI" }].map((c, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "2px", color: C.gold, margin: "0 0 4px", fontWeight: 500 }}>{c.label.toUpperCase()}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, margin: 0 }}>{c.value}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: C.deepNavy, padding: "0", borderTop: `3px solid ${C.gold}20` }}>
        {/* Email capture */}
        <div style={{ background: C.midNavy, padding: "28px 20px", borderBottom: `1px solid ${C.gold}15` }}>
          <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: C.cream, margin: "0 0 4px" }}>Stay in the loop</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, margin: "0 0 14px", opacity: 0.8 }}>Availability updates, USVI tips, and seasonal specials</p>
            {emailSubmitted ? (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.gold, fontStyle: "italic" }}>Thank you! We'll be in touch. ⚓</p>
            ) : (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                <input type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} placeholder="Your email address" style={{ flex: "1 1 200px", maxWidth: "260px", padding: "11px 14px", borderRadius: "8px", border: `1px solid ${C.gold}30`, background: C.deepNavy, color: C.cream, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", outline: "none", minHeight: "44px" }} />
                <button onClick={() => { if (emailValue) setEmailSubmitted(true); }} style={{ padding: "11px 22px", borderRadius: "8px", background: C.gold, color: C.navy, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", minHeight: "44px" }}>Sign Up</button>
              </div>
            )}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.sand, margin: "8px 0 0", opacity: 0.4, fontStyle: "italic" }}>No spam. Just good stuff from a veteran captain who loves his job.</p>
          </div>
        </div>

        {/* Main footer */}
        <div style={{ padding: "28px 20px" }}>
          <div style={{ maxWidth: "880px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexWrap: "wrap", gap: "20px", flexDirection: isMobile ? "column" : "row" }}>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: C.cream, margin: "0 0 2px", fontWeight: 700 }}>Knotty Marine Charters</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.sand, margin: "0 0 6px", opacity: 0.5, letterSpacing: "1px" }}>U.S. Virgin Islands · Aboard Luna's Wake</p>
              <a href="https://www.instagram.com/KnottyMarineUSVI" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.gold, textDecoration: "none", opacity: 0.8 }}>📸 @KnottyMarineUSVI</a>
            </div>
            <div style={{ textAlign: isMobile ? "left" : "right" }}>
              <div style={{ display: "inline-flex", padding: "7px 14px", borderRadius: "6px", border: `1px solid ${C.rust}50`, background: `${C.rust}08`, gap: "6px", alignItems: "center", marginBottom: "5px" }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "2px", color: C.rust, fontWeight: 600 }}>★ SERVICE DISABLED VETERAN OWNED</span>
              </div>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "2px", color: C.sand, margin: "0 0 3px", opacity: 0.6 }}>USMC RETIRED • 26 YEARS</p>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "3px", color: C.gold, margin: "0 0 3px", fontWeight: 500 }}>Private. Personal. Veteran-owned.</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "13px", color: C.gold, margin: 0, opacity: 0.4 }}>"Sun, Fun, Saltwater Memories"</p>
            </div>
          </div>
          <div style={{ maxWidth: "880px", margin: "14px auto 0", paddingTop: "14px", borderTop: `1px solid ${C.gold}10` }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.sand, margin: 0, opacity: 0.3, textAlign: "center" }}>
              © 2026 Knotty Marine Charters LLC · All Rights Reserved · St. Thomas, USVI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

