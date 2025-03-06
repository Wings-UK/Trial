// First, let's create the new reaction system functions

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
  const loveButtons = document.querySelectorAll('.love-button');
  
  loveButtons.forEach(button => {
    // Remove existing event listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Add new event listener
    newButton.addEventListener('click', handleLoveReaction);
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
  
  // Toggle active state
  if (isActive) {
    // Unlike - remove one from count
    countElement.textContent = currentCount - 1;
    button.setAttribute('data-active', 'false');
    
    // Reset heart to unfilled state with GSAP
    gsap.to(heartPath, {
      fill: 'none',
      stroke: 'currentColor',
      duration: 0.3,
      ease: "power2.out"
    });
    
  } else {
    // Like - add one to count
    countElement.textContent = currentCount + 1;
    button.setAttribute('data-active', 'true');
    
    // Create heart filling animation with GSAP
    // First ensure the stroke is set properly
    gsap.set(heartPath, {
      stroke: 'rgb(244, 7, 82)'
    });
    
    // Create the filling animation
    gsap.to(heartPath, {
      fill: 'rgb(244, 7, 82)',
      duration: 0.4,
      ease: "elastic.out(1, 0.3)"
    });
    
    // Create a scale animation for the heart
    gsap.timeline()
      .to(button.querySelector('.heart-icon'), {
        scale: 1.5,
        duration: 0.2,
        ease: "back.out(1.7)"
      })
      .to(button.querySelector('.heart-icon'), {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
      
    // Add particle burst effect for a more satisfying reaction
    createHeartBurst(button);
  }
}

// Create heart burst particles effect
function createHeartBurst(button) {
  // Get button position for particles origin
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  // Create particle container if it doesn't exist
  let particleContainer = document.querySelector('.reaction-particles');
  if (!particleContainer) {
    particleContainer = document.createElement('div');
    particleContainer.className = 'reaction-particles';
    document.body.appendChild(particleContainer);
  }
  
  // Create particles
  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'love-particle';
    particle.innerHTML = `
      <svg width="10" height="10" viewBox="0 0 24 24" fill="rgb(244, 7, 82)" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;
    
    particleContainer.appendChild(particle);
    
    // Set initial position
    gsap.set(particle, {
      x: x,
      y: y,
      scale: 0,
      opacity: 1
    });
    
    // Random angle for particle movement (in radians)
    const angle = (Math.PI * 2) * (i / particleCount);
    
    // Create the animation
    gsap.timeline()
      .to(particle, {
        x: x + Math.cos(angle) * (40 + Math.random() * 20),
        y: y + Math.sin(angle) * (40 + Math.random() * 20),
        scale: 0.6 + Math.random() * 0.6,
        opacity: 1,
        duration: 0.3 + Math.random() * 0.3,
        ease: "power2.out"
      })
      .to(particle, {
        opacity: 0,
        scale: 0,
        duration: 0.3 + Math.random() * 0.3,
        delay: 0.1 + Math.random() * 0.2,
        onComplete: () => {
          particle.remove();
        }
      });
  }
}

// Handle other reactions (comment, repost, donate)
function handleOtherReaction(type) {
  // Show appropriate dialog or action for each reaction type
  switch(type) {
    case 'comment':
      // Scroll to comment section or open comment dialog
      alert('Comment feature would open here');
      break;
    case 'repost':
      // Open repost dialog
      alert('Repost dialog would open here');
      break;
    case 'donate':
      // Open donation dialog
      alert('Donation options would open here');
      break;
  }
}

// Add styles for the new reaction system
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
      
      .reaction-button svg {
        margin-right: 5px;
      }
      
      .reaction-count {
        font-size: 14px;
        color: #555;
      }
      
      .love-button[data-active="true"] {
        color: rgb(244, 7, 82);
      }
      
      .love-button[data-active="true"] .reaction-count {
        color: rgb(244, 7, 82);
      }
      
      .heart-icon {
        overflow: visible;
      }
      
      /* Particle styles */
      .reaction-particles {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
      }
      
      .love-particle {
        position: absolute;
        pointer-events: none;
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// Initialize everything when the page loads
function initializeReactions() {
  // Add the required GSAP library if not already loaded
  if (typeof gsap === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
    script.onload = () => {
      // GSAP loaded, now initialize our reactions
      addReactionStyles();
      initializeReactionSystem();
    };
    document.head.appendChild(script);
  } else {
    // GSAP already loaded
    addReactionStyles();
    initializeReactionSystem();
  }
}

// Add a function to update the reaction system after rendering posts
function updateReactionSystem() {
  // Call this after rendering posts to ensure all reactions are properly initialized
  setTimeout(() => {
    initializeReactionSystem();
  }, 100);
}

// Modify the renderHomepage function to include the reaction system initialization
const originalRenderHomepage = renderHomepage;
renderHomepage = function() {
  originalRenderHomepage();
  updateReactionSystem();
};

// Update showDetail to initialize reactions in the detail view
const originalShowDetail = showDetail;
showDetail = function(postId) {
  originalShowDetail(postId);
  setTimeout(() => {
    // Apply reaction system to the detail view as well
    const detailReaction = document.querySelector('#meal .reaction');
    if (detailReaction) {
      detailReaction.innerHTML = createReactionHTML(postId);
      attachReactionListeners();
    }
  }, 100);
};

// Initialize reactions when the document is ready
document.addEventListener('DOMContentLoaded', initializeReactions);
