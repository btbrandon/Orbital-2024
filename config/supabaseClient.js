import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hoatxfrjwfgozegpczac.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvYXR4ZnJqd2Znb3plZ3BjemFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY3ODA3NDgsImV4cCI6MjAzMjM1Njc0OH0.jF186Z8TdANFnpvFIMUlDjhamzJ4LgGQUBGMFUxso9g";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
