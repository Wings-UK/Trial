
// Make sure to call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize header if needed
  updateHeaderHTML();
  
  // Initialize lastScrollPos
  lastScrollPos = window.pageYOffset || document.documentElement.scrollTop;
  
  // Attach scroll event listener
  window.addEventListener('scroll', handleScroll);
});


// Variable to track scroll position
let lastScrollPos = 0;

// Function to add necessary elements to the header
function updateHeaderHTML(userId) {
  const user = users.find(u => u.id === userId) || getLoggedInUser();;
  if (!user) return;

  const header = document.querySelector('.file');
  let headerProfilePic = document.querySelector('.header-profile-pic');
  let headerFollowBtn = document.querySelector('.header-follow-btn');

  // If elements do not exist, create them
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

  // **Update the elements with the new profile data**
  headerProfilePic.innerHTML = `<img class="header-avatar" src="${user.avatar}" alt="Profile">`;
  headerFollowBtn.innerHTML = `<button class="header-follow">Follow</button>`;

  // Ensure elements are hidden by default (but ready to be shown when scrolling)
  headerProfilePic.style.display = 'none';
  headerFollowBtn.style.display = 'none';
}

// Function to handle scroll events
function handleScroll() {
  // Get references to the elements
  const profilePic = document.querySelector('.kor');
  const followBtn = document.querySelector('.aasw');
  const headerProfilePic = document.querySelector('.header-profile-pic');
  const headerFollowBtn = document.querySelector('.header-follow-btn');
  
  if (!profilePic || !followBtn || !headerProfilePic || !headerFollowBtn) return;
  
  // Get positions
  const profilePicRect = profilePic.getBoundingClientRect();
  const followBtnRect = followBtn.getBoundingClientRect();
  
  // Set the avatar image source (only needs to be done once)
  if (headerProfilePic.querySelector('img').src === '') {
    headerProfilePic.querySelector('img').src = profilePic.src;
  }
  
  // Track scroll direction
  const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
  const scrollingDown = currentScrollPos > lastScrollPos;
  lastScrollPos = currentScrollPos;
  
  // Check if profile pic is out of view (scrolled up)
  if (profilePicRect.bottom < 60 && profilePicRect.top < 0) { // Ensure it's actually scrolled out of view
    headerProfilePic.style.display = 'block';
    // Slight delay to allow display to take effect before adding visible class
    setTimeout(() => {
      headerProfilePic.classList.add('visible');
    }, 10);
  } else {
    headerProfilePic.classList.remove('visible');
    // Hide after transition completes
    setTimeout(() => {
      if (!headerProfilePic.classList.contains('visible')) {
        headerProfilePic.style.display = 'none';
      }
    }, 300); // Match transition duration
  }
  
  // Check if follow button is out of view (scrolled up)
  if (followBtnRect.bottom < 60 && followBtnRect.top < 0) { // Ensure it's actually scrolled out of view
    headerFollowBtn.style.display = 'block';
    // Slight delay to allow display to take effect before adding visible class
    setTimeout(() => {
      headerFollowBtn.classList.add('visible');
    }, 10);
  } else {
    headerFollowBtn.classList.remove('visible');
    // Hide after transition completes
    setTimeout(() => {
      if (!headerFollowBtn.classList.contains('visible')) {
        headerFollowBtn.style.display = 'none';
      }
    }, 300); // Match transition duration
  }
} 


// Updated JavaScript for sticky menu bar with fixed header

// Set the header height variable for CSS to use
function setHeaderHeight() {
  const header = document.querySelector('.file');
  if (header) {
    const headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  }
}

// Remove the existing handleProfileScroll function and replace with this
function handleProfileScroll() {
    const header = document.querySelector('.file');
    const eweDiv = document.querySelector('.ewe');
    const headerImg = document.querySelector('.frin');
    if (!header || !eweDiv || !headerImg) return;

    const headerHeight = header.offsetHeight;
    const scrollPosition = window.scrollY;
    const headerBottom = headerImg.getBoundingClientRect().bottom;

    // When header image scrolls out of view, fix the ewe div
    if (headerBottom <= headerHeight) {
        eweDiv.style.position = 'fixed';
        eweDiv.style.top = `${headerHeight}px`;
        eweDiv.style.bottom = 'auto';
    } else {
        eweDiv.style.position = 'sticky';
        eweDiv.style.top = 'auto';
        eweDiv.style.bottom = '0';
    }
}

// Updated setupScrollHandling
function setupScrollHandling() {
    window.removeEventListener('scroll', handleScroll); // Remove old listener
    window.removeEventListener('scroll', handleProfileScroll); // Prevent duplicates
    
    setHeaderHeight();
    initStickyMenu();
    
    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll(); // For header profile pic and follow button
                handleProfileScroll(); // For ewe div
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial check
    handleProfileScroll();
}

// Update showUserProfile
function showUserProfile(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    updateHeaderHTML(userId);

    const profileIreti = document.getElementById("ireti");
    profileIreti.innerHTML = `
        <img class="frin" src="${user.cover}">
        <div>
            <img class="kor" src="${user.avatar}">
        </div>
        <div class="klr">
            <!-- Existing content remains the same -->
        </div>
        <div class="ewe">
            <div class="yeb"><img class="dee" src="pics/apps.png"></div>
            <div class="yeb"><a href="Retail-Desktop-MyAccount-Storefront.html"><img class="dee" src="pics/browser.png"></a></div>
            <div class="yeb"><img class="dee" src="pics/bren.png"></div>
        </div>
        <div class="mansonro">
            <div class="masonri">
                <div class="column left-column"></div>
                <div class="column right-column"></div>
            </div>
        </div>
    `;
    
    switchPage("profile");
    renderUserPosts(userId);
    setupScrollHandling();
}

// Update showMyProfile
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
            <!-- Existing content remains the same -->
        </div>
        <div class="ewe">
            <div class="yeb"><img class="dee" src="pics/bren1.png"></div>
            <div class="yeb"><a href="javascript:void(0);"><img class="dee" src="pics/browser.png"></a></div>
            <div class="yeb"><img class="dee" src="pics/bren.png"></div>
        </div>
        <div class="mansonro">
            <div class="masonri">
                <div class="column left-column"></div>
                <div class="column right-column"></div>
            </div>
        </div>
    `;
    
    const wingDiv = document.querySelector(".wing");
    if (wingDiv) wingDiv.style.display = "block";
    
    currentProfileTab = "posts";
    initProfileNavigation();
    renderUserPosts(user.id);
    setupScrollHandling();
}

// Function to initialize the sticky behavior after the page loads
function initStickyMenu() {
  // Set header height CSS variable
  setHeaderHeight();
  
  // Store initial positions 
  const menuBar = document.querySelector('.ewe');
  if (menuBar) {
    // Get position relative to the document
    const rect = menuBar.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    menuBar.dataset.initialTop = rect.top;
    menuBar.dataset.initialOffset = rect.top + scrollTop;
  }
  
  // Handle window resize to update positions and header height
  window.addEventListener('resize', function() {
    setHeaderHeight();
    
    // Reset and recalculate positions
    const menuBar = document.querySelector('.ewe');
    if (menuBar) {
      menuBar.classList.remove('fixed');
      document.querySelector('.mansonro').style.paddingTop = '';
      
      // Get position again after reset
      const rect = menuBar.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      menuBar.dataset.initialTop = rect.top;
      menuBar.dataset.initialOffset = rect.top + scrollTop;
      
      // Check if it should be fixed based on current scroll
      handleProfileScroll();
    }
  });
}

// Set up optimized scroll handling
function setupScrollHandling() {
    window.removeEventListener('scroll', handleScroll); // Remove old listener
    window.removeEventListener('scroll', handleProfileScroll); // Prevent duplicates
    
    setHeaderHeight();
    initStickyMenu();
    
    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll(); // For header profile pic and follow button
                handleProfileScroll(); // For ewe div
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial check
    handleProfileScroll();
}


// Track current active tab in profile page
let currentProfileTab = "posts"; // Default tab: posts, comments, store

// Function to handle profile navigation
function switchProfileTab(tab) {
  // Don't do anything if we're already on that tab
  if (tab === currentProfileTab) return;
  
  const mansonro = document.querySelector('.mansonro');
  const appsIcon = document.querySelector('.ewe .yeb:nth-child(1) .dee');
  const browserIcon = document.querySelector('.ewe .yeb:nth-child(2) .dee');
  const storeIcon = document.querySelector('.ewe .yeb:nth-child(3) .dee');
  
  // Determine direction for animation (left or right)
  const tabOrder = ["posts", "comments", "store"];
  const currentIndex = tabOrder.indexOf(currentProfileTab);
  const newIndex = tabOrder.indexOf(tab);
  const direction = newIndex > currentIndex ? "left" : "right";
  
  // First, apply the sliding animation
  mansonro.style.transition = "transform 0.3s ease-out";
  mansonro.style.transform = `translateX(${direction === "left" ? "-" : ""}100%)`;
  
  // Reset all icons to default state
  appsIcon.src = "pics/bren1.png";
  browserIcon.src = "pics/browser.png";
  storeIcon.src = "pics/bren.png";
  
  // After animation completes, change content and slide back in
  setTimeout(() => {
    // Update icon states based on selected tab
    if (tab === "posts") {
      appsIcon.src = "pics/apps.png";
      renderProfilePosts();
    } else if (tab === "comments") {
      browserIcon.src = "pics/browser1.png";
      renderProfileComments();
    } else if (tab === "store") {
      storeIcon.src = "pics/bui.png";
      renderProfileStore();
    }
    
    // Slide from opposite direction
    mansonro.style.transform = `translateX(${direction === "left" ? "" : "-"}100%)`;
    
    // Then immediately remove transition and reset transform to create appearance of new content
    setTimeout(() => {
      mansonro.style.transition = "none";
      mansonro.style.transform = "translateX(0)";
      
      // Re-enable smooth transition for next time
      setTimeout(() => {
        mansonro.style.transition = "transform 0.3s ease-out";
      }, 50);
    }, 20);
    
    // Update current tab
    currentProfileTab = tab;
  }, 300); // Match this to transition duration
}

// Content rendering functions for each tab
function renderProfilePosts() {
  const mansonro = document.querySelector('.mansonro');
  mansonro.innerHTML = `
    <div class="masonri">
      <div class="column left-column"></div>
      <div class="column right-column"></div>
    </div>
  `;
  
  // Get user ID
  const userIdElement = document.querySelector('.klr');
  if (!userIdElement) return;
  
  // Try to find a matching user based on username in the profile
  const usernameElement = document.querySelector('.spe');
  if (!usernameElement) return;
  
  const username = usernameElement.textContent;
  const user = users.find(u => u.username === username) || loggedInUser;
  
  if (user) {
    renderUserPosts(user.id);
  }
}

function renderProfileComments() {
  const mansonro = document.querySelector('.mansonro');
  mansonro.innerHTML = `
    <div class="comments-container">
      <div class="comments-header">
        <h3>Your Comments</h3>
      </div>
      <div class="empty-comments">
        <img src="pics/empty-comments.png" alt="No comments">
        <p>You haven't commented on any posts yet</p>
      </div>
    </div>
  `;
}

function renderProfileStore() {
  const mansonro = document.querySelector('.mansonro');
  mansonro.innerHTML = `
    <div class="store-container">
      <div class="store-header">
        <h3>Your Store</h3>
        <button class="add-product-btn">+ Add Product</button>
      </div>
      <div class="empty-store">
        <img src="pics/tel.png" alt="Empty store">
        <p>Your store is empty</p>
        <p class="store-subtitle">Add products to start selling</p>
      </div>
    </div>
  `;
}

// Function to initialize profile navigation
function initProfileNavigation() {
  const eweDiv = document.querySelector('.ewe');
  if (!eweDiv) return;
  
  // Remove existing event listeners to prevent duplicates
  const newEweDiv = eweDiv.cloneNode(true);
  eweDiv.parentNode.replaceChild(newEweDiv, eweDiv);
  
  // Get the icons within the new div
  const icons = newEweDiv.querySelectorAll('.yeb');
  
  // Add event listeners to each icon
  icons[0].addEventListener('click', () => switchProfileTab('posts'));
  icons[1].addEventListener('click', () => switchProfileTab('comments'));
  icons[2].addEventListener('click', () => switchProfileTab('store'));
  
  // Default is posts tab active
  icons[0].querySelector('.dee').src = "pics/apps.png";
  
  // Handle back button behavior
  window.addEventListener('popstate', handleBackButtonForProfile);
}

// Custom back button handling for profile
function handleBackButtonForProfile(event) {
  if (document.getElementById('profile').classList.contains('active')) {
    // If we're on a tab other than posts, go back to posts first
    if (currentProfileTab !== "posts") {
      event.preventDefault();
      history.pushState({ page: "profile", profileTab: "posts" }, "", "#profile");
      switchProfileTab("posts");
    }
    // Otherwise, the normal back behavior (to food page) will happen
  }
}

// Enhanced showMyProfile or showUserProfile function to initialize tabs

// Override the original switchPage function to handle profile tabs
const originalSwitchPage = switchPage;
switchPage = function(pageId) {
  if (pageId === "profile") {
    // Save current tab in history when navigating to profile
    const historyState = { page: pageId, profileTab: currentProfileTab || "posts" };
    history.replaceState(historyState, "", `#${pageId}`);
  }
  
  // Call the original function
  originalSwitchPage(pageId);
  
  // If navigating to profile, initialize the navigation
  if (pageId === "profile") {
    setTimeout(initProfileNavigation, 100);
  }
};

// Add CSS for the new tabs
function addProfileTabsCSS() {
  if (!document.getElementById('profile-tabs-styles')) {
    const styles = document.createElement('style');
    styles.id = 'profile-tabs-styles';
    styles.textContent = `
      .comments-container, .store-container {
        padding: 15px;
      }
      
      .comments-header, .store-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .empty-comments, .empty-store {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 40px 20px;
        background-color: #f8f8f8;
        border-radius: 8px;
      }
      
      .empty-comments img, .empty-store img {
        width: 80px;
        height: 80px;
        margin-bottom: 15px;
        opacity: 0.5;
      }
      
      .add-product-btn {
        background-color: #F4074E;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .store-subtitle {
        margin-top: 5px;
        color: #777;
        font-size: 0.9em;
      }
      
      .mansonro {
        overflow: hidden;
        position: relative;
      }
    `;
    document.head.appendChild(styles);
  }
}

// Call this when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  addProfileTabsCSS();
});
