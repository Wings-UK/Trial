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
  `;
  document.head.appendChild(styleElement);

  // 2. Global object to track liked posts
  window.likedPosts = window.likedPosts || {};

  // 3. Initialize all heart containers
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

  // 4. Toggle heart reaction
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

  // 5. Sync likes across all instances of the same post on the page
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

  // 6. Set up mutation observer to handle dynamically added content
  const observer = new MutationObserver(function(mutations) {
    let shouldInitialize = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        shouldInitialize = true;
      }
    });
    
    if (shouldInitialize) {
      initializeHeartReactions();
    }
  });
  
  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose function globally so it can be called manually if needed
  window.setupHeartReactionSystem = setupHeartReactionSystem;
  window.initializeHeartReactions = initializeHeartReactions;
}