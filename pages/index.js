import { useState, useEffect } from "react";

export default function Home() {
  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [name, setName] = useState("");
  const [days, setDays] = useState(1);
  const [limit, setLimit] = useState(10);
  const [lifetime, setLifetime] = useState(false);
  
  const [keys, setKeys] = useState([]);
  const [showKeys, setShowKeys] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [customMsg, setCustomMsg] = useState("");

  useEffect(() => {
    const isAuth = localStorage.getItem("isLoggedIn");
    if (isAuth === "true") {
      setLogged(true);
      loadKeys();
    }
  }, []);

  const login = async () => {
    setLoginError(false);
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      localStorage.setItem("isLoggedIn", "true");
      setLogged(true);
      loadKeys();
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setLogged(false);
  };

  const createKey = async () => {
    await fetch("/api/create-key", {
      method: "POST",
      body: JSON.stringify({ name, days, limit, lifetime })
    });
    loadKeys();
  };

  const loadKeys = async () => {
    const res = await fetch("/api/get-keys");
    const data = await res.json();
    setKeys(data);
    setShowKeys(true);
  };

  const deleteKey = async (keyToDelete) => {
    const res = await fetch("/api/delete-key", {
      method: "POST",
      body: JSON.stringify({ key: keyToDelete })
    });
    if(res.ok) {
        setKeys(keys.filter(k => k.key !== keyToDelete));
    }
  };

  const openCustomMessageModal = (key, currentMsg) => {
    setActiveKey(key);
    setCustomMsg(currentMsg || ""); // നിലവിലുള്ള മെസ്സേജ് ഉണ്ടെങ്കിൽ അത് കാണിക്കാൻ
    setShowModal(true);
  };

  const saveCustomMessage = async () => {
    // API വഴി ഡാറ്റാബേസിലേക്ക് മെസ്സേജ് അയക്കുന്നു
    const res = await fetch("/api/set-custom-message", {
      method: "POST",
      body: JSON.stringify({ 
        key: activeKey, 
        message: customMsg 
      })
    });
    
    if(res.ok) {
      setShowModal(false);
      setCustomMsg("");
      loadKeys(); // ലിസ്റ്റ് റിഫ്രഷ് ചെയ്യുന്നു
    }
  };

  if (!logged) {
    return (
      <div style={styles.terminalContainer}>
        <div style={styles.scanline}></div>
        <div style={styles.loginBox}>
          <div style={styles.header}>
            <span style={styles.blink}>[</span> 
            <span style={styles.devTitle}>DEVELOPER VISHNU</span> 
            <span style={styles.blink}>]</span>
          </div>
          <p style={styles.statusText}>SYSTEM STATUS: SECURE_AUTH_REQUIRED</p>
          
          <div style={styles.inputGroup}>
            <input 
              style={styles.hackerInput} 
              placeholder="ACCESS_ID (EMAIL)" 
              onChange={e=>setEmail(e.target.value)} 
            />
            <input 
              style={styles.hackerInput} 
              type="password" 
              placeholder="PASS_CODE" 
              onChange={e=>setPassword(e.target.value)} 
            />
            {loginError && <p style={{color: '#ff0000', fontSize: '12px', textAlign: 'center', marginBottom: '10px'}}>INCORRECT_ACCESS_CREDENTIALS</p>}
            <button style={styles.hackerButton} onClick={login}>INITIATE_LOGIN</button>
          </div>
        </div>
        <style>{globalStyles}</style>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.scanline}></div>
      
      {/* --- Updated Top Bar with Compact Logout --- */}
      <div style={styles.topBar}>
        <h2 style={styles.dashTitle}>// DATABASE_DASHBOARD</h2>
        <button style={styles.logoutBtn} onClick={handleLogout}>[X] LOGOUT</button>
      </div>

      <div style={styles.controlPanel}>
        <input style={styles.hackerInput} placeholder="PROJECT_NAME" onChange={e=>setName(e.target.value)} />
        <input style={styles.hackerInput} type="number" placeholder="VALIDITY_DAYS" onChange={e=>setDays(Number(e.target.value))} />
        <input style={styles.hackerInput} type="number" placeholder="REQ_LIMIT" onChange={e=>setLimit(Number(e.target.value))} />

        <label style={styles.checkboxLabel}>
          <input type="checkbox" onChange={e=>setLifetime(e.target.checked)} />
          <span style={{marginLeft: '10px', color: '#00ff41'}}>ENABLE_LIFETIME_ACCESS</span>
        </label>

        <button style={styles.hackerButton} onClick={createKey}>GENERATE_KEY</button>
      </div>

      <div style={{marginBottom: '20px'}}>
        <button style={styles.refreshBtn} onClick={() => setShowKeys(!showKeys)}>
          {showKeys ? "HIDE_NODES" : "SHOW_NODES"}
        </button>
        <button style={{...styles.refreshBtn, marginLeft: '10px'}} onClick={loadKeys}>SYNC_DB</button>
      </div>

      {showKeys && (
        <div style={styles.keyGrid}>
            {keys.map(k => (
            <div key={k.key} style={styles.dataNode}>
                <div style={styles.nodeHeader}>NODE: {k.name}</div>
                <code style={styles.keyCode}>{k.key}</code>
                
                {/* Custom Message Status Display */}
                {k.custom_message ? (
                  <div style={styles.msgAlert}>STATUS: BLOCKED | "{k.custom_message}"</div>
                ) : (
                  <div style={{color: '#004d00', fontSize: '10px', marginBottom: '5px'}}>STATUS: ACTIVE (NO_RESTRICTIONS)</div>
                )}

                <div style={styles.nodeMeta}>
                  <p>LIMIT: {k.used}/{k.daily_limit}</p>
                  <p>EXP: {k.expiry || "LIFE"}</p>
                </div>
                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <button style={styles.deleteBtn} onClick={()=>deleteKey(k.key)}>DELETE</button>
                    <button style={styles.customBtn} onClick={()=>openCustomMessageModal(k.key, k.custom_message)}>SET_MSG</button>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Custom Message Modal */}
      {showModal && (
          <div style={styles.modalOverlay}>
              <div style={styles.loginBox}>
                  <h3 style={{color: '#00ff41', marginBottom: '15px', fontSize: '0.9rem'}}>SET_RESTRICTION_MESSAGE</h3>
                  <textarea 
                    style={{...styles.hackerInput, height: '80px', fontSize: '0.8rem'}} 
                    placeholder="Enter message to show when API is stopped..."
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                  />
                  <p style={{fontSize: '10px', color: '#555', marginBottom: '10px'}}>* Leave empty and save to UNBLOCK API.</p>
                  <button style={styles.hackerButton} onClick={saveCustomMessage}>UPDATE_RESTRICTION</button>
                  <button style={{...styles.deleteBtn, width: '100%', marginTop: '10px'}} onClick={()=>setShowModal(false)}>CLOSE</button>
              </div>
          </div>
      )}

      <style>{globalStyles}</style>
    </div>
  );
}

const globalStyles = `
  @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes scan { from { transform: translateY(0); } to { transform: translateY(100vh); } }
  body, html { margin: 0; padding: 0; background-color: #000; overflow-x: hidden; }
  * { box-sizing: border-box; }
`;

const styles = {
  // ... (മുൻപത്തെ styles നിലനിർത്തുന്നു, താഴെ പറയുന്നവ അപ്ഡേറ്റ് ചെയ്തു)
  terminalContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", background: "#000", fontFamily: "'Courier New', monospace", position: "fixed", top: 0, left: 0 },
  scanline: { width: "100%", height: "2px", background: "rgba(0, 255, 65, 0.05)", position: "absolute", top: 0, left: 0, zIndex: 10, pointerEvents: "none", animation: "scan 6s linear infinite" },
  loginBox: { background: "rgba(0, 5, 0, 0.98)", padding: "30px", border: "1px solid #00ff41", boxShadow: "0 0 40px rgba(0, 255, 65, 0.1)", width: "90%", maxWidth: "380px", zIndex: 20 },
  header: { textAlign: "center", marginBottom: "10px" },
  devTitle: { color: "#00ff41", fontSize: "1.1rem", fontWeight: "bold", textShadow: "0 0 10px #00ff41" },
  blink: { color: "#00ff41", animation: "blink 1s step-end infinite" },
  statusText: { color: "#004d00", fontSize: "0.6rem", textAlign: "center", marginBottom: "20px", letterSpacing: "2px" },
  inputGroup: { display: "flex", flexDirection: "column" },
  hackerInput: { width: "100%", padding: "10px", marginBottom: "12px", background: "#000", border: "1px solid #004d00", color: "#00ff41", outline: "none", fontSize: "0.85rem", fontFamily: "'Courier New', monospace" },
  hackerButton: { width: "100%", padding: "10px", background: "#00ff41", color: "#000", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" },
  
  dashboardContainer: { padding: "20px", minHeight: "100vh", width: "100%", background: "#000", color: "#00ff41", fontFamily: "'Courier New', monospace" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #002200", marginBottom: "30px", paddingBottom: "10px" },
  dashTitle: { fontSize: "0.9rem", margin: 0, color: "#00ff41" },
  logoutBtn: { background: "transparent", border: "1px solid #ff0000", color: "#ff0000", padding: "4px 10px", cursor: "pointer", fontSize: "0.65rem", transition: "0.3s" },
  
  controlPanel: { background: "#050505", padding: "15px", border: "1px solid #002200", marginBottom: "20px" },
  checkboxLabel: { display: "flex", alignItems: "center", marginBottom: "15px", fontSize: "0.75rem" },
  refreshBtn: { background: "transparent", border: "1px solid #004d00", color: "#008f11", padding: "6px 12px", cursor: "pointer", fontSize: "0.7rem" },
  keyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" },
  dataNode: { border: "1px solid #002200", padding: "12px", background: "#030303" },
  nodeHeader: { fontSize: "0.65rem", color: "#004d00", marginBottom: "8px" },
  keyCode: { display: "block", background: "#000", padding: "6px", border: "1px dashed #004d00", fontSize: "0.75rem", marginBottom: "8px", overflowX: "auto" },
  nodeMeta: { fontSize: "0.7rem", opacity: 0.7 },
  msgAlert: { color: "#ffcc00", fontSize: "9px", marginBottom: "8px", border: "1px solid #332200", padding: "3px" },
  deleteBtn: { background: "transparent", border: "1px solid #440000", color: "#880000", padding: "4px 8px", cursor: "pointer", fontSize: "0.65rem" },
  customBtn: { background: "transparent", border: "1px solid #00ff41", color: "#00ff41", padding: "4px 8px", cursor: "pointer", fontSize: "0.65rem" },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }
};
        
