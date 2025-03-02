// Variable to track scroll position
let lastScrollPos = 0;

// Function to add necessary elements to the header
function updateHeaderHTML() {
  const header = document.querySelector('.heado');
  
  // Check if we already added our elements to avoid duplicates
  if (!document.querySelector('.header-profile-pic')) {
    // Create profile picture container for header
    const profilePicContainer = document.createElement('div');
    profilePicContainer.className = 'header-profile-pic';
    profilePicContainer.style.display = 'none'; // Hidden by default
    profilePicContainer.innerHTML = '<img class="header-avatar" src="" alt="Profile">';
    
    // Create follow button for header
    const followBtnContainer = document.createElement('div');
    followBtnContainer.className = 'header-follow-btn';
    followBtnContainer.style.display = 'none'; // Hidden by default
    followBtnContainer.innerHTML = '<button class="header-follow">Follow</button>';
    
    // Add them to the header
    header.appendChild(profilePicContainer);
    header.appendChild(followBtnContainer);
  }
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
