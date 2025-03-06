// Initialize the reaction system
function setupReactions() {
  const posts = document.querySelectorAll('.poster');
  
  posts.forEach(post => {
    const reactionContainer = post.querySelector('.reaction');
    if (!reactionContainer) return;
    
    // Replace the current reaction system with the new one
    const newReactionHTML = `
      <div class="lovi">
        <div class="emoji-reaction-container">
          <!-- Initially empty, will be populated dynamically -->
        </div>
        
        <div class="share1 emoji-plus-btn">
          <div class="plus-button-wrapper">
            <img class="sharo" src="pics/plu.png" alt="Add Reaction">
          </div>
        </div>
      </div>
      <div class="wish1">
        <img class="twito" src="pics/twito.png" alt="Retweet">
      </div>
    `;
    
    reactionContainer.innerHTML = newReactionHTML;
    
    // Create and prepare the emoji popup
    createEmojiPopup(post);
    
    // Set up event listeners
    initReactionEvents(post);
  });
  
  // Add CSS for the new reaction system
  addReactionStyles();
}

// Create the emoji popup for each post
function createEmojiPopup(post) {
  // Check if popup already exists
  if (post.querySelector('.emoji-popup')) return;
  
  const popupHTML = `
    <div class="emoji-popup">
      <div class="emoji-popup-content">
        <div class="emoji-item" data-emoji="love" data-icon="pics/21[1].png" data-animated="pics/2.gif">
          <img src="pics/21[1].png" alt="Love">
        </div>
        <div class="emoji-item" data-emoji="like" data-icon="pics/lovv.png" data-animated="pics/lovv.png">
          <img src="pics/lovv.png" alt="Like">
        </div>
        <div class="emoji-item" data-emoji="laugh" data-icon="pics/laugh.png" data-animated="pics/laugh.gif">
          <img src="pics/laugh.png" alt="Laugh">
        </div>
        <div class="emoji-item" data-emoji="surprise" data-icon="pics/surprise.png" data-animated="pics/surprise.gif">
          <img src="pics/surprise.png" alt="Surprise">
        </div>
        <div class="emoji-item" data-emoji="sad" data-icon="pics/sad.png" data-animated="pics/sad.gif">
          <img src="pics/sad.png" alt="Sad">
        </div>
        <div class="emoji-item" data-emoji="angry" data-icon="pics/angry.gif" data-animated="pics/angr.gif">
          <img src="pics/angry.gif" alt="Angry">
        </div>
        <div class="emoji-item" data-emoji="fire" data-icon="pics/fire.png" data-animated="pics/fire.gif">
          <img src="pics/fire.png" alt="Fire">
        </div>
        <div class="emoji-item" data-emoji="clap" data-icon="pics/clap.png" data-animated="pics/clap.gif">
          <img src="pics/clap.png" alt="Clap">
        </div>
      </div>
    </div>
  `;
  
  post.querySelector('.reaction').insertAdjacentHTML('beforeend', popupHTML);
}

// Initialize reaction events for a post
function initReactionEvents(post) {
  const postId = post.dataset.postId;
  const plusButton = post.querySelector('.emoji-plus-btn');
  const emojiPopup = post.querySelector('.emoji-popup');
  const emojiReactionContainer = post.querySelector('.emoji-reaction-container');
  
  // Get or initialize post reaction data
  if (!window.postReactions) window.postReactions = {};
  if (!window.postReactions[postId]) {
    window.postReactions[postId] = {
      reactions: {},
      userReaction: null
    };
  }
  
  // Plus button click event
  plusButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleEmojiPopup(post);
  });
  
  // Set up emoji item click events
  const emojiItems = post.querySelectorAll('.emoji-item');
  emojiItems.forEach(emojiItem => {
    emojiItem.addEventListener('click', (e) => {
      e.stopPropagation();
      const emoji = emojiItem.dataset.emoji;
      const iconPath = emojiItem.dataset.icon;
      const animatedPath = emojiItem.dataset.animated;
      
      handleEmojiSelection(post, emoji, iconPath, animatedPath);
      toggleEmojiPopup(post, false); // Hide popup after selection
    });
  });
  
  // Close popup when clicking elsewhere
  document.addEventListener('click', () => {
    toggleEmojiPopup(post, false);
  });
  
  // Prevent popup closing when clicking inside it
  emojiPopup.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Initial rendering of reactions
  renderReactions(post);
}

// Toggle the emoji popup visibility
function toggleEmojiPopup(post, forceState = null) {
  const popup = post.querySelector('.emoji-popup');
  const isVisible = popup.classList.contains('active');
  
  // Determine the new state
  const newState = forceState !== null ? forceState : !isVisible;
  
  // Close all popups first
  document.querySelectorAll('.emoji-popup').forEach(p => {
    p.classList.remove('active');
  });
  
  // Set the new state for this popup
  if (newState) {
    popup.classList.add('active');
  } else {
    popup.classList.remove('active');
  }
}

// Handle emoji selection
function handleEmojiSelection(post, emoji, iconPath, animatedPath) {
  const postId = post.dataset.postId;
  const postData = window.postReactions[postId];
  const previousReaction = postData.userReaction;
  
  // If user already selected this emoji, toggle it off
  if (previousReaction === emoji) {
    postData.userReaction = null;
    if (postData.reactions[emoji]) {
      postData.reactions[emoji]--;
      if (postData.reactions[emoji] <= 0) {
        delete postData.reactions[emoji];
      }
    }
  } else {
    // If user had a previous reaction, remove it
    if (previousReaction && postData.reactions[previousReaction]) {
      postData.reactions[previousReaction]--;
      if (postData.reactions[previousReaction] <= 0) {
        delete postData.reactions[previousReaction];
      }
    }
    
    // Add the new reaction
    postData.userReaction = emoji;
    if (!postData.reactions[emoji]) postData.reactions[emoji] = 0;
    postData.reactions[emoji]++;
  }
  
  // Re-render the reactions
  renderReactions(post);
  
  // Show animation for the selected emoji
  if (postData.userReaction) {
    animateEmojiReaction(post, emoji);
  }
}

// Render the current reactions for a post
function renderReactions(post) {
  const postId = post.dataset.postId;
  const postData = window.postReactions[postId];
  const container = post.querySelector('.emoji-reaction-container');
  
  // Clear the container
  container.innerHTML = '';
  
  // Sort reactions by count (descending)
  const sortedReactions = Object.entries(postData.reactions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Only show top 3
  
  // If no reactions, container stays empty
  if (sortedReactions.length === 0) return;
  
  // Create elements for each reaction
  sortedReactions.forEach(([emoji, count]) => {
    // Find the emoji item to get its paths
    const emojiItem = post.querySelector(`.emoji-item[data-emoji="${emoji}"]`);
    if (!emojiItem) return;
    
    const iconPath = emojiItem.dataset.icon;
    const animatedPath = emojiItem.dataset.animated;
    const isSelected = postData.userReaction === emoji;
    
    const emojiElement = document.createElement('div');
    emojiElement.className = `emoji-display ${isSelected ? 'selected' : ''}`;
    emojiElement.dataset.emoji = emoji;
    emojiElement.innerHTML = `
      <div class="emoji-image-wrapper">
        <img src="${iconPath}" alt="${emoji}" class="emoji-image" data-static="${iconPath}" data-animated="${animatedPath}">
      </div>
      <div class="emoji-display-count">${count}</div>
    `;
    
    // Add click event to toggle this emoji
    emojiElement.addEventListener('click', (e) => {
      e.stopPropagation();
      const clickedEmoji = emoji;
      const iconPath = emojiItem.dataset.icon;
      const animatedPath = emojiItem.dataset.animated;
      
      handleEmojiSelection(post, clickedEmoji, iconPath, animatedPath);
    });
    
    container.appendChild(emojiElement);
  });
}

// Animate an emoji reaction
function animateEmojiReaction(post, emoji) {
  const emojiDisplay = post.querySelector(`.emoji-display[data-emoji="${emoji}"]`);
  if (!emojiDisplay) return;
  
  // Add pulse animation class
  emojiDisplay.classList.add('pulse');
  
  // Replace static image with animated one
  const imgElement = emojiDisplay.querySelector('.emoji-image');
  const animatedSrc = imgElement.dataset.animated;
  const staticSrc = imgElement.dataset.static;
  const originalSrc = imgElement.src;
  
  // Play the animation
  imgElement.src = animatedSrc;
  
  // Remove the animation class and reset the image after animation completes
  setTimeout(() => {
    emojiDisplay.classList.remove('pulse');
    // Only reset to static if it's not the current user's reaction
    const postId = post.dataset.postId;
    const postData = window.postReactions[postId];
    if (postData.userReaction !== emoji) {
      imgElement.src = staticSrc;
    }
  }, 1000);
}

// Add CSS styles for the reaction system
function addReactionStyles() {
  // Check if styles are already added
  if (document.getElementById('reaction-styles')) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'reaction-styles';
  styleElement.textContent = `
    /* Reaction Container */
    .emoji-reaction-container {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 36px;
    }
    
    /* Emoji Display */
    .emoji-display {
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 4px 8px 4px 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      opacity: 0.85;
    }
    
    .emoji-display:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
      opacity: 1;
    }
    
    .emoji-display.selected {
      background-color: rgba(29, 161, 242, 0.2);
      opacity: 1;
    }
    
    .emoji-image-wrapper {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .emoji-image {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }
    
    .emoji-display-count {
      margin-left: 4px;
      font-size: 13px;
      color: #ffffff;
      font-weight: 500;
    }
    
    /* Plus Button */
    .plus-button-wrapper {
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .plus-button-wrapper:hover {
      transform: scale(1.1);
    }
    
    /* Emoji Popup */
    .emoji-popup {
      position: absolute;
      bottom: 60px;
      left: 10px;
      background-color: #292f33;
      border-radius: 24px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
      padding: 8px;
      z-index: 100;
      display: none;
      transform-origin: bottom left;
      transform: scale(0.8);
      opacity: 0;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .emoji-popup.active {
      display: block;
      transform: scale(1);
      opacity: 1;
    }
    
    .emoji-popup-content {
      display: flex;
      gap: 8px;
    }
    
    .emoji-item {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s ease, background-color 0.2s ease;
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .emoji-item:hover {
      transform: scale(1.2);
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .emoji-item img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
    
    /* Animation */
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }
    
    .pulse {
      animation: pulse 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    /* Transition for position changes */
    .emoji-reaction-container {
      transition: all 0.3s ease;
    }
    
    .emoji-reaction-container > * {
      transition: all 0.3s ease;
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  setupReactions();
});

// Update the renderHomepage function to include setupReactions
