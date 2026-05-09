import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://wdofomcbqkqwjurgfzbp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkb2ZvbWNicWtxd2p1cmdmemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDQwNDMsImV4cCI6MjA5MzgyMDA0M30.esVp7jEfyYQmLcoqT5b4ZklHfFKaGJzB5ZMY3kx65rg"
);