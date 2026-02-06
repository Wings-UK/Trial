// view.js - simplified version that shows posts even without matching users

// Paste this exactly as-is — add near the top, after any global variables
let currentUserId = null;

// Get logged-in user ID once when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUserId = user.id;
        console.log('Logged-in user ID:', currentUserId);
    } else {
        console.log('No user logged in');
    }
});

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
// Paste this exactly as-is — replace your current loadMorePosts function
async function loadMorePosts() {
    if (isLoading) return;
    isLoading = true;

    const postContainer = document.getElementById("flyer");
    if (!postContainer) {
        console.error("Cannot find #flyer element");
        isLoading = false;
        return;
    }

    // Show skeletons immediately
    addSkeletonStyles();
    for (let i = 0; i < postsPerLoad; i++) {
        postContainer.appendChild(createSkeletonPost());
    }

    try {
        console.log("Trying to load posts from Supabase (with user join)...");

        const { data: fetchedPosts, error } = await supabase
            .from('posts')
            .select(`
                id,
                content,
                image,
                video,
                created_at,
                like_count,
                comment_count,
                repost_count,
                views,
                user_id,
                user:users (
                    id,
                    username,
                    avatar
                )
            `)
            .order('created_at', { ascending: false })
            .range(loadedPostIds.size, loadedPostIds.size + postsPerLoad - 1);

        if (error) {
            console.error("Supabase fetch error:", error.message);
            alert("Failed to load posts: " + error.message);
            isLoading = false;
            return;
        }

        if (!fetchedPosts || fetchedPosts.length === 0) {
            console.log("No more posts to load");
            isLoading = false;
            return;
        }

        console.log(`Loaded ${fetchedPosts.length} posts from Supabase`);

        // Remove all skeletons before adding real posts
        document.querySelectorAll('.skeleton').forEach(skel => skel.remove());

        const adaptedPosts = fetchedPosts.map(p => ({
    id: p.id,
    userId: p.user_id || p.user?.id,
    // prefer username, fall back to display name if available
    username: p.user?.username || p.user?.name || '@unknown',
    avatar: p.user?.avatar || 'pics/default-avatar.png',
    content: p.content || '',
    image: p.image || null,
    video: p.video || null,
    timestamp: formatTimeSince(p.created_at),
    likeCount: p.like_count || 0,
    commentCount: p.comment_count || 0,
    repostCount: p.repost_count || 0,
    views: p.views || 0
}));

        console.log("Adapted posts:", adaptedPosts);

        adaptedPosts.forEach(post => {
            loadedPostIds.add(post.id);
            const postElement = createPostElement(post);
            if (postElement) {
                postContainer.appendChild(postElement);
            }
        });

        setTimeout(() => {
            initializeHeartReactions();
            // Add other initializations here later (lazy loading, video, etc.)
        }, 100);

    } catch (err) {
        console.error("Unexpected error while loading posts:", err);
        alert("Error loading posts. Check console.");
    } finally {
        isLoading = false;
    }
}

function createPostElement(post) {
    const user = {
        username: post.username || 'new user',
        avatar: post.avatar || 'pics/tt.jpg.jpg'
    };

    const textLimit = (post.image || post.video) ? 150 : 300;
    const hasVideo = !!post.video;
    const hasImage = !!post.image;

    // IMPORTANT: This comparison enables "my profile" vs "other profile"
    const isOwnPost = currentUserId && post.userId === currentUserId;

    const posterElement = document.createElement('div');
    posterElement.className = 'poster';
    posterElement.setAttribute('data-post-id', post.id);

    posterElement.innerHTML = `
        <div class="cust-name">
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
                                        <p class="jerry">${user.username}</p>
                                    </div>
                                    <div>
                                        <img class="verif" src="pics/very.svg">
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="comp1">
                        <div class="cll">
                            <p class="time">${post.timestamp}</p>
                            <div class="tool">
                                <p>7.23pm · Sept 23, 2024</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dots">
                <img class="dot" src="pics/dots.svg">
                <div class="tool">
                    <p>More</p>
                </div>
            </div>
        </div>

        ${hasImage ? `
        <div class="laptop1">
            <div class="placeholder placeholder1" data-large="${post.image}">
                <img src="pics/tt_2.png" class="laptop img-small placeholder1">
                <div style="padding-bottom: 100%;"></div>
            </div>
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

        <div class="lefto">
            <div class="dick">
                <div>
                    <img class="lefti" src="pics/bounce.svg">
                </div>
                <div>
                    <p class="viewe">View all ${post.commentCount || 142} discuss</p>
                </div>
            </div>
            <div class="twits">
                <div>
                    <img class="leti" src="pics/stats.svg">
                </div>
                <div>
                    <p class="viewe">${post.views || '96.8K'} views</p>
                </div>
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
                        <div class="repost-btn">
                            <img class="feeling" src="pics/retweet.svg" alt="Repost">
                            <span>${post.repostCount || 0}</span>
                        </div>
                        <div class="heart-ai" data-post-id="${post.id}" data-liked="false">
                            <svg class="heart-icon heart-clickable" width="22" height="22" viewBox="0 0 24 24">
                                <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span class="like-count heart-clickable">${post.likeCount > 0 ? post.likeCount : ''}</span>
                        </div>
                    </div>
                    <div class="mee">
                        <div class="donate-btn">
                            <img class="feeling" src="pics/bookmark.svg" alt="Donate">
                        </div>
                        <div class="donate-btn">
                            <img class="feeling" src="pics/share.svg">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

   
     // ✅ Attach click handlers via JS — UUID safe
    if (hasImage) {
        const imageDiv = posterElement.querySelector(".laptop1");
        imageDiv.addEventListener("click", () => {
  if (posterElement.dataset.blockNavigation === 'true') return;
  showDetail(post.id);
});
    }

    if (hasVideo) {
        const videoDiv = posterElement.querySelector(".video-container");
        videoDiv.addEventListener("click", () => {
  if (posterElement.dataset.blockNavigation === 'true') return;
  showDetail(post.id);
});
    }

    const textDiv = posterElement.querySelector(".tir");
    textDiv.addEventListener("click", () => {
  if (posterElement.dataset.blockNavigation === 'true') return;
  showDetail(post.id);
});
    
    enablePostLongPress(posterElement, post);
    return posterElement;
}


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
    addMasonryHeartAnimationStyles();
});

// Also call it after new posts are added (inside loadMorePosts setTimeout)

// Paste this exactly as-is — replace your current addHeartReactionStyles function
function addHeartReactionStyles() {
    if (document.getElementById('heart-reaction-styles')) return;

    const style = document.createElement('style');
    style.id = 'heart-reaction-styles';
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
        .heart-animation {
            animation: pop 0.3s ease forwards;
        }
        .unfill-animation {
            animation: shrinkFade 0.3s ease forwards;
        }
    `;
    document.head.appendChild(style);
}
// Paste this exactly as-is — replace your current initializeHeartReactions function
function initializeHeartReactions() {
    if (!document.getElementById('heart-reaction-styles')) {
        addHeartReactionStyles();
    }

    const heartContainers = document.querySelectorAll('.heart-ai:not([data-initialized])');

    heartContainers.forEach(container => {
        container.setAttribute('data-initialized', 'true');
        
        const heartIcon = container.querySelector('.heart-icon');
        const likeCount = container.querySelector('.like-count');
        
        // If either critical element is missing → skip this container silently
        if (!heartIcon || !likeCount) {
            return;
        }
        
        const clickableElements = container.querySelectorAll('.heart-clickable');
        let isLiked = container.getAttribute('data-liked') === 'true';
        
        // Read count safely
        let countText = likeCount.textContent ? likeCount.textContent.trim() : '';
        let count = countText ? parseInt(countText, 10) : 0;
        if (isNaN(count)) count = 0;
        
        // Initial state
        if (count < 1) {
            likeCount.style.display = 'none';
        } else {
            likeCount.style.display = 'inline';
        }
        
        if (isLiked) {
            heartIcon.classList.add('liked');
            likeCount.classList.add('liked');
        }
        
        clickableElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                
                isLiked = !isLiked;
                
                if (isLiked) {
                    heartIcon.classList.add('heart-animation', 'liked');
                    likeCount.classList.add('liked');
                    count++;
                    likeCount.style.display = 'inline';
                    likeCount.textContent = count;
                    setTimeout(() => heartIcon.classList.remove('heart-animation'), 400);
                } else {
                    heartIcon.classList.add('unfill-animation');
                    heartIcon.classList.remove('liked');
                    likeCount.classList.remove('liked');
                    count = Math.max(0, count - 1);
                    likeCount.textContent = count || '';
                    if (count < 1) {
                        likeCount.style.display = 'none';
                    }
                    setTimeout(() => heartIcon.classList.remove('unfill-animation'), 400);
                }
                
                container.setAttribute('data-liked', isLiked ? 'true' : 'false');
            });
        });
    });
}

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

    const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select('id, content, image, video, created_at, like_count')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12); // show first 12 posts in grid

    if (postsError) {
        console.error('User posts error:', postsError);
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
            const masonryDiv = document.createElement('div');  
            masonryDiv.className = 'masonry';  
            masonryDiv.setAttribute('data-post-id', post.id);  

            masonryDiv.innerHTML = `  
                ${post.image ? `<img src="${post.image}" loading="lazy">` : ''}  
                ${post.video ? `  
                    <div class="video-container power">  
                        <video class="video-thumbnail" preload="metadata">  
                            <source src="${post.video}" type="video/mp4">  
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
                    <p class="partner">${post.content.substring(0, 80)}${post.content.length > 80 ? '...' : ''}</p>  
                </div>  
            `;  

            // ✅ UUID-SAFE CLICK HANDLER  
            masonryDiv.addEventListener('click', () => {  
                showDetail(post.id);  
            });  

            /* ───── NEW META BAR (ONLY ADDITION) ───── */  

            const metaDiv = document.createElement('div');  
            metaDiv.className = 'masonry-meta';  

            metaDiv.innerHTML = `  
                <div class="meta-left">  
                    <img class="meta-avatar" src="${userData.avatar || 'pics/default-avatar.png'}">  
                    <span class="meta-username">${userData.username}</span>  
                </div>  
                <div class="meta-right">  
                    <svg class="meta-heart" viewBox="0 0 24 24">  
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5  
                        2 5.42 4.42 3 7.5 3  
                        c1.74 0 3.41.81 4.5 2.09  
                        C13.09 3.81 14.76 3 16.5 3  
                        19.58 3 22 5.42 22 8.5  
                        c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>  
                    </svg>  
                    <span class="meta-likes">${post.like_count || 0}</span>  
                </div>  
            `;  

            const wrapper = document.createElement('div');  
            wrapper.appendChild(masonryDiv);  
            wrapper.appendChild(metaDiv);  

            if (index % 2 === 0) {  
                leftColumn.appendChild(wrapper);  
            } else {  
                rightColumn.appendChild(wrapper);  
            }  
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

    const { data: userPosts } = await supabase
        .from('posts')
        .select('id, content, image, video, created_at, like_count')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12);

    ireti.innerHTML = `
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
        userPosts.forEach((post, index) => {
            const truncated = post.content.substring(0, 80) + (post.content.length > 80 ? '...' : '');

            const masonryDiv = document.createElement('div');
            masonryDiv.className = 'masonry';
            masonryDiv.setAttribute('data-post-id', post.id);

            masonryDiv.innerHTML = `
                ${post.image ? `<img src="${post.image}" loading="lazy">` : ''}
                ${post.video ? `
                    <div class="video-container power">
                        <video class="video-thumbnail" preload="metadata">
                            <source src="${post.video}" type="video/mp4">
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
            `;

            masonryDiv.addEventListener('click', () => {
                showDetail(post.id);
            });

            /* ───── NEW META BAR (ONLY ADDITION) ───── */

            const metaDiv = document.createElement('div');
            metaDiv.className = 'masonry-meta';

            metaDiv.innerHTML = `
                <div class="meta-left">
                    <img class="meta-avatar" src="${profile.avatar || 'pics/default-avatar.png'}">
                    <span class="meta-username">${profile.username}</span>
                </div>
                <div class="meta-right">
                    <svg class="meta-heart" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                        2 5.42 4.42 3 7.5 3
                        c1.74 0 3.41.81 4.5 2.09
                        C13.09 3.81 14.76 3 16.5 3
                        19.58 3 22 5.42 22 8.5
                        c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span class="meta-likes">${post.like_count || 0}</span>
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.appendChild(masonryDiv);
            wrapper.appendChild(metaDiv);

            if (index % 2 === 0) {
                leftColumn.appendChild(wrapper);
            } else {
                rightColumn.appendChild(wrapper);
            }
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


// Paste this exactly as-is — add at the bottom of view.js
async function showDetail(postId) {
    sessionStorage.setItem('scrollPosition_feed', window.scrollY);

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const detailPage = document.getElementById('meal');
    if (!detailPage) {
        console.error('Detail page (#meal) not found');
        return;
    }
    detailPage.classList.add('active');

    const nuba = document.getElementById('nuba');
    if (!nuba) {
        console.error('nuba container not found');
        return;
    }

    nuba.innerHTML = '<div class="skeleton" style="height:400px; margin:20px;"></div><p>Loading post...</p>';

    // Fetch the single post + author
    const { data: postData, error } = await supabase
        .from('posts')
        .select(`
            id,
            content,
            image,
            video,
            created_at,
            like_count,
            comment_count,
            repost_count,
            views,
            user_id,
            user:users (
                id,
                username,
                avatar
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
        id: postData.id,
        userId: postData.user_id,
        username: postData.user?.username || '@unknown',
        avatar: postData.user?.avatar || 'pics/default-avatar.png',
        content: postData.content || '',
        image: postData.image || null,
        video: postData.video || null,
        timestamp: formatTimeSince(postData.created_at),
        date: new Date(postData.created_at).toLocaleString(),
        likeCount: postData.like_count || 0,
        commentCount: postData.comment_count || 0,
        repostCount: postData.repost_count || 0,
        views: postData.views || 0
    };

    const isOwnPost = currentUserId && post.userId === currentUserId;

    nuba.innerHTML = `
        <div class="cust-name" data-post-id="${post.id}">
            <div class="heading">
                <div class="small-photo1">
                   <a class="lino"
   onclick="${isOwnPost ? 'showMyProfile()' : `showProfile('${post.userId}')`}">
    <img class="small-photo" src="${post.avatar}">
</a>
                </div>
                <div class="pos">
                    <div>
                        <div class="link-wrapper">
                            <a class="home-click"
   onclick="${isOwnPost ? 'showMyProfile()' : `showProfile('${post.userId}')`}">
                                <div class="post1">
                                    <div class="jerr">
                                        <p class="jerry">${post.username}</p>
                                    </div>
                                    <div>
                                        <img class="verif" src="pics/very.svg">
                                    </div>
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
                <div class="tool">
                    <p>More</p>
                </div>
            </div>
        </div>

        <div class="tir">
            <p class="tiri">${post.content}<br></p>
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

        <div class="lefto">
            <div class="dick">
                <div>
                    <p class="viewe"><span class="werey">615</span> reactions</p>
                </div>
                <div>
                    <p class="viewe"><span class="werey">9</span> echoes</p>
                </div>
            </div>
            <div class="twits">
                <div>
                    <img class="lefti" src="pics/stats.svg">
                </div>
                <div>
                    <p class="viewe">${post.views || '96.8K'} views</p>
                </div>
            </div>
        </div>

        <div class="reaction">
            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/16.jpg"></a>
                <div class="vrea">
                    <img class="luve" src="pics/lovv.png">
                </div>
            </div>
            <!-- Other reaction photos -->
        </div>
    `;

    window.scrollTo(0, 0);
}

function makePost() {
  document.getElementById('createPostModal').classList.remove('hidden');
}

function closePostModal() {
  document.getElementById('createPostModal').classList.add('hidden');
  document.getElementById('postContent').value = '';
  document.getElementById('postImage').value = '';
}

async function submitPost() {
  const content = document.getElementById('postContent').value.trim();
  const imageFile = document.getElementById('postImage').files[0];

  if (!content && !imageFile) {
    alert('Write something or add media');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('You must be logged in');
    return;
  }

  let imageUrl = null;

  // OPTIONAL IMAGE UPLOAD
  if (imageFile) {
    const fileName = `${user.id}-${Date.now()}-${imageFile.name}`;

    const { data, error } = await supabase
      .storage
      .from('post-images')
      .upload(fileName, imageFile);

    if (error) {
      alert('Image upload failed');
      return;
    }

    imageUrl = supabase
      .storage
      .from('post-images')
      .getPublicUrl(fileName).data.publicUrl;
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      image: imageUrl
    })
    .select(`
      id, content, image, created_at,
      users ( username, avatar )
    `)
    .single();

  if (error) {
  console.error('Post error:', error);
  alert(error.message);
  return;
}

  closePostModal();

  // 🔥 INSTANT UI UPDATE (homepage)
  const newPost = {
    id: post.id,
    userId: user.id,
    username: post.users.username,
    avatar: post.users.avatar,
    content: post.content,
    image: post.image,
    timestamp: 'just now',
    likeCount: 0,
    commentCount: 0,
    repostCount: 0,
    views: 0
  };

  const postElement = createPostElement(newPost);
  document.getElementById('flyer').prepend(postElement);

  initializeHeartReactions();
}

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

    bar.querySelector('.dislike')?.addEventListener('click', e => {
      e.stopPropagation();
      console.log('Disliked post', post.id);
      closeActions();
    });

    bar.querySelector('.report')?.addEventListener('click', e => {
      e.stopPropagation();
      console.log('Reported post', post.id);
      closeActions();
    });

    bar.querySelector('.delete')?.addEventListener('click', e => {
      e.stopPropagation();
      console.log('Deleted post', post.id);
      closeActions();
    });

    if (navigator.vibrate) navigator.vibrate(20);
  }

  // ─── LONG PRESS ───
  posterElement.addEventListener('touchstart', e => {
  if (e.touches.length > 1) return;

  // 🚫 If already long-pressed, ignore further long presses
  if (isActive()) return;

  pressTimer = setTimeout(showActions, 500);
});

  posterElement.addEventListener('touchmove', () => {
    clearTimeout(pressTimer);
  });

  posterElement.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  });

  // ─── TAP ON SAME POST ───
  posterElement.addEventListener('click', e => {
    if (posterElement.dataset.blockNavigation === 'true') {
      e.stopPropagation();
      e.preventDefault();
      closeActions();
    }
  });

  // ─── TAP OUTSIDE ───
  document.addEventListener('touchstart', e => {
    if (
      longPressTriggered &&
      activeLongPressPost === posterElement &&
      !posterElement.contains(e.target)
    ) {
      closeActions();
    }
  });
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
    const hearts = document.querySelectorAll('.masonry-meta .meta-heart:not([data-initialized])');

    hearts.forEach(heartSvg => {
        heartSvg.setAttribute('data-initialized', 'true');

        const likesSpan = heartSvg.nextElementSibling;
        if (!likesSpan || !likesSpan.classList.contains('meta-likes')) {
            console.warn('Could not find meta-likes span for heart');
            return;
        }

        let count = parseInt(likesSpan.textContent.trim() || '0', 10);
        if (isNaN(count)) count = 0;

        let isLiked = heartSvg.classList.contains('liked');

        // Initial visibility fix (in case server sent 0)
        likesSpan.textContent = count > 0 ? count : '';

        heartSvg.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            isLiked = !isLiked;

            if (isLiked) {
                heartSvg.classList.add('liked', 'animate-pop');
                likesSpan.classList.add('liked');
                count = count + 1;
                likesSpan.textContent = count;           // always show when >0
                setTimeout(() => {
                    heartSvg.classList.remove('animate-pop');
                }, 350);
            } else {
                heartSvg.classList.add('animate-shrink');
                heartSvg.classList.remove('liked');
                likesSpan.classList.remove('liked');
                count = Math.max(0, count - 1);
                likesSpan.textContent = count > 0 ? count : '';   // ← this is the key fix
                setTimeout(() => {
                    heartSvg.classList.remove('animate-shrink');
                }, 350);
            }
        });
    });
}
