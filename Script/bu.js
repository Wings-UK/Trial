function initializeHomepage() {
  if (!document.querySelector('.video-modal')) {
    const videoModal = document.createElement('div');
    videoModal.className = 'video-modal';
    videoModal.innerHTML = `
       <div class="modal-header">
        <div class="back-button">
          <img src="pics/backa.png" alt="Back">
        </div>
        <div class="modal-user-info">
          <div class="user-avatar">
            <img src="" alt="">
          </div>
          <div class="user-details">
            <div class="username">
              <span></span>
              <img class="verify-badge" src="pics/verifi1.png">
            </div>
            <div class="timestamp"></div>
          </div>
        </div>
        <div class="follow-button">Follow</div>
      </div>
      
      <div class="video-player-container">
        <video class="fullscreen-player">
          <source src="" type="video/mp4">
        </video>
        
        <div class="video-controls">
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-filled"></div>
              <div class="progress-handle"></div>
            </div>
            <div class="time-display">0:00 / 0:00</div>
          </div>
          
          <div class="control-buttons">
            <div class="play-pause-btn">
              <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" fill="white"/>
              </svg>
              <svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" style="display: none;">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="white"/>
              </svg>
            </div>
            <div class="volume-control">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-content">
        <p class="modal-post-text"></p>
      </div>
      
      <div class="modal-actions">
        <div class="action-buttons">
          <div class="action-button heart-btn">
            <svg class="heart-icon" width="24" height="24" viewBox="0 0 24 24">
              <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span class="like-count">0</span>
          </div>
          <div class="action-button">
            <img src="pics/chat.png" alt="Comment">
            <span>0</span>
          </div>
          <div class="action-button">
            <img src="pics/repost.png" alt="Repost">
            <span>0</span>
          </div>
          <div class="action-button">
            <img src="pics/naira.png" alt="Donate">
            <span>0</span>
          </div>
        </div>
      </div>
    `; // Keep your existing modal HTML
    document.body.appendChild(videoModal);
  }

  postContainer.innerHTML = '';
  loadedPostIds.clear();

  // Initial render with skeletons
  for (let i = 0; i < postsPerLoad; i++) {
    postContainer.appendChild(createSkeletonPost());
  }

  setupVirtualScroll();
  addSkeletonStyles();
}




function setupVirtualScroll() {
  const observerOptions = {
    root: null,
    rootMargin: '200px', // Load posts 200px before they enter viewport
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const postElement = entry.target;
          const postId = parseInt(postElement.dataset.postId);
          
          if (entry.isIntersecting && postElement.classList.contains('skeleton')) {
            const post = posts.find(p => p.id === postId);
            if (post && !loadedPostIds.has(postId)) {
              const realPost = createPostElement(post);
              postElement.replaceWith(realPost);
              loadedPostIds.add(postId);
              initializeHeartReactions();
              initializeVideoPlayers();
            }
          }
        });
        
        if (entries.some(e => e.isIntersecting && e.target === postContainer.lastElementChild)) {
      loadMoreVirtualPosts();
    }
  }, observerOptions);

  // Observe all posts
  document.querySelectorAll('.poster').forEach(post => observer.observe(post));
}