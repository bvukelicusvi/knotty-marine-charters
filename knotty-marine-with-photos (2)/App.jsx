import { useState, useEffect, useRef } from "react";
import boatSide from './boat-side.jpg';
import boatSunset from './boat-sunset.jpg';
import boatAction from './boat-action.jpg';
import familyPhoto from './family.jpg';
import lunaPhoto from './luna.jpg';

// ─── Cloudinary Config ────────────────────────────────────────────────────────
// ONE-TIME SETUP in Cloudinary dashboard:
// 1. Settings → Security → enable "Resource list"
// 2. Settings → Upload → Upload Presets → Add preset:
//    Name: kmc_guest | Mode: Unsigned | Folder: kmc_gallery | Tags: kmc_pending
const CLOUD = 'dl9nhkirk';
const API_KEY = '883626963954548';
const API_SECRET = 'KhdWnxwCXylcp8imxB1HfrT2y1Q';
const UPLOAD_PRESET = 'kmc_guest';
const ADMIN_PW = 'KMCAdmin2026'; // Change to your preferred password

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:"#0b1d33",deepNavy:"#061222",midNavy:"#152d4a",
  gold:"#c8a55a",lightGold:"#e2cc8a",cream:"#f5f0e4",
  warmWhite:"#faf7f0",rust:"#b54a32",sea:"#2a8a9a",sand:"#d4c9b0",
};

// ─── Cloudinary Helpers ───────────────────────────────────────────────────────
async function sha1(msg) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function sign(params) {
  const s = Object.keys(params).sort().map(k=>`${k}=${params[k]}`).join('&');
  return sha1(s + API_SECRET);
}
async function clApprove(pid) {
  const ts = Math.round(Date.now()/1000);
  const p = {public_id:pid,tags:'kmc_approved',timestamp:ts,type:'upload'};
  const sig = await sign(p);
  const fd = new FormData();
  Object.entries(p).forEach(([k,v])=>fd.append(k,v));
  fd.append('api_key',API_KEY); fd.append('signature',sig);
  return fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/explicit`,{method:'POST',body:fd});
}
async function clDelete(pid) {
  const ts = Math.round(Date.now()/1000);
  const p = {public_id:pid,timestamp:ts};
  const sig = await sign(p);
  const fd = new FormData();
  Object.entries(p).forEach(([k,v])=>fd.append(k,v));
  fd.append('api_key',API_KEY); fd.append('signature',sig);
  return fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`,{method:'POST',body:fd});
}
async function clList(tag) {
  try {
    const r = await fetch(`https://res.cloudinary.com/${CLOUD}/image/list/${tag}.json`);
    if (!r.ok) return [];
    const d = await r.json();
    return (d.resources||[]).map(img=>({
      pid: img.public_id,
      thumb:`https://res.cloudinary.com/${CLOUD}/image/upload/c_fill,h_380,w_560/q_auto/f_auto/${img.public_id}`,
      full:`https://res.cloudinary.com/${CLOUD}/image/upload/q_auto/f_auto/${img.public_id}`,
    }));
  } catch { return []; }
}

// ─── Scroll Animation ─────────────────────────────────────────────────────────
function useInView(t=0.1) {
  const ref=useRef(null);
  const [vis,setVis]=useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){setVis(true);obs.unobserve(el);}
    },{threshold:t});
    obs.observe(el); return()=>obs.disconnect();
  },[t]);
  return [ref,vis];
}
function FadeIn({children,delay=0,style={}}) {
  const [ref,vis]=useInView();
  return(
    <div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(28px)",
      transition:`opacity .7s ease ${delay}s,transform .7s ease ${delay}s`,...style}}>
      {children}
    </div>
  );
}

// ─── SVG Components ───────────────────────────────────────────────────────────
function KnotIcon({size=40,color=C.gold,strokeW=2.5}) {
  return(
    <svg width={size} height={size} viewBox="0 0 60 80" fill="none">
      <g stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 2 L30 18 C30 24,20 28,15 28 C9 28,5 24,5 18 C5 12,11 7,16 10 C21 13,26 18,24 24 C22 30,16 33,11 31"/>
        <path d="M30 18 L30 45 C30 52,36 57,43 57 C50 57,55 52,55 45 C55 38,48 33,42 35 C36 37,32 42,30 48"/>
        <path d="M30 48 L30 78"/>
      </g>
    </svg>
  );
}
function Waves({color=C.navy,flip=false}) {
  return(
    <div style={{lineHeight:0,transform:flip?"scaleY(-1)":"none",marginTop:flip?0:"-1px",marginBottom:flip?"-1px":0}}>
      <svg viewBox="0 0 1440 60" fill="none" style={{width:"100%",display:"block"}}>
        <path d="M0 30 C240 0,480 60,720 30 C960 0,1200 60,1440 30 L1440 60 L0 60 Z" fill={color}/>
      </svg>
    </div>
  );
}
function AnchorLogo({size=48}) {
  return(
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="10" r="5" stroke={C.gold} strokeWidth="2" fill="none"/>
      <line x1="24" y1="15" x2="24" y2="42" stroke={C.gold} strokeWidth="2"/>
      <path d="M10 34 L24 46 L38 34" stroke={C.gold} strokeWidth="2" fill="none"/>
      <line x1="16" y1="10" x2="32" y2="10" stroke={C.gold} strokeWidth="2"/>
    </svg>
  );
}
function StarSep() {
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"16px",margin:"16px 0"}}>
      <div style={{width:"60px",height:"1px",background:`${C.gold}40`}}/>
      <svg width="12" height="12" viewBox="0 0 12 12" fill={C.gold}><polygon points="6,0 7.5,4 12,4.5 8.5,7.5 9.5,12 6,9.5 2.5,12 3.5,7.5 0,4.5 4.5,4"/></svg>
      <div style={{width:"60px",height:"1px",background:`${C.gold}40`}}/>
    </div>
  );
}

// ─── PHOTO GALLERY (Cloudinary) ───────────────────────────────────────────────
function PhotoGallery() {
  const [photos,setPhotos]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showUp,setShowUp]=useState(false);
  const [uping,setUping]=useState(false);
  const [done,setDone]=useState(false);
  const [lb,setLb]=useState(null);
  const fileRef=useRef(null);
  useEffect(()=>{clList('kmc_approved').then(p=>{setPhotos(p);setLoading(false);});},[]);
  const upload=async(file)=>{
    if(!file) return; setUping(true);
    const fd=new FormData();
    fd.append('file',file); fd.append('upload_preset',UPLOAD_PRESET); fd.append('api_key',API_KEY);
    try{ await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,{method:'POST',body:fd}); setDone(true); }
    catch{ alert('Upload failed — please try again.'); }
    setUping(false);
  };
  return(
    <section id="gallery" style={{padding:"80px 24px",background:`linear-gradient(180deg,${C.warmWhite},${C.cream})`}}>
      <div style={{maxWidth:"1100px",margin:"0 auto"}}>
        <FadeIn>
          <div style={{textAlign:"center",marginBottom:"48px"}}>
            <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.rust,marginBottom:"10px",fontWeight:500}}>KNOTTY MEMORIES</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:800,color:C.navy,margin:"0 0 12px"}}>Photo Gallery</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#8b8378",maxWidth:"480px",margin:"0 auto 24px"}}>Real moments from real charters. Have photos from your trip? Share them with the KMC family.</p>
            <button onClick={()=>{setShowUp(true);setDone(false);}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:600,color:C.navy,background:C.gold,padding:"12px 28px",borderRadius:"8px",border:"none",cursor:"pointer"}}>
              📷 Share Your Photos
            </button>
          </div>
        </FadeIn>
        {loading?(<p style={{textAlign:"center",fontFamily:"'DM Sans',sans-serif",color:"#8b8378",padding:"60px 0"}}>Loading gallery...</p>)
        :photos.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",background:"#fff",borderRadius:"16px",border:`1px solid ${C.sand}40`}}>
            <p style={{fontSize:"40px",marginBottom:"12px"}}>📸</p>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",color:C.navy,margin:"0 0 8px",fontWeight:700}}>Gallery Coming Soon</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#8b8378"}}>Be the first to share your Knotty Marine memories!</p>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}>
            {photos.map((p,i)=>(
              <FadeIn key={i} delay={i*.04}>
                <div onClick={()=>setLb(p.full)} style={{borderRadius:"12px",overflow:"hidden",cursor:"pointer",border:`1px solid ${C.sand}30`,aspectRatio:"4/3"}}>
                  <img src={p.thumb} alt="Charter memory" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
      {showUp&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(6,18,34,.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
          <div style={{background:C.warmWhite,borderRadius:"20px",padding:"40px",maxWidth:"460px",width:"100%",position:"relative"}}>
            <button onClick={()=>setShowUp(false)} style={{position:"absolute",top:"16px",right:"16px",background:"transparent",border:"none",fontSize:"22px",cursor:"pointer",color:"#888"}}>✕</button>
            {!done?(
              <>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"26px",fontWeight:800,color:C.navy,margin:"0 0 8px"}}>Share Your Memory</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#666",margin:"0 0 24px",lineHeight:1.6}}>Upload your charter photo. Captain Brian reviews all submissions before they appear publicly.</p>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>upload(e.target.files[0])}/>
                <button onClick={()=>fileRef.current.click()} disabled={uping} style={{width:"100%",padding:"44px 24px",border:`2px dashed ${C.gold}60`,borderRadius:"12px",background:`${C.gold}08`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:C.navy,marginBottom:"14px"}}>
                  {uping?"⏳ Uploading...":"📷 Click to select a photo"}
                </button>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#999",textAlign:"center",margin:0}}>Photos are reviewed before appearing publicly.</p>
              </>
            ):(
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:"48px",marginBottom:"16px"}}>🎉</div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:800,color:C.navy,margin:"0 0 12px"}}>Photo Submitted!</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#666",margin:"0 0 24px",lineHeight:1.6}}>Thanks for sharing! Captain Brian will review it shortly.</p>
                <button onClick={()=>setShowUp(false)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:600,color:C.navy,background:C.gold,padding:"12px 28px",borderRadius:"8px",border:"none",cursor:"pointer"}}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
      {lb&&(<div onClick={()=>setLb(null)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.93)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"24px"}}><img src={lb} alt="" style={{maxWidth:"100%",maxHeight:"90vh",borderRadius:"8px",objectFit:"contain"}}/></div>)}
    </section>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({onClose}) {
  const [authed,setAuthed]=useState(false);
  const [pw,setPw]=useState('');
  const [err,setErr]=useState(false);
  const [pending,setPending]=useState([]);
  const [approved,setApproved]=useState([]);
  const [tab,setTab]=useState('pending');
  const [loading,setLoading]=useState(false);
  const [busy,setBusy]=useState({});
  const [msg,setMsg]=useState('');
  const login=()=>{ if(pw===ADMIN_PW){setAuthed(true);load();}else setErr(true); };
  const load=async()=>{
    setLoading(true);
    const [p,a]=await Promise.all([clList('kmc_pending'),clList('kmc_approved')]);
    setPending(p); setApproved(a); setLoading(false);
  };
  const approve=async(img)=>{
    setBusy(b=>({...b,[img.pid]:'a'}));
    await clApprove(img.pid);
    setMsg('✅ Approved and added to gallery!');
    setTimeout(()=>setMsg(''),3000);
    await load();
    setBusy(b=>{const n={...b};delete n[img.pid];return n;});
  };
  const remove=async(img)=>{
    if(!window.confirm('Permanently delete this photo?')) return;
    setBusy(b=>({...b,[img.pid]:'d'}));
    await clDelete(img.pid);
    setMsg('🗑 Photo removed.');
    setTimeout(()=>setMsg(''),3000);
    await load();
    setBusy(b=>{const n={...b};delete n[img.pid];return n;});
  };
  const list=tab==='pending'?pending:approved;
  return(
    <div style={{position:"fixed",inset:0,zIndex:900,background:"rgba(6,18,34,.97)",backdropFilter:"blur(12px)",overflowY:"auto"}}>
      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"40px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"32px"}}>
          <div>
            <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"11px",letterSpacing:"5px",color:C.gold,margin:"0 0 4px"}}>CAPTAIN'S DASHBOARD</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:800,color:C.cream,margin:0}}>Gallery Admin</h2>
          </div>
          <button onClick={onClose} style={{background:`${C.cream}10`,border:`1px solid ${C.cream}20`,color:C.cream,width:"40px",height:"40px",borderRadius:"50%",cursor:"pointer",fontSize:"18px"}}>✕</button>
        </div>
        {!authed?(
          <div style={{maxWidth:"340px",margin:"80px auto 0",background:`${C.cream}06`,borderRadius:"16px",padding:"36px",border:`1px solid ${C.gold}20`}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",color:C.cream,margin:"0 0 20px",textAlign:"center"}}>Admin Login</h3>
            <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Password"
              style={{width:"100%",padding:"12px 16px",borderRadius:"8px",border:`1.5px solid ${err?C.rust:C.gold+'40'}`,background:`${C.cream}10`,color:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:"15px",marginBottom:"8px",boxSizing:"border-box"}}/>
            {err&&<p style={{color:C.rust,fontFamily:"'DM Sans',sans-serif",fontSize:"13px",margin:"0 0 8px"}}>Incorrect password</p>}
            <button onClick={login} style={{width:"100%",padding:"12px",background:C.gold,color:C.navy,border:"none",borderRadius:"8px",fontFamily:"'DM Sans',sans-serif",fontSize:"15px",fontWeight:700,cursor:"pointer"}}>Log In</button>
          </div>
        ):(
          <>
            {msg&&<div style={{background:`${C.gold}20`,border:`1px solid ${C.gold}40`,borderRadius:"8px",padding:"10px 16px",marginBottom:"20px",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:C.gold}}>{msg}</div>}
            <div style={{display:"flex",gap:"12px",marginBottom:"28px"}}>
              {['pending','approved'].map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:600,padding:"10px 24px",borderRadius:"8px",border:"none",cursor:"pointer",background:tab===t?C.gold:`${C.cream}10`,color:tab===t?C.navy:C.sand}}>
                  {t==='pending'?`⏳ Pending (${pending.length})`:`✅ Approved (${approved.length})`}
                </button>
              ))}
              <button onClick={load} style={{marginLeft:"auto",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",padding:"10px 18px",borderRadius:"8px",border:`1px solid ${C.gold}30`,background:"transparent",color:C.sand,cursor:"pointer"}}>🔄 Refresh</button>
            </div>
            {loading?(<p style={{fontFamily:"'DM Sans',sans-serif",color:C.sand,textAlign:"center",padding:"40px 0"}}>Loading...</p>)
            :list.length===0?(
              <div style={{textAlign:"center",padding:"60px 0"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",color:C.sand,opacity:.6}}>
                  {tab==='pending'?'No photos waiting for review.':'No approved photos yet.'}
                </p>
                {tab==='pending'&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:C.sand,opacity:.35,marginTop:"10px"}}>Make sure the "kmc_guest" upload preset is created in Cloudinary with tags: kmc_pending</p>}
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:"18px"}}>
                {list.map((img,i)=>(
                  <div key={i} style={{background:`${C.cream}06`,borderRadius:"12px",overflow:"hidden",border:`1px solid ${C.gold}15`}}>
                    <img src={img.thumb} alt="" style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",display:"block"}}/>
                    <div style={{padding:"12px 14px",display:"flex",gap:"8px"}}>
                      {tab==='pending'?(
                        <>
                          <button onClick={()=>approve(img)} disabled={!!busy[img.pid]} style={{flex:1,padding:"9px",background:"#2e7d32",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:600,opacity:busy[img.pid]?.6:1}}>
                            {busy[img.pid]==='a'?'...':'✅ Approve'}
                          </button>
                          <button onClick={()=>remove(img)} disabled={!!busy[img.pid]} style={{flex:1,padding:"9px",background:`${C.rust}cc`,color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:600,opacity:busy[img.pid]?.6:1}}>
                            {busy[img.pid]==='d'?'...':'🗑 Reject'}
                          </button>
                        </>
                      ):(
                        <button onClick={()=>remove(img)} disabled={!!busy[img.pid]} style={{flex:1,padding:"9px",background:`${C.rust}cc`,color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:600}}>
                          {busy[img.pid]?'...':'🗑 Remove from gallery'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── CHARTER FINDER QUIZ ──────────────────────────────────────────────────────
function CharterFinder() {
  const [step,setStep]=useState(0);
  const [ans,setAns]=useState({});
  const [result,setResult]=useState(null);
  const qs=[
    {id:"g",q:"How many people in your group?",opts:["Just 2 of us","3–6 people","7–10 people"]},
    {id:"t",q:"How much time do you have?",opts:["2–3 hours","4 hours (half day)","7–8 hours (full day)"]},
    {id:"v",q:"What's the occasion?",opts:["Relaxing / Sightseeing","Snorkel & Beach Adventure","Party or Celebration","Cruise Ship — in port today"]},
  ];
  const getResult=a=>{
    if(a.v==="Cruise Ship — in port today") return{title:"Cruise Ship Express",price:"From $1,300",icon:"🚢",desc:"Havensight pickup, 4 hours, Lime Out taco bar, back before your ship leaves."};
    if(a.v==="Party or Celebration") return{title:"Bachelorette / Bachelor Party",price:"From $1,300",icon:"🎉",desc:"7–8 hours of beach bars, snorkeling, and great music on the water."};
    if(a.t==="2–3 hours") return{title:"Sunset Cruise",price:"From $450",icon:"🌅",desc:"Watch the Caribbean sun melt into the horizon aboard Luna's Wake."};
    if(a.t==="4 hours (half day)") return{title:"Half-Day Adventure",price:"From $700",icon:"☀️",desc:"Sea turtles, hidden coves, and the best snorkeling in St. Thomas — all in 4 hours."};
    return{title:"Full-Day Expedition",price:"From $1,300",icon:"🏝️",desc:"Island hop, snorkel world-class reefs, and stop for lunch — the ultimate USVI day."};
  };
  const pick=val=>{
    const na={...ans,[qs[step].id]:val}; setAns(na);
    if(step<qs.length-1) setStep(step+1); else setResult(getResult(na));
  };
  return(
    <div style={{background:`linear-gradient(135deg,${C.navy},${C.midNavy})`,borderRadius:"20px",padding:"36px 32px",border:`1px solid ${C.gold}25`,maxWidth:"580px",margin:"0 auto 40px"}}>
      <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"11px",letterSpacing:"5px",color:C.gold,marginBottom:"8px"}}>NOT SURE WHERE TO START?</p>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:800,color:C.cream,margin:"0 0 24px"}}>Find Your Perfect Charter</h3>
      {!result?(
        <>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:C.sand,marginBottom:"16px"}}>
            <span style={{opacity:.6}}>Question {step+1} of {qs.length}: </span>
            <strong style={{color:C.cream}}>{qs[step].q}</strong>
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {qs[step].opts.map(o=>(
              <button key={o} onClick={()=>pick(o)} style={{background:`${C.cream}06`,border:`1.5px solid ${C.gold}30`,color:C.cream,padding:"13px 18px",borderRadius:"10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"15px",textAlign:"left"}}>{o}</button>
            ))}
          </div>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{marginTop:"14px",background:"transparent",border:"none",color:`${C.sand}70`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"13px"}}>← Back</button>}
        </>
      ):(
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"44px",marginBottom:"12px"}}>{result.icon}</div>
          <h4 style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:700,color:C.cream,margin:"0 0 4px"}}>{result.title}</h4>
          <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"20px",color:C.gold,margin:"0 0 12px",fontWeight:600}}>{result.price}</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:C.sand,lineHeight:1.7,margin:"0 0 20px"}}>{result.desc}</p>
          <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
            <a href="#book-now" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:600,color:C.navy,background:C.gold,padding:"11px 24px",borderRadius:"8px",textDecoration:"none"}}>Book This Charter</a>
            <button onClick={()=>{setStep(0);setAns({});setResult(null);}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:C.sand,background:"transparent",border:`1px solid ${C.sand}30`,padding:"11px 24px",borderRadius:"8px",cursor:"pointer"}}>Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({scrolled}) {
  const links=["Charters","Destinations","Gallery","About","The Boat","Veterans","Book Now"];
  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:scrolled?"10px 32px":"18px 32px",background:scrolled?`${C.deepNavy}f0`:"transparent",backdropFilter:scrolled?"blur(16px)":"none",borderBottom:scrolled?`1px solid ${C.gold}20`:"1px solid transparent",transition:"all .4s ease",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        <AnchorLogo size={scrolled?28:34}/>
        <div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:scrolled?"16px":"19px",fontWeight:700,color:C.cream,letterSpacing:"-.02em",transition:"font-size .4s ease"}}>Knotty Marine</span>
          <span style={{fontFamily:"'Oswald',sans-serif",fontSize:"9px",letterSpacing:"4px",color:C.gold,display:"block",marginTop:"-2px",fontWeight:300}}>CHARTERS</span>
        </div>
      </div>
      <div style={{display:"flex",gap:"24px",alignItems:"center"}}>
        {links.map(l=>(
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:500,color:l==="Book Now"?C.navy:C.sand,textDecoration:"none",letterSpacing:".5px",padding:l==="Book Now"?"8px 20px":"0",background:l==="Book Now"?C.gold:"transparent",borderRadius:l==="Book Now"?"6px":"0"}}>{l}</a>
        ))}
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return(
    <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse at 30% 20%,${C.midNavy}80 0%,transparent 50%),linear-gradient(175deg,${C.deepNavy} 0%,${C.navy} 45%,${C.midNavy} 100%)`,position:"relative",overflow:"hidden",textAlign:"center",padding:"120px 24px 80px"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"4px",background:`repeating-linear-gradient(90deg,${C.gold} 0px,${C.gold} 14px,transparent 14px,transparent 22px)`,opacity:.4}}/>
      <div style={{position:"relative",zIndex:1,maxWidth:"820px"}}>
        <FadeIn><div style={{marginBottom:"20px"}}><KnotIcon size={48}/></div></FadeIn>
        <FadeIn delay={.15}><p style={{fontFamily:"'Oswald',sans-serif",fontSize:"20px",letterSpacing:"8px",color:C.gold,marginBottom:"12px",fontWeight:400}}>U.S. VIRGIN ISLANDS</p></FadeIn>
        <FadeIn delay={.3}><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(48px,9vw,96px)",fontWeight:800,color:C.cream,margin:"0 0 6px",letterSpacing:"-.04em",lineHeight:.95}}>Knotty Marine</h1></FadeIn>
        <FadeIn delay={.42}><p style={{fontFamily:"'Oswald',sans-serif",fontSize:"clamp(16px,3vw,22px)",letterSpacing:"10px",color:C.gold,margin:"0 0 14px",fontWeight:300}}>CHARTERS</p></FadeIn>
        <FadeIn delay={.5}><p style={{fontFamily:"'Oswald',sans-serif",fontSize:"15px",letterSpacing:"4px",color:`${C.sand}bb`,margin:"0 0 10px",fontWeight:400}}>PRIVATE · PERSONAL · VETERAN-OWNED</p></FadeIn>
        <FadeIn delay={.58}><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(14px,2vw,18px)",color:C.sand,margin:"0 0 10px",opacity:.85,lineHeight:1.5}}>Private Boat Charters · St. Thomas &amp; St. John · Up to 10 Guests · No Passport Required</p></FadeIn>
        <FadeIn delay={.66}><p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"clamp(16px,2.5vw,21px)",color:C.sand,margin:"0 0 34px",opacity:.7}}>"Sun, Fun, Saltwater Memories"</p></FadeIn>
        <FadeIn delay={.74}>
          <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
            <a href="#book-now" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",fontWeight:700,color:C.navy,background:C.gold,padding:"14px 32px",borderRadius:"8px",textDecoration:"none",boxShadow:`0 4px 24px ${C.gold}35`}}>📅 Book Your Charter</a>
            <a href="tel:+15712327040" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",fontWeight:500,color:C.cream,background:"transparent",padding:"14px 28px",borderRadius:"8px",textDecoration:"none",border:`1.5px solid ${C.cream}30`}}>📞 Call / Text</a>
            <a href="#charters" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",fontWeight:500,color:C.sand,background:"transparent",padding:"14px 28px",borderRadius:"8px",textDecoration:"none",border:`1.5px solid ${C.sand}20`}}>View Charters</a>
          </div>
        </FadeIn>
        <FadeIn delay={.9}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"12px",padding:"13px 28px",borderRadius:"30px",marginTop:"44px",border:`1px solid ${C.gold}20`,background:`${C.gold}06`}}>
            <span style={{fontSize:"15px",color:C.rust,letterSpacing:"2px",fontWeight:700,fontFamily:"'Oswald',sans-serif"}}>★ SERVICE DISABLED VETERAN OWNED</span>
            <span style={{color:C.gold,fontSize:"8px"}}>◆</span>
            <span style={{fontSize:"15px",color:C.sand,letterSpacing:"2px",fontWeight:500,fontFamily:"'Oswald',sans-serif"}}>USMC RETIRED · 26 YEARS</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── INCLUDED STRIP ───────────────────────────────────────────────────────────
function IncludedStrip() {
  const items=[{icon:"⚓",label:"Captain Included"},{icon:"🤿",label:"Snorkel Gear"},{icon:"💧",label:"Water & Ice"},{icon:"🎵",label:"Bluetooth Sound"},{icon:"🔒",label:"Private Group Only"},{icon:"☀️",label:"Up to 10 Guests"}];
  return(
    <div style={{background:C.cream,padding:"22px 24px",borderBottom:`1px solid ${C.sand}40`}}>
      <div style={{maxWidth:"900px",margin:"0 auto"}}>
        <p style={{textAlign:"center",fontFamily:"'Oswald',sans-serif",fontSize:"11px",letterSpacing:"4px",color:"#8b8378",marginBottom:"14px"}}>EVERY CHARTER INCLUDES</p>
        <div style={{display:"flex",justifyContent:"center",gap:"10px",flexWrap:"wrap"}}>
          {items.map((it,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 14px",background:"#fff",borderRadius:"30px",border:`1px solid ${C.sand}40`,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
              <span style={{fontSize:"17px"}}>{it.icon}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:500,color:C.navy,whiteSpace:"nowrap"}}>{it.label}</span>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:C.rust,marginTop:"13px",fontWeight:600}}>⚠ Price does not include Fuel or Gratuity — <a href="#faq" style={{color:C.rust}}>see FAQ for estimates</a></p>
      </div>
    </div>
  );
}

// ─── RATES STRIP ─────────────────────────────────────────────────────────────
function RatesStrip() {
  const rates=[{title:"Half-Day",hours:"4 Hours",price:"$700",icon:"☀️",href:"#charters"},{title:"Full Day",hours:"7–8 Hours",price:"$1,300",icon:"🏝️",href:"#charters",pop:true},{title:"Sunset",hours:"2.5 Hours",price:"$450",icon:"🌅",href:"#charters"}];
  return(
    <div style={{background:C.warmWhite,padding:"40px 24px",borderBottom:`1px solid ${C.sand}30`}}>
      <div style={{maxWidth:"780px",margin:"0 auto"}}>
        <p style={{textAlign:"center",fontFamily:"'Oswald',sans-serif",fontSize:"11px",letterSpacing:"4px",color:"#8b8378",marginBottom:"20px"}}>STARTING RATES</p>
        <div style={{display:"flex",gap:"16px",justifyContent:"center",flexWrap:"wrap"}}>
          {rates.map((r,i)=>(
            <a key={i} href={r.href} style={{textDecoration:"none",flex:"1 1 170px",maxWidth:"210px",background:r.pop?`linear-gradient(135deg,${C.navy},${C.midNavy})`:"#fff",borderRadius:"14px",padding:"22px 18px",textAlign:"center",border:r.pop?`2px solid ${C.gold}`:`1px solid ${C.sand}40`,boxShadow:r.pop?`0 8px 28px ${C.gold}18`:"0 3px 12px rgba(0,0,0,.05)",position:"relative"}}>
              {r.pop&&<div style={{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",background:C.gold,color:C.navy,fontFamily:"'Oswald',sans-serif",fontSize:"9px",letterSpacing:"2px",fontWeight:700,padding:"3px 12px",borderRadius:"20px"}}>MOST POPULAR</div>}
              <span style={{fontSize:"26px",display:"block",marginBottom:"8px"}}>{r.icon}</span>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,color:r.pop?C.cream:C.navy,margin:"0 0 2px"}}>{r.title}</p>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"11px",letterSpacing:"2px",color:r.pop?C.gold:"#8b8378",margin:"0 0 8px"}}>{r.hours}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"21px",fontWeight:800,color:r.pop?C.gold:C.navy,margin:0}}>{r.price}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",color:r.pop?`${C.sand}70`:"#bbb",margin:"3px 0 0"}}>from</p>
            </a>
          ))}
        </div>
        <p style={{textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#8b8378",marginTop:"16px"}}>Military, Veterans &amp; USVI Locals: <strong style={{color:C.navy}}>10% off</strong> — use code <strong style={{color:C.navy}}>USMC10</strong></p>
      </div>
    </div>
  );
}

// ─── WHY KNOTTY ───────────────────────────────────────────────────────────────
function WhyKnotty() {
  const pillars=[
    {icon:"🎖️",title:"Service-Disabled USMC Veteran",desc:"Owner-led, owner-operated. Captain Brian brings 26 years of Marine Corps discipline and care to every charter."},
    {icon:"🚤",title:"2025 Boat of the Year",desc:"Luna's Wake is a 2025 Monterey 30 Elite — award-winning, 54+ MPH, 600 HP. The most impressive powerboat in the USVI charter fleet."},
    {icon:"🔒",title:"100% Private Charter",desc:"Your group. Your schedule. No strangers, no crowds. Every charter is completely private — just you and Captain Brian."},
    {icon:"⭐",title:"Military & Locals Discount",desc:"Active duty, veterans, and USVI locals always receive 10% off. Use code USMC10. This community is family."},
  ];
  return(
    <section style={{padding:"72px 24px",background:`linear-gradient(180deg,${C.warmWhite},${C.cream})`}}>
      <div style={{maxWidth:"1000px",margin:"0 auto"}}>
        <FadeIn>
          <div style={{textAlign:"center",marginBottom:"48px"}}>
            <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.rust,marginBottom:"10px",fontWeight:500}}>WHY CHOOSE KNOTTY MARINE</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,40px)",fontWeight:800,color:C.navy,margin:0,letterSpacing:"-.03em"}}>More Personal Than a Tour.<br/>More Memorable Than a Boat Ride.</h2>
          </div>
        </FadeIn>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"20px"}}>
          {pillars.map((p,i)=>(
            <FadeIn key={i} delay={i*.1}>
              <div style={{background:"#fff",borderRadius:"16px",padding:"28px 24px",border:`1px solid ${C.sand}40`,boxShadow:"0 4px 16px rgba(0,0,0,.04)",height:"100%"}}>
                <span style={{fontSize:"30px",display:"block",marginBottom:"14px"}}>{p.icon}</span>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700,color:C.navy,margin:"0 0 8px"}}>{p.title}</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#6b655e",lineHeight:1.7,margin:0}}>{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CHARTER DATA & CARD ──────────────────────────────────────────────────────
const charters=[
  {title:"Half-Day Adventure",hours:"4 Hours",price:"From $700",bestFor:"Families · First-timers · Couples",desc:"Swim with sea turtles at Buck Island, beach hop to Water Island, or explore hidden coves around St. Thomas.",features:["Snorkel gear provided","Cooler with water & ice","Bluetooth sound system","Up to 10 guests","No passport required"],icon:"☀️",popular:false},
  {title:"Full-Day Expedition",hours:"7–8 Hours",price:"From $1,300",bestFor:"Families · Groups · Adventure seekers",desc:"Circle St. John's north shore, snorkel world-class reefs, and anchor for a lunch stop — Cruz Bay, Lime Out, or Pizza Pi Vi.",features:["Everything in Half-Day","Cooler with water & ice","Lunch stop included*","Multi-island route","Up to 10 guests"],icon:"🏝️",popular:true,lunchNote:true},
  {title:"Sunset Cruise",hours:"2.5 Hours",price:"From $450",bestFor:"Couples · Anniversaries · Proposals",desc:"Watch the Caribbean sun melt into the horizon aboard Luna's Wake. Perfect for proposals, anniversaries, and celebrations.",features:["Cooler with ice & water","Prime sunset route","Bluetooth sound system","Up to 10 guests"],icon:"🌅",popular:false},
  {title:"Bachelorette / Bachelor Party",hours:"7–8 Hours",price:"From $1,300",bestFor:"Bachelorette / Bachelor parties",desc:"Beach bar crawl, snorkeling, music on the Fusion sound system, and epic photo ops throughout the USVI.",features:["Party-ready sound system","Cooler with water & ice","Beach bar & snorkel stops","Decorations welcome (bring your own)","Up to 10 guests"],icon:"🎉",popular:false},
  {title:"Cruise Ship Express",hours:"4 Hours",price:"From $1,300",bestFor:"Cruise ship passengers",desc:"Havensight pickup, best snorkeling and beaches, and a stop at Lime Out floating taco bar — back before your ship leaves.",features:["Havensight pickup & dropoff","Snorkel & beach stop","Lime Out floating taco bar","Cooler with water & ice","Up to 10 guests","Back before your ship leaves"],icon:"🚢",popular:false},
  {title:"Circle St. John Foodie Tour",hours:"7–8 Hours",price:"From $1,500",bestFor:"Foodies · Explorers",desc:"Choose your lunch: Lovango Beach Club, Cruz Bay, Pizza Pi Vi, or Lime Out. Plus Trunk Bay and Maho Bay snorkeling.",features:["Your choice of lunch spot","Trunk Bay snorkeling","Full circumnavigation of St. John","Cooler with water & ice","Up to 10 guests"],icon:"🍕",popular:false,lunchNote:true},
  {title:"Circumnavigate St. John & St. Thomas",hours:"7–8 Hours",price:"From $1,300",bestFor:"Photographers · Island explorers",desc:"Circle the dramatic coastlines of St. John and/or St. Thomas — hidden coves, cliffs, and landmarks only reachable by water.",features:["Full island circumnavigation","Snorkel stops at top spots","Scenic coastal exploration","Cooler with water & ice","Up to 10 guests"],icon:"🗺️",popular:false},
  {title:"Build Your Own Charter",hours:"Full Day",price:"From $1,300",bestFor:"Repeat visitors · Custom occasions",desc:"You pick it, we run it. Choose your destinations, snorkel spots, lunch stop, and pace. Captain Brian charts the perfect course.",features:["Custom route — you decide","Choose your lunch spot","Snorkel where you want","Cooler with water & ice","Up to 10 guests"],icon:"🧭",popular:false},
];
const studentTrip={title:"USVI Student Discovery Trip",price:"$125 per student",hours:"3–4 Hours",desc:"Captain Brian brings 26 years of Marine Corps discipline to inspire the next generation. Educational snorkeling, marine life, island geography, and ocean safety.",requirements:["Must be a USVI school or youth organization","Minimum 6 students, up to 10","Snacks, water & ice included","Advance booking required"]};
const shuttle={title:"Private Shuttle — St. John",desc:"Need a ride to or from St. John? Skip the ferry lines and travel in style aboard Luna's Wake.",note:"Contact us for shuttle pricing and availability."};

function CharterCard({charter,index}) {
  return(
    <FadeIn delay={index*.08} style={{flex:"1 1 280px",maxWidth:"360px"}}>
      <div style={{background:"#fff",borderRadius:"16px",overflow:"hidden",border:charter.popular?`2px solid ${C.gold}`:`1px solid ${C.sand}50`,boxShadow:charter.popular?`0 12px 40px ${C.gold}15`:"0 4px 20px rgba(0,0,0,.04)",position:"relative",height:"100%",display:"flex",flexDirection:"column"}}>
        {charter.popular&&<div style={{position:"absolute",top:"16px",right:"16px",background:C.gold,color:C.navy,padding:"4px 12px",borderRadius:"20px",fontFamily:"'Oswald',sans-serif",fontSize:"10px",letterSpacing:"2px",fontWeight:600}}>MOST POPULAR</div>}
        <div style={{padding:"28px 26px 16px",background:charter.popular?`linear-gradient(135deg,${C.navy},${C.midNavy})`:`linear-gradient(135deg,${C.cream}80,${C.warmWhite})`}}>
          <span style={{fontSize:"34px",display:"block",marginBottom:"10px"}}>{charter.icon}</span>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:700,color:charter.popular?C.cream:C.navy,margin:"0 0 4px"}}>{charter.title}</h3>
          <div style={{display:"flex",gap:"10px",alignItems:"baseline",marginBottom:"4px"}}>
            <span style={{fontFamily:"'Oswald',sans-serif",fontSize:"11px",letterSpacing:"3px",color:charter.popular?C.gold:C.rust,fontWeight:500}}>{charter.hours}</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"19px",fontWeight:700,color:charter.popular?C.gold:C.navy}}>{charter.price}</span>
          </div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:charter.popular?`${C.sand}80`:"#999",margin:0}}>Best for: {charter.bestFor}</p>
        </div>
        <div style={{padding:"16px 26px 26px",flex:1,display:"flex",flexDirection:"column"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",lineHeight:1.7,color:"#6b655e",margin:"0 0 14px"}}>{charter.desc}</p>
          {charter.lunchNote&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#8b8378",margin:"-6px 0 12px",fontStyle:"italic",lineHeight:1.5}}>* Lunch options: Cruz Bay · Lime Out · Pizza Pi Vi<br/>Cost of lunch not included.</p>}
          <div style={{marginTop:"auto"}}>
            {charter.features.map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"9px",padding:"5px 0",borderTop:i===0?`1px solid ${C.sand}30`:"none"}}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={C.sea} strokeWidth="1.5"/><path d="M4 7 L6 9 L10 5" stroke={C.sea} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#5a554e"}}>{f}</span>
              </div>
            ))}
          </div>
          <a href="#book-now" style={{display:"block",textAlign:"center",marginTop:"16px",padding:"11px",borderRadius:"8px",background:charter.popular?C.gold:"transparent",color:C.navy,border:charter.popular?"none":`1.5px solid ${C.navy}25`,fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:600,textDecoration:"none"}}>Book This Charter</a>
        </div>
      </div>
    </FadeIn>
  );
}

const testimonials=[
  {name:"Jake & Michelle R.",loc:"Austin, TX",text:"Best day of our entire trip. Captain Brian knew every hidden cove and had the music cranked. Absolutely coming back."},
  {name:"SSgt Davis (Ret.)",loc:"Camp Lejeune, NC",text:"It's not every day you find a fellow Marine running a charter in paradise. The vet discount was a nice touch but the experience was worth full price and then some. Semper Fi."},
  {name:"The Henderson Family",loc:"Chicago, IL",text:"We did the full-day with our two teenagers and it was the first time in years nobody looked at their phone. Luna's Wake is a beautiful boat and Brian is the real deal."},
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function KnottyMarineSite() {
  const [scrolled,setScrolled]=useState(false);
  const [adminOpen,setAdminOpen]=useState(false);
  const [faqOpen,setFaqOpen]=useState(null);
  useEffect(()=>{ const h=()=>setScrolled(window.scrollY>60); window.addEventListener("scroll",h); return()=>window.removeEventListener("scroll",h); },[]);
  useEffect(()=>{ if(window.location.hash==='#admin') setAdminOpen(true); },[]);

  const faqItems=[
    {q:"What's included in the charter price?",a:"Captain, snorkel gear, cooler with water and ice, and Bluetooth sound system. Every charter is 100% private — just your group and Captain Brian."},
    {q:"How does fuel work?",a:"Fuel is paid at the end of your trip based on current market price and distance. Estimated ranges: Half-Day $80–$120 · Full Day to St. John $120–$180 · Foodie Tour/Circumnavigate $150–$220."},
    {q:"Is gratuity included?",a:"Gratuity is not included but appreciated. The customary rate is 15–20%. It's never required but goes directly to your captain."},
    {q:"What if the weather is bad?",a:"Safety is always first. If conditions are unsafe, we reschedule at no charge. We monitor weather closely and communicate at least 24 hours in advance."},
    {q:"What is your cancellation policy?",a:"Cancellations 72+ hours before your charter receive a full refund. Within 72 hours, we'll work with you to reschedule. No-shows are charged in full."},
    {q:"Do I need a passport?",a:"No passport required for any USVI charter — all destinations are within U.S. territory. Passports are only required for BVI trips."},
    {q:"How do I get the military or locals discount?",a:"Use code USMC10 at booking, or mention it when you call or email. Show valid military ID or USVI ID at the start of your charter."},
    {q:"Where do we meet?",a:"We offer pickup from Red Hook, Havensight (cruise ship dock), and St. John Cruz Bay. Your exact meeting point is confirmed at booking."},
    {q:"Can I bring my own food and drinks?",a:"Yes — we have cooler space available. We also stop at amazing waterfront spots like Pizza Pi and Lime Out. No glass bottles please."},
    {q:"Is this good for kids and families?",a:"Yes! Captain Brian is a proud grandfather. We carry life jackets in all sizes and the pace is adjusted for any group."},
    {q:"How far in advance should I book?",a:"As early as possible — especially December through April. We often fill up 2–4 weeks in advance. Large groups: book 4–6 weeks out."},
    {q:"Do you accommodate special occasions?",a:"Absolutely — proposals, birthdays, anniversaries, bachelorette and bachelor parties. Let us know at booking and we'll help make it special."},
  ];

  return(
    <div style={{minHeight:"100vh",background:C.warmWhite,fontFamily:"'DM Sans',sans-serif",overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Oswald:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <Nav scrolled={scrolled}/>
      <Hero/>

      {/* Social Proof */}
      <div style={{background:C.cream,padding:"20px 24px",display:"flex",justifyContent:"center",gap:"48px",flexWrap:"wrap",borderBottom:`1px solid ${C.sand}40`}}>
        {[{num:"2024",label:"Boat of the Year"},{num:"600 HP",label:"Twin Mercury Power"},{num:"26",label:"Years USMC Service"},{num:"30'",label:"Monterey Elite OB"}].map((s,i)=>(
          <FadeIn key={i} delay={i*.1}>
            <div style={{textAlign:"center"}}>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:800,color:C.navy,display:"block"}}>{s.num}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#8b8378",letterSpacing:"1px"}}>{s.label}</span>
            </div>
          </FadeIn>
        ))}
      </div>

      <IncludedStrip/>
      <RatesStrip/>
      <WhyKnotty/>

      {/* Charters */}
      <section id="charters" style={{padding:"80px 24px",background:`linear-gradient(180deg,${C.cream},${C.warmWhite})`}}>
        <div style={{maxWidth:"1200px",margin:"0 auto"}}>
          <FadeIn>
            <div style={{textAlign:"center",marginBottom:"40px"}}>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.rust,marginBottom:"10px",fontWeight:500}}>CHOOSE YOUR ADVENTURE</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,5vw,48px)",fontWeight:800,color:C.navy,margin:"0 0 10px",letterSpacing:"-.03em"}}>Charter Experiences</h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",color:"#8b8378",maxWidth:"550px",margin:"0 auto 10px",lineHeight:1.6}}>Private, customizable charters for couples, families, and groups. You pick the adventure — we handle the rest.</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:C.rust,fontWeight:700}}>⚠ Price does not include Fuel or Gratuity</p>
            </div>
          </FadeIn>
          <CharterFinder/>
          <div style={{display:"flex",gap:"24px",justifyContent:"center",flexWrap:"wrap",alignItems:"stretch"}}>
            {charters.map((c,i)=><CharterCard key={i} charter={c} index={i}/>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",marginTop:"40px",maxWidth:"800px",marginLeft:"auto",marginRight:"auto"}}>
            <FadeIn>
              <div style={{background:`linear-gradient(135deg,${C.navy},${C.midNavy})`,borderRadius:"16px",padding:"28px",border:`2px solid ${C.sea}40`}}>
                <span style={{fontSize:"28px",display:"block",marginBottom:"12px"}}>🎓</span>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:C.cream,margin:"0 0 4px"}}>{studentTrip.title}</h3>
                <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"18px",color:C.gold,margin:"0 0 12px",fontWeight:600}}>{studentTrip.price}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:C.sand,lineHeight:1.7,margin:"0 0 16px"}}>{studentTrip.desc}</p>
                {studentTrip.requirements.map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                    <span style={{color:C.sea,fontSize:"10px"}}>●</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:C.sand}}>{r}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={.15}>
              <div style={{background:`linear-gradient(135deg,${C.navy},${C.midNavy})`,borderRadius:"16px",padding:"28px",border:`2px solid ${C.gold}30`}}>
                <span style={{fontSize:"28px",display:"block",marginBottom:"12px"}}>⛴️</span>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:C.cream,margin:"0 0 4px"}}>{shuttle.title}</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:C.sand,lineHeight:1.7,margin:"12px 0 16px"}}>{shuttle.desc}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:C.gold,fontWeight:600}}>{shuttle.note}</p>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={.3}>
            <div style={{textAlign:"center",marginTop:"32px",padding:"22px",background:"#fff",borderRadius:"12px",border:`1px solid ${C.sand}40`}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#8b8378",margin:"0 0 6px"}}>All charters include snorkel gear, water, ice, and Bluetooth speakers. No passport required for USVI trips.</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:C.rust,margin:"0 0 4px",fontWeight:700}}>⚠ Price does not include Fuel or Gratuity — <a href="#faq" style={{color:C.rust}}>see FAQ</a></p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:C.navy,margin:0,fontWeight:600}}>Military, veterans &amp; locals: 10% off — use code <strong>USMC10</strong></p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" style={{padding:"80px 24px",background:`linear-gradient(175deg,${C.deepNavy},${C.navy} 50%,${C.midNavy})`}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <FadeIn>
            <div style={{textAlign:"center",marginBottom:"48px"}}>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.gold,marginBottom:"10px",fontWeight:500}}>WHERE WE TAKE YOU</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:800,color:C.cream,margin:"0 0 8px",letterSpacing:"-.03em"}}>Popular Destinations</h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:C.sand,maxWidth:"500px",margin:"0 auto",opacity:.8}}>No passport required — all within the U.S. Virgin Islands</p>
            </div>
          </FadeIn>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"14px"}}>
            {[
              {name:"Buck Island",desc:"Swim with green sea turtles and snorkel a sunken Navy barge in crystal-clear water.",icon:"🐢"},
              {name:"Water Island / Honeymoon Beach",desc:"The 'fourth Virgin Island' — white sand beaches minutes from St. Thomas.",icon:"🏖️"},
              {name:"St. John North Shore",desc:"Trunk Bay, Cinnamon Bay, Maho Bay — among the most beautiful beaches on earth.",icon:"🌴"},
              {name:"Pizza Pi Vi",desc:"The famous floating pizza boat in Christmas Cove. Pull up and order from the water.",icon:"🍕",link:"https://pizza-pi.com/"},
              {name:"Lime Out",desc:"A floating taco bar in Coral Harbor. Craft tacos, cold drinks, Instagram-worthy views.",icon:"🌮",link:"https://limeoutvi.com/"},
              {name:"Lovango Beach Club",desc:"An upscale private island beach club exclusively accessible by water.",icon:"🍹",link:"https://www.lovangovi.com/"},
              {name:"Megan's Bay",desc:"One of the most beautiful beaches in the world — white sand, calm water, mountain backdrop.",icon:"🌊"},
              {name:"Brewer's Bay",desc:"Quiet, locals-favorite beach with great snorkeling and off-the-beaten-path vibes.",icon:"🏄"},
              {name:"Christmas Cove",desc:"Protected anchorage with great snorkeling and easy access to Pizza Pi.",icon:"⚓"},
              {name:"Private Island Beach Excursion",desc:"Secluded beaches accessible only by boat — your own stretch of paradise.",icon:"🌅"},
              {name:"Sunset Cruise",desc:"Watch the Caribbean sun melt into the horizon. Unforgettable every time.",icon:"🌇"},
              {name:"Island Hopping",desc:"Multiple islands in one day — St. Thomas, St. John, Water Island, and beyond.",icon:"🗺️"},
              {name:"Bachelorette / Bachelor Party",desc:"Beach bars, snorkeling, great music, and the most scenic backdrop in the Caribbean.",icon:"🎉"},
              {name:"Day Drinking on a Boat",desc:"Good music, cold water, warm sun, great company. No agenda required.",icon:"🍺"},
              {name:"Family Experience",desc:"Captain Brian is a proud grandfather. Kid-friendly routes and life jackets for all sizes.",icon:"👨‍👩‍👧‍👦"},
              {name:"Daddy Daughter Day on the Boat",desc:"Make memories she'll talk about forever — a private charter just for the two of you.",icon:"💛"},
            ].map((d,i)=>(
              <FadeIn key={i} delay={i*.04}>
                <div style={{background:`${C.cream}06`,borderRadius:"12px",padding:"18px",border:`1px solid ${C.gold}12`,height:"100%"}}>
                  <span style={{fontSize:"22px",display:"block",marginBottom:"8px"}}>{d.icon}</span>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700,color:C.cream,margin:"0 0 5px"}}>
                    {d.link?<a href={d.link} target="_blank" rel="noopener noreferrer" style={{color:C.gold,textDecoration:"none"}}>{d.name} ↗</a>:d.name}
                  </h3>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:C.sand,lineHeight:1.6,margin:0,opacity:.8}}>{d.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <Waves color={C.navy} flip/>
      <section id="about" style={{padding:"80px 24px",background:`linear-gradient(175deg,${C.deepNavy},${C.navy} 50%,${C.midNavy})`,position:"relative",overflow:"hidden"}}>
        <div style={{maxWidth:"960px",margin:"0 auto",position:"relative",zIndex:1}}>
          <FadeIn>
            <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.gold,marginBottom:"10px",fontWeight:500,textAlign:"center"}}>THE CAPTAIN'S STORY</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,5vw,48px)",fontWeight:800,color:C.cream,margin:"0 0 8px",letterSpacing:"-.03em",textAlign:"center"}}>From Dress Blues to Ocean Blues</h2>
            <StarSep/>
          </FadeIn>
          <FadeIn delay={.2}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:"32px",marginTop:"40px",alignItems:"start"}}>
              <div style={{aspectRatio:"3/4",borderRadius:"12px",overflow:"hidden",border:`2px solid ${C.gold}25`}}>
                <img src={familyPhoto} alt="Captain Brian D Vukelic" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
              </div>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",lineHeight:1.8,color:C.sand,margin:"0 0 18px"}}>After 26 years in the United States Marine Corps — serving as a Lieutenant Colonel, combat-deployed, and earning his service-disabled veteran status — Captain Brian traded his dress blues for a boat and flip flops in the U.S. Virgin Islands.</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",lineHeight:1.8,color:C.sand,margin:"0 0 18px"}}>But some things never change — the discipline, the attention to detail, and the commitment to taking care of people. That's the foundation of Knotty Marine Charters: a veteran-owned operation built on service, safety, and making sure every single person aboard Luna's Wake has the best day of their vacation.</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",lineHeight:1.8,color:C.sand,margin:"0 0 18px"}}>A proud grandfather, father, and husband — Brian named the boat Luna's Wake after his granddaughter Luna. Every charter is a family affair, and every guest is treated like one of our own.</p>
                <p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"20px",lineHeight:1.5,color:C.cream,margin:"0 0 24px"}}>"I served my country for 26 years. Now I serve rum punch."</p>
                <div style={{display:"inline-flex",padding:"13px 20px",borderRadius:"8px",border:`1.5px solid ${C.rust}60`,background:`${C.rust}10`,alignItems:"center"}}>
                  <span style={{fontFamily:"'Oswald',sans-serif",fontSize:"17px",letterSpacing:"3px",color:C.rust,fontWeight:600}}>★ SERVICE DISABLED VETERAN OWNED & OPERATED</span>
                </div>
                <div style={{marginTop:"8px"}}><span style={{fontFamily:"'Oswald',sans-serif",fontSize:"15px",letterSpacing:"3px",color:C.sand,fontWeight:500}}>USMC RETIRED · 26 YEARS</span></div>
              </div>
              <div style={{borderRadius:"12px",overflow:"hidden",border:`2px solid ${C.gold}25`,position:"relative"}}>
                <img src={lunaPhoto} alt="Luna — inspiration for Luna's Wake" style={{width:"100%",aspectRatio:"3/4",objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(6,18,34,.9))",padding:"24px 12px 12px"}}>
                  <p style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",color:C.cream,margin:"0 0 2px",fontWeight:700}}>Meet Luna</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:C.sand,margin:0,opacity:.8}}>The inspiration behind Luna's Wake</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
      <Waves color={C.navy}/>

      {/* The Boat */}
      <section id="the-boat" style={{padding:"80px 24px",background:`linear-gradient(180deg,${C.warmWhite},${C.cream})`}}>
        <div style={{maxWidth:"900px",margin:"0 auto"}}>
          <FadeIn>
            <div style={{textAlign:"center",marginBottom:"44px"}}>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.rust,marginBottom:"10px",fontWeight:500}}>YOUR VESSEL</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,5vw,48px)",fontWeight:800,color:C.navy,margin:"0 0 4px",letterSpacing:"-.03em"}}>Luna's Wake</h2>
              <p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"18px",color:"#8b8378"}}>Named after Captain Brian's granddaughter</p>
            </div>
          </FadeIn>
          <FadeIn delay={.2}>
            <div style={{borderRadius:"20px",overflow:"hidden",background:`linear-gradient(135deg,${C.navy},${C.midNavy})`,border:`1px solid ${C.gold}20`,display:"grid",gridTemplateColumns:"1fr 1fr"}}>
              <div style={{overflow:"hidden"}}><img src={boatSide} alt="2025 Monterey 30 Elite" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
              <div style={{padding:"32px 26px"}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:C.cream,margin:"0 0 4px"}}>Vessel Specifications</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:C.sand,margin:"0 0 20px",opacity:.7}}>Comfort, safety, and speed on the water</p>
                {[["Length","30 ft — 2025 Monterey 30 Elite"],["Awards","2024 Boat of the Year · Miami Innovation Award"],["Capacity","Up to 10 guests"],["Max Power","600 HP Twin Mercury Outboards"],["Top Speed","54+ MPH"],["Sound","Fusion Apollo · 6 JL Speakers + 2 Subs"],["Features","Hardtop · Wetbar · Electric head · Trim tabs"],["Safety","Full USCG compliant · NMMA certified"],["Home Port","St. Thomas, USVI"]].map(([label,val],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.gold}12`}}>
                    <span style={{fontFamily:"'Oswald',sans-serif",fontSize:"11px",letterSpacing:"2px",color:C.gold,fontWeight:500}}>{label.toUpperCase()}</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:C.sand}}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Boat Photos */}
      <section style={{padding:"60px 24px",background:`linear-gradient(175deg,${C.cream},${C.warmWhite})`}}>
        <div style={{maxWidth:"1000px",margin:"0 auto"}}>
          <FadeIn>
            <div style={{textAlign:"center",marginBottom:"36px"}}>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.rust,marginBottom:"10px",fontWeight:500}}>YOUR RIDE</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:800,color:C.navy,margin:0,letterSpacing:"-.03em"}}>The 2025 Monterey 30 Elite</h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#8b8378",marginTop:"8px"}}>Boating Magazine's 2024 Boat of the Year · Miami Innovation Award Winner</p>
            </div>
          </FadeIn>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"14px"}}>
            <FadeIn><div style={{borderRadius:"14px",overflow:"hidden",height:"100%"}}><img src={boatSunset} alt="Luna's Wake at sunset" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/></div></FadeIn>
            <FadeIn delay={.15}><div style={{borderRadius:"14px",overflow:"hidden"}}><img src={boatAction} alt="Luna's Wake underway" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/></div></FadeIn>
          </div>
        </div>
      </section>

      <PhotoGallery/>

      {/* Booking CTA */}
      <section id="book-now" style={{padding:"80px 24px",background:`linear-gradient(175deg,${C.deepNavy},${C.navy})`,textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{maxWidth:"660px",margin:"0 auto",position:"relative",zIndex:1}}>
          <FadeIn>
            <KnotIcon size={44} color={C.gold} strokeW={2}/>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,5vw,52px)",fontWeight:800,color:C.cream,margin:"20px 0 8px",letterSpacing:"-.03em"}}>Ready to Get Knotty?</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",lineHeight:1.7,color:C.sand,margin:"0 0 32px",opacity:.85}}>Book your private charter aboard Luna's Wake. Spots fill fast — especially December through April.</p>
          </FadeIn>

          {/* ═══════════════════════════════════════════════════════
              BOOKING SYSTEM PLACEHOLDER
              Replace this block with your booking widget embed code.
              Peek Pro: paste the <script> and <div> embed code here.
              Bookeo:   paste the Bookeo widget iframe or embed here.
              ═══════════════════════════════════════════════════════ */}
          <FadeIn delay={.15}>
            <div style={{background:`${C.cream}08`,border:`1.5px dashed ${C.gold}40`,borderRadius:"16px",padding:"36px",marginBottom:"24px"}}>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"4px",color:C.gold,marginBottom:"8px"}}>ONLINE BOOKING</p>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",color:C.cream,margin:"0 0 12px",fontWeight:700}}>Book Your Charter</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:C.sand,margin:"0 0 20px",opacity:.8}}>Email, call, or WhatsApp — we respond within 2 hours during charter season.</p>
              <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
                <a href="mailto:KMCUSVI@gmail.com?subject=Charter Booking Request" style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"13px 26px",borderRadius:"10px",background:C.gold,color:C.navy,fontFamily:"'DM Sans',sans-serif",fontSize:"15px",fontWeight:700,textDecoration:"none"}}>✉ Email to Book</a>
                <a href="tel:+15712327040" style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"13px 24px",borderRadius:"10px",background:"transparent",color:C.cream,border:`1.5px solid ${C.cream}30`,fontFamily:"'DM Sans',sans-serif",fontSize:"15px",fontWeight:500,textDecoration:"none"}}>📞 Call / Text</a>
                <a href="https://wa.me/15712327040" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"13px 24px",borderRadius:"10px",background:"#25D366",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"15px",fontWeight:600,textDecoration:"none"}}>💬 WhatsApp</a>
              </div>
            </div>
          </FadeIn>
          {/* ═══ END BOOKING PLACEHOLDER ═══ */}

          <FadeIn delay={.25}><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:`${C.sand}70`,marginBottom:"28px"}}>📬 We respond within 2 hours during charter season.</p></FadeIn>
          <FadeIn delay={.35}>
            <div style={{display:"flex",gap:"32px",justifyContent:"center",flexWrap:"wrap"}}>
              {[{label:"Email",value:"KMCUSVI@gmail.com"},{label:"Phone / Text",value:"(571) 232-7040"},{label:"Location",value:"St. Thomas, USVI"}].map((c,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"10px",letterSpacing:"3px",color:C.gold,margin:"0 0 4px",fontWeight:500}}>{c.label.toUpperCase()}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:C.sand,margin:0}}>{c.value}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Veterans */}
      <section id="veterans" style={{padding:"80px 24px",background:`linear-gradient(135deg,${C.navy},${C.midNavy})`,textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:.03,background:`repeating-linear-gradient(45deg,${C.gold} 0px,${C.gold} 1px,transparent 1px,transparent 20px)`}}/>
        <div style={{maxWidth:"600px",margin:"0 auto",position:"relative",zIndex:1}}>
          <FadeIn>
            <div style={{display:"inline-block",padding:"16px 32px",borderRadius:"10px",border:`2px solid ${C.rust}`,background:`${C.rust}10`,marginBottom:"24px"}}>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"20px",letterSpacing:"5px",color:C.rust,margin:"0 0 4px",fontWeight:600}}>★ SERVICE DISABLED VETERAN OWNED ★</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",letterSpacing:"3px",color:C.sand,margin:0}}>UNITED STATES MARINE CORPS · 26 YEARS</p>
            </div>
          </FadeIn>
          <FadeIn delay={.15}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:800,color:C.cream,margin:"0 0 12px",letterSpacing:"-.03em"}}>We Take Care of Our Own</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",lineHeight:1.8,color:C.sand,margin:"0 0 32px"}}>Active military, veterans, and USVI locals always receive a discount — because this community is family.</p>
          </FadeIn>
          <FadeIn delay={.3}>
            <div style={{padding:"32px 40px",borderRadius:"16px",background:`linear-gradient(135deg,${C.deepNavy},${C.navy})`,border:`2px solid ${C.gold}30`,boxShadow:"0 12px 48px rgba(0,0,0,.3)"}}>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",color:C.cream,margin:"0 0 8px",fontWeight:700}}>Military, Veterans & Locals</p>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"52px",color:C.gold,margin:"0 0 4px",fontWeight:600,letterSpacing:"3px",lineHeight:1}}>10% OFF</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:C.sand,margin:"0 0 12px"}}>Every charter, every time. Show valid ID at the start of your trip.</p>
              <div style={{background:`${C.gold}12`,border:`1px solid ${C.gold}30`,borderRadius:"8px",padding:"10px 20px",marginBottom:"20px",display:"inline-block"}}>
                <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"14px",letterSpacing:"3px",color:C.gold,margin:0}}>USE CODE: <strong>USMC10</strong></p>
              </div>
              <div><a href="#book-now" style={{display:"inline-block",padding:"12px 32px",borderRadius:"8px",background:C.gold,color:C.navy,fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:600,textDecoration:"none"}}>Book with Military Discount</a></div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{padding:"80px 24px",background:`linear-gradient(180deg,${C.warmWhite},${C.cream})`}}>
        <div style={{maxWidth:"800px",margin:"0 auto"}}>
          <FadeIn>
            <div style={{textAlign:"center",marginBottom:"48px"}}>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.rust,marginBottom:"10px",fontWeight:500}}>QUESTIONS?</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:800,color:C.navy,margin:0,letterSpacing:"-.03em"}}>Frequently Asked</h2>
            </div>
          </FadeIn>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {faqItems.map((faq,i)=>(
              <FadeIn key={i} delay={i*.03}>
                <div style={{background:"#fff",borderRadius:"12px",border:`1px solid ${C.sand}40`,overflow:"hidden"}}>
                  <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{width:"100%",padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",fontWeight:600,color:C.navy,paddingRight:"16px"}}>{faq.q}</span>
                    <span style={{color:C.gold,fontSize:"20px",flexShrink:0,lineHeight:1}}>{faqOpen===i?'−':'+'}</span>
                  </button>
                  {faqOpen===i&&(<div style={{padding:"0 22px 18px"}}><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#5a554e",lineHeight:1.7,margin:0}}>{faq.a}</p></div>)}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{padding:"80px 24px",background:`linear-gradient(175deg,${C.deepNavy},${C.navy})`}}>
        <div style={{maxWidth:"1000px",margin:"0 auto"}}>
          <FadeIn>
            <div style={{textAlign:"center",marginBottom:"48px"}}>
              <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.gold,marginBottom:"10px",fontWeight:500}}>WHAT THEY SAY</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:800,color:C.cream,margin:0,letterSpacing:"-.03em"}}>Straight from the Crew</h2>
            </div>
          </FadeIn>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"24px"}}>
            {testimonials.map((t,i)=>(
              <FadeIn key={i} delay={i*.15}>
                <div style={{background:`${C.cream}06`,borderRadius:"16px",padding:"28px",border:`1px solid ${C.gold}12`,height:"100%",display:"flex",flexDirection:"column"}}>
                  <div style={{display:"flex",gap:"4px",marginBottom:"16px"}}>
                    {[1,2,3,4,5].map(s=><svg key={s} width="16" height="16" viewBox="0 0 16 16" fill={C.gold}><polygon points="8,1 10,6 15,6.5 11,9.5 12.5,14.5 8,11.5 3.5,14.5 5,9.5 1,6.5 6,6"/></svg>)}
                  </div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",lineHeight:1.7,color:C.sand,margin:"0 0 20px",flex:1,fontStyle:"italic",opacity:.9}}>"{t.text}"</p>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:600,color:C.cream,margin:"0 0 2px"}}>{t.name}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:C.sand,margin:0,opacity:.6}}>{t.loc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section style={{padding:"60px 24px",background:`linear-gradient(175deg,${C.deepNavy},${C.navy})`}}>
        <div style={{maxWidth:"800px",margin:"0 auto",textAlign:"center"}}>
          <FadeIn>
            <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"5px",color:C.gold,marginBottom:"10px",fontWeight:500}}>ISLAND PARTNERS</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:C.cream,margin:"0 0 12px",letterSpacing:"-.03em"}}>Friends We Do Business With</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:C.sand,margin:"0 0 36px",opacity:.8}}>Trusted local partners who share our commitment to exceptional USVI experiences.</p>
          </FadeIn>
          <FadeIn delay={.2}>
            <a href="https://www.everlongexcursions.com/" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"20px",padding:"24px 36px",borderRadius:"16px",background:`${C.cream}06`,border:`1.5px solid ${C.gold}30`,textDecoration:"none"}}>
              <span style={{fontSize:"36px"}}>⛵</span>
              <div style={{textAlign:"left"}}>
                <p style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:700,color:C.gold,margin:"0 0 4px"}}>Everlong Excursions</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:C.sand,margin:"0 0 4px",opacity:.8}}>Premier USVI sailing excursions and adventures</p>
                <span style={{fontFamily:"'Oswald',sans-serif",fontSize:"11px",letterSpacing:"2px",color:C.gold,opacity:.7}}>www.everlongexcursions.com ↗</span>
              </div>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:C.deepNavy,padding:"36px 24px",borderTop:`3px solid ${C.gold}20`}}>
        <div style={{maxWidth:"900px",margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"20px"}}>
          <div>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",color:C.cream,margin:"0 0 4px",fontWeight:700}}>Knotty Marine Charters</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:C.sand,margin:"0 0 8px",opacity:.5,letterSpacing:"1px"}}>U.S. Virgin Islands · Aboard Luna's Wake</p>
            <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
              <a href="tel:+15712327040" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:C.sand,opacity:.7,textDecoration:"none"}}>📞 (571) 232-7040</a>
              <a href="https://wa.me/15712327040" target="_blank" rel="noopener noreferrer" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#25D366",textDecoration:"none"}}>💬 WhatsApp</a>
              <a href="mailto:KMCUSVI@gmail.com" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:C.sand,opacity:.7,textDecoration:"none"}}>✉ KMCUSVI@gmail.com</a>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{display:"inline-flex",padding:"8px 16px",borderRadius:"6px",border:`1px solid ${C.rust}50`,background:`${C.rust}08`,gap:"6px",alignItems:"center",marginBottom:"6px"}}>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:"13px",letterSpacing:"2px",color:C.rust,fontWeight:600}}>★ SERVICE DISABLED VETERAN OWNED</span>
            </div>
            <p style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",letterSpacing:"2px",color:C.sand,margin:"0 0 6px",opacity:.6}}>USMC RETIRED · 26 YEARS</p>
            <p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"14px",color:C.gold,margin:0,opacity:.4}}>"Sun, Fun, Saltwater Memories"</p>
          </div>
        </div>
        <div style={{maxWidth:"900px",margin:"20px auto 0",paddingTop:"16px",borderTop:`1px solid ${C.gold}10`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:C.sand,margin:0,opacity:.3}}>© 2026 Knotty Marine Charters LLC · All Rights Reserved</p>
          <button onClick={()=>setAdminOpen(true)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:`${C.sand}25`,background:"transparent",border:"none",cursor:"pointer"}}>Owner Login</button>
        </div>
      </footer>

      {adminOpen&&<AdminPanel onClose={()=>setAdminOpen(false)}/>}
    </div>
  );
}
