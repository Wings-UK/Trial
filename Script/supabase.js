// Script/supabase.js
const SUPABASE_URL = 'https://rhmknjlxddxkfybcfgjj.supabase.co'; // e.g., 'https://abcxyz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobWtuamx4ZGR4a2Z5YmNmZ2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzM4OTgsImV4cCI6MjA4NTAwOTg5OH0.dNBxXmIdYAxJT-bt1WWcO62Nobt8aDLTRdnrs5g1CCI'; // long string

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for other files
window.supabase = supabase; // Global for simplicity (or use import if modular)



// After supabase init
async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isSignup = document.getElementById('auth-title').textContent.includes('Sign Up');

    let { data, error } = isSignup 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        document.getElementById('auth-error').textContent = error.message;
        return;
    }

    // On signup, create user profile
    if (isSignup) {
        const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,  // Supabase auth UUID
            username: email.split('@')[0],  // Default username from email
            name: 'New User',
            avatar: 'default-avatar.png',
            bio: 'Hello!',
            location: 'Earth'
        });
        if (profileError) console.error(profileError);
    }

    // Save session
    localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
    closeAuthModal();
    loadCurrentUser();  // New function below
    initializeHomepage();  // Refresh feed
}

function openSignup() {
    document.getElementById('auth-title').textContent = 'Sign Up';
    document.getElementById('auth-overlay').style.display = 'block';
}

function openLogin() {
    document.getElementById('auth-title').textContent = 'Login';
    document.getElementById('auth-overlay').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('auth-overlay').style.display = 'none';
}

// Auto-login on load if session exists
async function loadCurrentUser() {
    const session = JSON.parse(localStorage.getItem('supabase.auth.token'));
    if (session) {
        const { data } = await supabase.auth.setSession(session);
        if (data.user) {
            const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
            window.loggedInUser = profile;  // Update your global
            document.getElementById('usero').src = profile.avatar;  // Update UI
        }
    } else {
        // Show login prompt or guest mode
        openLogin();
    }
}

// On DOMContentLoaded, add:
loadCurrentUser();