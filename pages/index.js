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
      headers: { "Content-Type": "application/json" },
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

  const loadKeys = async () => {
    const res = await fetch("/api/get-keys");
    const data = await res.json();
    setKeys(data);
    setShowKeys(true);
  };

  const createKey = async () => {
    await fetch("/api/create-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, days, limit, lifetime })
    });
    loadKeys();
  };

  const deleteKey = async (keyToDelete) => {
    if(!confirm("TERMINATE THIS NODE?")) return;
    const res = await fetch("/api/delete-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: keyToDelete })
    });
    if(res.ok) loadKeys();
  };

  const openCustomMessageModal = (key, existingMsg) => {
    setActiveKey(key);
    setCustomMsg(existingMsg || "");
    setShowModal(true);
  };

  const saveCustomMessage = async () => {
    const res = await fetch("/api/set-custom-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        key: activeKey, 
        message: customMsg.trim() 
      })
    });
    
    if(res.ok) {
      setShowModal(false);
      setCustomMsg("");
      loadKeys();
      alert("DATABASE_NODE_UPDATED");
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
          <div style={styles.inputGroup}>
            <input style={styles.hackerInput} placeholder="ACCESS_ID" onChange={e=>setEmail(e.target.value)} />
            <input style={styles.hackerInput} type="password" placeholder="PASS_CODE" onChange={e=>setPassword(e.target.value)} />
            {loginError && <p style={{color: '#ff0000', fontSize: '10px', textAlign: 'center'}}>INVALID_CREDENTIALS</p>}
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
      
      <div style={styles.topBar}>
        <h2 style={styles.dashTitle}>// SYSTEM_CONTROL_DASHBOARD</h2>
        <button style={styles.logoutBtn} onClick={handleLogout}>[X] LOGOUT</button>
      </div>

      <div style={styles.controlPanel}>
        <input style={styles.hackerInput} placeholder="PROJECT_NAME" onChange={e=>setName(e.target.value)} />
        <input style={styles.hackerInput} type="number" placeholder="DAYS" onChange={e=>setDays(Number(e.target.value))} />
        <input style={styles.hackerInput} type="number" placeholder="LIMIT" onChange={e=>setLimit(Number(e.target.value))} />
        <label style={styles.checkboxLabel}>
          <input type="checkbox" onChange={e=>setLifetime(e.target.checked)} />
          <span style={{marginLeft: '10px'}}>LIFETIME_ACCESS</span>
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
                {k.custom_message ? (
                  <div style={styles.msgAlert}>BLOCK_MSG: {k.custom_message}</div>
                ) : (
                  <div style={{color: '#004d00', fontSize: '9px', marginBottom: '5px'}}>STATUS: ACTIVE</div>
                )}
                <div style={styles.nodeMeta}>
                  <p>LIMIT: {k.used}/{k.daily_limit}</p>
                  <p>TTL: {k.expiry || "PERSISTENT"}</p>
                </div>
                <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                    <button style={styles.customBtn} onClick={()=>openCustomMessageModal(k.key, k.custom_message)}>SET_MSG</button>
                    <button style={styles.deleteBtn} onClick={()=>deleteKey(k.key)}>DROP</button>
                </div>
            </div>
            ))}
        </div>
      )}

      {showModal && (
          <div style={styles.modalOverlay}>
              <div style={styles.loginBox}>
                  <h3 style={{color: '#00ff41', fontSize: '14px', marginBottom: '15px'}}>SET_RESTRICTION_MSG</h3>
                  <textarea 
                    style={{...styles.hackerInput, height: '70px', fontSize: '12px'}} 
                    placeholder="Message to show user when API is stopped..."
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                  />
                  <button style={styles.hackerButton} onClick={saveCustomMessage}>UPDATE_NODE</button>
                  <button style={{...styles.deleteBtn, width: '100%', marginTop: '10px', padding: '8px'}} onClick={()=>setShowModal(false)}>CANCEL</button>
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
  body, html { margin: 0; padding: 0; background-color: #000; color: #00ff41; font-family: monospace; overflow-x: hidden; }
  * { box-sizing: border-box; }
`;

const styles = {
  terminalContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#000" },
  scanline: { width: "100%", height: "2px", background: "rgba(0, 255, 65, 0.05)", position: "absolute", top: 0, animation: "scan 6s linear infinite", pointerEvents: "none" },
  loginBox: { background: "#050505", padding: "25px", border: "1px solid #00ff41", width: "90%", maxWidth: "360px", zIndex: 20 },
  header: { textAlign: "center", marginBottom: "20px" },
  devTitle: { color: "#00ff41", fontSize: "1.1rem", fontWeight: "bold", textShadow: "0 0 5px #00ff41" },
  blink: { color: "#00ff41", animation: "blink 1s step-end infinite" },
  inputGroup: { display: "flex", flexDirection: "column" },
  hackerInput: { width: "100%", padding: "10px", marginBottom: "10px", background: "#000", border: "1px solid #004d00", color: "#00ff41", outline: "none", fontFamily: "monospace" },
  hackerButton: { width: "100%", padding: "10px", background: "#00ff41", color: "#000", border: "none", fontWeight: "bold", cursor: "pointer" },
  
  dashboardContainer: { padding: "20px", minHeight: "100vh", width: "100%", background: "#000" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #002200", marginBottom: "25px", paddingBottom: "10px" },
  dashTitle: { fontSize: "0.9rem", margin: 0 },
  logoutBtn: { background: "transparent", border: "1px solid #ff0000", color: "#ff0000", padding: "4px 8px", cursor: "pointer", fontSize: "10px" },
  
  controlPanel: { background: "#030303", padding: "15px", border: "1px solid #002200", marginBottom: "20px" },
  checkboxLabel: { display: "flex", alignItems: "center", marginBottom: "12px", fontSize: "11px" },
  refreshBtn: { background: "transparent", border: "1px solid #004d00", color: "#008f11", padding: "5px 10px", cursor: "pointer", fontSize: "11px" },
  keyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" },
  dataNode: { border: "1px solid #002200", padding: "12px", background: "#020202" },
  nodeHeader: { fontSize: "10px", color: "#004d00", marginBottom: "8px" },
  keyCode: { display: "block", background: "#000", padding: "6px", border: "1px dashed #004d00", fontSize: "11px", marginBottom: "8px", overflowX: "auto" },
  nodeMeta: { fontSize: "11px", opacity: 0.7 },
  msgAlert: { color: "#ffcc00", fontSize: "9px", margin: "5px 0" },
  deleteBtn: { background: "transparent", border: "1px solid #440000", color: "#880000", padding: "4px 8px", cursor: "pointer", fontSize: "10px" },
  customBtn: { background: "transparent", border: "1px solid #00ff41", color: "#00ff41", padding: "4px 8px", cursor: "pointer", fontSize: "10px" },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }
};
    
