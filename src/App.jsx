import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/* ══════════════════════════════════════════════════════════════ */
/* 1. CONFIGURAZIONI E DESIGN TOKENS                              */
/* ══════════════════════════════════════════════════════════════ */

const GoldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const T = {
  bg:         "#0c0a08",
  surface:    "#141210",
  surfaceHi:  "#1d1a16",
  border:     "rgba(255,255,255,0.07)",
  borderHi:   "rgba(255,255,255,0.14)",
  gold:       "#c9a84c",
  goldLight:  "#e8c97e",
  goldDim:    "rgba(201,168,76,0.15)",
  cream:      "#f5f0e8",
  muted:      "#7a7168",
  mutedHi:    "#a89e90",
  green:      "#3a9e6e",
  greenBg:    "rgba(58,158,110,0.12)",
  red:        "#c0392b",
  redBg:      "rgba(192,57,43,0.12)",
  amber:      "#c07a1a",
  amberBg:    "rgba(192,122,26,0.12)",
};

const fontSerif = `'Cormorant Garamond', 'Georgia', serif`;
const fontSans  = `'DM Sans', 'Helvetica Neue', sans-serif`;

/* ══════════════════════════════════════════════════════════════ */
/* 2. MOCK DATA (DATABASE FINTI)                                  */
/* ══════════════════════════════════════════════════════════════ */

const INITIAL_RESTAURANTS = [
  {
    id: 1, 
    name: "Osteria del Vino", 
    city: "Bari", 
    lat: 41.125, 
    lng: 16.866,
    tag: "Cucina pugliese", 
    rating: 4.8, 
    minGuests: 1, 
    maxGuests: 10,
    desc: "Tradizione e ricerca in un ambiente raccolto nel cuore della città vecchia. Assapora i veri gusti di Puglia.",
    features: ["Aria Condizionata", "Esterno", "Accesso Disabili"],
    menu: ["Orecchiette alle cime di rapa", "Fave e cicoria", "Bombette pugliesi"],
    tables: [
      { id: 1, x: 60,  y: 60,  shape: "circle",  cap: 2,  status: "free" },
      { id: 2, x: 160, y: 60,  shape: "circle",  cap: 4,  status: "occupied" },
      { id: 3, x: 260, y: 60,  shape: "rect",    cap: 6,  status: "free" },
      { id: 4, x: 60,  y: 155, shape: "rect",    cap: 4,  status: "free" },
      { id: 5, x: 180, y: 160, shape: "circle",  cap: 2,  status: "free" },
      { id: 6, x: 265, y: 155, shape: "circle",  cap: 4,  status: "reserved" },
      { id: 7, x: 110, y: 250, shape: "rect",    cap: 8,  status: "free" },
      { id: 8, x: 255, y: 250, shape: "circle",  cap: 2,  status: "free" },
    ],
  },
  {
    id: 2, 
    name: "Mare Blu", 
    city: "Polignano a Mare", 
    lat: 40.995, 
    lng: 17.218,
    tag: "Pesce fresco", 
    rating: 4.6, 
    minGuests: 1, 
    maxGuests: 8,
    desc: "Vista mozzafiato sulla scogliera. Pesce fresco del giorno in ogni piatto.",
    features: ["Sul Mare", "Esterno", "Musica dal vivo"],
    menu: ["Crudo di mare", "Risotto ai frutti di mare"],
    tables: [
      { id: 1, x: 60,  y: 70,  shape: "circle",  cap: 2,  status: "occupied" },
      { id: 2, x: 160, y: 70,  shape: "circle",  cap: 4,  status: "free" },
      { id: 3, x: 260, y: 70,  shape: "rect",    cap: 6,  status: "free" },
      { id: 4, x: 80,  y: 180, shape: "rect",    cap: 4,  status: "reserved" },
      { id: 5, x: 220, y: 180, shape: "circle",  cap: 6,  status: "free" },
      { id: 6, x: 150, y: 280, shape: "rect",    cap: 8,  status: "free" },
    ],
  },
  {
    id: 3, 
    name: "La Masseria", 
    city: "Alberobello", 
    lat: 40.783, 
    lng: 17.240,
    tag: "Farm-to-table", 
    rating: 4.9, 
    minGuests: 2, 
    maxGuests: 12,
    desc: "Tra trulli e uliveti a km zero. Riscopri il sapore della terra.",
    features: ["Esterno", "Parcheggio Privato"],
    menu: ["Antipasto masseria", "Grigliata mista"],
    tables: [
      { id: 1, x: 60,  y: 60,  shape: "rect",    cap: 4,  status: "free" },
      { id: 2, x: 200, y: 60,  shape: "rect",    cap: 6,  status: "free" },
      { id: 3, x: 80,  y: 170, shape: "circle",  cap: 2,  status: "occupied" },
      { id: 4, x: 210, y: 170, shape: "circle",  cap: 4,  status: "free" },
      { id: 5, x: 130, y: 270, shape: "rect",    cap: 12, status: "reserved" },
    ],
  },
];

const EVENTS = [
  { id: 101, title: "Jazz & Wine Night", date: "2026-05-15", loc: "Osteria del Vino", tag: "Musica Live" },
  { id: 102, title: "Degustazione Crudi", date: "2026-05-18", loc: "Mare Blu", tag: "Food" },
  { id: 103, title: "Passeggiata nei Trulli", date: "2026-05-20", loc: "Alberobello", tag: "Esperienza" },
];

const SLOTS = ["12:00","12:30","13:00","13:30","20:00","20:30","21:00","21:30","22:00"];

const INITIAL_BOOKINGS = [
  { id: "A1X", name: "Mario Rossi", date: "2026-05-15", time: "20:30", people: 4, table: { id: 2 }, restaurant: INITIAL_RESTAURANTS[0], status: "pending", notes: "No glutine" },
  { id: "B2Y", name: "Elena Bianchi", date: "2026-05-16", time: "21:00", people: 2, table: { id: 1 }, restaurant: INITIAL_RESTAURANTS[0], status: "confirmed", notes: "" },
  { id: "C3Z", name: "Luigi Verdi", date: "2026-05-17", time: "21:30", people: 6, table: { id: 3 }, restaurant: INITIAL_RESTAURANTS[0], status: "pending", notes: "Compleanno" },
];

/* ══════════════════════════════════════════════════════════════ */
/* 3. UTILITIES & GLOBAL STYLES                                   */
/* ══════════════════════════════════════════════════════════════ */

const helpers = {
  today: () => new Date().toISOString().split("T")[0],
  formatDate: (d) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
    return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
  },
  generateId: () => Math.random().toString(36).substr(2, 6).toUpperCase()
};

const globalStyles = `
  /* IMPORTANTE: IL CSS DI LEAFLET RISOLVE LA "MAPPA SMINCHIATA" */
  @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;500;600&family=DM+Sans:wght@400;500;600&display=swap');
  
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    -webkit-tap-highlight-color: transparent;
  }
  
  body { 
    background: ${T.bg}; 
    color: ${T.cream}; 
    font-family: ${fontSans}; 
    overflow-x: hidden; 
  }
  
  .leaflet-container { 
    background: ${T.bg} !important; 
    border-radius: 20px; 
    z-index: 1; 
  }
  
  .leaflet-popup-content-wrapper { 
    background: ${T.surfaceHi}; 
    color: ${T.cream}; 
    border: 1px solid ${T.gold}; 
  }
  
  .leaflet-popup-tip { 
    background: ${T.gold}; 
  }
  
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.borderHi}; border-radius: 4px; }

  @keyframes fadeUp { 
    from { opacity: 0; transform: translateY(15px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
  
  @keyframes fadeIn { 
    from { opacity: 0; } 
    to { opacity: 1; } 
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .fade-up { animation: fadeUp 0.4s ease-out forwards; }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
  .pulse   { animation: pulse 2s infinite; }

  input[type=date]::-webkit-calendar-picker-indicator { 
    filter: invert(0.7); 
    cursor: pointer; 
  }

  input, select, textarea {
    background: ${T.surfaceHi}; 
    border: 1px solid ${T.border}; 
    color: ${T.cream};
    border-radius: 12px; 
    padding: 14px 16px; 
    font-family: ${fontSans}; 
    font-size: 16px;
    width: 100%; 
    outline: none; 
    transition: border-color 0.2s;
  }

  input:focus, select:focus, textarea:focus { 
    border-color: ${T.gold}; 
  }
  
  input::placeholder, textarea::placeholder { 
    color: ${T.muted}; 
  }
`;

/* ══════════════════════════════════════════════════════════════ */
/* 4. ROOT COMPONENT (STATO GLOBALE AGGIUNTO)                     */
/* ══════════════════════════════════════════════════════════════ */

export default function App() {
  const [page, setPage] = useState("auth"); 
  const [user, setUser] = useState(null); 
  
  // SOLUZIONE "L'UNO NON SI AGGIORNA": solleviamo lo stato qui
  const [restaurantsData, setRestaurantsData] = useState(INITIAL_RESTAURANTS);
  const [globalBookings, setGlobalBookings] = useState(INITIAL_BOOKINGS);

  useEffect(() => {
    // Inietta gli stili globali incluso Leaflet
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("auth");
  };

  if (page === "auth") {
    return <AuthPage onLogin={handleLogin} />;
  }
  
  if (user?.role === "ristoratore") {
    return <BusinessApp 
              user={user} 
              onLogout={handleLogout} 
              bookings={globalBookings} 
              setBookings={setGlobalBookings} 
              restaurants={restaurantsData} 
           />;
  }

  return <CustomerApp 
            user={user} 
            onLogout={handleLogout} 
            bookings={globalBookings} 
            setBookings={setGlobalBookings} 
            restaurants={restaurantsData} 
            setRestaurants={setRestaurantsData} 
         />;
}

/* ══════════════════════════════════════════════════════════════ */
/* 5. AUTH PAGE                                                   */
/* ══════════════════════════════════════════════════════════════ */

function AuthPage({ onLogin }) {
  const [authData, setAuthData] = useState({ email: "", pass: "" });
  const [role, setRole] = useState("cliente"); 
  const [err, setErr] = useState("");

  const submit = () => {
    if (!authData.email.includes("@")) return setErr("Email non valida.");
    if (authData.pass.length < 4) return setErr("Password troppo corta.");
    
    onLogin({ 
      name: authData.email.split("@")[0], 
      email: authData.email, 
      role: role 
    });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div className="fade-up" style={{ background: T.surface, padding: 40, borderRadius: 24, border: `1px solid ${T.border}`, width: "100%", maxWidth: 450 }}>
        
        <h1 style={{ fontFamily: fontSerif, color: T.gold, fontSize: 40, textAlign: "center", marginBottom: 5 }}>
          Tavolify
        </h1>
        <p style={{ textAlign: "center", color: T.muted, fontSize: 11, letterSpacing: 3, marginBottom: 40, textTransform: "uppercase" }}>
          The Dining Network
        </p>
        
        <div style={{ display: "flex", background: T.surfaceHi, borderRadius: 12, padding: 6, marginBottom: 25 }}>
          <button 
            onClick={() => setRole("cliente")} 
            style={{ 
              flex: 1, padding: "12px", borderRadius: 10, border: "none", 
              background: role === "cliente" ? T.gold : "transparent", 
              color: role === "cliente" ? T.bg : T.muted, 
              fontWeight: "bold", cursor: "pointer", transition: "0.2s" 
            }}
          >
            Cliente
          </button>
          <button 
            onClick={() => setRole("ristoratore")} 
            style={{ 
              flex: 1, padding: "12px", borderRadius: 10, border: "none", 
              background: role === "ristoratore" ? T.gold : "transparent", 
              color: role === "ristoratore" ? T.bg : T.muted, 
              fontWeight: "bold", cursor: "pointer", transition: "0.2s" 
            }}
          >
            Ristorante
          </button>
        </div>

        <Field label={role === "cliente" ? "Email Cliente" : "Email Locale"}>
          <input 
            type="email" 
            placeholder="nome@esempio.com" 
            value={authData.email}
            onChange={e => setAuthData({...authData, email: e.target.value})} 
          />
        </Field>
        
        <Field label="Password">
          <input 
            type="password" 
            placeholder="••••••••" 
            value={authData.pass}
            onChange={e => setAuthData({...authData, pass: e.target.value})} 
          />
        </Field>
        
        {err && <p className="fade-in" style={{ color: T.red, fontSize: 13, marginBottom: 15 }}>{err}</p>}
        
        <PrimaryBtn style={{ width: "100%", marginTop: 10 }} onClick={submit}>
          Accedi come {role === "cliente" ? "Cliente" : "Locale"}
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* 6. BUSINESS APP                                                */
/* ══════════════════════════════════════════════════════════════ */

function BusinessApp({ user, onLogout, bookings, setBookings, restaurants }) {
  const [view, setView] = useState("dashboard"); 

  const handleStatus = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <TopBar user={user} onLogout={onLogout} title="Business Dashboard" />

      <main style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
        
        {view === "dashboard" && (
          <div className="fade-up">
            <SectionHeading>Riepilogo di Oggi</SectionHeading>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 40 }}>
              <StatBox label="Prenotazioni" val={bookings.length} />
              <StatBox label="Coperti Totali" val={bookings.reduce((sum, b) => sum + parseInt(b.people), 0)} />
              <StatBox label="In Attesa" val={bookings.filter(b=>b.status==='pending').length} color={T.amber} />
              <StatBox label="Ricavi Stimati" val={`€ ${bookings.length * 45}`} color={T.green} />
            </div>

            <SectionHeading>Richieste in Arrivo</SectionHeading>
            {bookings.length === 0 ? (
              <EmptyState icon="📬" title="Nessuna richiesta" sub="Tutto tranquillo al momento." />
            ) : (
              bookings.map(b => (
                <Card key={b.id} style={{ marginBottom: 15, borderLeft: `4px solid ${b.status === 'pending' ? T.amber : (b.status === 'confirmed' ? T.green : T.red)}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <strong style={{ fontSize: 20, fontFamily: fontSerif, color: T.cream }}>{b.name}</strong>
                    <span style={{ fontSize: 12, background: T.surfaceHi, padding: "6px 10px", borderRadius: 8, color: T.mutedHi }}>{b.time}</span>
                  </div>
                  
                  <p style={{ fontSize: 14, color: T.mutedHi, marginBottom: 5 }}>Tavolo {b.table?.id || b.table} • {b.people} Persone</p>
                  {b.notes && <p style={{ fontSize: 13, color: T.amber, marginTop: 10, background: T.amberBg, padding: "8px", borderRadius: "8px" }}>⚠ Note: {b.notes}</p>}
                  
                  {b.status === "pending" && (
                    <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
                      <button 
                        onClick={() => handleStatus(b.id, 'rejected')} 
                        style={{ flex: 1, padding: "12px", borderRadius: 10, background: "none", border: `1px solid ${T.red}55`, color: T.red, cursor: "pointer", fontWeight: "bold" }}
                      >
                        Rifiuta
                      </button>
                      <button 
                        onClick={() => handleStatus(b.id, 'confirmed')} 
                        style={{ flex: 2, padding: "12px", borderRadius: 10, background: T.greenBg, border: `1px solid ${T.green}55`, color: T.green, cursor: "pointer", fontWeight: "bold" }}
                      >
                        Accetta Prenotazione
                      </button>
                    </div>
                  )}
                  
                  {b.status !== "pending" && (
                    <div style={{ marginTop: 15, paddingTop: 15, borderTop: `1px solid ${T.border}` }}>
                      <p style={{ fontSize: 14, color: b.status === 'confirmed' ? T.green : T.red, fontWeight: "bold" }}>
                        {b.status === 'confirmed' ? "✓ Prenotazione Confermata" : "✗ Prenotazione Rifiutata"}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {view === "tables" && (
          <div className="fade-up">
            <SectionHeading>Gestione Sala</SectionHeading>
            <Card style={{ background: "#0c0a08", textAlign: "center", padding: "30px 10px" }}>
              <p style={{ color: T.muted, fontSize: 14, marginBottom: 30 }}>Mappa della sala aggiornata in tempo reale.</p>
              
              <svg width="100%" viewBox="0 0 340 310">
                {restaurants[0].tables.map(t => {
                  const c = t.status === "free" ? T.green : T.red;
                  return (
                    <g key={t.id}>
                      {t.shape === "circle" 
                        ? <circle cx={t.x} cy={t.y} r={24} fill={c+"22"} stroke={c} strokeWidth={2} /> 
                        : <rect x={t.x - 30} y={t.y - 18} width={60} height={36} rx={8} fill={c+"22"} stroke={c} strokeWidth={2} />
                      }
                      <text x={t.x} y={t.y + 4} textAnchor="middle" fill={c} fontSize="12" fontWeight="bold">T{t.id}</text>
                    </g>
                  );
                })}
              </svg>

              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 30 }}>
                <span style={{ fontSize: 12, color: T.muted }}><span style={{ color: T.green }}>●</span> Libero</span>
                <span style={{ fontSize: 12, color: T.muted }}><span style={{ color: T.red }}>●</span> Occupato</span>
              </div>
            </Card>
          </div>
        )}

        {view === "settings" && (
          <div className="fade-up">
            <SectionHeading>Impostazioni Locale</SectionHeading>
            <Card>
              <Field label="Nome Ristorante"><input type="text" defaultValue="Osteria del Vino" /></Field>
              <Field label="Capienza Massima Sala (Persone)"><input type="number" defaultValue="45" /></Field>
              <Field label="Descrizione Pubblica">
                <textarea rows="4" defaultValue="Tradizione e ricerca in un ambiente raccolto nel cuore della città vecchia. Assapora i veri gusti di Puglia."></textarea>
              </Field>
              <PrimaryBtn style={{ width: "100%", marginTop: 20 }}>Salva Modifiche</PrimaryBtn>
            </Card>
          </div>
        )}
      </main>

      <nav style={{ position: "fixed", bottom: 0, width: "100%", background: T.surface, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-around", padding: "15px 0", zIndex: 2000 }}>
        <NavBtn active={view === "dashboard"} icon="📊" label="Dashboard" onClick={() => setView("dashboard")} />
        <NavBtn active={view === "tables"} icon="🪑" label="Sala" onClick={() => setView("tables")} />
        <NavBtn active={view === "settings"} icon="⚙️" label="Impostazioni" onClick={() => setView("settings")} />
      </nav>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* 7. CUSTOMER APP                                                */
/* ══════════════════════════════════════════════════════════════ */

function CustomerApp({ user, onLogout, bookings, setBookings, restaurants, setRestaurants }) {
  const [view, setView] = useState("list"); 
  const [restaurant, setRestaurant] = useState(null);
  const [step, setStep] = useState(0);
  const [selTable, setSelTable] = useState(null);
  const [lastBookingId, setLastBookingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({ 
    date: "", time: "", people: 2, eventType: "pasto", allergies: "", extra: "" 
  });
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const e = {};
    if (!form.date)  e.date  = "Seleziona una data.";
    if (!form.time)  e.time  = "Seleziona un orario.";
    if (form.people > restaurant.maxGuests) e.people = `Max ${restaurant.maxGuests} persone.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    const bId = helpers.generateId();
    
    // Aggiungi la prenotazione globalmente
    setBookings([
      { id: bId, name: user.name, table: selTable, restaurant, status: "confirmed", ...form },
      ...bookings
    ]);
    
    // Cambia lo stato del tavolo a "riservato" così diventa rosso!
    setRestaurants(prev => prev.map(r => {
      if(r.id === restaurant.id) {
        return {
          ...r, 
          tables: r.tables.map(t => t.id === selTable.id ? { ...t, status: "reserved" } : t)
        };
      }
      return r;
    }));

    setLastBookingId(bId);
    setStep(4);
  };

  const openRestaurant = (r) => {
    setRestaurant(r); 
    setStep(1); 
    setSelTable(null);
    setForm({ date: "", time: "", people: 2, eventType: "pasto", allergies: "", extra: "" }); 
    setErrors({});
  };

  const goBack = () => {
    if (step > 1 && step < 4) { 
      setStep(s => s - 1); 
      setSelTable(null); 
    } else { 
      setRestaurant(null); 
      setStep(0); 
    }
  };

  // ── WIZARD PRENOTAZIONE ──
  if (restaurant) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 100 }}>
        <TopBar user={user} onLogout={onLogout} backLabel={step < 4 ? "Indietro" : null} onBack={step < 4 ? goBack : null} />
        
        <main style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
          {step < 4 && <StepProgress current={step} steps={["Dettagli","Mappa Tavolo","Riepilogo"]} />}

          {step === 1 && (
            <div className="fade-up">
              <RestaurantMini r={restaurant} />
              <Card style={{ marginTop: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                  <Field label="Data" error={errors.date}>
                    <input type="date" min={helpers.today()} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                  </Field>
                  <Field label="Orario" error={errors.time}>
                    <select value={form.time} onChange={e => setForm({...form, time: e.target.value})}>
                      <option value="">Scegli...</option>
                      {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 }}>
                  <Field label="Persone" error={errors.people}>
                    <GuestCounter value={form.people} min={restaurant.minGuests} max={restaurant.maxGuests} onChange={v => setForm({...form, people: v})} />
                  </Field>
                  <Field label="Evento">
                    <select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}>
                      <option value="pasto">Pasto standard</option>
                      <option value="festa">Festa / Ricorrenza</option>
                    </select>
                  </Field>
                </div>

                <div style={{ marginTop: 15 }}>
                  <Field label="Allergie / Intolleranze">
                    <input placeholder="Es: Glutine, Lattosio..." value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} />
                  </Field>
                </div>
                
                <div style={{ marginTop: 15 }}>
                  <Field label="Note Speciali" hint="(TV, seggiolino, esterno...)">
                    <textarea rows="3" placeholder="Scrivi qui..." value={form.extra} onChange={e => setForm({...form, extra: e.target.value})}></textarea>
                  </Field>
                </div>
              </Card>
              <PrimaryBtn style={{ marginTop: 20, width: "100%" }} onClick={() => validateStep1() && setStep(2)}>
                Scegli il Tavolo in Sala →
              </PrimaryBtn>
            </div>
          )}

          {step === 2 && (
            <div className="fade-up">
              <RestaurantMini r={restaurant} />
              <Card style={{ marginTop: 20 }}>
                <p style={{ fontSize: 14, color: T.muted, marginBottom: 15, textAlign: "center" }}>
                  Seleziona un tavolo libero per {form.people} {form.people === 1 ? "persona" : "persone"}.
                </p>
                <div style={{ background: "#080706", padding: 20, borderRadius: 16, border: `1px solid ${T.border}` }}>
                  <svg width="100%" viewBox="0 0 340 310">
                    {Array.from({ length: 8 }, (_, row) => Array.from({ length: 12 }, (_, col) => <circle key={`grid-${row}-${col}`} cx={20 + col * 28} cy={20 + row * 38} r="1" fill={T.border} opacity="0.3" />))}
                    
                    {restaurant.tables.map(t => {
                      const isSelected = selTable?.id === t.id;
                      const available = t.status === "free" && t.cap >= form.people;
                      const color = available ? T.green : T.red;
                      const stroke = isSelected ? T.gold : color;
                      
                      return (
                        <g key={t.id} onClick={() => available && setSelTable(t)} style={{ cursor: available ? "pointer" : "not-allowed", opacity: available || isSelected ? 1 : 0.4 }}>
                          {t.shape === "circle" 
                            ? <circle cx={t.x} cy={t.y} r={22} fill={isSelected ? T.goldDim : color+"22"} stroke={stroke} strokeWidth={isSelected ? 3 : 1.5} /> 
                            : <rect x={t.x-28} y={t.y-16} width={56} height={32} rx={8} fill={isSelected ? T.goldDim : color+"22"} stroke={stroke} strokeWidth={isSelected ? 3 : 1.5} />
                          }
                          <text x={t.x} y={t.y+4} textAnchor="middle" fill={isSelected ? T.gold : color} fontSize="12" fontWeight="bold">{t.id}</text>
                          <text x={t.x} y={t.y+18} textAnchor="middle" fill={T.muted} fontSize="8">{t.cap} px</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </Card>
              <PrimaryBtn disabled={!selTable} style={{ marginTop: 20, width: "100%" }} onClick={() => setStep(3)}>
                Vai al Riepilogo Finale →
              </PrimaryBtn>
            </div>
          )}

          {step === 3 && (
            <div className="fade-up">
              <Card>
                <h3 style={{ fontFamily: fontSerif, fontSize: 26, color: T.goldLight, marginBottom: 25, borderBottom: `1px solid ${T.border}`, paddingBottom: 15 }}>Riepilogo</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  <SummaryRow label="Locale" value={restaurant.name} />
                  <SummaryRow label="Data" value={helpers.formatDate(form.date)} />
                  <SummaryRow label="Orario" value={form.time} />
                  <SummaryRow label="Tavolo" value={`Numero ${selTable?.id}`} />
                  <SummaryRow label="Ospiti" value={`${form.people} persone`} />
                  <SummaryRow label="Tipo Evento" value={form.eventType.toUpperCase()} />
                  {form.allergies && <SummaryRow label="Allergie" value={form.allergies} color={T.red} />}
                  {form.extra && <SummaryRow label="Note" value={form.extra} />}
                </div>
                <PrimaryBtn style={{ marginTop: 30, width: "100%", padding: 18, fontSize: 16 }} onClick={handleConfirm}>
                  Conferma Definitiva
                </PrimaryBtn>
              </Card>
            </div>
          )}

          {step === 4 && (
            <div className="fade-up" style={{ textAlign: "center", padding: "50px 0" }}>
              <div className="pulse" style={{ fontSize: 70, marginBottom: 20 }}>🥂</div>
              <h2 style={{ fontFamily: fontSerif, fontSize: 40, color: T.gold, marginBottom: 15 }}>Tavolo Riservato!</h2>
              <p style={{ color: T.mutedHi, fontSize: 16, marginBottom: 40 }}>La tua prenotazione da {restaurant.name} è confermata.</p>
              
              <div style={{ border: `1px dashed ${T.gold}`, padding: 30, borderRadius: 20, margin: "0 auto 40px", background: T.surface, maxWidth: 300 }}>
                <p style={{ fontSize: 12, color: T.muted, letterSpacing: 1, textTransform: "uppercase" }}>Codice Segreto</p>
                <p style={{ fontSize: 36, color: T.goldLight, fontWeight: "bold", marginTop: 10, letterSpacing: 4 }}>{lastBookingId}</p>
              </div>

              <GhostBtn style={{ width: "100%" }} onClick={() => { setRestaurant(null); setStep(0); setView("bookings"); }}>
                Vai alle mie prenotazioni
              </GhostBtn>
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
    r.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 100 }}>
      <TopBar user={user} onLogout={onLogout} />
      
      <main style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
        
        {view === "list" && (
          <div className="fade-up">
            <SectionHeading>Esplora</SectionHeading>
            <input 
              placeholder="Cerca per nome, città, 'esterno'..." 
              value={searchQuery} 
              onChange={e=>setSearchQuery(e.target.value)} 
              style={{ marginBottom: 25 }} 
            />
            {filteredRestaurants.map(r => (
              <RestaurantCard key={r.id} r={r} onClick={() => openRestaurant(r)} />
            ))}
          </div>
        )}

        {view === "map" && (
          <div className="fade-up" style={{ height: "70vh" }}>
            <SectionHeading>Mappa Territorio</SectionHeading>
            <div style={{ height: "100%", borderRadius: 24, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <MapContainer 
                center={[41.0, 17.0]} 
                zoom={9} 
                style={{ height: "100%", width: "100%" }} 
                zoomControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {restaurants.map(r => (
                  <Marker key={r.id} position={[r.lat, r.lng]} icon={GoldIcon}>
                    <Popup>
                      <div style={{ color: "#333", textAlign: "center", padding: "5px" }}>
                        <strong style={{ color: T.gold, fontSize: 16 }}>{r.name}</strong><br/>
                        <span style={{ fontSize: 12, color: "#666" }}>{r.tag}</span><br/>
                        <button 
                          onClick={() => openRestaurant(r)} 
                          style={{ marginTop: 15, background: T.gold, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", width: "100%" }}
                        >
                          Prenota
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {view === "events" && (
          <div className="fade-up">
            <SectionHeading>Eventi & Esperienze</SectionHeading>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 25 }}>Momenti unici organizzati sul territorio.</p>
            {EVENTS.map(ev => (
              <Card key={ev.id} style={{ marginBottom: 15, borderLeft: `4px solid ${T.gold}` }}>
                <span style={{ fontSize: 11, background: T.goldDim, color: T.gold, padding: "4px 10px", borderRadius: 6, fontWeight: "bold" }}>{ev.tag}</span>
                <h3 style={{ fontFamily: fontSerif, fontSize: 24, marginTop: 12, color: T.cream }}>{ev.title}</h3>
                <p style={{ fontSize: 14, color: T.mutedHi, marginTop: 6 }}>📍 {ev.loc} • 🗓 {helpers.formatDate(ev.date)}</p>
                <GhostBtn style={{ width: "100%", marginTop: 15 }}>Richiedi Invito all'Evento</GhostBtn>
              </Card>
            ))}
          </div>
        )}

        {view === "bookings" && (
          <div className="fade-up">
            <SectionHeading>Le mie Prenotazioni</SectionHeading>
            {bookings.filter(b => b.name === user.name).length === 0 ? (
              <EmptyState icon="🍽" title="Nessun tavolo riservato" sub="Scegli un locale dalla lista o dalla mappa per iniziare." />
            ) : (
              bookings.filter(b => b.name === user.name).map(b => (
                <Card key={b.id} style={{ marginBottom: 15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                    <strong style={{ fontSize: 22, fontFamily: fontSerif, color: T.goldLight }}>{b.restaurant.name}</strong>
                    <span style={{ fontSize: 10, background: T.greenBg, color: T.green, padding: "5px 10px", borderRadius: 8, fontWeight: "bold" }}>CONFERMATA</span>
                  </div>
                  <div style={{ background: T.surfaceHi, padding: 15, borderRadius: 12, border: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: 14, marginBottom: 5 }}>🗓 {helpers.formatDate(b.date)} alle {b.time}</p>
                    <p style={{ fontSize: 14 }}>🪑 Tavolo {b.table?.id || b.table} • 👥 {b.people} Ospiti</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {view === "stats" && (
          <div className="fade-up">
            <SectionHeading>Profilo Elite</SectionHeading>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 30 }}>
              <StatBox label="Tavoli Riservati" val={bookings.filter(b => b.name === user.name).length} />
              <StatBox label="Locali Scoperti" val={new Set(bookings.filter(b => b.name === user.name).map(b => b.restaurant.id)).size} />
              <StatBox label="Ospiti Accolti" val={bookings.filter(b => b.name === user.name).reduce((sum, b) => sum + parseInt(b.people), 0)} />
              <StatBox label="Livello Account" val="Gold" color={T.gold} />
            </div>

            <GhostBtn style={{ width: "100%", border: `1px solid ${T.red}55`, color: T.red }} onClick={onLogout}>
              Disconnetti Account
            </GhostBtn>
          </div>
        )}

      </main>

      <nav style={{ position: "fixed", bottom: 0, width: "100%", background: T.surface, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-around", padding: "15px 0", zIndex: 2000 }}>
        <NavBtn active={view === "list"} icon="◈" label="Locali" onClick={() => setView("list")} />
        <NavBtn active={view === "map"} icon="📍" label="Mappa" onClick={() => setView("map")} />
        <NavBtn active={view === "events"} icon="✦" label="Eventi" onClick={() => setView("events")} />
        <NavBtn active={view === "bookings"} icon="◷" label="Tavoli" onClick={() => setView("bookings")} />
        <NavBtn active={view === "stats"} icon="◉" label="Profilo" onClick={() => setView("stats")} />
      </nav>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* 8. COMPONENTI ATOMICI E DI SUPPORTO                            */
/* ══════════════════════════════════════════════════════════════ */

function TopBar({ user, onLogout, backLabel, onBack, title }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(12,10,8,0.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px" }}>
      {onBack ? (
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.goldLight, cursor: "pointer", fontSize: 15, fontWeight: "bold" }}>← {backLabel || "Indietro"}</button>
      ) : (
        <span style={{ fontFamily: fontSerif, fontSize: 26, color: T.gold, letterSpacing: 1 }}>{title || "Tavolify"}</span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 13, color: T.cream, fontWeight: "500" }}>{user?.name}</p>
          <p style={{ fontSize: 10, color: T.mutedHi, textTransform: "uppercase" }}>{user?.role}</p>
        </div>
        <button onClick={onLogout} style={{ background: T.surfaceHi, border: `1px solid ${T.border}`, color: T.muted, fontSize: 10, padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>ESCI</button>
      </div>
    </header>
  );
}

function NavBtn({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", color: active ? T.gold : T.muted }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 10, textTransform: "uppercase", fontWeight: active ? "bold" : "normal", letterSpacing: 1 }}>{label}</span>
    </button>
  );
}

function Card({ children, style, onClick }) { 
  return (
    <div onClick={onClick} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24, ...style }}>
      {children}
    </div>
  ); 
}

function SectionHeading({ children }) { 
  return <h2 style={{ fontFamily: fontSerif, fontSize: 32, color: T.cream, marginBottom: 25 }}>{children}</h2>; 
}

function Field({ label, error, hint, children }) { 
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={{ fontSize: 12, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: T.muted }}>{hint}</span>}
      </div>
      {children}
      {error && <p className="fade-in" style={{ fontSize: 13, color: T.red, marginTop: 8 }}>⚠ {error}</p>}
    </div>
  ); 
}

function PrimaryBtn({ children, onClick, disabled, style }) { 
  return (
    <button onClick={disabled ? undefined : onClick} style={{ padding: "18px 24px", borderRadius: 14, background: disabled ? T.surfaceHi : T.gold, color: disabled ? T.muted : T.bg, border: "none", cursor: disabled ? "not-allowed" : "pointer", fontSize: 16, fontWeight: "bold", transition: "0.2s", ...style }}>
      {children}
    </button>
  ); 
}

function GhostBtn({ children, onClick, style }) { 
  return (
    <button onClick={onClick} style={{ padding: "16px 20px", borderRadius: 14, background: "none", border: `1px solid ${T.border}`, color: T.mutedHi, cursor: "pointer", fontSize: 15, fontWeight: "500", ...style }}>
      {children}
    </button>
  ); 
}

function StatBox({ label, val, color }) { 
  return (
    <div style={{ background: T.surfaceHi, borderRadius: 16, padding: "20px", border: `1px solid ${T.border}`, textAlign: "center" }}>
      <p style={{ fontSize: 32, fontFamily: fontSerif, color: color || T.goldLight }}>{val}</p>
      <p style={{ fontSize: 11, color: T.muted, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
    </div>
  ); 
}

function Stars({ n }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: T.goldDim, padding: "4px 8px", borderRadius: 8 }}>
      <span style={{ color: T.gold, fontSize: 12 }}>★</span>
      <span style={{ color: T.gold, fontSize: 13, fontWeight: "bold" }}>{n}</span>
    </div>
  );
}

function RestaurantCard({ r, onClick, style }) { 
  return (
    <Card onClick={onClick} style={{ cursor: "pointer", marginBottom: 20, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
        <div>
          <h3 style={{ fontFamily: fontSerif, fontSize: 26, margin: 0, color: T.cream }}>{r.name}</h3>
          <p style={{ fontSize: 13, color: T.muted, textTransform: "uppercase", marginTop: 4, letterSpacing: 1 }}>{r.city} • {r.tag}</p>
        </div>
        <Stars n={r.rating} />
      </div>
      <p style={{ fontSize: 15, color: T.mutedHi, lineHeight: 1.5, marginBottom: 15 }}>{r.desc}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {r.features.map(f => <span key={f} style={{ background: T.surfaceHi, border: `1px solid ${T.borderHi}`, color: T.mutedHi, fontSize: 11, padding: "4px 10px", borderRadius: 8 }}>{f}</span>)}
      </div>
    </Card>
  ); 
}

function RestaurantMini({ r }) { 
  return (
    <div style={{ background: T.surfaceHi, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <p style={{ fontFamily: fontSerif, fontSize: 22, color: T.goldLight }}>{r.name}</p>
        <p style={{ fontSize: 12, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{r.city}</p>
      </div>
      <Stars n={r.rating} />
    </div>
  ); 
}

function GuestCounter({ value, min, max, onChange }) { 
  return (
    <div style={{ display: "flex", alignItems: "center", background: T.surfaceHi, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={{ background: "none", border: "none", color: value <= min ? T.muted : T.cream, padding: "14px 20px", fontSize: 20, cursor: "pointer" }} disabled={value <= min}>−</button>
      <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: "500" }}>{value}</div>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={{ background: "none", border: "none", color: value >= max ? T.muted : T.cream, padding: "14px 20px", fontSize: 20, cursor: "pointer" }} disabled={value >= max}>+</button>
    </div>
  ); 
}

function StepProgress({ current, steps }) { 
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
      {steps.map((s, i) => { 
        const idx = i + 1; 
        const done = current > idx; 
        const active = current === idx; 
        return (
          <div key={s} style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? T.gold : active ? T.goldDim : "transparent", border: `2px solid ${done || active ? T.gold : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold", color: done ? T.bg : active ? T.gold : T.muted }}>
                {done ? "✓" : idx}
              </div>
              <span style={{ fontSize: 11, marginTop: 8, textTransform: "uppercase", letterSpacing: 1, color: active ? T.goldLight : T.muted }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? T.gold : T.border, margin: "0 10px", marginBottom: 20 }}/>}
          </div>
        ); 
      })}
    </div>
  ); 
}

function SummaryRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 14, color: T.muted }}>{label}</span>
      <span style={{ fontSize: 15, color: color || T.cream, textAlign: "right", fontWeight: "500" }}>{value}</span>
    </div>
  );
}

function EmptyState({ icon, title, sub }) { 
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 50, marginBottom: 20 }}>{icon}</div>
      <h3 style={{ fontFamily: fontSerif, fontSize: 26, color: T.cream, marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 15, color: T.mutedHi, lineHeight: 1.6 }}>{sub}</p>
    </div>
  ); 
}