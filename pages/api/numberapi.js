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
      return res.status(400).json({ error: "Missing params" });
    }

    // 🔐 CHECK API KEY
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key", key)
      .single();

    if (!data) {
      return res.status(403).json({ error: "Invalid key" });
    }

    // --- 🚨 CUSTOM MESSAGE CHECK (ഇവിടെയാണ് മാറ്റം) ---
    // ഡാറ്റാബേസിൽ custom_message ഉണ്ടെങ്കിൽ അത് ഉടനെ കാണിക്കും
    if (data.custom_message && data.custom_message.trim() !== "") {
      return res.json({ 
        status: "blocked",
        custom: true,
        message: data.custom_message 
      });
    }

    if (data.expiry && new Date() > new Date(data.expiry)) {
      return res.status(403).json({ error: "Key expired" });
    }

    const today = new Date().toDateString();
    let used = data.used;

    if (data.last_reset !== today) {
      used = 0;
    }

    if (used >= data.daily_limit) {
      return res.status(429).json({ error: "Limit reached" });
    }

    await supabase
      .from("api_keys")
      .update({
        used: used + 1,
        last_reset: today
      })
      .eq("key", key);

    // 🔍 SEARCH
    const index = await getIndex();
    const prefix = userid.slice(0, 4);
    const files = index[prefix];

    if (!files) {
      return res.json({ error: "Not found" });
    }

    for (let file of files) {
      const chunk = await loadChunk(file);
      if (!chunk) continue;
      if (chunk[userid]) {
        return res.json(chunk[userid]);
      }
    }

    return res.json({ error: "Not found" });

  } catch (err) {
    console.log("ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

