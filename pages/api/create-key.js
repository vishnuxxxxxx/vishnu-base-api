import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  try {
    const { name, days, limit, lifetime } = JSON.parse(req.body);

    // This assigns the input name directly as the key.
    // .replace(/\s+/g, '_') ensures that if you type "Vishnu Pro", it becomes "Vishnu_Pro"
    const key = name.trim().replace(/\s+/g, '_');

    const expiry = lifetime ? null : new Date(Date.now() + days * 86400000);

    const { error } = await supabase.from("api_keys").insert([
      {
        name,
        key: key, // The name is now the key
        expiry,
        daily_limit: limit,
        used: 0,
        last_reset: new Date().toDateString()
      }
    ]);

    if (error) {
      console.log(error);
      // Handles the case where the same name/key already exists in the database
      if (error.code === '23505') {
        return res.status(400).json({ error: "This name/key already exists!" });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ key, expiry });

  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
}
