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
        <style>{globalStyles}</style>
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
      <style>{globalStyles}</style>
    </div>
  );
}

const globalStyles = `
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes scan {
    from { transform: translateY(0); }
    to { transform: translateY(100vh); }
  }
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    background-color: #000 !important;
    overflow-x: hidden;
  }
  * {
    box-sizing: border-box;
  }
`;

const styles = {
  terminalContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    background: "#000",
    fontFamily: "'Courier New', monospace",
    position: "fixed",
    top: 0,
    left: 0
  },
  scanline: {
    width: "100%",
    height: "2px",
    background: "rgba(0, 255, 65, 0.05)",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    pointerEvents: "none",
    animation: "scan 6s linear infinite"
  },
  loginBox: {
    background: "rgba(0, 5, 0, 0.98)",
    padding: "40px",
    border: "1px solid #00ff41",
    boxShadow: "0 0 40px rgba(0, 255, 65, 0.1)",
    width: "90%",
    maxWidth: "400px",
    zIndex: 20
  },
  header: {
    textAlign: "center",
    marginBottom: "10px"
  },
  devTitle: {
    color: "#00ff41",
    fontSize: "1.3rem",
    fontWeight: "bold",
    textShadow: "0 0 10px #00ff41"
  },
  blink: {
    color: "#00ff41",
    animation: "blink 1s step-end infinite"
  },
  statusText: {
    color: "#004d00",
    fontSize: "0.65rem",
    textAlign: "center",
    marginBottom: "30px",
    letterSpacing: "3px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column"
  },
  hackerInput: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    background: "#000",
    border: "1px solid #004d00",
    color: "#00ff41",
    outline: "none",
    fontSize: "0.9rem",
    fontFamily: "'Courier New', monospace"
  },
  hackerButton: {
    width: "100%",
    padding: "12px",
    background: "#00ff41",
    color: "#000",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    textTransform: "uppercase"
  },
  dashboardContainer: {
    padding: "40px",
    minHeight: "100vh",
    width: "100%",
    background: "#000",
    color: "#00ff41",
    fontFamily: "'Courier New', monospace"
  },
  dashTitle: {
    borderBottom: "1px solid #004d00",
    paddingBottom: "15px",
    marginBottom: "40px",
    fontSize: "1.1rem"
  },
  controlPanel: {
    background: "#050505",
    padding: "20px",
    border: "1px solid #002200",
    marginBottom: "30px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    fontSize: "0.8rem"
  },
  refreshBtn: {
    background: "transparent",
    border: "1px solid #004d00",
    color: "#008f11",
    padding: "8px 15px",
    cursor: "pointer",
    marginBottom: "20px"
  },
  keyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px"
  },
  dataNode: {
    border: "1px solid #002200",
    padding: "15px",
    background: "#030303"
  },
  nodeHeader: {
    fontSize: "0.7rem",
    color: "#004d00",
    marginBottom: "10px"
  },
  keyCode: {
    display: "block",
    background: "#000",
    padding: "8px",
    border: "1px dashed #004d00",
    fontSize: "0.8rem",
    marginBottom: "10px"
  },
  nodeMeta: {
    fontSize: "0.75rem",
    opacity: 0.7
  },
  deleteBtn: {
    marginTop: "10px",
    background: "transparent",
    border: "1px solid #440000",
    color: "#880000",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "0.7rem"
  }
};
    
