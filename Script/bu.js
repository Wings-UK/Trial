// Enhanced scroll position management
window.addEventListener("DOMContentLoaded", function () {
    const pageId = document.querySelector(".page.active")?.id;
    if (pageId) {
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${pageId}`);
        if (savedScrollPosition) {
            // Use setTimeout to ensure DOM is fully ready
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollPosition));
            }, 10);
        }
    }
});

// Improved cleanup function for virtualization observers
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

// Enhanced switchPage function for better state management
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
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${pageId}`);
        if (savedScrollPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollPosition));
            }, 20);
        } else {
            window.scrollTo(0, 0);
        }
        
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

// Improved history navigation handler
window.onpopstate = function (event) {
    const modal = document.querySelector('.video-modal');

    // Handle modal closure first
    if (modal && modal.classList.contains('active')) {
        closeVideoModal();
        return;
    }

    // Navigate to appropriate page based on history state
    if (event.state && event.state.page) {
        // Save current scroll position before navigation
        const currentPage = document.querySelector(".page.active");
        if (currentPage) {
            sessionStorage.setItem(`scrollPosition_${currentPage.id}`, window.scrollY);
        }
        
        // Switch to the page from history
        switchPage(event.state.page);
        
        // Restore scroll position with delay to ensure page is rendered
        setTimeout(() => {
            const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${event.state.page}`);
            if (savedScrollPosition) {
                window.scrollTo(0, parseInt(savedScrollPosition));
            } else {
                window.scrollTo(0, 0);
            }
        }, 20);
    } else {
        // Default to home page if no state
        switchPage("food");
    }
};

// Enhanced showDetail function with better state handling
function showDetail(postId) {
    // Save current scroll position before showing detail
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

    // Build post detail HTML (your existing code)
    // ...
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
    }, 30);
}

// Enhanced showUserProfile with improved state management
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

// Helper function to render user profile
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

// Enhanced goBack function with better transition
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

// Enhanced homepage initialization function
function initializeHomepage() {
    const postContainer = document.getElementById("flyer");
    if (!postContainer) return;

    // Clear any existing observers
    cleanupVirtualization();
    
    // Reset state variables
    loadedPostIds.clear();
    isLoading = false;
    
    // Add skeleton styles
    addSkeletonStyles();

    // Create and add initial skeleton posts
    postContainer.innerHTML = ''; // Ensure container is empty
    const initialCount = Math.min(postsPerLoad, posts.length);
    for (let i = 0; i < initialCount; i++) {
        const skeleton = createSkeletonPost(posts[i].id);
        postContainer.appendChild(skeleton);
    }

    // Set up virtualization after a short delay
    setTimeout(() => {
        setupVirtualizedScrolling();
        
        // Add scroll listener with passive flag for performance
        window.addEventListener('scroll', handleVirtualizedScroll, { passive: true });
        
        // Initialize other components
        initializeHeartReactions();
        initializeVideoPlayers();
    }, 30);
}

// Enhanced function to handle virtualized scrolling
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

// DOMContentLoaded initialization
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
