import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  try {
    const { name, days, limit, lifetime } = JSON.parse(req.body);

    const key = Math.random().toString(36).substring(2, 12);

    const expiry = lifetime ? null : new Date(Date.now() + days * 86400000);

    const { error } = await supabase.from("api_keys").insert([
      {
        name,
        key,
        expiry,
        daily_limit: limit,
        used: 0,
        last_reset: new Date().toDateString()
      }
    ]);

    if (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ key, expiry });

  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
}