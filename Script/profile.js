
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
  const user = users.find(u => u.id === userId);
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

function handlesScroll() {
  const header = document.querySelector('.file');
  const menuBar = document.querySelector('.ewe');
  const userInfo = document.querySelector('.klr');
  
  if (!menuBar || !header) return;
  
  // Get the initial position of the menu bar if not already stored
  if (!menuBar.dataset.initialTop) {
    menuBar.dataset.initialTop = menuBar.getBoundingClientRect().top;
    menuBar.dataset.initialOffset = menuBar.offsetTop;
  }
  
  const headerHeight = header.offsetHeight;
  const scrollPosition = window.scrollY;
  const menuInitialOffset = parseInt(menuBar.dataset.initialOffset, 10);
  
  // Check if we've scrolled past the point where the menu should stick
  if (scrollPosition > menuInitialOffset - headerHeight) {
    if (!menuBar.classList.contains('fixed')) {
      menuBar.classList.add('fixed');
      // Add padding to the content below to prevent jumps
      const menuHeight = menuBar.offsetHeight + 10;
      document.querySelector('.mansonro').style.paddingTop = `${menuHeight}px`;
    }
  } else {
    if (menuBar.classList.contains('fixed')) {
      menuBar.classList.remove('fixed');
      document.querySelector('.mansonro').style.paddingTop = '';
    }
  }
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
      handlesScroll();
    }
  });
}

// Set up optimized scroll handling
function setupScrollHandling() {
  // Remove any existing scroll listener to prevent duplicates
  window.removeEventListener('scroll', handlesScroll);
  
  // Initialize sticky menu properties
  initStickyMenu();
  
  // Add the scroll event listener with throttling for better performance
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        handlesScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Initial check
  handlesScroll();
}