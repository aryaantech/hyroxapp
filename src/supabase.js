import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fjctnkfsyjjqtviazxna.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqY3Rua2ZzeWpqcXR2aWF6eG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY4NDAsImV4cCI6MjA5NDU3Mjg0MH0.gm9BXaszOk__8FiYCjwRwHkMmuDXhtJ1bf-aDWKuvCs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
