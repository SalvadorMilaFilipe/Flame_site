import { createClient } from "@supabase/supabase-js";

// TODO: Substituir pelas tuas credenciais do Supabase (Project Settings > API)
const supabaseUrl = "https://ehnvpqtibyfvljzqazog.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobnZwcXRpYnlmdmxqenFhem9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTI5OTAsImV4cCI6MjA4NzU4ODk5MH0.hmeY_gMRMXONjMtR725ojuxfOk3oG9dZ_pjdzOGeFp8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
