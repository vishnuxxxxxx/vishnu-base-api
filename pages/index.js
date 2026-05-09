import { useState } from "react";

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
      <div style={styles.center}>
        <div style={styles.card}>
          <div style={styles.branding}>
            <h3 style={styles.devName}>DEVELOPER VISHNU</h3>
            <p style={styles.subText}>Secure Database API Access</p>
          </div>
          <h2 style={styles.title}>Admin Login</h2>
          <input 
            style={styles.input} 
            placeholder="Email" 
            onChange={e=>setEmail(e.target.value)} 
          />
          <input 
            style={styles.input} 
            type="password" 
            placeholder="Password" 
            onChange={e=>setPassword(e.target.value)} 
          />
          <button style={styles.button} onClick={login}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <h2 style={styles.title}>API Dashboard</h2>

      <div style={styles.card}>
        <input style={styles.input} placeholder="API Name" onChange={e=>setName(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Days" onChange={e=>setDays(Number(e.target.value))} />
        <input style={styles.input} type="number" placeholder="Limit" onChange={e=>setLimit(Number(e.target.value))} />

        <label style={styles.label}>
          <input type="checkbox" onChange={e=>setLifetime(e.target.checked)} />
          <span style={{marginLeft: '8px'}}>Lifetime Key</span>
        </label>

        <button style={styles.button} onClick={createKey}>Create Key</button>
      </div>

      <button style={styles.refreshBtn} onClick={loadKeys}>Refresh Database</button>

      <div style={styles.grid}>
        {keys.map(k => (
          <div key={k.key} style={styles.keyCard}>
            <p style={styles.keyName}><b>{k.name}</b></p>
            <code style={styles.keyCode}>{k.key}</code>
            <div style={styles.keyDetails}>
              <p>Limit: {k.daily_limit}</p>
              <p>Expiry: {k.expiry || "Lifetime"}</p>
            </div>
            <button style={styles.deleteBtn} onClick={()=>deleteKey(k.key)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  dashboardContainer: {
    padding: "40px",
    minHeight: "100vh",
    background: "#0f172a",
    color: "#f8fafc",
    fontFamily: "'Segoe UI', sans-serif"
  },
  branding: {
    textAlign: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #334155",
    paddingBottom: "15px"
  },
  devName: {
    color: "#38bdf8",
    letterSpacing: "3px",
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "800"
  },
  subText: {
    color: "#94a3b8",
    fontSize: "0.8rem",
    margin: "5px 0 0 0"
  },
  card: {
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(10px)",
    color: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid #334155"
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    fontWeight: "600",
    color: "#f8fafc"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
    outline: "none",
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#38bdf8",
    color: "#0f172a",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
    marginTop: "10px"
  },
  label: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    fontSize: "0.9rem",
    color: "#94a3b8"
  },
  refreshBtn: {
    background: "transparent",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
    padding: "8px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    margin: "20px 0"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px"
  },
  keyCard: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    borderLeft: "4px solid #38bdf8"
  },
  keyName: {
    fontSize: "1.1rem",
    color: "#38bdf8",
    margin: "0 0 10px 0"
  },
  keyCode: {
    display: "block",
    background: "#0f172a",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    color: "#94a3b8",
    marginBottom: "10px",
    wordBreak: "break-all"
  },
  keyDetails: {
    fontSize: "0.9rem",
    color: "#cbd5e1"
  },
  deleteBtn: {
    background: "#ef4444",
    border: "none",
    color: "white",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px"
  }
};
                                                                                
