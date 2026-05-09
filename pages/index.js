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

  const login = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (res.ok) setLogged(true);
    else alert("Login failed");
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
  };

  const deleteKey = async (key) => {
    await fetch("/api/delete-key", {
      method: "POST",
      body: JSON.stringify({ key })
    });
    loadKeys();
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
            <button style={styles.hackerButton} onClick={login}>INITIATE_LOGIN</button>
          </div>
        </div>
      </div>
    );
  }

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
    zIndex: 10,
    pointerEvents: "none",
    animation: "scan 4s linear infinite"
  },
  loginBox: {
    background: "rgba(0, 20, 0, 0.9)",
    padding: "40px",
    borderRadius: "2px",
    border: "1px solid #00ff41",
    boxShadow: "0 0 20px rgba(0, 255, 65, 0.2)",
    width: "100%",
    maxWidth: "400px",
    zIndex: 5
  },
  header: {
    textAlign: "center",
    marginBottom: "10px"
  },
  devTitle: {
    color: "#00ff41",
    fontSize: "1.5rem",
    fontWeight: "bold",
    textShadow: "0 0 10px #00ff41"
  },
  blink: {
    color: "#00ff41",
    animation: "blink 1s infinite"
  },
  statusText: {
    color: "#008f11",
    fontSize: "0.7rem",
    textAlign: "center",
    marginBottom: "30px",
    letterSpacing: "1px"
  },
  hackerInput: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    background: "#000",
    border: "1px solid #008f11",
    color: "#00ff41",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "0.9rem"
  },
  hackerButton: {
    width: "100%",
    padding: "12px",
    background: "#00ff41",
    color: "#000",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 10px #00ff41",
    transition: "0.3s"
  },
  dashboardContainer: {
    padding: "40px",
    minHeight: "100vh",
    background: "#050505",
    color: "#00ff41",
    fontFamily: "'Courier New', monospace",
    position: "relative"
  },
  dashTitle: {
    borderBottom: "1px solid #00ff41",
    paddingBottom: "10px",
    marginBottom: "30px"
  },
  controlPanel: {
    background: "#0a0a0a",
    padding: "20px",
    border: "1px solid #004d00",
    marginBottom: "30px"
  },
  checkboxLabel: {
    display: "block",
    marginBottom: "20px",
    fontSize: "0.8rem"
  },
  refreshBtn: {
    background: "transparent",
    border: "1px solid #00ff41",
    color: "#00ff41",
    padding: "10px 20px",
    cursor: "pointer",
    marginBottom: "20px"
  },
  keyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px"
  },
  dataNode: {
    border: "1px solid #004d00",
    padding: "15px",
    background: "rgba(0, 20, 0, 0.5)"
  },
  nodeHeader: {
    color: "#00ff41",
    fontSize: "0.8rem",
    marginBottom: "10px",
    opacity: 0.7
  },
  keyCode: {
    display: "block",
    background: "#000",
    padding: "10px",
    border: "1px dashed #008f11",
    marginBottom: "10px",
    fontSize: "0.8rem"
  },
  nodeMeta: {
    fontSize: "0.8rem",
    color: "#008f11"
  },
  deleteBtn: {
    marginTop: "15px",
    background: "transparent",
    border: "1px solid #ff0000",
    color: "#ff0000",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "0.7rem"
  }
};
      
