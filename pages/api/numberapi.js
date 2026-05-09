import { supabase } from "../../lib/supabase";

let indexCache = null;
let fileCache = {};

async function getIndex() {
  if (!indexCache) {
    const res = await fetch(
      "https://cdn.jsdelivr.net/gh/harshsingh9817/Osint-api@main/index.json"
    );
    const text = await res.text();
    if (!text.startsWith("{")) {
      throw new Error("Index not valid JSON");
    }
    indexCache = JSON.parse(text);
  }
  return indexCache;
}

async function loadChunk(file) {
  if (!fileCache[file]) {
    const res = await fetch(
      `https://raw.githubusercontent.com/vishnuxxxxxx/vishnu-Osint-api/main/chunks/${file}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.startsWith("[")) return null;
    const data = JSON.parse(text);
    const map = {};
    for (let item of data) {
      map[String(item.mobile)] = item;
    }
    fileCache[file] = map;
  }
  return fileCache[file];
}

export default async function handler(req, res) {
  try {
    const { key, userid } = req.query;

    if (!key || !userid) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // 🔐 1. KEY VALIDATION & DATA RETRIEVAL
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key", key)
      .single();

    if (!data || error) {
      return res.status(403).json({ error: "key closed contact owner vishnu" });
    }

    // 🚨 2. CUSTOM MESSAGE / BLOCK CHECK (വിഷ്ണു, ഈ ഭാഗമാണ് പ്രധാനം)
    // ഡാറ്റാബേസിൽ custom_message കോളത്തിൽ എന്തെങ്കിലും ടെക്സ്റ്റ് ഉണ്ടെങ്കിൽ സെർച്ച് ബ്ലോക്ക് ചെയ്യും
    if (data.custom_message && data.custom_message.trim() !== "") {
      return res.status(403).json({ 
        status: "restricted",
        message: data.custom_message 
      });
    }

    // ⏳ 3. EXPIRY CHECK
    if (data.expiry && new Date() > new Date(data.expiry)) {
      return res.status(403).json({ error: "Key has expired" });
    }

    // 📊 4. USAGE LIMIT CHECK
    const today = new Date().toDateString();
    let usedCount = data.used;

    if (data.last_reset !== today) {
      usedCount = 0;
    }

    if (usedCount >= data.daily_limit) {
      return res.status(429).json({ error: "Daily limit reached" });
    }

    // 🔄 5. UPDATE USAGE IN DB
    await supabase
      .from("api_keys")
      .update({
        used: usedCount + 1,
        last_reset: today
      })
      .eq("key", key);

    // 🔍 6. DATA SEARCH LOGIC
    const index = await getIndex();
    const prefix = userid.slice(0, 4);
    const files = index[prefix];

    if (!files) {
      return res.status(404).json({ error: "No data found for this prefix" });
    }

    for (let file of files) {
      const chunk = await loadChunk(file);
      if (!chunk) continue;
      if (chunk[userid]) {
        return res.json({
          status: "success",
          data: chunk[userid]
        });
      }
    }

    return res.status(404).json({ error: "Record not found" });

  } catch (err) {
    console.error("API_ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
