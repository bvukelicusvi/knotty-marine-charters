import { useState, useEffect, useRef } from "react";
import boatSide from './boat-side.jpg';
import boatSunset from './boat-sunset.jpg';
import boatAction from './boat-action.jpg';
import familyPhoto from './family.jpg';
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
  rope: "#c4a86a",
};

/* ─── Scroll Animation Hook ─── */
function useInView(threshold = 0.15) {
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
  const [ref, visible] = useInView(0.1);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
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

function AnchorLogo({ size = 48 }) {
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

/* ─── PHOTO GALLERY MODAL ─── */
function GalleryModal({ onClose }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    setUploading(true);
    const newPhotos = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        newPhotos.push({ src: e.target.result, name: file.name, date: new Date().toLocaleDateString() });
        if (newPhotos.length === files.length) {
          setPhotos((prev) => [...prev, ...newPhotos]);
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(6,18,34,0.96)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "5px", color: C.gold, margin: "0 0 4px" }}>KNOTTY MARINE CHARTERS</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 800, color: C.cream, margin: 0 }}>Photo Gallery</h2>
          </div>
          <button onClick={onClose} style={{ background: `${C.cream}10`, border: `1px solid ${C.cream}20`, color: C.cream, width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current.click()}
          style={{ border: `2px dashed ${C.gold}50`, borderRadius: "16px", padding: "40px", textAlign: "center", cursor: "pointer", marginBottom: "32px", background: `${C.gold}05` }}>
          <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📷</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: C.cream, margin: "0 0 8px", fontWeight: 700 }}>
            {uploading ? "Uploading..." : "Add Your Photos"}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.sand, margin: 0, opacity: 0.7 }}>
            Drag & drop photos here, or click to select. Share your Knotty Marine memories!
          </p>
        </div>
        {photos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: C.sand, opacity: 0.5 }}>No photos yet — be the first to share your charter memories!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {photos.map((p, i) => (
              <div key={i} style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.gold}20` }}>
                <img src={p.src} alt={p.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                <div style={{ padding: "8px 12px", background: C.deepNavy }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.sand, margin: 0, opacity: 0.7 }}>{p.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── NAV — Change 10: verified link order + Destinations anchor ─── */
function Nav({ scrolled }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const links = ["Charters", "Destinations", "About", "The Boat", "Veterans", "Book Now"];
  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "10px 32px" : "18px 32px",
        background: scrolled ? `${C.deepNavy}f0` : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.gold}20` : "1px solid transparent",
        transition: "all 0.4s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AnchorLogo size={scrolled ? 28 : 34} />
          <div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: scrolled ? "16px" : "19px", fontWeight: 700, color: C.cream, letterSpacing: "-0.02em", transition: "font-size 0.4s ease" }}>Knotty Marine</span>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "9px", letterSpacing: "4px", color: C.gold, display: "block", marginTop: "-2px", fontWeight: 300 }}>CHARTERS</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {links.map((l) => (
            <a key={l} href={l === "Destinations" ? "#destinations" : `#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500, color: l === "Book Now" ? C.navy : C.sand, textDecoration: "none", letterSpacing: "0.5px", padding: l === "Book Now" ? "8px 20px" : "0", background: l === "Book Now" ? C.gold : "transparent", borderRadius: l === "Book Now" ? "6px" : "0", transition: "color 0.2s, opacity 0.2s" }}>
              {l}
            </a>
          ))}
          <button onClick={() => setGalleryOpen(true)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500, color: C.sand, background: "transparent", border: `1px solid ${C.gold}40`, borderRadius: "6px", padding: "7px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            📷 Gallery
          </button>
        </div>
      </nav>
      {galleryOpen && <GalleryModal onClose={() => setGalleryOpen(false)} />}
    </>
  );
}

/* ─── HERO — Changes 1a–1e ─── */
function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 30% 20%, ${C.midNavy}80 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${C.sea}15 0%, transparent 40%), linear-gradient(175deg, ${C.deepNavy} 0%, ${C.navy} 45%, ${C.midNavy} 100%)`,
      position: "relative", overflow: "hidden", textAlign: "center", padding: "120px 24px 80px",
    }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: `repeating-linear-gradient(90deg, transparent 0px, transparent 80px, ${C.gold}04 80px, ${C.gold}04 82px)`, opacity: 0.5 }} />
      <div style={{ position: "absolute", bottom: "-4px", left: 0, right: 0 }}>
        <svg viewBox="0 0 1440 100" fill="none" style={{ width: "100%", display: "block" }}>
          <path d="M0 50 C180 20, 360 80, 540 50 C720 20, 900 80, 1080 50 C1260 20, 1440 80, 1440 50 L1440 100 L0 100 Z" fill={C.cream} opacity="0.06" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `repeating-linear-gradient(90deg, ${C.gold} 0px, ${C.gold} 14px, transparent 14px, transparent 22px)`, opacity: 0.4 }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.02 }}>
        <svg width="700" height="700" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="95" stroke={C.gold} strokeWidth="0.5" />
          {[0,45,90,135,180,225,270,315].map(a => (
            <line key={a} x1={100+Math.cos(a*Math.PI/180)*30} y1={100+Math.sin(a*Math.PI/180)*30} x2={100+Math.cos(a*Math.PI/180)*95} y2={100+Math.sin(a*Math.PI/180)*95} stroke={C.gold} strokeWidth={a%90===0?"1":"0.3"} />
          ))}
          <polygon points="100,10 106,90 100,85 94,90" fill={C.gold} />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "860px" }}>
        <FadeIn>
          <div style={{ marginBottom: "24px" }}><KnotIcon size={50} color={C.gold} strokeW={2} /></div>
        </FadeIn>

        {/* Change 1a — U.S. VIRGIN ISLANDS font increased to 20px */}
        <FadeIn delay={0.15}>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "20px", letterSpacing: "8px", color: C.gold, marginBottom: "16px", fontWeight: 500 }}>
            U.S. VIRGIN ISLANDS
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(48px, 9vw, 96px)", fontWeight: 800, color: C.cream, margin: "0 0 8px", letterSpacing: "-0.04em", lineHeight: 0.95 }}>
            Knotty Marine
          </h1>
        </FadeIn>

        <FadeIn delay={0.45}>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "clamp(16px, 3vw, 22px)", letterSpacing: "10px", color: C.gold, margin: "0 0 8px", fontWeight: 300 }}>
            CHARTERS
          </p>
        </FadeIn>

        {/* Change 1b — New subheadline "Private. Personal. Veteran-owned." */}
        <FadeIn delay={0.52}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(15px, 2.2vw, 20px)", color: C.gold, margin: "0 0 16px", opacity: 0.9, letterSpacing: "0.5px" }}>
            Private. Personal. Veteran-owned.
          </p>
        </FadeIn>

        <FadeIn delay={0.6}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(18px, 3vw, 26px)", color: C.sand, margin: "0 0 40px", opacity: 0.75, lineHeight: 1.4 }}>
            "Sun, Fun, Saltwater Memories"
          </p>
        </FadeIn>

        {/* Change 1c — Three CTA buttons: Book, View Charters, Call/Text */}
        <FadeIn delay={0.75}>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#book-now" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 600, color: C.navy, background: C.gold, padding: "14px 32px", borderRadius: "8px", textDecoration: "none", letterSpacing: "0.5px", boxShadow: `0 4px 24px ${C.gold}30` }}>
              Book Your Date
            </a>
            <a href="#charters" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 500, color: C.cream, background: "transparent", padding: "14px 32px", borderRadius: "8px", textDecoration: "none", letterSpacing: "0.5px", border: `1.5px solid ${C.cream}30` }}>
              View Charters
            </a>
            <a href="tel:+15712327040" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 500, color: C.cream, background: "transparent", padding: "14px 32px", borderRadius: "8px", textDecoration: "none", letterSpacing: "0.5px", border: `1.5px solid ${C.rust}70` }}>
              Call / Text Us
            </a>
          </div>
        </FadeIn>

        {/* Change 1d & 1e — Larger veteran badge + new location/capacity line */}
        <FadeIn delay={0.9}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 28px", borderRadius: "30px", marginTop: "48px", border: `1px solid ${C.gold}20`, background: `${C.gold}06` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px", color: C.rust, letterSpacing: "2px", fontWeight: 700, fontFamily: "'Oswald', sans-serif" }}>★ SERVICE DISABLED VETERAN OWNED</span>
              <span style={{ color: C.gold, fontSize: "8px" }}>◆</span>
              <span style={{ fontSize: "15px", color: C.sand, letterSpacing: "2px", fontWeight: 500, fontFamily: "'Oswald', sans-serif" }}>USMC RETIRED • 26 YEARS</span>
            </div>
            <span style={{ fontSize: "12px", color: C.sand, letterSpacing: "1.5px", fontFamily: "'DM Sans', sans-serif", opacity: 0.7 }}>
              St. Thomas, U.S. Virgin Islands  •  Up to 10 Guests  •  No Passport Required
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── RATES STRIP — Change 2 ─── */
function RatesStrip() {
  const rates = [
    { title: "Half-Day Adventure", hours: "4 Hours", price: "From $700", includes: "Snorkel gear, water & ice, Bluetooth", color: C.sea, bg: `${C.sea}12` },
    { title: "Full-Day Expedition", hours: "7–8 Hours", price: "From $1,300", includes: "Everything in Half-Day + lunch stop", color: C.gold, bg: `${C.gold}15`, popular: true },
    { title: "Sunset Cruise", hours: "2.5 Hours", price: "From $450", includes: "Ice & water, prime sunset route", color: C.rust, bg: `${C.rust}12` },
  ];
  return (
    <div style={{ background: C.warmWhite, padding: "32px 24px 20px", borderBottom: `1px solid ${C.sand}30` }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
          {rates.map((r, i) => (
            <div key={i} style={{ flex: "1 1 220px", maxWidth: "280px", background: r.bg, borderRadius: "12px", padding: "20px", border: `1.5px solid ${r.color}30`, position: "relative" }}>
              {r.popular && (
                <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: C.gold, color: C.navy, padding: "2px 12px", borderRadius: "20px", fontFamily: "'Oswald', sans-serif", fontSize: "9px", letterSpacing: "2px", fontWeight: 700, whiteSpace: "nowrap" }}>MOST POPULAR</div>
              )}
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: C.navy, margin: "0 0 4px" }}>{r.title}</p>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "2px", color: r.color, margin: "0 0 8px" }}>{r.hours}  •  Up to 10 guests</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: C.navy, margin: "0 0 6px" }}>{r.price}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#6b655e", margin: 0 }}>{r.includes}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.rust, fontWeight: 700, margin: 0 }}>
          ⚠ Price does not include Fuel or Gratuity  •  Military, veterans & locals: 10% off with code <strong>USMC10</strong>
        </p>
      </div>
    </div>
  );
}

/* ─── INCLUSIONS STRIP — Change 3 ─── */
function InclusionsStrip() {
  const items = [
    { icon: "⚓", label: "Licensed Captain" },
    { icon: "🤿", label: "Snorkel Gear for All" },
    { icon: "💧", label: "Water & Ice Included" },
    { icon: "🎵", label: "Bluetooth Sound" },
    { icon: "🔒", label: "100% Private Group" },
    { icon: "⛽", label: "Fuel Transparent" },
  ];
  return (
    <div style={{ background: C.cream, padding: "24px", borderTop: `1px solid ${C.gold}20`, borderBottom: `1px solid ${C.gold}20` }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "12px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 18px", background: "#fff", borderRadius: "10px", border: `1px solid ${C.sand}50`, minWidth: "100px" }}>
              <span style={{ fontSize: "22px" }}>{item.icon}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, color: C.navy, textAlign: "center", letterSpacing: "0.5px" }}>{item.label}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700, color: C.navy, margin: 0 }}>
          All charters are private — your group only. No strangers, no shared boats.
        </p>
      </div>
    </div>
  );
}

/* ─── CHARTER DATA — Changes 11 (bestFor labels) + existing updates ─── */
const charters = [
  {
    title: "Half-Day Adventure", hours: "4 Hours", price: "From $700",
    bestFor: "Best for: Families • First-timers • Cruise ship guests with limited time",
    desc: "Perfect for a morning snorkel or afternoon cruise. Swim with sea turtles at Buck Island, beach hop to Water Island, or explore hidden coves around St. Thomas.",
    features: ["Snorkel gear provided", "Cooler with water & ice", "Bluetooth sound system", "Up to 10 guests", "No passport required"],
    icon: "☀️", popular: false,
  },
  {
    title: "Full-Day Expedition", hours: "7-8 Hours", price: "From $1,300",
    bestFor: "Best for: Groups who want everything — snorkeling, beach bars, lunch, and more",
    desc: "The ultimate island-hopping experience. Circle St. John's north shore, snorkel world-class reefs, and anchor for a lunch stop — choose from Cruz Bay (St. John), Lime Out floating taco bar, or Pizza Pi Vi.",
    features: ["Everything in Half-Day", "Cooler with water & ice", "Lunch stop included*", "Multi-island route", "Up to 10 guests", "No passport required"],
    icon: "🏝️", popular: true, lunchNote: true, urgency: true,
  },
  {
    title: "Sunset Cruise", hours: "2.5 Hours", price: "From $450",
    bestFor: "Best for: Couples • Proposals • Anniversaries • Romantic evenings",
    desc: "Knotty by day, salty by night. Watch the Caribbean sun melt into the horizon aboard Luna's Wake. Perfect for proposals, anniversaries, and celebrations.",
    features: ["Cooler with ice & water", "Prime sunset route", "Bluetooth sound system", "Up to 10 guests"],
    icon: "🌅", popular: false,
  },
  {
    title: "Bachelorette / Bachelor Party", hours: "7-8 Hours", price: "From $1,300",
    bestFor: "Best for: Bachelorette & bachelor parties • Birthdays • Group celebrations",
    desc: "Celebrate your last sail as a single — Knotty style. Beach bar crawl, snorkeling, music blasting on the Fusion sound system, and photo ops at the most scenic spots in the USVI.",
    features: ["Party-ready sound system", "Cooler with water & ice", "Beach bar & snorkel stops", "Decorations welcome (bring your own)", "Up to 10 guests"],
    icon: "🎉", popular: false,
  },
  {
    title: "Cruise Ship Express", hours: "4 Hours", price: "From $1,300",
    bestFor: "Best for: Cruise passengers • Short on time • Havensight departure",
    desc: "Only in port for the day? Skip the crowds. We pick you up steps from your ship at Havensight and get you to the best snorkeling, beaches, and Lime Out floating taco bar — all in 4 hours.",
    features: ["Havensight pickup & dropoff", "Snorkel & beach stop", "Lime Out floating taco bar", "Cooler with water & ice", "Up to 10 guests", "Back before your ship leaves"],
    icon: "🚢", popular: false,
  },
  {
    title: "Circle St. John Foodie Tour", hours: "7-8 Hours", price: "From $1,500",
    bestFor: "Best for: Food lovers • Full island experience • Groups who love to eat well",
    desc: "Eat and snorkel your way around St. John. You choose your lunch destination — Lovango Beach Club, Cruz Bay, Pizza Pi Vi, or Lime Out floating taco bar — plus world-class snorkeling at Trunk Bay and Maho Bay.",
    features: ["Your choice of lunch spot", "Trunk Bay snorkeling", "Full circumnavigation of St. John", "Cooler with water & ice", "Up to 10 guests"],
    icon: "🍕", popular: false, lunchNote: true,
  },
  {
    title: "Circumnavigate St. John & St. Thomas", hours: "7-8 Hours", price: "From $1,300",
    bestFor: "Best for: Explorers • Photography • Seeing the whole island from the water",
    desc: "See it all from the water. Circle the dramatic coastlines of St. John and/or St. Thomas — hidden coves, dramatic cliffs, world-class snorkel spots, and iconic landmarks you can't reach by road.",
    features: ["Full island circumnavigation", "Snorkel stops at top spots", "Scenic coastal exploration", "Cooler with water & ice", "Up to 10 guests", "No passport required"],
    icon: "🗺️", popular: false,
  },
  {
    title: "Build Your Own Charter", hours: "Full Day", price: "From $1,300",
    bestFor: "Best for: Repeat visitors • Anyone who knows exactly what they want",
    desc: "You pick it, we run it. Choose your destinations, snorkel spots, lunch stop, and pace. Tell us what you want and Captain Brian will chart the perfect course just for you.",
    features: ["Custom route — you decide", "Choose your lunch spot", "Snorkel where you want", "Cooler with water & ice", "Up to 10 guests"],
    icon: "🧭", popular: false,
  },
];

const studentTrip = {
  title: "USVI Student Discovery Trip", price: "$125 per student", hours: "3-4 Hours",
  desc: "Giving back to the community that gave us a home. Captain Brian brings the same discipline and dedication from 26 years of Marine Corps service to inspire the next generation. Educational snorkeling, marine life identification, island geography, and ocean safety.",
  requirements: ["Must be a USVI school or youth organization", "Minimum 6 students, up to 10", "Snacks, water & ice provided", "Advance booking required"],
};

const shuttleService = {
  title: "Private Shuttle — St. John",
  desc: "Need a ride to or from St. John? We offer private water shuttle service between St. Thomas and St. John. Skip the ferry lines and travel in style aboard Luna's Wake.",
  note: "Contact us for shuttle pricing and availability.",
};

/* ─── CHARTER CARD — Change 11 (bestFor tag) + Change 22 (urgency on Full-Day) ─── */
function CharterCard({ charter, index }) {
  return (
    <FadeIn delay={index * 0.1} style={{ flex: "1 1 280px", maxWidth: "360px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: charter.popular ? `2px solid ${C.gold}` : `1px solid ${C.sand}50`, boxShadow: charter.popular ? `0 12px 40px ${C.gold}15` : "0 4px 20px rgba(0,0,0,0.04)", position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
        {charter.popular && (
          <div style={{ position: "absolute", top: "16px", right: "16px", background: C.gold, color: C.navy, padding: "4px 12px", borderRadius: "20px", fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}>MOST POPULAR</div>
        )}
        <div style={{ padding: "32px 28px 20px", background: charter.popular ? `linear-gradient(135deg, ${C.navy}, ${C.midNavy})` : `linear-gradient(135deg, ${C.cream}80, ${C.warmWhite})` }}>
          <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>{charter.icon}</span>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: charter.popular ? C.cream : C.navy, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{charter.title}</h3>
          {/* Change 11 — Best For label */}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: charter.popular ? `${C.gold}cc` : C.rust, margin: "0 0 6px", fontStyle: "italic", lineHeight: 1.4 }}>{charter.bestFor}</p>
          <div style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "3px", color: charter.popular ? C.gold : C.rust, fontWeight: 500 }}>{charter.hours}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "20px", fontWeight: 700, color: charter.popular ? C.gold : C.navy }}>{charter.price}</span>
          </div>
        </div>
        <div style={{ padding: "20px 28px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", lineHeight: 1.7, color: "#6b655e", margin: "0 0 20px" }}>{charter.desc}</p>
          {charter.lunchNote && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#8b8378", margin: "-12px 0 16px", fontStyle: "italic", lineHeight: 1.5 }}>
              * Lunch options: Cruz Bay (St. John) · Lime Out St. John or St. Thomas · Pizza Pi Vi<br />
              <em>Cost of lunch not included.</em>
            </p>
          )}
          <div style={{ marginTop: "auto" }}>
            {charter.features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", borderTop: i === 0 ? `1px solid ${C.sand}30` : "none" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke={C.sea} strokeWidth="1.5" />
                  <path d="M4 7 L6 9 L10 5" stroke={C.sea} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#5a554e" }}>{f}</span>
              </div>
            ))}
          </div>
          <a href="#book-now" style={{ display: "block", textAlign: "center", marginTop: "20px", padding: "12px", borderRadius: "8px", background: charter.popular ? C.gold : "transparent", color: C.navy, border: charter.popular ? "none" : `1.5px solid ${C.navy}25`, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, textDecoration: "none", letterSpacing: "0.3px" }}>
            {charter.popular ? "Book This Charter" : "Learn More"}
          </a>
          {/* Change 22 — urgency note on Full-Day card */}
          {charter.urgency && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.rust, margin: "10px 0 0", textAlign: "center", fontStyle: "italic" }}>
              📅 This is our most-booked charter — reserve your date early, especially December through April.
            </p>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

/* ─── HELP ME CHOOSE — Change 12 ─── */
function HelpMeChoose() {
  const options = [
    { time: "2–4 hours available", rec: "Half-Day Adventure ($700) or Sunset Cruise ($450)", icon: "☀️" },
    { time: "Full day, want everything", rec: "Full-Day Expedition ($1,300) — our most popular", icon: "🏝️" },
    { time: "Special occasion or celebration", rec: "Bachelorette/Bachelor Party ($1,300) or Build Your Own ($1,300)", icon: "🎉" },
    { time: "Just off a cruise ship", rec: "Cruise Ship Express ($1,300) — Havensight pickup", icon: "🚢" },
    { time: "Want to eat your way around St. John", rec: "Circle St. John Foodie Tour ($1,500)", icon: "🍕" },
  ];
  return (
    <FadeIn>
      <div style={{ maxWidth: "700px", margin: "40px auto 0", background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, borderRadius: "16px", padding: "32px", border: `1px solid ${C.gold}20` }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: C.cream, margin: "0 0 6px", textAlign: "center" }}>Not sure which charter is right for you?</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.sand, textAlign: "center", margin: "0 0 20px", opacity: 0.8 }}>Here's a simple guide:</p>
        {options.map((o, i) => (
          <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "10px 0", borderTop: i === 0 ? `1px solid ${C.gold}15` : `1px solid ${C.gold}10` }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>{o.icon}</span>
            <div>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "1px", color: C.gold, margin: "0 0 2px", fontWeight: 500 }}>{o.time}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, margin: 0 }}>→ {o.rec}</p>
            </div>
          </div>
        ))}
        <p style={{ textAlign: "center", marginTop: "20px", marginBottom: 0 }}>
          <a href="mailto:KMCUSVI@gmail.com" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.gold, textDecoration: "none", fontStyle: "italic" }}>
            Still not sure? Email or text us — we'll help you plan the perfect day. →
          </a>
        </p>
      </div>
    </FadeIn>
  );
}

const testimonials = [
  { name: "Jake & Michelle R.", loc: "Austin, TX", text: "Best day of our entire trip. Captain Brian knew every hidden cove and had the music cranked. We bought 4 t-shirts before we even left the dock. Absolutely coming back." },
  { name: "SSgt Davis (Ret.)", loc: "Camp Lejeune, NC", text: "It's not every day you find a fellow Marine running a charter in paradise. The vet discount was a nice touch but the experience was worth full price and then some. Semper Fi, brother." },
  { name: "The Henderson Family", loc: "Chicago, IL", text: "We did the full-day with our two teenagers and it was the first time in years nobody looked at their phone. Luna's Wake is a beautiful boat and Brian is the real deal." },
];

export default function KnottyMarineSite() {
  const [scrolled, setScrolled] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.warmWhite, fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Oswald:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <Nav scrolled={scrolled} />
      <Hero />

      {/* ═══ SOCIAL PROOF BAR ═══ */}
      <div style={{ background: C.cream, padding: "20px 24px", display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap", borderBottom: `1px solid ${C.sand}40` }}>
        {[
          { num: "2024", label: "Boat of the Year" },
          { num: "600 HP", label: "Twin Mercury Power" },
          { num: "26", label: "Years USMC Service" },
          { num: "30'", label: "Monterey Elite OB" },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: C.navy, display: "block" }}>{s.num}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#8b8378", letterSpacing: "1px" }}>{s.label}</span>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Change 2 — Rates Strip */}
      <RatesStrip />

      {/* Change 3 — Inclusions Strip */}
      <InclusionsStrip />

      {/* ═══ CHARTERS ═══ */}
      <section id="charters" style={{ padding: "80px 24px", background: `linear-gradient(180deg, ${C.warmWhite}, ${C.cream})` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>CHOOSE YOUR ADVENTURE</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: C.navy, margin: "0 0 12px", letterSpacing: "-0.03em" }}>Charter Experiences</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#8b8378", maxWidth: "550px", margin: "0 auto 12px", lineHeight: 1.6 }}>
                From half-day snorkel runs to full-day island expeditions — pick your adventure and we'll handle the rest.
              </p>
              {/* Change 3 pricing notice (also in rates strip — reinforced here) */}
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: C.rust, fontWeight: 700, margin: 0 }}>
                ⚠ Price does not include Fuel or Gratuity
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", alignItems: "stretch" }}>
            {charters.map((c, i) => <CharterCard key={i} charter={c} index={i} />)}
          </div>

          {/* Change 12 — Help Me Choose */}
          <HelpMeChoose />

          {/* Student Trip & Shuttle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "40px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
            <FadeIn>
              <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, borderRadius: "16px", padding: "28px", border: `2px solid ${C.sea}40` }}>
                <span style={{ fontSize: "28px", display: "block", marginBottom: "12px" }}>🎓</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: C.cream, margin: "0 0 4px" }}>{studentTrip.title}</h3>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", color: C.gold, margin: "0 0 12px", fontWeight: 600 }}>{studentTrip.price}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, lineHeight: 1.7, margin: "0 0 16px" }}>{studentTrip.desc}</p>
                {studentTrip.requirements.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ color: C.sea, fontSize: "10px" }}>●</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand }}>{r}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, borderRadius: "16px", padding: "28px", border: `2px solid ${C.gold}30` }}>
                <span style={{ fontSize: "28px", display: "block", marginBottom: "12px" }}>⛴️</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: C.cream, margin: "0 0 4px" }}>{shuttleService.title}</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, lineHeight: 1.7, margin: "12px 0 16px" }}>{shuttleService.desc}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.gold, fontWeight: 600 }}>{shuttleService.note}</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.5}>
            <div style={{ textAlign: "center", marginTop: "40px", padding: "24px", background: "#fff", borderRadius: "12px", border: `1px solid ${C.sand}40` }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#8b8378", margin: "0 0 6px" }}>All charters include snorkel gear, water, ice, and Bluetooth speakers. No passport required for USVI trips.</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.rust, margin: "0 0 6px", fontWeight: 700 }}>⚠ Price does not include Fuel or Gratuity.</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.rust, margin: 0, fontWeight: 600 }}>Military, veterans & locals receive 10% off — use code <strong>USMC10</strong></p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ POPULAR DESTINATIONS ═══ */}
      <section id="destinations" style={{ padding: "80px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy} 50%, ${C.midNavy})`, position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.gold, marginBottom: "10px", fontWeight: 500 }}>WHERE WE TAKE YOU</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: C.cream, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Popular Destinations</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: C.sand, maxWidth: "500px", margin: "0 auto", opacity: 0.8 }}>No passport required — all within the U.S. Virgin Islands</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {[
              { name: "Buck Island", desc: "Swim with dozens of green sea turtles and snorkel a sunken Navy barge wreck in 30 feet of crystal-clear water.", icon: "🐢" },
              { name: "Water Island / Honeymoon Beach", desc: "The 'fourth Virgin Island' — white sand beaches, beach bars, and total relaxation just minutes from St. Thomas.", icon: "🏖️" },
              { name: "St. John North Shore", desc: "Trunk Bay, Cinnamon Bay, Maho Bay — the Virgin Islands National Park has some of the most beautiful beaches on earth.", icon: "🌴" },
              { name: "Pizza Pi Vi", desc: "The famous floating pizza boat anchored in Christmas Cove. Pull up, order from the water, and eat the best pizza in the Caribbean.", icon: "🍕", link: "https://pizza-pi.com/" },
              { name: "Lime Out", desc: "A floating taco bar in Coral Harbor. Craft tacos, cold drinks, and Instagram-worthy views — accessible only by boat.", icon: "🌮", link: "https://limeoutvi.com/" },
              { name: "Lovango Beach Club", desc: "An upscale private island beach club with stunning views, cocktails, and fresh food. Exclusively accessible by boat — a true hidden gem of the USVI.", icon: "🍹", link: "https://www.lovangovi.com/" },
              { name: "Christmas Cove", desc: "A protected anchorage with great snorkeling, calm water, and easy access to Pizza Pi. Perfect for families.", icon: "⚓" },
              { name: "Secret Harbor / Great St. James", desc: "Vibrant reef snorkeling with less crowds. A favorite of locals and repeat visitors.", icon: "🤿" },
              { name: "Megan's Bay", desc: "One of the most beautiful beaches in the world — white sand, calm water, and stunning mountain backdrop.", icon: "🌊" },
              { name: "Brewer's Bay", desc: "A quiet, locals-favorite beach tucked under the flight path. Great snorkeling and a relaxed, off-the-beaten-path vibe.", icon: "🏄" },
              { name: "Private Island Beach Excursion", desc: "Discover secluded beaches accessible only by boat. Drop anchor, swim ashore, and have a stretch of paradise all to yourselves.", icon: "🌅" },
              { name: "Sunset Cruise", desc: "Watch the Caribbean sun melt into the horizon from the water. The perfect way to end any day in the USVI.", icon: "🌇" },
              { name: "Island Hopping", desc: "Explore multiple islands in a single day — St. Thomas, St. John, Water Island, and beyond. Every stop is a new adventure.", icon: "🗺️" },
              { name: "Bachelorette / Bachelor Party", desc: "Celebrate in style on the water! Beach bars, snorkeling, great music, and the most scenic backdrop in the Caribbean.", icon: "🎉" },
              { name: "Day Drinking on a Boat", desc: "Sometimes the itinerary is simple: good music, cold drinks, warm water, great company. No agenda required.", icon: "🍺" },
              { name: "Family Experience", desc: "Captain Brian is a grandfather himself. Kid-friendly routes, life jackets for all sizes, and memories that last a lifetime.", icon: "👨‍👩‍👧‍👦" },
              { name: "Daddy Daughter Day on the Boat", desc: "Make memories she'll talk about forever. A private charter just for the two of you — or the whole crew.", icon: "💛" },
            ].map((d, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div style={{ background: `${C.cream}06`, borderRadius: "12px", padding: "20px", border: `1px solid ${C.gold}12`, height: "100%" }}>
                  <span style={{ fontSize: "24px", display: "block", marginBottom: "10px" }}>{d.icon}</span>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: C.cream, margin: "0 0 6px" }}>
                    {d.link ? (
                      <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ color: C.gold, textDecoration: "none" }}>{d.name} ↗</a>
                    ) : d.name}
                  </h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, lineHeight: 1.6, margin: 0, opacity: 0.8 }}>{d.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT / THE STORY ═══ — Changes 7, 15, 21 */}
      <WavesDivider color={C.navy} flip />
      <section id="about" style={{ padding: "80px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy} 50%, ${C.midNavy})`, position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.gold, marginBottom: "10px", fontWeight: 500, textAlign: "center" }}>THE CAPTAIN'S STORY</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: C.cream, margin: "0 0 8px", letterSpacing: "-0.03em", textAlign: "center" }}>From Dress Blues to Ocean Blues</h2>
            <StarSeparator />
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "36px", marginTop: "40px", alignItems: "start" }}>
              {/* Family portrait left */}
              <div style={{ aspectRatio: "3/4", borderRadius: "12px", overflow: "hidden", background: `linear-gradient(135deg, ${C.midNavy}, ${C.navy})`, border: `2px solid ${C.gold}25` }}>
                <img src={familyPhoto} alt="Captain Brian D Vukelic with family" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
              </div>

              {/* Story text center — Change 15: new paragraph added */}
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", lineHeight: 1.8, color: C.sand, margin: "0 0 20px" }}>
                  After 26 years in the United States Marine Corps, Captain Brian traded his dress blues for a boat and flip flops and his Assault Amphibian Vehicle for a boat slip in the U.S. Virgin Islands.
                </p>
                {/* Change 15 — new leadership/safety paragraph */}
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", lineHeight: 1.8, color: C.sand, margin: "0 0 20px" }}>
                  Captain Brian served as a Lieutenant Colonel — leading Marines through training, deployments, and real-world operations where the cost of a bad decision is measured in lives. That same standard applies aboard Luna's Wake. Safety briefings are thorough. Routes are planned, not improvised. Guests are looked after the same way his Marines were — with discipline, with care, and with a genuine sense of responsibility for their wellbeing.
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", lineHeight: 1.8, color: C.sand, margin: "0 0 20px" }}>
                  But some things never change — the discipline, the attention to detail, and the commitment to taking care of people. That's the foundation of Knotty Marine Charters: a veteran-owned operation built on service, safety, and making sure every single person aboard Luna's Wake has the best day of their vacation.
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", lineHeight: 1.8, color: C.sand, margin: "0 0 20px" }}>
                  A proud grandfather, father, and husband — Brian named the boat Luna's Wake after his granddaughter Luna. Every charter is a family affair, and every guest is treated like one of our own.
                </p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "20px", lineHeight: 1.5, color: C.cream, margin: "0 0 24px" }}>
                  "I served my country for 26 years. Now I serve rum punch."
                </p>

                {/* Change 21 — Why Veteran-Owned Matters block */}
                <div style={{ background: `${C.deepNavy}`, borderRadius: "10px", padding: "20px 24px", border: `1px solid ${C.gold}20`, borderLeft: `4px solid ${C.gold}`, marginBottom: "20px" }}>
                  <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "2px", color: C.gold, margin: "0 0 12px", fontWeight: 500 }}>WHAT VETERAN-OWNED MEANS FOR YOUR CHARTER:</p>
                  {[
                    "Safety without shortcuts — the same standards that kept Marines alive apply on the water",
                    "Accountability — if something isn't right, Captain Brian fixes it personally, not a call center",
                    "Local knowledge — 26 years of discipline applied to knowing every reef, cove, and beach bar in the USVI",
                    "When you book with KMC, a portion of every charter supports a service-disabled veteran's livelihood",
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ color: C.gold, fontSize: "10px", marginTop: "5px", flexShrink: 0 }}>◆</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Change 7 — Expanded veteran credential block */}
                <div style={{ display: "inline-flex", flexDirection: "column", gap: "6px", padding: "16px 24px", borderRadius: "8px", border: `1.5px solid ${C.rust}60`, background: `${C.rust}10` }}>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", letterSpacing: "3px", color: C.rust, fontWeight: 600 }}>★ SERVICE DISABLED VETERAN OWNED & OPERATED</span>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "16px", letterSpacing: "4px", color: C.gold }}>UNITED STATES MARINE CORPS</span>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "15px", letterSpacing: "2px", color: C.sand }}>LIEUTENANT COLONEL (RETIRED)  •  26 YEARS</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.gold, fontStyle: "italic", letterSpacing: "1px" }}>Owner-operated. Captain Brian is your captain — not a hired crew member.</span>
                </div>

                {/* Change 18 — Instagram handle in About section */}
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.gold, fontStyle: "italic", margin: "12px 0 0" }}>
                  Follow our adventures{" "}
                  <a href="https://www.instagram.com/KnottyMarineUSVI" target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>@KnottyMarineUSVI</a>
                </p>
              </div>

              {/* Luna photo right */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ borderRadius: "12px", overflow: "hidden", border: `2px solid ${C.gold}25`, position: "relative" }}>
                  <img src={lunaPhoto} alt="Luna — the inspiration behind Luna's Wake" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(6,18,34,0.9))", padding: "24px 12px 12px" }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: C.cream, margin: "0 0 2px", fontWeight: 700 }}>Meet Luna</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.sand, margin: 0, opacity: 0.8 }}>The inspiration behind Luna's Wake</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
      <WavesDivider color={C.navy} />

      {/* ═══ THE BOAT ═══ */}
      <section id="the-boat" style={{ padding: "80px 24px", background: `linear-gradient(180deg, ${C.warmWhite}, ${C.cream})` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>YOUR VESSEL</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Luna's Wake</h2>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "18px", color: "#8b8378" }}>Named after Captain Brian's granddaughter</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ borderRadius: "20px", overflow: "hidden", background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, border: `1px solid ${C.gold}20`, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ overflow: "hidden" }}>
                <img src={boatSide} alt="2025 Monterey 30 Elite - Luna's Wake" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "36px 32px" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: C.cream, margin: "0 0 4px" }}>Vessel Specifications</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, margin: "0 0 24px", opacity: 0.7 }}>Comfort, safety, and style on the water</p>
                {[
                  ["Length", "30 ft — 2025 Monterey 30 Elite"],
                  ["Awards", "2024 Boat of the Year • Miami Innovation Award • Top Product 2025"],
                  ["Capacity", "Up to 10 guests"],
                  ["Beam", "9'10\""],
                  ["Max Power", "600 HP Twin Mercury Outboards"],
                  ["Top Speed", "54+ MPH"],
                  ["Fuel Capacity", "200 Gallons"],
                  ["Electronics", "Simrad 15\" GPS/Chartplotter"],
                  ["Sound", "Fusion Apollo, 6 JL Speakers + 2 Subwoofers"],
                  ["Features", "Fiberglass hardtop, wetbar, electric head, trim tabs"],
                  ["Safety", "Full USCG compliant, NMMA certified"],
                  ["Snorkel Gear", "Included for all guests"],
                  ["Home Port", "St. Thomas, USVI"],
                ].map(([label, val], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.gold}12` }}>
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "2px", color: C.gold, fontWeight: 500 }}>{label.toUpperCase()}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ BOAT GALLERY ═══ */}
      <section style={{ padding: "60px 24px", background: `linear-gradient(175deg, ${C.cream}, ${C.warmWhite})` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>YOUR RIDE</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: C.navy, margin: 0, letterSpacing: "-0.03em" }}>The 2025 Monterey 30 Elite</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#8b8378", marginTop: "8px" }}>Boating Magazine's 2024 Boat of the Year • Miami Innovation Award Winner</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
            <FadeIn>
              <div style={{ borderRadius: "16px", overflow: "hidden", height: "100%" }}>
                <img src={boatSunset} alt="Monterey 30 Elite at sunset" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            </FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <FadeIn delay={0.15}>
                <div style={{ borderRadius: "16px", overflow: "hidden", flex: 1 }}>
                  <img src={boatAction} alt="Monterey 30 Elite cruising" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT TO BRING ═══ — Change 13: added photo tips card */}
      <section style={{ padding: "80px 24px", background: `linear-gradient(180deg, ${C.warmWhite}, ${C.cream})` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>BEFORE YOU BOARD</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: C.navy, margin: 0, letterSpacing: "-0.03em" }}>What to Bring</h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
            <FadeIn>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: `1px solid ${C.sand}40` }}>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "14px", letterSpacing: "3px", color: C.sea, marginBottom: "16px", fontWeight: 600 }}>✓ BRING WITH YOU</h3>
                {[
                  "1 towel per person",
                  "Reef-safe sunscreen — LOTION ONLY",
                  "Sunglasses with a strap (Croakies)",
                  "Hat that fits snugly (it's windy!)",
                  "Waterproof phone pouch or case",
                  "Cash for beach bars and food stops",
                  "Light cover-up or rash guard",
                  "Dry bag for electronics & valuables",
                  "Snacks & sandwiches if desired",
                  "Valid ID (for beach bar stops)",
                  "Sense of adventure",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ color: C.sea, fontSize: "14px", marginTop: "1px" }}>✓</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#5a554e", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: `2px solid ${C.rust}25` }}>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "14px", letterSpacing: "3px", color: C.rust, marginBottom: "16px", fontWeight: 600 }}>✗ DO NOT BRING</h3>
                {[
                  { item: "NO spray sunscreen", note: "Damages the boat's gel coat, upholstery, and the marine environment" },
                  { item: "NO glass bottles", note: "Safety hazard on the water" },
                  { item: "NO hard-soled shoes", note: "Soft-soled boat shoes or bare feet only" },
                  { item: "NO bananas", note: "Old sailor superstition — we keep it fun!" },
                  { item: "NO bad vibes", note: "This is your best day of vacation!" },
                ].map((x, i) => (
                  <div key={i} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: C.rust, fontSize: "14px", fontWeight: 700 }}>✗</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.navy, fontWeight: 600 }}>{x.item}</span>
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#8b8378", margin: "2px 0 0 24px", lineHeight: 1.4 }}>{x.note}</p>
                  </div>
                ))}
                <div style={{ marginTop: "20px", padding: "14px 16px", borderRadius: "10px", background: `${C.rust}08`, border: `1px solid ${C.rust}20` }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.rust, margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
                    IMPORTANT: Apply sunscreen BEFORE arriving at the boat. Spray sunscreen is strictly prohibited aboard Luna's Wake.
                  </p>
                </div>
              </div>
            </FadeIn>
            {/* Change 13 — For Great Photos card */}
            <FadeIn delay={0.3}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: `2px solid ${C.sea}40` }}>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "14px", letterSpacing: "3px", color: C.sea, marginBottom: "16px", fontWeight: 600 }}>📸 FOR GREAT PHOTOS</h3>
                {[
                  "Waterproof phone case or housing (highly recommended)",
                  "GoPro or underwater camera for snorkeling shots",
                  "Extra battery or portable charger",
                  "Polarized sunglasses reduce glare for topside photos",
                  "Captain Brian is happy to take group photos — just ask!",
                  "We share our best shots on Instagram — tag us @KnottyMarineUSVI",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ color: C.sea, fontSize: "14px", marginTop: "1px" }}>📍</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#5a554e", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ — Changes 8 & 19 */}
      <section style={{ padding: "80px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy})` }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.gold, marginBottom: "10px", fontWeight: 500 }}>QUESTIONS?</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: C.cream, margin: 0, letterSpacing: "-0.03em" }}>Frequently Asked</h2>
            </div>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { q: "What's included in the charter price?", a: "Snorkel gear, cooler with water and ice, Bluetooth sound system, and your USCG-licensed captain. Fuel and gratuity are not included." },
              /* Change 19 — updated fuel answer with cost ranges */
              { q: "How does fuel cost work?", a: "Fuel is paid by guests at the end of the trip based on current market price. Fuel in the USVI typically runs $4.50–$6.00 per gallon. Estimated ranges: Half-Day (St. Thomas area) ~$80–$130 | Full-Day (STT + STJ) ~$130–$200 | Sunset Cruise ~$60–$90 | Circumnavigate St. John ~$180–$250. Your captain calculates the exact amount from gallons used — no markups." },
              /* Change 8 — cancellation policy */
              { q: "What is your cancellation policy?", a: "We hold your date with no deposit required. If you need to cancel, please notify us at least 48 hours in advance at no charge. Cancellations within 48 hours may be subject to a rebooking fee. If we cancel due to unsafe weather or mechanical issues, you owe nothing and we will prioritize rescheduling you." },
              { q: "What if the weather is bad?", a: "Safety is our top priority. If conditions are unsafe, we'll work with you to reschedule. We monitor weather closely and communicate early if there are concerns — typically 24 hours in advance." },
              { q: "Where do we meet?", a: "We offer pickup from multiple locations including Red Hook, Havensight (cruise ship dock), and St. John. Exact meeting point is confirmed when you book." },
              { q: "Do we need passports?", a: "No! All our USVI charters stay within U.S. territory — no passport required. If you want to visit the British Virgin Islands, passports are required and additional customs fees apply." },
              { q: "Can we bring our own food and drinks?", a: "Absolutely. We have cooler space available. We also stop at amazing waterfront restaurants and floating food boats like Pizza Pi and Lime Out." },
              { q: "Is this good for kids?", a: "Yes! Captain Brian is a grandfather himself. We love families and have gear for all ages. Life jackets available in all sizes." },
              /* Change 8 — discount redemption FAQ */
              { q: "How do I claim the military or veterans discount?", a: "Use code USMC10 when booking online, or mention it when you call or email. Valid ID is required at the dock. Active duty military, veterans of any branch, and USVI locals all qualify for 10% off every charter, every time." },
              { q: "How far in advance should we book?", a: "As far ahead as possible, especially during peak season (December–April). We often book out 2-4 weeks in advance." },
              { q: "Do you accommodate special occasions?", a: "Yes — proposals, birthdays, anniversaries, bachelor/bachelorette parties. Let us know and we'll help make it special." },
              { q: "Do you offer a St. John shuttle?", a: "Yes! We offer private water shuttle service between St. Thomas and St. John. Skip the ferry lines and travel in style. Contact us for pricing." },
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div style={{ background: `${C.cream}06`, borderRadius: "12px", padding: "20px 24px", border: `1px solid ${C.gold}10` }}>
                  <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 600, color: C.cream, margin: "0 0 8px" }}>{faq.q}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.sand, lineHeight: 1.7, margin: 0, opacity: 0.85 }}>{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VETERANS SECTION ═══ — Change 6: discount code added */}
      <section id="veterans" style={{ padding: "80px 24px", background: `linear-gradient(135deg, ${C.navy}, ${C.midNavy})`, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, background: `repeating-linear-gradient(45deg, ${C.gold} 0px, ${C.gold} 1px, transparent 1px, transparent 20px)` }} />
        <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ display: "inline-block", padding: "16px 32px", borderRadius: "10px", border: `2px solid ${C.rust}`, background: `${C.rust}10`, marginBottom: "24px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "20px", letterSpacing: "5px", color: C.rust, margin: "0 0 4px", fontWeight: 600 }}>★ SERVICE DISABLED VETERAN OWNED ★</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", letterSpacing: "3px", color: C.sand, margin: 0 }}>UNITED STATES MARINE CORPS • 26 YEARS</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: C.cream, margin: "0 0 12px", letterSpacing: "-0.03em" }}>We Take Care of Our Own</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", lineHeight: 1.8, color: C.sand, margin: "0 0 32px" }}>
              Knotty Marine was built on the values of service, and that doesn't stop at the dock. Active military, veterans, and USVI locals always receive a discount — because this community is family.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div style={{ padding: "32px 40px", borderRadius: "16px", background: `linear-gradient(135deg, ${C.deepNavy}, ${C.navy})`, border: `2px solid ${C.gold}30`, boxShadow: `0 12px 48px rgba(0,0,0,0.3)` }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: C.cream, margin: "0 0 8px", fontWeight: 700 }}>Military, Veterans & Locals</p>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "48px", color: C.gold, margin: "0 0 8px", fontWeight: 600, letterSpacing: "3px", lineHeight: 1 }}>10% OFF</p>
              {/* Change 6 — discount code USMC10 */}
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: C.gold, margin: "0 0 4px", fontWeight: 700, letterSpacing: "2px" }}>Use code: USMC10</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.sand, margin: "0 0 20px", letterSpacing: "0.5px" }}>
                Book online with code USMC10 — or mention it when you call or email.<br />Valid ID required at the dock. Every charter, every time.
              </p>
              <a href="#book-now" style={{ display: "inline-block", padding: "12px 32px", borderRadius: "8px", background: C.gold, color: C.navy, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, textDecoration: "none", letterSpacing: "0.3px" }}>
                Book with Military Discount
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: "80px 24px", background: `linear-gradient(180deg, ${C.cream}, ${C.warmWhite})` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.rust, marginBottom: "10px", fontWeight: 500 }}>WHAT THEY SAY</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: C.navy, margin: 0, letterSpacing: "-0.03em" }}>Straight from the Crew</h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: `1px solid ${C.sand}40`, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="16" height="16" viewBox="0 0 16 16" fill={C.gold}><polygon points="8,1 10,6 15,6.5 11,9.5 12.5,14.5 8,11.5 3.5,14.5 5,9.5 1,6.5 6,6" /></svg>
                    ))}
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", lineHeight: 1.7, color: "#5a554e", margin: "0 0 20px", flex: 1, fontStyle: "italic" }}>"{t.text}"</p>
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

      {/* ═══ PARTNERS ═══ */}
      <section style={{ padding: "60px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy})` }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "5px", color: C.gold, marginBottom: "10px", fontWeight: 500 }}>ISLAND PARTNERS</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: C.cream, margin: "0 0 12px", letterSpacing: "-0.03em" }}>Friends We Do Business With</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: C.sand, margin: "0 0 40px", opacity: 0.8 }}>Trusted local partners who share our commitment to exceptional USVI experiences.</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <a href="https://www.everlongexcursions.com/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "20px", padding: "24px 36px", borderRadius: "16px", background: `${C.cream}06`, border: `1.5px solid ${C.gold}30`, textDecoration: "none" }}>
              <span style={{ fontSize: "36px" }}>⛵</span>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: C.gold, margin: "0 0 4px" }}>Everlong Excursions</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, margin: "0 0 6px", opacity: 0.8 }}>Premier USVI sailing excursions and adventures</p>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", letterSpacing: "2px", color: C.gold, opacity: 0.7 }}>www.everlongexcursions.com ↗</span>
              </div>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ═══ BOOKING CTA ═══ — Changes 4, 5, 16, 17 */}
      <section id="book-now" style={{ padding: "80px 24px", background: `linear-gradient(175deg, ${C.deepNavy}, ${C.navy})`, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "620px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <KnotIcon size={44} color={C.gold} strokeW={2} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: C.cream, margin: "20px 0 8px", letterSpacing: "-0.03em" }}>Ready to Get Knotty?</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", lineHeight: 1.7, color: C.sand, margin: "0 0 16px", opacity: 0.85 }}>
              Book your private charter aboard Luna's Wake and discover why Knotty Marine is the USVI's best day on the water.
            </p>
            {/* Change 16 — urgency signal */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.gold, fontWeight: 700, margin: "0 0 4px" }}>
              Peak season runs December through April — charters book out 2–4 weeks in advance.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, fontStyle: "italic", margin: "0 0 32px", opacity: 0.8 }}>
              Secure your date early to avoid missing out.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
              {/* Change 17 — updated button label */}
              <a href="mailto:KMCUSVI@gmail.com" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", borderRadius: "10px", background: C.gold, color: C.navy, fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 700, textDecoration: "none", boxShadow: `0 6px 28px ${C.gold}30` }}>
                Book Your Date — Check Availability
              </a>
              <a href="tel:+15712327040" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", borderRadius: "10px", background: "transparent", color: C.cream, border: `1.5px solid ${C.cream}30`, fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 500, textDecoration: "none" }}>
                Call Us Direct
              </a>
              {/* Change 5 — WhatsApp button */}
              <a href="https://wa.me/15712327040" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", borderRadius: "10px", background: "#25D366", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 600, textDecoration: "none" }}>
                💬 Text or WhatsApp
              </a>
            </div>
            {/* Change 17 — booking platform placeholder note */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, fontStyle: "italic", margin: "0 0 16px", opacity: 0.6, textAlign: "center" }}>
              Online booking coming soon — email or call to check availability and reserve your date today.
            </p>
            {/* Change 4 — response promise */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.sand, fontStyle: "italic", margin: "0 0 32px", opacity: 0.8, textAlign: "center" }}>
              Questions? We respond within 2 hours during charter season. Email or call — we're here.
            </p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Email", value: "KMCUSVI@gmail.com" },
                { label: "Phone / Text", value: "(571) 232-7040" },
                { label: "WhatsApp", value: "wa.me/15712327040" },
                { label: "Location", value: "St. Thomas, USVI" },
              ].map((c, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "10px", letterSpacing: "3px", color: C.gold, margin: "0 0 4px", fontWeight: 500 }}>{c.label.toUpperCase()}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.sand, margin: 0 }}>{c.value}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ FOOTER ═══ — Changes 9, 14, 18 */}
      <footer style={{ background: C.deepNavy, padding: "0", borderTop: `3px solid ${C.gold}20` }}>
        {/* Change 14 — Email capture section */}
        <div style={{ background: `${C.midNavy}`, padding: "32px 24px", borderBottom: `1px solid ${C.gold}15` }}>
          <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: C.cream, margin: "0 0 6px" }}>Stay in the loop</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.sand, margin: "0 0 16px", opacity: 0.8 }}>Availability updates, USVI charter tips, and seasonal specials</p>
            {emailSubmitted ? (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.gold, fontStyle: "italic" }}>Thank you! We'll be in touch. ⚓</p>
            ) : (
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  placeholder="Your email address"
                  style={{ flex: "1 1 200px", maxWidth: "280px", padding: "10px 16px", borderRadius: "8px", border: `1px solid ${C.gold}30`, background: C.deepNavy, color: C.cream, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", outline: "none" }}
                />
                <button
                  onClick={() => { if (emailValue) setEmailSubmitted(true); }}
                  style={{ padding: "10px 24px", borderRadius: "8px", background: C.gold, color: C.navy, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  Sign Me Up
                </button>
              </div>
            )}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.sand, margin: "10px 0 0", opacity: 0.5, fontStyle: "italic" }}>
              No spam. Just good stuff from a veteran captain who loves his job.
            </p>
          </div>
        </div>

        {/* Main footer */}
        <div style={{ padding: "32px 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: C.cream, margin: "0 0 2px", fontWeight: 700 }}>Knotty Marine Charters</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.sand, margin: "0 0 6px", opacity: 0.5, letterSpacing: "1px" }}>U.S. Virgin Islands · Aboard Luna's Wake</p>
              {/* Change 18 — Instagram handle in footer */}
              <a href="https://www.instagram.com/KnottyMarineUSVI" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: C.gold, textDecoration: "none", opacity: 0.8 }}>
                📸 @KnottyMarineUSVI
              </a>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-flex", padding: "8px 16px", borderRadius: "6px", border: `1px solid ${C.rust}50`, background: `${C.rust}08`, gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "2px", color: C.rust, fontWeight: 600 }}>★ SERVICE DISABLED VETERAN OWNED</span>
              </div>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "12px", letterSpacing: "2px", color: C.sand, margin: "0 0 4px", opacity: 0.6 }}>USMC RETIRED • 26 YEARS</p>
              {/* Change 9 — "Private. Personal. Veteran-owned." in footer */}
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: "13px", letterSpacing: "3px", color: C.gold, margin: "0 0 4px", fontWeight: 500 }}>Private. Personal. Veteran-owned.</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "14px", color: C.gold, margin: 0, opacity: 0.4 }}>"Sun, Fun, Saltwater Memories"</p>
            </div>
          </div>
          <div style={{ maxWidth: "900px", margin: "16px auto 0", paddingTop: "16px", borderTop: `1px solid ${C.gold}10` }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: C.sand, margin: 0, opacity: 0.3, textAlign: "center" }}>
              © 2026 Knotty Marine Charters LLC · All Rights Reserved · St. Thomas, USVI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

