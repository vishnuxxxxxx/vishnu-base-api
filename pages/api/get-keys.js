import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const { data } = await supabase.from("api_keys").select("*");
  res.json(data);
}