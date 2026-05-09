import { useState, useEffect } from "react";

export default function Home() {
  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [days, setDays] = useState(1);
  const [limit, setLimit] = useState(10);
  const [lifetime, setLifetime] = useState(false);
  const [keys, setKeys] = useState([]);

  // Login Function logic
  const login = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (res.ok) setLogged(true);
    else alert("Login failed");
  };

  // Key Generation logic
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
  };

  const deleteKey = async (key) => {
    await fetch("/api/delete-key", {
      method: "POST",
      body: JSON.stringify({ key })
    });
    loadKeys();
  };

  // Login UI Component
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
            <button style={styles.hackerButton} onClick={login}>INITIATE_LOGIN</button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard UI Component
  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.scanline}></div>
      <h2 style={styles.dashTitle}>// DATABASE_DASHBOARD</h2>

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

      <button style={styles.refreshBtn} onClick={loadKeys}>SYNC_DATABASE</button>

      <div style={styles.keyGrid}>
        {keys.map(k => (
          <div key={k.key} style={styles.dataNode}>
            <div style={styles.nodeHeader}>NODE: {k.name}</div>
            <code style={styles.keyCode}>{k.key}</code>
            <div style={styles.nodeMeta}>
              <p>THRESHOLD: {k.daily_limit}</p>
              <p>TTL: {k.expiry || "PERSISTENT"}</p>
            </div>
            <button style={styles.deleteBtn} onClick={()=>deleteKey(k.key)}>TERMINATE</button>
          </div>
        ))}
      </div>

      {/* Adding required animations to the global style */}
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
        body {
          margin: 0;
          padding: 0;
          background: #000;
        }
      `}</style>
    </div>
  );
}

const styles = {
  terminalContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#000",
    fontFamily: "'Courier New', Courier, monospace",
    overflow: "hidden",
    position: "relative"
  },
  scanline: {
    width: "100%",
    height: "2px",
    background: "rgba(0, 255, 65, 0.1)",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    pointerEvents: "none",
    animation: "scan 4s linear infinite"
  },
  loginBox: {
    background: "rgba(0, 15, 0, 0.95)",
    padding: "40px",
    borderRadius: "4px",
    border: "1px solid #00ff41",
    boxShadow: "0 0 30px rgba(0, 255, 65, 0.15)",
    width: "100%",
    maxWidth: "420px",
    zIndex: 5,
    boxSizing: "border-box"
  },
  header: {
    textAlign: "center",
    marginBottom: "10px"
  },
  devTitle: {
    color: "#00ff41",
    fontSize: "1.4rem",
    fontWeight: "bold",
    textShadow: "0 0 8px #00ff41"
  },
  blink: {
    color: "#00ff41",
    animation: "blink 1.2s step-end infinite"
  },
  statusText: {
    color: "#008f11",
    fontSize: "0.7rem",
    textAlign: "center",
    marginBottom: "30px",
    letterSpacing: "2px",
    textTransform: "uppercase"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  hackerInput: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    background: "#050505",
    border: "1px solid #004d00",
    color: "#00ff41",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "0.9rem",
    fontFamily: "'Courier New', monospace"
  },
  hackerButton: {
    width: "100%",
    padding: "14px",
    background: "#00ff41",
    color: "#000",
    border: "none",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(0, 255, 65, 0.4)",
    transition: "0.2s",
    textTransform: "uppercase"
  },
  dashboardContainer: {
    padding: "40px",
    minHeight: "100vh",
    background: "#000",
    color: "#00ff41",
    fontFamily: "'Courier New', monospace",
    position: "relative",
    boxSizing: "border-box"
  },
  dashTitle: {
    borderBottom: "1px solid #00ff41",
    paddingBottom: "10px",
    marginBottom: "30px",
    fontSize: "1.2rem",
    letterSpacing: "1px"
  },
  controlPanel: {
    background: "rgba(0, 20, 0, 0.5)",
    padding: "25px",
    border: "1px solid #004d00",
    marginBottom: "30px",
    borderRadius: "4px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    fontSize: "0.8rem",
    cursor: "pointer"
  },
  refreshBtn: {
    background: "transparent",
    border: "1px solid #00ff41",
    color: "#00ff41",
    padding: "10px 25px",
    cursor: "pointer",
    marginBottom: "25px",
    fontSize: "0.8rem",
    fontWeight: "bold"
  },
  keyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "25px"
  },
  dataNode: {
    border: "1px solid #004d00",
    padding: "20px",
    background: "linear-gradient(135deg, #001000 0%, #000 100%)",
    borderRadius: "4px"
  },
  nodeHeader: {
    color: "#00ff41",
    fontSize: "0.75rem",
    marginBottom: "12px",
    opacity: 0.8,
    borderBottom: "1px solid #002200",
    paddingBottom: "5px"
  },
  keyCode: {
    display: "block",
    background: "#000",
    padding: "12px",
    border: "1px solid #004d00",
    marginBottom: "15px",
    fontSize: "0.85rem",
    color: "#00ff41",
    wordBreak: "break-all"
  },
  nodeMeta: {
    fontSize: "0.8rem",
    color: "#008f11",
    lineHeight: "1.6"
  },
  deleteBtn: {
    marginTop: "15px",
    background: "transparent",
    border: "1px solid #ff4444",
    color: "#ff4444",
    padding: "6px 15px",
    cursor: "pointer",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    transition: "0.3s"
  }
};
    
