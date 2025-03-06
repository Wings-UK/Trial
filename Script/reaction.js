// Initialize reaction system for all posts
function initializeReactionSystem() {
  // Remove old reaction system elements
  document.querySelectorAll('.reaction').forEach(oldReaction => {
    const postElement = oldReaction.closest('.poster');
    if (postElement) {
      const postId = postElement.getAttribute('data-post-id');
      if (postId) {
        // Replace with new reaction system
        oldReaction.innerHTML = createReactionHTML(postId);
      }
    }
  });

  // Attach event listeners to all new reaction buttons
  attachReactionListeners();
}

// Create HTML for the new reaction system
function createReactionHTML(postId) {
  return `
    <div class="reaction-container" data-post-id="${postId}">
      <div class="reaction-button love-button" data-reaction="love" data-active="false">
        <svg class="heart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <span class="reaction-count">${Math.floor(Math.random() * 500) + 50}</span>
      </div>
      <div class="reaction-button comment-button" data-reaction="comment">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" 
            stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <span class="reaction-count">${Math.floor(Math.random() * 100) + 10}</span>
      </div>
      <div class="reaction-button repost-button" data-reaction="repost">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 17l-5-5 5-5M17 7l5 5-5 5M14 3l-4 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
        <span class="reaction-count">${Math.floor(Math.random() * 50) + 5}</span>
      </div>
      <div class="reaction-button donate-button" data-reaction="donate">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" 
            stroke="currentColor" stroke-width="1" fill="none"/>
          <path d="M12 7v6M12 15v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="reaction-count">${Math.floor(Math.random() * 20)}</span>
      </div>
    </div>
  `;
}

// Attach event listeners to reaction buttons
function attachReactionListeners() {
  // Get all love reaction buttons
  document.querySelectorAll('.love-button').forEach(button => {
    button.addEventListener('click', handleLoveReaction);
  });

  // Add listeners for other reaction buttons
  document.querySelectorAll('.comment-button').forEach(button => {
    button.addEventListener('click', () => handleOtherReaction('comment'));
  });

  document.querySelectorAll('.repost-button').forEach(button => {
    button.addEventListener('click', () => handleOtherReaction('repost'));
  });

  document.querySelectorAll('.donate-button').forEach(button => {
    button.addEventListener('click', () => handleOtherReaction('donate'));
  });
}

// Handle love reaction with GSAP animation
function handleLoveReaction(event) {
  const button = event.currentTarget;
  const isActive = button.getAttribute('data-active') === 'true';
  const countElement = button.querySelector('.reaction-count');
  const heartPath = button.querySelector('.heart-path');
  const currentCount = parseInt(countElement.textContent);

  if (isActive) {
    countElement.textContent = currentCount - 1;
    button.setAttribute('data-active', 'false');
    gsap.to(heartPath, { fill: 'none', stroke: 'currentColor', duration: 0.3 });
  } else {
    countElement.textContent = currentCount + 1;
    button.setAttribute('data-active', 'true');
    gsap.to(heartPath, { fill: 'rgb(244, 7, 82)', duration: 0.4 });
  }
}

// Handle other reactions (comment, repost, donate)
function handleOtherReaction(type) {
  switch(type) {
    case 'comment':
      alert('Comment feature would open here');
      break;
    case 'repost':
      alert('Repost dialog would open here');
      break;
    case 'donate':
      alert('Donation options would open here');
      break;
  }
}

// Add styles for the reaction system
function addReactionStyles() {
  if (!document.getElementById('reaction-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'reaction-styles';
    styleElement.textContent = `
      .reaction-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        width: 100%;
      }
      .reaction-button {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 20px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .reaction-button:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      .reaction-count {
        font-size: 14px;
        color: #555;
      }
      .love-button[data-active="true"] {
        color: rgb(244, 7, 82);
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// Call this manually inside `renderHomepage()`
function setupReactions() {
  addReactionStyles();
  initializeReactionSystem();
}