// Define the setupReactions function to replace the existing one
function setupReactions() {
  const posts = document.querySelectorAll('.poster');
  
  posts.forEach(post => {
    // Remove existing reaction system
    const existingReaction = post.querySelector('.reaction');
    if (existingReaction) {
      existingReaction.remove();
    }
    
    // Create new reaction container
    const reactionContainer = document.createElement('div');
    reactionContainer.className = 'reaction';
    
    // Initialize reactions data for this post
    const postId = post.getAttribute('data-post-id');
    
    // If there's no stored reactions for this post, initialize empty state
    if (!window.postReactions) {
      window.postReactions = {};
    }
    
    if (!window.postReactions[postId]) {
      window.postReactions[postId] = {
        reactions: [],
        userReaction: null
      };
    }
    
    // Generate the new reaction HTML structure
    reactionContainer.innerHTML = `
      <div class="reaction-system">
        <div class="reaction-emojis"></div>
        <div class="reaction-plus">
          <img src="pics/plu.png" alt="Add Reaction">
        </div>
        <div class="reaction-popup">
          <div class="popup-content">
            <div class="reaction-option" data-emoji="love">
              <img src="pics/21[1].png" alt="Love">
            </div>
            <div class="reaction-option" data-emoji="like">
              <img src="pics/lovv.png" alt="Like">
            </div>
            <div class="reaction-option" data-emoji="laugh">
              <img src="pics/laugh.png" alt="Laugh">
            </div>
            <div class="reaction-option" data-emoji="wow">
              <img src="pics/wow.png" alt="Wow">
            </div>
            <div class="reaction-option" data-emoji="sad">
              <img src="pics/sad.png" alt="Sad">
            </div>
            <div class="reaction-option" data-emoji="angry">
              <img src="pics/angry.gif" alt="Angry">
            </div>
            <div class="reaction-option" data-emoji="fire">
              <img src="pics/fire.png" alt="Fire">
            </div>
            <div class="reaction-option" data-emoji="clap">
              <img src="pics/clap.png" alt="Clap">
            </div>
          </div>
        </div>
      </div>
      <div class="wish1">
        <img class="twito" src="pics/twito.png">
      </div>
    `;
    
    // Append new reaction system to the post
    post.appendChild(reactionContainer);
    
    // Get references to elements
    const reactionPlus = reactionContainer.querySelector('.reaction-plus');
    const reactionPopup = reactionContainer.querySelector('.reaction-popup');
    const reactionEmojis = reactionContainer.querySelector('.reaction-emojis');
    const reactionOptions = reactionContainer.querySelectorAll('.reaction-option');
    
    // Setup reaction plus button
    reactionPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      reactionPopup.classList.toggle('active');
      
      // Add animation to popup
      reactionPopup.style.animation = 'popupFadeIn 0.3s forwards';
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', () => {
      reactionPopup.classList.remove('active');
    });
    
    // Prevent popup from closing when clicking inside it
    reactionPopup.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Setup reaction options
    reactionOptions.forEach(option => {
      option.addEventListener('click', () => {
        const emoji = option.getAttribute('data-emoji');
        const emojiImg = option.querySelector('img').src;
        
        handleReaction(postId, emoji, emojiImg, reactionEmojis, reactionPopup);
      });
    });
    
    // Initialize existing reactions if any
    updateReactionDisplay(postId, reactionEmojis);
  });
}

// Function to handle a reaction click
function handleReaction(postId, emoji, emojiImg, reactionEmojis, reactionPopup) {
  // Get the current state for this post
  const postData = window.postReactions[postId];
  
  // Check if user already reacted with this emoji
  const existingReaction = postData.userReaction === emoji;
  
  // If user had a previous different reaction, remove it
  if (postData.userReaction && postData.userReaction !== emoji) {
    // Find and decrease count of previous reaction
    const prevReactionIndex = postData.reactions.findIndex(r => r.emoji === postData.userReaction);
    if (prevReactionIndex !== -1) {
      postData.reactions[prevReactionIndex].count--;
      
      // If count reaches 0, remove this reaction
      if (postData.reactions[prevReactionIndex].count === 0) {
        postData.reactions.splice(prevReactionIndex, 1);
      }
    }
  }
  
  // Handle the current reaction
  if (existingReaction) {
    // User is un-reacting
    const index = postData.reactions.findIndex(r => r.emoji === emoji);
    if (index !== -1) {
      postData.reactions[index].count--;
      
      // If count reaches 0, remove this reaction
      if (postData.reactions[index].count === 0) {
        postData.reactions.splice(index, 1);
      }
    }
    
    // Clear user's reaction
    postData.userReaction = null;
  } else {
    // User is adding or changing reaction
    const index = postData.reactions.findIndex(r => r.emoji === emoji);
    if (index !== -1) {
      // Increment existing reaction
      postData.reactions[index].count++;
    } else {
      // Add new reaction
      postData.reactions.push({
        emoji: emoji,
        img: emojiImg,
        count: 1
      });
    }
    
    // Set user's reaction
    postData.userReaction = emoji;
  }
  
  // Sort reactions by count (highest first)
  postData.reactions.sort((a, b) => b.count - a.count);
  
  // Keep only top 3 reactions
  if (postData.reactions.length > 3) {
    postData.reactions = postData.reactions.slice(0, 3);
  }
  
  // Update the display
  updateReactionDisplay(postId, reactionEmojis);
  
  // Close the popup with animation
  reactionPopup.classList.remove('active');
}

// Function to update the reaction display
function updateReactionDisplay(postId, reactionEmojis) {
  const postData = window.postReactions[postId];
  
  // Clear current display
  reactionEmojis.innerHTML = '';
  
  // Show top 3 reactions (or fewer if there aren't 3)
  postData.reactions.forEach(reaction => {
    const isUserReaction = reaction.emoji === postData.userReaction;
    
    const emojiElement = document.createElement('div');
    emojiElement.className = `reaction-emoji ${isUserReaction ? 'user-reacted' : ''}`;
    emojiElement.setAttribute('data-emoji', reaction.emoji);
    
    emojiElement.innerHTML = `
      <div class="emoji-img">
        <img src="${reaction.img}" alt="${reaction.emoji}">
      </div>
      <div class="emoji-count">${reaction.count}</div>
    `;
    
    // Add click handler to the emoji
    emojiElement.addEventListener('click', () => {
      const emoji = reaction.emoji;
      
      // Find the parent reaction container
      const reactionContainer = emojiElement.closest('.reaction');
      const reactionEmojis = reactionContainer.querySelector('.reaction-emojis');
      const reactionPopup = reactionContainer.querySelector('.reaction-popup');
      
      // Handle the click
      handleReaction(postId, emoji, reaction.img, reactionEmojis, reactionPopup);
      
      // Add click animation
      emojiElement.classList.add('clicked');
      setTimeout(() => {
        emojiElement.classList.remove('clicked');
      }, 300);
    });
    
    reactionEmojis.appendChild(emojiElement);
  });
}

// Add CSS for the reaction system
function addReactionStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Reaction System Styles */
    .reaction {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      margin-top: 10px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .reaction-system {
      display: flex;
      align-items: center;
      position: relative;
    }
    
    .reaction-emojis {
      display: flex;
      align-items: center;
    }
    
    .reaction-emoji {
      display: flex;
      align-items: center;
      margin-right: 12px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .reaction-emoji:hover {
      transform: scale(1.1);
    }
    
    .reaction-emoji.clicked {
      animation: pulse 0.3s ease;
    }
    
    .reaction-emoji.user-reacted {
      position: relative;
    }
    
    .reaction-emoji.user-reacted::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background-color: #2F80ED;
      border-radius: 2px;
    }
    
    .emoji-img {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .emoji-img img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    .emoji-count {
      font-size: 12px;
      color: #555;
      margin-left: 4px;
    }
    
    .reaction-plus {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .reaction-plus:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .reaction-plus img {
      width: 16px;
      height: 16px;
    }
    
    .reaction-popup {
      position: absolute;
      bottom: 40px;
      left: 0;
      background-color: #fff;
      border-radius: 36px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 10px;
      display: none;
      z-index: 10;
    }
    
    .reaction-popup.active {
      display: block;
    }
    
    .popup-content {
      display: flex;
      align-items: center;
    }
    
    .reaction-option {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 4px;
      cursor: pointer;
      border-radius: 50%;
      transition: transform 0.2s ease;
    }
    
    .reaction-option:hover {
      transform: scale(1.2) translateY(-5px);
    }
    
    .reaction-option img {
      width: 24px;
      height: 24px;
    }
    
    @keyframes popupFadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
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
  `;
  
  document.head.appendChild(styleElement);
}

// Call this function to inject the CSS
addReactionStyles();

// Initialize the setup during page load
document.addEventListener('DOMContentLoaded', () => {
  // Setup initial reactions
  setupReactions();
  
  // Re-setup reactions whenever the posts are refreshed
  const originalRenderHomepage = window.renderHomepage;
  if (originalRenderHomepage) {
    window.renderHomepage = function() {
      originalRenderHomepage.apply(this, arguments);
      setupReactions();
    };
  }
});