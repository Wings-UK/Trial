// view.js - simplified version that shows posts even without matching users

// Paste this exactly as-is — add near the top, after any global variables
let currentUserId = null;
// ───────────────────────────────────────────────
// NOTIFICATION BADGE STATE
// ───────────────────────────────────────────────
let unreadNotificationCount = 0;
let notificationChannel = null;   // will hold the realtime subscription

// Get logged-in user ID once when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            currentUserId = user.id;
            console.log('Logged-in user ID:', currentUserId);

            // Only load count + subscribe when there is a real user
            await loadInitialNotificationCount();
            subscribeToNotifications();

            // You can also load avatar, start loading posts, etc. here
        } else {
            console.log('No user logged in');
            // Optional: show login modal
            // document.getElementById('auth-modal').style.display = 'block';
        }
    } catch (err) {
        console.error('Error during initial load:', err);
    }
});


// ───────────────────────────────────────────────
// REAL LIKE HELPERS – persistent across sessions
// ───────────────────────────────────────────────

async function isPostLikedByCurrentUser(postId) {
    if (!currentUserId) return false;

    const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();

    if (error) {
        console.error("Like check failed:", error.message);
        return false;
    }
    return !!data?.id;
}

async function toggleLike(postId, heartContainer) {
    if (!currentUserId) {
        alert("Please sign in to like posts");
        return false;
    }

    const heartIcon = heartContainer.querySelector('.heart-icon');
    const likeCountEl = heartContainer.querySelector('.like-count');

    const currentlyLiked = heartContainer.getAttribute('data-liked') === 'true';
    let count = parseInt(likeCountEl?.textContent.trim() || '0', 10);
    if (isNaN(count)) count = 0;

    // Optimistic UI - only apply to the clicked heart (not broadcast yet)
    const newLiked = !currentlyLiked;
    const optimisticCount = newLiked ? count + 1 : Math.max(0, count - 1);

    heartContainer.setAttribute('data-liked', newLiked ? 'true' : 'false');
    heartIcon?.classList.toggle('liked', newLiked);
    likeCountEl?.classList.toggle('liked', newLiked);
    if (likeCountEl) likeCountEl.textContent = optimisticCount > 0 ? optimisticCount : '';

    // Animation
    heartIcon?.classList.add(newLiked ? 'heart-animation' : 'unfill-animation');
    setTimeout(() => heartIcon?.classList.remove('heart-animation', 'unfill-animation'), 400);

    try {
        if (newLiked) {
            const { error } = await supabase.from('likes').insert({
                post_id: postId,
                user_id: currentUserId
            });
            if (error && error.code !== '23505') throw error; // ignore duplicate
        } else {
            const { error } = await supabase.from('likes').delete()
                .eq('post_id', postId)
                .eq('user_id', currentUserId);
            if (error) throw error;
        }

        // Get the REAL authoritative count from the server
        const { data: updatedPost, error: fetchError } = await supabase
            .from('posts')
            .select('like_count')
            .eq('id', postId)
            .single();

        let finalCount = optimisticCount; // fallback

        if (!fetchError && updatedPost) {
            finalCount = updatedPost.like_count ?? optimisticCount;
        } else if (fetchError) {
            console.warn("Failed to fetch updated like count:", fetchError.message);
        }

        // Now sync EVERY visible heart with the real number
        syncLikeUI(postId, newLiked, finalCount);

        return true;
    } catch (err) {
        console.error("Like toggle failed:", err.message);

        // Revert the clicked heart only
        heartContainer.setAttribute('data-liked', currentlyLiked ? 'true' : 'false');
        heartIcon?.classList.toggle('liked', currentlyLiked);
        likeCountEl?.classList.toggle('liked', currentlyLiked);
        if (likeCountEl) likeCountEl.textContent = count > 0 ? count : '';

        alert("Couldn't update like. Please try again.");
        return false;
    }
}

// Paste this exactly as-is — add at the top of view.js
function createSkeletonPost() {
    const skeleton = document.createElement('div');
    skeleton.className = 'poster skeleton';
    skeleton.innerHTML = `
        <div class="cust-name">
            <div class="heading">
                <div class="small-photo1 skeleton-avatar"></div>
                <div class="pos">
                    <div class="skeleton-text short"></div>
                    <div class="skeleton-text medium"></div>
                </div>
            </div>
        </div>
        <div class="tir">
            <div class="skeleton-text long"></div>
            <div class="skeleton-text medium"></div>
        </div>
        <div class="lefto skeleton-reactions"></div>
    `;
    return skeleton;
}

function addSkeletonStyles() {
    if (document.getElementById('skeleton-styles')) return;

    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = `
        .skeleton {
            background: #f0f0f0;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
        }
        .skeleton::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        .skeleton-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e0e0e0;
        }
        .skeleton-text {
            height: 16px;
            background: #e0e0e0;
            margin: 8px 0;
            border-radius: 4px;
        }
        .skeleton-text.short { width: 60%; }
        .skeleton-text.medium { width: 80%; }
        .skeleton-text.long { width: 100%; }
        .skeleton-reactions {
            height: 30px;
            background: #e0e0e0;
            border-radius: 4px;
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
    `;
    document.head.appendChild(style);
}

// Keep these important parts
history.scrollRestoration = "manual";

let loadedPostIds = new Set();
let isLoading = false;
let postsPerLoad = 5;

// Use the logged-in user as fallback for all posts
const fallbackUser = {
    id: 999,                    // doesn't matter
    username: "@jeremyx",
    name: "Jeremy X",
    avatar: "pics/9.jpg",  // change this path if needed
    cover: "pics/vu.jpg"
};


function formatTimeSince(dateStr) {
    if (!dateStr) return 'just now';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'invalid date';

    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) {
        return seconds + 's ago';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return minutes + 'm ago';
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return hours + 'h ago';
    }

    // 24–47 hours → yesterday
    if (hours < 48) {
        return 'yesterday';
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return days + 'd ago';
    }

    const weeks = Math.floor(days / 7);
    return weeks + 'w ago';
}

// ─────────────────────────────────────────────────────────────
// Helper function: shortenText (was missing)
// ─────────────────────────────────────────────────────────────
function shortenText(text, limit, showSeeMore = true) {
    if (!text) return '';
    if (text.length <= limit) return text;

    let shortened = text.slice(0, limit);
    const lastSpace = shortened.lastIndexOf(' ');

    if (lastSpace > 0) {
        shortened = shortened.slice(0, lastSpace);
    }

    return showSeeMore ?
        shortened + `...<br><span class="reer">see more</span>` :
        shortened + "...";
}

// ─────────────────────────────────────────────────────────────
// Updated loadMorePosts() – with users table join (Option A)
// ─────────────────────────────────────────────────────────────


// Start loading when homepage is shown
document.addEventListener('DOMContentLoaded', function() {
    const activePage = document.querySelector(".page.active");
    if (activePage && activePage.id === "food") {
        console.log("Homepage detected → starting to load posts");
        loadMorePosts();
    }

    // Also load more when scrolling near bottom
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
            loadMorePosts();
        }
    });
});

// ─────────────────────────────────────────────────────────────
// Minimal reaction styles to fix oversized icons
// Paste this at the bottom of view.js
// ─────────────────────────────────────────────────────────────
function addMinimalReactionStyles() {
    if (document.getElementById('minimal-reaction-styles')) return;

    const style = document.createElement('style');
    style.id = 'minimal-reaction-styles';
    style.textContent = `
       
.heart-ai {
    width: 55px;
    gap: 5px;
    display: flex;
    align-items: center;
}
.heart-clickable {
    cursor: pointer;
}
.mee {
    display: flex;
    gap: 20px;
}
.call {
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.feeling {
    width: 22px;
}
.like-count {
    font-size: 14px;
    font-family: ibm plex sans, roboto;
} 
.like-count.liked {
    font-weight: 500;
    color: rgb(244, 7, 82);
}
.like-count:empty {
    display: none;
}
.heart-icon {
    transition: all 0.3s ease;
}
.heart-icon .heart-path {
    stroke: rgb(0, 0, 0);
    fill: none;
    transition: all 0.3s ease;
}
.heart-icon.liked {
    transform: scale(1);
}
.heart-icon.liked .heart-path {
    fill: rgb(244, 7, 82);
    stroke: rgb(244, 7, 82);
}
@keyframes heartBeat {
    0% { transform: scale(0.5); }
    50% { transform: scale(1.7); }
    100% { transform: scale(1); }
}
.heart-animation {
    animation: heartBeat 0.7s ease-in-out;
}
.heart-icon {
    transition: transform 0.2s ease, opacity 0.2s ease;
}
.heart-animation {
    animation: pop 0.3s ease forwards;
}
.unfill-animation {
    animation: shrinkFade 0.3s ease forwards;
}
@keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.5); }
    100% { transform: scale(1); }
}
@keyframes shrinkFade {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.5); opacity: 0.5; }
    100% { transform: scale(1); opacity: 1; }
}
.reaction-container {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 20px;
}
.donate-btn {
    display: flex;
    align-items: center;
}
.comment-btn, .repost-btn {
    display: flex; 
    width: 55px;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-size: 15px;
    font-family: ibm plex sans, roboto;
}

    `;
    document.head.appendChild(style);
}

// Call it once after the page loads
document.addEventListener('DOMContentLoaded', () => {
    addMinimalReactionStyles();
    addRepostStyles();
    addMasonryHeartAnimationStyles();
});



// Paste this exactly as-is — add at the bottom of view.js
function initializeLazyLoading() {
    const placeholders = document.querySelectorAll('.placeholder');

    placeholders.forEach(placeholder => {
        const smallImg = placeholder.querySelector('.img-small');
        if (!smallImg) return;

        // Load small image first
        const small = new Image();
        small.src = smallImg.src;
        small.onload = () => {
            smallImg.classList.add('loaded');
        };

        // Load large image
        const largeSrc = placeholder.getAttribute('data-large');
        if (largeSrc) {
            const large = new Image();
            large.src = largeSrc;
            large.onload = () => {
                const largeImg = document.createElement('img');
                largeImg.src = largeSrc;
                largeImg.classList.add('loaded');
                placeholder.appendChild(largeImg);
            };
        }
    });
}

// Paste this exactly as-is — add at the bottom of view.js
function updateCreatePostElementForLazy() {
    // No need to change createPostElement — just call initializeLazyLoading after posts are added
    // Make sure your placeholder divs in createPostElement have:
    // class="placeholder" data-large="..." 
    // and contain <img src="low-res.jpg" class="img-small">
}

document.addEventListener('DOMContentLoaded', () => {
    initializeLazyLoading();
    
});

// Paste this exactly as-is — add at the bottom of view.js
async function fetchUserProfile(userId) {
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, avatar, cover, bio, location, followers, following')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        console.error('User fetch error:', userError);
        return null;
    }

    // ── Include reposted_post in query ────────────────────────────────────
    const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
            id, content, image, video, created_at, like_count,
            reposted_post_id,
            reposted_post:reposted_post_id (
                id, content, image, video, created_at, user_id,
                user:users ( id, username, avatar )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12);

    if (postsError) {
        console.error('Posts fetch error:', postsError);
    }

    return {
        ...user,
        posts: userPosts || []
    };
}

async function showProfile(userId) {
    // Save scroll position
    sessionStorage.setItem('scrollPosition_feed', window.scrollY);

    // Switch page  
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));  
    const profileSection = document.getElementById('profile');  
    if (!profileSection) return;  
    profileSection.classList.add('active');  

    const ireti = document.getElementById('ireti');  
    if (!ireti) return;  

    ireti.innerHTML = '<div class="skeleton" style="height:400px;"></div><p>Loading...</p>';  

    const userData = await fetchUserProfile(userId);  
    if (!userData) {  
        ireti.innerHTML = '<p>User not found</p>';  
        return;  
    }  

    ireti.innerHTML = `  
    <header class="heado file">
        <div class="heador" style="display:flex; align-items:center; justify-content:space-between; width:100%; padding:0 16px;">
            
            <!-- Left: Back -->
            <div class="exp-order" onclick="goBack()">
                <img class="flat" src="pics/angle.svg">
                
            </div>

            <!-- Right: Dots (more options) -->
            <div class="profile-header-right">
                <img class="dot" src="pics/dots.svg" style="width:18px; height:18px; cursor:pointer;">
            </div>
            
        </div>
    </header>
        <img class="frin" src="${userData.cover || 'pics/default-cover.jpg'}">  
        <div>  
            <img class="kor" src="${userData.avatar || 'pics/default-avatar.png'}">  
        </div>  
        <div class="klr">  
            <div class="drun">  
                <div>  
                    <p class="spe">${userData.username}</p>  
                </div>  
                <div>  
                    <img class="verify" src="pics/very.svg">  
                </div>  
            </div>  
            <div class="druu">  
                <div>  
                    <p class="rkl">${userData.location || 'No location'}</p>  
                </div>  
            </div>  
            <div class="nin">  
                <p class="rkl"><span class="bld">${userData.following || 0}</span>following · <span class="bld">${userData.followers || 0}</span>followers</p>  
            </div>  
            <div class="cha">  
                <p>${userData.bio || 'No bio yet'}</p>  
            </div>  
            <div class="man">  
                <div class="vre">  
                    <button class="aasw">Follow</button>  
                </div>  
                <div class="vre">  
                    <button class="aasw">1 : 1</button>  
                </div>  
            </div>  
        </div>  
        <div class="ewe">  
            <div class="yeb"><img class="dee" src="pics/apps.svg"></div>  
            <div class="yeb"><img class="dee" src="pics/newspaper.svg"></div>  
            <div class="yeb"><img class="dee" src="pics/store.svg"></div>  
        </div>  
        <div class="mansonro">  
            <div class="masonri">  
                <div class="column left-column"></div>  
                <div class="column right-column"></div>  
            </div>  
        </div>  
    `;  

    const leftColumn = document.querySelector('.left-column');  
    const rightColumn = document.querySelector('.right-column');  
    leftColumn.innerHTML = '';  
    rightColumn.innerHTML = '';  

    if (!userData.posts || userData.posts.length === 0) {  
        leftColumn.innerHTML = '<p style="text-align:center; padding:20px;">No posts yet</p>';  
    } else {  
        userData.posts.forEach((post, index) => {
            const tile = buildMasonryTile(post, userData.avatar, userData.username);
            if (index % 2 === 0) leftColumn.appendChild(tile);
            else                 rightColumn.appendChild(tile);
        });
    }  

    initializeMasonryHeartReactions();
    window.scrollTo(0, 0);
}

// Paste this exactly as-is — add at the bottom
function goBack() {
    const savedScroll = sessionStorage.getItem('scrollPosition_feed');
    document.getElementById('profile').classList.remove('active');
    document.getElementById('food').classList.add('active');
    if (savedScroll) window.scrollTo(0, parseInt(savedScroll));
}

// Quick switch to home (used from bottom nav)
function switchToHome() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('food').classList.add('active');
  
  // Optional: reset bottom nav active state
  document.querySelectorAll('.bottom .note1').forEach(el => el.classList.remove('active'));
  // You can add .active to home icon if you want visual feedback
}

// Go back from notifications → home
function goBackToHome() {
  switchToHome();
}

// Switch to notifications
async function switchToNotifications() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('notifications').classList.add('active');
    
    // Reset unread count when user opens the tab
    unreadNotificationCount = 0;
    updateNotificationBadge();

    // Mark all notifications as read (optional but strongly recommended)
    if (currentUserId) {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', currentUserId)
            .eq('read', false);

        if (error) {
            console.error("Failed to mark notifications as read:", error);
        } else {
            console.log("Marked all notifications as read");
        }
    }
    
    // Highlight bell in bottom nav
    document.querySelectorAll('.bottom .note1').forEach(el => el.classList.add('active'));
    
    renderNotifications();
    window.scrollTo(0, 0);
}

async function showMyProfile() {
    sessionStorage.setItem('scrollPosition_feed', window.scrollY);

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const profileSection = document.getElementById('profile');
    if (!profileSection) {
        console.error('Profile section (#profile) not found');
        return;
    }
    profileSection.classList.add('active');

    const ireti = document.getElementById('ireti');
    if (!ireti) return;

    ireti.innerHTML = '<div class="skeleton" style="height:400px; margin:20px;"></div><p>Loading your profile...</p>';

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        ireti.innerHTML = '<p style="text-align:center; padding:40px;">Not logged in. Please sign in.</p>';
        return;
    }

    const userId = user.id;

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, username, avatar, cover, bio, location, followers, following')
        .eq('id', userId)
        .maybeSingle();

    if (profileError) {
        console.error('Profile fetch error:', profileError);
        ireti.innerHTML = '<p style="text-align:center; padding:40px;">Error loading profile. Please try again.</p>';
        return;
    }

    if (!profile) {
        ireti.innerHTML = `
            <div style="text-align:center; padding:80px 20px; color:#555;">
                <h3 style="margin-bottom:16px;">Profile setup required</h3>
                <p>We couldn't find your profile information.</p>
                <button onclick="createMissingProfile()" 
                        style="margin-top:24px; padding:12px 32px; background:#f40752; color:white; border:none; border-radius:8px; font-size:16px; cursor:pointer;">
                    Create My Profile
                </button>
            </div>
        `;
        return;
    }

    // ── CHANGE 1: query now includes reposted_post relation ──────────────
    const { data: userPosts } = await supabase
        .from('posts')
        .select(`
            id, content, image, video, created_at, like_count,
            reposted_post_id,
            reposted_post:reposted_post_id (
                id, content, image, video, created_at, user_id,
                user:users ( id, username, avatar )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12);

    ireti.innerHTML = `
      <header class="heado file">
        <div class="heador" style="display:flex; align-items:center; justify-content:space-between; width:100%; padding:0 16px;">
            
            <!-- Left: Back -->
            <div class="exp-order" onclick="goBack()">
                <img class="flat" src="pics/angle.svg">
                <div class="tool"><p>Back</p></div>
            </div>

            <!-- Right: Share icon -->
            <div class="profile-header-right">
                <img class="share-icon" src="pics/share.svg" style="width:24px; height:24px; cursor:pointer;" 
                     onclick="shareProfile()">
            </div>
            
        </div>
    </header>

        <img class="frin" src="${profile.cover || 'pics/default-cover.jpg'}">

        <div>
            <label class="avatar-upload">
                <img 
                    class="kor" 
                    id="myProfileAvatar"
                    src="${profile.avatar || 'pics/default-avatar.png'}"
                >
                <input 
                    type="file" 
                    id="avatarInput" 
                    accept="image/*" 
                    hidden
                >
            </label>
        </div>

        <div class="klr">
            <div class="drun">
                <div>
                    <p class="spe">${profile.username}</p>
                </div>
                <div>
                    <img class="verify" src="pics/very.svg">
                </div>
            </div>
            <div class="druu">
                <div>
                    <p class="rkl">${profile.location || 'No location'}</p>
                </div>
                <div class="drum">
                    <img class="kiy" src="pics/qr.svg">
                </div>
            </div>
            <div class="nin">
                <p class="rkl">
                    <span class="bld">${profile.following || 0}</span> following · 
                    <span class="bld">${profile.followers || 0}</span> followers
                </p>
            </div>
            <div class="cha">
                <p>${profile.bio || 'No bio yet'}</p>
            </div>
            <div class="man">
                <div class="vre">
                    <button class="aasw edit-profile-btn">Edit Profile</button>
                </div>
                <div class="vre">
                    <button class="aas settings-btn" onclick="showSettings()">
                        <img class="offi" src="pics/setting.svg">
                    </button>
                </div>
            </div>
        </div>

        <div class="ewe">
            <div class="yeb"><img class="dee" src="pics/apps.svg"></div>
            <div class="yeb"><img class="dee" src="pics/newspaper.svg"></div>
            <div class="yeb"><img class="dee" src="pics/store.svg"></div>
        </div>

        <div class="mansonro">
            <div class="masonri">
                <div class="column left-column"></div>
                <div class="column right-column"></div>
            </div>
        </div>

        <div class="wing" style="position:fixed; bottom:24px; right:24px; z-index:100;">
            <img class="wingo" src="pics/geat.svg" onclick="makePost()">
        </div>
    `;

    const avatarInput = document.getElementById('avatarInput');
    avatarInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be under 2MB');
            return;
        }
        uploadAvatar(file);
    });

    const leftColumn = document.querySelector('.left-column');
    const rightColumn = document.querySelector('.right-column');
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    if (!userPosts || userPosts.length === 0) {
        leftColumn.innerHTML = '<p style="text-align:center; padding:20px;">No posts yet</p>';
    } else {
        // ── CHANGE 2: use buildMasonryTile() instead of the old manual block ──
        userPosts.forEach((post, index) => {
            const tile = buildMasonryTile(post, profile.avatar, profile.username);
            if (index % 2 === 0) leftColumn.appendChild(tile);
            else                 rightColumn.appendChild(tile);
        });
    }

    initializeMasonryHeartReactions();
    window.scrollTo(0, 0);

    document.querySelector('.edit-profile-btn')
        ?.addEventListener('click', openEditProfileModal);
}


// Paste this exactly as-is — add at the bottom
document.addEventListener('DOMContentLoaded', () => {
    const accountIcon = document.querySelector('.account-icon');
    if (accountIcon) {
        accountIcon.addEventListener('click', () => {
            showMyProfile();
        });
    }

    // Load logged-in user's avatar in top-right
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            supabase
                .from('users')
                .select('avatar')
                .eq('id', user.id)
                .single()
                .then(({ data }) => {
                    if (data?.avatar) {
                        document.getElementById('usero').src = data.avatar;
                    }
                });
        }
    });
});



// ───────────────────────────────────────────────────────────────
// SECTION 5 — REPLACE showDetail()
// The repost button in the comment bar now has data-original-id
// so syncRepostUI can find it, and it wires up toggleRepost().
// Everything else is identical to your current showDetail().
// ───────────────────────────────────────────────────────────────

async function showDetail(postId) {
    sessionStorage.setItem('scrollPosition_feed', window.scrollY);
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const detailPage = document.getElementById('meal');
    if (!detailPage) { console.error('Detail page (#meal) not found'); return; }
    detailPage.classList.add('active');

    const nuba = document.getElementById('nuba');
    if (!nuba) { console.error('nuba container not found'); return; }
    nuba.innerHTML = '<div class="skeleton" style="height:400px; margin:20px;"></div><p>Loading post...</p>';

    const { data: postData, error } = await supabase
        .from('posts')
        .select(`
            id, content, image, video, created_at,
            like_count, comment_count, repost_count, views, user_id,
            reposted_post_id,
            user:users ( id, username, avatar ),
            reposted_post:reposted_post_id (
                id, content, image, video, created_at, user_id,
                user:users ( id, username, avatar )
            )
        `)
        .eq('id', postId)
        .single();

    if (error || !postData) {
        console.error('Post fetch error:', error);
        nuba.innerHTML = '<p>Post not found</p>';
        return;
    }

    const post = {
        id:           postData.id,
        userId:       postData.user_id,
        username:     postData.user?.username || '@unknown',
        avatar:       postData.user?.avatar   || 'pics/default-avatar.png',
        content:      postData.content        || '',
        image:        postData.image          || null,
        video:        postData.video          || null,
        timestamp:    formatTimeSince(postData.created_at),
        date:         new Date(postData.created_at).toLocaleString(),
        likeCount:    postData.like_count     || 0,
        commentCount: postData.comment_count  || 0,
        repostCount:  postData.repost_count   || 0,
        views:        postData.views          || 0,
    };

    const isOwnPost = currentUserId && post.userId === currentUserId;

    const isRepost = !!postData.reposted_post_id && !!postData.reposted_post;
    const original = isRepost ? postData.reposted_post : null;
    const origUser = original ? {
        username: original.user?.username || '@unknown',
        avatar:   original.user?.avatar   || 'pics/default-avatar.png',
    } : null;

    let mediaBlock = '';

    if (isRepost) {
        mediaBlock = `
            <div class="swet detail-repost-wrap">
                ${post.content ? `
                    <div class="tir" style="margin-bottom: 14px;">
                        <p class="tiri" style="white-space:pre-wrap;">${post.content}</p>
                    </div>
                ` : ''}

                <div class="detail-original-card" data-original-id="${original.id}">
                    <div class="doc-quote-bg">"</div>

                    <div class="doc-header">
                        <div class="small-photo1" style="width:34px;height:34px;">
                            <a class="lino" onclick="showProfile('${original.user_id}')">
                                <img class="small-photo" src="${origUser.avatar}"
                                     onerror="this.src='pics/default-avatar.png'">
                            </a>
                        </div>
                        <div class="pos">
                            <a class="home-click" onclick="showProfile('${original.user_id}')">
                                <div class="post1">
                                    <div class="jerr">
                                        <p class="jerry" style="font-size:14px;">${origUser.username}</p>
                                    </div>
                                    <img class="verif" src="pics/very.svg">
                                </div>
                            </a>
                            <p class="time" style="font-size:12px;">${formatTimeSince(original.created_at)}</p>
                        </div>
                    </div>

                    ${original.content ? `
                        <div style="font-size:14px; color:#374151; line-height:1.55; margin:10px 0; white-space:pre-wrap;">${original.content.length > 250 ? original.content.slice(0, 250).trimEnd() + '…' : original.content}</div>
                    ` : ''}

                    ${original.image ? `
                        <div style="margin:10px -16px -16px; border-radius:0 0 14px 14px; overflow:hidden;">
                            <img src="${original.image}" alt="Original image"
                                 style="width:100%; display:block; max-height:300px; object-fit:cover;">
                        </div>
                    ` : ''}

                    ${original.video && !original.image ? `
                        <div class="video-container" data-post-id="${original.id}"
                             style="margin:10px -16px -16px; border-radius:0 0 14px 14px; overflow:hidden;">
                            <video class="video-thumbnail" preload="metadata" style="width:100%;">
                                <source src="${original.video}" type="video/mp4">
                            </video>
                            <div class="video-overlay">
                                <div class="play-button">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <circle cx="24" cy="24" r="22" fill="rgba(244,7,82,0.5)" stroke="white" stroke-width="3"/>
                                        <path d="M34 24L18 34V14L34 24Z" fill="white"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } else {
        mediaBlock = `
            <div class="tir">
                <p class="tiri" style="white-space:pre-wrap;">${post.content}<br></p>
            </div>
            ${post.image ? `
                <div class="swet">
                    <div class="laptop1">
                        <img class="lapto" src="${post.image}">
                    </div>
                </div>
            ` : ''}
            ${post.video ? `
                <div class="swet">
                    <div class="video-container" data-post-id="${post.id}">
                        <video class="video-thumbnail" preload="metadata">
                            <source src="${post.video}" type="video/mp4">
                        </video>
                        <div class="video-overlay">
                            <div class="play-button">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <circle cx="24" cy="24" r="22" fill="rgba(244,7,82,0.5)" stroke="white" stroke-width="3"/>
                                    <path d="M34 24L18 34V14L34 24Z" fill="white"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }

    nuba.innerHTML = `
        <div class="cust-name" data-post-id="${post.id}">
            <div class="heading">
                <div class="small-photo1">
                    <a class="lino" onclick="${isOwnPost ? 'showMyProfile()' : `showProfile('${post.userId}')`}">
                        <img class="small-photo" src="${post.avatar}">
                    </a>
                </div>
                <div class="pos">
                    <div>
                        <div class="link-wrapper">
                            <a class="home-click" onclick="${isOwnPost ? 'showMyProfile()' : `showProfile('${post.userId}')`}">
                                <div class="post1">
                                    <div class="jerr">
                                        <p class="jerry">${post.username}</p>
                                    </div>
                                    <div><img class="verif" src="pics/very.svg"></div>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="comp1">
                        <div class="cll">
                            <p class="time">${post.date || post.timestamp}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <button class="detail-follow foni" onclick="
                    const foniElem = document.querySelector('.foni');
                    if (foniElem.innerHTML === 'Follow') {
                        foniElem.innerHTML = 'Following';
                        foniElem.classList.add('follow');
                    } else {
                        foniElem.innerHTML = 'Follow';
                        foniElem.classList.remove('follow');
                    }
                ">Follow</button>
            </div>
            <div class="dots">
                <img class="dot" src="pics/dots.svg">
                <div class="tool"><p>More</p></div>
            </div>
        </div>

        ${mediaBlock}

        <div class="lefto">
            <div class="dick">
                <div><p class="viewe"><span class="werey">${post.likeCount || 0}</span> reactions</p></div>
                <div><p class="viewe"><span class="werey repost-count-display">${post.repostCount || 0}</span> echoes</p></div>
            </div>
            <div class="twits">
                <div><img class="lefti" src="pics/stats.svg"></div>
                <div><p class="viewe">${post.views || '0'} views</p></div>
            </div>
        </div>

        <div class="reaction">
            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html">
                    <img class="hui" src="pics/16.jpg">
                </a>
                <div class="vrea"><img class="luve" src="pics/lovv.png"></div>
            </div>
        </div>

        <!-- Comment box -->
        <div class="comment-container">
            <div class="comment-wrapper">
                <div class="comment-box">
                    <textarea class="comment-textarea"
                        placeholder="Reply to @${post.username}..."
                        rows="1"></textarea>
                </div>
            </div>
            <div class="actions">
                <div class="dil">
                    <!-- KEY FIX: data-post-id="${post.id}" so updateCurrentUserRepostButtons finds it -->
                    <div class="repost-btn sted buyt"
                         data-post-id="${post.id}"
                         data-reposted="false">
                        <img class="feeling spoil repost-icon" src="pics/retweet.svg" alt="Repost">
                    </div>
                    <div class="heart-ai" data-post-id="${post.id}" data-liked="false">
                        <svg class="heart-icon heart-clickable" width="24" height="24" viewBox="0 0 24 24">
                            <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <span class="like-count heart-clickable">${post.likeCount > 0 ? post.likeCount : ''}</span>
                    </div>
                </div>
                <div class="isji">
                    <img class="cinu" src="pics/at.svg">
                    <img class="cinu" src="pics/emoji.svg">
                    <img class="cinu" src="pics/gallery.svg">
                    <img class="caun" src="pics/up.svg" onclick="submitComment()">
                </div>
            </div>
        </div>
    `;

    // ── Original card tap → go to original post ──
    const origCard = nuba.querySelector('.detail-original-card');
    if (origCard) {
        origCard.style.cursor = 'pointer';
        origCard.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            showDetail(original.id);
        });
    }

    // ── Detail repost button ──
    // KEY FIX: targets post.id (not repostTargetId / original.id)
    // This post's own button reflects whether THIS post was reposted by you.
    const detailRepostBtn = nuba.querySelector('.repost-btn');
    if (detailRepostBtn) {
        const targetPostId = post.id;

        getMyRepostOfPost(targetPostId).then(myRepostId => {
            if (myRepostId) {
                detailRepostBtn.setAttribute('data-reposted', 'true');
                detailRepostBtn.classList.add('reposted');
            }
        });

        detailRepostBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleRepost(targetPostId, detailRepostBtn);
        });
    }

    // ── Like functionality ──
    const detailHeart = document.querySelector('#nuba .heart-ai');
    if (detailHeart) {
        const alreadyLiked = await isPostLikedByCurrentUser(post.id);
        if (alreadyLiked) {
            detailHeart.setAttribute('data-liked', 'true');
            detailHeart.querySelector('.heart-icon')?.classList.add('liked');
            detailHeart.querySelector('.like-count')?.classList.add('liked');
        }
        detailHeart.querySelectorAll('.heart-clickable').forEach(el => {
            el.addEventListener('click', async (e) => {
                e.stopPropagation();
                await toggleLike(post.id, detailHeart);
            });
        });
    }

    window.scrollTo(0, 0);
}


// Global variable to hold the currently selected image file
let selectedMediaFile = null;

// ───────────────────────────────────────────────
// Open composer (only from profile)
function makePost() {
    // Optional safety: only allow from profile page
   // const profilePage = document.getElementById('profile');
   // if (!profilePage || !profilePage.classList.contains('active')) {
   //     console.warn("Post composer can only be opened from your profile");
    //    return;
   // }

    const modal = document.getElementById('createPostModal');
    if (!modal) {
        console.error("createPostModal not found in DOM");
        return;
    }

    modal.classList.remove('hidden');

    // Reset and focus textarea
    const textarea = document.getElementById('postContent');
    if (textarea) {
        textarea.value = '';
        // Small delay helps mobile keyboards appear properly
        setTimeout(() => textarea.focus(), 100);
    }

    // Reset media
    clearMedia();

    // Disable post button initially
    document.getElementById('postBtn')?.setAttribute('disabled', 'disabled');
}

// ───────────────────────────────────────────────
// Close composer and clean up
function closePostModal() {
    const modal = document.getElementById('createPostModal');
    if (modal) {
        modal.classList.add('hidden');
    }

    // Clear textarea
    const textarea = document.getElementById('postContent');
    if (textarea) textarea.value = '';

    // Clear media
    clearMedia();

    // Reset post button
    document.getElementById('postBtn')?.setAttribute('disabled', 'disabled');
}

// ───────────────────────────────────────────────
// Clear selected media and preview
function clearMedia() {
    selectedMediaFile = null;
    const previewContainer = document.getElementById('mediaPreview');
    if (previewContainer) previewContainer.innerHTML = '';

    const fileInput = document.getElementById('postImageInput');
    if (fileInput) fileInput.value = '';

    // Re-check if post button should stay disabled
    updatePostButtonState();
}

// ───────────────────────────────────────────────
// Enable/disable Post button based on content or media
function updatePostButtonState() {
    const textarea = document.getElementById('postContent');
    const postBtn = document.getElementById('postBtn');

    if (!textarea || !postBtn) return;

    const hasText = textarea.value.trim().length > 0;
    const hasMedia = !!selectedMediaFile;

    if (hasText || hasMedia) {
        postBtn.removeAttribute('disabled');
    } else {
        postBtn.setAttribute('disabled', 'disabled');
    }
}

// ───────────────────────────────────────────────
// Handle image selection and show preview
function handleMediaSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        e.target.value = '';
        return;
    }

    // Optional size limit (8MB)
    if (file.size > 8 * 1024 * 1024) {
        alert("Image must be smaller than 8MB");
        e.target.value = '';
        return;
    }

    selectedMediaFile = file;

    // Show preview
    const previewContainer = document.getElementById('mediaPreview');
    if (!previewContainer) return;

    // Clear old previews (single image for now)
    previewContainer.innerHTML = '';

    const reader = new FileReader();
    reader.onload = function(ev) {
        const div = document.createElement('div');
        div.className = 'preview-item';

        const img = document.createElement('img');
        img.src = ev.target.result;
        img.alt = "Selected image preview";

        const removeBtn = document.createElement('button');
        removeBtn.className = 'preview-remove';
        removeBtn.textContent = '×';
        removeBtn.onclick = clearMedia;

        div.appendChild(img);
        div.appendChild(removeBtn);
        previewContainer.appendChild(div);

        // Enable post button
        updatePostButtonState();
    };

    reader.readAsDataURL(file);
}


// ───────────────────────────────────────────────
// Attach event listeners once when page loads
document.addEventListener('DOMContentLoaded', () => {
    // File input change → preview
    const imageInput = document.getElementById('postImageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleMediaSelect);
    }

    // Textarea input → update post button state
    const textarea = document.getElementById('postContent');
    if (textarea) {
        textarea.addEventListener('input', updatePostButtonState);
    }
});

let activeLongPressPost = null;

function enablePostLongPress(posterElement, post) {
    function isActive() {
        return posterElement.classList.contains('long-press-active');
    }

    let pressTimer = null;
    let longPressTriggered = false;

    const isOwner = currentUserId && post.userId === currentUserId;

    function closeActions() {
        posterElement.classList.remove('long-press-active');
        posterElement.querySelector('.post-action-bar')?.remove();
        posterElement.dataset.blockNavigation = 'false';
        longPressTriggered = false;

        if (activeLongPressPost === posterElement) {
            activeLongPressPost = null;
        }
    }

    function showActions() {
        if (activeLongPressPost && activeLongPressPost !== posterElement) {
            activeLongPressPost.classList.remove('long-press-active');
            activeLongPressPost.querySelector('.post-action-bar')?.remove();
            activeLongPressPost.dataset.blockNavigation = 'false';
        }

        activeLongPressPost = posterElement;
        longPressTriggered = true;

        posterElement.classList.add('long-press-active');
        posterElement.dataset.blockNavigation = 'true';

        const bar = document.createElement('div');
        bar.className = 'post-action-bar';

        bar.innerHTML = `
            <button class="post-action-btn dislike">Dislike</button>
            <button class="post-action-btn report">Report</button>
            ${isOwner ? `<button class="post-action-btn delete">Delete</button>` : ''}
        `;

        posterElement.appendChild(bar);

        // ─── ACTION HANDLERS ───
        bar.querySelector('.dislike')?.addEventListener('click', e => {
            e.stopPropagation();
            console.log('Disliked post', post.id);
            // You can expand this later (e.g. add to dislikes table)
            closeActions();
        });

        bar.querySelector('.report')?.addEventListener('click', e => {
            e.stopPropagation();
            console.log('Reported post', post.id);
            // You can expand this later (e.g. open report modal)
            closeActions();
        });

        bar.querySelector('.delete')?.addEventListener('click', async e => {
            e.stopPropagation();
            e.preventDefault();

            // Call the delete function (assumes you already added deletePost)
            await deletePost(post.id, posterElement);

            closeActions();
        });

        if (navigator.vibrate) navigator.vibrate(20);
    }

    // ─── TOUCH EVENTS FOR LONG PRESS ───
    posterElement.addEventListener('touchstart', e => {
        if (e.touches.length > 1) return;
        if (isActive()) return; // prevent re-trigger while menu is open

        pressTimer = setTimeout(showActions, 500);
    });

    posterElement.addEventListener('touchmove', () => {
        clearTimeout(pressTimer);
    });

    posterElement.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
    });

    // Also support mouse long-press (for desktop testing)
    let mouseDownTime;
    posterElement.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        mouseDownTime = setTimeout(showActions, 600);
    });

    posterElement.addEventListener('mouseup', () => clearTimeout(mouseDownTime));
    posterElement.addEventListener('mouseleave', () => clearTimeout(mouseDownTime));

    // ─── CLICK HANDLING WHEN MENU IS OPEN ───
    posterElement.addEventListener('click', e => {
        if (posterElement.dataset.blockNavigation === 'true') {
            e.stopPropagation();
            e.preventDefault();
            closeActions();
        }
    });

    // ─── CLOSE WHEN TAPPING OUTSIDE ───
    document.addEventListener('touchstart', e => {
        if (
            longPressTriggered &&
            activeLongPressPost === posterElement &&
            !posterElement.contains(e.target)
        ) {
            closeActions();
        }
    }, { capture: true }); // capture phase to catch early
}

function goBackFromDetail() {
    const savedScroll = sessionStorage.getItem('scrollPosition_feed');

    // Deactivate detail page
    document.getElementById('meal')?.classList.remove('active');

    // 🔥 Clear detail content
    const nuba = document.getElementById('nuba');
    if (nuba) nuba.innerHTML = '';

    // Hide sticky detail header
    document.querySelector('.detail-content')?.classList.remove('active');

    // Go back to homepage
    document.getElementById('food')?.classList.add('active');

    if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll));
    }
}
async function uploadAvatar(file) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true,            // replace old avatar
            cacheControl: '3600'
        });

    if (uploadError) {
        alert('Upload failed');
        console.error(uploadError);
        return;
    }

    // Get public URL
    const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

    const avatarUrl = data.publicUrl;

    // Save URL to users table
    const { error: updateError } = await supabase
        .from('users')
        .update({ avatar: avatarUrl })
        .eq('id', user.id);

    if (updateError) {
        alert('Profile update failed');
        return;
    }

    // 🔥 Update UI instantly
    document.getElementById('myProfileAvatar').src = avatarUrl;
    document.getElementById('usero').src = avatarUrl; // top-right avatar
}

// Add this at the bottom of view.js
async function createMissingProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Not logged in");
        return;
    }

    const tempUsername = 'user_' + user.id.slice(0,8);

    const { error } = await supabase.from('users').insert({
        id: user.id,
        username: tempUsername,
        avatar: 'pics/default-avatar.png',
        cover: 'pics/default-cover.jpg',
        bio: 'Just joined Retail ✨',
        location: '',
        followers: 0,
        following: 0
    });

    if (error) {
        console.error("Auto-create profile failed:", error);
        alert("Could not create profile: " + (error.message || 'unknown error'));
    } else {
        alert("Profile created successfully!");
        location.reload();
    }
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('kiy')) {
    openWallet();
  }
});

function openWallet() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('wallet').classList.add('active');
  window.scrollTo(0, 0);
}
// ─────────────────────────────────────────────────────────────
// Masonry grid heart animation (safe – reuses existing classes)
// ─────────────────────────────────────────────────────────────
function addMasonryHeartAnimationStyles() {
    if (document.getElementById('masonry-heart-anim-styles')) return;

    const style = document.createElement('style');
    style.id = 'masonry-heart-anim-styles';
    style.textContent = `
        .meta-heart {
            cursor: pointer;
            transition: transform 0.18s ease;
        }

        .meta-heart path {
            transition: fill 0.3s ease, stroke 0.3s ease;
        }

        .meta-heart.liked path {
            fill: rgb(244, 7, 82);
            stroke: rgb(244, 7, 82);
        }

        .meta-heart.animate-pop {
            animation: pop 0.3s ease forwards;
        }

        .meta-heart.animate-shrink {
            animation: shrinkFade 0.3s ease forwards;
        }

        .meta-likes.liked {
            color: rgb(244, 7, 82);
            font-weight: 500;
        }

        /* Optional small hover feedback */
        .meta-heart:hover {
            transform: scale(1.12);
        }

        /* Reuse the same animations you already have for feed hearts */
        @keyframes pop {
            0%   { transform: scale(1); }
            50%  { transform: scale(1.5); }
            100% { transform: scale(1); }
        }

        @keyframes shrinkFade {
            0%   { transform: scale(1);   opacity: 1; }
            50%  { transform: scale(0.6); opacity: 0.6; }
            100% { transform: scale(1);   opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// ─────────────────────────────────────────────────────────────
// Initialize clickable hearts in profile masonry grid
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Initialize clickable hearts in profile masonry grid
// ─────────────────────────────────────────────────────────────
function initializeMasonryHeartReactions() {
  document.querySelectorAll('.masonry-meta .meta-heart:not([data-init])')
    .forEach(heart => {
      heart.dataset.init = '1';

      const likesSpan = heart.nextElementSibling;
      const wrapper = heart.closest('[data-post-id]');
      const postId = wrapper?.dataset.postId;

      if (!postId) return;

      // initial state
      isPostLikedByCurrentUser(postId).then(liked => {
        if (liked) {
          heart.classList.add('liked');
          likesSpan.classList.add('liked');
        }
      });

      heart.addEventListener('click', async e => {
        e.stopPropagation();
        e.preventDefault();

        await toggleLike(postId, {
          querySelector: sel =>
            sel === '.heart-icon' ? heart :
            sel === '.like-count' ? likesSpan :
            null,
          getAttribute: () =>
            heart.classList.contains('liked') ? 'true' : 'false',
          setAttribute: (_, v) =>
            heart.classList.toggle('liked', v === 'true')
        });
      });
    });
}


// ─────────────────────────────────────────────────────────────
// SYNC LIKE STATE ACROSS FEED, DETAIL & MASONRY
// ─────────────────────────────────────────────────────────────
function syncLikeUI(postId, isLiked = null, count) {
    // Feed + detail hearts
    document.querySelectorAll(`.heart-ai[data-post-id="${postId}"]`).forEach(container => {
        const icon = container.querySelector('.heart-icon');
        const countEl = container.querySelector('.like-count');

        // Only update liked visual state if we have an explicit value
        if (isLiked !== null) {
            container.setAttribute('data-liked', isLiked ? 'true' : 'false');
            icon?.classList.toggle('liked', isLiked);
            countEl?.classList.toggle('liked', isLiked);
        }

        if (countEl) {
            countEl.textContent = count > 0 ? count : '';
        }
    });

    // Masonry / profile grid hearts
    document.querySelectorAll(`.masonry-wrapper[data-post-id="${postId}"] .masonry-meta`).forEach(meta => {
        const heartSvg = meta.querySelector('.meta-heart');
        const likesSpan = meta.querySelector('.meta-likes');

        if (isLiked !== null) {
            heartSvg?.classList.toggle('liked', isLiked);
            likesSpan?.classList.toggle('liked', isLiked);
        }

        if (likesSpan) {
            likesSpan.textContent = count > 0 ? count : '';
        }
    });
}

// ───────────────────────────────────────────────
// NOTIFICATIONS – Likes only for now
// ───────────────────────────────────────────────

// ───────────────────────────────────────────────
// NOTIFICATIONS – Likes only for now
// ───────────────────────────────────────────────

// ───────────────────────────────────────────────
// NOTIFICATIONS – Likes only for now
// ───────────────────────────────────────────────
async function loadLikeNotifications() {
    if (!currentUserId) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select(`
            id,
            created_at,
            read,
            actor_id,
            post_id,
            users!actor_id (
                username,
                avatar
            ),
            posts!fk_notifications_post_id (
                id,
                image,
                user_id,
                users!user_id (
                    username,
                    avatar
                )
            )
        `)
        .eq('user_id', currentUserId)
        .eq('type', 'like')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Notifications fetch failed:", error);
        return [];
    }

    return (data || []).map(row => ({
        id: row.id,
        created_at: row.created_at,
        read: row.read,
        actor_id: row.actor_id,
        actor: {
            username: row.users?.username || '@unknown',
            avatar: row.users?.avatar || 'pics/default-avatar.png'
        },
        post: {
            id: row.posts?.id || row.post_id,
            image: row.posts?.image,
            author: {
                username: row.posts?.users?.username || '@unknown',
                avatar: row.posts?.users?.avatar || 'pics/default-avatar.png'
            }
        }
    }));
}

function createNotificationElement(notif) {
    const actor = notif.actor || { username: '@unknown', avatar: 'pics/default-avatar.png' };
    const author = notif.post?.author || { username: '@unknown', avatar: 'pics/default-avatar.png' };
    const timeAgo = formatTimeSince(notif.created_at);

    const message = notif.type === 'repost' ? 'reposted your note' : 'liked your note';

    const div = document.createElement('div');
    div.className = 'notification-item';
    div.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border: 0.5px solid #eee;
        border-radius: 10px;
        margin: 8px 12px;
        background: white;
        cursor: pointer;
    `;

    div.innerHTML = `
        <div class="notification-left" style="display:flex; align-items:center; gap:12px; flex:1;">

            <!-- Avatar ONLY → goes to profile -->
            <div class="actor-avatar" style="cursor:pointer; flex-shrink:0;">
                <img src="${actor.avatar}" 
                     style="width:42px; height:42px; border-radius:50%; object-fit:cover;"
                     onerror="this.src='pics/default-avatar.png';"
                     alt="${actor.username}">
            </div>

            <!-- Username + message → goes to post detail -->
            <div class="actor-info" style="text-align:left; flex:1; cursor:pointer;">
                <div style="font-weight:600; font-size:15px;">${actor.username}</div>
                <div style="color:#555; font-size:14px; margin-top:2px;">
                    ${message} · ${timeAgo}
                </div>
            </div>
        </div>

        <!-- Right avatar → goes to post detail -->
        <div class="post-preview" style="cursor:pointer;">
            <img src="${author.avatar}" 
                 style="width:42px; height:42px; object-fit:cover; border-radius:10px;"
                 onerror="this.src='pics/default-avatar.png';"
                 alt="${author.username}'s avatar">
        </div>
    `;

    // Avatar ONLY → profile
    div.querySelector('.actor-avatar')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (notif.actor_id) showProfile(notif.actor_id);
    });

    // Everything else → post detail
    div.addEventListener('click', (e) => {
        if (e.target.closest('.actor-avatar')) return;
        if (notif.post?.id) showDetail(notif.post.id);
    });

    return div;
}

async function renderNotifications() {
    const container = document.querySelector('#notifications .notifications-body');
    if (!container) return;

    container.innerHTML = '<div class="skeleton" style="height:120px; margin:16px;"></div><p>Loading...</p>';

    const notifs = await loadLikeNotifications();

    container.innerHTML = '';

    if (notifs.length === 0) {
        container.innerHTML = `
            <div style="padding:60px 20px; text-align:center; color:#777;">
                <h3>No notifications yet</h3>
                <p style="margin-top:12px;">When someone likes your post, you'll see it here.</p>
            </div>
        `;
     
        return;
    }

    notifs.forEach(notif => {
        const item = createNotificationElement(notif);
        container.appendChild(item);
    });
}

async function deletePost(postId, postElement) {
    if (!currentUserId) {
        alert("You must be signed in");
        return;
    }

    // Optional: simple confirmation
    if (!confirm("Delete this post? This cannot be undone.")) {
        return;
    }

    try {
        // 1. Delete from Supabase
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', currentUserId);   // safety: only owner can delete

        if (error) throw error;

        // 2. Remove from UI immediately
        if (postElement) {
            postElement.remove();
        }

        // 3. Also remove from masonry grid if we're on profile
        const masonryWrapper = document.querySelector(`.masonry-wrapper[data-post-id="${postId}"]`);
        if (masonryWrapper) {
            masonryWrapper.remove();
        }

        // 4. (Nice to have) Remove from detail view if open
        if (document.getElementById('meal').classList.contains('active')) {
            const currentDetailId = document.querySelector('#nuba .cust-name')?.dataset.postId;
            if (currentDetailId === postId.toString()) {
                goBackFromDetail();
            }
        }

        console.log(`Post ${postId} deleted successfully`);

        // Optional: small success feedback
        showToast("Post deleted");

    } catch (err) {
        console.error("Delete failed:", err.message);
        alert("Could not delete post. Please try again.");
    }
}

// Optional – simple toast
function showToast(message, duration = 2200) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.85); color: white; padding: 12px 24px;
        border-radius: 999px; z-index: 9999; font-size: 15px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function shareProfile() {
    if (navigator.share) {
        navigator.share({
            title: document.querySelector('.spe')?.textContent || "My Retail profile",
            url: window.location.href
        }).catch(err => {
            console.log("Share failed", err);
        });
    } else {
        // Fallback: copy link
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert("Profile link copied to clipboard!"))
            .catch(() => alert("Could not copy link"));
    }
}

function updateNotificationBadge() {
    const badgeElements = document.querySelectorAll('.note-num');
    const noteIcons = document.querySelectorAll('.note1');

    badgeElements.forEach(el => {
        if (unreadNotificationCount > 0) {
            el.textContent = unreadNotificationCount > 99 ? '99+' : unreadNotificationCount;
            el.parentElement.style.display = 'flex';   // show red circle
        } else {
            el.textContent = '';
            el.parentElement.style.display = 'none';   // hide red circle
        }
    });

    // Optional: visual feedback on bell icon
    noteIcons.forEach(icon => {
        if (unreadNotificationCount > 0) {
            icon.classList.add('has-unread');
        } else {
            icon.classList.remove('has-unread');
        }
    });
}

async function subscribeToNotifications() {
    if (!currentUserId) return;
    if (notificationChannel) return; // already subscribed

    console.log("Subscribing to realtime notifications...");

    notificationChannel = supabase
        .channel('public:notifications')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${currentUserId}`
        }, (payload) => {
            console.log('New notification received!', payload.new);

            // Only count unread notifications of types you care about
            if (payload.new.read === false) {
                unreadNotificationCount += 1;
                updateNotificationBadge();

                // Optional: play a tiny sound or vibration
                if (navigator.vibrate) navigator.vibrate(40);
            }
        })
        .subscribe((status) => {
            console.log('Realtime subscription status:', status);
        });
}

async function loadInitialNotificationCount() {
    if (!currentUserId) return;

    const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId)
        .eq('read', false);

    if (error) {
        console.error("Could not load unread count:", error);
        return;
    }

    unreadNotificationCount = count || 0;
    updateNotificationBadge();
}

function updateCurrentUserRepostButtons(postId, isReposted) {
    // Finds buttons in BOTH feed and detail page using one selector.
    // This works because both now use data-post-id (see functions 3 & 4).
    document.querySelectorAll(`.repost-btn[data-post-id="${postId}"]`)
        .forEach(btn => {
            btn.setAttribute('data-reposted', isReposted ? 'true' : 'false');

            if (isReposted) {
                btn.classList.add('reposted');
            } else {
                btn.classList.remove('reposted');
            }
        });
}

// ───────────────────────────────────────────────
//  REPOST HELPERS
// ───────────────────────────────────────────────
async function getMyRepostOfPost(originalPostId) {
    if (!currentUserId) return null;

    const { data, error } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('reposted_post_id', originalPostId)
        .maybeSingle();

    if (error) {
        console.error('getMyRepostOfPost failed:', error.message);
        return null;
    }
    return data?.id || null;  // returns the repost's own id, or null
}

// The main toggle — mirrors toggleLike() exactly in structure.
// originalPostId  = the post being reposted
// repostBtnEl     = the .repost-btn DOM element that was clicked

async function toggleRepost(originalPostId, repostBtnEl) {
    if (!currentUserId) {
        alert('Please sign in to repost');
        return;
    }

    const countSpan = repostBtnEl.querySelector('span');
    const currentlyReposted = repostBtnEl.getAttribute('data-reposted') === 'true';

    let count = parseInt(countSpan?.textContent?.trim() || '0', 10);
    if (isNaN(count)) count = 0;

    if (currentlyReposted) {
        // ── UNREPOST ────────────────────────────────────────
        // Optimistic UI: remove green immediately
        repostBtnEl.setAttribute('data-reposted', 'false');
        repostBtnEl.classList.remove('reposted');

        try {
            const myRepostId = await getMyRepostOfPost(originalPostId);
            if (!myRepostId) return;

            // Delete your repost post
            const { error: deleteError } = await supabase
                .from('posts')
                .delete()
                .eq('id', myRepostId)
                .eq('user_id', currentUserId);

            if (deleteError) throw deleteError;

            // Decrement count via RPC (bypasses RLS)
            const { error: rpcError } = await supabase
                .rpc('decrement_repost_count', { post_id: originalPostId });

            if (rpcError) {
                console.error('decrement_repost_count RPC failed:', rpcError.message);
            } else {
                // Fetch real count from DB
                const { data: updated } = await supabase
                    .from('posts')
                    .select('repost_count')
                    .eq('id', originalPostId)
                    .single();

                const newCount = updated?.repost_count || 0;

                // Update public count everywhere
                document.querySelectorAll(`.repost-btn[data-post-id="${originalPostId}"] span`)
                    .forEach(span => {
                        span.textContent = newCount > 0 ? newCount : '';
                    });

                // Also update detail page stat display if visible
                document.querySelectorAll('.repost-count-display')
                    .forEach(el => {
                        el.textContent = newCount;
                    });
            }

            // Remove green from all of current user's buttons for this post
            updateCurrentUserRepostButtons(originalPostId, false);

            // Remove the repost card from the feed if visible
            const repostEl = document.querySelector(`.poster[data-post-id="${myRepostId}"]`);
            if (repostEl) repostEl.remove();

            // If the user is currently viewing the deleted repost's detail page, go back
            const detailPage = document.getElementById('meal');
            if (detailPage?.classList.contains('active')) {
                const currentDetailId = document.querySelector('#nuba .cust-name')?.dataset.postId;
                if (currentDetailId === myRepostId.toString()) {
                    goBackFromDetail();
                }
            }

            console.log(`Un-reposted ${originalPostId}`);

        } catch (err) {
            console.error('Un-repost failed:', err.message);
            // Revert optimistic UI on failure
            repostBtnEl.setAttribute('data-reposted', 'true');
            repostBtnEl.classList.add('reposted');
            alert("Couldn't remove repost. Try again.");
        }

    } else {
        // ── REPOST (open composer) ──────────────────────────
        // Green is applied only after successful submit in submitPost()
        handleRepostClick(originalPostId, repostBtnEl);
    }
}


// ───────────────────────────────────────────────
//  UPDATED: createPostElement — now supports reposts
// ───────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────
// SECTION 4 — REPLACE createPostElement()
// Two changes inside:
//   A) The repost button HTML now has data-reposted="false" and
//      uses an inline SVG instead of an img tag so stroke-width
//      can be changed via CSS class.
//   B) The repost button click listener now calls toggleRepost()
//      instead of handleRepostClick().
// Everything else is identical to your current version.
// ───────────────────────────────────────────────────────────────
function createPostElement(post) {
    const user = {
        username: post.username || 'new user',
        avatar:   post.avatar   || 'pics/tt.jpg.jpg'
    };

    const textLimit  = (post.image || post.video) ? 150 : 300;
    const hasVideo   = !!post.video;
    const hasImage   = !!post.image;
    const isOwnPost  = currentUserId && post.userId === currentUserId;

    // ─── REPOST CHECK ───
    const isRepost    = !!post.reposted_post_id && post.reposted_post;
    const original    = isRepost ? post.reposted_post : null;
    const originalUser = original ? {
        username: original.user?.username || '@unknown',
        avatar:   original.user?.avatar   || 'pics/default-avatar.png'
    } : null;

    const posterElement = document.createElement('div');
    posterElement.className = 'poster';
    if (isRepost) posterElement.classList.add('is-repost');
    posterElement.setAttribute('data-post-id', post.id);

    let mainContentHTML = '';

    if (isRepost) {
        mainContentHTML = `
            ${post.content ? `
                <div class="tir repost-commentary">
                    <p class="tired">${shortenText(post.content, textLimit, true)}</p>
                </div>
            ` : ''}

            <div class="original-post-card" data-original-post-id="${original.id}">
                <div class="repost-indicator">
                    <img src="pics/retweet.svg" alt="Repost" style="width:18px;height:18px;">
                    <span>Reposted from @${originalUser.username}</span>
                </div>

                <div class="cust-name">
                    <div class="heading">
                        <div class="small-photo1">
                            <a class="lino" onclick="showProfile('${original.user_id}')">
                                <img class="small-photo" src="${originalUser.avatar}">
                            </a>
                        </div>
                        <div class="pos">
                            <div class="link-wrapper">
                                <a class="home-click" onclick="showProfile('${original.user_id}')">
                                    <div class="post1">
                                        <div class="jerr">
                                            <p class="jerry">${originalUser.username}</p>
                                        </div>
                                        <div><img class="verif" src="pics/very.svg"></div>
                                    </div>
                                </a>
                            </div>
                            <div class="comp1">
                                <div class="cll">
                                    <p class="time">${formatTimeSince(original.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                ${original.content ? `<div class="tir"><p class="tired">${shortenText(original.content, textLimit, true)}</p></div>` : ''}

                ${original.image ? `
                    <div class="laptop1">
                        <img src="${original.image}" class="laptop" alt="Original post image" loading="lazy">
                    </div>
                ` : ''}

                ${original.video ? `
                    <div class="video-container laptop1" data-post-id="${original.id}">
                        <video class="video-thumbnail" preload="metadata">
                            <source src="${original.video}" type="video/mp4">
                        </video>
                        <div class="video-overlay">
                            <div class="play-button">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <circle cx="24" cy="24" r="22" fill="rgba(244,7,82,0.5)" stroke="white" stroke-width="3"/>
                                    <path d="M34 24L18 34V14L34 24Z" fill="white"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="view-original" style="padding:8px 12px; color:#1d9bf0; font-size:14px; cursor:pointer;">
                    View original post →
                </div>
            </div>
        `;
    } else {
        mainContentHTML = `
            ${hasImage ? `
                <div class="laptop1">
                    <img src="${post.image}" class="laptop" alt="Post image" loading="lazy">
                </div>
            ` : ''}

            ${hasVideo ? `
                <div class="video-container laptop1" data-post-id="${post.id}">
                    <video class="video-thumbnail" preload="metadata">
                        <source src="${post.video}" type="video/mp4">
                    </video>
                    <div class="video-overlay">
                        <div class="play-button">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <circle cx="24" cy="24" r="22" fill="rgba(244,7,82,0.5)" stroke="white" stroke-width="3"/>
                                <path d="M34 24L18 34V14L34 24Z" fill="white"/>
                            </svg>
                        </div>
                    </div>
                </div>
            ` : ''}

            <div class="tir">
                <p class="tired">${shortenText(post.content, textLimit, true)}</p>
            </div>
        `;
    }

    posterElement.innerHTML = `
        <div class="cust-name">
            <div class="heading">
                <div class="small-photo1">
                    <a class="lino" onclick="${isOwnPost ? 'showMyProfile()' : `showProfile('${post.userId}')`}">
                        <img class="small-photo" src="${user.avatar}">
                    </a>
                </div>
                <div class="pos">
                    <div>
                        <div class="link-wrapper">
                            <a class="home-click" onclick="${isOwnPost ? 'showMyProfile()' : `showProfile('${post.userId}')`}">
                                <div class="post1">
                                    <div class="jerr">
                                        <p class="jerry">${user.username}</p>
                                    </div>
                                    <div><img class="verif" src="pics/very.svg"></div>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="comp1">
                        <div class="cll">
                            <p class="time">${post.timestamp}</p>
                            <div class="tool"><p>7.23pm · Sept 23, 2024</p></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dots">
                <img class="dot" src="pics/dots.svg">
                <div class="tool"><p>More</p></div>
            </div>
        </div>

        ${mainContentHTML}

        <div class="lefto">
            <div class="dick">
                <div>
                    <img class="lefti" src="pics/bounce.svg">
                </div>
                <div>
                    <p class="viewe">View all ${post.commentCount || 0} discuss</p>
                </div>
            </div>
            <div class="twits">
                <div><img class="lefti" src="pics/stats.svg"></div>
                <div><p class="viewe">${post.views || '0'} views</p></div>
            </div>
        </div>

        <div class="reaction">
            <div class="reaction-container">
                <div class="call">
                    <div class="mee">
                        <div class="comment-btn" data-post-id="${post.id}">
                            <img class="feeling" src="pics/comment.svg" alt="Comment">
                            <span>${post.commentCount || 0}</span>
                        </div>

                        <div class="repost-btn"
                             data-post-id="${post.id}"
                             data-reposted="false">
                            <img class="feeling repost-icon" src="pics/retweet.svg" alt="Repost">
                            <span>${post.repostCount > 0 ? post.repostCount : ''}</span>
                        </div>

                        <div class="heart-ai" data-post-id="${post.id}" data-liked="false">
                            <svg class="heart-icon heart-clickable" width="22" height="22" viewBox="0 0 24 24">
                                <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span class="like-count heart-clickable">${post.likeCount > 0 ? post.likeCount : ''}</span>
                        </div>
                    </div>
                    <div class="mee">
                        <div class="donate-btn"><img class="feeling" src="pics/bookmark.svg" alt="Bookmark"></div>
                        <div class="donate-btn"><img class="feeling" src="pics/share.svg"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // ─── Event listeners ──────────────────────────────────────

    posterElement.addEventListener('click', (e) => {
        if (posterElement.dataset.blockNavigation === 'true') return;
        if (e.target.closest('.repost-btn, .heart-ai, .comment-btn, .dots, a, button')) return;
        showDetail(post.id);
    });

    posterElement.querySelector('.view-original')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (original?.id) showDetail(original.id);
    });

    // ── Repost button ──
    // KEY FIX: targetPostId is always post.id.
    // Post A card → targets Post A. Post B card → targets Post B.
    // Never original.id — that was the bug.
    const repostBtn = posterElement.querySelector('.repost-btn');
    if (repostBtn) {
        const targetPostId = post.id;

        // Check DB: did the current user already repost this specific post?
        getMyRepostOfPost(targetPostId).then(myRepostId => {
            if (myRepostId) {
                repostBtn.setAttribute('data-reposted', 'true');
                repostBtn.classList.add('reposted');
            }
        });

        repostBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleRepost(targetPostId, repostBtn);
        });
    }

    // ── Like ──
    const heartContainer = posterElement.querySelector('.heart-ai');
    if (heartContainer) {
        isPostLikedByCurrentUser(post.id).then(liked => {
            if (liked) {
                heartContainer.setAttribute('data-liked', 'true');
                heartContainer.querySelector('.heart-icon')?.classList.add('liked');
                heartContainer.querySelector('.like-count')?.classList.add('liked');
            }
        });

        heartContainer.querySelectorAll('.heart-clickable').forEach(el => {
            el.addEventListener('click', async (e) => {
                e.stopPropagation();
                await toggleLike(post.id, heartContainer);
            });
        });
    }

    enablePostLongPress(posterElement, post);
    return posterElement;
}

// ───────────────────────────────────────────────
//  REPOST MODAL OPENER (using your existing composer)
// ───────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────
// SECTION 2 — REPLACE handleRepostClick()
// Find your existing handleRepostClick() and replace the whole
// function with this one. It now accepts the button element so
// it can turn green after the post is submitted.
// ───────────────────────────────────────────────────────────────

async function handleRepostClick(postId, repostBtnEl) {
    if (!currentUserId) {
        alert('Please sign in to repost');
        return;
    }
    
    // Prevent self-repost
    const { data: originalPost } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

    if (originalPost?.user_id === currentUserId) {
        showToast("You can't repost your own post");
        return;
    }

    try {
        const { data: originalPost, error } = await supabase
            .from('posts')
            .select(`
                id, content, image, video, created_at, user_id,
                user:users ( id, username, avatar )
            `)
            .eq('id', postId)
            .single();

        if (error || !originalPost) {
            alert('Cannot find original post');
            return;
        }

        makePost();

        const postBtn = document.getElementById('postBtn');
        if (postBtn) {
            postBtn.dataset.repostingId = originalPost.id;
            postBtn.dataset.repostBtnElementId = repostBtnEl.id || 'unknown'; // optional tracking
        }

        const preview = document.getElementById('mediaPreview');
        if (preview) {
            preview.innerHTML = '';
            const card = document.createElement('div');
            card.style.cssText = 'border:1px solid #ddd; border-radius:8px; padding:10px; margin:8px 0; background:#f9f9f9; position:relative;';
            card.innerHTML = `
                <button class="remove-repost-preview" style="position:absolute;top:4px;right:8px;background:#aaa;color:white;border:none;border-radius:50%;width:22px;height:22px;line-height:18px;cursor:pointer;">×</button>
                <small style="color:#666;">Reposting from @${originalPost.user?.username || 'user'}</small>
                ${originalPost.content ? `<p style="margin:6px 0;font-size:14px;">${originalPost.content.substring(0,120)}${originalPost.content.length > 120 ? '...' : ''}</p>` : ''}
                ${originalPost.image ? `<img src="${originalPost.image}" style="max-height:140px;border-radius:6px;" />` : ''}
            `;
            preview.appendChild(card);

            card.querySelector('.remove-repost-preview').onclick = () => {
                card.remove();
                if (postBtn) {
                    delete postBtn.dataset.repostingId;
                    delete postBtn.dataset.repostBtnElementId;
                }
                updatePostButtonState();
            };
        }

    } catch (err) {
        console.error('Repost prepare failed', err);
        alert('Could not prepare repost');
    }
}

// ───────────────────────────────────────────────
//  UPDATED submitPost — now supports reposts
// ───────────────────────────────────────────────
// ───────────────────────────────────────────────
//  FIXED submitPost — now properly fetches nested repost data
// ───────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────
// SECTION 3 — REPLACE submitPost()
// Find your existing submitPost() and replace the whole function.
// The only additions are: turning the repost button green after
// a successful repost, and syncing the repost count.
// ───────────────────────────────────────────────────────────────
async function submitPost() {
    const content = document.getElementById('postContent')?.value?.trim() || '';
    const postBtn = document.getElementById('postBtn');
    const repostedId = postBtn?.dataset.repostingId;

    if (!content && !selectedMediaFile && !repostedId) {
        alert('Write something, add photo, or repost something');
        return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        alert('You must be logged in');
        return;
    }

    let imageUrl = null;
    if (selectedMediaFile) {
        const fileExt = selectedMediaFile.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(fileName, selectedMediaFile, { upsert: false });

        if (uploadError) {
            alert('Image upload failed: ' + uploadError.message);
            return;
        }

        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
    }

    const postData = {
        user_id: user.id,
        content: content || null,
        image: imageUrl || null,
        reposted_post_id: repostedId || null
    };

    const { data: newPost, error: insertError } = await supabase
        .from('posts')
        .insert([postData])
        .select(`
            id, content, image, created_at, reposted_post_id,
            user:users ( username, avatar ),
            reposted_post:reposted_post_id (
                id, content, image, video, created_at, user_id,
                user:users ( id, username, avatar )
            )
        `)
        .single();

    if (insertError) {
        alert('Could not create post: ' + insertError.message);
        return;
    }

    closePostModal();
    if (postBtn) delete postBtn.dataset.repostingId;
    document.getElementById('mediaPreview').innerHTML = '';

    // Add new post to feed
    const adapted = {
        id: newPost.id,
        userId: user.id,
        username: newPost.user?.username || '@you',
        avatar: newPost.user?.avatar || 'pics/default-avatar.png',
        content: newPost.content || '',
        image: newPost.image,
        video: null,
        timestamp: 'just now',
        likeCount: 0,
        commentCount: 0,
        repostCount: 0,
        views: 0,
        reposted_post_id: newPost.reposted_post_id,
        reposted_post: newPost.reposted_post || null
    };

    const el = createPostElement(adapted);
    document.getElementById('flyer')?.prepend(el);

    // If this was a repost → update count + send notification
    if (repostedId) {
        try {
            // Use RPC so we can update any post's count regardless of ownership
            const { error: rpcError } = await supabase
                .rpc('increment_repost_count', { post_id: repostedId });

            if (rpcError) {
                console.error('increment_repost_count RPC failed:', rpcError.message);
            } else {
                // Fetch the real new count from DB to display accurately
                const { data: updated } = await supabase
                    .from('posts')
                    .select('repost_count')
                    .eq('id', repostedId)
                    .single();

                const newCount = updated?.repost_count || 0;

                // Update the public count on all visible buttons for this post
                document.querySelectorAll(`.repost-btn[data-post-id="${repostedId}"] span`)
                    .forEach(span => {
                        span.textContent = newCount > 0 ? newCount : '';
                    });

                // Also update the detail page stat display if visible
                document.querySelectorAll('.repost-count-display')
                    .forEach(el => {
                        el.textContent = newCount;
                    });
            }

            // Turn green ONLY for current user regardless of RPC result
            updateCurrentUserRepostButtons(repostedId, true);

            // ── SEND REPOST NOTIFICATION ──────────────────────────
            // Fetch the original post's owner so we know who to notify
            const { data: originalPost } = await supabase
                .from('posts')
                .select('user_id')
                .eq('id', repostedId)
                .single();

            // Only notify if reposter is not the post owner
            if (originalPost && originalPost.user_id !== user.id) {
                const { error: notifError } = await supabase
                    .from('notifications')
                    .insert({
                        user_id:  originalPost.user_id,  // who receives the notification
                        actor_id: user.id,               // who did the reposting
                        post_id:  repostedId,            // the original post
                        type:     'repost',
                        read:     false
                    });

                if (notifError) {
                    console.error('Repost notification failed:', notifError.message);
                }
            }
            // ─────────────────────────────────────────────────────

        } catch (err) {
            console.error('Failed to update repost count:', err.message);
        }
    }

    showToast('Posted!');
}

async function loadRepostNotifications() {
    if (!currentUserId) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select(`
            id,
            created_at,
            read,
            actor_id,
            post_id,
            users!actor_id (
                username,
                avatar
            ),
            posts!fk_notifications_post_id (
                id,
                image,
                user_id,
                users!user_id (
                    username,
                    avatar
                )
            )
        `)
        .eq('user_id', currentUserId)
        .eq('type', 'repost')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Repost notifications fetch failed:", error);
        return [];
    }

    return (data || []).map(row => ({
        id: row.id,
        created_at: row.created_at,
        read: row.read,
        actor_id: row.actor_id,
        type: 'repost',
        actor: {
            username: row.users?.username || '@unknown',
            avatar: row.users?.avatar || 'pics/default-avatar.png'
        },
        post: {
            id: row.posts?.id || row.post_id,
            image: row.posts?.image,
            author: {
                username: row.posts?.users?.username || '@unknown',
                avatar: row.posts?.users?.avatar || 'pics/default-avatar.png'
            }
        }
    }));
}

async function renderNotifications() {
    const container = document.querySelector('#notifications .notifications-body');
    if (!container) return;

    container.innerHTML = '<div class="skeleton" style="height:120px; margin:16px;"></div><p>Loading...</p>';

    // Load both types in parallel
    const [likeNotifs, repostNotifs] = await Promise.all([
        loadLikeNotifications(),
        loadRepostNotifications()
    ]);

    // Tag like notifications with their type (repost ones already have type set)
    const taggedLikes = likeNotifs.map(n => ({ ...n, type: 'like' }));

    // Merge and sort by newest first
    const allNotifs = [...taggedLikes, ...repostNotifs]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    container.innerHTML = '';

    if (allNotifs.length === 0) {
        container.innerHTML = `
            <div style="padding:60px 20px; text-align:center; color:#777;">
                <h3>No notifications yet</h3>
                <p style="margin-top:12px;">When someone likes or reposts your note, you'll see it here.</p>
            </div>
        `;
        return;
    }

    allNotifs.forEach(notif => {
        const item = createNotificationElement(notif);
        container.appendChild(item);
    });
}

// ───────────────────────────────────────────────
//  UPDATED loadMorePosts — must include reposted_post relation
// ───────────────────────────────────────────────
async function loadMorePosts() {
    if (isLoading) return;
    isLoading = true;

    const postContainer = document.getElementById("flyer");
    if (!postContainer) {
        console.error("Cannot find #flyer");
        isLoading = false;
        return;
    }

    // Skeletons...
    addSkeletonStyles();
    for (let i = 0; i < postsPerLoad; i++) {
        postContainer.appendChild(createSkeletonPost());
    }

    try {
        const { data: fetchedPosts, error } = await supabase
            .from('posts')
            .select(`
                id, content, image, video, created_at,
                like_count, comment_count, repost_count, views, user_id,
                reposted_post_id,
                user:users ( id, username, avatar ),
                reposted_post:reposted_post_id (
                    id, content, image, video, created_at, user_id,
                    user:users ( id, username, avatar )
                )
            `)
            .order('created_at', { ascending: false })
            .range(loadedPostIds.size, loadedPostIds.size + postsPerLoad - 1);

        if (error) throw error;
        if (!fetchedPosts?.length) {
            console.log("No more posts");
            isLoading = false;
            return;
        }

        document.querySelectorAll('.skeleton').forEach(s => s.remove());

        fetchedPosts.forEach(p => {
            if (loadedPostIds.has(p.id)) return;
            loadedPostIds.add(p.id);

            const adapted = {
                id: p.id,
                userId: p.user_id,
                username: p.user?.username || '@unknown',
                avatar: p.user?.avatar || 'pics/default-avatar.png',
                content: p.content || '',
                image: p.image || null,
                video: p.video || null,
                timestamp: formatTimeSince(p.created_at),
                likeCount: p.like_count || 0,
                commentCount: p.comment_count || 0,
                repostCount: p.repost_count || 0,
                views: p.views || 0,
                reposted_post_id: p.reposted_post_id,
                reposted_post: p.reposted_post ? {
                    id: p.reposted_post.id,
                    content: p.reposted_post.content,
                    image: p.reposted_post.image,
                    video: p.reposted_post.video,
                    created_at: p.reposted_post.created_at,
                    user_id: p.reposted_post.user_id,
                    user: p.reposted_post.user
                } : null
            };

            const el = createPostElement(adapted);
            if (el) postContainer.appendChild(el);
        });

    } catch (err) {
        console.error("Load posts failed", err);
        alert("Error loading posts");
    } finally {
        isLoading = false;
    }
}

function buildMasonryTile(post, ownerAvatar, ownerUsername) {
    // For a repost: display the original's visual, fallback to reposter's content
    const displayImage   = post.reposted_post?.image   || post.image   || null;
    const displayVideo   = post.reposted_post?.video   || post.video   || null;
    const displayContent = post.reposted_post?.content || post.content || '';
    const isRepost       = !!post.reposted_post_id && !!post.reposted_post;

    const truncated = displayContent.substring(0, 80) + (displayContent.length > 80 ? '…' : '');

    /* ───── WRAPPER ───── */
    const wrapper = document.createElement('div');
    wrapper.className = 'masonry-wrapper';
    wrapper.dataset.postId = post.id;  // Always the repost's own ID
    wrapper.addEventListener('click', () => showDetail(post.id));

    /* ───── MASONRY TILE ───── */
    const masonryDiv = document.createElement('div');
    masonryDiv.className = 'masonry';
    masonryDiv.style.position = 'relative'; // so badge can be absolute

    masonryDiv.innerHTML = `
        ${displayImage ? `<img src="${displayImage}" loading="lazy" alt="">` : ''}
        ${displayVideo ? `
            <div class="video-container power">
                <video class="video-thumbnail" preload="metadata">
                    <source src="${displayVideo}" type="video/mp4">
                </video>
                <div class="video-overlay power">
                    <div class="play-button power">
                        <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                            <circle cx="24" cy="24" r="22" fill="rgba(244,7,82,0.5)" stroke="white" stroke-width="3"/>
                            <path d="M34 24L18 34V14L34 24Z" fill="white"/>
                        </svg>
                    </div>
                </div>
            </div>
        ` : ''}
        <div class="contentma">
            <p class="partner">${truncated}</p>
        </div>

        ${isRepost ? `
            <div class="masonry-repost-badge" title="Reposted">
                <img src="pics/retweet.svg" alt="Repost">
            </div>
        ` : ''}
    `;

    /* ───── META BAR ───── */
    const metaDiv = document.createElement('div');
    metaDiv.className = 'masonry-meta';
    metaDiv.innerHTML = `
        <div class="meta-left">
            <img class="meta-avatar" src="${ownerAvatar || 'pics/default-avatar.png'}"
                 onerror="this.src='pics/default-avatar.png'">
            <span class="meta-username">${ownerUsername}</span>
        </div>
        <div class="meta-right">
            <svg class="meta-heart" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span class="meta-likes">${post.like_count || ''}</span>
        </div>
    `;

    // Stop heart tap from triggering navigation
    metaDiv.querySelector('.meta-heart').addEventListener('click', e => e.stopPropagation());
    metaDiv.querySelector('.meta-likes').addEventListener('click', e => e.stopPropagation());

    wrapper.appendChild(masonryDiv);
    wrapper.appendChild(metaDiv);

    return wrapper;
}


// ─────────────────────────────────────────────────────────────────
// FUNCTION 1 of 6 — addRepostStyles()
// This is a NEW function. Add it anywhere in view.js, then add
// addRepostStyles(); inside your DOMContentLoaded block.
// ─────────────────────────────────────────────────────────────────

function addRepostStyles() {
    if (document.getElementById('repost-styles')) return;

    const style = document.createElement('style');
    style.id = 'repost-styles';
    style.textContent = `
        .repost-icon {
            transition: filter 0.2s ease;
        }

        /* Dark green + bolder look when reposted */
        .repost-btn.reposted .repost-icon {
            filter:
                invert(29%) sepia(89%) saturate(400%) hue-rotate(110deg)
                brightness(90%) contrast(130%)
                drop-shadow(0 0 0.6px #065f46);
        }

        /* Count text turns dark green too */
        .repost-btn.reposted span {
            color: #065f46;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
}



// ═══════════════════════════════════════════════════════════════════════════
// STAIRCASE COMMENT SYSTEM — Drop this entire file into your project
//
// HOW TO USE:
//   1. Run SUPABASE_SETUP.sql in your Supabase SQL Editor first.
//   2. Replace / remove your old comment functions in view.js:
//        • loadComments()
//        • renderComment()
//        • submitComment()
//        • subscribeToComments()
//        • addCommentStyles()
//        • autoResizeCibTextarea()
//        • updateCibSendBtn()
//   3. Paste this entire file at the bottom of view.js (or as its own
//      <script src="comment_system.js"> tag loaded AFTER view.js).
//   4. The showDetail() function already renders  #comments-list and
//      .comment-input-bar — this file handles everything inside them.
//
// WHAT'S NEW vs your old system:
//   • Replies are stored in DB with parent_id
//   • Tapping "Reply" on comment A animates the list so A's replies
//     slide open between A and the next top-level comment (staircase).
//   • Tapping "Reply" again collapses them with a smooth slide.
//   • Comment likes are persisted to comment_likes table via RPC.
//   • Realtime: new top-level comments AND replies appear live.
//   • Verified badge, avatar, heart with count, reply count, timestamps.
// ═══════════════════════════════════════════════════════════════════════════

// ── Realtime channel ──────────────────────────────────────────────────────
let commentChannel = null;

// ── Active reply target { commentId, username } ──────────────────────────
let activeReplyTarget = null;

// ── Inject all styles once ───────────────────────────────────────────────
function addCommentStyles() {
    if (document.getElementById('comment-system-styles')) return;
    const style = document.createElement('style');
    style.id = 'comment-system-styles';
    style.textContent = `
/* ════════════════════════════════════════════
   DETAIL PAGE PADDING
   ════════════════════════════════════════════ */
#nuba { padding-bottom: 130px; }

/* ════════════════════════════════════════════
   COMMENT SECTION LABEL
   ════════════════════════════════════════════ */
.comments-heading {
    padding: 16px 16px 10px;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #111;
    letter-spacing: -0.2px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 8px;
}
.comments-heading-count {
    font-size: 13px;
    font-weight: 500;
    color: #aaa;
}

/* ════════════════════════════════════════════
   COMMENT LIST WRAPPER
   ════════════════════════════════════════════ */
#comments-list {
    padding: 0 0 12px;
}

/* ════════════════════════════════════════════
   TOP-LEVEL COMMENT BLOCK
   Each block = the comment + its replies pocket
   ════════════════════════════════════════════ */
.comment-block {
    /* No overflow hidden here — replies animate height */
}

/* ════════════════════════════════════════════
   SINGLE COMMENT ROW
   ════════════════════════════════════════════ */
.comment-item {
    display: flex;
    gap: 11px;
    padding: 13px 16px 10px;
    border-bottom: 1px solid #f5f5f5;
    animation: commentFadeUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
    position: relative;
}
@keyframes commentFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* Reply indent */
.comment-item.is-reply {
    padding-left: 56px;
    background: #fafafa;
    border-bottom-color: #f0f0f0;
}
.comment-item.is-reply:last-child {
    border-bottom: none;
}

/* ════════════════════════════════════════════
   AVATAR COLUMN
   ════════════════════════════════════════════ */
.comment-avatar-col {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 36px;
}
.comment-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
    border: 1.5px solid #f0f0f0;
    cursor: pointer;
    flex-shrink: 0;
}
.comment-item.is-reply .comment-avatar {
    width: 28px;
    height: 28px;
}

/* Thread connector line (visible on top-level when replies are open) */
.comment-thread-line {
    width: 2px;
    flex: 1;
    margin-top: 5px;
    min-height: 12px;
    background: linear-gradient(to bottom, #e8e8e8, transparent);
    border-radius: 1px;
    transition: opacity 0.25s;
    opacity: 0;
}
.comment-block.replies-open > .comment-item .comment-thread-line {
    opacity: 1;
}

/* ════════════════════════════════════════════
   COMMENT BODY
   ════════════════════════════════════════════ */
.comment-body {
    flex: 1;
    min-width: 0;
}
.comment-header {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 3px;
    flex-wrap: nowrap;
}
.comment-username {
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    color: #0f0f0f;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
}
.comment-username:hover { text-decoration: underline; }

.comment-verif {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    opacity: 0.9;
}
.comment-time {
    font-size: 11.5px;
    color: #bbb;
    margin-left: auto;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    white-space: nowrap;
    flex-shrink: 0;
}

.comment-text {
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0 0 8px;
}
.comment-mention {
    color: #f40752;
    font-weight: 600;
}

/* ════════════════════════════════════════════
   ACTION ROW  (heart · reply · view replies)
   ════════════════════════════════════════════ */
.comment-actions-row {
    display: flex;
    align-items: center;
    gap: 18px;
}

/* ── Heart ── */
.comment-like-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-size: 12px;
    color: #bbb;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    transition: color 0.2s;
    -webkit-tap-highlight-color: transparent;
}
.comment-like-btn svg {
    width: 15px;
    height: 15px;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.comment-like-btn.liked {
    color: rgb(244, 7, 82);
}
.comment-like-btn.liked svg path {
    fill: rgb(244, 7, 82);
    stroke: rgb(244, 7, 82);
}
.comment-like-btn.pop svg {
    animation: commentHeartPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes commentHeartPop {
    0%  { transform: scale(1); }
    45% { transform: scale(1.7); }
    100%{ transform: scale(1); }
}
.comment-like-count { min-width: 8px; }

/* ── Reply text button ── */
.comment-reply-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: 12px;
    color: #bbb;
    cursor: pointer;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    transition: color 0.2s;
    -webkit-tap-highlight-color: transparent;
    font-weight: 500;
}
.comment-reply-btn:hover,
.comment-reply-btn.active { color: #f40752; }

/* ── "View N replies" button ── */
.comment-view-replies-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    padding: 0;
    font-size: 12px;
    color: #888;
    cursor: pointer;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    font-weight: 600;
    transition: color 0.2s;
    -webkit-tap-highlight-color: transparent;
    margin-left: auto;  /* push to far right */
}
.comment-view-replies-btn:hover { color: #111; }
.comment-view-replies-btn svg {
    width: 12px;
    height: 12px;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    flex-shrink: 0;
}
.comment-view-replies-btn.open svg {
    transform: rotate(180deg);
}
.comment-view-replies-btn .replies-line {
    display: inline-block;
    width: 18px;
    height: 1.5px;
    background: #bbb;
    border-radius: 1px;
    margin-right: 2px;
}

/* ════════════════════════════════════════════
   REPLIES POCKET  (staircase animation)
   ════════════════════════════════════════════ */
.replies-pocket {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.42s cubic-bezier(0.22, 1, 0.36, 1),
                opacity 0.3s ease;
    opacity: 0;
    background: #fafafa;
    border-bottom: 1px solid #ececec;
}
.replies-pocket.open {
    /* max-height is set dynamically by JS to scrollHeight */
    opacity: 1;
}

.replies-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px 12px 56px;
    font-size: 12px;
    color: #bbb;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
}
.replies-loading .spin {
    width: 14px;
    height: 14px;
    border: 2px solid #eee;
    border-top-color: #f40752;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.load-more-replies-btn {
    display: block;
    margin: 4px 16px 10px 56px;
    background: none;
    border: none;
    padding: 6px 0;
    font-size: 12px;
    color: #f40752;
    font-weight: 600;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    cursor: pointer;
}

/* ════════════════════════════════════════════
   EMPTY STATE
   ════════════════════════════════════════════ */
.comments-empty {
    text-align: center;
    padding: 50px 20px 30px;
    color: #bbb;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
}
.comments-empty svg {
    width: 44px;
    height: 44px;
    opacity: 0.25;
    margin-bottom: 12px;
}
.comments-empty p { font-size: 15px; font-weight: 600; color: #ccc; margin: 0 0 4px; }
.comments-empty span { font-size: 12.5px; color: #d5d5d5; }

/* ════════════════════════════════════════════
   SKELETON LOADER
   ════════════════════════════════════════════ */
.comment-skeleton {
    display: flex;
    gap: 11px;
    padding: 13px 16px;
    border-bottom: 1px solid #f5f5f5;
}
.comment-skel-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
}
.comment-skel-body { flex: 1; }
.comment-skel-line {
    height: 11px;
    border-radius: 6px;
    margin-bottom: 8px;
}
.comment-skel-line.w40 { width: 40%; }
.comment-skel-line.w80 { width: 80%; }
.comment-skel-line.w65 { width: 65%; }

.comment-skeleton .comment-skel-avatar,
.comment-skeleton .comment-skel-line {
    background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
    background-size: 600px 100%;
    animation: skelShimmer 1.3s infinite ease-in-out;
}
@keyframes skelShimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
}

/* ════════════════════════════════════════════
   LOAD MORE (top-level)
   ════════════════════════════════════════════ */
.load-more-comments-btn {
    display: block;
    width: calc(100% - 32px);
    margin: 6px 16px 10px;
    padding: 11px;
    background: #f7f7f7;
    border: none;
    border-radius: 10px;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    font-size: 13px;
    color: #555;
    cursor: pointer;
    text-align: center;
    transition: background 0.15s;
}
.load-more-comments-btn:hover { background: #efefef; }

/* ════════════════════════════════════════════
   FIXED COMMENT INPUT BAR
   ════════════════════════════════════════════ */
.comment-input-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 200;
    background: #fff;
    border-top: 1px solid #ebebeb;
    padding: 8px 12px 12px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
}

/* Reply indicator */
.cib-reply-indicator {
    display: none;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: #fff5f8;
    border-radius: 8px;
    margin-bottom: 6px;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    font-size: 12px;
    color: #f40752;
    border-left: 3px solid #f40752;
}
.cib-reply-indicator.visible { display: flex; }
.cib-reply-indicator span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cib-reply-close {
    background: none; border: none; cursor: pointer;
    font-size: 16px; line-height: 1; color: #f40752; padding: 0 2px;
}

/* Reaction micro-row above input */
.cib-reactions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px 8px;
    border-bottom: 1px solid #f3f3f3;
    margin-bottom: 8px;
}
.cib-reactions-left { display: flex; align-items: center; gap: 20px; }

/* Input row */
.cib-input-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
}
.cib-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    margin-bottom: 2px;
    border: 1.5px solid #f0f0f0;
}
.cib-input-wrap {
    flex: 1;
    background: #f7f7f7;
    border-radius: 22px;
    display: flex;
    align-items: flex-end;
    padding: 6px 10px 6px 14px;
    gap: 6px;
    min-height: 40px;
    border: 1.5px solid transparent;
    transition: border-color 0.2s, background 0.2s;
}
.cib-input-wrap:focus-within {
    border-color: #f40752;
    background: #fff;
}
.cib-textarea {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    resize: none;
    font-size: 14px;
    font-family: 'IBM Plex Sans', Roboto, sans-serif;
    color: #111;
    line-height: 1.45;
    max-height: 100px;
    overflow-y: auto;
    padding: 0;
    min-height: 20px;
}
.cib-textarea::placeholder { color: #bbb; }

.cib-send-btn {
    width: 38px; height: 38px;
    background: #f40752;
    border: none; border-radius: 50%;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.15s, opacity 0.2s;
    opacity: 0.35;
    pointer-events: none;
}
.cib-send-btn.active { opacity: 1; pointer-events: auto; }
.cib-send-btn:active { transform: scale(0.88); }
.cib-send-btn svg { width: 18px; height: 18px; fill: #fff; }
.cib-send-btn.sending { opacity: 0.7; pointer-events: none; }
.cib-send-btn.sending svg { animation: spinSend 0.6s linear infinite; }
@keyframes spinSend { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
}

// ════════════════════════════════════════════════════════════════════════════
// LOAD TOP-LEVEL COMMENTS
// ════════════════════════════════════════════════════════════════════════════

async function loadComments(postId, container, offset = 0) {
    const LIMIT = 15;

    // Show skeletons on first load
    if (offset === 0) {
        container.innerHTML = '';
        for (let i = 0; i < 3; i++) container.appendChild(makeCommentSkeleton());
    }

    const { data, error } = await supabase
        .from('comments')
        .select(`
            id, content, created_at, like_count, post_id, user_id, parent_id,
            user:users ( id, username, avatar )
        `)
        .eq('post_id', postId)
        .is('parent_id', null)   // top-level only
        .order('created_at', { ascending: true })
        .range(offset, offset + LIMIT - 1);

    if (offset === 0) container.innerHTML = '';

    if (error) {
        console.error('Comments fetch error:', error);
        container.innerHTML = `<p style="text-align:center;padding:30px;color:#bbb;font-size:14px;">
            Couldn't load comments</p>`;
        return 0;
    }

    if (!data || data.length === 0) {
        if (offset === 0) {
            container.innerHTML = `
                <div class="comments-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p>No replies yet</p>
                    <span>Be the first to reply</span>
                </div>`;
        }
        return 0;
    }

    // Fetch reply counts for all top-level comments in one query
    const commentIds = data.map(c => c.id);
    const { data: replyCounts } = await supabase
        .from('comments')
        .select('parent_id')
        .in('parent_id', commentIds);

    const replyCountMap = {};
    (replyCounts || []).forEach(r => {
        replyCountMap[r.parent_id] = (replyCountMap[r.parent_id] || 0) + 1;
    });

    // Check which comments the current user liked
    let likedSet = new Set();
    if (currentUserId) {
        const { data: liked } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_id', currentUserId)
            .in('comment_id', commentIds);
        (liked || []).forEach(l => likedSet.add(l.comment_id));
    }

    container.querySelector('.load-more-comments-btn')?.remove();

    data.forEach((comment, idx) => {
        const replyCount = replyCountMap[comment.id] || 0;
        const isLiked    = likedSet.has(comment.id);
        const block = buildCommentBlock(comment, replyCount, isLiked, postId);
        block.style.animationDelay = `${idx * 35}ms`;
        container.appendChild(block);
    });

    if (data.length === LIMIT) {
        const btn = document.createElement('button');
        btn.className = 'load-more-comments-btn';
        btn.textContent = 'Load more replies';
        btn.addEventListener('click', async () => {
            btn.textContent = 'Loading…';
            btn.disabled = true;
            container.removeChild(btn);
            await loadComments(postId, container, offset + LIMIT);
        });
        container.appendChild(btn);
    }

    return data.length;
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD COMMENT BLOCK (top-level comment + collapsible replies pocket)
// ════════════════════════════════════════════════════════════════════════════

function buildCommentBlock(comment, replyCount, isLiked, postId) {
    const block = document.createElement('div');
    block.className = 'comment-block';
    block.dataset.commentId = comment.id;

    const commentEl = buildCommentItem(comment, false, isLiked, postId);
    block.appendChild(commentEl);

    // Replies pocket (hidden by default)
    const pocket = document.createElement('div');
    pocket.className = 'replies-pocket';
    block.appendChild(pocket);

    const actionsRow = commentEl.querySelector('.comment-actions-row');
    const replyBtn   = commentEl.querySelector('.comment-reply-btn');

    // Inject "View N replies" button if there are existing replies
    let viewBtn = null;
    if (replyCount > 0 && actionsRow) {
        viewBtn = document.createElement('button');
        viewBtn.className = 'comment-view-replies-btn';
        viewBtn.dataset.count = replyCount;
        viewBtn.innerHTML = `
            <span class="replies-line"></span>
            <span class="reply-count-label">${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"/>
            </svg>`;
        viewBtn.addEventListener('click', () => toggleRepliesPocket(block, pocket, comment.id, postId, viewBtn));
        actionsRow.appendChild(viewBtn);
    }

    // Reply button: sets active reply target, shows indicator, focuses input
    if (replyBtn) {
        replyBtn.addEventListener('click', () => {
            setReplyTarget(comment.id, comment.user?.username || '@unknown');
            // Also open the replies pocket so user sees context
            if (replyCount > 0 && !block.classList.contains('replies-open')) {
                toggleRepliesPocket(block, pocket, comment.id, postId, viewBtn);
            }
        });
    }

    return block;
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD SINGLE COMMENT ITEM ELEMENT
// ════════════════════════════════════════════════════════════════════════════

function buildCommentItem(comment, isReply, isLiked, postId) {
    const div = document.createElement('div');
    div.className = 'comment-item' + (isReply ? ' is-reply' : '');
    div.dataset.commentId = comment.id;

    const avatar   = comment.user?.avatar || 'pics/default-avatar.png';
    const username = comment.user?.username || '@unknown';
    const timeStr  = formatTimeSince(comment.created_at);
    const likeCount = comment.like_count || 0;

    // Colorize @mentions in text
    const coloredText = (comment.content || '').replace(
        /(@[\w.]+)/g,
        '<span class="comment-mention">$1</span>'
    );

    div.innerHTML = `
        <div class="comment-avatar-col">
            <img class="comment-avatar"
                 src="${avatar}"
                 onerror="this.src='pics/default-avatar.png'"
                 onclick="showProfile('${comment.user_id}')">
            ${!isReply ? '<div class="comment-thread-line"></div>' : ''}
        </div>
        <div class="comment-body">
            <div class="comment-header">
                <span class="comment-username" onclick="showProfile('${comment.user_id}')">${username}</span>
                <img class="comment-verif" src="pics/very.svg" alt="verified">
                <span class="comment-time">${timeStr}</span>
            </div>
            <p class="comment-text">${coloredText}</p>
            <div class="comment-actions-row">
                <button class="comment-like-btn ${isLiked ? 'liked' : ''}" data-comment-id="${comment.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path class="heart-path"
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                              fill="${isLiked ? 'rgb(244,7,82)' : 'none'}"
                              stroke="${isLiked ? 'rgb(244,7,82)' : 'currentColor'}"/>
                    </svg>
                    <span class="comment-like-count">${likeCount > 0 ? likeCount : ''}</span>
                </button>
                <button class="comment-reply-btn" data-username="${username}">Reply</button>
                ${!isReply ? '' /* view-replies btn injected below for blocks */ : ''}
            </div>
        </div>
    `;

    // Like button handler
    const likeBtn = div.querySelector('.comment-like-btn');
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCommentLike(comment.id, likeBtn);
    });

    return div;
}

// ════════════════════════════════════════════════════════════════════════════
// TOGGLE REPLIES POCKET (staircase animation)
// ════════════════════════════════════════════════════════════════════════════

async function toggleRepliesPocket(block, pocket, commentId, postId, viewBtn) {
    const isOpen = block.classList.contains('replies-open');

    if (isOpen) {
        // ── CLOSE ──────────────────────────────────────────
        pocket.style.maxHeight = pocket.scrollHeight + 'px';
        // Force reflow so transition fires
        pocket.offsetHeight; // eslint-disable-line no-unused-expressions
        requestAnimationFrame(() => {
            pocket.style.maxHeight = '0';
            pocket.style.opacity   = '0';
        });
        block.classList.remove('replies-open');
        viewBtn?.classList.remove('open');

        pocket.addEventListener('transitionend', () => {
            pocket.classList.remove('open');
        }, { once: true });

    } else {
        // ── OPEN ───────────────────────────────────────────
        block.classList.add('replies-open');
        viewBtn?.classList.add('open');
        pocket.classList.add('open');

        if (!pocket.dataset.loaded) {
            // First open: load from DB
            pocket.innerHTML = `
                <div class="replies-loading">
                    <div class="spin"></div>
                    Loading replies…
                </div>`;
            pocket.style.maxHeight = '80px';
            pocket.style.opacity   = '1';

            const count = await loadReplies(commentId, postId, pocket);
            pocket.dataset.loaded = '1';
            pocket.dataset.replyCount = count;
        }

        // Animate to full height
        pocket.style.maxHeight = pocket.scrollHeight + 'px';
        pocket.style.opacity   = '1';

        // After transition, set to 'none' so dynamic content can expand
        pocket.addEventListener('transitionend', () => {
            if (block.classList.contains('replies-open')) {
                pocket.style.maxHeight = 'none';
            }
        }, { once: true });
    }
}

// ════════════════════════════════════════════════════════════════════════════
// LOAD REPLIES FOR A COMMENT
// ════════════════════════════════════════════════════════════════════════════

async function loadReplies(commentId, postId, pocket, offset = 0) {
    const LIMIT = 10;

    const { data, error } = await supabase
        .from('comments')
        .select(`
            id, content, created_at, like_count, post_id, user_id, parent_id,
            user:users ( id, username, avatar )
        `)
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true })
        .range(offset, offset + LIMIT - 1);

    if (offset === 0) pocket.innerHTML = '';

    if (error) {
        pocket.innerHTML = `<p style="padding:12px 16px 12px 56px;font-size:12px;color:#bbb;">
            Couldn't load replies</p>`;
        return 0;
    }

    if (!data || data.length === 0) {
        if (offset === 0) {
            pocket.innerHTML = `<p style="padding:12px 16px 12px 56px;font-size:12px;color:#ccc;">
                No replies yet</p>`;
        }
        return 0;
    }

    // Check likes
    let likedSet = new Set();
    if (currentUserId) {
        const { data: liked } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_id', currentUserId)
            .in('comment_id', data.map(r => r.id));
        (liked || []).forEach(l => likedSet.add(l.comment_id));
    }

    pocket.querySelector('.load-more-replies-btn')?.remove();

    data.forEach((reply, idx) => {
        const isLiked = likedSet.has(reply.id);
        const el = buildCommentItem(reply, true, isLiked, postId);
        el.style.animationDelay = `${idx * 30}ms`;

        // Reply → reply: sets same parent comment as target so all replies nest under same parent
        const replyBtn = el.querySelector('.comment-reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                setReplyTarget(commentId, reply.user?.username || '@unknown');
            });
        }

        pocket.appendChild(el);
    });

    if (data.length === LIMIT) {
        const btn = document.createElement('button');
        btn.className = 'load-more-replies-btn';
        btn.textContent = `Load more replies`;
        btn.addEventListener('click', async () => {
            btn.remove();
            await loadReplies(commentId, postId, pocket, offset + LIMIT);
            // Re-open animation
            const parentPocket = pocket;
            parentPocket.style.maxHeight = parentPocket.scrollHeight + 'px';
        });
        pocket.appendChild(btn);
    }

    return data.length;
}

// ════════════════════════════════════════════════════════════════════════════
// TOGGLE COMMENT LIKE (persistent via RPC)
// ════════════════════════════════════════════════════════════════════════════

async function toggleCommentLike(commentId, btn) {
    if (!currentUserId) {
        alert('Please sign in to like comments');
        return;
    }

    const countEl   = btn.querySelector('.comment-like-count');
    const heartPath = btn.querySelector('.heart-path');
    const isLiked   = btn.classList.contains('liked');
    const curCount  = parseInt(countEl?.textContent || '0', 10) || 0;

    // Optimistic UI
    const newLiked = !isLiked;
    const newCount = newLiked ? curCount + 1 : Math.max(0, curCount - 1);
    btn.classList.toggle('liked', newLiked);
    if (heartPath) {
        heartPath.setAttribute('fill', newLiked ? 'rgb(244,7,82)' : 'none');
        heartPath.setAttribute('stroke', newLiked ? 'rgb(244,7,82)' : 'currentColor');
    }
    if (countEl) countEl.textContent = newCount > 0 ? newCount : '';
    btn.classList.add('pop');
    setTimeout(() => btn.classList.remove('pop'), 400);

    try {
        const { data, error } = await supabase
            .rpc('toggle_comment_like', { p_comment_id: commentId, p_user_id: currentUserId });

        if (error) throw error;

        // Sync with real server values
        if (data && data[0]) {
            const serverLiked = data[0].liked;
            const serverCount = data[0].like_count;
            btn.classList.toggle('liked', serverLiked);
            if (heartPath) {
                heartPath.setAttribute('fill', serverLiked ? 'rgb(244,7,82)' : 'none');
                heartPath.setAttribute('stroke', serverLiked ? 'rgb(244,7,82)' : 'currentColor');
            }
            if (countEl) countEl.textContent = serverCount > 0 ? serverCount : '';
        }
    } catch (err) {
        console.error('Comment like failed:', err);
        // Revert
        btn.classList.toggle('liked', isLiked);
        if (heartPath) {
            heartPath.setAttribute('fill', isLiked ? 'rgb(244,7,82)' : 'none');
            heartPath.setAttribute('stroke', isLiked ? 'rgb(244,7,82)' : 'currentColor');
        }
        if (countEl) countEl.textContent = curCount > 0 ? curCount : '';
    }
}

// ════════════════════════════════════════════════════════════════════════════
// REPLY TARGET MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

function setReplyTarget(commentId, username) {
    activeReplyTarget = { commentId, username };

    const indicator = document.querySelector('.cib-reply-indicator');
    const textarea  = document.querySelector('.cib-textarea');

    if (indicator) {
        indicator.querySelector('span').textContent = `Replying to ${username}`;
        indicator.classList.add('visible');
    }

    if (textarea) {
        // Prefill mention if not already there
        if (!textarea.value.startsWith(`@${username}`)) {
            textarea.value = `@${username} `;
        }
        textarea.focus();
        autoResizeCibTextarea(textarea);
        updateCibSendBtn(textarea);
    }
}

function clearReplyTarget() {
    activeReplyTarget = null;
    const indicator = document.querySelector('.cib-reply-indicator');
    if (indicator) indicator.classList.remove('visible');

    const textarea = document.querySelector('.cib-textarea');
    if (textarea) {
        textarea.value = '';
        autoResizeCibTextarea(textarea);
        updateCibSendBtn(textarea);
    }
}

// ════════════════════════════════════════════════════════════════════════════
// SUBMIT COMMENT OR REPLY
// ════════════════════════════════════════════════════════════════════════════

async function submitComment() {
    if (!currentUserId) { alert('Please sign in to reply'); return; }

    const textarea = document.querySelector('.cib-textarea');
    const sendBtn  = document.querySelector('.cib-send-btn');
    if (!textarea) return;

    const content = textarea.value.trim();
    if (!content) return;

    const postId = document.querySelector('#nuba [data-post-id]')?.dataset?.postId;
    if (!postId) { console.error('No postId for comment submit'); return; }

    const parentId = activeReplyTarget?.commentId || null;

    // Loading state
    sendBtn?.classList.add('sending');
    sendBtn?.classList.remove('active');
    textarea.disabled = true;

    try {
        const { data: inserted, error } = await supabase
            .from('comments')
            .insert({
                post_id:   postId,
                user_id:   currentUserId,
                parent_id: parentId,
                content:   content
            })
            .select(`
                id, content, created_at, like_count, post_id, user_id, parent_id,
                user:users ( id, username, avatar )
            `)
            .single();

        if (error) throw error;

        // Clear input
        textarea.value = '';
        textarea.style.height = 'auto';
        sendBtn?.classList.remove('sending');
        textarea.disabled = false;
        updateCibSendBtn(textarea);
        clearReplyTarget();

        if (parentId) {
            // It's a reply — append to the replies pocket
            appendReplyToBlock(parentId, inserted, postId);
        } else {
            // Top-level comment — prepend to list
            const list = document.getElementById('comments-list');
            if (list) {
                list.querySelector('.comments-empty')?.remove();
                const block = buildCommentBlock(inserted, 0, false, postId);
                block.style.animationDelay = '0ms';
                list.appendChild(block);
                // Add view-replies button (0 replies, hidden)
                block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        // Increment comment_count on the post
        supabase.rpc('increment_comment_count', { p_post_id: postId }).catch(() => {});

        // Update count display in detail stats
        const commentStatEl = document.querySelector('.detail-comment-count');
        if (commentStatEl) {
            const cur = parseInt(commentStatEl.textContent || '0', 10);
            commentStatEl.textContent = cur + 1;
        }

    } catch (err) {
        console.error('Submit comment failed:', err);
        alert("Couldn't post reply. Please try again.");
        sendBtn?.classList.remove('sending');
        sendBtn?.classList.add('active');
        textarea.disabled = false;
    }
}

// ════════════════════════════════════════════════════════════════════════════
// APPEND REPLY TO CORRECT BLOCK  (after submit)
// ════════════════════════════════════════════════════════════════════════════

function appendReplyToBlock(parentId, reply, postId) {
    const block = document.querySelector(`.comment-block[data-comment-id="${parentId}"]`);
    if (!block) return;

    let pocket = block.querySelector('.replies-pocket');
    if (!pocket) return;

    // Remove "no replies yet" placeholder
    pocket.querySelector('p')?.remove();

    // Build reply item
    const el = buildCommentItem(reply, true, false, postId);
    pocket.appendChild(el);

    // If pocket is closed, open it
    if (!block.classList.contains('replies-open')) {
        const viewBtn = block.querySelector('.comment-view-replies-btn');
        // If no viewBtn yet (0 replies before), inject one
        if (!viewBtn) {
            injectViewRepliesBtn(block, pocket, parentId, postId, 1);
        }
        toggleRepliesPocket(block, pocket, parentId, postId, block.querySelector('.comment-view-replies-btn'));
        pocket.dataset.loaded = '1';
    } else {
        // Already open — update height
        pocket.style.maxHeight = 'none';
    }

    // Update view-replies btn count
    updateViewRepliesCount(block, 1);

    // Scroll reply into view
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function injectViewRepliesBtn(block, pocket, commentId, postId, count) {
    const commentItem  = block.querySelector('.comment-item');
    if (!commentItem) return;

    const actionsRow = commentItem.querySelector('.comment-actions-row');
    if (!actionsRow || actionsRow.querySelector('.comment-view-replies-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'comment-view-replies-btn';
    btn.dataset.count = count;
    btn.innerHTML = `
        <span class="replies-line"></span>
        <span class="reply-count-label">${count} repl${count === 1 ? 'y' : 'ies'}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
        </svg>`;
    btn.addEventListener('click', () => toggleRepliesPocket(block, pocket, commentId, postId, btn));
    actionsRow.appendChild(btn);
}

function updateViewRepliesCount(block, delta) {
    const btn = block.querySelector('.comment-view-replies-btn');
    if (!btn) return;
    const cur = parseInt(btn.dataset.count || '0', 10);
    const next = Math.max(0, cur + delta);
    btn.dataset.count = next;
    const label = btn.querySelector('.reply-count-label');
    if (label) label.textContent = `${next} repl${next === 1 ? 'y' : 'ies'}`;
}

// ════════════════════════════════════════════════════════════════════════════
// REALTIME SUBSCRIPTION
// ════════════════════════════════════════════════════════════════════════════

function subscribeToComments(postId, listEl) {
    if (commentChannel) {
        supabase.removeChannel(commentChannel);
        commentChannel = null;
    }

    commentChannel = supabase
        .channel(`comments:post:${postId}`)
        .on('postgres_changes', {
            event:  'INSERT',
            schema: 'public',
            table:  'comments',
            filter: `post_id=eq.${postId}`
        }, async (payload) => {
            // Skip own inserts (already added optimistically)
            if (payload.new.user_id === currentUserId) return;

            // Fetch full comment with user
            const { data: full } = await supabase
                .from('comments')
                .select(`
                    id, content, created_at, like_count, post_id, user_id, parent_id,
                    user:users ( id, username, avatar )
                `)
                .eq('id', payload.new.id)
                .single();

            if (!full) return;

            if (full.parent_id) {
                // It's a reply — if the parent block is loaded and open, append
                appendReplyToBlock(full.parent_id, full, postId);
                // Update view-replies count even if closed
                const block = document.querySelector(`.comment-block[data-comment-id="${full.parent_id}"]`);
                if (block) updateViewRepliesCount(block, 1);
            } else {
                // Top-level — append to list
                listEl.querySelector('.comments-empty')?.remove();
                const block = buildCommentBlock(full, 0, false, postId);
                listEl.appendChild(block);

                const commentStatEl = document.querySelector('.detail-comment-count');
                if (commentStatEl) {
                    const cur = parseInt(commentStatEl.textContent || '0', 10);
                    commentStatEl.textContent = cur + 1;
                }
            }
        })
        .subscribe();
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Skeleton
// ════════════════════════════════════════════════════════════════════════════

function makeCommentSkeleton() {
    const div = document.createElement('div');
    div.className = 'comment-skeleton';
    div.innerHTML = `
        <div class="comment-skel-avatar"></div>
        <div class="comment-skel-body">
            <div class="comment-skel-line w40"></div>
            <div class="comment-skel-line w80"></div>
            <div class="comment-skel-line w65"></div>
        </div>`;
    return div;
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS: textarea resize + send button state
// ════════════════════════════════════════════════════════════════════════════

function autoResizeCibTextarea(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
}

function updateCibSendBtn(ta) {
    const btn = document.querySelector('.cib-send-btn');
    if (!btn) return;
    btn.classList.toggle('active', ta.value.trim().length > 0);
}

// ════════════════════════════════════════════════════════════════════════════
// INIT: inject styles on load
// ════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    addCommentStyles();
});

// ════════════════════════════════════════════════════════════════════════════
// PATCH showDetail() to wire up the staircase comment system
//
// After your existing showDetail() call finishes setting innerHTML on #nuba,
// it already creates  #comments-list  and  .comment-input-bar.
// This function finishes the wiring. Call it INSIDE or AFTER showDetail().
//
// HOW: At the very end of your showDetail() function, replace the line:
//   window.scrollTo(0, 0);
// with:
//   await initCommentSection(post.id);
//   window.scrollTo(0, 0);
// ════════════════════════════════════════════════════════════════════════════

async function initCommentSection(postId) {
    const list   = document.getElementById('comments-list');
    const bar    = document.querySelector('.comment-input-bar');
    const nuba   = document.getElementById('nuba');

    if (!list) {
        console.warn('initCommentSection: #comments-list not found. Make sure showDetail() renders it.');
        return;
    }

    // ── Load and render top-level comments ──
    await loadComments(postId, list);

    // ── Wire up textarea events ──
    const textarea = bar?.querySelector('.cib-textarea');
    if (textarea) {
        textarea.addEventListener('input', () => {
            autoResizeCibTextarea(textarea);
            updateCibSendBtn(textarea);
        });
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitComment();
            }
        });
    }

    // ── Wire up send button ──
    const sendBtn = bar?.querySelector('.cib-send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => submitComment());
    }

    // ── Wire up reply indicator close ──
    const replyClose = bar?.querySelector('.cib-reply-close');
    if (replyClose) {
        replyClose.addEventListener('click', () => clearReplyTarget());
    }

    // ── Start realtime subscription ──
    subscribeToComments(postId, list);
}

// ════════════════════════════════════════════════════════════════════════════
// UPDATED showDetail() BOTTOM SECTION
//
// Copy-paste this block to REPLACE the bottom of your existing showDetail()
// (from the "window.scrollTo(0, 0);" line onwards).
// It rebuilds the comment input bar and boots the staircase system.
//
// NOTE: The post detail HTML above (nuba.innerHTML = `...`) stays EXACTLY
// the same — only these two additions at the very end of showDetail() change:
//
//    1.  Replace the old:
//           <!-- Comment box -->
//           <div class="comment-container">…</div>
//        with the new comment-input-bar below (already a separate element
//        appended to #nuba, not inside the post card).
//
//    2.  Add the new comments heading + list block.
//
// Paste AFTER the last nuba.innerHTML = `...` block and BEFORE the closing
// brace of showDetail().
// ════════════════════════════════════════════════════════════════════════════

/*
    ─── ADD THIS AT THE END OF showDetail(), AFTER nuba.innerHTML = `...` ───

    // ── Fetch current user avatar for input bar ──
    let myAvatar = 'pics/default-avatar.png';
    if (currentUserId) {
        const { data: me } = await supabase
            .from('users')
            .select('avatar')
            .eq('id', currentUserId)
            .maybeSingle();
        if (me?.avatar) myAvatar = me.avatar;
    }

    // ── Inject comments heading + list ──
    const commentsSection = document.createElement('div');
    commentsSection.innerHTML = `
        <div class="comments-heading">
            Replies
            <span class="comments-heading-count">${post.commentCount > 0 ? post.commentCount : ''}</span>
        </div>
        <div id="comments-list"></div>
    `;
    nuba.appendChild(commentsSection);

    // ── Inject fixed comment input bar ──
    // Remove any old bar first
    document.querySelector('.comment-input-bar')?.remove();

    const inputBar = document.createElement('div');
    inputBar.className = 'comment-input-bar';
    inputBar.innerHTML = `
        <div class="cib-reply-indicator">
            <span>Replying to …</span>
            <button class="cib-reply-close">×</button>
        </div>
        <div class="cib-reactions">
            <div class="cib-reactions-left">
                <div class="repost-btn sted buyt" data-post-id="${post.id}" data-reposted="false">
                    <img class="feeling spoil repost-icon" src="pics/retweet.svg" alt="Repost">
                </div>
                <div class="heart-ai" data-post-id="${post.id}" data-liked="false">
                    <svg class="heart-icon heart-clickable" width="24" height="24" viewBox="0 0 24 24">
                        <path class="heart-path"
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                              fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span class="like-count heart-clickable">${post.likeCount > 0 ? post.likeCount : ''}</span>
                </div>
            </div>
        </div>
        <div class="cib-input-row">
            <img class="cib-avatar" src="${myAvatar}" onerror="this.src='pics/default-avatar.png'">
            <div class="cib-input-wrap">
                <textarea class="cib-textarea"
                    placeholder="Reply to @${post.username}…"
                    rows="1"></textarea>
            </div>
            <button class="cib-send-btn" title="Send">
                <svg viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
            </button>
        </div>
    `;
    document.body.appendChild(inputBar);

    // Re-wire detail repost + like buttons (same as before)
    const detailRepostBtn = inputBar.querySelector('.repost-btn');
    if (detailRepostBtn) {
        const targetPostId = post.id;
        getMyRepostOfPost(targetPostId).then(myRepostId => {
            if (myRepostId) {
                detailRepostBtn.setAttribute('data-reposted', 'true');
                detailRepostBtn.classList.add('reposted');
            }
        });
        detailRepostBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleRepost(targetPostId, detailRepostBtn);
        });
    }

    const detailHeart = inputBar.querySelector('.heart-ai');
    if (detailHeart) {
        const alreadyLiked = await isPostLikedByCurrentUser(post.id);
        if (alreadyLiked) {
            detailHeart.setAttribute('data-liked', 'true');
            detailHeart.querySelector('.heart-icon')?.classList.add('liked');
            detailHeart.querySelector('.like-count')?.classList.add('liked');
        }
        detailHeart.querySelectorAll('.heart-clickable').forEach(el => {
            el.addEventListener('click', async (e) => {
                e.stopPropagation();
                await toggleLike(post.id, detailHeart);
            });
        });
    }

    // ── Boot the staircase comment system ──
    await initCommentSection(post.id);
    window.scrollTo(0, 0);

    ─── END OF ADDITION ───
*/


