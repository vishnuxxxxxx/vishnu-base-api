import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const { key } = JSON.parse(req.body);

  await supabase.from("api_keys").delete().eq("key", key);

  res.json({ success: true });
}