import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";

const TOTAL_GAZEBO = 22;
const OPERATOR_PIN = "1234"; // Ganti PIN sesuai keinginan

const initialGazebos = Array.from({ length: TOTAL_GAZEBO }, (_, i) => ({
  id: i + 1,
  status: "kosong",
  penyewa: "",
  jamMulai: "",
  jamSelesai: "",
  catatan: "",
}));

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isViewerUrl = params.get("view") === "1";

  const [mode, setMode] = useState(isViewerUrl ? "viewer" : "landing");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [gazebos, setGazebos] = useState(initialGazebos);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [connected, setConnected] = useState(false);

  // Realtime listener dari Firebase
  useEffect(() => {
    const gazeboRef = ref(db, "gazebos");
    const unsubscribe = onValue(gazeboRef, (snapshot) => {
      setConnected(true);
      const data = snapshot.val();
      if (data) {
        setGazebos(data.list || initialGazebos);
        setLastUpdate(data.updatedAt || null);
      }
    }, (error) => {
      console.error("Firebase error:", error);
      setConnected(false);
    });
    return () => unsubscribe();
  }, []);

  const saveToFirebase = async (newGazebos) => {
    const payload = {
      list: newGazebos,
      updatedAt: new Date().toISOString(),
    };
    await set(ref(db, "gazebos"), payload);
  };

  const handleLogin = () => {
    if (pin === OPERATOR_PIN) {
      setMode("operator");
      setPinError(false);
      setPin("");
    } else {
      setPinError(true);
    }
  };

  const openModal = (g) => {
    if (mode !== "operator") return;
    setSelected(g);
    setForm({ ...g });
    setShowModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = gazebos.map((g) =>
        g.id === selected.id ? { ...g, ...form } : g
      );
      await saveToFirebase(updated);
      setSaveStatus("✓ Tersimpan");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch {
      setSaveStatus("⚠ Gagal simpan");
    }
    setLoading(false);
    setShowModal(false);
    setSelected(null);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const updated = gazebos.map((g) =>
        g.id === selected.id
          ? { ...g, status: "kosong", penyewa: "", jamMulai: "", jamSelesai: "", catatan: "" }
          : g
      );
      await saveToFirebase(updated);
      setSaveStatus("✓ Gazebo direset");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch {
      setSaveStatus("⚠ Gagal reset");
    }
    setLoading(false);
    setShowModal(false);
    setSelected(null);
  };

  const handleResetAll = async () => {
    if (!window.confirm("Reset SEMUA gazebo jadi kosong?")) return;
    setLoading(true);
    await saveToFirebase(initialGazebos);
    setLoading(false);
    setSaveStatus("✓ Semua gazebo direset");
    setTimeout(() => setSaveStatus(""), 2500);
  };

  const getShareUrl = () => {
    return window.location.origin + window.location.pathname + "?view=1";
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(getShareUrl());
    setSaveStatus("✓ Link disalin!");
    setTimeout(() => setSaveStatus(""), 2500);
  };

  const tersewa = gazebos.filter((g) => g.status === "tersewa").length;
  const kosong = TOTAL_GAZEBO - tersewa;

  const formatLastUpdate = (iso) => {
    if (!iso) return "Belum ada data";
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  // ======== LANDING ========
  if (mode === "landing") {
    return (
      <div style={s.bg}>
        <div style={s.landing}>
          <div style={s.landingCard}>
            <div style={s.emoji}>🏖️</div>
            <h1 style={s.landingTitle}>Gazebo Monitor-Wahoo Waterworld</h1>
            <p style={s.landingSub}>Sistem Monitoring Penyewaan Gazebo<br />22 Unit — Realtime</p>
            <div style={s.dot(connected)} />
            <p style={{ ...s.connTxt, color: connected ? "#51cf66" : "#aaa" }}>
              {connected ? "Terhubung ke server" : "Menghubungkan..."}
            </p>
            <div style={s.btnRow}>
              <button style={{ ...s.btn, ...s.btnBlue }} onClick={() => setMode("pin")}>
                🔐 Masuk sebagai Operator
              </button>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setMode("viewer")}>
                👁️ Lihat Status (Publik)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======== PIN ========
  if (mode === "pin") {
    return (
      <div style={s.bg}>
        <div style={s.landing}>
          <div style={s.landingCard}>
            <div style={s.emoji}>🔐</div>
            <h2 style={s.landingTitle}>Login Operator</h2>
            <input
              type="password"
              placeholder="Masukkan PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ ...s.pinInput, ...(pinError ? s.pinErr : {}) }}
              maxLength={8}
              autoFocus
            />
            {pinError && <p style={s.errTxt}>PIN salah, coba lagi</p>}
            <div style={{ ...s.btnRow, marginTop: 8 }}>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => { setMode("landing"); setPin(""); setPinError(false); }}>
                ← Kembali
              </button>
              <button style={{ ...s.btn, ...s.btnBlue }} onClick={handleLogin}>
                Masuk →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======== OPERATOR & VIEWER ========
  return (
    <div style={s.bg}>
      {/* HEADER */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: 28 }}>🏖️</span>
          <div>
            <div style={s.headerTitle}>Gazebo Monitor-Wahoo Waterworld</div>
            <div style={s.headerSub}>
              {mode === "operator"
                ? "Mode Operator — Tap gazebo untuk update"
                : "Mode Publik — Update otomatis realtime"}
            </div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.dot(connected)} title={connected ? "Online" : "Offline"} />
          {saveStatus && <span style={s.saveTxt}>{saveStatus}</span>}
          {mode === "operator" && (
            <>
              <button style={{ ...s.btn, ...s.btnSmall, ...s.btnShare }} onClick={copyShareUrl}>
                🔗 Salin Link Publik
              </button>
              <button style={{ ...s.btn, ...s.btnSmall, ...s.btnDanger }} onClick={handleResetAll} disabled={loading}>
                🔄 Reset Semua
              </button>
              <button style={{ ...s.btn, ...s.btnSmall, ...s.btnGhost }} onClick={() => setMode("landing")}>
                Keluar
              </button>
            </>
          )}
          {mode === "viewer" && (
            <button style={{ ...s.btn, ...s.btnSmall, ...s.btnGhost }} onClick={() => setMode("landing")}>
              ← Kembali
            </button>
          )}
        </div>
      </header>

      {/* STATS */}
      <div style={s.statsRow}>
        <div style={s.stat("#fff", "rgba(255,255,255,0.07)")}>
          <span style={s.statN}>{TOTAL_GAZEBO}</span>
          <span style={s.statL}>Total</span>
        </div>
        <div style={s.stat("#ff6b6b", "rgba(255,107,107,0.12)")}>
          <span style={s.statN}>{tersewa}</span>
          <span style={s.statL}>Tersewa</span>
        </div>
        <div style={s.stat("#51cf66", "rgba(81,207,102,0.12)")}>
          <span style={s.statN}>{kosong}</span>
          <span style={s.statL}>Kosong</span>
        </div>
        <div style={{ ...s.stat("#a0c4d8", "rgba(255,255,255,0.05)"), flex: 1, alignItems: "flex-start", padding: "10px 16px" }}>
          <span style={{ fontSize: 11, color: "#a0c4d8" }}>Update terakhir</span>
          <span style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{formatLastUpdate(lastUpdate)}</span>
        </div>
      </div>

      {/* GRID */}
      <div style={s.grid}>
        {gazebos.map((g) => {
          const rented = g.status === "tersewa";
          return (
            <div
              key={g.id}
              style={{
                ...s.card,
                ...(rented ? s.cardRented : s.cardFree),
                cursor: mode === "operator" ? "pointer" : "default",
              }}
              onClick={() => openModal(g)}
            >
              <div style={s.cardNum}>G{String(g.id).padStart(2, "0")}</div>
              <div style={{ ...s.cardStatus, color: rented ? "#ff6b6b" : "#51cf66" }}>
                {rented ? "● Tersewa" : "● Kosong"}
              </div>
              {rented && (
                <div style={s.cardBody}>
                  {g.penyewa && <div style={s.cardName}>👤 {g.penyewa}</div>}
                  {(g.jamMulai || g.jamSelesai) && (
                    <div style={s.cardTime}>⏰ {g.jamMulai || "-"} – {g.jamSelesai || "-"}</div>
                  )}
                  {g.catatan && <div style={s.cardNote}>📝 {g.catatan}</div>}
                </div>
              )}
              {mode === "operator" && <div style={s.editTag}>✏️</div>}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && selected && mode === "operator" && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Edit Gazebo {String(selected.id).padStart(2, "0")}</h3>

            <label style={s.lbl}>Status Gazebo</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["kosong", "tersewa"].map((v) => (
                <button
                  key={v}
                  style={{
                    ...s.toggleBtn,
                    ...(form.status === v
                      ? v === "kosong" ? s.togGreen : s.togRed
                      : {}),
                  }}
                  onClick={() => setForm({ ...form, status: v })}
                >
                  {v === "kosong" ? "🟢 Kosong" : "🔴 Tersewa"}
                </button>
              ))}
            </div>

            {form.status === "tersewa" && (
              <>
                <label style={s.lbl}>Nama Penyewa</label>
                <input style={s.inp} placeholder="Nama penyewa..."
                  value={form.penyewa || ""} onChange={(e) => setForm({ ...form, penyewa: e.target.value })} />

                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={s.lbl}>Jam Mulai</label>
                    <input type="time" style={s.inp}
                      value={form.jamMulai || ""} onChange={(e) => setForm({ ...form, jamMulai: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={s.lbl}>Jam Selesai</label>
                    <input type="time" style={s.inp}
                      value={form.jamSelesai || ""} onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })} />
                  </div>
                </div>

                <label style={s.lbl}>Catatan</label>
                <textarea style={{ ...s.inp, height: 70, resize: "none" }}
                  placeholder="Catatan tambahan..."
                  value={form.catatan || ""} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
              </>
            )}

            <div style={s.modalBtns}>
              {selected.status === "tersewa" && (
                <button style={{ ...s.btn, ...s.btnDanger }} onClick={handleReset} disabled={loading}>
                  🗑️ Reset
                </button>
              )}
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowModal(false)}>Batal</button>
              <button style={{ ...s.btn, ...s.btnBlue }} onClick={handleSave} disabled={loading}>
                {loading ? "Menyimpan..." : "💾 Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========= STYLES =========
const s = {
  bg: { minHeight: "100vh", background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)", color: "#fff", fontFamily: "'Plus Jakarta Sans',sans-serif", paddingBottom: 40 },
  landing: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 },
  landingCard: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: "40px 32px", maxWidth: 420, width: "100%", textAlign: "center", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  emoji: { fontSize: 56, marginBottom: 4 },
  landingTitle: { fontSize: 28, fontWeight: 800, letterSpacing: -0.5 },
  landingSub: { color: "#a0c4d8", fontSize: 14, lineHeight: 1.6 },
  connTxt: { fontSize: 12, fontWeight: 600, marginTop: -4 },
  btnRow: { display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 8 },
  btn: { border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, borderRadius: 12, transition: "all 0.15s", padding: "12px 18px", fontSize: 14 },
  btnBlue: { background: "linear-gradient(135deg,#00b4d8,#0077b6)", color: "#fff" },
  btnGhost: { background: "rgba(255,255,255,0.1)", color: "#ccc", border: "1px solid rgba(255,255,255,0.15)" },
  btnShare: { background: "rgba(255,212,59,0.15)", color: "#ffd43b", border: "1px solid rgba(255,212,59,0.3)" },
  btnDanger: { background: "rgba(255,107,107,0.15)", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
  btnSmall: { padding: "7px 13px", fontSize: 12 },
  pinInput: { background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 12, color: "#fff", fontSize: 22, padding: "12px 20px", outline: "none", textAlign: "center", letterSpacing: 8, width: 220, fontFamily: "inherit" },
  pinErr: { borderColor: "#ff6b6b" },
  errTxt: { color: "#ff6b6b", fontSize: 13 },
  dot: (ok) => ({ width: 8, height: 8, borderRadius: "50%", background: ok ? "#51cf66" : "#aaa", boxShadow: ok ? "0 0 6px #51cf66" : "none", flexShrink: 0 }),
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", gap: 10 },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: 800 },
  headerSub: { fontSize: 11, color: "#a0c4d8", marginTop: 2 },
  headerRight: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  saveTxt: { fontSize: 12, color: "#51cf66", fontWeight: 700 },
  statsRow: { display: "flex", gap: 10, padding: "14px 18px 6px", flexWrap: "wrap" },
  stat: (col, bg) => ({ background: bg, border: `1px solid ${col}22`, borderRadius: 12, padding: "10px 18px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 72 }),
  statN: { fontSize: 26, fontWeight: 800 },
  statL: { fontSize: 11, color: "#a0c4d8", marginTop: 1 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 10, padding: "10px 18px" },
  card: { borderRadius: 14, padding: "14px 12px", border: "1px solid", display: "flex", flexDirection: "column", gap: 4, position: "relative", minHeight: 90, transition: "transform 0.15s, box-shadow 0.15s" },
  cardFree: { background: "rgba(81,207,102,0.07)", borderColor: "rgba(81,207,102,0.2)" },
  cardRented: { background: "rgba(255,107,107,0.09)", borderColor: "rgba(255,107,107,0.28)" },
  cardNum: { fontSize: 18, fontWeight: 800 },
  cardStatus: { fontSize: 11, fontWeight: 700 },
  cardBody: { display: "flex", flexDirection: "column", gap: 2, marginTop: 4 },
  cardName: { fontSize: 12, color: "#ffd43b", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardTime: { fontSize: 11, color: "#a0c4d8" },
  cardNote: { fontSize: 10, color: "#777", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  editTag: { position: "absolute", bottom: 8, right: 10, fontSize: 11, opacity: 0.35 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 },
  modal: { background: "#16293a", borderRadius: 20, padding: "24px 22px", width: "100%", maxWidth: 400, border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: 10 },
  modalTitle: { fontSize: 20, fontWeight: 800, marginBottom: 4 },
  lbl: { fontSize: 11, color: "#a0c4d8", fontWeight: 700, marginBottom: -4, textTransform: "uppercase", letterSpacing: 0.5 },
  inp: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: "#fff", fontSize: 14, padding: "10px 12px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.13)", background: "rgba(255,255,255,0.05)", color: "#888", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" },
  togGreen: { background: "rgba(81,207,102,0.18)", borderColor: "#51cf66", color: "#51cf66" },
  togRed: { background: "rgba(255,107,107,0.18)", borderColor: "#ff6b6b", color: "#ff6b6b" },
  modalBtns: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 },
};
