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
          <h2>Admin Login</h2>
          <input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>API Dashboard</h2>

      <div style={styles.card}>
        <input placeholder="API Name" onChange={e=>setName(e.target.value)} />
        <input type="number" placeholder="Days" onChange={e=>setDays(Number(e.target.value))} />
        <input type="number" placeholder="Limit" onChange={e=>setLimit(Number(e.target.value))} />

        <label>
          <input type="checkbox" onChange={e=>setLifetime(e.target.checked)} />
          Lifetime Key
        </label>

        <button onClick={createKey}>Create Key</button>
      </div>

      <button onClick={loadKeys}>Refresh</button>

      {keys.map(k => (
        <div key={k.key} style={styles.card}>
          <p><b>{k.name}</b></p>
          <p>{k.key}</p>
          <p>Limit: {k.daily_limit}</p>
          <p>Expiry: {k.expiry || "Lifetime"}</p>
          <button onClick={()=>deleteKey(k.key)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#0f172a"
  },
  card: {
    background: "#1e293b",
    color: "white",
    padding: 20,
    margin: 10,
    borderRadius: 10
  }
};