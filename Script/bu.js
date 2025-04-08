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



function showSettings() {
  const currentPage = document.querySelector(".page.active");
  if (currentPage) {
    sessionStorage.setItem(`scrollPosition_${currentPage.id}`, window.scrollY);
  }
  // Save current scroll position
  
  
  // Create or get the settings page
  let settingsPage = document.getElementById("settings");
  if (!settingsPage) {
    settingsPage = document.createElement("div");
    settingsPage.id = "settings";
    settingsPage.className = "page";
    document.body.appendChild(settingsPage);
  }
  
  // Render settings content
  settingsPage.innerHTML = `
    <div class="settings-container">
      <div class="settings-header">
        <div class="back-button" onclick="goBackFromSettings()">
          <img src="pics/backa.png" alt="Back">
        </div>
        <h1>Settings</h1>
      </div>
      
      <div class="settings-menu">
        <div class="settings-item" onclick="showGeneralSettings()">
          <div class="settings-icon">
            <img src="pics/general.svg" alt="General">
          </div>
          <div class="settings-text">
            <h3>General</h3>
            <p>Dark mode, language, and more</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/arrow.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/security.svg" alt="Security">
          </div>
          <div class="settings-text">
            <h3>Account Security</h3>
            <p>Password, two-factor authentication</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/arrow.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/privacy.svg" alt="Privacy">
          </div>
          <div class="settings-text">
            <h3>Privacy</h3>
            <p>Who can see your content</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/arrow.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/preferences.svg" alt="Preferences">
          </div>
          <div class="settings-text">
            <h3>Content Preferences</h3>
            <p>Customize your feed</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/arrow.svg" alt="Arrow">
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
            <img src="pics/arrow.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item logout" onclick="handleLogout()">
          <div class="settings-icon">
            <img src="pics/logout.svg" alt="Logout">
          </div>
          <div class="settings-text">
            <h3>Log out / Switch Account</h3>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add CSS for settings page if not already added
  if (!document.getElementById('settings-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'settings-styles';
    styleElement.textContent = `
      .settings-container {
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
        width: 16px;
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
    `;
    document.head.appendChild(styleElement);
  }
  
  // Switch to settings page
  switchPage("settings");
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
          <img src="pics/backa.png" alt="Back">
        </div>
        <h1>General</h1>
      </div>
      
      <div class="settings-menu">
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/darkmode.svg" alt="Dark Mode">
          </div>
          <div class="settings-text">
            <h3>Dark Mode</h3>
            <p>Change the appearance of Wings</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="darkModeToggle" ${isDarkMode ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/language.svg" alt="Language">
          </div>
          <div class="settings-text">
            <h3>Language</h3>
            <p>English (US)</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/arrow.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/notifications.svg" alt="Notifications">
          </div>
          <div class="settings-text">
            <h3>Notifications</h3>
            <p>Push, email, and in-app</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/arrow.svg" alt="Arrow">
          </div>
        </div>
        
        <div class="settings-item">
          <div class="settings-icon">
            <img src="pics/data.svg" alt="Data Usage">
          </div>
          <div class="settings-text">
            <h3>Data Usage</h3>
            <p>Optimize media and content loading</p>
          </div>
          <div class="settings-arrow">
            <img src="pics/arrow.svg" alt="Arrow">
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



Why is the setting page opening with blank and the content only start showing when I scroll up? I have inspected and nothing is there. Just the blank space. Isn't it naturally supposed to start at the top? Please fix this with a flawless solution. 