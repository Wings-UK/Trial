// view.js - simplified version that shows posts even without matching users

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
    let interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? 'h ago' : 'h ago');
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? 'm ago' : 'm ago');
    return seconds + (seconds === 1 ? 's ago' : 's ago');
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
async function loadMorePosts() {
    if (isLoading) return;
    isLoading = true;

    const postContainer = document.getElementById("flyer");
    if (!postContainer) {
        console.error("Cannot find #flyer element");
        isLoading = false;
        return;
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

        const adaptedPosts = fetchedPosts.map(p => ({
            id: p.id,
            userId: p.user_id || p.user?.id,
            username: p.user?.username || '@unknown',
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

        // Re-init interactive parts (bring these back when you restore the functions)
        setTimeout(() => {
            // initializeHeartReactions();
            // initializeVideoPlayers();
            // initializeLazyLoadingOnLoad();
        }, 100);

    } catch (err) {
        console.error("Unexpected error while loading posts:", err);
        alert("Error loading posts. Check console.");
    } finally {
        isLoading = false;
    }
}


// ─────────────────────────────────────────────────────────────
// Updated createPostElement (now uses shortenText)
// ─────────────────────────────────────────────────────────────
function createPostElement(post) {
    const user = {
        username: post.username || '@unknown',
        avatar: post.avatar || 'pics/default-avatar.png'
    };

    const textLimit = (post.image || post.video) ? 250 : 500;
    const hasVideo = !!post.video;
    const hasImage = !!post.image;

    const posterElement = document.createElement('div');
    posterElement.className = 'poster';
    posterElement.setAttribute('data-post-id', post.id);

    posterElement.innerHTML = `
        <div class="cust-name">
            <div class="heading">
                <div class="small-photo1">
                    <a class="lino" onclick="showUserProfile('${post.userId}')">
                        <div class="placeholder small-photo" data-large="${user.avatar}">
                            <img src="pics/tt.jpg.jpg" class="img-small">
                            <div style="padding-bottom: 100%;"></div>
                        </div>
                    </a>
                </div>
                <div class="pos">
                    <div>
                        <div class="link-wrapper">
                            <a class="home-click" onclick="showUserProfile('${post.userId}')">
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
                        </div>
                    </div>
                </div>
            </div>
            <div class="dots">
                <img class="dot" src="pics/dots.svg">
            </div>
        </div>

        ${hasImage ? `
        <div class="laptop1" onclick="showDetail(${post.id})">
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

        <div class="tir" onclick="showDetail(${post.id})">
            <p class="tired">${shortenText(post.content, textLimit, true)}</p>
        </div>

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
                <div>
                    <img class="leti" src="pics/stats.svg">
                </div>
                <div>
                    <p class="viewe">${post.views || '0'} views</p>
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
                </div>
            </div>
        </div>
    `;

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
        .reaction img.feeling,
        .reaction svg.heart-icon {
            width: 22px !important;
            height: 22px !important;
            object-fit: contain;
        }

        .heart-icon {
            width: 22px;
            height: 22px;
        }

        .reaction-container .mee {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .reaction-container .mee > div {
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
        }

        .like-count,
        .reaction span {
            font-size: 13px;
            color: #555;
        }

        .heart-icon.liked .heart-path {
            fill: #f40752;
            stroke: #f40752;
        }
    `;
    document.head.appendChild(style);
}

// Call it once after the page loads
document.addEventListener('DOMContentLoaded', () => {
    addMinimalReactionStyles();
});

// Also call it after new posts are added (inside loadMorePosts setTimeout)
