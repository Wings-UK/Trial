



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
