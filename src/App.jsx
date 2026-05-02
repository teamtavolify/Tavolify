import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/* ══════════════════════════════════════════════════════════════ */
/* 1. DESIGN TOKENS & CONFIGURAZIONE                              */
/* ══════════════════════════════════════════════════════════════ */

const GoldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const T = {
  bg:        "#080604",
  surface:   "#100e0a",
  surfaceHi: "#18150f",
  surfaceMd: "#141008",
  border:    "rgba(201,168,76,0.10)",
  borderHi:  "rgba(201,168,76,0.22)",
  gold:      "#c9a84c",
  goldLight: "#e8c97e",
  goldDim:   "rgba(201,168,76,0.12)",
  goldGlow:  "rgba(201,168,76,0.06)",
  cream:     "#f0e8d8",
  creamDim:  "#c8bfaa",
  muted:     "#6a6054",
  mutedHi:   "#9a9080",
  green:     "#4aad7a",
  greenBg:   "rgba(74,173,122,0.12)",
  red:       "#c94040",
  redBg:     "rgba(201,64,64,0.12)",
  amber:     "#c08830",
  amberBg:   "rgba(192,136,48,0.12)",
};

const fontSerif = `'Cormorant Garamond', 'Playfair Display', Georgia, serif`;
const fontSans  = `'DM Sans', 'Helvetica Neue', sans-serif`;

/* ══════════════════════════════════════════════════════════════ */
/* 2. DATI                                                        */
/* ══════════════════════════════════════════════════════════════ */

const INITIAL_RESTAURANTS = [
  {
    id: 1,
    name: "Osteria del Vino",
    city: "Bari",
    lat: 41.125, lng: 16.866,
    tag: "Cucina Pugliese",
    rating: 4.8,
    minGuests: 1, maxGuests: 10,
    priceRange: "€€",
    desc: "Nel cuore pulsante della Bari Vecchia, tra i vicoli lastricati del borgo antico, l'Osteria del Vino custodisce i sapori autentici di una tradizione gastronomica secolare. Ogni piatto è un atto d'amore verso la terra pugliese: materie prime locali, ricette tramandate di generazione in generazione, e una cantina selezionata tra le migliori masserie della regione. Un'esperienza sensoriale che sa di casa.",
    features: ["Aria Condizionata", "Dehors Estivo", "Accesso Disabili", "Cantina Selezionata"],
    menu: ["Orecchiette alle cime di rapa", "Fave e cicoria", "Bombette pugliesi", "Tiramisù al fico d'India"],
    tables: [
      { id: 1, x: 60,  y: 60,  shape: "circle", cap: 2,  status: "free" },
      { id: 2, x: 160, y: 60,  shape: "circle", cap: 4,  status: "occupied" },
      { id: 3, x: 260, y: 60,  shape: "rect",   cap: 6,  status: "free" },
      { id: 4, x: 60,  y: 155, shape: "rect",   cap: 4,  status: "free" },
      { id: 5, x: 180, y: 160, shape: "circle", cap: 2,  status: "free" },
      { id: 6, x: 265, y: 155, shape: "circle", cap: 4,  status: "reserved" },
      { id: 7, x: 110, y: 250, shape: "rect",   cap: 8,  status: "free" },
      { id: 8, x: 255, y: 250, shape: "circle", cap: 2,  status: "free" },
    ],
  },
  {
    id: 2,
    name: "Mare Blu",
    city: "Polignano a Mare",
    lat: 40.995, lng: 17.218,
    tag: "Pesce del Giorno",
    rating: 4.6,
    minGuests: 1, maxGuests: 8,
    priceRange: "€€€",
    desc: "Aggrappato alla scogliera carsica di Polignano come un nido di gabbiano, Mare Blu offre un panorama mozzafiato sull'Adriatico che toglie il respiro al tramonto. Il pesce arriva direttamente dall'imbarcadero del borgo: calamari, ricci di mare, ostriche e crostacei vengono proposti crudi o appena scottati per esaltarne la freschezza selvaggia. Ogni tavolo affaccia sull'infinito blu.",
    features: ["Vista Mare", "Terrazza sul Cliff", "Musica Live il Venerdì", "Carta Vini Premium"],
    menu: ["Gran Crudo di Mare", "Risotto allo scorfano", "Branzino in crosta di sale", "Panna cotta agli agrumi"],
    tables: [
      { id: 1, x: 60,  y: 70,  shape: "circle", cap: 2,  status: "occupied" },
      { id: 2, x: 160, y: 70,  shape: "circle", cap: 4,  status: "free" },
      { id: 3, x: 260, y: 70,  shape: "rect",   cap: 6,  status: "free" },
      { id: 4, x: 80,  y: 180, shape: "rect",   cap: 4,  status: "reserved" },
      { id: 5, x: 220, y: 180, shape: "circle", cap: 6,  status: "free" },
      { id: 6, x: 150, y: 280, shape: "rect",   cap: 8,  status: "free" },
    ],
  },
  {
    id: 3,
    name: "La Masseria",
    city: "Alberobello",
    lat: 40.783, lng: 17.240,
    tag: "Farm-to-Table · Km Zero",
    rating: 4.9,
    minGuests: 2, maxGuests: 12,
    priceRange: "€€€€",
    desc: "Tra i trulli patrimonio UNESCO e distese di ulivi centenari, La Masseria è un inno alla lentezza del buono. Il menu cambia ogni settimana seguendo le stagioni dell'orto biologico di proprietà: verdure raccolte all'alba, carni allevate allo stato brado, formaggi prodotti dalla casara di famiglia. Cenare qui non è solo mangiare, è comprendere il silenzio fertile della campagna pugliese.",
    features: ["Orto Biologico", "Parcheggio Privato", "Spazio Bambini", "Sala Privata per Eventi", "Vista Trulli"],
    menu: ["Antipasto della masseria", "Pasta al ragù di agnello", "Grigliata su brace di ulivo", "Pasticciotto artigianale"],
    tables: [
      { id: 1, x: 60,  y: 60,  shape: "rect",   cap: 4,  status: "free" },
      { id: 2, x: 200, y: 60,  shape: "rect",   cap: 6,  status: "free" },
      { id: 3, x: 80,  y: 170, shape: "circle", cap: 2,  status: "occupied" },
      { id: 4, x: 210, y: 170, shape: "circle", cap: 4,  status: "free" },
      { id: 5, x: 130, y: 270, shape: "rect",   cap: 12, status: "reserved" },
    ],
  },
];

const EVENTS = [
  { id: 101, title: "Jazz & Primitivo Night", date: "2026-05-15", loc: "Osteria del Vino", restaurantId: 1, tag: "Musica Live", emoji: "🎷",
    desc: "Una serata ipnotica tra note di jazz improvvisato e una selezione esclusiva di Primitivo di Manduria. Tre musicisti dal vivo accompagnano una degustazione guidata da Nicola Stasi, sommelier stellato. Atmosfera intima, posti estremamente limitati. Non è una cena — è un rituale.", spots: 12 },
  { id: 102, title: "Crudi d'Adriatico", date: "2026-05-18", loc: "Mare Blu", restaurantId: 2, tag: "Food Experience", emoji: "🦪",
    desc: "Il cuoco e il pescatore, insieme davanti a voi. Apertura delle ostriche al tavolo, assaggio di ricci appena pescati, battuto di gamberi viola di Trani e tartare di tonno rosso. Un percorso sensoriale in sei portate che racconta il mare come non lo avete mai assaggiato. Abbinamenti con Fiano d'Avellino in magnum.", spots: 8 },
  { id: 103, title: "Vendemmia di Primavera", date: "2026-05-20", loc: "La Masseria", restaurantId: 3, tag: "Esperienza", emoji: "🫒",
    desc: "Un pomeriggio nei campi, tra ulivi in fiore e vigne risvegliate dalla primavera. Passeggiata guidata tra i trulli, raccolta simbolica delle ultime olive tardive, e poi a tavola per una cena di cinque portate abbinate ai vini della tenuta. Un'immersione totale nel ritmo della terra pugliese.", spots: 20 },
];

const SLOTS = ["12:00","12:30","13:00","13:30","20:00","20:30","21:00","21:30","22:00"];

const INITIAL_BOOKINGS = [
  { id: "A1X", name: "Mario Rossi", date: "2026-05-15", time: "20:30", people: 4, table: { id: 2 }, restaurant: INITIAL_RESTAURANTS[0], status: "pending", notes: "No glutine" },
  { id: "B2Y", name: "Elena Bianchi", date: "2026-05-16", time: "21:00", people: 2, table: { id: 1 }, restaurant: INITIAL_RESTAURANTS[0], status: "confirmed", notes: "" },
  { id: "C3Z", name: "Luigi Verdi", date: "2026-05-17", time: "21:30", people: 6, table: { id: 3 }, restaurant: INITIAL_RESTAURANTS[0], status: "pending", notes: "Compleanno — tavolo con palloncini" },
];

/* ══════════════════════════════════════════════════════════════ */
/* 3. HELPERS & STILI GLOBALI                                     */
/* ══════════════════════════════════════════════════════════════ */

const helpers = {
  today: () => new Date().toISOString().split("T")[0],
  formatDate: (d) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    const months = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
    return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
  },
  generateId: () => Math.random().toString(36).substr(2,6).toUpperCase()
};

const globalStyles = `
  @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  body {
    background: ${T.bg};
    color: ${T.cream};
    font-family: ${fontSans};
    overflow-x: hidden;
  }

  .leaflet-container { background: ${T.bg} !important; border-radius: 20px; z-index: 1; }
  .leaflet-popup-content-wrapper { background: ${T.surfaceHi}; color: ${T.cream}; border: 1px solid ${T.gold}; border-radius: 14px !important; box-shadow: 0 20px 60px rgba(0,0,0,0.6) !important; }
  .leaflet-popup-tip { background: ${T.gold}; }
  .leaflet-popup-content { margin: 16px 18px !important; }
  .leaflet-control-zoom a { background: ${T.surfaceHi} !important; color: ${T.cream} !important; border-color: ${T.border} !important; }

  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.borderHi}; border-radius: 4px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse    { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
  @keyframes shimmer  { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
  @keyframes glow     { 0%,100% { box-shadow: 0 0 20px rgba(201,168,76,0.15); } 50% { box-shadow: 0 0 40px rgba(201,168,76,0.30); } }

  .fade-up  { animation: fadeUp  0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
  .fade-in  { animation: fadeIn  0.3s ease forwards; }
  .pulse    { animation: pulse   2.2s ease-in-out infinite; }
  .slide-up { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
  .glow-anim { animation: glow  3s ease-in-out infinite; }

  input[type=date]::-webkit-calendar-picker-indicator { filter:invert(0.6); cursor:pointer; }

  input, select, textarea {
    background: ${T.surfaceHi};
    border: 1px solid ${T.border};
    color: ${T.cream};
    border-radius: 14px;
    padding: 14px 18px;
    font-family: ${fontSans};
    font-size: 15px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  input:focus, select:focus, textarea:focus {
    border-color: ${T.gold};
    box-shadow: 0 0 0 3px ${T.goldDim};
  }
  input::placeholder, textarea::placeholder { color: ${T.muted}; }

  select option { background: ${T.surfaceHi}; color: ${T.cream}; }

  button { font-family: ${fontSans}; }
`;

/* ══════════════════════════════════════════════════════════════ */
/* 4. ROOT                                                        */
/* ══════════════════════════════════════════════════════════════ */

export default function App() {
  const [page, setPage] = useState("auth");
  const [user, setUser] = useState(null);
  const [restaurantsData, setRestaurantsData] = useState(INITIAL_RESTAURANTS);
  const [globalBookings, setGlobalBookings] = useState(INITIAL_BOOKINGS);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
  }, []);

  const handleLogin = (u) => { setUser(u); setPage("home"); };
  const handleLogout = () => { setUser(null); setPage("auth"); };

  if (page === "auth") return <AuthPage onLogin={handleLogin} />;
  if (user?.role === "ristoratore") return (
    <BusinessApp user={user} onLogout={handleLogout}
      bookings={globalBookings} setBookings={setGlobalBookings}
      restaurants={restaurantsData} setRestaurants={setRestaurantsData} />
  );
  return (
    <CustomerApp user={user} onLogout={handleLogout}
      bookings={globalBookings} setBookings={setGlobalBookings}
      restaurants={restaurantsData} setRestaurants={setRestaurantsData} />
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* 5. AUTH PAGE                                                   */
/* ══════════════════════════════════════════════════════════════ */

function AuthPage({ onLogin }) {
  const [authData, setAuthData] = useState({ email: "", pass: "" });
  const [role, setRole] = useState("cliente");
  const [restaurantId, setRestaurantId] = useState(1);
  const [err, setErr] = useState("");

  const submit = () => {
    if (!authData.email.includes("@")) return setErr("Indirizzo email non valido.");
    if (authData.pass.length < 4) return setErr("La password deve contenere almeno 4 caratteri.");
    onLogin({
      name: authData.email.split("@")[0],
      email: authData.email,
      role,
      restaurantId: role === "ristoratore" ? parseInt(restaurantId) : null,
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      background: `radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%), ${T.bg}`,
    }}>
      {/* Decorative lines */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%,-50%)`,
            width: `${300 + i*120}px`,
            height: `${300 + i*120}px`,
            borderRadius: "50%",
            border: `1px solid rgba(201,168,76,${0.04 - i*0.007})`,
          }}/>
        ))}
      </div>

      <div className="fade-up" style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 28,
        padding: "44px 36px",
        width: "100%",
        maxWidth: 440,
        position: "relative",
        zIndex: 1,
        boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
      }}>
        {/* Gold accent top bar */}
        <div style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: 60, height: 2,
          background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
          borderRadius: 1,
        }}/>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: fontSerif, color: T.gold, fontSize: 48, fontWeight: 400, letterSpacing: 2, lineHeight: 1 }}>
            Tavolify
          </h1>
          <p style={{ color: T.muted, fontSize: 10, letterSpacing: 4, marginTop: 8, textTransform: "uppercase" }}>
            The Dining Network · Puglia
          </p>
          <div style={{ width: 40, height: 1, background: T.border, margin: "16px auto 0" }}/>
        </div>

        {/* Role toggle */}
        <div style={{ display: "flex", background: T.surfaceHi, borderRadius: 14, padding: 4, marginBottom: 28, border: `1px solid ${T.border}` }}>
          {[["cliente","🍽 Ospite"],["ristoratore","🏛 Ristoratore"]].map(([val, label]) => (
            <button key={val} onClick={() => setRole(val)} style={{
              flex: 1, padding: "11px 8px", borderRadius: 11, border: "none",
              background: role === val ? T.gold : "transparent",
              color: role === val ? T.bg : T.muted,
              fontWeight: role === val ? "600" : "400",
              cursor: "pointer", transition: "all 0.2s",
              fontSize: 13, letterSpacing: 0.5,
            }}>{label}</button>
          ))}
        </div>

        {role === "ristoratore" && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 8 }}>Il tuo locale</label>
            <select value={restaurantId} onChange={e => setRestaurantId(e.target.value)}>
              {INITIAL_RESTAURANTS.map(r => (
                <option key={r.id} value={r.id}>{r.name} — {r.city}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 8 }}>
            {role === "cliente" ? "Email" : "Email del Locale"}
          </label>
          <input type="email" placeholder="nome@esempio.com"
            value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 8 }}>Password</label>
          <input type="password" placeholder="••••••••"
            value={authData.pass} onChange={e => setAuthData({...authData, pass: e.target.value})}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        {err && <p className="fade-in" style={{ color: T.red, fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>⚠ {err}</p>}

        <button onClick={submit} style={{
          width: "100%", padding: "17px 24px", borderRadius: 14,
          background: `linear-gradient(135deg, ${T.gold} 0%, #a87a28 100%)`,
          color: T.bg, border: "none", cursor: "pointer",
          fontSize: 15, fontWeight: "700", letterSpacing: 0.5,
          boxShadow: `0 8px 30px rgba(201,168,76,0.25)`,
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(201,168,76,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(201,168,76,0.25)"; }}
        >
          Accedi · {role === "cliente" ? "Area Ospiti" : "Area Business"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: T.muted, marginTop: 22, lineHeight: 1.7 }}>
          Tavoli, sapori e ricordi indimenticabili<br/>nelle migliori tavole della Puglia.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* 6. BUSINESS APP                                                */
/* ══════════════════════════════════════════════════════════════ */

function BusinessApp({ user, onLogout, bookings, setBookings, restaurants, setRestaurants }) {
  const [view, setView] = useState("dashboard");

  const myRestaurant = restaurants.find(r => r.id === user.restaurantId) || restaurants[0];
  const myBookings   = bookings.filter(b => b.restaurant?.id === myRestaurant.id);

  const handleStatus = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? {...b, status: newStatus} : b));
  };

  // ── FIX: stato tavoli calcolato correttamente includendo tavolo 1 ──
  const tablesWithStatus = myRestaurant.tables.map(t => {
    const activeBooking = myBookings.find(
      b => (b.table?.id === t.id || b.table === t.id) && b.status !== "rejected"
    );
    if (activeBooking) {
      return {
        ...t,
        status: activeBooking.status === "confirmed" ? "occupied" : "reserved",
        booking: activeBooking,
      };
    }
    return { ...t, booking: null };
  });

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 90, background: `radial-gradient(ellipse at 50% -20%, rgba(201,168,76,0.05) 0%, transparent 50%), ${T.bg}` }}>
      <TopBar user={user} onLogout={onLogout} title="Business" />

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "20px 20px" }}>

        {view === "dashboard" && (
          <div className="fade-up">
            {/* Header ristorante */}
            <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6 }}>Stai gestendo</p>
              <h2 style={{ fontFamily: fontSerif, fontSize: 32, color: T.goldLight, lineHeight: 1.1 }}>{myRestaurant.name}</h2>
              <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{myRestaurant.city} · {myRestaurant.tag} · {myRestaurant.priceRange}</p>
            </div>

            {/* KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 36 }}>
              {[
                { label: "Prenotazioni Totali", val: myBookings.length, color: T.goldLight },
                { label: "Coperti Attesi", val: myBookings.reduce((s,b)=>s+parseInt(b.people),0), color: T.goldLight },
                { label: "In Attesa di Risposta", val: myBookings.filter(b=>b.status==="pending").length, color: T.amber },
                { label: "Ricavo Stimato Serata", val: `€ ${myBookings.filter(b=>b.status==="confirmed").length * 48}`, color: T.green },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 18px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}44, transparent)` }}/>
                  <p style={{ fontFamily: fontSerif, fontSize: 30, color, lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Prenotazioni */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontFamily: fontSerif, fontSize: 26, color: T.cream }}>Richieste in Arrivo</h3>
              {myBookings.filter(b=>b.status==="pending").length > 0 && (
                <span style={{ fontSize: 11, background: T.amberBg, color: T.amber, padding: "4px 10px", borderRadius: 20, fontWeight: "600" }}>
                  {myBookings.filter(b=>b.status==="pending").length} in attesa
                </span>
              )}
            </div>

            {myBookings.length === 0 ? (
              <EmptyState icon="📬" title="Nessuna richiesta ricevuta" sub="Quando i clienti prenotan un tavolo al tuo locale, le richieste appariranno qui in tempo reale." />
            ) : (
              myBookings.map((b, idx) => {
                const col = b.status === "pending" ? T.amber : b.status === "confirmed" ? T.green : T.red;
                return (
                  <div key={b.id} className="fade-up" style={{ animationDelay: `${idx*0.05}s`, background: T.surface, border: `1px solid ${T.border}`, borderLeft: `3px solid ${col}`, borderRadius: 18, padding: "20px 22px", marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <p style={{ fontFamily: fontSerif, fontSize: 22, color: T.cream }}>{b.name}</p>
                        <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                          {helpers.formatDate(b.date)} · {b.time} · Tavolo {b.table?.id || b.table}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 10, background: col+"20", color: col, padding: "5px 10px", borderRadius: 20, fontWeight: "700", letterSpacing: 0.5 }}>
                          {b.status === "pending" ? "IN ATTESA" : b.status === "confirmed" ? "CONFERMATA" : "RIFIUTATA"}
                        </span>
                        <p style={{ fontSize: 20, fontFamily: fontSerif, color: T.goldLight, marginTop: 4 }}>{b.people} {b.people===1?"ospite":"ospiti"}</p>
                      </div>
                    </div>

                    {b.notes && (
                      <div style={{ background: T.amberBg, border: `1px solid ${T.amber}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                        <p style={{ fontSize: 13, color: T.amber }}>📌 {b.notes}</p>
                      </div>
                    )}

                    {b.status === "pending" && (
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <button onClick={() => handleStatus(b.id, "rejected")}
                          style={{ flex: 1, padding: "11px", borderRadius: 12, background: "none", border: `1px solid ${T.red}44`, color: T.red, cursor: "pointer", fontSize: 13, fontWeight: "600" }}>
                          ✕ Rifiuta
                        </button>
                        <button onClick={() => handleStatus(b.id, "confirmed")}
                          style={{ flex: 2, padding: "11px", borderRadius: 12, background: T.greenBg, border: `1px solid ${T.green}44`, color: T.green, cursor: "pointer", fontSize: 14, fontWeight: "700" }}>
                          ✓ Conferma Prenotazione
                        </button>
                      </div>
                    )}
                    {b.status !== "pending" && (
                      <p style={{ fontSize: 13, color: b.status === "confirmed" ? T.green : T.red, marginTop: 8 }}>
                        {b.status === "confirmed" ? "✓ Prenotazione confermata — il cliente è stato notificato." : "✗ Prenotazione rifiutata."}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {view === "tables" && (
          <div className="fade-up">
            <h2 style={{ fontFamily: fontSerif, fontSize: 32, color: T.cream, marginBottom: 6 }}>Sala in Tempo Reale</h2>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>{myRestaurant.name} — visualizzazione live dello stato dei tavoli.</p>

            {/* Mappa sala */}
            <div style={{ background: "#06050300", border: `1px solid ${T.border}`, borderRadius: 20, padding: "16px 10px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${T.border} 1px, transparent 1px)`, backgroundSize: "30px 30px", opacity: 0.4 }}/>
              <svg width="100%" viewBox="0 0 340 320" style={{ display: "block", position: "relative" }}>
                {tablesWithStatus.map(t => {
                  const col = t.status === "free" ? T.green : t.status === "reserved" ? T.amber : T.red;
                  const isLarge = t.cap >= 6, isMed = t.cap >= 4 && t.cap < 6;
                  const tw = isLarge ? 62 : isMed ? 50 : 38;
                  const th = isLarge ? 34 : isMed ? 28 : 24;
                  const n = Math.min(t.cap, 8), perSide = Math.ceil(n/2);
                  const chairs = [];
                  for (let i=0; i<n; i++) {
                    const side = i < perSide ? 0 : 1;
                    const idx  = side===0 ? i : i-perSide;
                    const spacing = tw/(perSide+1);
                    chairs.push([t.x - tw/2 + spacing*(idx+1), side===0 ? t.y-th/2-11 : t.y+th/2+11, side===0?0:180]);
                  }
                  return (
                    <g key={t.id}>
                      {chairs.map(([cx,cy,rot],ci)=>(
                        <g key={ci} transform={`translate(${cx},${cy}) rotate(${rot})`}>
                          <rect x="-7" y="-9" width="14" height="6" rx="3" fill={col+"30"} stroke={col} strokeWidth="1.2"/>
                          <rect x="-6" y="-2" width="12" height="8" rx="2" fill={col+"44"} stroke={col} strokeWidth="1.2"/>
                        </g>
                      ))}
                      <rect x={t.x-tw/2} y={t.y-th/2} width={tw} height={th} rx="7"
                        fill={col+"15"} stroke={col} strokeWidth="2"/>
                      {/* numero tavolo */}
                      <text x={t.x} y={t.y+(t.booking?-1:4)} textAnchor="middle"
                        fill={col} fontSize="11" fontWeight="bold" fontFamily="sans-serif">T{t.id}</text>
                      {/* nome cliente se prenotato */}
                      {t.booking && (
                        <text x={t.x} y={t.y+11} textAnchor="middle"
                          fill={col} fontSize="7" fontFamily="sans-serif" opacity="0.9">
                          {t.booking.name.split(" ")[0]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              {/* Legenda */}
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
                {[["Libero",T.green],["Prenotato",T.amber],["Occupato",T.red]].map(([l,c])=>(
                  <span key={l} style={{ fontSize: 11, color: T.muted, display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block" }}/>{l}
                  </span>
                ))}
              </div>
            </div>

            {/* Lista tavoli — FIX BUG: ora mostra le info prenotazione anche per il tavolo 1 */}
            <div>
              {tablesWithStatus.map(t => {
                const col = t.status === "free" ? T.green : t.status === "reserved" ? T.amber : T.red;
                const label = t.status === "free" ? "Libero" : t.status === "reserved" ? "Prenotato" : "Occupato";
                return (
                  <div key={t.id} style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderLeft: `3px solid ${col}`, borderRadius: 14,
                    padding: "14px 18px", marginBottom: 10,
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <p style={{ fontFamily: fontSerif, fontSize: 19, color: T.cream }}>
                          Tavolo {t.id}
                        </p>
                        <span style={{ fontSize: 11, color: T.muted }}>· {t.cap} posti · {t.shape === "circle" ? "Rotondo" : "Rettangolare"}</span>
                      </div>
                      {/* ── FIX: mostra info prenotazione su TUTTI i tavoli, incluso il tavolo 1 ── */}
                      {t.booking && (
                        <div style={{ marginTop: 6, padding: "8px 12px", background: col+"12", borderRadius: 8 }}>
                          <p style={{ fontSize: 13, color: T.creamDim }}>
                            👤 <strong style={{ color: T.cream }}>{t.booking.name}</strong>
                          </p>
                          <p style={{ fontSize: 12, color: T.mutedHi, marginTop: 2 }}>
                            {helpers.formatDate(t.booking.date)} · {t.booking.time} · {t.booking.people} {t.booking.people===1?"ospite":"ospiti"}
                          </p>
                          {t.booking.notes && (
                            <p style={{ fontSize: 11, color: T.amber, marginTop: 4 }}>📌 {t.booking.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 11, background: col+"20", color: col, padding: "5px 10px", borderRadius: 20, fontWeight: "700", whiteSpace: "nowrap", marginLeft: 10 }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "stats" && (
          <div className="fade-up">
            <h2 style={{ fontFamily: fontSerif, fontSize: 32, color: T.cream, marginBottom: 24 }}>Statistiche & Trend</h2>

            {/* Occupazione */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 22, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Occupazione Sala Corrente</p>
              {(() => {
                const total = tablesWithStatus.length;
                const free = tablesWithStatus.filter(t=>t.status==="free").length;
                const reserved = tablesWithStatus.filter(t=>t.status==="reserved").length;
                const occupied = tablesWithStatus.filter(t=>t.status==="occupied").length;
                const pct = Math.round(((reserved+occupied)/total)*100);
                return (
                  <>
                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                      {[["Liberi",free,T.green],["Prenotati",reserved,T.amber],["Occupati",occupied,T.red]].map(([l,v,c])=>(
                        <div key={l} style={{ flex:1, background:c+"14", border:`1px solid ${c}33`, borderRadius:14, padding:"14px 8px", textAlign:"center" }}>
                          <p style={{ fontFamily:fontSerif, fontSize:28, color:c }}>{v}</p>
                          <p style={{ fontSize:10, color:T.muted, marginTop:4, textTransform:"uppercase", letterSpacing:0.5 }}>{l}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:T.surfaceHi, borderRadius:8, height:8, overflow:"hidden" }}>
                      <div style={{ display:"flex", height:"100%" }}>
                        <div style={{ width:`${(occupied/total)*100}%`, background:T.red, transition:"0.5s" }}/>
                        <div style={{ width:`${(reserved/total)*100}%`, background:T.amber, transition:"0.5s" }}/>
                        <div style={{ flex:1, background:T.green+"44" }}/>
                      </div>
                    </div>
                    <p style={{ fontSize:13, color:T.mutedHi, marginTop:10, textAlign:"right" }}>
                      Sala occupata al <strong style={{ color:T.goldLight }}>{pct}%</strong>
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Timeline */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 22, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 18 }}>Timeline Prenotazioni</p>
              {SLOTS.map(slot => {
                const slotBookings = myBookings.filter(b => b.time === slot && b.status !== "rejected");
                return (
                  <div key={slot} style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:12 }}>
                    <div style={{ width:46, flexShrink:0, textAlign:"right" }}>
                      <span style={{ fontSize:13, color:slotBookings.length>0?T.goldLight:T.muted, fontWeight:slotBookings.length>0?"600":"400" }}>{slot}</span>
                    </div>
                    <div style={{ flex:1, borderLeft:`2px solid ${slotBookings.length>0?T.gold+"44":T.border}`, paddingLeft:14, minHeight:20 }}>
                      {slotBookings.length === 0
                        ? <span style={{ fontSize:12, color:T.border }}>—</span>
                        : slotBookings.map(b => (
                          <div key={b.id} style={{ background:T.goldDim, border:`1px solid ${T.gold}22`, borderRadius:8, padding:"6px 12px", marginBottom:5, display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontSize:13, color:T.cream, fontWeight:"500" }}>{b.name}</span>
                            <span style={{ fontSize:12, color:T.muted }}>T{b.table?.id} · {b.people}👥</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                );
              })}
            </div>

            {/* KPI riassunto */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { label:"Totale Prenotazioni", val:myBookings.length },
                { label:"Coperti Attesi", val:myBookings.reduce((s,b)=>s+parseInt(b.people),0) },
                { label:"Confermate", val:myBookings.filter(b=>b.status==="confirmed").length, color:T.green },
                { label:"Ricavo Stimato", val:`€${myBookings.filter(b=>b.status==="confirmed").length*48}`, color:T.goldLight },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background:T.surfaceHi, borderRadius:16, padding:"18px", border:`1px solid ${T.border}`, textAlign:"center" }}>
                  <p style={{ fontSize:30, fontFamily:fontSerif, color:color||T.goldLight }}>{val}</p>
                  <p style={{ fontSize:10, color:T.muted, marginTop:6, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "settings" && (
          <div className="fade-up">
            <h2 style={{ fontFamily: fontSerif, fontSize: 32, color: T.cream, marginBottom: 24 }}>Impostazioni Locale</h2>
            <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:26 }}>
              {[["Nome del Ristorante", "text", myRestaurant.name],["Città", "text", myRestaurant.city],["Capienza Massima", "number", myRestaurant.maxGuests]].map(([lbl,type,def])=>(
                <div key={lbl} style={{ marginBottom:18 }}>
                  <label style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, display:"block", marginBottom:8 }}>{lbl}</label>
                  <input type={type} defaultValue={def} />
                </div>
              ))}
              <div style={{ marginBottom:24 }}>
                <label style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, display:"block", marginBottom:8 }}>Descrizione Pubblica</label>
                <textarea rows="4" defaultValue={myRestaurant.desc} style={{ resize:"none" }}></textarea>
              </div>
              <button style={{ width:"100%", padding:"16px", borderRadius:14, background:`linear-gradient(135deg,${T.gold},#a87a28)`, color:T.bg, border:"none", cursor:"pointer", fontSize:15, fontWeight:"700", boxShadow:`0 8px 24px rgba(201,168,76,0.2)` }}>
                Salva Modifiche
              </button>
            </div>
          </div>
        )}
      </main>

      <nav style={{ position:"fixed", bottom:0, width:"100%", background:`rgba(10,8,4,0.92)`, backdropFilter:"blur(16px)", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-around", padding:"14px 0 18px", zIndex:2000 }}>
        {[["dashboard","📋","Prenotazioni"],["tables","🪑","Sala"],["stats","📈","Report"],["settings","⚙️","Impostazioni"]].map(([v,icon,label])=>(
          <NavBtn key={v} active={view===v} icon={icon} label={label} onClick={()=>setView(v)} />
        ))}
      </nav>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* 7. CUSTOMER APP                                                */
/* ══════════════════════════════════════════════════════════════ */

function CustomerApp({ user, onLogout, bookings, setBookings, restaurants, setRestaurants }) {
  const [view, setView]               = useState("list");
  const [restaurant, setRestaurant]   = useState(null);
  const [step, setStep]               = useState(0);
  const [selTable, setSelTable]       = useState(null);
  const [lastBookingId, setLastBookingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm]               = useState({ date:"", time:"", people:2, eventType:"pasto", allergies:"", extra:"" });
  const [errors, setErrors]           = useState({});

  const validateStep1 = () => {
    const e = {};
    if (!form.date)  e.date  = "Seleziona una data.";
    if (!form.time)  e.time  = "Seleziona un orario.";
    if (form.people > restaurant.maxGuests) e.people = `Massimo ${restaurant.maxGuests} persone per prenotazione.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    const bId = helpers.generateId();
    setBookings([{ id:bId, name:user.name, table:selTable, restaurant, status:"confirmed", ...form }, ...bookings]);
    setRestaurants(prev => prev.map(r => {
      if (r.id !== restaurant.id) return r;
      return { ...r, tables: r.tables.map(t => t.id === selTable.id ? {...t, status:"reserved"} : t) };
    }));
    setLastBookingId(bId);
    setStep(4);
  };

  const openRestaurant = (r) => {
    setRestaurant(r); setStep(1); setSelTable(null);
    setForm({ date:"", time:"", people:2, eventType:"pasto", allergies:"", extra:"" });
    setErrors({});
  };

  const goBack = () => {
    if (step > 1 && step < 4) { setStep(s => s-1); setSelTable(null); }
    else { setRestaurant(null); setStep(0); }
  };

  // ── WIZARD ──
  if (restaurant) {
    return (
      <div style={{ minHeight:"100vh", background:`radial-gradient(ellipse at 50% -20%, rgba(201,168,76,0.04) 0%, transparent 50%), ${T.bg}`, paddingBottom:40 }}>
        <TopBar user={user} onLogout={onLogout} backLabel={step<4?"Indietro":null} onBack={step<4?goBack:null} />
        <main style={{ maxWidth:500, margin:"0 auto", padding:"24px 20px" }}>
          {step < 4 && <StepProgress current={step} steps={["Dettagli","Scegli Tavolo","Riepilogo"]} />}

          {step === 1 && (
            <div className="fade-up">
              <RestaurantMini r={restaurant} />
              <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:12 }}>

                {/* DATA */}
                <div style={{ background:T.surface, border:`1px solid ${errors.date?T.red:T.border}`, borderRadius:16, overflow:"hidden" }}>
                  <label style={{ display:"block", fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, padding:"14px 18px 4px" }}>📅 Data della visita</label>
                  <input type="date" min={helpers.today()} value={form.date}
                    onChange={e=>setForm({...form, date:e.target.value})}
                    style={{ background:"transparent", border:"none", boxShadow:"none", color:form.date?T.cream:T.muted, fontSize:18, fontWeight:"500", padding:"4px 18px 14px", width:"100%", borderRadius:0 }} />
                  {errors.date && <p style={{ fontSize:12, color:T.red, padding:"0 18px 10px" }}>⚠ {errors.date}</p>}
                </div>

                {/* ORARIO */}
                <div style={{ background:T.surface, border:`1px solid ${errors.time?T.red:T.border}`, borderRadius:16, padding:"14px 18px" }}>
                  <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>🕐 Orario desiderato</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {SLOTS.map(s => (
                      <button key={s} onClick={() => setForm({...form, time:s})} style={{
                        padding:"10px 14px", borderRadius:10,
                        border:`1px solid ${form.time===s?T.gold:T.borderHi}`,
                        background:form.time===s?T.goldDim:T.surfaceHi,
                        color:form.time===s?T.goldLight:T.mutedHi,
                        fontSize:14, fontWeight:form.time===s?"700":"400",
                        cursor:"pointer", transition:"0.15s",
                      }}>{s}</button>
                    ))}
                  </div>
                  {errors.time && <p style={{ fontSize:12, color:T.red, marginTop:8 }}>⚠ {errors.time}</p>}
                </div>

                {/* OSPITI */}
                <div style={{ background:T.surface, border:`1px solid ${errors.people?T.red:T.border}`, borderRadius:16, padding:"14px 18px" }}>
                  <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>👥 Numero di Ospiti</p>
                  <GuestCounter value={form.people} min={restaurant.minGuests} max={restaurant.maxGuests} onChange={v=>setForm({...form, people:v})} />
                  {errors.people
                    ? <p style={{ fontSize:12, color:T.red, marginTop:8 }}>⚠ {errors.people}</p>
                    : <p style={{ fontSize:12, color:T.muted, marginTop:8 }}>Min {restaurant.minGuests} · Max {restaurant.maxGuests} ospiti per prenotazione</p>
                  }
                </div>

                {/* TIPO EVENTO */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"14px 18px" }}>
                  <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>✨ Occasione</p>
                  <div style={{ display:"flex", gap:10 }}>
                    {[["pasto","🍽 Cena / Pranzo"],["festa","🥂 Ricorrenza Speciale"]].map(([val,label])=>(
                      <button key={val} onClick={()=>setForm({...form, eventType:val})} style={{
                        flex:1, padding:"12px 8px", borderRadius:12,
                        border:`1px solid ${form.eventType===val?T.gold:T.borderHi}`,
                        background:form.eventType===val?T.goldDim:T.surfaceHi,
                        color:form.eventType===val?T.goldLight:T.mutedHi,
                        fontSize:13, fontWeight:form.eventType===val?"700":"400",
                        cursor:"pointer", transition:"0.15s",
                      }}>{label}</button>
                    ))}
                  </div>
                </div>

                {/* ALLERGIE */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"14px 18px" }}>
                  <label style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, display:"block", marginBottom:10 }}>⚠ Allergie e Intolleranze</label>
                  <input placeholder="Es: Glutine, Lattosio, Frutta secca, Crostacei…"
                    value={form.allergies} onChange={e=>setForm({...form, allergies:e.target.value})}
                    style={{ background:T.surfaceHi, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 14px", fontSize:14, color:T.cream, width:"100%" }} />
                  <p style={{ fontSize:11, color:T.muted, marginTop:6 }}>Queste informazioni saranno comunicate direttamente allo chef.</p>
                </div>

                {/* NOTE */}
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"14px 18px" }}>
                  <label style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, display:"block", marginBottom:4 }}>📝 Richieste Speciali</label>
                  <p style={{ fontSize:11, color:T.muted, marginBottom:10 }}>Seggiolone, posto defilato, tavolo all'aperto, candele, torta, fiori, vista…</p>
                  <textarea rows="3" placeholder="Siamo qui per rendere la tua serata perfetta. Scrivici ogni dettaglio."
                    value={form.extra} onChange={e=>setForm({...form, extra:e.target.value})}
                    style={{ background:T.surfaceHi, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 14px", fontSize:14, color:T.cream, width:"100%", resize:"none" }} />
                </div>
              </div>

              <button onClick={()=>validateStep1()&&setStep(2)} style={{
                marginTop:24, width:"100%", padding:"18px 24px", borderRadius:14,
                background:`linear-gradient(135deg,${T.gold},#a87a28)`, color:T.bg, border:"none",
                cursor:"pointer", fontSize:16, fontWeight:"700", letterSpacing:0.5,
                boxShadow:`0 8px 28px rgba(201,168,76,0.25)`,
              }}>
                Scegli il Tuo Tavolo in Sala →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-up">
              <RestaurantMini r={restaurant} />
              <div style={{ marginTop:20, background:"#05040300", border:`1px solid ${T.border}`, borderRadius:20, padding:"20px 12px" }}>
                <p style={{ fontSize:13, color:T.muted, textAlign:"center", marginBottom:16 }}>
                  Tocca un tavolo <span style={{ color:T.green, fontWeight:"600" }}>verde</span> per selezionarlo · {form.people} {form.people===1?"persona":"persone"}
                </p>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, ${T.border} 1px, transparent 1px)`, backgroundSize:"30px 30px", opacity:0.3, pointerEvents:"none" }}/>
                  <svg width="100%" viewBox="0 0 340 320" style={{ display:"block" }}>
                    {restaurants.find(r=>r.id===restaurant.id)?.tables.map(t => {
                      const isSelected = selTable?.id === t.id;
                      const available  = t.status === "free" && t.cap >= form.people;
                      const col = isSelected ? T.gold : available ? T.green : t.status === "reserved" ? T.amber : T.red;
                      const opacity = available || isSelected ? 1 : 0.4;
                      const isLarge = t.cap >= 6, isMed = t.cap >= 4 && t.cap < 6;
                      const tw = isLarge ? 62 : isMed ? 50 : 38;
                      const th = isLarge ? 34 : isMed ? 28 : 24;
                      const n = Math.min(t.cap,8), perSide = Math.ceil(n/2);
                      const chairs = [];
                      for (let i=0;i<n;i++) {
                        const side = i<perSide?0:1, idx=side===0?i:i-perSide, spacing=tw/(perSide+1);
                        chairs.push([t.x-tw/2+spacing*(idx+1), side===0?t.y-th/2-11:t.y+th/2+11, side===0?0:180]);
                      }
                      return (
                        <g key={t.id} onClick={()=>available&&setSelTable(t)} style={{ cursor:available?"pointer":"default", opacity }}>
                          {chairs.map(([cx,cy,rot],ci)=>(
                            <g key={ci} transform={`translate(${cx},${cy}) rotate(${rot})`}>
                              <rect x="-7" y="-9" width="14" height="6" rx="3" fill={col+"30"} stroke={col} strokeWidth="1.2"/>
                              <rect x="-6" y="-2" width="12" height="8" rx="2" fill={col+"44"} stroke={col} strokeWidth="1.2"/>
                            </g>
                          ))}
                          <rect x={t.x-tw/2} y={t.y-th/2} width={tw} height={th} rx="7"
                            fill={isSelected?T.goldDim:col+"18"} stroke={isSelected?T.gold:col} strokeWidth={isSelected?2.5:1.5}/>
                          {isSelected && <rect x={t.x-tw/2-2} y={t.y-th/2-2} width={tw+4} height={th+4} rx="9" fill="none" stroke={T.gold} strokeWidth="1" opacity="0.4"/>}
                          <text x={t.x} y={t.y+4} textAnchor="middle" fill={isSelected?T.gold:col} fontSize="11" fontWeight="bold" fontFamily="sans-serif">{t.id}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Legenda */}
                <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:14, flexWrap:"wrap" }}>
                  {[["Disponibile",T.green],["Prenotato",T.amber],["Occupato",T.red],["Selezionato",T.gold]].map(([label,c])=>(
                    <span key={label} style={{ fontSize:11, color:T.muted, display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block" }}/>{label}
                    </span>
                  ))}
                </div>

                {selTable && (
                  <div className="fade-in" style={{ marginTop:14, background:T.goldDim, border:`1px solid ${T.gold}44`, borderRadius:12, padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <p style={{ fontSize:14, color:T.goldLight, fontWeight:"700" }}>✓ Tavolo {selTable.id} selezionato</p>
                      <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>{selTable.cap} posti · {selTable.shape === "circle" ? "Tavolo rotondo" : "Tavolo rettangolare"}</p>
                    </div>
                    <span style={{ fontSize:22, fontFamily:fontSerif, color:T.gold }}>{selTable.id}</span>
                  </div>
                )}
              </div>
              <button disabled={!selTable} onClick={()=>setStep(3)} style={{
                marginTop:20, width:"100%", padding:"18px", borderRadius:14,
                background:selTable?`linear-gradient(135deg,${T.gold},#a87a28)`:T.surfaceHi,
                color:selTable?T.bg:T.muted, border:"none", cursor:selTable?"pointer":"not-allowed",
                fontSize:16, fontWeight:"700", transition:"0.2s",
                boxShadow:selTable?`0 8px 28px rgba(201,168,76,0.25)`:"none",
              }}>
                Procedi al Riepilogo →
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="fade-up">
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:"28px 24px" }}>
                <h3 style={{ fontFamily:fontSerif, fontSize:28, color:T.goldLight, marginBottom:6 }}>Riepilogo Prenotazione</h3>
                <p style={{ fontSize:13, color:T.muted, marginBottom:24 }}>Controlla i dettagli prima di confermare</p>
                <div style={{ borderTop:`1px solid ${T.border}` }}>
                  {[
                    ["Locale", restaurant.name],
                    ["Data", helpers.formatDate(form.date)],
                    ["Orario", form.time],
                    ["Tavolo", `Numero ${selTable?.id} · ${selTable?.cap} posti`],
                    ["Ospiti", `${form.people} ${form.people===1?"persona":"persone"}`],
                    ["Occasione", form.eventType === "pasto" ? "Cena / Pranzo" : "Ricorrenza Speciale"],
                    ...(form.allergies ? [["Allergie / Intolleranze", form.allergies, T.amber]] : []),
                    ...(form.extra ? [["Richieste Speciali", form.extra]] : []),
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:13, color:T.muted }}>{label}</span>
                      <span style={{ fontSize:14, color:color||T.cream, fontWeight:"500", textAlign:"right", maxWidth:"55%" }}>{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleConfirm} style={{
                  marginTop:28, width:"100%", padding:"18px", borderRadius:14,
                  background:`linear-gradient(135deg,${T.gold},#a87a28)`,
                  color:T.bg, border:"none", cursor:"pointer", fontSize:16, fontWeight:"700",
                  boxShadow:`0 8px 28px rgba(201,168,76,0.3)`,
                }}>
                  Conferma e Prenota ✓
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="fade-up" style={{ textAlign:"center", padding:"60px 0 40px" }}>
              <div className="pulse" style={{ fontSize:72, marginBottom:24 }}>🥂</div>
              <h2 style={{ fontFamily:fontSerif, fontSize:44, color:T.gold, marginBottom:10 }}>Tavolo Riservato!</h2>
              <p style={{ color:T.mutedHi, fontSize:16, marginBottom:14, lineHeight:1.7 }}>
                La tua prenotazione da <strong style={{ color:T.cream }}>{restaurant.name}</strong> è confermata.<br/>
                Ci vediamo il {helpers.formatDate(form.date)} alle {form.time}.
              </p>
              <p style={{ fontSize:13, color:T.muted, marginBottom:36 }}>
                Porta questo codice o mostralo all'ingresso.
              </p>
              <div className="glow-anim" style={{ border:`1px dashed ${T.gold}`, padding:"28px 32px", borderRadius:20, display:"inline-block", background:T.surface, marginBottom:40 }}>
                <p style={{ fontSize:11, color:T.muted, letterSpacing:3, textTransform:"uppercase" }}>Codice Prenotazione</p>
                <p style={{ fontSize:40, color:T.goldLight, fontWeight:"700", marginTop:10, letterSpacing:6, fontFamily:fontSerif }}>{lastBookingId}</p>
              </div>
              <br/>
              <button onClick={()=>{ setRestaurant(null); setStep(0); setView("bookings"); }} style={{
                padding:"16px 28px", borderRadius:14, background:T.surfaceHi, border:`1px solid ${T.border}`,
                color:T.mutedHi, cursor:"pointer", fontSize:15, fontWeight:"500",
              }}>
                Vai alle mie prenotazioni
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── VISTE PRINCIPALI ──
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.features.some(f=>f.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight:"100vh", paddingBottom:100, background:`radial-gradient(ellipse at 50% -20%, rgba(201,168,76,0.05) 0%, transparent 50%), ${T.bg}` }}>
      <TopBar user={user} onLogout={onLogout} />
      <main style={{ maxWidth:500, margin:"0 auto", padding:"20px 20px" }}>

        {view === "list" && (
          <div className="fade-up">
            {/* Hero */}
            <div style={{ marginBottom:28 }}>
              <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:3, marginBottom:4 }}>Benvenuto/a</p>
              <h1 style={{ fontFamily:fontSerif, fontSize:38, color:T.cream, lineHeight:1.1, marginBottom:8 }}>
                Dove vuoi<br/><em style={{ color:T.goldLight }}>cenare stasera?</em>
              </h1>
              <p style={{ fontSize:14, color:T.muted, lineHeight:1.6 }}>
                Le migliori tavole della Puglia, prenotabili in pochi tocchi.
              </p>
            </div>
            <div style={{ position:"relative", marginBottom:28 }}>
              <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", fontSize:16, color:T.muted, pointerEvents:"none" }}>🔍</span>
              <input placeholder="Cerca ristorante, città, cucina, esterno…"
                value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                style={{ paddingLeft:44 }} />
            </div>
            {filteredRestaurants.length === 0
              ? <EmptyState icon="🔍" title="Nessun risultato trovato" sub={`Nessun locale corrisponde a "${searchQuery}". Prova con un altro termine.`} />
              : filteredRestaurants.map((r,i) => <RestaurantCard key={r.id} r={r} onClick={()=>openRestaurant(r)} delay={i*0.06} />)
            }
          </div>
        )}

        {view === "map" && (
          <div className="fade-up">
            <h2 style={{ fontFamily:fontSerif, fontSize:32, color:T.cream, marginBottom:8 }}>Mappa del Gusto</h2>
            <p style={{ fontSize:13, color:T.muted, marginBottom:20 }}>Scopri i nostri locali nel territorio pugliese</p>
            <div style={{ height:"68vh", borderRadius:24, overflow:"hidden", border:`1px solid ${T.border}`, boxShadow:`0 20px 60px rgba(0,0,0,0.4)` }}>
              <MapContainer center={[41.0,17.0]} zoom={9} style={{ height:"100%", width:"100%" }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {restaurants.map(r => (
                  <Marker key={r.id} position={[r.lat,r.lng]} icon={GoldIcon}>
                    <Popup>
                      <div style={{ textAlign:"center", padding:6 }}>
                        <strong style={{ color:T.gold, fontSize:16, fontFamily:fontSerif }}>{r.name}</strong><br/>
                        <span style={{ fontSize:12, color:T.mutedHi }}>{r.tag}</span><br/>
                        <span style={{ fontSize:12, color:T.muted }}>⭐ {r.rating} · {r.priceRange}</span><br/>
                        <button onClick={()=>openRestaurant(r)} style={{ marginTop:12, background:T.gold, color:T.bg, border:"none", padding:"9px 18px", borderRadius:10, cursor:"pointer", fontWeight:"700", width:"100%", fontSize:13 }}>
                          Prenota ora
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {view === "events" && <EventsView user={user} />}

        {view === "bookings" && (
          <div className="fade-up">
            <h2 style={{ fontFamily:fontSerif, fontSize:32, color:T.cream, marginBottom:24 }}>Le mie Prenotazioni</h2>
            {bookings.filter(b=>b.name===user.name).length === 0 ? (
              <EmptyState icon="🍽" title="Nessun tavolo riservato" sub="Sfoglia i locali, scegli la data e il tavolo che preferisci. La tua prossima cena indimenticabile ti aspetta." />
            ) : (
              <>
                {bookings.filter(b=>b.name===user.name).map((b,i) => {
                  const isConfirmed = b.status === "confirmed";
                  const isPending   = b.status === "pending";
                  const badgeColor  = isConfirmed ? T.green : isPending ? T.amber : T.red;
                  const badgeLabel  = isConfirmed ? "CONFERMATA" : isPending ? "IN ATTESA" : "RIFIUTATA";
                  return (
                    <div key={b.id} className="fade-up" style={{ animationDelay:`${i*0.06}s`, background:T.surface, border:`1px solid ${T.border}`, borderLeft:`3px solid ${badgeColor}`, borderRadius:18, padding:"20px 22px", marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                        <div>
                          <p style={{ fontFamily:fontSerif, fontSize:22, color:T.goldLight }}>{b.restaurant.name}</p>
                          <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>{b.restaurant.city} · {b.restaurant.tag}</p>
                        </div>
                        <span style={{ fontSize:10, background:badgeColor+"20", color:badgeColor, padding:"5px 10px", borderRadius:20, fontWeight:"700" }}>{badgeLabel}</span>
                      </div>
                      <div style={{ background:T.surfaceHi, padding:"14px 16px", borderRadius:12, border:`1px solid ${T.border}` }}>
                        <p style={{ fontSize:14, marginBottom:6, color:T.creamDim }}>🗓 {helpers.formatDate(b.date)} · {b.time}</p>
                        <p style={{ fontSize:14, color:T.creamDim }}>🪑 Tavolo {b.table?.id ?? b.table} · 👥 {b.people} {b.people===1?"Ospite":"Ospiti"}</p>
                        {b.notes && <p style={{ fontSize:13, color:T.amber, marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}` }}>📌 {b.notes}</p>}
                      </div>
                      {b.status === "rejected" && (
                        <p style={{ fontSize:13, color:T.muted, marginTop:12, textAlign:"center", fontStyle:"italic" }}>Questa prenotazione non è stata accettata dal locale. Prova a scegliere un altro orario.</p>
                      )}
                    </div>
                  );
                })}

                {/* Mappa tavoli attivi */}
                {bookings.filter(b=>b.name===user.name&&b.status!=="rejected").length > 0 && (
                  <div style={{ marginTop:32 }}>
                    <h3 style={{ fontFamily:fontSerif, fontSize:22, color:T.cream, marginBottom:16 }}>Tavoli Attivi per Locale</h3>
                    {INITIAL_RESTAURANTS.map(r => {
                      const rBookings = bookings.filter(b=>b.name===user.name&&b.restaurant?.id===r.id&&b.status!=="rejected");
                      if (rBookings.length === 0) return null;
                      const updatedR = restaurants.find(x=>x.id===r.id)||r;
                      return (
                        <div key={r.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:"20px 16px", marginBottom:14 }}>
                          <p style={{ fontFamily:fontSerif, fontSize:20, color:T.goldLight, marginBottom:14 }}>{r.name}</p>
                          <svg width="100%" viewBox="0 0 340 310" style={{ display:"block" }}>
                            {updatedR.tables.map(t => {
                              const myB = rBookings.find(b=>(b.table?.id===t.id||b.table===t.id));
                              const isMine = !!myB;
                              const c = isMine ? (myB.status==="confirmed"?T.gold:T.amber) : (t.status==="free"?T.green:T.red);
                              return (
                                <g key={t.id}>
                                  {t.shape==="circle"
                                    ? <circle cx={t.x} cy={t.y} r={22} fill={c+"28"} stroke={c} strokeWidth={isMine?2.5:1.5}/>
                                    : <rect x={t.x-28} y={t.y-16} width={56} height={32} rx={8} fill={c+"28"} stroke={c} strokeWidth={isMine?2.5:1.5}/>
                                  }
                                  {isMine && (t.shape==="circle"
                                    ? <circle cx={t.x} cy={t.y} r={26} fill="none" stroke={c} strokeWidth="1" opacity="0.3"/>
                                    : <rect x={t.x-32} y={t.y-20} width={64} height={40} rx={10} fill="none" stroke={c} strokeWidth="1" opacity="0.3"/>
                                  )}
                                  <text x={t.x} y={t.y+4} textAnchor="middle" fill={isMine?T.goldLight:c} fontSize="12" fontWeight="bold">{t.id}</text>
                                </g>
                              );
                            })}
                          </svg>
                          <div style={{ display:"flex", gap:16, marginTop:8, flexWrap:"wrap" }}>
                            <span style={{ fontSize:11, color:T.muted }}><span style={{ color:T.gold }}>●</span> Il mio tavolo</span>
                            <span style={{ fontSize:11, color:T.muted }}><span style={{ color:T.green }}>●</span> Libero</span>
                            <span style={{ fontSize:11, color:T.muted }}><span style={{ color:T.red }}>●</span> Occupato</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === "stats" && (
          <div className="fade-up">
            <h2 style={{ fontFamily:fontSerif, fontSize:32, color:T.cream, marginBottom:24 }}>Il mio Profilo</h2>

            {/* Level card */}
            {(() => {
              const myBks = bookings.filter(b=>b.name===user.name);
              const count = myBks.length;
              const level = count>=10?"Platinum":count>=5?"Gold":count>=2?"Silver":"Bronze";
              const levelColor = level==="Platinum"?"#b8d4f0":level==="Gold"?T.gold:level==="Silver"?"#c0c8d0":"#cd7f32";
              const nextLevel = count>=10?null:count>=5?"Platinum":count>=2?"Gold":"Silver";
              const nextAt = count>=10?10:count>=5?10:count>=2?5:2;
              const pct = Math.min(100,Math.round((count/nextAt)*100));
              return (
                <div style={{ background:`linear-gradient(135deg, ${levelColor}18 0%, transparent 100%)`, border:`1px solid ${levelColor}44`, borderRadius:22, padding:"24px 22px", marginBottom:28 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div>
                      <p style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:2 }}>Livello Fedeltà</p>
                      <p style={{ fontFamily:fontSerif, fontSize:38, color:levelColor, marginTop:2 }}>{level}</p>
                      <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>
                        {level==="Bronze"?"Inizia il tuo viaggio gastronomico":level==="Silver"?"Buongustaio in ascesa":level==="Gold"?"Ospite d'onore delle migliori tavole":"Il migliore amico della cucina pugliese"}
                      </p>
                    </div>
                    <div style={{ fontSize:48 }}>{level==="Platinum"?"💎":level==="Gold"?"🥇":level==="Silver"?"🥈":"🥉"}</div>
                  </div>
                  {nextLevel && (
                    <>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:12, color:T.muted }}>Verso il livello {nextLevel}</span>
                        <span style={{ fontSize:12, color:T.muted }}>{count} / {nextAt} prenotazioni</span>
                      </div>
                      <div style={{ background:T.surfaceHi, borderRadius:6, height:6, overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg, ${levelColor}, ${levelColor}aa)`, borderRadius:6, transition:"0.6s" }}/>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
              {[
                { label:"Prenotazioni", val:bookings.filter(b=>b.name===user.name).length },
                { label:"Locali Scoperti", val:new Set(bookings.filter(b=>b.name===user.name).map(b=>b.restaurant.id)).size },
                { label:"Ospiti Portati", val:bookings.filter(b=>b.name===user.name).reduce((s,b)=>s+parseInt(b.people),0) },
                { label:"Confermate", val:bookings.filter(b=>b.name===user.name&&b.status==="confirmed").length, color:T.green },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background:T.surfaceHi, borderRadius:16, padding:"18px", border:`1px solid ${T.border}`, textAlign:"center" }}>
                  <p style={{ fontSize:30, fontFamily:fontSerif, color:color||T.goldLight }}>{val}</p>
                  <p style={{ fontSize:10, color:T.muted, marginTop:6, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</p>
                </div>
              ))}
            </div>

            <button onClick={onLogout} style={{ width:"100%", padding:"16px", borderRadius:14, background:"none", border:`1px solid ${T.red}44`, color:T.red, cursor:"pointer", fontSize:14, fontWeight:"600" }}>
              Disconnetti Account
            </button>
          </div>
        )}
      </main>

      <nav style={{ position:"fixed", bottom:0, width:"100%", background:`rgba(8,6,4,0.94)`, backdropFilter:"blur(20px)", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-around", padding:"12px 0 18px", zIndex:2000 }}>
        {[["list","◈","Locali"],["map","📍","Mappa"],["events","✦","Eventi"],["bookings","◷","Tavoli"],["stats","◉","Profilo"]].map(([v,icon,label])=>(
          <NavBtn key={v} active={view===v} icon={icon} label={label} onClick={()=>setView(v)} />
        ))}
      </nav>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* 8. EVENTS VIEW                                                 */
/* ══════════════════════════════════════════════════════════════ */

function EventsView({ user }) {
  const [selectedEvent, setSelectedEvent]   = useState(null);
  const [inviteForm, setInviteForm]         = useState({ name:user?.name||"", email:user?.email||"", note:"" });
  const [inviteSent, setInviteSent]         = useState(false);
  const [sentEvents, setSentEvents]         = useState([]);

  const openModal = (ev) => {
    setSelectedEvent(ev);
    setInviteSent(false);
    setInviteForm({ name:user?.name||"", email:user?.email||"", note:"" });
  };
  const sendInvite = () => { setSentEvents(prev=>[...prev, selectedEvent.id]); setInviteSent(true); };

  const TAG_COLORS = {
    "Musica Live":    { bg:"rgba(138,99,210,0.14)", color:"#c4a0ff" },
    "Food Experience":{ bg:"rgba(74,173,122,0.14)", color:"#5ec99a" },
    "Esperienza":     { bg:"rgba(201,168,76,0.14)", color:"#e8c97e" },
  };

  return (
    <div className="fade-up">
      {/* MODAL */}
      {selectedEvent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:5000, display:"flex", alignItems:"flex-end" }} onClick={()=>setSelectedEvent(null)}>
          <div onClick={e=>e.stopPropagation()} className="slide-up" style={{ background:T.surface, border:`1px solid ${T.borderHi}`, borderRadius:"28px 28px 0 0", padding:"32px 24px 52px", width:"100%", maxWidth:500, margin:"0 auto", boxShadow:"0 -20px 60px rgba(0,0,0,0.6)" }}>
            {!inviteSent ? (
              <>
                <div style={{ width:40, height:4, background:T.border, borderRadius:2, margin:"0 auto 28px" }}/>
                <div style={{ textAlign:"center", marginBottom:24 }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>{selectedEvent.emoji}</p>
                  <h3 style={{ fontFamily:fontSerif, fontSize:28, color:T.goldLight, marginBottom:6 }}>{selectedEvent.title}</h3>
                  <p style={{ fontSize:13, color:T.muted }}>📍 {selectedEvent.loc} · 🗓 {helpers.formatDate(selectedEvent.date)}</p>
                </div>
                <div style={{ background:T.surfaceHi, borderRadius:14, padding:"16px 18px", marginBottom:22, border:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:14, color:T.mutedHi, lineHeight:1.7 }}>{selectedEvent.desc}</p>
                  <p style={{ fontSize:13, color:T.amber, marginTop:12, fontWeight:"600" }}>🎟 Solo {selectedEvent.spots} posti disponibili · Posti esauriti non saranno ripristinati</p>
                </div>
                {[["Nome Completo","text","Il tuo nome completo","name"],["Email di contatto","email","nome@email.com","email"]].map(([label,type,ph,key])=>(
                  <div key={key} style={{ marginBottom:14 }}>
                    <label style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, display:"block", marginBottom:8 }}>{label}</label>
                    <input type={type} placeholder={ph} value={inviteForm[key]} onChange={e=>setInviteForm({...inviteForm, [key]:e.target.value})} />
                  </div>
                ))}
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.5, display:"block", marginBottom:8 }}>Note (facoltativo)</label>
                  <input placeholder="Es: siamo in 2, allergie, richieste particolari…" value={inviteForm.note} onChange={e=>setInviteForm({...inviteForm, note:e.target.value})} />
                </div>
                <button onClick={sendInvite} disabled={!inviteForm.name||!inviteForm.email} style={{
                  width:"100%", padding:"17px", borderRadius:14,
                  background:`linear-gradient(135deg,${T.gold},#a87a28)`, color:T.bg, border:"none",
                  cursor:inviteForm.name&&inviteForm.email?"pointer":"not-allowed",
                  opacity:inviteForm.name&&inviteForm.email?1:0.6,
                  fontSize:15, fontWeight:"700",
                }}>Invia Richiesta di Partecipazione</button>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"30px 0" }}>
                <div className="pulse" style={{ fontSize:64, marginBottom:20 }}>✉️</div>
                <h3 style={{ fontFamily:fontSerif, fontSize:32, color:T.gold, marginBottom:12 }}>Richiesta Inviata!</h3>
                <p style={{ fontSize:15, color:T.mutedHi, lineHeight:1.7, marginBottom:30 }}>
                  Riceverai una conferma all'indirizzo<br/>
                  <strong style={{ color:T.cream }}>{inviteForm.email}</strong><br/>
                  entro 24 ore dall'evento.
                </p>
                <button onClick={()=>setSelectedEvent(null)} style={{ padding:"14px 28px", borderRadius:14, background:T.surfaceHi, border:`1px solid ${T.border}`, color:T.mutedHi, cursor:"pointer", fontSize:15 }}>Chiudi</button>
              </div>
            )}
          </div>
        </div>
      )}

      <h2 style={{ fontFamily:fontSerif, fontSize:32, color:T.cream, marginBottom:8 }}>Serate & Esperienze</h2>
      <p style={{ fontSize:14, color:T.muted, marginBottom:28, lineHeight:1.6 }}>
        Momenti curati nei dettagli, organizzati dai nostri locali partner. Degustazioni guidate, musica live, esperienze nella natura. Solo per chi sa che una cena può diventare un ricordo.
      </p>

      {EVENTS.map((ev,i) => {
        const tc = TAG_COLORS[ev.tag] || { bg:T.goldDim, color:T.gold };
        const alreadySent = sentEvents.includes(ev.id);
        return (
          <div key={ev.id} className="fade-up" style={{ animationDelay:`${i*0.08}s`, marginBottom:20, background:T.surface, border:`1px solid ${T.border}`, borderRadius:22, overflow:"hidden" }}>
            <div style={{ background:`linear-gradient(135deg, ${tc.bg} 0%, transparent 60%)`, padding:"22px 22px 16px", borderBottom:`1px solid ${T.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <span style={{ fontSize:10, background:tc.bg, color:tc.color, padding:"4px 12px", borderRadius:20, fontWeight:"700", letterSpacing:0.8 }}>{ev.tag}</span>
                <span style={{ fontSize:30 }}>{ev.emoji}</span>
              </div>
              <h3 style={{ fontFamily:fontSerif, fontSize:26, color:T.cream, marginTop:10 }}>{ev.title}</h3>
            </div>
            <div style={{ padding:"16px 22px 22px" }}>
              <div style={{ display:"flex", gap:18, marginBottom:14 }}>
                <span style={{ fontSize:13, color:T.muted }}>📍 {ev.loc}</span>
                <span style={{ fontSize:13, color:T.muted }}>🗓 {helpers.formatDate(ev.date)}</span>
              </div>
              <p style={{ fontSize:14, color:T.mutedHi, lineHeight:1.7, marginBottom:18 }}>{ev.desc}</p>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:T.amber, fontWeight:"600" }}>🎟 {ev.spots} posti disponibili</span>
                {alreadySent
                  ? <span style={{ fontSize:13, color:T.green, fontWeight:"600" }}>✓ Richiesta inviata</span>
                  : <button onClick={()=>openModal(ev)} style={{ background:`linear-gradient(135deg,${T.gold},#a87a28)`, color:T.bg, border:"none", borderRadius:12, padding:"10px 20px", fontSize:14, fontWeight:"700", cursor:"pointer" }}>Richiedi Invito</button>
                }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* 9. COMPONENTI ATOMICI                                          */
/* ══════════════════════════════════════════════════════════════ */

function TopBar({ user, onLogout, backLabel, onBack, title }) {
  return (
    <header style={{
      position:"sticky", top:0, zIndex:100,
      background:"rgba(8,6,4,0.88)", backdropFilter:"blur(14px)",
      borderBottom:`1px solid ${T.border}`,
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"16px 20px",
    }}>
      {onBack
        ? <button onClick={onBack} style={{ background:"none", border:"none", color:T.goldLight, cursor:"pointer", fontSize:15, fontWeight:"600" }}>← {backLabel||"Indietro"}</button>
        : <span style={{ fontFamily:fontSerif, fontSize:26, color:T.gold, letterSpacing:1 }}>{title||"Tavolify"}</span>
      }
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:13, color:T.cream, fontWeight:"500" }}>{user?.name}</p>
          <p style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:0.5 }}>{user?.role}</p>
        </div>
        <button onClick={onLogout} style={{ background:T.surfaceHi, border:`1px solid ${T.border}`, color:T.muted, fontSize:10, padding:"8px 12px", borderRadius:8, cursor:"pointer", letterSpacing:0.5 }}>ESCI</button>
      </div>
    </header>
  );
}

function NavBtn({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", color:active?T.gold:T.muted, padding:"0 8px" }}>
      <span style={{ fontSize:active?22:20, transition:"font-size 0.2s" }}>{icon}</span>
      <span style={{ fontSize:9, textTransform:"uppercase", fontWeight:active?"700":"400", letterSpacing:1, transition:"color 0.2s" }}>{label}</span>
      {active && <div style={{ width:4, height:4, borderRadius:"50%", background:T.gold, marginTop:-2 }}/>}
    </button>
  );
}

function RestaurantCard({ r, onClick, delay=0 }) {
  const freeTables = r.tables.filter(t=>t.status==="free").length;
  const totalTables = r.tables.length;
  const availColor = freeTables===0?T.red:freeTables<=2?T.amber:T.green;

  return (
    <div onClick={onClick} className="fade-up" style={{
      animationDelay:`${delay}s`,
      background:T.surface, border:`1px solid ${T.border}`,
      borderRadius:20, padding:"22px 22px", marginBottom:16, cursor:"pointer",
      transition:"border-color 0.2s, transform 0.15s",
    }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.borderHi; e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform="translateY(0)"; }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div style={{ flex:1, paddingRight:12 }}>
          <h3 style={{ fontFamily:fontSerif, fontSize:26, color:T.cream, lineHeight:1.1 }}>{r.name}</h3>
          <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1.2, marginTop:4 }}>{r.city} · {r.tag}</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4, background:T.goldDim, padding:"4px 9px", borderRadius:8 }}>
            <span style={{ color:T.gold, fontSize:12 }}>★</span>
            <span style={{ color:T.gold, fontSize:13, fontWeight:"700" }}>{r.rating}</span>
          </div>
          <span style={{ fontSize:10, background:availColor+"22", color:availColor, padding:"4px 9px", borderRadius:20, fontWeight:"700" }}>
            {freeTables===0?"Completo":`${freeTables}/${totalTables} liberi`}
          </span>
          <span style={{ fontSize:12, color:T.muted }}>{r.priceRange}</span>
        </div>
      </div>

      <p style={{ fontSize:14, color:T.mutedHi, lineHeight:1.65, marginBottom:14 }}>{r.desc.substring(0,120)}…</p>

      {r.menu && r.menu.length > 0 && (
        <div style={{ marginBottom:14, padding:"10px 14px", background:T.surfaceHi, borderRadius:10, border:`1px solid ${T.border}` }}>
          <p style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:1.2, marginBottom:5 }}>✦ Piatti del Momento</p>
          <p style={{ fontSize:13, color:T.mutedHi }}>{r.menu.slice(0,2).join(" · ")}</p>
        </div>
      )}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {r.features.slice(0,4).map(f=>(
          <span key={f} style={{ background:T.surfaceHi, border:`1px solid ${T.borderHi}`, color:T.mutedHi, fontSize:11, padding:"4px 10px", borderRadius:20 }}>{f}</span>
        ))}
      </div>
    </div>
  );
}

function RestaurantMini({ r }) {
  return (
    <div style={{ background:T.surfaceHi, border:`1px solid ${T.borderHi}`, borderRadius:18, padding:"16px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontFamily:fontSerif, fontSize:22, color:T.goldLight }}>{r.name}</p>
          <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:1, marginTop:3 }}>{r.city} · {r.tag}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, background:T.goldDim, padding:"4px 9px", borderRadius:8 }}>
          <span style={{ color:T.gold, fontSize:12 }}>★</span>
          <span style={{ color:T.gold, fontSize:13, fontWeight:"700" }}>{r.rating}</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
        {r.features.slice(0,3).map(f=>(
          <span key={f} style={{ fontSize:11, background:T.goldDim, color:T.gold, padding:"3px 9px", borderRadius:20 }}>{f}</span>
        ))}
      </div>
    </div>
  );
}

function GuestCounter({ value, min, max, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", background:T.surfaceHi, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
      <button onClick={()=>onChange(Math.max(min,value-1))} disabled={value<=min}
        style={{ background:"none", border:"none", color:value<=min?T.muted:T.cream, padding:"14px 22px", fontSize:22, cursor:value<=min?"not-allowed":"pointer" }}>−</button>
      <div style={{ flex:1, textAlign:"center", fontSize:20, fontWeight:"600", fontFamily:fontSerif, color:T.cream }}>{value}</div>
      <button onClick={()=>onChange(Math.min(max,value+1))} disabled={value>=max}
        style={{ background:"none", border:"none", color:value>=max?T.muted:T.cream, padding:"14px 22px", fontSize:22, cursor:value>=max?"not-allowed":"pointer" }}>+</button>
    </div>
  );
}

function StepProgress({ current, steps }) {
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:28, padding:"0 4px" }}>
      {steps.map((s,i) => {
        const idx = i+1, done = current>idx, active = current===idx;
        return (
          <div key={s} style={{ flex:1, display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background:done?T.gold:active?T.goldDim:"transparent",
                border:`2px solid ${done||active?T.gold:T.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:"bold", color:done?T.bg:active?T.gold:T.muted,
                transition:"all 0.3s",
              }}>{done?"✓":idx}</div>
              <span style={{ fontSize:9, marginTop:6, textTransform:"uppercase", letterSpacing:0.8, color:active?T.goldLight:T.muted, whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:1.5, background:done?T.gold:T.border, margin:"0 4px", marginBottom:18, transition:"background 0.3s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign:"center", padding:"80px 20px" }}>
      <div style={{ fontSize:52, marginBottom:20, opacity:0.7 }}>{icon}</div>
      <h3 style={{ fontFamily:fontSerif, fontSize:26, color:T.cream, marginBottom:10 }}>{title}</h3>
      <p style={{ fontSize:14, color:T.mutedHi, lineHeight:1.7, maxWidth:300, margin:"0 auto" }}>{sub}</p>
    </div>
  );
}