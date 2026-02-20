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
                    <div class="tir" style="margin-bottom: 10px;">
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
                                        <p class="jerry" style="font-size:15px;">${origUser.username}</p>
                                    </div>
                                    <img class="verif" src="pics/very.svg">
                                </div>
                            </a>
                            <p class="time" style="font-size:14px;">${formatTimeSince(original.created_at)}</p>
                        </div>
                    </div>

                    ${original.content ? `
                        <div style="font-size:15px; color:#374151; line-height:1.55; margin:10px 0; white-space:pre-wrap;">${original.content.length > 250 ? original.content.slice(0, 250).trimEnd() + '…' : original.content}</div>
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
                <div><p class="viewe"><span class="werey repost-count-display">${post.repostCount || 0}</span> reposts</p></div>
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
    await mountCommentSection(postId);
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

    const message = notif.type === 'repost' ? 'reposted your note' : 'loved your note';

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
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
}



// ═══════════════════════════════════════════════════════════════════
//  COMMENTS SYSTEM — Drop into view.js or load as separate script
//  Requires: supabase client, currentUserId, formatTimeSince(),
//            showProfile(), showToast() — all already in view.js
// ═══════════════════════════════════════════════════════════════════

// ─── Inject comment styles once ───────────────────────────────────
function injectCommentStyles() {
    if (document.getElementById('comment-system-styles')) return;

    const style = document.createElement('style');
    style.id = 'comment-system-styles';
    style.textContent = `
        /* ── Container ──────────────────────────────────────── */
        .comments-section {
            margin: 0;
            padding: 0 0 120px 0;
            background: #fff;
        }

        .comments-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 18px 16px 12px;
            border-bottom: 1px solid #f0f0f0;
        }

        .comments-header-title {
            font-family: Noto Sans JP, roboto;
            font-size: 15px;
            font-weight: 500;
            color: #111;
            letter-spacing: -0.2px;
        }

        .comments-count-pill {
            background: #f40752;
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            font-family: Noto Sans JP, roboto;
            padding: 2px 8px;
            border-radius: 999px;
            min-width: 20px;
            text-align: center;
            line-height: 18px;
        }

        /* ── Loading state ───────────────────────────────────── */
        .comments-loading {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 20px 16px;
        }

        .comment-skeleton-row {
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }

        .comment-skeleton-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: commentShimmer 1.4s infinite;
            flex-shrink: 0;
        }

        .comment-skeleton-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .comment-skeleton-line {
            height: 12px;
            border-radius: 6px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: commentShimmer 1.4s infinite;
        }

        .comment-skeleton-line.short { width: 55%; }
        .comment-skeleton-line.medium { width: 80%; }
        .comment-skeleton-line.long { width: 100%; }

        @keyframes commentShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        /* ── Empty state ─────────────────────────────────────── */
        .comments-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 20px;
            gap: 12px;
            color: #999;
        }

        .comments-empty-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #fef2f5;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .comments-empty p {
            font-size: 14px;
            font-family: 'IBM Plex Sans', sans-serif;
            color: #aaa;
            text-align: center;
            line-height: 1.5;
        }

        .comments-empty strong {
            display: block;
            font-size: 15px;
            font-weight: 600;
            color: #555;
            margin-bottom: 4px;
        }

        /* ── Individual comment ───────────────────────────────── */
        .comment-item {
            display: flex;
            gap: 11px;
            padding: 5px 5px;
            border-bottom: 1px solid #fafafa;
            position: relative;
            animation: commentSlideIn 0.3s cubic-bezier(0.34, 1.36, 0.64, 1) both;
        }

        @keyframes commentSlideIn {
            from {
                opacity: 0;
                transform: translateY(12px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .comment-item.comment-new {
            background: #fff8fa;
        }

        /* thread line for replies */
        .comment-item.is-reply {
            padding-left: 52px;
        }

        .comment-item.is-reply::before {
            content: '';
            position: absolute;
            left: 38px;
            top: 0;
            bottom: 0;
            width: 1.5px;
            background: linear-gradient(to bottom, #f0d0d8 0%, transparent 100%);
        }

        .comment-avatar-wrap {
            flex-shrink: 0;
            position: relative;
            cursor: pointer;
        }

        .comment-avatar {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            object-fit: cover;
            display: block;
            padding-top: 10px;
            border: 1.5px solid #f8e8ec;
            transition: transform 0.2s ease;
        }

        .comment-avatar:hover {
            transform: scale(1.06);
        }

        .comment-avatar-wrap.is-own .comment-avatar {
            border-color: #f40752;
        }

        .comment-body {
            flex: 1;
            min-width: 0;
        }

        .comment-bubble {
            background: #f8f8f8;
            border-radius: 0 14px 14px 14px;
            padding: 10px 14px;
            position: relative;
            transition: background 0.15s ease;
        }

        .comment-bubble:hover {
            background: #f4f4f4;
        }

        .comment-meta-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 5px;
        }

        .comment-username {
            font-family:  Noto Sans JP, roboto;
            font-size: 15px;
            font-weight: 500;
            color: #111;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 140px;
            transition: color 0.15s;
        }

        .comment-username:hover {
            color: #f40752;
        }

        .comment-verify {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
        }

        .comment-time {
            font-size: 14px;
            color: #bbb;
            font-family:  Noto Sans JP, roboto;
            white-space: nowrap;
        }

        .comment-text {
            font-size: 15px;
            line-height: 1.55;
            color: #222;
            font-family: Noto Sans JP, roboto;
            word-break: break-word;
            white-space: pre-wrap;
        }

        /* ── Actions row ─────────────────────────────────────── */
        .comment-actions {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-top: 7px;
            padding-left: 2px;
        }

        .comment-action-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            padding: 3px 0;
            cursor: pointer;
            font-size: 14px;
            font-family:  Noto Sans JP, roboto;
            color: #999;
            transition: color 0.2s ease;
            -webkit-tap-highlight-color: transparent;
        }

        .comment-action-btn:hover {
            color: #555;
        }

        .comment-action-btn.liked {
            color: #f40752;
        }

        .comment-action-btn svg {
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .comment-action-btn.liked svg path {
            fill: #f40752;
            stroke: #f40752;
        }

        .comment-action-btn.heart-pop svg {
            animation: commentHeartPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes commentHeartPop {
            0%   { transform: scale(1); }
            50%  { transform: scale(1.7); }
            100% { transform: scale(1); }
        }

        .comment-reply-btn {
            font-weight: 500;
        }

        .comment-delete-btn {
            margin-left: auto;
            color: #ddd;
        }

        .comment-delete-btn:hover {
            color: #f40752;
        }

        /* ── Reply composer (inline) ─────────────────────────── */
        .reply-composer {
            display: none;
            margin: 8px 0 4px;
            background: #fff;
            border-radius: 12px;
            border: 1.5px solid #f0f0f0;
            overflow: hidden;
            transition: border-color 0.2s ease;
            animation: replyFadeIn 0.2s ease both;
        }

        @keyframes replyFadeIn {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .reply-composer.open {
            display: block;
            border-color: #f40752;
        }

        .reply-composer-inner {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px 12px;
        }

        .reply-composer-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .reply-textarea {
            flex: 1;
            border: none;
            outline: none;
            resize: none;
            font-size: 13.5px;
            font-family: 'IBM Plex Sans', Roboto, sans-serif;
            color: #222;
            background: transparent;
            min-height: 36px;
            max-height: 120px;
            line-height: 1.5;
        }

        .reply-textarea::placeholder {
            color: #ccc;
        }

        .reply-composer-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 6px 12px 8px;
            gap: 8px;
            border-top: 1px solid #f5f5f5;
        }

        .reply-cancel-btn {
            background: none;
            border: none;
            font-size: 13px;
            color: #aaa;
            cursor: pointer;
            font-family: 'IBM Plex Sans', sans-serif;
            padding: 6px 10px;
            border-radius: 999px;
            transition: background 0.15s;
        }

        .reply-cancel-btn:hover {
            background: #f5f5f5;
            color: #555;
        }

        .reply-submit-btn {
            background: #f40752;
            color: #fff;
            border: none;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            font-family: 'IBM Plex Sans', sans-serif;
            padding: 6px 16px;
            cursor: pointer;
            transition: background 0.15s, transform 0.1s;
            -webkit-tap-highlight-color: transparent;
        }

        .reply-submit-btn:hover {
            background: #d4044a;
        }

        .reply-submit-btn:active {
            transform: scale(0.96);
        }

        .reply-submit-btn:disabled {
            background: #f9c0d0;
            cursor: default;
        }

        /* ── Load more replies ───────────────────────────────── */
        .load-replies-btn {
            background: none;
            border: none;
            font-size: 13px;
            color: #f40752;
            font-weight: 600;
            font-family: 'IBM Plex Sans', sans-serif;
            cursor: pointer;
            padding: 6px 0 6px 52px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: opacity 0.2s;
        }

        .load-replies-btn:hover { opacity: 0.75; }

        /* ── Load more comments ──────────────────────────────── */
        .load-more-comments-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: calc(100% - 32px);
            margin: 16px auto;
            padding: 13px;
            background: none;
            border: 1.5px solid #f0f0f0;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            color: #555;
            font-family: 'IBM Plex Sans', sans-serif;
            cursor: pointer;
            transition: border-color 0.2s, color 0.2s, background 0.2s;
        }

        .load-more-comments-btn:hover {
            border-color: #f40752;
            color: #f40752;
            background: #fff8fa;
        }

        /* ── Comment submit button in existing input bar ─────── */
        .caun.comment-submit-ready {
            filter: invert(13%) sepia(97%) saturate(5000%) hue-rotate(325deg) brightness(95%) contrast(110%);
        }

        /* ── Divider between post body and comments ──────────── */
        .comments-divider {
            width: 100%;
            height: 6px;
            background: #f5f5f5;
            margin: 0;
        }

        /* ── Own comment badge ───────────────────────────────── */
        .comment-own-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #f40752;
            flex-shrink: 0;
            display: none;
        }

        .comment-item.is-own-comment .comment-own-dot {
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
}

// ─── State ────────────────────────────────────────────────────────
const commentState = {
    postId: null,
    comments: [],       // top-level
    replies: {},        // keyed by parent comment id
    likedIds: new Set(),
    realtimeChannel: null,
    PAGE_SIZE: 15,
    offset: 0,
    hasMore: false,
    myAvatar: 'pics/default-avatar.png',
};

// ─── Fetch current user's avatar ──────────────────────────────────
async function fetchMyAvatar() {
    if (!currentUserId) return;
    const { data } = await supabase
        .from('users')
        .select('avatar')
        .eq('id', currentUserId)
        .maybeSingle();
    if (data?.avatar) commentState.myAvatar = data.avatar;
}

// ─── Main entry point — call from showDetail() after nuba renders ──
async function mountCommentSection(postId) {
    injectCommentStyles();
    await fetchMyAvatar();

    commentState.postId   = postId;
    commentState.comments = [];
    commentState.replies  = {};
    commentState.likedIds = new Set();
    commentState.offset   = 0;
    commentState.hasMore  = false;

    // Clean up previous realtime
    if (commentState.realtimeChannel) {
        supabase.removeChannel(commentState.realtimeChannel);
        commentState.realtimeChannel = null;
    }

    // Find the detail page container
    const nuba = document.getElementById('nuba');
    if (!nuba) return;

    // Remove any previous comment section
    nuba.querySelector('.comments-divider')?.remove();
    nuba.querySelector('.comments-section')?.remove();

    // Build shell
    const divider = document.createElement('div');
    divider.className = 'comments-divider';

    const section = document.createElement('div');
    section.className = 'comments-section';
    section.innerHTML = `
        <div class="comments-header">
            <span class="comments-header-title">Replies</span>
            <span class="comments-count-pill" id="comment-count-pill">…</span>
        </div>
        <div id="comments-list"></div>
    `;

    nuba.appendChild(divider);
    nuba.appendChild(section);

    // Wire up existing submit button (the .caun img in the detail page)
    wireCommentInput(postId);

    // Load
    await loadComments(postId, false);

    // Realtime
    subscribeToComments(postId);
}

// ─── Wire the existing textarea + submit button ────────────────────
function wireCommentInput(postId) {
    const nuba      = document.getElementById('nuba');
    if (!nuba) return;

    const textarea  = nuba.querySelector('.comment-textarea');
    const submitBtn = nuba.querySelector('.caun');
    if (!textarea || !submitBtn) return;

    // Auto-grow textarea
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';

        // Light visual feedback on submit button
        if (textarea.value.trim().length > 0) {
            submitBtn.classList.add('comment-submit-ready');
        } else {
            submitBtn.classList.remove('comment-submit-ready');
        }
    });

    // Submit on enter (shift+enter = newline)
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitComment(postId, null, textarea, submitBtn);
        }
    });

    // Wire submit button click
    submitBtn.onclick = null; // clear any old onclick
    submitBtn.addEventListener('click', () => {
        submitComment(postId, null, textarea, submitBtn);
    });
}

// ─── Load comments from Supabase ──────────────────────────────────
async function loadComments(postId, append = false) {
    const list = document.getElementById('comments-list');
    if (!list) return;

    if (!append) {
        list.innerHTML = `
            <div class="comments-loading">
                ${[1,2,3].map(() => `
                    <div class="comment-skeleton-row">
                        <div class="comment-skeleton-avatar"></div>
                        <div class="comment-skeleton-body">
                            <div class="comment-skeleton-line short"></div>
                            <div class="comment-skeleton-line long"></div>
                            <div class="comment-skeleton-line medium"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    const from = append ? commentState.offset : 0;
    const to   = from + commentState.PAGE_SIZE - 1;

    const { data, error } = await supabase
        .from('comments')
        .select(`
            id, content, created_at, like_count, parent_id, user_id,
            user:users ( id, username, avatar )
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Comments fetch error:', error);
        list.innerHTML = '<p style="text-align:center;padding:24px;color:#aaa;font-size:14px;">Could not load replies.</p>';
        return;
    }

    const comments = data || [];
    commentState.hasMore = comments.length === commentState.PAGE_SIZE;

    if (!append) {
        commentState.comments = comments;
        commentState.offset   = comments.length;
    } else {
        commentState.comments = [...commentState.comments, ...comments];
        commentState.offset  += comments.length;
    }

    // Check which are liked
    await refreshLikedSet(comments.map(c => c.id));

    // Render
    if (!append) {
        list.innerHTML = '';
        if (comments.length === 0) {
            list.innerHTML = `
                <div class="comments-empty">
                    <div class="comments-empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
                                  stroke="#f40752" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <p><strong>No replies yet</strong>Be the first to reply to this post</p>
                </div>
            `;
            updateCommentCount(0);
            return;
        }
    }

    comments.forEach(c => appendCommentToList(c, false));
    updateCommentCount(null); // will fetch real count

    // Load more button
    list.querySelector('.load-more-comments-btn')?.remove();
    if (commentState.hasMore) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-comments-btn';
        loadMoreBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 13l5 5 5-5M7 6l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Show more replies`;
        loadMoreBtn.onclick = () => loadComments(postId, true);
        list.appendChild(loadMoreBtn);
    }
}

// ─── Fetch which comments the current user has liked ──────────────
async function refreshLikedSet(commentIds) {
    if (!currentUserId || !commentIds.length) return;

    const { data } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', currentUserId)
        .in('comment_id', commentIds);

    (data || []).forEach(row => commentState.likedIds.add(row.comment_id));
}

// ─── Render one comment and append to list ────────────────────────
function appendCommentToList(comment, prepend = false, isNew = false) {
    const list = document.getElementById('comments-list');
    if (!list) return;

    const el = buildCommentElement(comment, null, isNew);

    const loadMoreBtn = list.querySelector('.load-more-comments-btn');
    if (prepend) {
        // Put newest at top
        const firstChild = list.firstChild;
        if (firstChild) {
            list.insertBefore(el, firstChild);
        } else {
            list.appendChild(el);
        }
    } else if (loadMoreBtn) {
        list.insertBefore(el, loadMoreBtn);
    } else {
        list.appendChild(el);
    }

    return el;
}

// ─── Build a single comment DOM element ───────────────────────────
function buildCommentElement(comment, parentId = null, isNew = false) {
    const u        = comment.user || { username: '@unknown', avatar: 'pics/default-avatar.png' };
    const isOwn    = currentUserId && comment.user_id === currentUserId;
    const liked    = commentState.likedIds.has(comment.id);
    const isReply  = !!parentId;
    const timeAgo  = formatTimeSince(comment.created_at);

    const wrap = document.createElement('div');
    wrap.className = `comment-item${isReply ? ' is-reply' : ''}${isOwn ? ' is-own-comment' : ''}${isNew ? ' comment-new' : ''}`;
    wrap.dataset.commentId = comment.id;

    wrap.innerHTML = `
        <div class="comment-avatar-wrap${isOwn ? ' is-own' : ''}">
            <img class="comment-avatar" 
                 src="${u.avatar || 'pics/default-avatar.png'}" 
                 alt="${u.username}"
                 onerror="this.src='pics/default-avatar.png'">
        </div>

        <div class="comment-body">
            <div class="comment-bubble">
                <div class="comment-meta-row">
                    <span class="comment-username">${u.username}</span>
                    <img class="comment-verify" src="pics/very.svg" alt="">
                    <span class="comment-time">· ${timeAgo}</span>
                    <span class="comment-own-dot"></span>
                </div>
                <p class="comment-text">${escapeHtml(comment.content)}</p>
            </div>

            <div class="comment-actions">
                <button class="comment-action-btn comment-like-btn${liked ? ' liked' : ''}" data-comment-id="${comment.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24">
                        <path class="heart-path" 
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                              fill="${liked ? '#f40752' : 'none'}"
                              stroke="${liked ? '#f40752' : 'currentColor'}"
                              stroke-width="2"/>
                    </svg>
                    <span class="comment-like-count">${comment.like_count > 0 ? comment.like_count : ''}</span>
                </button>

                ${!isReply ? `
                    <button class="comment-action-btn comment-reply-btn" data-comment-id="${comment.id}">
                        Reply
                    </button>
                    <button class="comment-action-btn load-replies-toggle" data-comment-id="${comment.id}" style="display:none;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <span class="replies-count-label"></span>
                    </button>
                ` : ''}

                ${isOwn ? `
                    <button class="comment-action-btn comment-delete-btn" data-comment-id="${comment.id}">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" 
                                  stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                ` : ''}
            </div>

            ${!isReply ? `
                <div class="reply-composer" data-parent-id="${comment.id}">
                    <div class="reply-composer-inner">
                        <img class="reply-composer-avatar" 
                             src="${commentState.myAvatar}" 
                             onerror="this.src='pics/default-avatar.png'"
                             alt="You">
                        <textarea class="reply-textarea" 
                                  placeholder="Reply to ${u.username}…"
                                  rows="1"></textarea>
                    </div>
                    <div class="reply-composer-footer">
                        <button class="reply-cancel-btn">Cancel</button>
                        <button class="reply-submit-btn" disabled>Reply</button>
                    </div>
                </div>
                <div class="replies-container" data-parent-id="${comment.id}"></div>
            ` : ''}
        </div>
    `;

    // ── Avatar → profile ──
    wrap.querySelector('.comment-avatar').addEventListener('click', () => {
        if (isOwn) showMyProfile();
        else showProfile(comment.user_id);
    });

    // ── Like ──
    wrap.querySelector('.comment-like-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCommentLike(comment.id, e.currentTarget);
    });

    // ── Reply button ──
    const replyBtn = wrap.querySelector('.comment-reply-btn');
    replyBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const composer = wrap.querySelector('.reply-composer');
        if (!composer) return;

        // Close any other open composers
        document.querySelectorAll('.reply-composer.open').forEach(c => {
            if (c !== composer) c.classList.remove('open');
        });

        composer.classList.toggle('open');
        if (composer.classList.contains('open')) {
            composer.querySelector('.reply-textarea')?.focus();
        }
    });

    // ── Reply composer ──
    const replyComposer = wrap.querySelector('.reply-composer');
    if (replyComposer) {
        const ta         = replyComposer.querySelector('.reply-textarea');
        const submitBtn  = replyComposer.querySelector('.reply-submit-btn');
        const cancelBtn  = replyComposer.querySelector('.reply-cancel-btn');

        ta?.addEventListener('input', () => {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
            submitBtn.disabled = ta.value.trim().length === 0;
        });

        ta?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!submitBtn.disabled) submitReply(comment.id, ta, replyComposer, wrap);
            }
        });

        submitBtn?.addEventListener('click', () => {
            submitReply(comment.id, ta, replyComposer, wrap);
        });

        cancelBtn?.addEventListener('click', () => {
            replyComposer.classList.remove('open');
            ta.value = '';
            submitBtn.disabled = true;
        });
    }

    // ── Load replies toggle ──
    const repliesToggle = wrap.querySelector('.load-replies-toggle');
    if (repliesToggle) {
        loadReplyCount(comment.id).then(count => {
            if (count > 0) {
                repliesToggle.style.display = 'flex';
                repliesToggle.querySelector('.replies-count-label').textContent = `${count} ${count === 1 ? 'reply' : 'replies'}`;
                repliesToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadAndRenderReplies(comment.id, wrap);
                    repliesToggle.style.display = 'none';
                });
            }
        });
    }

    // ── Delete ──
    wrap.querySelector('.comment-delete-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteComment(comment.id, wrap);
    });

    return wrap;
}

// ─── Toggle comment like ──────────────────────────────────────────
async function toggleCommentLike(commentId, btn) {
    if (!currentUserId) { showToast('Sign in to like'); return; }

    const isLiked = btn.classList.contains('liked');
    const countEl = btn.querySelector('.comment-like-count');
    let count = parseInt(countEl?.textContent || '0', 10);
    if (isNaN(count)) count = 0;

    // Optimistic
    const newLiked = !isLiked;
    const newCount = newLiked ? count + 1 : Math.max(0, count - 1);

    btn.classList.toggle('liked', newLiked);
    btn.classList.add('heart-pop');
    setTimeout(() => btn.classList.remove('heart-pop'), 400);

    const path = btn.querySelector('path');
    if (path) {
        path.setAttribute('fill', newLiked ? '#f40752' : 'none');
        path.setAttribute('stroke', newLiked ? '#f40752' : 'currentColor');
    }
    if (countEl) countEl.textContent = newCount > 0 ? newCount : '';

    try {
        if (newLiked) {
            commentState.likedIds.add(commentId);
            const { error } = await supabase.from('comment_likes').insert({
                comment_id: commentId,
                user_id: currentUserId
            });
            if (error && error.code !== '23505') throw error;
            await supabase.rpc('increment_comment_like', { cid: commentId, delta: 1 });
        } else {
            commentState.likedIds.delete(commentId);
            const { error } = await supabase.from('comment_likes').delete()
                .eq('comment_id', commentId)
                .eq('user_id', currentUserId);
            if (error) throw error;
            await supabase.rpc('increment_comment_like', { cid: commentId, delta: -1 });
        }
    } catch (err) {
        console.error('Comment like error:', err.message);
        // Revert
        btn.classList.toggle('liked', isLiked);
        if (path) {
            path.setAttribute('fill', isLiked ? '#f40752' : 'none');
            path.setAttribute('stroke', isLiked ? '#f40752' : 'currentColor');
        }
        if (countEl) countEl.textContent = count > 0 ? count : '';
        if (isLiked) commentState.likedIds.add(commentId);
        else commentState.likedIds.delete(commentId);
    }
}

// ─── Submit a top-level comment ───────────────────────────────────
async function submitComment(postId, parentId = null, textarea, submitBtn) {
    const content = textarea?.value?.trim();
    if (!content) return;
    if (!currentUserId) { showToast('Sign in to reply'); return; }

    const originalText = textarea.value;
    textarea.value = '';
    textarea.style.height = 'auto';
    submitBtn?.classList.remove('comment-submit-ready');

    const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            user_id: currentUserId,
            parent_id: parentId || null,
            content,
        })
        .select(`
            id, content, created_at, like_count, parent_id, user_id,
            user:users ( id, username, avatar )
        `)
        .single();

    if (error) {
        console.error('Comment insert error:', error);
        textarea.value = originalText;
        showToast('Could not post reply');
        return;
    }

    // Increment post comment_count via RPC
    supabase.rpc('increment_post_comment_count', { pid: postId, delta: 1 }).then(({ error }) => { if (error) console.error(error); });
    // Optimistically add to UI
   if (!parentId) {
    const emptyEl = document.querySelector('.comments-empty');
    if (emptyEl) {
        const list = document.getElementById('comments-list');
        if (list) list.innerHTML = '';
    }

    const commentWithUser = {
        ...newComment,
        user: {
            id: currentUserId,
            username: newComment.user?.username || '@you',
            avatar: commentState.myAvatar
        }
    };

    appendCommentToList(commentWithUser, true, true);
}

    updateCommentCountByDelta(1);

    // Remove the new-comment highlight after a moment
    setTimeout(() => {
        document.querySelector(`[data-comment-id="${newComment.id}"]`)?.classList.remove('comment-new');
    }, 2500);
}

// ─── Submit a reply ───────────────────────────────────────────────
async function submitReply(parentCommentId, textarea, composer, parentWrap) {
    const content = textarea?.value?.trim();
    if (!content || !currentUserId) return;

    const submitBtn = composer.querySelector('.reply-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '…';

    textarea.value = '';
    textarea.style.height = 'auto';
    composer.classList.remove('open');

    const { data: newReply, error } = await supabase
        .from('comments')
        .insert({
            post_id: commentState.postId,
            user_id: currentUserId,
            parent_id: parentCommentId,
            content,
        })
        .select(`
            id, content, created_at, like_count, parent_id, user_id,
            user:users ( id, username, avatar )
        `)
        .single();

    submitBtn.textContent = 'Reply';

    if (error) {
        console.error('Reply insert error:', error);
        showToast('Could not post reply');
        return;
    }

    // Increment post comment count
    supabase.rpc('increment_post_comment_count', { pid: commentState.postId, delta: 1 }).catch(console.error);

    // Render in replies container
    const repliesContainer = parentWrap.querySelector(`.replies-container[data-parent-id="${parentCommentId}"]`);
    if (repliesContainer) {
        const replyEl = buildCommentElement(newReply, parentCommentId, true);
        repliesContainer.appendChild(replyEl);

        setTimeout(() => {
            replyEl.classList.remove('comment-new');
        }, 2500);
    }

    updateCommentCountByDelta(1);

    // Hide the "X replies" toggle (already expanded)
    parentWrap.querySelector('.load-replies-toggle')?.style.setProperty('display', 'none');
}

// ─── Load reply count ─────────────────────────────────────────────
async function loadReplyCount(parentId) {
    const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', parentId);
    return count || 0;
}

// ─── Load and render replies ──────────────────────────────────────
async function loadAndRenderReplies(parentId, parentWrap) {
    const repliesContainer = parentWrap.querySelector(`.replies-container[data-parent-id="${parentId}"]`);
    if (!repliesContainer) return;

    repliesContainer.innerHTML = `
        <div class="comments-loading" style="padding:12px 0 12px 0;">
            <div class="comment-skeleton-row">
                <div class="comment-skeleton-avatar" style="width:28px;height:28px;"></div>
                <div class="comment-skeleton-body">
                    <div class="comment-skeleton-line short"></div>
                    <div class="comment-skeleton-line medium"></div>
                </div>
            </div>
        </div>
    `;

    const { data: replies, error } = await supabase
        .from('comments')
        .select(`
            id, content, created_at, like_count, parent_id, user_id,
            user:users ( id, username, avatar )
        `)
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })
        .limit(30);

    repliesContainer.innerHTML = '';

    if (error || !replies?.length) return;

    await refreshLikedSet(replies.map(r => r.id));

    replies.forEach(r => {
        const el = buildCommentElement(r, parentId, false);
        repliesContainer.appendChild(el);
    });
}

// ─── Delete a comment ─────────────────────────────────────────────
async function deleteComment(commentId, wrap) {
    if (!currentUserId) return;
    if (!confirm('Delete this reply?')) return;

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId);

    if (error) {
        console.error('Delete comment error:', error.message);
        showToast('Could not delete');
        return;
    }

    // Animate out
    wrap.style.transition = 'opacity 0.25s ease, transform 0.25s ease, max-height 0.3s ease';
    wrap.style.opacity = '0';
    wrap.style.transform = 'scale(0.97)';
    wrap.style.maxHeight = wrap.offsetHeight + 'px';
    setTimeout(() => {
        wrap.style.maxHeight = '0';
        wrap.style.padding   = '0';
        wrap.style.margin    = '0';
    }, 240);
    setTimeout(() => wrap.remove(), 500);

    supabase.rpc('increment_post_comment_count', { pid: commentState.postId, delta: -1 }).catch(console.error);
    updateCommentCountByDelta(-1);
}

// ─── Update the count pill ────────────────────────────────────────
function updateCommentCount(count) {
    const pill = document.getElementById('comment-count-pill');
    if (!pill) return;

    if (count === null) {
        // Fetch real count
        supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', commentState.postId)
            .then(({ count: c }) => {
                if (pill) pill.textContent = c || 0;
            });
    } else {
        pill.textContent = count;
    }
}

function updateCommentCountByDelta(delta) {
    const pill = document.getElementById('comment-count-pill');
    if (!pill) return;
    const current = parseInt(pill.textContent, 10) || 0;
    pill.textContent = Math.max(0, current + delta);

    // Also sync the stat row on the detail page
    const statEl = document.querySelector('#nuba .werey');
    if (statEl) {
        const reactions = parseInt(statEl.textContent, 10) || 0;
        // Don't update here — that's likes not comments
    }
    // Update comment_count shown in the .viewe display
    const commentCountDisplays = document.querySelectorAll('#nuba .viewe');
    commentCountDisplays.forEach(el => {
        if (el.textContent.includes('discuss')) {
            const span = el.querySelector('.werey');
            if (span) {
                const v = parseInt(span.textContent, 10) || 0;
                span.textContent = Math.max(0, v + delta);
            }
        }
    });
}

// ─── Realtime subscription for new comments ────────────────────────
function subscribeToComments(postId) {
    commentState.realtimeChannel = supabase
        .channel(`comments-post-${postId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`,
        }, async (payload) => {
            const c = payload.new;

            // Don't double-add our own (already added optimistically)
            if (c.user_id === currentUserId) return;
            if (c.parent_id) return; // replies handled separately

            // Fetch the user info
            const { data: user } = await supabase
                .from('users')
                .select('id, username, avatar')
                .eq('id', c.user_id)
                .maybeSingle();

            c.user = user;

            const emptyEl = document.querySelector('.comments-empty');
            if (emptyEl) document.getElementById('comments-list').innerHTML = '';

            appendCommentToList(c, true, true);
            updateCommentCountByDelta(1);

            setTimeout(() => {
                document.querySelector(`[data-comment-id="${c.id}"]`)?.classList.remove('comment-new');
            }, 2500);
        })
        .subscribe();
}

// ─── HTML escape helper ───────────────────────────────────────────
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════
//  PATCH showDetail() — call mountCommentSection() after render
//  Add this anywhere in view.js after your showDetail() definition:
// ═══════════════════════════════════════════════════════════════════

/* 
  Inside showDetail(), at the very end, BEFORE the closing brace,
  add this ONE line:

      await mountCommentSection(postId);

  That's it. The comment section will auto-mount below the detail view.
*/
