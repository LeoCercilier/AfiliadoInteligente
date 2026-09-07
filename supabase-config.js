const SUPABASE_URL = "https://ajjbtuhnvdehcxqykfkf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_UD6ktmFQ0yW9fVIHRH7EVQ_gGsn5Al4";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
