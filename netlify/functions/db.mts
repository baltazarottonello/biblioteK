import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const supabase: SupabaseClient = createClient(
  "https://lyawxrmhnoioncuwqqjx.supabase.co",
  "sb_secret_wv47RLsr1J-fZsHheay65Q_LvuPctX5"
);
