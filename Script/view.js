// Disable browser's automatic scroll restoration
history.scrollRestoration = "manual";

window.addEventListener("DOMContentLoaded", function () {
    const pageId = document.querySelector(".page.active")?.id;
    if (pageId) {
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${pageId}`);
        if (savedScrollPosition) {
            // Use setTimeout to ensure DOM is fully ready
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollPosition));
            }, 0);
        }
    }
    
    // Add this block
    const activePage = document.querySelector(".page.active");
    if (activePage && activePage.id === "food") {
        loadMorePosts();  // Load Supabase posts when homepage is active
    }
});


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    let updateBanner = document.createElement('div');
                    updateBanner.innerHTML = `
                        <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                                    background: #f40752; color: white; padding: 10px 20px; border-radius: 5px;
                                    cursor: pointer; font-size: 14px;">
                            New update available! <b>Click to refresh</b>
                        </div>
                    `;
                    updateBanner.addEventListener('click', () => {
                        location.reload();
                    });
                    document.body.appendChild(updateBanner);
                }
            });
        });
    });
}

const users = [
    {
        id: 1,
        username: "@reddcinema",
        name: "Redd Cinema",
        cover: "pics/pico9.png",
        avatar: "pics/3.jpg",
        bio: "Film lover & storyteller. I just vibe on here sometimes.. I'm a girl of course.🎬✨",
        followers: 1204,
        following: 340,
        location: "Los Angeles, CA"
    },
    {
        id: 2,
        username: "@lena",
        name: "Lena Marie",
        cover: "pics/pico5.webp",
        avatar: "pics/4.jpg",
        bio: "Dancing through life 💃 | Coffee addict | We love niggas that pay for shit ☕",
        followers: 896,
        following: 512,
        location: "New York, NY"
    },
    {
        id: 3,
        username: "@nomsa",
        name: "Nomsa",
        cover: "pics/d.jpg",
        avatar: "pics/8.jpg",
        bio: "Living my best life 💃",
        followers: 63,
        following: 556,
        location: "Madras, OR"
    },
    {
        id: 4,
        username: "@jeremyx",
        name: "Jeremy X",
        cover: "pics/memo6.jpg",
        avatar: "pics/mypics.jpg",
        bio: "Just vibing out here 🎬✨",
        followers: 124,
        following: 30,
        location: "Minna, NR"
    }
];

let posts = [];

const loggedInUser = {
    id: 4,
    username: "@jeremyx",
    name: "Jeremy X",
    cover: "pics/vu.jpg",
    avatar: "pics/mypics.jpg",
    bio: "Just vibing out here 🎬✨",
    followers: 124,
    following: 30,
    location: "Minna, NR"
};
localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

let loadedPostIds = new Set();
let isLoading = false;
let postsPerLoad = 5;
let contentObserver = null;
let loadMoreObserver = null;

function createSkeletonPost(postId) {
  const skeleton = document.createElement('div');
  skeleton.className = 'poster skeleton';
  skeleton.setAttribute('data-post-id', postId);
  skeleton.setAttribute('data-skeleton', 'true');
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

function createPostElement(post) {
  const user = users.find(u => u.id === post.userId);
  if (!user) return null;

  const textLimit = (post.image || post.video) ? 250 : 500;
  const hasVideo = post.video ? true : false;
  const hasImage = post.image ? true : false;

  const posterElement = document.createElement('div');
  posterElement.className = 'poster';
  posterElement.setAttribute('data-post-id', post.id);

  posterElement.innerHTML = `
    <div class="cust-name"> 
        <div class="heading">
            <div class="small-photo1">
                <a class="lino" onclick="${user.id === loggedInUser.id ? 'showMyProfile()' : `showUserProfile(${user.id})`}">
                    <div class="placeholder small-photo" data-large="${user.avatar}">  
                      <img src="pics/tt.jpg.jpg" class="img-small">  
                      <div style="padding-bottom: 100%;"></div>  
                    </div>
                </a>
            </div>
            <div class="pos">
                <div>
                    <div class="link-wrapper">
                        <a class="home-click" onclick="${user.id === loggedInUser.id ? 'showMyProfile()' : `showUserProfile(${user.id})`}">
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
                            <p>7.23pm &#183; Sept 23, 2024 </p>
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
    <div class="laptop1" onclick="showDetail(${post.id})">
        <div class="placeholder placeholder1" data-large="${post.image}">  
          <img src="pics/tt_2.png" class="laptop img-small placeholder1">  
          <div style="padding-bottom: 100%;"></div>  
        </div>
    </div>
    ` : ''}
    
    ${hasVideo ? renderPostWithNewVideoPlayer(post, user) : ''}
    
    <div class="tir" onclick="showDetail(${post.id})">
        <p class="tired">${shortenText(post.content, textLimit, true)}</p>
    </div>
    
    <div class="lefto">
        <div class="dick">
            <div>
                <img class="lefti" src="pics/bounce.svg">
            </div>
            <div>
                <p class="viewe">View all ${post.diveCount || 142} discuss</p>
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
  
  return posterElement;
}

function addSkeletonStyles() {
  if (document.getElementById('skeleton-styles')) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'skeleton-styles';
  styleElement.textContent = `
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
  document.head.appendChild(styleElement);
}

function initializeLazyLoading(element) {
  const placeholders = element.querySelectorAll('.placeholder');
  
  placeholders.forEach(placeholder => {
    const small = placeholder.querySelector('.img-small');
    if (!small) return;
    
    const img = new Image();
    img.src = small.src;
    img.onload = function () {
      small.classList.add('loaded');
    };
    
    const imgLarge = new Image();
    imgLarge.src = placeholder.dataset.large;
    imgLarge.classList.add('loaded');
    imgLarge.onload = function () {
      placeholder.appendChild(imgLarge);
    };
  });
}

async function loadMorePosts() {
    if (isLoading) return;
    isLoading = true;

    const postContainer = document.getElementById("flyer");
    if (!postContainer) {
        console.error("Post container (#flyer) not found");
        isLoading = false;
        return;
    }

    try {
        console.log("Fetching posts from Supabase using column 'user.id'...");

        const { data: fetchedPosts, error } = await supabase
            .from('posts')
            .select('id, "user.id", content, image, video, created_at, like_count, comment_count, repost_count, views')
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
            window.removeEventListener("scroll", scrollHandler);
            isLoading = false;
            return;
        }

        console.log(`Loaded ${fetchedPosts.length} posts from Supabase`);

        const fallbackUser = {
            username: '@unknown',
            avatar: 'pics/default-avatar.png',
            name: 'Unknown User'
        };

        const adaptedPosts = fetchedPosts.map(p => ({
            id: p.id,
            userId: p["user.id"],              // ← bracket notation for column with dot
            username: fallbackUser.username,
            name: fallbackUser.name,
            avatar: fallbackUser.avatar,
            content: p.content || '',
            image: p.image || null,
            video: p.video || null,
            timestamp: formatTimeSince(p.created_at),
            date: new Date(p.created_at).toLocaleString(),
            likeCount: p.like_count || 0,
            commentCount: p.comment_count || 0,
            repostCount: p.repost_count || 0,
            views: p.views || 0
        }));

        adaptedPosts.forEach(post => {
            loadedPostIds.add(post.id);
        });

        adaptedPosts.forEach(post => {
            const postElement = createPostElement(post);
            if (postElement) {
                postContainer.appendChild(postElement);
            }
        });

        setTimeout(() => {
            initializeVideoPlayers();
            initializeHeartReactions();
            initializeLazyLoadingOnLoad();
        }, 100);

    } catch (err) {
        console.error("Unexpected error:", err);
        alert("Error loading posts. Check console.");
    } finally {
        isLoading = false;
    }
}

function initializeLazyLoadingOnLoad() {
  document.querySelectorAll('.poster').forEach(poster => {
    initializeLazyLoading(poster);
  });
}

window.addEventListener('load', initializeLazyLoadingOnLoad);

function cleanupVirtualization() {
    if (contentObserver) {
        contentObserver.disconnect();
        contentObserver = null;
    }
    if (loadMoreObserver) {
        loadMoreObserver.disconnect();
        loadMoreObserver = null;
    }
    
    // Remove scroll handler to prevent memory leaks
    window.removeEventListener('scroll', handleVirtualizedScroll);
    window.removeEventListener('scroll', scrollHandler);
}

function initializeHomepage() {
    const postContainer = document.getElementById("flyer");
    if (!postContainer) return;

    // Clear any existing observers
    cleanupVirtualization();
    
    // If posts are already rendered, reuse them and adjust scroll
    if (postContainer.children.length > 0 && loadedPostIds.size > 0) {
        setupVirtualizedScrolling(); // Reattach observers
        window.addEventListener('scroll', handleVirtualizedScroll, { passive: true });
        initializeHeartReactions();
        initializeVideoPlayers();
        return;
    }

    // Reset state variables only if starting fresh
    loadedPostIds.clear();
    isLoading = false;
    
    // Add skeleton styles
    addSkeletonStyles();

    // Create and add initial skeleton posts
    postContainer.innerHTML = ''; // Ensure container is empty only if needed
    const initialCount = Math.min(postsPerLoad, posts.length);
    for (let i = 0; i < initialCount; i++) {
        const skeleton = createSkeletonPost(posts[i].id);
        postContainer.appendChild(skeleton);
    }

    // Set up virtualization
    setupVirtualizedScrolling();
    
    // Add scroll listener with passive flag for performance
    window.addEventListener('scroll', handleVirtualizedScroll, { passive: true });
    
    // Initialize other components
    initializeHeartReactions();
    initializeVideoPlayers();
}

function setupVirtualizedScrolling() {
    // Create a fresh set of observers
    contentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            const element = entry.target;
            if (element.getAttribute('data-skeleton') !== 'true') {
                contentObserver.unobserve(element);
                return;
            }
            
            const postId = parseInt(element.getAttribute('data-post-id'));
            if (isNaN(postId) || loadedPostIds.has(postId)) {
                contentObserver.unobserve(element);
                return;
            }
            
            const post = posts.find(p => p.id === postId);
            if (!post) {
                contentObserver.unobserve(element);
                return;
            }
            
            // Create real post element
            const realPostElement = createPostElement(post);
            if (!realPostElement) {
                contentObserver.unobserve(element);
                return;
            }
            
            // Track that we've processed this skeleton
            contentObserver.unobserve(element);
            loadedPostIds.add(postId);
            
            // Replace skeleton with real content
            if (element.parentNode) {
                element.parentNode.replaceChild(realPostElement, element);
                
                // Initialize content for the new element
                initializeLazyLoading(realPostElement);
                if (post.video) {
                    setTimeout(() => initializeVideoPlayers(), 10);
                }
                
                // Initialize heart reactions with slight delay
                setTimeout(() => initializeHeartReactions(), 10);
            }
        });
    }, {
        root: null,
        rootMargin: '200px 0px',
        threshold: 0.1
    });
    
    loadMoreObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadMoreVirtualPosts();
            }
        });
    }, {
        root: null,
        rootMargin: '300px 0px',
        threshold: 0.1
    });
    
    // Observe all skeletons
    document.querySelectorAll('.poster.skeleton').forEach(skeleton => {
        contentObserver.observe(skeleton);
    });
    
    // Observe last element for loading more
    const lastElement = document.querySelector('.poster:last-child');
    if (lastElement) {
        loadMoreObserver.observe(lastElement);
    }
}


function handleVirtualizedScroll() {
  if (isLoading) return;
  
  const scrollPosition = window.scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  if (scrollPosition >= documentHeight - 400) {
    loadMoreVirtualPosts();
  }
}

function loadMoreVirtualPosts() {
  const postContainer = document.getElementById("flyer");
  if (!postContainer || isLoading || loadedPostIds.size >= posts.length) return;
  
  isLoading = true;
  
  const nextPostsToLoad = [];
  let loaded = 0;
  
  for (const post of posts) {
    if (!loadedPostIds.has(post.id) && !document.querySelector(`.poster[data-post-id="${post.id}"]`)) {
      nextPostsToLoad.push(post);
      loaded++;
      if (loaded >= postsPerLoad) break;
    }
  }
  
  if (nextPostsToLoad.length === 0) {
    isLoading = false;
    return;
  }
  
  const newSkeletons = [];
  nextPostsToLoad.forEach(post => {
    const skeleton = createSkeletonPost(post.id);
    postContainer.appendChild(skeleton);
    newSkeletons.push(skeleton);
  });
  
  newSkeletons.forEach(skeleton => {
    contentObserver.observe(skeleton);
  });
  
  if (newSkeletons.length > 0) {
    loadMoreObserver.observe(newSkeletons[newSkeletons.length - 1]);
  }
  
  isLoading = false;
}

function scrollHandler() {
  if (isLoading) return;
  
  const scrollPosition = window.innerHeight + window.scrollY;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollPosition >= documentHeight - 250) {
    loadMorePosts();
  }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the active page
    const activePage = document.querySelector(".page.active");
    if (activePage) {
        const pageId = activePage.id;
        history.replaceState({ page: pageId }, "", `#${pageId}`);
        
        if (pageId === "food") {
            initializeHomepage();
        }
    }
    
    // Initialize UI components
    initializeAccountIcon();
    
    // Add global event listeners
    window.addEventListener('pagehide', function() {
        // Save all scroll positions before page is unloaded
        document.querySelectorAll('.page').forEach(page => {
            if (page.classList.contains('active')) {
                sessionStorage.setItem(`scrollPosition_${page.id}`, window.scrollY);
            }
        });
    });
});


const heartStyle = `
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

function addHeartStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = heartStyle;
  document.head.appendChild(styleElement);
}

function initializeHeartReactions() {
  if (!document.getElementById('heart-styles')) {
    addHeartStyles();
  }
  
  const heartContainers = document.querySelectorAll('.heart-ai:not([data-initialized])');
  
  heartContainers.forEach(container => {
    container.setAttribute('data-initialized', 'true');
    
    const heartIcon = container.querySelector('.heart-icon');
    const likeCount = container.querySelector('.like-count');
    const clickableElements = container.querySelectorAll('.heart-clickable');
    const postId = parseInt(container.getAttribute('data-post-id'));
    let isLiked = container.getAttribute('data-liked') === 'true';
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    let count = parseInt(post.likeCount) || 0;
    
    if (count < 1) {
      likeCount.style.display = 'none';
    } else {
      likeCount.style.display = 'inline';
      likeCount.textContent = count;
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
          setTimeout(() => {
            heartIcon.classList.remove('heart-animation');
          }, 400);
        } else {
          heartIcon.classList.add('unfill-animation');
          heartIcon.classList.remove('liked');
          likeCount.classList.remove('liked');
          count = Math.max(0, count - 1);
          if (count < 1) {
            likeCount.style.display = 'none';
          } else {
            likeCount.style.display = 'inline';
            likeCount.textContent = count;
          }
          setTimeout(() => {
            heartIcon.classList.remove('unfill-animation');
          }, 400);
        }
        
        container.setAttribute('data-liked', isLiked.toString());
        if (post) {
          post.likeCount = count;
        }
      });
    });
  });
}

function initializeVideoPlayers() {
  const videoContainers = document.querySelectorAll('.video-container:not([data-initialized])');
  
  videoContainers.forEach(container => {
    container.setAttribute('data-initialized', 'true');
    
    const thumbnailVideo = container.querySelector('.video-thumbnail');
    const durationBadge = container.querySelector('.duration-badge');
    
    if (!thumbnailVideo) return;
    
    if (durationBadge && thumbnailVideo.readyState >= 1) {
      const duration = formatTime(thumbnailVideo.duration);
      durationBadge.textContent = duration;
    } else if (durationBadge) {
      thumbnailVideo.addEventListener('loadedmetadata', () => {
        const duration = formatTime(thumbnailVideo.duration);
        durationBadge.textContent = duration;
      });
    }
    
    // Remove existing listeners to prevent duplicates
    container.removeEventListener('click', handleVideoClick);
    container.addEventListener('click', handleVideoClick);
    
    function handleVideoClick(e) {
      e.stopPropagation();
      
      const postElement = container.closest('.poster') || container.closest('.swet');
      if (!postElement) return;
      
      const postId = parseInt(container.getAttribute('data-post-id') || postElement.parentElement.getAttribute('data-post-id'));
      if (isNaN(postId)) return;
      
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      ensureVideoModalExists();
      openVideoModal(post);
    }
  });
}

function ensureVideoModalExists() {
  if (!document.querySelector('.video-modal')) {
    const videoModal = document.createElement('div');
    videoModal.className = 'video-modal';
    videoModal.innerHTML = `
      <div class="modal-header">
        <div class="back-button">
          <img src="pics/backa.png" alt="Back">
        </div>
        <div class="modal-user-info">
          <div class="user-avatar">
            <img src="" alt="">
          </div>
          <div class="user-details">
            <div class="username">
              <span></span>
              <img class="verify-badge" src="pics/verifi1.png">
            </div>
            <div class="timestamp"></div>
          </div>
        </div>
        <div class="detail-follow">Follow</div>
      </div>
      
      <div class="video-player-container">
        <video class="fullscreen-player">
          <source src="" type="video/mp4">
        </video>
        
        <div class="video-controls">
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-filled"></div>
              <div class="progress-handle"></div>
            </div>
            <div class="time-display">0:00 / 0:00</div>
          </div>
          
          <div class="control-buttons">
            <div class="play-pause-btn">
              <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" fill="white"/>
              </svg>
              <svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" style="display: none;">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="white"/>
              </svg>
            </div>
            <div class="volume-control">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-content">
        <p class="modal-post-text"></p>
      </div>
      
      <div class="modal-actions">
        <div class="action-buttons">
          <div class="action-button">
            <img src="pics/lovv.png" alt="Like">
            <span>0</span>
          </div>
          <div class="action-button">
            <img src="pics/chat.png" alt="Comment">
            <span>0</span>
          </div>
          <div class="action-button">
            <img src="pics/repost.png" alt="Repost">
            <span>0</span>
          </div>
          <div class="action-button">
            <img src="pics/naira.png" alt="Donate">
            <span>0</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(videoModal);
    
    const backButton = videoModal.querySelector('.back-button');
    backButton.addEventListener('click', closeVideoModal);
  }
}

function openVideoModal(post) {
    ensureVideoModalExists();

    const modal = document.querySelector('.video-modal');
    const videoPlayer = modal.querySelector('.fullscreen-player');
    const user = users.find(u => u.id === post.userId);
    
    if (!user) return;
    
    const videoSource = videoPlayer.querySelector('source');
    videoSource.src = post.video;
    videoPlayer.load();
    
    modal.querySelector('.user-avatar img').src = user.avatar;
    modal.querySelector('.username span').textContent = user.username;
    modal.querySelector('.timestamp').textContent = post.timestamp || post.date || '';
    modal.querySelector('.modal-post-text').textContent = post.content || '';
    
    modal.querySelector('.action-button:nth-child(1) span').textContent = post.likeCount || 0;
    modal.querySelector('.action-button:nth-child(2) span').textContent = post.commentCount || 0;
    modal.querySelector('.action-button:nth-child(3) span').textContent = post.repostCount || 0;
    modal.querySelector('.action-button:nth-child(4) span').textContent = post.diveCount || 0;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setupVideoControls(videoPlayer);
    
    videoPlayer.addEventListener('loadedmetadata', () => {
        adjustVideoPlayer(videoPlayer);
    });
    
    const currentPage = document.querySelector('.page.active')?.id || "food";
    sessionStorage.setItem("scrollPosition", window.scrollY);
    history.pushState({ 
        modalOpen: true, 
        fromPage: currentPage,
        postId: currentPage === "meal" ? post.id : null,
        timestamp: Date.now()
    }, '', '#video-modal');
    
    videoPlayer.play().catch(error => {
        console.log('Auto-play prevented:', error);
        const playOverlay = document.createElement('div');
        playOverlay.className = 'play-overlay';
        playOverlay.innerHTML = `<svg width="48" height="48" viewBox="0 0 48 48"><path d="M34 24L18 34V14L34 24Z" fill="white"/></svg>`;
        modal.querySelector('.video-player-container').appendChild(playOverlay);
        
        playOverlay.addEventListener('click', () => {
            videoPlayer.play();
            playOverlay.remove();
        });
    });
}

function closeVideoModal() {
    const modal = document.querySelector('.video-modal');
    const videoPlayer = modal.querySelector('.fullscreen-player');
    
    videoPlayer.pause();
    
    const savedScrollPosition = sessionStorage.getItem("scrollPosition");
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    const currentState = history.state || {};
    const fromPage = currentState.fromPage || "food";
    const postId = currentState.postId || null;

    // Restore scroll position immediately
    window.scrollTo(0, savedScrollPosition ? parseInt(savedScrollPosition) : 0);

    // Update history state without forcing a page switch
    if (fromPage === "meal" && postId) {
        history.replaceState({
            page: "meal",
            postId: postId,
            fromPage: currentState.fromPage,
            timestamp: Date.now()
        }, "", `#meal/${postId}`);
        
        // Reinitialize post detail elements
        setTimeout(() => {
            initializeVideoPlayers();
            initializeHeartReactions();
        }, 20);
    } else {
        // For homepage or other pages, switch back
        switchPage(fromPage);
        history.replaceState({
            page: fromPage,
            timestamp: Date.now()
        }, "", `#${fromPage}`);
    }
}

function setupVideoControls(videoPlayer) {
  const modal = videoPlayer.closest('.video-modal');
  const progressBar = modal.querySelector('.progress-bar');
  const progressFilled = modal.querySelector('.progress-filled');
  const timeDisplay = modal.querySelector('.time-display');
  const playPauseBtn = modal.querySelector('.play-pause-btn');
  const playIcon = playPauseBtn.querySelector('.play-icon');
  const pauseIcon = playPauseBtn.querySelector('.pause-icon');
  
  videoPlayer.addEventListener('timeupdate', () => {
    if (videoPlayer.duration) {
      const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
      progressFilled.style.width = `${percent}%`;
      timeDisplay.textContent = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
    }
  });
  
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percent = offsetX / progressBar.offsetWidth;
    videoPlayer.currentTime = percent * videoPlayer.duration;
  });
  
  // Replace play/pause button to avoid duplicate listeners
  const newPlayPauseBtn = playPauseBtn.cloneNode(true);
  playPauseBtn.parentNode.replaceChild(newPlayPauseBtn, playPauseBtn);
  
  const newPlayIcon = newPlayPauseBtn.querySelector('.play-icon');
  const newPauseIcon = newPlayPauseBtn.querySelector('.pause-icon');
  
  newPlayPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleVideoPlayback();
  });
  
  videoPlayer.addEventListener('play', updatePlayPauseIcon);
  videoPlayer.addEventListener('pause', updatePlayPauseIcon);
  
  function updatePlayPauseIcon() {
    if (videoPlayer.paused) {
      newPlayIcon.style.display = 'block';
      newPauseIcon.style.display = 'none';
    } else {
      newPlayIcon.style.display = 'none';
      newPauseIcon.style.display = 'block';
    }
  }
  
  function toggleVideoPlayback() {
    if (videoPlayer.paused) {
      videoPlayer.play().then(() => {
        updatePlayPauseIcon();
      }).catch(error => {
        console.error('Error attempting to play video:', error);
      });
    } else {
      videoPlayer.pause();
      updatePlayPauseIcon();
    }
  }
  
  // Removed: videoPlayer.addEventListener('click', (e) => { toggleVideoPlayback(); });
  
  function showControls() {
    clearTimeout(controlsTimeout);
    modal.querySelector('.video-controls').style.opacity = '1';
    controlsTimeout = setTimeout(() => {
      if (!videoPlayer.paused) {
        modal.querySelector('.video-controls').style.opacity = '0';
      }
    }, 3000);
  }
  
  let controlsTimeout;
  videoPlayer.addEventListener('mousemove', showControls);
  modal.querySelector('.video-controls').addEventListener('mousemove', showControls);
  showControls();
  
  videoPlayer.addEventListener('ended', () => {
    updatePlayPauseIcon();
    modal.querySelector('.video-controls').style.opacity = '1';
  });
}

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

document.addEventListener('DOMContentLoaded', function() {
  initializeHomepage();
  setTimeout(() => {
    initializeHeartReactions();
    initializeVideoPlayers();
  }, 100);
});

function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function renderPostWithNewVideoPlayer(post, user) {
  let videoHTML = '';
  
  if (post.video) {
    videoHTML = `
      <div class="video-container laptop1" data-post-id="${post.id}">
        <video class="video-thumbnail" preload="metadata" poster="${post.videoPoster || ''}">
          <source src="${post.video}" type="video/mp4">
        </video>
        <div class="video-overlay">
          <div class="play-button">
           <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" fill="rgba(244, 7, 82, 0.5)" stroke="white" stroke-width="3"/>
              <path d="M34 24L18 34V14L34 24Z" fill="white"/>
          </svg>
          </div>
          <div class="duration-badge">0:00</div>
        </div>
      </div>
    `;
  }
  
  return videoHTML;
}



document.addEventListener('DOMContentLoaded', function() {
  ensureVideoModalExists();
  initializeHomepage();
  setTimeout(() => {
    initializeHeartReactions();
    initializeVideoPlayers();
  }, 100);
});

function adjustVideoPlayer(videoElement) {
  const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
  const container = videoElement.closest('.video-player-container');
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  videoElement.style.width = '';
  videoElement.style.height = '';
  videoElement.style.top = '';
  videoElement.style.left = '';
  videoElement.style.transform = '';
  
  if (videoAspect < 1) {
    const availableHeight = containerHeight - 57;
    videoElement.style.height = availableHeight + 'px';
    videoElement.style.width = '100%';
    videoElement.style.top = '57px';
    
    const newWidth = availableHeight * videoAspect;
    if (newWidth < containerWidth) {
      videoElement.style.left = '50%';
      videoElement.style.transform = 'translateX(-50%)';
    }
  } else {
    const newHeight = containerWidth / videoAspect;
    if (newHeight <= containerHeight) {
      videoElement.style.width = '100%';
      videoElement.style.height = 'auto';
      videoElement.style.top = '40%';
      videoElement.style.transform = 'translateY(-50%)';
    } else {
      videoElement.style.height = '100%';
      videoElement.style.width = 'auto';
      videoElement.style.left = '50%'; 
      videoElement.style.transform = 'translateX(-50%)';
    }
  }
}

function renderUserProfile(user) {
    const profileIreti = document.getElementById("ireti");
    if (!profileIreti) return;
    
    // Your existing profile HTML
    // ...
    profileIreti.innerHTML = `
    <img class="frin" src="${user.cover}">
    <div>
      <img class="kor" src="${user.avatar}">
    </div>
    <div class="klr">
      <div class="drun">
        <div>
          <p class="spe">${user.username}</p>
        </div>
        <div>
          <img class="verify" src="pics/very.svg">
        </div>
      </div>
      <div class="druu">
        <div>
          <p class="rkl">${user.location}</p>
        </div>
        
      </div>
      <div class="nin">
        <p class="rkl"><span class="bld">${user.following}</span>following &#183; <span class="bld">${user.followers}</span>followers</p>
      </div>
      <div class="cha">
        <p>${user.bio}</p>
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
      <div class="yeb">
        <img class="dee" src="pics/apps.svg">
      </div>
      <div class="yeb">
        <a href="Retail-Desktop-MyAccount-Storefront.html">
          <img class="dee" src="pics/newspaper.svg">
        </a>
      </div>
      <div class="yeb">
        <img class="dee" src="pics/store.svg">
      </div>
    </div>
    <div class="mansonro">
      <div class="masonri">
        <div class="column left-column"></div>
        <div class="column right-column"></div>
      </div>
    </div>
  `;
    
    const wingDiv = document.querySelector(".wing");
    if (wingDiv) {
        wingDiv.style.display = "none";
    }
}

function showUserProfile(userId) {
    // Save current position before showing profile
    sessionStorage.setItem("scrollPosition", window.scrollY);
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Update state before DOM changes
    switchPage("profile");
    history.replaceState({ 
        page: "profile", 
        userId: userId,
        profileTab: "posts",
        timestamp: Date.now()
    }, "", `#profile/${userId}`);
    
    // Update profile content with delay
    setTimeout(() => {
        updateHeaderHTML(userId);
        renderUserProfile(user);
        renderUserPosts(userId);
    }, 30);
}

function renderUserPosts(userId) {
  const userPosts = posts.filter(post => post.userId === userId);
  const leftColumn = document.querySelector(".left-column");
  const rightColumn = document.querySelector(".right-column");
  
  if (!leftColumn || !rightColumn) return;
  if (userPosts.length === 0) {
    leftColumn.innerHTML = '<div class="empty-posts-message"><p>No posts yet</p></div>';
    return;
  }

  leftColumn.innerHTML = '';
  rightColumn.innerHTML = '';

  userPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  userPosts.forEach((post, index) => {
    const user = users.find(u => u.id === post.userId);
    if (!user) return;
    
    const textLimit = post.video ? 80 : (post.image ? 40 : 200);
    const postHTML = `
      <div class="masonry" onclick="showDetail(${post.id})">
        ${post.image ? `
          <img src="${post.image}">
        ` : ''}
        ${post.video ? `
          <div class="video-container power" data-post-id="${post.id}">
            <video class="video-thumbnail" preload="metadata" poster="${post.videoPoster || ''}">
              <source src="${post.video}" type="video/mp4">
            </video>
            <div class="video-overlay power">
              <div class="play-button power">
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" fill="rgba(244, 7, 82, 0.5)" stroke="white" stroke-width="3"/>
                  <path d="M34 24L18 34V14L34 24Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>
        ` : ''}
        <div class="contentma">
          <p class="partner">${shortenText(post.content, textLimit, false)}</p>
          <div class="bioi">
            <div class="fred">
              <img class="brekca" src="${user.avatar}">
              <p class="goo">${user.username}</p>
            </div>
            <div class="fred">
             <svg class="heart-icon heart-clickable" width="17" height="17" viewBox="0 0 24 24">
                    <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
              <p class="goo">${post.likeCount || '0'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    if (index % 2 === 0) {
      leftColumn.innerHTML += postHTML;
    } else {
      rightColumn.innerHTML += postHTML;
    }
  });
  
  // Initialize video players for any videos in the masonry layout
  setTimeout(() => {
    initializeVideoPlayers();
  }, 100);
}


function showDetail(postId) {
  sessionStorage.setItem("scrollPosition", window.scrollY);
  
  const postDetail = document.getElementById("meal");
  const postContent = document.getElementById("nuba");
  
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  
  const user = users.find(u => u.id === post.userId);
  if (!user) return;
  
  const commentTextarea = document.querySelector('.comment-textarea');
  if (commentTextarea) {
    commentTextarea.placeholder = `Reply to ${user.username}...`;
  }
  
  const hasVideo = post.video ? true : false;
  const hasImage = post.image ? true : false;
  
  ensureVideoModalExists();
  
  postContent.innerHTML = `
        <div class="cust-name" data-post-id="${post.id}"> 
            <div class="heading">
                <div class="small-photo1">
                    <a class="lino" onclick="${user.id === loggedInUser.id ? 'showMyProfile()' : `showUserProfile(${user.id})`}">
                        <img class="small-photo" src="${user.avatar}">
                    </a>
                </div>
                <div class="pos">
                    <div>
                        <div class="link-wrapper">
                            <a class="home-click" onclick="${user.id === loggedInUser.id ? 'showMyProfile()' : `showUserProfile(${user.id})`}">
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
                    foniElem.classList.add('follow')
                  } else {
                    foniElem.innerHTML = 'Follow';
                    foniElem.classList.remove('follow')
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
        ${hasImage ? `
        <div class="swet">
            <div class="laptop1">
                <img class="lapto" src="${post.image}">
            </div>
        </div>
        ` : ''}
        ${hasVideo ? `
        <div class="swet">
            ${renderPostWithNewVideoPlayer(post, user)}
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
                    <p class="viewe">96.8K views</p>
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
  
  switchPage("meal");
  history.replaceState({
    page: "meal",
    postId: postId,
    fromPage: "food",
    timestamp: Date.now()
  }, "", `#meal/${postId}`);
  
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    initializeVideoPlayers();
    updateDetailForPost(user);
    setupDetailScrollListener();
    window.scrollTo(0, 0);
  });
}

function goBack() {
    const fromPage = history.state && history.state.fromPage ? history.state.fromPage : "food";
    switchPage(fromPage);
    
    setTimeout(() => {
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${fromPage}`);
        window.scrollTo(0, savedScrollPosition ? parseInt(savedScrollPosition) : 0);
    }, 20);
    
    // Update history state to reflect the new page
    history.replaceState({ page: fromPage, timestamp: Date.now() }, '', `#${fromPage}`);
}

function switchPage(pageId) {
    const currentPage = document.querySelector(".page.active");
    
    if (currentPage) {
        const currentScrollPosition = window.scrollY;
        sessionStorage.setItem(`scrollPosition_${currentPage.id}`, currentScrollPosition);
        if (currentPage.id === "food") {
            cleanupVirtualization();
        }
    }

    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.remove("active"));

    const newPage = document.getElementById(pageId);
    newPage.classList.add("active");

    if (!history.state || history.state.page !== pageId) {
        history.pushState({ 
            page: pageId, 
            fromPage: currentPage ? currentPage.id : "initial",
            timestamp: Date.now()
        }, "", `#${pageId}`);
    }

    if (pageId === "food") {
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${pageId}`);
        window.scrollTo(0, savedScrollPosition ? parseInt(savedScrollPosition) : 0);
        setTimeout(() => {
            initializeHomepage();
        }, 20);
    } else if (pageId === "meal") {
        window.scrollTo(0, 0);
        setTimeout(() => {
            initializeVideoPlayers();
            initializeHeartReactions();
        }, 20);
    } else if (pageId === "profile") {
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${pageId}`);
        setTimeout(() => {
            window.scrollTo(0, savedScrollPosition ? parseInt(savedScrollPosition) : 0);
        }, 20);
    }
}


function setLoggedInUser(userData) {
  localStorage.setItem('loggedInUser', JSON.stringify(userData));
}

function getLoggedInUser() {
  const userData = localStorage.getItem('loggedInUser');
  if (userData) {
    return JSON.parse(userData);
  }
  
  return {
    id: 999,
    username: "CurrentUser",
    avatar: "pics/default-avatar.png",
    cover: "pics/default-cover.jpg",
    location: "Lagos, Nigeria",
    bio: "This is my personal account",
    following: 245,
    followers: 1023,
    posts: []
  };
}

function showLoggedInUserProfile() {
  const user = getLoggedInUser();
  showUserProfile(user.id);
}

function initializeAccountIcon() {
  const accountIcon = document.querySelector('.account-icon');
  if (accountIcon) {
    accountIcon.addEventListener('click', function(event) {
      event.preventDefault();
      showMyProfile();
    });
  }
}

function showSettings() {
  const currentPage = document.querySelector(".page.active");
  if (currentPage) {
    sessionStorage.setItem(`scrollPosition_${currentPage.id}`, window.scrollY);
  }
  
  // First, reset scroll position
  window.scrollTo(0, 0);
  
  // Create or get the settings page
  let settingsPage = document.getElementById("settings");
  if (!settingsPage) {
    settingsPage = document.createElement("div");
    settingsPage.id = "settings";
    settingsPage.className = "page";
    document.body.appendChild(settingsPage);
  }
  
  // Update CSS to handle the content positioning issue
  if (!document.getElementById('fixed-settings-styles')) {
    const fixedStyles = document.createElement('style');
    fixedStyles.id = 'fixed-settings-styles';
    fixedStyles.textContent = `
      #settings, #general-settings {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        min-height: 100vh;
        background-color: #fff;
        overflow-y: auto;
        z-index: 100;
      }
      .dark-mode #settings {
        background-color: #121212;
      }
        .settings-container {
        font-family: Noto Sans JP;
        padding: 15px;
        background-color: #fff;
        min-height: 100vh;
      }
      .settings-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      .settings-header h1 {
        margin: 0;
        font-size: 20px;
        margin-left: 15px;
      }
      .back-button {
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .back-button img {
        width: 24px;
      }
      .settings-menu {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .settings-item {
        display: flex;
        align-items: center;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .settings-item:hover {
        background-color: #f0f0f0;
      }
      .settings-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
      }
      .settings-icon img {
        width: 24px;
      }
      .settings-text {
        flex: 1;
      }
      .settings-text h3 {
        margin: 0;
        font-size: 16px;
      }
      .settings-text p {
        margin: 5px 0 0;
        font-size: 13px;
        color: #666;
      }
      .settings-arrow {
        width: 24px;
      }
      .settings-arrow img {
        width: 30px;
      }
      .logout {
        display: flex;
        justify-content: center;
      }
      .logout .settings-text h3 {
        color: #f40752;
      }
      .dark-mode {
        background-color: #121212;
        color: #fff;
      }
      .dark-mode .settings-container {
        background-color: #121212;
      }
      .dark-mode .ewe {
        background-color: #121212;
        border-color: rgb(50, 50, 50);
      }
      .dark-mode .settings-header {
        border-bottom-color: #333;
      }
      .dark-mode .settings-item {
        background-color: #1e1e1e;
      }
      .dark-mode .settings-item:hover {
        background-color: #2a2a2a;
      }
      .dark-mode .settings-text p {
        color: #aaa;
      }
      .dark-mode .bld {
        color: white;
      }
      .dark-mode .rkl,
      .dark-mode .goo {
        color: rgb(200, 200, 200);
      }
      .dark-mode .aasw, 
      .dark-mode .aas,
      .dark-mode .header-follow,
      .dark-mode .detail-follow {
        background-color: white;
        color: black;
      }
      .dark-mode .follow {
        background-color: black; 
        color: white;
      }
      .dark-mode .comment-textarea {
        color: white;
      }
      .dark-mode .masonry,
      .dark-mode .drum{
        background-color: rgb(30, 30, 30);
      }
      .dark-mode .time,
      .dark-mode .comment-textarea::placeholder {
        color: rgb(200, 200, 200);
      }
      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #f40752;
      }
      input:checked + .slider:before {
        transform: translateX(26px);
      }
      .page {
        display: none;
      }
      .page.active {
        display: block;
      }
      .dark-mode .settings-icon img,
      .dark-mode .settings-arrow img,
      .dark-mode .back-button img,
      .dark-mode .dee,
      .dark-mode .kiy,
      .dark-mode .flat,
      .dark-mode .logs1,
      .dark-mode .feeling,
      .dark-mode .lefti,
      .dark-mode .leti,
      .dark-mode .dot {
        filter: invert(1); /* Inverts black to white */
      }
      .dark-mode .heart-icon .heart-path {
       stroke: white;
      }
      .dark-mode .offi {
        filter: invert(1);
      }
      .dark-mode .kor {
        border-color: black;
        box-shadow: 0px 0px 9px rgba(255, 255, 255, 0.5);
      }
      .dark-mode .heado {
        background-color: rgba(0, 0, 0, 0.8);
        border-bottom-color: rgb(50, 50, 50);
        backdrop-filter: blur(10px);
      }
      .dark-mode .header-avatar {
        border-color: black;
      }
      .dark-mode .poster,
      .dark-mode .tir,
      .dark-mode .lefto,
      .dark-mode .comment-item {
        border-color: rgb(50, 50, 50);
      }
      .dark-mode .poster:hover,
      .dark-mode .comment-item:hover {
        background-color: rgb(10, 10, 10);
      }
      .dark-mode .comment-box {
        background-color: transparent;
      }
      .dark-mode .comment-container {
        background-color: black;
        border: 1px solid rgb(50, 50, 50);
        color: rgb(50, 50, 50);
      }
    `;
    document.head.appendChild(fixedStyles);
  }
  
  // Render settings content
  settingsPage.innerHTML = `
      <div class="settings-container">
      <div class="settings-header">
        <div class="back-button" onclick="goBackFromSettings()">
          <img src="pics/angle.svg" alt="Back">
        </div>
        <h1>Settings</h1>
      </div>
      
      <div class="settings-menu">
        <div class="settings-item" onclick="showGeneralSettings()">
          <div class="settings-icon">
            <img src="pics/seet.svg" alt="General">
          </div>
          <div class="settings-text">
            <h3>General</h3>
            <p>Dark mode, language, and more</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/set.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/admin.svg" alt="Security">
          </div>
          <div class="settings-text">
            <h3>Account Security</h3>
            <p>Password, two-factor authentication</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/set.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/pad.svg" alt="Privacy">
          </div>
          <div class="settings-text">
            <h3>Privacy</h3>
            <p>Who can see your content</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/set.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/paper.svg" alt="Preferences">
          </div>
          <div class="settings-text">
            <h3>Content Preferences</h3>
            <p>Customize your feed</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/set.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/about.svg" alt="About">
          </div>
          <div class="settings-text">
            <h3>About Wings</h3>
            <p>Terms, privacy policy, and licenses</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/set.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item logout" onclick="handleLogout()">
          
          <div class="settings-text logout">
            <h3>Log out / Switch Account</h3>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Switch to settings page
  switchPage("settings");
  
  // Ensure scroll is at top
  window.scrollTo(0, 0);
  
  // Update history
  history.replaceState({
    page: "settings",
    fromPage: "profile",
    timestamp: Date.now()
  }, "", `#settings`);
}


function goBackFromSettings() {
  const currentState = history.state || {};
  const fromPage = currentState.fromPage || "profile";
  
  // If we're in a sub-settings page, go back to main settings
  if (currentState.settingsSubPage) {
    showSettings();
    return;
  }
  
  // Otherwise go back to the previous page
  switchPage(fromPage);
  
  // Restore scroll position
  setTimeout(() => {
    const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${fromPage}`);
    window.scrollTo(0, savedScrollPosition ? parseInt(savedScrollPosition) : 0);
  }, 20);
  
  // Update history
  history.replaceState({ 
    page: fromPage, 
    timestamp: Date.now() 
  }, "", `#${fromPage}`);
}

function showGeneralSettings() {
  // Create a general settings page
  if (!document.getElementById("general-settings")) {
    const generalSettingsPage = document.createElement("div");
    generalSettingsPage.id = "general-settings";
    generalSettingsPage.className = "page";
    document.body.appendChild(generalSettingsPage);
  }
  
  const generalSettingsPage = document.getElementById("general-settings");
  
  // Save current settings page state
  sessionStorage.setItem("settingsPage", document.getElementById("settings").innerHTML);
  
  // Check if dark mode is enabled
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  // Render general settings content
  generalSettingsPage.innerHTML = `
    <div class="settings-container">
      <div class="settings-header">
        <div class="back-button" onclick="goBackToMainSettings()">
          <img src="pics/angle.svg" alt="Back">
        </div>
        <h1>General</h1>
      </div>
      
      <div class="settings-menu">
        <div class="settings-item">
          <div class="settings-text">
            <h3>Dark Mode</h3>
          </div>
          <label class="switch">
            <input type="checkbox" id="darkModeToggle" ${isDarkMode ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="settings-item">
          <div class="settings-text">
            <h3>Language</h3>
            <p>English (US)</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/set.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-text">
            <h3>Notifications</h3>
          </div>
          <div class="settings-arrow">
            <img src="pics/set.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-text">
            <h3>Data Usage</h3>
          </div>
          <div class="settings-arrow">
            <img src="pics/set.svg" alt="Arrow">
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Switch to general settings page
  document.getElementById("settings").classList.remove("active");
  generalSettingsPage.classList.add("active");
  
  // Set up dark mode toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", toggleDarkMode);
  }
  
  // Update history state
  history.pushState({ 
    page: "general-settings",
    fromPage: "settings",
    settingsSubPage: true,
    timestamp: Date.now()
  }, "", `#general-settings`);
}

function goBackToMainSettings() {
  // Restore main settings page
  const settingsPage = document.getElementById("settings");
  const generalSettingsPage = document.getElementById("general-settings");
  
  // Restore the saved settings HTML if available
  if (sessionStorage.getItem("settingsPage")) {
    settingsPage.innerHTML = sessionStorage.getItem("settingsPage");
  }
  
  // Switch back to settings page
  generalSettingsPage.classList.remove("active");
  settingsPage.classList.add("active");
  
  // Update history state
  history.pushState({ 
    page: "settings",
    fromPage: "profile",
    timestamp: Date.now()
  }, "", `#settings`);
}

function toggleDarkMode() {
  // Toggle dark mode class on body
  document.body.classList.toggle('dark-mode');
  
  // Save preference to localStorage
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
}

function handleLogout() {
  // This would typically handle the logout process
  // For now, just redirect to login page
  alert("Logging out...");
  window.location.href = "index.html";
}

// Modify showMyProfile to include settings button functionality
function showMyProfile() {
  const user = getLoggedInUser();
  
  switchPage("profile");
  
  setTimeout(() => {
    updateHeaderHTML(user.id);
  }, 50);
  
  const profileIreti = document.getElementById("ireti");
  
  profileIreti.innerHTML = `
    <img class="frin" src="${user.cover}">
    <div>
      <img class="kor" src="${user.avatar}">
    </div>
    <div class="klr">
      <div class="drun">
        <div>
          <p class="spe">${user.username}</p>
        </div>
        <div>
          <img class="verify" src="pics/very.svg">
        </div>
      </div>
      <div class="druu">
        <div>
          <p class="rkl">${user.location}</p>
        </div>
        <div class="drum"> 
          <img class="kiy" src="pics/qr.svg">
        </div>
      </div>
      <div class="nin">
        <p class="rkl"><span class="bld">${user.following}</span> following &#183; <span class="bld">${user.followers}</span> followers</p>
      </div>
      <div class="cha">
        <p>${user.bio}</p>
      </div>
      <div class="man">
        <div class="vre">
          <button class="aasw edit-profile-btn">Edit Profile</button>
        </div>
        <div class="vre">
          <button class="aas settings-btn" onclick="showSettings()"><img class="offi" src="pics/setting.svg"></button>
        </div>
      </div>
    </div>
    <div class="ewe">
      <div class="yeb">
        <img class="dee" src="pics/apps.svg">
      </div>
      <div class="yeb">
        <a href="javascript:void(0);">
          <img class="dee" src="pics/newspaper.svg">
        </a>
      </div>
      <div class="yeb">
        <img class="dee" src="pics/store.svg">
      </div>
    </div>
    <div class="mansonro">
      <div class="masonri">
        <div class="column left-column"></div>
        <div class="column right-column"></div>
      </div>
    </div>
  `;
  
  const wingDiv = document.querySelector(".wing");
  if (wingDiv) {
    wingDiv.style.display = "block";
  }
  
  renderUserPosts(user.id);
  
  const editProfileBtn = document.querySelector('.edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', openEditProfileModal);
  }
  
  // Update history state
  history.replaceState({ page: "profile", profileTab: "posts" }, "", "#profile");
}

// Update navigation handler to support settings pages
window.onpopstate = function(event) {
    const modal = document.querySelector('.video-modal');
    
    if (modal && modal.classList.contains('active')) {
        closeVideoModal();
        return; // Stop further processing after closing modal
    }
    
    // Handle settings sub-pages
    if (event.state && event.state.settingsSubPage) {
        goBackToMainSettings();
        return;
    }
    
    // Handle regular page navigation
    if (event.state && event.state.page) {
        switchPage(event.state.page);
        setTimeout(() => {
            const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${event.state.page}`);
            window.scrollTo(0, savedScrollPosition ? parseInt(savedScrollPosition) : 0);
        }, 20);
    } else {
        switchPage("food"); // Default to homepage
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 20);
    }
};

// Initialize dark mode if previously enabled
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
});



document.addEventListener("DOMContentLoaded", function () {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedInUser && loggedInUser.avatar) {
    document.getElementById("usero").src = loggedInUser.avatar;
  }
});

function openEditProfileModal() {
  const user = getLoggedInUser();
  
  if (!document.querySelector('.edit-profile-modal')) {
    const modal = document.createElement('div');
    modal.className = 'edit-profile-modal';
    modal.innerHTML = `
      <div class="modal-content1">
        <div class="modal-header1">
          <h2>Edit Profile</h2>
          <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="edit-username" value="${user.username}">
          </div>
          <div class="form-group">
            <label for="location">Location</label>
            <input type="text" id="edit-location" value="${user.location}">
          </div>
          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea id="edit-bio">${user.bio}</textarea>
          </div>
          <div class="form-group">
            <label>Profile Picture</label>
            <div class="upload-btn-wrapper">
              <button class="btn">Upload Image</button>
              <input type="file" id="profile-pic-upload" accept="image/*" />
            </div>
          </div>
          <div class="form-group">
            <label>Cover Photo</label>
            <div class="upload-btn-wrapper">
              <button class="btn">Upload Image</button>
              <input type="file" id="cover-pic-upload" accept="image/*" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button id="save-profile" class="save-btn">Save Changes</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = document.querySelector('.close-modal');
    closeBtn.addEventListener('click', closeEditProfileModal);
    
    const saveBtn = document.getElementById('save-profile');
    saveBtn.addEventListener('click', saveProfileChanges);
  }
  
  document.querySelector('.edit-profile-modal').style.display = 'block';
}

function closeEditProfileModal() {
  document.querySelector('.edit-profile-modal').style.display = 'none';
}

function saveProfileChanges() {
  const username = document.getElementById('edit-username').value;
  const location = document.getElementById('edit-location').value;
  const bio = document.getElementById('edit-bio').value;
  
  const user = getLoggedInUser();
  
  user.username = username;
  user.location = location;
  user.bio = bio;
  
  setLoggedInUser(user);
  closeEditProfileModal();
  showMyProfile();
}

document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('edit-profile-styles')) {
    const styles = document.createElement('style');
    styles.id = 'edit-profile-styles';
    styles.textContent = `
      .edit-profile-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
      }
      .modal-content1 {
        background-color: #fff;
        margin: 10% auto;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 500px;
      }
      .modal-header1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      .close-modal {
        font-size: 24px;
        cursor: pointer;
      }
      .form-group {
        margin-bottom: 15px;
      }
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      .form-group input, .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .form-group textarea {
        height: 100px;
      }
      .upload-btn-wrapper {
        position: relative;
        overflow: hidden;
        display: inline-block;
      }
      .btn {
        border: 1px solid #ccc;
        color: #555;
        background-color: white;
        padding: 8px 20px;
        border-radius: 4px;
        font-weight: bold;
      }
      .upload-btn-wrapper input[type=file] {
        font-size: 100px;
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
        cursor: pointer;
      }
      .save-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        border-radius: 4px;
        cursor: pointer;
      }
      .empty-posts-message {
        text-align: center;
        padding: 20px;
        background-color: #f8f8f8;
        border-radius: 8px;
        margin: 10px 0;
      }
    `;
    document.head.appendChild(styles);
  }
  
  const accountIcons = document.querySelectorAll('.account-icon, .profile-icon, .me-icon');
  accountIcons.forEach(icon => {
    if (icon) {
      icon.addEventListener('click', function(event) {
        event.preventDefault();
        showMyProfile();
      });
    }
  });

  if (!localStorage.getItem('loggedInUser')) {
    setLoggedInUser({
      id: 999,
      username: "CurrentUser",
      avatar: "pics/default-avatar.png", 
      cover: "pics/default-cover.jpg",
      location: "Lagos, Nigeria",
      bio: "This is my profile! I love sharing content about technology and design.",
      following: 245,
      followers: 1023,
      posts: []
    });
  }
});

function createPostHTML(post) {
  const hasVideo = post.video ? true : false;
  const hasImage = post.image ? true : false;
  
  return `
    <div class="profile-post" data-post-id="${post.id}">
      ${hasImage ? `<img class="post-image" src="${post.image}" loading="lazy">` : ''}
      ${hasVideo ? `
        <div class="video-thumbnail">
          <img src="${post.thumbnail || 'pics/video-thumbnail.jpg'}" loading="lazy">
          <div class="play-overlay">
            <svg width="50" height="50" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" fill="white"/>
            </svg>
          </div>
        </div>
      ` : ''}
      <div class="post-content">
        <p>${shortenText(post.content, 100, true)}</p>
      </div>
      <div class="post-stats">
        <div class="stat-item">
          <img src="pics/lovv.png" alt="Likes">
          <span>${post.likeCount || 0}</span>
        </div>
        <div class="stat-item">
          <img src="pics/chat.png" alt="Comments">
          <span>${post.commentCount || 0}</span>
        </div>
        <div class="stat-item">
          <img src="pics/stats.png" alt="Views">
          <span>${post.views || 0}</span>
        </div>
      </div>
    </div>
  `;
}

let lastScrollPos = 0;

function updateHeaderHTML(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const header = document.querySelector('.file');
  let headerProfilePic = document.querySelector('.header-profile-pic');
  let headerFollowBtn = document.querySelector('.header-follow-btn');

  if (!headerProfilePic) {
    headerProfilePic = document.createElement('div');
    headerProfilePic.className = 'header-profile-pic';
    header.appendChild(headerProfilePic);
  }

  if (!headerFollowBtn) {
    headerFollowBtn = document.createElement('div');
    headerFollowBtn.className = 'header-follow-btn';
    header.appendChild(headerFollowBtn);
  }

  headerProfilePic.innerHTML = `<img class="header-avatar" src="${user.avatar}" alt="Profile">`;
  headerFollowBtn.innerHTML = `<button class="header-follow settings-btn" onclick="showSettings()"><img class="offi" src="pics/setting.svg"></button>
    `;

  headerProfilePic.style.display = 'none';
  headerFollowBtn.style.display = 'none';
}

function handleScroll() {
  const profilePic = document.querySelector('.kor');
  const followBtn = document.querySelector('.aasw');
  const headerProfilePic = document.querySelector('.header-profile-pic');
  const headerFollowBtn = document.querySelector('.header-follow-btn');
  
  if (!profilePic || !followBtn || !headerProfilePic || !headerFollowBtn) return;
  
  const profilePicRect = profilePic.getBoundingClientRect();
  const followBtnRect = followBtn.getBoundingClientRect();
  
  if (headerProfilePic.querySelector('img').src === '') {
    headerProfilePic.querySelector('img').src = profilePic.src;
  }
  
  const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
  const scrollingDown = currentScrollPos > lastScrollPos;
  lastScrollPos = currentScrollPos;
  
  if (profilePicRect.bottom < 60 && profilePicRect.top < 0) {
    headerProfilePic.style.display = 'block';
    setTimeout(() => {
      headerProfilePic.classList.add('visible');
    }, 10);
  } else {
    headerProfilePic.classList.remove('visible');
    setTimeout(() => {
      if (!headerProfilePic.classList.contains('visible')) {
        headerProfilePic.style.display = 'none';
      }
    }, 300);
  }
  
  if (followBtnRect.bottom < 60 && followBtnRect.top < 0) {
    headerFollowBtn.style.display = 'block';
    setTimeout(() => {
      headerFollowBtn.classList.add('visible');
    }, 10);
  } else {
    headerFollowBtn.classList.remove('visible');
    setTimeout(() => {
      if (!headerFollowBtn.classList.contains('visible')) {
        headerFollowBtn.style.display = 'none';
      }
    }, 300);
  }
}

function updateDetailForPost(user) {
  const detailProfilePic = document.querySelector('.detail-profile-pic');
  const detailUsername = document.querySelector('.detail-username');
  const detailFollowBtn = document.querySelector('.detail-follow');

  if (!detailProfilePic || !detailUsername || !detailFollowBtn) return;

  detailProfilePic.innerHTML = `<img src="${user.avatar}" alt="Profile">`;
  detailUsername.textContent = user.username;
  detailFollowBtn.textContent = "Follow";
}

function setupDetailScrollListener() {
  window.addEventListener("scroll", function () {
    const profilePic = document.querySelector(".small-photo");
    const followBtn = document.querySelector(".foni");
    const detailContent = document.querySelector(".detail-content");

    if (!profilePic || !followBtn || !detailContent) return;

    const profilePicRect = profilePic.getBoundingClientRect();
    const followBtnRect = followBtn.getBoundingClientRect();

    if (profilePicRect.top < 0 || followBtnRect.top < 0) {
      detailContent.classList.add("visible");
    } else {
      detailContent.classList.remove("visible");
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  updateHeaderHTML();
  lastScrollPos = window.pageYOffset || document.documentElement.scrollTop;
  window.addEventListener('scroll', handleScroll);
});