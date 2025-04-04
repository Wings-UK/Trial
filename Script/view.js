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

const posts = [

    {

      id: 1,
      userId: 4,  // Refers to user with id 1 (@reddcinema)
      timestamp: "13 mins ago",
      video: "pics/tru.mp4",
      date: "Feb 28, 2025 3:56 PM",
      likeCount: 720,
      commentCount: 53,
      content: "Right y'all, I’ve been dating a 36 year old for almost 6 months. I turn 20 in 5 days. How do I tell my parents about it? Have I mentioned he lives 5 states away? 💀💀",
    },
    {
      id: 2,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "6 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/1.jpg",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
    {
      id: 3,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "4 mins ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/2.jpg",
      content: "So as a prank, I started texting my best friend on one of those text numbers pretending to be this dube she was in love with but he did her dirty. And this girl is sooo excited that now I feel guilty😭 should I tell or just stop texting and pretend it never happened please help.",
    },
    {
      id: 4,
      userId: 1,  // Refers to user with id 2 (@lena)
      timestamp: "an hour ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/5.jpg",
      content: "do you guys think that how a child turns out is 100% the parents fault or do you think that no matter how good someone may parent their child they may still turn out bad because that's just who they are?",
    },
    {
      id: 5,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "just now",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/6.jpg",
      content: "I get back to my hotel and realize housekeeping cleaned room and stole my damn cocaine and I just called down to the front desk and asked for it... the lady was like your what? “my bag of cocaine sweetie”... they got me fucked up if they think I ain’t gonna ask for my shit.",
    },
    {
      id: 6,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "4 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/7.jpg",
      content: "I had my daughter today at 10:29am it was very long and emotional labor but it was worth every second she’s perfect 💞 her registry is still available please contribute if you can me and her both have a long road ahead of us. Thank you everyone who did what they could💕💕",
    },
    {
      id: 7,
      userId: 1,  // Refers to user with id 2 (@lena)
      timestamp: "2 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/9.jpg",
      content: "So yall I been dating this girl. (A stud) and she went back to the previous girl she was dating & kinda like tryna have us both. She been with her these past few days. & im tryna see the exact words to say to get her over here so I can sneak my key back from her?😩",
    },
    {
      id: 8,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "9 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      video: "pics/12.mp4",
      content: "why do mothers treat they daughters like they the scum? me & my momma can’t seem to get along at all why i get off a 10 FUCKING HOUR SHIFT OVERNIGHT TO BE EXACT & my “ ROOM” that i pay for monthly which i share w a fucking 12 years old and all my shit is scatter? bro im pissed",
    },
    {
      id: 9,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "3 mins ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/11.jpg",
      content: "I don't think many people talk about the beauty of ageing, especially with grey hair. I want to age beautifully old with grey hair. I feel like some ppl have such a big fear of ageing to the point where they will try their hardest to look young which is kinda sad",
    },
    {
      id: 10,
      userId: 1,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      video: "pics/18.mp4",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
    {
      id: 11,
      userId: 4,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      video: "pics/14.mp4",
      content: "I think i like this dance. Can someone tell me the name and the country where i can go to learn this? It looks difficult though",
    },
    {
      id: 12,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/15.jpg",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
    {
      id: 13,
      userId: 4,  // Refers to user with id 2 (@lena)
      timestamp: "8 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      content: "Shutdown Rivers Assembly. Declare State of Emergency in Rivers State - Obasanjo Visits SIM Fubara. Withdraw security personnel from all Rivers Assembly members. Shut down NNPC, shut down NDDC, and dismantle any forces that may rise against you. You are the governor, elected by the people. You are the Chief Security Officer of Rivers State. What you order stands—neither Tinubu nor Wike put you in power. Demolish any hall or arena set to host your impeachment. Tinubu needs Rivers votes to win the 2027 election, and you stand in his way. Stop playing U.S. politics in a country like this—there is no law here, everything is lawless. Obasanjo Visits Sim Fubara, Advises Him on How to Handle Wike and Tinubu.",
    },
  
];

const loggedInUser = {
    id: 4,
    username: "@jeremyx",
    name: "Jeremy X",
    cover: "pics/memo6.jpg",
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

function loadMorePosts() {
  if (isLoading) return;
  isLoading = true;

  const postContainer = document.getElementById("flyer");
  
  let postsLoaded = 0;
  
  for (let i = 0; i < posts.length && postsLoaded < postsPerLoad; i++) {
    if (!loadedPostIds.has(posts[i].id)) {
      loadedPostIds.add(posts[i].id);
      
      const postElement = createPostElement(posts[i]);
      if (postElement) {
        postContainer.appendChild(postElement);
        postsLoaded++;
      }
    }
  }

  setTimeout(() => {
    initializeVideoPlayers();
    initializeHeartReactions();
  }, 0);
  
  if (loadedPostIds.size >= posts.length) {
    window.removeEventListener("scroll", scrollHandler);
  }
  
  isLoading = false;
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
    
    container.addEventListener('click', function(e) {
      e.stopPropagation();
      
      const postElement = container.closest('.poster');
      if (!postElement) return;
      
      const postId = parseInt(postElement.getAttribute('data-post-id'));
      if (isNaN(postId)) return;
      
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      ensureVideoModalExists();
      openVideoModal(post);
    });
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
  
  sessionStorage.setItem("scrollPosition", window.scrollY);
  history.pushState({ modalOpen: true }, '', '#video-modal');
  
  videoPlayer.play().catch(error => {
    console.log('Auto-play prevented:', error);
    const playOverlay = document.createElement('div');
    playOverlay.className = 'play-overlay';
    playOverlay.innerHTML = ``;
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
  if (savedScrollPosition) {
    setTimeout(() => {
      window.scrollTo(0, parseInt(savedScrollPosition));
    }, 0);
  }
  
  modal.classList.remove('active');
  document.body.style.overflow = '';
  
  if (history.state && history.state.page === "meal") {
    switchPage("meal");
  } else {
    history.back();
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

  videoPlayer.addEventListener('click', (e) => {
    toggleVideoPlayback();
  });

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
        <div class="drum">
          <p class="swe">4</p>
          <img class="kiy" src="pics/kiddo.png">
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
        <img class="dee" src="pics/apps.png">
      </div>
      <div class="yeb">
        <a href="Retail-Desktop-MyAccount-Storefront.html">
          <img class="dee" src="pics/browser.png">
        </a>
      </div>
      <div class="yeb">
        <img class="dee" src="pics/bren.png">
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

  userPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  userPosts.forEach((post, index) => {
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
              <img class="brekca" src="pics/chat-pic.jpg">
              <p class="goo">@babygirl</p>
            </div>
            <div class="fred">
              <img class="pen" src="pics/lovv.png">
              <p class="goo">2.9K</p>
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
}

function showDetail(postId) {
    // Save current scroll position before showing detail (only for the originating page)
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

    // Build post detail HTML (unchanged)
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
        
        ${hasVideo ? renderPostWithNewVideoPlayer(post, user) : ''}
        
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
            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/17.jpg"></a>
                <div class="vrea">
                    <img class="luve" src="pics/lovv.png">
                </div>
            </div>   
            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/19.jpg"></a>
                <div class="vrea">
                    <img class="luve" src="pics/2.gif">
                </div>
            </div>   
            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/20.jpg"></a>
                <div class="vrea">
                    <img class="luve" src="pics/lovv.png">
                </div>
            </div>   
            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/mypics.jpg"></a>
                <div class="vrea">
                    <img class="luve" src="pics/3.gif">
                </div>
            </div>   
        </div>
    `;

    // Switch to detail page with proper history state
    switchPage("meal");
    history.replaceState({ 
        page: "meal", 
        postId: postId,
        fromPage: "food",
        timestamp: Date.now()
    }, "", `#meal/${postId}`);
    
    // Initialize components with delay to ensure DOM is ready
    setTimeout(() => {
        initializeVideoPlayers();
        updateDetailForPost(user);
        setupDetailScrollListener();
        window.scrollTo(0, 0); // Ensure scroll is at top after initialization
    }, 30);
    
    
       
        
  
   

}

function goBack() {
    const fromPage = history.state?.fromPage || "food";
    switchPage(fromPage);
    
    setTimeout(() => {
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${fromPage}`);
        if (savedScrollPosition) {
            window.scrollTo(0, parseInt(savedScrollPosition));
        } else {
            window.scrollTo(0, 0);
        }
    }, 20);
}

function switchPage(pageId) {
    const currentPage = document.querySelector(".page.active");
    
    // Save scroll position of current page before switching
    if (currentPage) {
        const currentScrollPosition = window.scrollY;
        sessionStorage.setItem(`scrollPosition_${currentPage.id}`, currentScrollPosition);
        
        // Properly clean up before switching
        if (currentPage.id === "food") {
            cleanupVirtualization();
        }
    }

    // Hide all pages first
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.remove("active"));

    // Show new page
    const newPage = document.getElementById(pageId);
    newPage.classList.add("active");

    // Update history state with appropriate context
    if (!history.state) {
        history.replaceState({ page: pageId, fromPage: "initial" }, "", `#${pageId}`);
    } else if (history.state.page !== pageId) {
        history.pushState({ 
            page: pageId, 
            fromPage: currentPage ? currentPage.id : "initial",
            timestamp: Date.now() // Add timestamp to make states unique
        }, "", `#${pageId}`);
    }

    // Handle specific page initializations
    if (pageId === "food") {
        // Set scroll position immediately to avoid jump
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${pageId}`);
        if (savedScrollPosition) {
            window.scrollTo(0, parseInt(savedScrollPosition));
        } else {
            window.scrollTo(0, 0);
        }
        
        // Initialize homepage with slight delay to ensure smooth transition
        setTimeout(() => {
            initializeHomepage();
        }, 20);
    } else if (pageId === "meal") {
        // For post detail page
        
            window.scrollTo(0, 0);
       
        
        // Initialize any post-specific components
        setTimeout(() => {
            initializeVideoPlayers();
            initializeHeartReactions();
        }, 20);
    } else if (pageId === "profile") {
        // For profile page
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${pageId}`);
        if (savedScrollPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollPosition));
            }, 20);
        } else {
            window.scrollTo(0, 0);
        }
    }
}

window.onpopstate = function(event) {
  const modal = document.querySelector('.video-modal');
  
  // Handle modal closure first
  if (modal && modal.classList.contains('active')) {
    closeVideoModal();
    return;
  }
  
  // Navigate to appropriate page based on history state
  if (event.state && event.state.page) {
    // Save current scroll position before navigation (except for "meal")
    const currentPage = document.querySelector(".page.active");
    if (currentPage && event.state.page !== "meal") {
      sessionStorage.setItem(`scrollPosition_${currentPage.id}`, window.scrollY);
    }
    
    // Switch to the page from history
    switchPage(event.state.page);
    
    // Restore scroll position with delay to ensure page is rendered, except for "meal"
    if (event.state.page !== "meal") {
      setTimeout(() => {
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${event.state.page}`);
        if (savedScrollPosition) {
          window.scrollTo(0, parseInt(savedScrollPosition));
        } else {
          window.scrollTo(0, 0);
        }
      }, 20);
    } else {
      window.scrollTo(0, 0); // Always start "meal" page at top
    }
  } else {
    // Default to home page if no state
    switchPage("food");
  }
};

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
          <img class="verify" src="pics/verifi1.png">
        </div>
      </div>
      <div class="druu">
        <div>
          <p class="rkl">${user.location}</p>
        </div>
        <div class="drum">
          <p class="swe">4</p>
          <img class="kiy" src="pics/kiddo.png">
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
          <button class="aasw">Settings</button>
        </div>
      </div>
    </div>
    <div class="ewe">
      <div class="yeb">
        <img class="dee" src="pics/bren1.png">
      </div>
      <div class="yeb">
        <a href="javascript:void(0);">
          <img class="dee" src="pics/browser.png">
        </a>
      </div>
      <div class="yeb">
        <img class="dee" src="pics/bren.png">
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
  
  history.replaceState({ page: "profile", profileTab: "posts" }, "", "#profile");
}

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
  headerFollowBtn.innerHTML = `<button class="header-follow">Follow</button>`;

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