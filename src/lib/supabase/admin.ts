import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// profiles' RLS has no INSERT policy and its one UPDATE policy blocks role
// changes (`with_check` requires the role to stay the same) — provisioning
// and managing staff accounts has to bypass RLS entirely, same as the cron
// route's service-role client.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
