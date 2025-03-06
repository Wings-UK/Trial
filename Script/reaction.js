// Function to setup the Instagram-like heart reaction system
function setupHeartReactionSystem() {
  // 1. Add the CSS styles to the document head
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Heart reaction system styles */
    :root {
      --heart-color: rgb(244, 7, 82);
      --heart-empty-color: #888;
      --animation-duration: 0.5s;
    }

    @media (prefers-color-scheme: dark) {
      .heart-container .heart-path {
        stroke: #fafafa;
      }
    }

    /* Heart styles and animations */
    .heart-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      position: relative;
    }

    .heart-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .heart-icon {
      cursor: pointer;
      width: 28px;
      height: 28px;
      transform-origin: center;
      margin-right: 8px;
    }

    .heart-path {
      fill: transparent;
      stroke: var(--heart-empty-color);
      stroke-width: 2;
      transition: fill 0.2s;
    }

    .heart-container[data-liked="true"] .heart-path {
      fill: var(--heart-color);
      stroke: var(--heart-color);
    }

    .heart-count {
      font-size: 14px;
      font-weight: 600;
      color: #555;
      margin-left: 4px;
    }

    @media (prefers-color-scheme: dark) {
      .heart-count {
        color: #eee;
      }
    }

    /* Heart Animation Classes */
    @keyframes heartBeat {
      0% {
        transform: scale(1);
      }
      15% {
        transform: scale(1.3);
      }
      30% {
        transform: scale(0.95);
      }
      45% {
        transform: scale(1.2);
      }
      60% {
        transform: scale(0.95);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes heartUnlike {
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

    .heart-beat {
      animation: heartBeat var(--animation-duration) cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    .heart-unlike {
      animation: heartUnlike 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    /* Count animation */
    @keyframes countPop {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.3);
      }
      100% {
        transform: scale(1);
      }
    }

    .count-pop {
      animation: countPop 0.3s forwards;
    }

    /* Double-tap heart animation */
    .tap-heart {
      position: fixed;
      z-index: 9999;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      pointer-events: none;
    }
  `;
  document.head.appendChild(styleElement);

  // 2. Global object to track liked posts
  window.likedPosts = window.likedPosts || {};

  // 3. Override the renderHomepage function to use heart reactions
  const originalRenderHomepage = window.renderHomepage;
  window.renderHomepage = function() {
    // Call the original function
    originalRenderHomepage();
    
    // Find all the reaction divs and replace them
    const reactionDivs = document.querySelectorAll('.poster .reaction');
    reactionDivs.forEach(div => {
      // Get the post ID
      const poster = div.closest('.poster');
      if (!poster) return;
      
      const postId = poster.getAttribute('data-post-id');
      if (!postId) return;
      
      // Find the current post to get like count
      const post = window.posts.find(p => p.id.toString() === postId);
      if (!post) return;
      
      // Create the new heart reaction HTML
      const likeCount = post.likeCount || 0;
      const isLiked = window.likedPosts[postId] ? 'true' : 'false';
      
      const newReactionHTML = `
        <div class="reaction">
          <div class="lovi">
            <div class="heart-container" data-post-id="${postId}">
              <div class="heart-wrapper" data-liked="${isLiked}" data-count="${likeCount}">
                <svg class="heart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div class="heart-count">${likeCount}</div>
              </div>
            </div>
            
            <div class="share1">
              <div>
                <img class="sharo" src="pics/plu.png">
              </div> 
            </div>
          </div>
          <div class="wish1">
            <img class="twito" src="pics/twito.png">
          </div>            
        </div>
      `;
      
      // Replace the old reaction div with the new one
      div.outerHTML = newReactionHTML;
    });
    
    // Initialize heart reactions
    initializeHeartReactions();
    setupDoubleTapLike();
  };

  // 4. Override the showDetail function to use heart reactions in detail view
  const originalShowDetail = window.showDetail;
  window.showDetail = function(postId) {
    // Call the original function
    originalShowDetail(postId);
    
    // Find the post
    const post = window.posts.find(p => p.id === postId);
    if (!post) return;
    
    // Wait a bit for the DOM to update
    setTimeout(() => {
      // Find the reaction div in the detail view
      const detailReaction = document.querySelector('#nuba .reaction');
      if (!detailReaction) return;
      
      // Get the like count and liked state
      const likeCount = post.likeCount || 0;
      const isLiked = window.likedPosts[postId] ? 'true' : 'false';
      
      // Create the new heart reaction HTML
      const newReactionHTML = `
        <div class="reaction">
          <div class="lovi">
            <div class="heart-container" data-post-id="${postId}">
              <div class="heart-wrapper" data-liked="${isLiked}" data-count="${likeCount}">
                <svg class="heart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div class="heart-count">${likeCount}</div>
              </div>
            </div>
            
            <div class="share1">
              <div>
                <img class="sharo" src="pics/plu.png">
              </div> 
            </div>
          </div>
          <div class="wish1">
            <img class="twito" src="pics/twito.png">
          </div>            
        </div>
      `;
      
      // Replace the old reaction div with the new one
      detailReaction.outerHTML = newReactionHTML;
      
      // Initialize the new heart reactions
      initializeHeartReactions();
    }, 100);
  };

  // 5. Initialize all heart containers
  function initializeHeartReactions() {
    const heartContainers = document.querySelectorAll('.heart-container');
    
    heartContainers.forEach(container => {
      // Clear any existing event listeners to prevent duplicates
      const newContainer = container.cloneNode(true);
      container.parentNode.replaceChild(newContainer, container);
      
      // Add event listener to the new container
      newContainer.addEventListener('click', toggleHeartReaction);
    });
  }

  // 6. Toggle heart reaction
  function toggleHeartReaction(event) {
    event.stopPropagation(); // Prevent triggering parent div clicks
    
    const container = event.currentTarget;
    const heartWrapper = container.querySelector('.heart-wrapper');
    const heartIcon = container.querySelector('.heart-icon');
    const heartPath = container.querySelector('.heart-path');
    const heartCount = container.querySelector('.heart-count');
    const postId = container.getAttribute('data-post-id');
    
    // Get current state
    const isLiked = heartWrapper.getAttribute('data-liked') === 'true';
    let count = parseInt(heartWrapper.getAttribute('data-count') || heartCount.textContent);
    
    // Remove any existing animation classes
    heartIcon.classList.remove('heart-beat', 'heart-unlike');
    heartCount.classList.remove('count-pop');
    
    // Force a reflow to restart animation
    void heartIcon.offsetWidth;
    void heartCount.offsetWidth;
    
    if (!isLiked) {
      // Like the post
      heartWrapper.setAttribute('data-liked', 'true');
      container.setAttribute('data-liked', 'true');
      count++;
      heartIcon.classList.add('heart-beat');
      window.likedPosts[postId] = true;
    } else {
      // Unlike the post
      heartWrapper.setAttribute('data-liked', 'false');
      container.setAttribute('data-liked', 'false');
      count--;
      heartIcon.classList.add('heart-unlike');
      delete window.likedPosts[postId];
    }
    
    // Update count and add animation
    heartWrapper.setAttribute('data-count', count);
    heartCount.textContent = count;
    heartCount.classList.add('count-pop');
    
    // Update any reference in the posts array
    if (window.posts) {
      const post = window.posts.find(p => p.id.toString() === postId);
      if (post) {
        post.likeCount = count;
      }
    }

    // Sync all instances of this post across the page
    syncPostLikes(postId, count, isLiked);
  }

  // 7. Sync likes across all instances of the same post on the page
  function syncPostLikes(postId, count, wasLiked) {
    const allHeartContainers = document.querySelectorAll(`.heart-container[data-post-id="${postId}"]`);
    
    allHeartContainers.forEach(container => {
      const heartWrapper = container.querySelector('.heart-wrapper');
      const heartCount = container.querySelector('.heart-count');
      
      // Skip the container that triggered the event (it's already updated)
      const currentLikedState = heartWrapper.getAttribute('data-liked') === 'true';
      if (currentLikedState === wasLiked) {
        heartWrapper.setAttribute('data-liked', !wasLiked ? 'true' : 'false');
        container.setAttribute('data-liked', !wasLiked ? 'true' : 'false');
        heartWrapper.setAttribute('data-count', count);
        heartCount.textContent = count;
      }
    });
  }

  // 8. Setup double-tap to like for mobile (Instagram style)
  function setupDoubleTapLike() {
    const postImages = document.querySelectorAll('.poster .laptop, .laptop1 img, #nuba .lapto');
    
    postImages.forEach(img => {
      // Remove any existing event listeners
      const newImg = img.cloneNode(true);
      img.parentNode.replaceChild(newImg, img);
      
      let lastTap = 0;
      
      newImg.addEventListener('click', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
          // Double tap detected
          const poster = this.closest('.poster') || this.closest('#nuba');
          if (poster) {
            const postId = poster.getAttribute('data-post-id') || 
                          poster.querySelector('[data-post-id]')?.getAttribute('data-post-id');
            
            if (postId) {
              const heartContainer = document.querySelector(`.heart-container[data-post-id="${postId}"]`);
              if (heartContainer) {
                const isLiked = heartContainer.querySelector('.heart-wrapper').getAttribute('data-liked') === 'true';
                
                // Only like if not already liked
                if (!isLiked) {
                  // Create a heart animation at tap position
                  createTapHeart(e.clientX, e.clientY);
                  
                  // Trigger the like
                  heartContainer.click();
                }
              }
            }
          }
          e.stopPropagation(); // Prevent other click handlers
        }
        
        lastTap = currentTime;
      });
    });
  }

  // 9. Create heart animation at tap position (for double-tap)
  function createTapHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'tap-heart';
    heart.innerHTML = `
      <svg width="80" height="80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="rgb(244, 7, 82)" stroke="rgb(244, 7, 82)"/>
      </svg>
    `;
    
    Object.assign(heart.style, {
      left: `${x - 40}px`,
      top: `${y - 40}px`,
    });
    
    document.body.appendChild(heart);
    
    // Trigger animation
    setTimeout(() => {
      heart.style.opacity = '1';
      heart.style.transform = 'scale(1)';
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
      heart.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(heart)) {
          document.body.removeChild(heart);
        }
      }, 800);
    }, 800);
  }

  // 10. Set up mutation observer to handle dynamically added content
  const observer = new MutationObserver(function(mutations) {
    let shouldInitialize = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        shouldInitialize = true;
      }
    });
    
    if (shouldInitialize) {
      initializeHeartReactions();
      setupDoubleTapLike();
    }
  });
  
  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });

  // 11. Initialize on load
  initializeHeartReactions();
  setupDoubleTapLike();
}

// Call this function on page load
document.addEventListener('DOMContentLoaded', setupHeartReactionSystem);

// Expose function globally so it can be called manually if needed
window.setupHeartReactionSystem = setupHeartReactionSystem;
