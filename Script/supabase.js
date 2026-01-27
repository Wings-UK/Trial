// Script/supabase.js — Correct CDN initialization (fixes .auth undefined)

const SUPABASE_URL = 'https://rhmknjlxddxkfybcfgjj.supabase.co'; // your URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobWtuamx4ZGR4a2Z5YmNmZ2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzM4OTgsImV4cCI6MjA4NTAwOTg5OH0.dNBxXmIdYAxJT-bt1WWcO62Nobt8aDLTRdnrs5g1CCI'; // your key

// Create client using global supabase from CDN
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabase = supabase;

console.log("Supabase CDN client initialized");
console.log("supabase.auth exists now?", !!supabase.auth);  // Should print true
console.log("Full supabase object:", supabase);