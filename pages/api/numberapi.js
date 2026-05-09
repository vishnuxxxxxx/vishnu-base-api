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
      `https://raw.githubusercontent.com/harshsingh9817/Osint-api/main/chunks/${file}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    );

    if (!res.ok) {
      console.log("Failed to fetch:", file);
      return null;
    }

    const text = await res.text();

    // 🚨 prevent crash if not JSON
    if (!text.startsWith("[")) {
      console.log("Invalid chunk:", file);
      return null;
    }

    const data = JSON.parse(text);

    // ⚡ convert array → hashmap
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
    const { data } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key", key)
      .single();

    if (!data) {
      return res.status(403).json({ error: "Invalid key" });
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

    const prefix = userid.slice(0, 4); // MUST match your index

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