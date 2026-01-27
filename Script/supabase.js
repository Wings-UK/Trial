// Script/supabase.js — FIXED for CDN usage (2025 version)

const SUPABASE_URL = 'https://rhmknjlxddxkfybcfgjj.supabase.co';           // ← your real URL (already correct)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobWtuamx4ZGR4a2Z5YmNmZ2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzM4OTgsImV4cCI6MjA4NTAwOTg5OH0.dNBxXmIdYAxJT-bt1WWcO62Nobt8aDLTRdnrs5g1CCI'; // ← your real anon key (already correct)

// Create the client using the correct constructor for the CDN script
const supabaseClient = new Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabase = supabaseClient;

console.log("Supabase client (CDN mode) initialized");
console.log("supabase.auth exists?", !!window.supabase?.auth);  // This should now print true