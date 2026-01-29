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
    avatar: "pics/mypics.jpg",  // change this path if needed
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

function createPostElement(post) {
    // We always use fallback user so every post shows
    const user = fallbackUser;

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
                    <div class="placeholder small-photo" data-large="${user.avatar}">
                        <img src="pics/tt.jpg.jpg" class="img-small">
                        <div style="padding-bottom: 100%;"></div>
                    </div>
                </div>
                <div class="pos">
                    <div>
                        <div class="link-wrapper">
                            <div class="post1">
                                <div class="jerr">
                                    <p class="jerry">${user.username}</p>
                                </div>
                                <div>
                                    <img class="verif" src="pics/very.svg">
                                </div>
                            </div>
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
            <p class="tired">${post.content || "(no text)"}</p>
        </div>

        <div class="lefto">
            <div class="reaction">
                <div class="heart-ai" data-post-id="${post.id}" data-liked="false">
                    <svg class="heart-icon heart-clickable" width="22" height="22" viewBox="0 0 24 24">
                        <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span class="like-count">${post.likeCount || ''}</span>
                </div>
            </div>
        </div>
    `;

    return posterElement;
}

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
        console.log("Trying to load posts from Supabase...");

        const { data: fetchedPosts, error } = await supabase
            .from('posts')
            .select('id, content, image, video, created_at, like_count')
            .order('created_at', { ascending: false })
            .range(loadedPostIds.size, loadedPostIds.size + postsPerLoad - 1);

        if (error) {
            console.error("Supabase error:", error);
            alert("Could not load posts: " + error.message);
            isLoading = false;
            return;
        }

        if (!fetchedPosts || fetchedPosts.length === 0) {
            console.log("No more posts found");
            isLoading = false;
            return;
        }

        console.log("Got posts:", fetchedPosts.length);

        const adaptedPosts = fetchedPosts.map(p => ({
            id: p.id,
            content: p.content || "",
            image: p.image || null,
            video: p.video || null,
            timestamp: formatTimeSince(p.created_at),
            likeCount: p.like_count || 0
        }));

        adaptedPosts.forEach(post => {
            loadedPostIds.add(post.id);
            const element = createPostElement(post);
            if (element) {
                postContainer.appendChild(element);
            }
        });

        console.log("Posts should now be visible!");

    } catch (err) {
        console.error("Unexpected problem:", err);
        alert("Something went wrong while loading posts");
    } finally {
        isLoading = false;
    }
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
