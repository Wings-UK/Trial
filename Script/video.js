
function initializeVideoPlayers() {
  const videoContainers = document.querySelectorAll('.video-container');
  
  videoContainers.forEach(container => {
    const thumbnailVideo = container.querySelector('.video-thumbnail');
    const durationBadge = container.querySelector('.duration-badge');
    
    // Set duration badge once metadata is loaded
    thumbnailVideo.addEventListener('loadedmetadata', () => {
      const duration = formatTime(thumbnailVideo.duration);
      durationBadge.textContent = duration;
    });
    
    // Open video modal on click
    container.addEventListener('click', () => {
      const postElement = container.closest('.poster');
      const postId = postElement.getAttribute('data-post-id');
      
      // Find the corresponding post data
      const post = posts.find(p => p.id === parseInt(postId));
      if (!post) return;
      
      openVideoModal(post);
    });
  });
  
  // Set up modal close functionality
  const backButtons = document.querySelectorAll('.back-button');
  backButtons.forEach(button => {
    button.addEventListener('click', closeVideoModal);
  });
  
  // Setup follow buttons
  const followButtons = document.querySelectorAll('.follow-button');
  followButtons.forEach(button => {
    button.addEventListener('click', () => {
      button.classList.toggle('following');
      button.textContent = button.classList.contains('following') ? 'Following' : 'Follow';
    });
  });
}

// Function to open video modal
function openVideoModal(post) {
  const modal = document.querySelector('.video-modal');
  const videoPlayer = modal.querySelector('.fullscreen-player');
  const user = users.find(u => u.id === post.userId);
  
  // Set the source of the video
  videoPlayer.querySelector('source').src = post.video;
  videoPlayer.load();
  
  // Update user details in the modal
  modal.querySelector('.user-avatar img').src = user.avatar;
  modal.querySelector('.username span').textContent = user.username;
  modal.querySelector('.timestamp').textContent = post.timestamp;
  modal.querySelector('.modal-post-text').textContent = post.content;
  
  // Update action counts
  modal.querySelector('.action-button:nth-child(1) span').textContent = post.likes || 358;
  modal.querySelector('.action-button:nth-child(2) span').textContent = post.comments || 36;
  modal.querySelector('.action-button:nth-child(3) span').textContent = post.reposts || 0;
  modal.querySelector('.action-button:nth-child(4) span').textContent = post.donations || 8;
  
  // Show the modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
  
  // Set up video controls
  setupVideoControls(videoPlayer);
  
  // Auto play the video
  videoPlayer.play().catch(error => {
    console.log('Auto-play prevented:', error);
    // Show play button prominently if autoplay is blocked
  });
}

// Function to close video modal
function closeVideoModal() {
  const modal = document.querySelector('.video-modal');
  const videoPlayer = modal.querySelector('.fullscreen-player');
  
  // Pause the video
  videoPlayer.pause();
  
  // Hide the modal
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

// Function to setup video controls
function setupVideoControls(videoPlayer) {
  const progressBar = document.querySelector('.progress-bar');
  const progressFilled = document.querySelector('.progress-filled');
  const progressHandle = document.querySelector('.progress-handle');
  const timeDisplay = document.querySelector('.time-display');
  const playPauseBtn = document.querySelector('.play-pause-btn');
  const playIcon = playPauseBtn.querySelector('.play-icon');
  const pauseIcon = playPauseBtn.querySelector('.pause-icon');
  const videoControls = document.querySelector('.video-controls');
  
  // Update progress bar as video plays
  videoPlayer.addEventListener('timeupdate', () => {
    const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressFilled.style.width = `${percent}%`;
    progressHandle.style.left = `${percent}%`;
    
    // Update time display
    timeDisplay.textContent = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
  });
  
  // Click on progress bar to seek
  progressBar.addEventListener('click', (e) => {
    const progressTime = (e.offsetX / progressBar.offsetWidth) * videoPlayer.duration;
    videoPlayer.currentTime = progressTime;
  });
  
  // Dragging progress handle
  let isDragging = false;
  
  progressHandle.addEventListener('mousedown', () => {
    isDragging = true;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const clampedPos = Math.max(0, Math.min(1, pos));
      
      progressFilled.style.width = `${clampedPos * 100}%`;
      progressHandle.style.left = `${clampedPos * 100}%`;
      
      // Don't update video currentTime until mouseup for smoother dragging
    }
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      const width = parseFloat(progressFilled.style.width) / 100;
      videoPlayer.currentTime = width * videoPlayer.duration;
      isDragging = false;
    }
  });
  
  // Play/Pause button functionality
  playPauseBtn.addEventListener('click', togglePlayPause);
  videoPlayer.addEventListener('click', togglePlayPause);
  
  function togglePlayPause() {
    if (videoPlayer.paused) {
      videoPlayer.play();
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      videoPlayer.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  }
  
  // Update icons when video is played/paused
  videoPlayer.addEventListener('play', () => {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  });
  
  videoPlayer.addEventListener('pause', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });
  
  // Hide controls when inactive
  let controlsTimeout;
  
  function showControls() {
    videoControls.style.opacity = '1';
    clearTimeout(controlsTimeout);
    
    controlsTimeout = setTimeout(() => {
      if (!videoPlayer.paused) {
        videoControls.style.opacity = '0';
      }
    }, 3000);
  }
  
  videoPlayer.addEventListener('mousemove', showControls);
  videoControls.addEventListener('mousemove', showControls);
  
  // Show controls initially
  showControls();
  
  // Video end handling
  videoPlayer.addEventListener('ended', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    videoControls.style.opacity = '1';
  });
}

// Helper function to format time (converts seconds to MM:SS format)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Function to add to the renderHomepage function
function renderPostWithNewVideoPlayer(post, user) {
  // Create video thumbnail section
  let videoHTML = '';
  
  if (post.video) {
    videoHTML = `
      <div class="video-container laptop1" data-post-id="${post.id}">
        <video class="video-thumbnail" preload="metadata" poster="${post.videoPoster || ''}">
          <source src="${post.video}" type="video/mp4">
        </video>
        <div class="video-overlay">
          <div class="play-button">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.5)"/>
              <path d="M32 24L20 32V16L32 24Z" fill="white"/>
            </svg>
          </div>
          <div class="duration-badge">0:00</div>
        </div>
      </div>
    `;
  }
  
  return videoHTML;
}

// Modified renderHomepage function
function renderHomepage() {
  const postContainer = document.getElementById("flyer");
  postContainer.innerHTML = ''; // Clear existing content
  
  // Create video modal if it doesn't exist
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
          <div class="action-button">
            <img src="pics/lovv.png" alt="Like">
            <span>0</span>
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
    `;
    document.body.appendChild(videoModal);
  }

  posts.forEach(post => {
    const user = users.find(u => u.id === post.userId); // Find user by ID

    if (!user) return; // Skip if no user found (shouldn't happen)
    const textLimit = (post.image || post.video) ? 150 : 300;

    // Determine if the post has a video
    const hasVideo = post.video ? true : false;
    const hasImage = post.image ? true : false;

    const postHTML = `
        <div class="poster" data-post-id="${post.id}">
            <div class="cust-name"> 
                <div class="heading">
                    <div class="small-photo1">
                        <a class="lino" onclick="showUserProfile(${user.id})">
                            <img class="small-photo" src="${user.avatar}" loading="lazy">
                        </a>
                    </div>
                    <div class="pos">
                        <div>
                            <div class="link-wrapper">
                                <a class="home-click" onclick="showUserProfile(${user.id})">
                                    <div class="post1">
                                        <div class="jerr">
                                            <p class="jerry">${user.username}</p>
                                        </div>
                                        <div>
                                            <img class="verify" src="pics/verifi1.png">
                                        </div>
                                    </div>
                                </a>
                            </div> 
                        </div>     
                        <div class="comp1">
                            <div class="cll">
                                <p class="time">${post.timestamp}</p>
                                <div class="tool">
                                    <p>7.23pm &#183; Sept 23, 2024 </p>
                                </div> 
                            </div>
                        </div>
                    </div> 
                </div>
                <div class="dots">
                    <img class="dot" src="pics/duta.png">
                    <div class="tool">
                        <p>More</p>
                    </div> 
                </div>      
            </div>
            
            ${hasImage ? `
            <div class="laptop1">
                <img class="laptop" src="${post.image}" loading="lazy">
            </div>
            ` : ''}
            
            ${hasVideo ? renderPostWithNewVideoPlayer(post, user) : ''}
            
            <div class="tir" onclick="showDetail(${post.id})">
                <p class="tired">${shortenText(post.content, textLimit, true)}</p>
            </div>
            
            <div class="lefto">
                <div class="dick">
                    <div>
                        <img class="lefti" src="pics/lefti.png">
                    </div>
                    <div>
                        <p class="viewe">View all ${post.diveCount || 142} dives</p>
                    </div>
                </div>
                <div class="twits">
                    <div>
                        <img class="lefti" src="pics/stats.png">
                    </div>
                    <div>
                        <p class="viewe">${post.views || '96.8K'} views</p>
                    </div>
                </div>
            </div>
            <div class="reaction">
                <div class="lovi">
                    <div class="emoji-container">
                        <div class="emoji-wrapper" data-count="0">
                            <img src="pics/lovv.png" alt="Like" class="emoji" data-static="pics/lovv.png" data-animated="pics/lovv.png">
                            <div class="emoji-count">${post.likeCount || 560}</div>
                        </div>
                        <div class="emoji-wrapper" data-count="0">
                            <img src="pics/21[1].png" alt="Love" class="emoji" data-static="pics/21[1].png" data-animated="pics/2.gif">
                            <div class="emoji-count">${post.loveCount || 21}</div>
                        </div>
                        <div class="emoji-wrapper" data-count="0">
                            <img src="pics/angry.gif" alt="Laugh" class="emoji" data-static="pics/angry.gif" data-animated="pics/angr.gif">
                            <div class="emoji-count">${post.angryCount || 78}</div>
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
        </div>
    `;

    postContainer.innerHTML += postHTML;
  });

  // Initialize video functionality after rendering posts
  initializeVideoPlayers();
}
</script>