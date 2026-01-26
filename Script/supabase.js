// Script/supabase.js
const SUPABASE_URL = 'https://rhmknjlxddxkfybcfgjj.supabase.co'; // e.g., 'https://abcxyz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobWtuamx4ZGR4a2Z5YmNmZ2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzM4OTgsImV4cCI6MjA4NTAwOTg5OH0.dNBxXmIdYAxJT-bt1WWcO62Nobt8aDLTRdnrs5g1CCI'; // long string

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for other files
window.supabase = supabase; // Global for simplicity (or use import if modular)