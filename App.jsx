import { useState, useEffect, useRef } from "react";
import boatSide from "./boat-side.jpg";
import boatSunset from "./boat-sunset.jpg";
import boatAction from "./boat-action.jpg";
import familyPhoto from "./family.jpg";
import lunaPhoto from "./luna.jpg";

/* ── SETUP ──────────────────────────────────────────────────────
   1. Add booked dates below as 'YYYY-MM-DD' strings
   2. Optional: replace YOUR_FORMSPREE_ID with your Formspree form
      ID from formspree.io (free) for cleaner email notifications.
      Without it, the form opens the guest's email app pre-filled.
─────────────────────────────────────────────────────────────── */
const BOOKED_DATES = new Set([
  // "2026-07-04",
  // "2026-07-05",
]);
const FORMSPREE_ID = "YOUR_FORMSPREE_ID"; // e.g. "xpzgdabk"

/* ── BRAND ── */
const C = {
  navy: "#0b1d33", deep: "#061222", mid: "#152d4a",
  gold: "#c8a55a", cream: "#f5f0e4", warm: "#faf7f0",
  rust: "#b54a32", sea: "#2a8a9a", sand: "#d4c9b0",
};

/* ── HOOKS ── */
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

function useFade() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.unobserve(el); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, on];
}
function Fade({ children, d = 0, style = {} }) {
  const [ref, on] = useFade();
  return <div ref={ref} style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(24px)", transition: `opacity .6s ease ${d}s, transform .6s ease ${d}s`, ...style }}>{children}</div>;
}

/* ── BOOKING LOGIC ── */
async function submitBooking(data) {
  if (FORMSPREE_ID && FORMSPREE_ID !== "YOUR_FORMSPREE_ID") {
    const r = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: `Charter Request — ${data.charter} on ${data.date}`, _replyto: data.email, ...data }),
    });
    if (!r.ok) throw new Error("Submission failed");
    return;
  }
  // Mailto fallback — works with zero setup
  const sub = encodeURIComponent(`Charter Request — ${data.charter} on ${data.date}`);
  const body = encodeURIComponent(
    `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\n\n` +
    `Charter: ${data.charter}\nDate: ${data.date}\nTime: ${data.time}\nGuests: ${data.guests}\n` +
    `Pickup: ${data.pickup || "Not specified"}\nRequests: ${data.notes || "None"}\n\n` +
    `Policy accepted. Please confirm my booking.`
  );
  window.open(`mailto:KMCUSVI@gmail.com?subject=${sub}&body=${body}`);
}

/* ── AVAILABILITY CALENDAR ── */
function Calendar({ selected, onSelect }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [mo, setMo] = useState(today.getMonth());
  const [yr, setYr] = useState(today.getFullYear());
  const w = useWidth(); const sm = w < 480;
  const fmt = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const days = new Date(yr, mo + 1, 0).getDate();
  const start = new Date(yr, mo, 1).getDay();
  const label = new Date(yr, mo, 1).toLocaleString("default", { month: "long", year: "numeric" });
  const prev = () => mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1);
  const next = () => mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1);
  const status = (d) => {
    const dt = new Date(yr, mo, d);
    if (dt < today) return "past";
    if (BOOKED_DATES.has(fmt(yr, mo, d))) return "booked";
    return "open";
  };
  const cells = [...Array(start).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const dayNames = sm ? ["S","M","T","W","T","F","S"] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return (
    <div style={{ background: C.deep, borderRadius: 14, padding: sm ? "16px 12px" : "24px", border: `1px solid ${C.gold}25` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={prev} style={btnSm}>‹</button>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.cream, margin: 0 }}>{label}</p>
        <button onClick={next} style={btnSm}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
        {dayNames.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 10, color: `${C.sand}70`, letterSpacing: 1, padding: "3px 0", fontFamily: "'Oswald',sans-serif" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const ds = fmt(yr, mo, d);
          const st = status(d);
          const isSel = selected === ds;
          const isToday = fmt(today.getFullYear(), today.getMonth(), today.getDate()) === ds;
          let bg = "transparent", fg = `${C.sand}40`, border = "1px solid transparent", cur = "default";
          if (isSel) { bg = C.gold; fg = C.navy; border = "none"; cur = "pointer"; }
          else if (st === "open") { bg = `${C.gold}12`; fg = C.cream; border = `1px solid ${C.gold}25`; cur = "pointer"; }
          else if (st === "booked") { bg = `${C.rust}12`; fg = `${C.rust}50`; border = `1px solid ${C.rust}15`; }
          else if (isToday) { bg = `${C.sea}30`; fg = C.sea; border = `1px solid ${C.sea}60`; cur = "pointer"; }
          return (
            <div key={ds} onClick={() => st === "open" && onSelect(ds)}
              style={{ height: sm ? 34 : 42, borderRadius: 7, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: bg, border, cursor: cur, gap: 2 }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: sm ? 12 : 13, fontWeight: isSel ? 700 : 500, color: fg }}>{d}</span>
              {st === "open" && !isSel && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4CAF50" }} />}
              {st === "booked" && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.rust, opacity: 0.5 }} />}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
        {[["#4CAF50","Available"],[C.rust,"Booked"],[C.gold,"Selected"]].map(([dot, lbl]) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: `${C.sand}90` }}>{lbl}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: `${C.sand}50`, textAlign: "center", margin: "10px 0 0", fontStyle: "italic" }}>Tap a green date to select it</p>
    </div>
  );
}

/* ── SHARED STYLES ── */
const btnSm = { background: `${C.cream}12`, border: `1px solid ${C.gold}30`, color: C.cream, width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" };
const inp = { width: "100%", padding: "13px 14px", borderRadius: 8, border: `1px solid ${C.sand}80`, fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: C.navy, background: "#fff", outline: "none", boxSizing: "border-box", minHeight: 48 };
const lbl = { fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: C.navy, display: "block", marginBottom: 5 };

/* ── BOOKING SECTION ── */
const CHARTERS = [
  { id: "half-day", name: "Half-Day Charter", hrs: "4 Hours", price: "From $700", avail: "available" },
  { id: "full-day", name: "Full-Day Island Hop", hrs: "7–8 Hours", price: "From $1,300", avail: "limited" },
  { id: "sunset", name: "Sunset Cruise", hrs: "2.5 Hours", price: "From $450", avail: "available" },
  { id: "custom", name: "Custom Charter", hrs: "Flexible", price: "From $1,300", avail: "request" },
];
const AVAIL_STYLE = {
  available: { label: "Available", bg: "#E8F5E9", color: "#1B5E20", dot: "#4CAF50" },
  limited:   { label: "Limited Availability", bg: "#FFF8E1", color: "#E65100", dot: "#FFC107" },
  request:   { label: "Request to Book", bg: "#E3F2FD", color: "#0D47A1", dot: "#64B5F6" },
};

function BookSection() {
  const w = useWidth(); const sm = w < 768;
  const [charter, setCharter] = useState("");
  const [date, setDate] = useState("");
  const [form, setForm] = useState({ name:"", email:"", phone:"", time:"", guests:"2", pickup:"", notes:"", policy: false });
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [errMsg, setErrMsg] = useState("");
  const formRef = useRef(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const onDatePick = (d) => { setDate(d); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200); };
  const onCard = (id) => { setCharter(id); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150); };

  const submit = async (e) => {
    e.preventDefault();
    if (!charter) return alert("Please select a charter above.");
    if (!date) return alert("Please select a date from the calendar above.");
    if (!form.policy) return alert("Please accept the cancellation policy.");
    setStatus("sending");
    try {
      await submitBooking({ ...form, charter: CHARTERS.find(c => c.id === charter)?.name, date });
      setStatus("done");
    } catch (err) {
      setErrMsg(err.message); setStatus("error");
    }
  };

  return (
    <section id="book-a-trip" style={{ padding: sm ? "56px 16px 72px" : "72px 24px", background: `linear-gradient(180deg,${C.warm},${C.cream})` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <Fade><div style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={overline("rust")}>NOW ACCEPTING BOOKINGS</p>
          <h2 style={heading(sm ? 30 : 42)}>Book a Trip</h2>
          <p style={sub14()}>Pick your charter, choose a date, and send your request. Captain Brian responds within 2 hours.</p>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.rust, fontWeight:700, margin:0 }}>Summer & Fall 2026 dates open — limited availability.</p>
        </div></Fade>

        {/* Step 1 — Charter cards */}
        <StepLabel n={1} text="Choose Your Charter" />
        <div style={{ display:"grid", gridTemplateColumns: sm ? "1fr" : w < 1024 ? "1fr 1fr" : "repeat(4,1fr)", gap:14, marginBottom:44 }}>
          {CHARTERS.map(c => {
            const av = AVAIL_STYLE[c.avail];
            const sel = charter === c.id;
            return (
              <div key={c.id} onClick={() => onCard(c.id)} style={{ borderRadius:14, overflow:"hidden", border: sel ? `2px solid ${C.gold}` : `1px solid ${C.sand}50`, background:"#fff", cursor:"pointer", boxShadow: sel ? `0 6px 24px ${C.gold}20` : "0 2px 12px rgba(0,0,0,0.05)", transition:"all .2s" }}>
                <div style={{ padding:"18px 18px 12px", background: sel ? `linear-gradient(135deg,${C.navy},${C.mid})` : `linear-gradient(135deg,${C.cream}80,${C.warm})` }}>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:20, background:av.bg, marginBottom:10 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:av.dot }} />
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, color:av.color }}>{av.label}</span>
                  </div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color: sel ? C.cream : C.navy, margin:"0 0 4px" }}>{c.name}</p>
                  <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:2, color: sel ? C.gold : C.rust, margin:"0 0 4px" }}>{c.hrs}</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:18, fontWeight:800, color: sel ? C.gold : C.navy, margin:0 }}>{c.price}</p>
                </div>
                <div style={{ padding:"10px 18px 16px" }}>
                  <div style={{ display:"block", textAlign:"center", padding:"10px", borderRadius:7, background: sel ? C.gold : `${C.navy}08`, border: sel ? "none" : `1px solid ${C.navy}20`, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, color: sel ? C.navy : C.navy }}>
                    {sel ? "✓ Selected" : c.avail === "request" ? "Request to Book" : "Select"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 2 — Calendar */}
        <StepLabel n={2} text="Check Availability & Pick Your Date" />
        <div style={{ maxWidth:480, marginBottom:44 }}><Calendar selected={date} onSelect={onDatePick} /></div>

        {/* Step 3 — Form */}
        <StepLabel n={3} text="Complete Your Booking Request" />
        <div ref={formRef} style={{ maxWidth:680 }}>
          <div style={{ background:"#fff", borderRadius:18, padding: sm ? "24px 18px" : "36px", border:`1px solid ${C.sand}40`, boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>

            {/* Summary banner */}
            {(charter || date) && (
              <div style={{ marginBottom:22, padding:"12px 16px", borderRadius:9, background:`${C.navy}06`, border:`1px solid ${C.navy}12` }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.navy, margin:0 }}>
                  {charter && <span>Charter: <strong>{CHARTERS.find(c => c.id === charter)?.name}</strong>{"  "}</span>}
                  {date && <span>Date: <strong>{new Date(date + "T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"})}</strong></span>}
                </p>
              </div>
            )}

            {status === "done" ? (
              <div style={{ textAlign:"center", padding:"36px 16px" }}>
                <div style={{ fontSize:48, marginBottom:14 }}>⚓</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:C.navy, margin:"0 0 10px" }}>Request Sent!</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"#6b655e", margin:"0 0 20px", lineHeight:1.6 }}>
                  Your email app opened with all the details pre-filled — just hit <strong>Send</strong>. Captain Brian will confirm within 2 hours.
                </p>
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  <a href="tel:+15712327040" style={ctaBtn(C.navy, C.cream)}>Call (571) 232-7040</a>
                  <a href="https://wa.me/15712327040" target="_blank" rel="noopener noreferrer" style={ctaBtn("#25D366","#fff")}>💬 WhatsApp</a>
                </div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <Row sm={sm}>
                  <Field label="Full Name *"><input required style={inp} type="text" placeholder="Your full name" value={form.name} onChange={e => set("name",e.target.value)} /></Field>
                  <Field label="Email Address *"><input required style={inp} type="email" placeholder="your@email.com" value={form.email} onChange={e => set("email",e.target.value)} /></Field>
                </Row>
                <Row sm={sm}>
                  <Field label="Phone Number *"><input required style={inp} type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={e => set("phone",e.target.value)} /></Field>
                  <Field label="Number of Guests *">
                    <select required style={inp} value={form.guests} onChange={e => set("guests",e.target.value)}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n===1?"guest":"guests"}</option>)}
                    </select>
                  </Field>
                </Row>
                <Row sm={sm}>
                  <Field label={<>Preferred Date * {date && <span style={{color:"#4CAF50",fontWeight:400,fontSize:11}}>✓ from calendar</span>}</>}>
                    <input required style={{...inp, borderColor: date ? "#4CAF50" : `${C.sand}80`}} type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={e => setDate(e.target.value)} />
                  </Field>
                  <Field label="Preferred Time *">
                    <select required style={inp} value={form.time} onChange={e => set("time",e.target.value)}>
                      <option value="">— Select —</option>
                      {["7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM (Sunset)","5:30 PM (Sunset)"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                </Row>
                <div style={{ marginBottom:14 }}>
                  <label style={lbl}>Pickup Location / Hotel or Villa</label>
                  <input style={inp} type="text" placeholder="e.g. Red Hook Marina, Havensight, or hotel name" value={form.pickup} onChange={e => set("pickup",e.target.value)} />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={lbl}>Special Requests or Notes</label>
                  <textarea style={{...inp, minHeight:80, resize:"vertical"}} placeholder="Occasion, destinations, dietary needs, anything else..." value={form.notes} onChange={e => set("notes",e.target.value)} />
                </div>
                <div style={{ marginBottom:24, padding:"14px 16px", background:C.cream, borderRadius:9, border:`1px solid ${C.sand}50` }}>
                  <label style={{ display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer" }}>
                    <input type="checkbox" checked={form.policy} onChange={e => set("policy",e.target.checked)} style={{ width:20, height:20, marginTop:2, flexShrink:0, accentColor:C.navy, cursor:"pointer" }} />
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#5a554e", lineHeight:1.6 }}>
                      <strong>I understand the cancellation policy:</strong> Cancellations 48+ hours before the charter are free. If Captain Brian cancels due to weather or safety, no charge and rescheduling is prioritized. Fuel and gratuity are not included in charter pricing.
                    </span>
                  </label>
                </div>
                <button type="submit" disabled={status==="sending"} style={{ display:"block", width:"100%", padding:18, borderRadius:12, background: status==="sending" ? `${C.gold}80` : C.gold, color:C.navy, fontFamily:"'DM Sans',sans-serif", fontSize:17, fontWeight:700, border:"none", cursor: status==="sending" ? "wait" : "pointer", minHeight:56 }}>
                  {status === "sending" ? "Opening your email..." : "Send Booking Request ⚓"}
                </button>
                {status === "error" && (
                  <div style={{ marginTop:12, padding:"12px 16px", borderRadius:9, background:`${C.rust}08`, border:`1px solid ${C.rust}25`, textAlign:"center" }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.rust, margin:"0 0 6px", fontWeight:600 }}>{errMsg || "Something went wrong."}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#888", margin:0 }}>Call or text: <a href="tel:+15712327040" style={{color:C.navy,fontWeight:600}}>(571) 232-7040</a></p>
                  </div>
                )}
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#999", textAlign:"center", margin:"10px 0 0" }}>We respond within 2 hours. Your info is never shared.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── SMALL HELPERS ── */
function StepLabel({ n, text }) {
  return (
    <Fade>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
        <div style={{ width:34, height:34, borderRadius:"50%", background:C.navy, border:`2px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, color:C.gold, fontWeight:700 }}>{n}</span>
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:C.navy, margin:0 }}>{text}</h3>
      </div>
    </Fade>
  );
}
function Row({ sm, children }) {
  return <div style={{ display:"grid", gridTemplateColumns: sm ? "1fr" : "1fr 1fr", gap:14, marginBottom:14 }}>{children}</div>;
}
function Field({ label, children }) {
  return <div><label style={lbl}>{label}</label>{children}</div>;
}
function overline(c = "gold") { return { fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:5, color:C[c], marginBottom:10, fontWeight:500, display:"block" }; }
function heading(size) { return { fontFamily:"'Playfair Display',serif", fontSize:size, fontWeight:800, color:C.navy, margin:"0 0 10px", letterSpacing:"-0.03em" }; }
function sub14() { return { fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"#8b8378", maxWidth:520, margin:"0 auto 8px", lineHeight:1.6 }; }
function ctaBtn(bg, color) { return { padding:"12px 22px", borderRadius:8, background:bg, color, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, textDecoration:"none", display:"inline-block" }; }

/* ── NAV ── */
function Nav({ scrolled }) {
  const w = useWidth(); const sm = w < 900;
  const [open, setOpen] = useState(false);
  const links = [
    { l:"Charters", h:"#charters" },{ l:"Book a Trip", h:"#book-a-trip", cta:true },
    { l:"About", h:"#about" },{ l:"Veterans", h:"#veterans" },{ l:"FAQ", h:"#faq" },
  ];
  return (
    <>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding: scrolled ? "10px 24px" : "16px 24px", background: scrolled ? `${C.deep}f0` : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? `1px solid ${C.gold}20` : "none", transition:"all .4s", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="#" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
          <svg width={scrolled?26:30} height={scrolled?26:30} viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="10" r="5" stroke={C.gold} strokeWidth="2" fill="none" />
            <line x1="24" y1="15" x2="24" y2="42" stroke={C.gold} strokeWidth="2" />
            <path d="M10 34 L24 46 L38 34" stroke={C.gold} strokeWidth="2" fill="none" />
            <line x1="16" y1="10" x2="32" y2="10" stroke={C.gold} strokeWidth="2" />
          </svg>
          <div>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize: scrolled?15:18, fontWeight:700, color:C.cream, display:"block" }}>Knotty Marine</span>
            <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:8, letterSpacing:4, color:C.gold, fontWeight:300 }}>CHARTERS</span>
          </div>
        </a>
        {!sm ? (
          <div style={{ display:"flex", gap:18, alignItems:"center" }}>
            {links.map(lk => (
              <a key={lk.l} href={lk.h} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight: lk.cta?700:500, color: lk.cta?C.navy:C.sand, padding: lk.cta?"8px 18px":"0", background: lk.cta?C.gold:"transparent", borderRadius: lk.cta?6:0, textDecoration:"none" }}>{lk.l}</a>
            ))}
          </div>
        ) : (
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <a href="#book-a-trip" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, color:C.navy, background:C.gold, padding:"10px 16px", borderRadius:8, textDecoration:"none" }}>Book Now</a>
            <button onClick={() => setOpen(true)} style={{ background:`${C.cream}12`, border:`1px solid ${C.gold}30`, borderRadius:8, width:44, height:44, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5 }}>
              {[0,1,2].map(i => <div key={i} style={{ width:18, height:2, background:C.cream }} />)}
            </button>
          </div>
        )}
      </nav>
      {sm && open && (
        <div style={{ position:"fixed", inset:0, zIndex:99, background:C.deep, display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:`1px solid ${C.gold}15` }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:C.cream }}>Knotty Marine Charters</span>
            <button onClick={() => setOpen(false)} style={{ background:`${C.cream}10`, border:`1px solid ${C.cream}20`, color:C.cream, width:44, height:44, borderRadius:"50%", cursor:"pointer", fontSize:18 }}>✕</button>
          </div>
          {links.map(lk => (
            <a key={lk.l} href={lk.h} onClick={() => setOpen(false)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 28px", borderBottom:`1px solid ${C.gold}10`, fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight: lk.cta?700:400, color: lk.cta?C.gold:C.cream, textDecoration:"none" }}>
              {lk.l}<span style={{ opacity:.4, fontSize:14 }}>→</span>
            </a>
          ))}
          <div style={{ padding:"24px 28px", borderTop:`1px solid ${C.gold}15`, marginTop:"auto" }}>
            <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:3, color:C.gold, margin:"0 0 10px" }}>CONTACT</p>
            <a href="tel:+15712327040" style={{ display:"block", fontFamily:"'DM Sans',sans-serif", fontSize:17, color:C.cream, textDecoration:"none", marginBottom:6 }}>(571) 232-7040</a>
            <a href="https://wa.me/15712327040" style={{ display:"block", fontFamily:"'DM Sans',sans-serif", fontSize:17, color:"#25D366", textDecoration:"none" }}>💬 WhatsApp</a>
          </div>
        </div>
      )}
    </>
  );
}

/* ── STICKY MOBILE BUTTON ── */
function StickyBtn() {
  const w = useWidth();
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 500); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  if (w >= 768 || !show) return null;
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, padding:"12px 16px 20px", background:`${C.deep}f4`, backdropFilter:"blur(10px)", borderTop:`2px solid ${C.gold}40` }}>
      <a href="#book-a-trip" style={{ display:"block", textAlign:"center", padding:16, background:C.gold, color:C.navy, borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontSize:17, fontWeight:700, textDecoration:"none" }}>⚓ Book Your Charter</a>
    </div>
  );
}

/* ── HERO ── */
function Hero() {
  const w = useWidth(); const sm = w < 768;
  return (
    <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(170deg,${C.deep} 0%,${C.navy} 50%,${C.mid} 100%)`, position:"relative", overflow:"hidden", textAlign:"center", padding: sm ? "100px 20px 80px" : "120px 24px 80px" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`repeating-linear-gradient(90deg,${C.gold} 0px,${C.gold} 14px,transparent 14px,transparent 22px)`, opacity:.5 }} />
      <div style={{ position:"relative", zIndex:1, maxWidth:800, width:"100%" }}>
        <Fade>
          <p style={{ fontFamily:"'Oswald',sans-serif", fontSize: sm?13:17, letterSpacing: sm?5:8, color:C.gold, marginBottom:14, fontWeight:500 }}>U.S. VIRGIN ISLANDS</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize: sm?"clamp(36px,10vw,56px)":"clamp(52px,8vw,88px)", fontWeight:800, color:C.cream, margin:"0 0 10px", letterSpacing:"-0.04em", lineHeight:1 }}>Private Boat Charters</h1>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: sm?"clamp(20px,6vw,30px)":"clamp(24px,4vw,38px)", fontWeight:400, color:C.gold, margin:"0 0 16px", lineHeight:1.2 }}>in St. Thomas, USVI</h2>
          <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize: sm?15:18, color:C.sand, margin:"0 0 8px", lineHeight:1.5, maxWidth:600, marginLeft:"auto", marginRight:"auto" }}>
            Explore the Virgin Islands aboard a 2025 Monterey Elite 30 OB with twin white Mercury outboards.
          </p>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize: sm?13:15, color:`${C.sand}80`, margin:"0 0 32px", fontStyle:"italic" }}>"Sun, Fun, Saltwater Memories"</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:32 }}>
            <a href="#book-a-trip" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:700, color:C.navy, background:C.gold, padding:"16px 32px", borderRadius:10, textDecoration:"none", boxShadow:`0 6px 24px ${C.gold}35`, width: sm?"100%":"auto", textAlign:"center" }}>Book Your Charter</a>
            <a href="tel:+15712327040" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:500, color:C.cream, padding:"16px 32px", borderRadius:10, textDecoration:"none", border:`1.5px solid ${C.cream}30`, width: sm?"100%":"auto", textAlign:"center" }}>Call / Text Us</a>
            <a href="https://wa.me/15712327040" target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:600, color:"#fff", background:"#25D366", padding:"16px 32px", borderRadius:10, textDecoration:"none", width: sm?"100%":"auto", textAlign:"center" }}>💬 WhatsApp</a>
          </div>
          <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:6, padding:"14px 24px", borderRadius:30, border:`1px solid ${C.gold}25`, background:`${C.gold}06`, marginBottom:14 }}>
            <span style={{ fontFamily:"'Oswald',sans-serif", fontSize: sm?13:15, color:C.rust, letterSpacing:2, fontWeight:700 }}>★ SERVICE DISABLED VETERAN OWNED  ◆  USMC RETIRED • 26 YEARS</span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.sand, opacity:.65, letterSpacing:1 }}>St. Thomas, USVI  •  Up to 10 Guests  •  No Passport Required</span>
          </div>
          <br />
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 20px", borderRadius:30, background:"rgba(76,175,80,0.15)", border:"1px solid rgba(76,175,80,0.5)", marginTop:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#4CAF50", boxShadow:"0 0 8px #4CAF50" }} />
            <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:2, color:C.cream, fontWeight:500 }}>NOW BOOKING — SUMMER & FALL 2026</span>
          </div>
        </Fade>
      </div>
    </section>
  );
}

/* ── RATES & INCLUSIONS ── */
function RatesBar() {
  const w = useWidth(); const sm = w < 600;
  return (
    <div style={{ background:C.warm, padding:"24px 20px 14px", borderBottom:`1px solid ${C.sand}30` }}>
      <div style={{ maxWidth:880, margin:"0 auto" }}>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:12 }}>
          {[{t:"Half-Day",s:"4 hrs · up to 10",p:"From $700",c:C.sea,bg:`${C.sea}14`},{t:"Full-Day",s:"7–8 hrs · up to 10",p:"From $1,300",c:C.gold,bg:`${C.gold}18`,pop:true},{t:"Sunset",s:"2.5 hrs · up to 10",p:"From $450",c:C.rust,bg:`${C.rust}14`}].map(r => (
            <div key={r.t} style={{ flex:`1 1 ${sm?"100%":"160px"}`, maxWidth: sm?"100%":250, background:r.bg, borderRadius:12, padding:"16px 18px", border:`1.5px solid ${r.c}30`, position:"relative" }}>
              {r.pop && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:C.gold, color:C.navy, padding:"2px 10px", borderRadius:20, fontFamily:"'Oswald',sans-serif", fontSize:9, letterSpacing:2, fontWeight:700, whiteSpace:"nowrap" }}>MOST POPULAR</div>}
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:C.navy, margin:"0 0 3px" }}>{r.t}</p>
              <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:1.5, color:r.c, margin:"0 0 6px" }}>{r.s}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:22, fontWeight:800, color:C.navy, margin:0 }}>{r.p}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign:"center", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.rust, fontWeight:700, margin:0 }}>⚠ Price does not include Fuel or Gratuity  •  Military &amp; locals 10% off — code <strong>USMC10</strong></p>
      </div>
    </div>
  );
}

/* ── 3 WAYS TO BOOK BAR ── */
function BookBar() {
  const w = useWidth(); const sm = w < 600;
  return (
    <div style={{ background:C.navy, padding: sm?"18px 16px":"16px 24px", borderBottom:`2px solid ${C.gold}30` }}>
      <div style={{ maxWidth:880, margin:"0 auto" }}>
        <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:4, color:C.gold, textAlign:"center", margin:"0 0 12px", fontWeight:500 }}>3 WAYS TO BOOK YOUR CHARTER</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          {[{h:"#book-a-trip",l:"📋 Fill Out the Form",bg:C.gold,c:C.navy},{h:"tel:+15712327040",l:"📞 (571) 232-7040",bg:`${C.cream}12`,c:C.cream,bd:`1px solid ${C.cream}25`},{h:"https://wa.me/15712327040",l:"💬 WhatsApp",bg:"#25D366",c:"#fff",ext:true}].map(b => (
            <a key={b.l} href={b.h} target={b.ext?"_blank":undefined} rel={b.ext?"noopener noreferrer":undefined}
              style={{ flex:"1 1 150px", maxWidth:210, display:"flex", alignItems:"center", justifyContent:"center", padding:"13px 16px", borderRadius:10, background:b.bg, color:b.c, border:b.bd||"none", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, textDecoration:"none", textAlign:"center" }}>{b.l}</a>
          ))}
        </div>
        <p style={{ textAlign:"center", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.sand, margin:"10px 0 0", opacity:.65 }}>Captain Brian responds within 2 hours  •  Military &amp; locals 10% off — code <strong style={{color:C.gold}}>USMC10</strong></p>
      </div>
    </div>
  );
}

/* ── CHARTERS SECTION ── */
function ChartersSection() {
  const w = useWidth(); const sm = w < 768;
  const items = [
    {icon:"☀️",t:"Half-Day Adventure",h:"4 Hours",p:"From $700",bf:"Best for: Families · First-timers · Cruise guests",d:"Swim with sea turtles at Buck Island, beach hop to Water Island, and explore hidden coves around St. Thomas aboard Luna's Wake."},
    {icon:"🏝️",t:"Full-Day Island Hop",h:"7–8 Hours",p:"From $1,300",bf:"Best for: Groups who want everything",d:"Circle St. John, snorkel Trunk Bay, stop at Lime Out floating taco bar, and choose your own lunch spot.",pop:true},
    {icon:"🌅",t:"Sunset Cruise",h:"2.5 Hours",p:"From $450",bf:"Best for: Couples · Proposals · Anniversaries",d:"Watch the Caribbean sky ignite from the water. Perfect for proposals, anniversaries, and celebrations."},
    {icon:"🎉",t:"Bachelorette / Bachelor",h:"7–8 Hours",p:"From $1,300",bf:"Best for: Parties · Birthdays · Celebrations",d:"Beach bars, snorkeling, music, and the most scenic backdrop in the USVI. Celebrate Knotty style."},
    {icon:"🚢",t:"Cruise Ship Express",h:"4 Hours",p:"From $1,300",bf:"Best for: Cruise passengers · Havensight pickup",d:"Only in port for the day? Havensight pickup, snorkeling, beach stops, and Lime Out — all in 4 hours."},
    {icon:"🍕",t:"St. John Foodie Tour",h:"7–8 Hours",p:"From $1,500",bf:"Best for: Food lovers · Full island experience",d:"Eat your way around St. John — Lovango Beach Club, Cruz Bay, Pizza Pi, or Lime Out. Plus Trunk Bay snorkeling."},
    {icon:"🗺️",t:"Circumnavigate STJ",h:"7–8 Hours",p:"From $1,300",bf:"Best for: Explorers · Photographers",d:"See dramatic coastlines, hidden coves, cliffs, and world-class snorkel spots from the water."},
    {icon:"🧭",t:"Build Your Own",h:"Full Day",p:"From $1,300",bf:"Best for: Repeat visitors · Anyone with a vision",d:"Your route, your pace, your day. Tell Captain Brian what you want and he'll make it happen."},
  ];
  return (
    <section id="charters" style={{ padding: sm?"56px 16px":"72px 24px", background:`linear-gradient(180deg,${C.warm},${C.cream})` }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <Fade><div style={{ textAlign:"center", marginBottom:44 }}>
          <p style={overline("rust")}>CHOOSE YOUR ADVENTURE</p>
          <h2 style={heading(sm?30:42)}>Charter Experiences</h2>
          <p style={sub14()}>Private charters for every occasion — half-day snorkels to full-day island expeditions.</p>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.rust, fontWeight:700, margin:0 }}>⚠ Price does not include Fuel or Gratuity</p>
        </div></Fade>
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", justifyContent:"center", alignItems:"stretch" }}>
          {items.map((c,i) => (
            <Fade key={i} d={i*.06} style={{ flex:"1 1 260px", maxWidth: sm?"100%":340 }}>
              <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", border: c.pop?`2px solid ${C.gold}`:`1px solid ${C.sand}50`, boxShadow: c.pop?`0 8px 28px ${C.gold}15`:"0 3px 14px rgba(0,0,0,0.04)", height:"100%", display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"22px 20px 14px", background: c.pop?`linear-gradient(135deg,${C.navy},${C.mid})`:`linear-gradient(135deg,${C.cream}80,${C.warm})` }}>
                  <span style={{ fontSize:28, display:"block", marginBottom:8 }}>{c.icon}</span>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color: c.pop?C.cream:C.navy, margin:"0 0 3px" }}>{c.t}</h3>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: c.pop?`${C.gold}cc`:C.rust, margin:"0 0 5px", fontStyle:"italic" }}>{c.bf}</p>
                  <div style={{ display:"flex", gap:10, alignItems:"baseline" }}>
                    <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:2, color: c.pop?C.gold:C.rust }}>{c.h}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:18, fontWeight:800, color: c.pop?C.gold:C.navy }}>{c.p}</span>
                  </div>
                </div>
                <div style={{ padding:"14px 20px 20px", flex:1, display:"flex", flexDirection:"column" }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.65, color:"#6b655e", margin:"0 0 14px" }}>{c.d}</p>
                  <a href="#book-a-trip" style={{ display:"block", textAlign:"center", marginTop:"auto", padding:11, borderRadius:8, background: c.pop?C.gold:"transparent", color:C.navy, border: c.pop?"none":`1.5px solid ${C.navy}20`, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, textDecoration:"none", minHeight:44, lineHeight:"22px" }}>
                    {c.pop ? "Book This Charter" : "Check Availability"}
                  </a>
                </div>
              </div>
            </Fade>
          ))}
        </div>
        <Fade d={.3}><p style={{ textAlign:"center", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.rust, margin:"32px 0 0", fontWeight:600 }}>All charters include snorkel gear, water, ice &amp; Bluetooth speakers. No passport required.  •  Military &amp; locals: 10% off — code <strong>USMC10</strong></p></Fade>
      </div>
    </section>
  );
}

/* ── ABOUT ── */
function AboutSection() {
  const w = useWidth(); const sm = w < 768;
  return (
    <section id="about" style={{ padding: sm?"56px 16px":"72px 24px", background:`linear-gradient(175deg,${C.deep},${C.navy} 55%,${C.mid})` }}>
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        <Fade><div style={{ textAlign:"center", marginBottom:36 }}>
          <p style={overline()}>THE CAPTAIN'S STORY</p>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: sm?28:42, fontWeight:800, color:C.cream, margin:0, letterSpacing:"-0.03em" }}>From Dress Blues to Ocean Blues</h2>
        </div></Fade>
        <Fade d={.15}>
          <div style={{ display:"grid", gridTemplateColumns: sm?"1fr":"1fr 2fr", gap: sm?24:36, alignItems:"start" }}>
            <div style={{ borderRadius:14, overflow:"hidden", border:`2px solid ${C.gold}25` }}>
              <img src={familyPhoto} alt="Captain Brian with family" style={{ width:"100%", aspectRatio: sm?"4/3":"3/4", objectFit:"cover", objectPosition:"center top" }} />
            </div>
            <div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, lineHeight:1.8, color:C.sand, margin:"0 0 16px" }}>After 26 years in the United States Marine Corps, Captain Brian traded his dress blues for a boat and flip flops — and his Assault Amphibian Vehicle for a boat slip in the U.S. Virgin Islands.</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, lineHeight:1.8, color:C.sand, margin:"0 0 16px" }}>He served as a Lieutenant Colonel, leading Marines through deployments where the cost of a bad decision is measured in lives. That same standard applies aboard Luna's Wake. Safety briefings are thorough. Routes are planned. Guests are looked after the same way his Marines were — with discipline, care, and genuine responsibility.</p>
              <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:17, color:C.cream, margin:"0 0 20px" }}>"I served my country for 26 years. Now I serve rum punch."</p>
              <div style={{ padding:"14px 18px", borderRadius:9, border:`1.5px solid ${C.rust}60`, background:`${C.rust}10`, marginBottom:16 }}>
                <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, letterSpacing:2, color:C.rust, margin:"0 0 4px", fontWeight:600 }}>★ SERVICE DISABLED VETERAN OWNED &amp; OPERATED</p>
                <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:3, color:C.gold, margin:"0 0 3px" }}>UNITED STATES MARINE CORPS</p>
                <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:2, color:C.sand, margin:"0 0 6px" }}>LIEUTENANT COLONEL (RETIRED)  •  26 YEARS</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.gold, fontStyle:"italic", margin:0 }}>Owner-operated. Captain Brian is your captain — not a hired crew member.</p>
              </div>
              {!sm && <div style={{ borderRadius:12, overflow:"hidden", border:`2px solid ${C.gold}25`, position:"relative", maxWidth:200 }}>
                <img src={lunaPhoto} alt="Luna" style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block" }} />
                <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent,rgba(6,18,34,.9))", padding:"16px 10px 10px" }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:12, color:C.cream, margin:0, fontWeight:700 }}>Luna — the inspiration</p>
                </div>
              </div>}
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );
}

/* ── VETERANS ── */
function VeteransSection() {
  const w = useWidth(); const sm = w < 768;
  return (
    <section id="veterans" style={{ padding: sm?"56px 16px":"72px 24px", background:`linear-gradient(135deg,${C.navy},${C.mid})`, textAlign:"center" }}>
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <Fade>
          <div style={{ display:"inline-block", padding:"12px 26px", borderRadius:10, border:`2px solid ${C.rust}`, background:`${C.rust}10`, marginBottom:22 }}>
            <p style={{ fontFamily:"'Oswald',sans-serif", fontSize: sm?15:19, letterSpacing:4, color:C.rust, margin:"0 0 3px", fontWeight:600 }}>★ SERVICE DISABLED VETERAN OWNED ★</p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, letterSpacing:2, color:C.sand, margin:0 }}>UNITED STATES MARINE CORPS • 26 YEARS</p>
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: sm?26:36, fontWeight:800, color:C.cream, margin:"0 0 12px", letterSpacing:"-0.03em" }}>We Take Care of Our Own</h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, lineHeight:1.8, color:C.sand, margin:"0 0 28px" }}>Knotty Marine was built on the values of service. Active military, veterans, and USVI locals always receive a discount — because this community is family.</p>
          <div style={{ padding: sm?"22px 18px":"30px 40px", borderRadius:16, background:`linear-gradient(135deg,${C.deep},${C.navy})`, border:`2px solid ${C.gold}30`, boxShadow:`0 12px 48px rgba(0,0,0,0.3)` }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:19, color:C.cream, margin:"0 0 6px", fontWeight:700 }}>Military, Veterans &amp; Locals</p>
            <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:48, color:C.gold, margin:"0 0 6px", fontWeight:600, letterSpacing:3, lineHeight:1 }}>10% OFF</p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:17, color:C.gold, margin:"0 0 4px", fontWeight:700, letterSpacing:2 }}>Use code: USMC10</p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.sand, margin:"0 0 20px" }}>Book online with USMC10 — or mention it when you call. Valid ID required at the dock.</p>
            <a href="#book-a-trip" style={{ display:"inline-block", padding:"13px 30px", borderRadius:8, background:C.gold, color:C.navy, fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:700, textDecoration:"none" }}>Book with Military Discount</a>
          </div>
        </Fade>
      </div>
    </section>
  );
}

/* ── FAQ ── */
function FAQSection() {
  const w = useWidth(); const sm = w < 768;
  const faqs = [
    ["What's included?","Snorkel gear, cooler with water and ice, Bluetooth sound system, and your USCG-licensed captain. Fuel and gratuity are not included."],
    ["How does fuel cost work?","Fuel is paid by guests based on gallons used at current market price (~$4.50–$6.00/gallon in USVI). Estimated ranges: Half-Day ~$80–$130 | Full-Day ~$130–$200 | Sunset ~$60–$90."],
    ["What is your cancellation policy?","Cancellations with 48+ hours notice are free. If we cancel due to weather or safety, you owe nothing and we prioritize rescheduling."],
    ["Do we need passports?","No — all USVI charters are U.S. territory. Passports are only required for BVI trips."],
    ["How do I claim the military discount?","Use code USMC10 when booking or mention it when you call. Valid ID required at the dock. Active duty, veterans of any branch, and USVI locals qualify."],
    ["Where do we meet?","Red Hook Marina, Havensight (cruise ship dock), or St. John — confirmed when you book."],
    ["Is this good for kids?","Yes. Captain Brian is a grandfather. Kid-friendly routes, life jackets in all sizes, and memories that last a lifetime."],
    ["How far in advance should we book?","As early as possible. Peak season (December–April) books out 2–4 weeks in advance."],
  ];
  return (
    <section id="faq" style={{ padding: sm?"56px 16px":"72px 24px", background:`linear-gradient(175deg,${C.deep},${C.navy})` }}>
      <div style={{ maxWidth:740, margin:"0 auto" }}>
        <Fade><div style={{ textAlign:"center", marginBottom:40 }}>
          <p style={overline()}>QUESTIONS?</p>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: sm?28:40, fontWeight:800, color:C.cream, margin:0, letterSpacing:"-0.03em" }}>Frequently Asked</h2>
        </div></Fade>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {faqs.map(([q,a],i) => (
            <Fade key={i} d={i*.04}>
              <div style={{ background:`${C.cream}06`, borderRadius:10, padding:"16px 18px", border:`1px solid ${C.gold}10` }}>
                <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color:C.cream, margin:"0 0 7px" }}>{q}</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.sand, lineHeight:1.7, margin:0, opacity:.85 }}>{a}</p>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  const w = useWidth(); const sm = w < 768;
  return (
    <footer style={{ background:C.deep, borderTop:`3px solid ${C.gold}20` }}>
      <div style={{ padding: sm?"56px 16px":"56px 24px" }}>
        <div style={{ maxWidth:860, margin:"0 auto", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:24, flexDirection: sm?"column":"row" }}>
          <div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:C.cream, margin:"0 0 4px", fontWeight:700 }}>Knotty Marine Charters</p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.sand, margin:"0 0 12px", opacity:.5, letterSpacing:1 }}>U.S. Virgin Islands · Aboard Luna's Wake</p>
            {[{h:"tel:+15712327040",l:"📞 (571) 232-7040"},{h:"mailto:KMCUSVI@gmail.com",l:"✉ KMCUSVI@gmail.com"},{h:"https://wa.me/15712327040",l:"💬 WhatsApp",ext:true},{h:"https://www.instagram.com/KnottyMarineUSVI",l:"📸 @KnottyMarineUSVI",ext:true}].map(lk => (
              <a key={lk.l} href={lk.h} target={lk.ext?"_blank":undefined} rel={lk.ext?"noopener noreferrer":undefined} style={{ display:"block", fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.sand, textDecoration:"none", marginBottom:6, opacity:.8 }}>{lk.l}</a>
            ))}
          </div>
          <div style={{ textAlign: sm?"left":"right" }}>
            <div style={{ display:"inline-flex", padding:"7px 14px", borderRadius:6, border:`1px solid ${C.rust}50`, background:`${C.rust}08`, marginBottom:6 }}>
              <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:2, color:C.rust, fontWeight:600 }}>★ SERVICE DISABLED VETERAN OWNED</span>
            </div>
            <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:2, color:C.sand, margin:"0 0 3px", opacity:.6 }}>USMC RETIRED • 26 YEARS</p>
            <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:3, color:C.gold, margin:"0 0 3px", fontWeight:500 }}>Private. Personal. Veteran-owned.</p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:13, color:C.gold, margin:0, opacity:.4 }}>"Sun, Fun, Saltwater Memories"</p>
          </div>
        </div>
        <div style={{ maxWidth:860, margin:"16px auto 0", paddingTop:14, borderTop:`1px solid ${C.gold}10` }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.sand, margin:0, opacity:.3, textAlign:"center" }}>© 2026 Knotty Marine Charters LLC · All Rights Reserved · St. Thomas, USVI</p>
        </div>
      </div>
    </footer>
  );
}

/* ── APP ── */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 60); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <div style={{ minHeight:"100vh", background:C.warm, fontFamily:"'DM Sans',sans-serif", overflowX:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=Oswald:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Nav scrolled={scrolled} />
      <StickyBtn />
      <Hero />
      <RatesBar />
      <BookBar />
      <ChartersSection />
      <BookSection />
      <AboutSection />
      <VeteransSection />
      <FAQSection />
      {/* Boat photos */}
      <section style={{ padding:"48px 24px", background:`linear-gradient(175deg,${C.cream},${C.warm})` }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Fade><p style={{ ...overline("rust"), textAlign:"center" }}>YOUR VESSEL</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:800, color:C.navy, margin:"0 0 28px", textAlign:"center", letterSpacing:"-0.03em" }}>Luna's Wake — 2025 Monterey Elite 30</h2></Fade>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
            <Fade><img src={boatSunset} alt="Luna's Wake at sunset" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:14, display:"block", minHeight:220 }} /></Fade>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Fade d={.1}><img src={boatAction} alt="Luna's Wake cruising" style={{ width:"100%", flex:1, objectFit:"cover", borderRadius:14, display:"block" }} /></Fade>
              <Fade d={.2}><img src={boatSide} alt="Luna's Wake profile" style={{ width:"100%", flex:1, objectFit:"cover", borderRadius:14, display:"block" }} /></Fade>
            </div>
          </div>
          <Fade d={.2}><p style={{ textAlign:"center", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#8b8378", margin:"16px 0 0" }}>Boating Magazine's 2024 Boat of the Year  •  Miami Innovation Award  •  600 HP Twin Mercury  •  54+ MPH</p></Fade>
        </div>
      </section>
      <Footer />
    </div>
  );
}
