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

  // Session Check
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

  const loadKeys = async () => {
    const res = await fetch("/api/get-keys");
    const data = await res.json();
    setKeys(data);
    setShowKeys(true);
  };

  const createKey = async () => {
    await fetch("/api/create-key", {
      method: "POST",
      body: JSON.stringify({ name, days, limit, lifetime })
    });
    loadKeys();
  };

  const deleteKey = async (keyToDelete) => {
    if(!confirm("Are you sure?")) return;
    const res = await fetch("/api/delete-key", {
      method: "POST",
      body: JSON.stringify({ key: keyToDelete })
    });
    if(res.ok) loadKeys();
  };

  // --- Modal Functions ---
  const openCustomMessageModal = (key, currentMsg) => {
    setActiveKey(key);
    setCustomMsg(currentMsg || ""); 
    setShowModal(true);
  };

  const saveCustomMessage = async () => {
    try {
      const res = await fetch("/api/set-custom-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          key: activeKey, 
          message: customMsg.trim() // Empty message means unblock
        })
      });
      
      if(res.ok) {
        setShowModal(false);
        loadKeys(); 
        alert("Success: Database Node Updated!");
      } else {
        alert("Error: Update failed.");
      }
    } catch (err) {
      alert("System Error!");
    }
  };

  if (!logged) {
    return (
      <div style={styles.terminalContainer}>
        <div style={styles.scanline}></div>
        <div style={styles.loginBox}>
          <div style={styles.header}><span style={styles.devTitle}>[ DEVELOPER VISHNU ]</span></div>
          <div style={styles.inputGroup}>
            <input style={styles.hackerInput} placeholder="ACCESS_ID" onChange={e=>setEmail(e.target.value)} />
            <input style={styles.hackerInput} type="password" placeholder="PASS_CODE" onChange={e=>setPassword(e.target.value)} />
            {loginError && <p style={{color: '#ff0000', fontSize: '10px'}}>AUTH_FAILED</p>}
            <button style={styles.hackerButton} onClick={login}>INITIATE_LOGIN</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.scanline}></div>
      <div style={styles.topBar}>
        <h2 style={styles.dashTitle}>// SYSTEM_CONTROL_v3</h2>
        <button style={styles.logoutBtn} onClick={handleLogout}>[X] LOGOUT</button>
      </div>

      <div style={styles.controlPanel}>
        <input style={styles.hackerInput} placeholder="PROJECT_NAME" onChange={e=>setName(e.target.value)} />
        <input style={styles.hackerInput} type="number" placeholder="DAYS" onChange={e=>setDays(Number(e.target.value))} />
        <input style={styles.hackerInput} type="number" placeholder="LIMIT" onChange={e=>setLimit(Number(e.target.value))} />
        <button style={styles.hackerButton} onClick={createKey}>GENERATE_KEY</button>
      </div>

      <div style={{marginBottom: '20px'}}>
        <button style={styles.refreshBtn} onClick={() => setShowKeys(!showKeys)}>TOGGLE_NODES</button>
        <button style={{...styles.refreshBtn, marginLeft: '10px'}} onClick={loadKeys}>SYNC_DB</button>
      </div>

      {showKeys && (
        <div style={styles.keyGrid}>
            {keys.map(k => (
            <div key={k.key} style={styles.dataNode}>
                <div style={styles.nodeHeader}>NODE: {k.name}</div>
                <code style={styles.keyCode}>{k.key}</code>
                {k.custom_message ? (
                  <div style={styles.msgAlert}>BLOCKED: {k.custom_message}</div>
                ) : (
                  <div style={{color: '#004d00', fontSize: '9px', marginBottom: '5px'}}>STATUS: ACTIVE</div>
                )}
                <div style={styles.nodeMeta}>
                  <p>USED: {k.used} | LIMIT: {k.daily_limit}</p>
                </div>
                <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                    <button style={styles.customBtn} onClick={()=>openCustomMessageModal(k.key, k.custom_message)}>SET_MSG</button>
                    <button style={styles.deleteBtn} onClick={()=>deleteKey(k.key)}>DROP</button>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Modal Section */}
      {showModal && (
          <div style={styles.modalOverlay}>
              <div style={styles.loginBox}>
                  <h3 style={{color: '#00ff41', fontSize: '14px'}}>SET_RESTRICTION</h3>
                  <textarea 
                    style={{...styles.hackerInput, height: '70px'}} 
                    placeholder="Enter message to stop API..."
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                  />
                  <button style={styles.hackerButton} onClick={saveCustomMessage}>CONFIRM_UPDATE</button>
                  <button style={{...styles.deleteBtn, width: '100%', marginTop: '10px'}} onClick={()=>setShowModal(false)}>CANCEL</button>
              </div>
          </div>
      )}
    </div>
  );
}

const styles = {
  terminalContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#000", fontFamily: "monospace" },
  scanline: { width: "100%", height: "2px", background: "rgba(0, 255, 65, 0.03)", position: "absolute", top: 0, pointerEvents: "none" },
  loginBox: { background: "#050505", padding: "30px", border: "1px solid #00ff41", width: "90%", maxWidth: "350px", position: "relative" },
  devTitle: { color: "#00ff41", fontSize: "1rem", fontWeight: "bold" },
  hackerInput: { width: "100%", padding: "10px", marginBottom: "10px", background: "#000", border: "1px solid #004d00", color: "#00ff41", fontFamily: "monospace" },
  hackerButton: { width: "100%", padding: "10px", background: "#00ff41", color: "#000", border: "none", fontWeight: "bold", cursor: "pointer" },
  dashboardContainer: { padding: "20px", background: "#000", minHeight: "100vh", color: "#00ff41", fontFamily: "monospace" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid #002200" },
  logoutBtn: { background: "transparent", border: "1px solid #ff0000", color: "#ff0000", padding: "4px 8px", fontSize: "10px", cursor: "pointer" },
  controlPanel: { background: "#030303", padding: "15px", border: "1px solid #002200", marginBottom: "20px" },
  refreshBtn: { background: "transparent", border: "1px solid #004d00", color: "#008f11", padding: "5px 10px", fontSize: "11px" },
  keyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "15px" },
  dataNode: { border: "1px solid #002200", padding: "12px", background: "#020202" },
  keyCode: { display: "block", background: "#000", padding: "5px", fontSize: "11px", border: "1px dashed #004d00" },
  msgAlert: { color: "#ffcc00", fontSize: "9px", margin: "5px 0" },
  deleteBtn: { border: "1px solid #440000", color: "#ff0000", background: "transparent", padding: "4px 8px", fontSize: "10px" },
  customBtn: { border: "1px solid #00ff41", color: "#00ff41", background: "transparent", padding: "4px 8px", fontSize: "10px" },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center' }
};
    
