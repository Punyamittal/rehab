export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\.co1$/, ".co");
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getCentreId(): string {
  return (
    process.env.NEXT_PUBLIC_CENTRE_ID ??
    "00000000-0000-4000-8000-000000000001"
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function isSupabaseServerConfigured(): boolean {
  return Boolean(
    getSupabaseUrl() && (getSupabaseServiceRoleKey() || getSupabaseAnonKey())
  );
}

export function usesServiceRoleOnServer(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}
