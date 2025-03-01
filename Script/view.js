const users = [
    {
      id: 1,
      username: "@reddcinema",
      name: "Redd Cinema",
      cover: "pics/pico9.png",
      avatar: "pics/koreangirls.jpg",
      bio: "Film lover & storyteller. I just vibe on here sometimes.. I'm a girl of course.🎬✨",
      followers: 1204,
      following: 340,
      location: "Los Angeles, CA"
    },
    {
      id: 2,
      username: "@lena",
      name: "Lena Marie",
      cover: "pics/pico5.webp",
      avatar: "pics/memo4.jpg",
      bio: "Dancing through life 💃 | Coffee addict | We love niggas that pay for shit ☕",
      followers: 896,
      following: 512,
      location: "New York, NY"
    },
    {
      id: 3, 
      username: "@nomsa",
      name: "Lena Marie",
      cover: "pics/d.jpg",
      avatar: "pics/b.jpg",
      bio: "Dancing through life 💃 | Coffee addict | We love niggas that pay for shit ☕",
      followers: 63,
      following: 556,
      location: "Madras, OR"
    },
    {
      id: 4,
      username: "@jeremyx",
      name: "Redd Cinemam",
      cover: "pics/memo6.jpg",
      avatar: "pics/mypics.jpg",
      bio: "I just vibe on here sometimes.. I'm a girl of course.🎬✨",
      followers: 124,
      following: 30,
      location: "Minna, NR"
    }
];

const posts = [
    {
      id: 1,
      userId: 4,  // Refers to user with id 1 (@reddcinema)
      timestamp: "11 mins ago",
      video: "pics/single.mp4",
      date: "Feb 28, 2025 3:56 PM",
      content: "Right y'all, I’ve been dating a 36 year old for almost 6 months. I turn 20 in 5 days. How do I tell my parents about it? Have I mentioned he lives 5 states away? 💀💀",
    },
    {
      id: 2,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "6 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/a.jpg",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
    {
      id: 3,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "4 mins ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/e.jpg",
      content: "So as a prank, I started texting my best friend on one of those text numbers pretending to be this dube she was in love with but he did her dirty. And this girl is sooo excited that now I feel guilty😭 should I tell or just stop texting and pretend it never happened please help.",
    },
    {
      id: 4,
      userId: 1,  // Refers to user with id 2 (@lena)
      timestamp: "an hour ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/f.jpg",
      content: "do you guys think that how a child turns out is 100% the parents fault or do you think that no matter how good someone may parent their child they may still turn out bad because that's just who they are?",
    },
    {
      id: 5,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "just now",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/g.jpg",
      content: "I get back to my hotel and realize housekeeping cleaned room and stole my damn cocaine and I just called down to the front desk and asked for it... the lady was like your what? “my bag of cocaine sweetie”... they got me fucked up if they think I ain’t gonna ask for my shit.",
    },
    {
      id: 6,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "4 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/h.jpg",
      content: "I had my daughter today at 10:29am it was very long and emotional labor but it was worth every second she’s perfect 💞 her registry is still available please contribute if you can me and her both have a long road ahead of us. Thank you everyone who did what they could💕💕",
    },
    {
      id: 7,
      userId: 1,  // Refers to user with id 2 (@lena)
      timestamp: "2 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/i.jpg",
      content: "So yall I been dating this girl. (A stud) and she went back to the previous girl she was dating & kinda like tryna have us both. She been with her these past few days. & im tryna see the exact words to say to get her over here so I can sneak my key back from her?😩",
    },
    {
      id: 8,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "9 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      video: "pics/olope.mp4",
      content: "why do mothers treat they daughters like they the scum? me & my momma can’t seem to get along at all why i get off a 10 FUCKING HOUR SHIFT OVERNIGHT TO BE EXACT & my “ ROOM” that i pay for monthly which i share w a fucking 12 years old and all my shit is scatter? bro im pissed",
    },
    {
      id: 9,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "3 mins ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/k.jpg",
      content: "I don't think many people talk about the beauty of ageing, especially with grey hair. I want to age beautifully old with grey hair. I feel like some ppl have such a big fear of ageing to the point where they will try their hardest to look young which is kinda sad",
    },
    {
      id: 10,
      userId: 1,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/pico7.webp",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
    {
      id: 11,
      userId: 4,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/memo.webp",
      content: "I think i like this dance. Can someone tell me the name and the country where i can go to learn this? It looks difficult though",
    },
    {
      id: 12,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/pico7.webp",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
  
];


const loggedInUser = {
    id: 4,
    username: "@jeremyx",
    name: "Redd Cinemam",
    cover: "pics/memo6.jpg",
    avatar: "pics/mypics.jpg",
    bio: "I just vibe on here sometimes.. I'm a girl of course.🎬✨",
    followers: 124,
    following: 30,
    location: "Minna, NR"
};
localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));



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



// Function to initialize video players
function initializeVideoPlayers() {
  const videoContainers = document.querySelectorAll('.video-container');
  
  videoContainers.forEach(container => {
    const thumbnailVideo = container.querySelector('.video-thumbnail');
    const durationBadge = container.querySelector('.duration-badge');
    
    if (!thumbnailVideo || !durationBadge) return;
    
    // Remove existing event listeners (if any)
    const thumbnailClone = thumbnailVideo.cloneNode(true);
    thumbnailVideo.parentNode.replaceChild(thumbnailClone, thumbnailVideo);
    
    // Re-set the source and load
    const sourceElement = thumbnailClone.querySelector('source');
    if (sourceElement) {
      const videoSource = sourceElement.src;
      sourceElement.src = videoSource;
      thumbnailClone.load();
    }
    
    // Set duration badge once metadata is loaded
    thumbnailClone.addEventListener('loadedmetadata', () => {
      const duration = formatTime(thumbnailClone.duration);
      durationBadge.textContent = duration;
    });
    
    // Open video modal on click with improved event handling
    container.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      
      const postElement = container.closest('.poster');
      if (!postElement) return;
      
      const postId = postElement.getAttribute('data-post-id');
      if (!postId) return;
      
      // Find the corresponding post data
      const post = posts.find(p => p.id === parseInt(postId));
      if (!post) return;
      
      openVideoModal(post);
    });
  });
  
  // Set up modal close functionality
  const backButtons = document.querySelectorAll('.back-button');
  backButtons.forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', (e) => {
      e.stopPropagation();
      closeVideoModal();
    });
  });
  
  // Setup follow buttons
  const followButtons = document.querySelectorAll('.follow-button');
  followButtons.forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', (e) => {
      e.stopPropagation();
      newButton.classList.toggle('following');
      newButton.textContent = newButton.classList.contains('following') ? 'Following' : 'Follow';
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
  
  // Set up video controls (with improved function)
  const updatedPlayer = setupVideoControls(videoPlayer);
  
  // Adjust the video player size based on orientation
  updatedPlayer.addEventListener('loadedmetadata', () => {
    adjustVideoPlayer(updatedPlayer);
  });
  
  // Auto play the video with proper error handling
  const playPromise = updatedPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.log('Auto-play prevented:', error);
      // Show play button if autoplay is blocked
      const playIcon = modal.querySelector('.play-icon');
      const pauseIcon = modal.querySelector('.pause-icon');
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    });
  }
   if (pageId !== "food" || pageId !== "profile") {
    sessionStorage.setItem("scrollPositio", window.scrollY);
   } 
  
  history.pushState({ modalOpen: true }, '', window.location.href);
}



// Function to close video modal
function closeVideoModal() {
  const modal = document.querySelector('.video-modal');
  const videoPlayer = modal.querySelector('.fullscreen-player');
  
  // Pause the video
  videoPlayer.pause();
  
  const savedScrollPosition = sessionStorage.getItem("scrollPositio");
    if (savedScrollPosition) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollPosition));
        }, 0);
    }
  
  // Hide the modal
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

// Function to setup video controls
function setupVideoControls(videoPlayer) {
  const modal = videoPlayer.closest('.video-modal');
  const progressBar = modal.querySelector('.progress-bar');
  const progressFilled = modal.querySelector('.progress-filled');
  const progressHandle = modal.querySelector('.progress-handle');
  const timeDisplay = modal.querySelector('.time-display');
  const playPauseBtn = modal.querySelector('.play-pause-btn');
  const playIcon = playPauseBtn.querySelector('.play-icon');
  const pauseIcon = playPauseBtn.querySelector('.pause-icon');
  const videoControls = modal.querySelector('.video-controls');
  
  // Clear any existing event listeners (to prevent duplicates)
  const videoPlayerClone = videoPlayer.cloneNode(true);
  videoPlayer.parentNode.replaceChild(videoPlayerClone, videoPlayer);
  videoPlayer = videoPlayerClone;
  
  // Re-add source to the cloned video player
  const sourceElement = videoPlayer.querySelector('source');
  const videoSource = sourceElement.src;
  sourceElement.src = videoSource;
  videoPlayer.load();
  
  // Update progress bar as video plays
  videoPlayer.addEventListener('timeupdate', () => {
    if (videoPlayer.duration) {
      const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
      progressFilled.style.width = `${percent}%`;
      progressHandle.style.left = `${percent}%`;
      
      // Update time display
      timeDisplay.textContent = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
    }
  });
  
  // Click on progress bar to seek
  progressBar.addEventListener('click', (e) => {
    const progressTime = (e.offsetX / progressBar.offsetWidth) * videoPlayer.duration;
    videoPlayer.currentTime = progressTime;
  });
  
  // Dragging progress handle
  let isDragging = false;
  
  progressHandle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.stopPropagation(); // Prevent other click handlers
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const clampedPos = Math.max(0, Math.min(1, pos));
      
      progressFilled.style.width = `${clampedPos * 100}%`;
      progressHandle.style.left = `${clampedPos * 100}%`;
    }
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      const width = parseFloat(progressFilled.style.width) / 100;
      videoPlayer.currentTime = width * videoPlayer.duration;
      isDragging = false;
    }
  });
  
  // Play/Pause button functionality - improved event handling
  function togglePlayPause(e) {
    e.stopPropagation(); // Prevent event bubbling
    
    if (videoPlayer.paused) {
      const playPromise = videoPlayer.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          playIcon.style.display = 'none';
          pauseIcon.style.display = 'block';
        }).catch(error => {
          console.error('Play failed:', error);
          // Keep showing play icon if play fails
          playIcon.style.display = 'block';
          pauseIcon.style.display = 'none';
        });
      }
    } else {
      videoPlayer.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  }
  
  // Remove old event listeners if they exist (to prevent duplicates)
  playPauseBtn.removeEventListener('click', togglePlayPause);
  
  // Add event listeners with improved handling
  playPauseBtn.addEventListener('click', togglePlayPause);
  
  // Separate video click handler with stopPropagation
  videoPlayer.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event propagation
    
    if (videoPlayer.paused) {
      const playPromise = videoPlayer.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          playIcon.style.display = 'none';
          pauseIcon.style.display = 'block';
        }).catch(error => {
          console.error('Play failed:', error);
        });
      }
    } else {
      videoPlayer.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  });
  
  // Update icons when video is played/paused
  videoPlayer.addEventListener('play', () => {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  });
  
  videoPlayer.addEventListener('pause', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });
  
  // Touch events for mobile
  playPauseBtn.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    e.stopPropagation();
    togglePlayPause(e);
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
  
  return videoPlayer; // Return the cloned player
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
              <circle cx="24" cy="24" r="22" fill="rgba(244, 7, 82, 0.5)" stroke="white" stroke-width="3"/>
              <path d="M34 24L18 34V14L34 24Z" fill="white"/>
          </svg>
          </div>
          <div class="duration-badge">0:00</div>
        </div>
      </div>
    `;
  }
  
  return videoHTML;
}



function showDetail(postId) {
    const postDetail = document.getElementById("meal");
    const postContent = document.getElementById("nuba");

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const user = users.find(u => u.id === post.userId);
    if (!user) return;

    const commentTextarea = document.querySelector('.comment-textarea');
    if (commentTextarea) {
        commentTextarea.placeholder = `Reply to ${user.username}...`;
    }

    const hasVideo = post.video ? true : false;
    const hasImage = post.image ? true : false;

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

    postContent.innerHTML = `
        <div class="cust-name" data-post-id="${post.id}"> 
            <div class="heading">
                <div class="small-photo1">
                    <a class="lino" onclick="showUserProfile(${user.id})">
                        <img class="small-photo" src="${user.avatar}">
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
                            <p class="time">${post.date || post.timestamp}</p>
                        </div>
                    </div>
                </div> 
            </div>
            <div>
                <p class="foni" onclick="
                  const foniElem = document.querySelector('.foni');
                  
                  if (foniElem.innerHTML === 'Follow') {
                    foniElem.innerHTML = 'Following';
                    foniElem.classList.add('follow')
                  } else {
                    foniElem.innerHTML = 'Follow';
                    foniElem.classList.remove('follow')
                  }
                ">Follow</p>
            </div>
            <div class="dots">
                <img class="dot" src="pics/duta.png">
                <div class="tool">
                    <p>More</p>
                </div> 
            </div>      
        </div>
        <div class="tir">
            <p class="tiri">${post.content}<br></p>
        </div>
        ${hasImage ? `
        <div class="swet">
            <div class="laptop1">
                <img class="lapto" src="${post.image}">
            </div>
        </div>
        ` : ''}
        
        ${hasVideo ? renderPostWithNewVideoPlayer(post, user) : ''}
        
        <div class="lefto">
            <div class="dick">
                <div>
                    <p class="viewe"><span class="werey">615</span> reactions</p>
                </div>
                <div>
                    <p class="viewe"><span class="werey">9</span> echoes</p>
                </div>
            </div>
            <div class="twits">
                <div>
                    <img class="lefti" src="pics/stats.png">
                </div>
                <div>
                    <p class="viewe">96.8K views</p>
                </div>
            </div>
        </div>
        <div class="reaction">
            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/man3.webp"></a>
                <div class="vrea">
                    <img class="luve" src="pics/lovv.png">
                </div>
            </div>   
            
            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/girl2.webp"></a>
                <div class="vrea">
                    <img class="luve" src="pics/lovv.png">
                </div>
            </div>   

            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/man4.jpg"></a>
                <div class="vrea">
                    <img class="luve" src="pics/2.gif">
                </div>
            </div>   

            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/mypics.jpg"></a>
                <div class="vrea">
                    <img class="luve" src="pics/lovv.png">
                </div>
            </div>   

            <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/pico8.webp"></a>
                <div class="vrea">
                    <img class="luve" src="pics/3.gif">
                </div>
            </div>   
        </div>
    `;

    switchPage("meal");
    
    // Initialize video players AFTER the content is added to the DOM
    initializeVideoPlayers();
    
    // Add direct click handler to the video container in the detail view
    const detailVideoContainer = postContent.querySelector('.video-container');
    if (detailVideoContainer) {
        detailVideoContainer.addEventListener('click', () => {
            openVideoModal(post);
        });
    }
    
    // Also set up modal close functionality
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', closeVideoModal);
    });
}


function adjustVideoPlayer(videoElement) {
  // Get video's natural aspect ratio
  const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
  // Get container dimensions
  const container = videoElement.closest('.video-player-container');
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  // Reset any previous styles
  videoElement.style.width = '';
  videoElement.style.height = '';
  videoElement.style.top = '';
  videoElement.style.left = '';
  videoElement.style.transform = '';
  
  if (videoAspect < 1) {
    // Portrait video - prioritize full height
    const newWidth = containerHeight * videoAspect;
    if (newWidth <= containerWidth) {
      // Can fit full height without overflow
      videoElement.style.height = '100%';
      videoElement.style.width = 'auto';
      // Center horizontally
      videoElement.style.left = '50%';
      videoElement.style.transform = 'translateX(-50%)';
    } else {
      // Can't fit height, use full width
      videoElement.style.width = '100%';
      videoElement.style.height = 'auto';
      // Center vertically - THIS IS THE FIX
      videoElement.style.top = '50%';
      videoElement.style.transform = 'translateY(-50%)';
    }
  } else {
    // Landscape video - prioritize full width
    const newHeight = containerWidth / videoAspect;
    if (newHeight <= containerHeight) {
      // Can fit full width without overflow
      videoElement.style.width = '100%';
      videoElement.style.height = 'auto';
      // Center vertically
      videoElement.style.top = '50%';
      videoElement.style.transform = 'translateY(-50%)';
    } else {
      // Can't fit width, use full height
      videoElement.style.height = '100%';
      videoElement.style.width = 'auto';
      // Center horizontally
      videoElement.style.left = '50%'; 
      videoElement.style.transform = 'translateX(-50%)';
    }
  }
}

// Call this function when the video metadata is loaded


function showUserProfile(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const profileContainer = document.getElementById("profile");
    const profileIreti = document.getElementById("ireti");
    
    profileIreti.innerHTML = `
         <img class="frin" src="${user.cover}">
            <div>
              <img class="kor" src="${user.avatar}">
            </div>
            <div class="klr">
              <div class="drun">
                <div>
                  <p class="spe">${user.username}</p>
                </div>
                <div>
                  <img class="verify" src="pics/verifi1.png">
                </div>
              </div>
              <div class="druu">
                <div>
                  <p class="rkl">${user.location}</p>
                </div>
                <div class="drum">
                  <p class="swe">4</p>
                  <img class="kiy" src="pics/kiddo.png">
                </div>
              </div>
              <div class="nin">
                <p class="rkl"><span class="bld">${user.following}</span>following &#183; <span class="bld">${user.followers}</span>followers</p>
              </div>
              <div class="cha">
                <p>${user.bio}</p>
              </div>
              <div class="man">
                <div class="vre">
                  <button class="aasw">Follow</button>
                </div>
                <div class="vre">
                  <button class="aasw">1 : 1</button>
                </div>
              </div>
            </div>
            <div class="ewe">
              <div class="yeb">
                <img class="dee" src="pics/apps.png">
              </div>
              <div class="yeb">
               <a href="Retail-Desktop-MyAccount-Storefront.html">
                <img class="dee" src="pics/browser.png">
               </a>

              </div>
              <div class="yeb">
                <img class="dee" src="pics/bren.png">
              </div>

            </div>
            
            <div class="mansonro">
            <div class="masonri">
              <!-- Left Column -->
              <div class="column left-column">
            
              </div>
  
              <div class="column right-column">
                
              </div>
            </div>
          </div>
    `;
    
    switchPage("profile");
    renderUserPosts(userId);

}

function renderUserPosts(userId) {
    const userPosts = posts.filter(post => post.userId === userId);
    const leftColumn = document.querySelector(".left-column");
    const rightColumn = document.querySelector(".right-column");
    

    if (!leftColumn || !rightColumn) return;
    if (userPosts.length === 0) {
    // Handle empty state
    leftColumn.innerHTML = '<div class="empty-posts-message"><p>No posts yet</p></div>';
    return;
     }

    userPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    userPosts.forEach((post, index) => {
      const textLimit = post.image ? 40 : 200;
        const postHTML = `
            <div class="masonry" onclick="showDetail(${post.id})">
                  ${post.image ? `
                  <img src="${post.image}">
                  ` : ''}
                  <div class="contentma">
                    <p class="partner">${shortenText(post.content, textLimit, false)}</p>
                    <div class="bioi">
                      <div class="fred">
                        <img class="brekca" src="pics/chat-pic.jpg">
                        <p class="goo">@babygirl</p>
                      </div>
                      <div class="fred">
                        <img class="pen" src="pics/lovv.png">
                        <p class="goo">2.9K</p>
                      </div>
                    </div>
                  </div>
                </div>
        `;

        if (index % 2 === 0) {
            leftColumn.innerHTML += postHTML;
        } else {
            rightColumn.innerHTML += postHTML;
        }
    });
}


function goBack() {
    switchPage("food");
 
    setTimeout (() => {
     const savedScrollPosition = sessionStorage.getItem("scrollPosition");
 
     if (savedScrollPosition) {
         window.scrollTo(0, parseInt(savedScrollPosition));
     }
    }, 50);
 }
 
 
 function switchPage(pageId) {
   if (pageId !== "food" && pageId !== "profile") {
    sessionStorage.setItem("scrollPosition", window.scrollY);
   }

    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.remove("active"));

    const newPage = document.getElementById(pageId);
    newPage.classList.add("active");

    // Add history entry (only push if not the same as current state)
    if (!history.state || history.state.page !== pageId) {
        history.pushState({ page: pageId }, "", `#${pageId}`);
    }
    
    if (pageId === "food") {
      setTimeout(() => {
        const savedScrollPosition = sessionStorage.getItem("scrollPosition");
        if (savedScrollPosition) {
          window.scrollTo(0, parseInt(savedScrollPosition));
        }
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
}

function shortenText(text, limit, showSeeMore = true) {
    if (text.length <= limit) return text; // No need to shorten

    let shortened = text.slice(0, limit); // Cut at the limit
    let lastSpace = shortened.lastIndexOf(" "); // Find last space

    if (lastSpace > 0) {
        shortened = shortened.slice(0, lastSpace); // Cut at last whole word
    }

    return showSeeMore ? shortened + `...<br><span class="reer">see more</span>` : shortened + "..."; 
}
 
 window.onpopstate = function (event) {
    if (event.state && event.state.page) {
        switchPage(event.state.page);
    } else {
        switchPage("food");
        history.replaceState({ page: "food" }, "", "#food"); // Ensure homepage is always in history
    }

    // Restore scroll position
    const savedScrollPosition = sessionStorage.getItem("scrollPosition");
    if (savedScrollPosition) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollPosition));
        }, 0);
    }
    
    closeVideoModal();
};
 
 document.addEventListener("DOMContentLoaded", function () {
  if (!history.state) {
     history.replaceState({ page:"food" }, "", "#food");
  }
     switchPage("food");
 });
 









// 1. First, let's create a function to store and retrieve the logged-in user

// This function would typically be called after user logs in
function setLoggedInUser(userData) {
  localStorage.setItem('loggedInUser', JSON.stringify(userData));
}

// Function to get the logged-in user data
function getLoggedInUser() {
  const userData = localStorage.getItem('loggedInUser');
  if (userData) {
    return JSON.parse(userData);
  }
  
  // If no user data exists, return a default user (for testing purposes)
  return {
    id: 999,
    username: "CurrentUser",
    avatar: "pics/default-avatar.png",
    cover: "pics/default-cover.jpg",
    location: "Lagos, Nigeria",
    bio: "This is my personal account",
    following: 245,
    followers: 1023,
    posts: []
  };
}

// 2. Function to show the logged-in user's profile
function showLoggedInUserProfile() {
  const user = getLoggedInUser();
  
  // Use the existing showUserProfile function, but pass the logged-in user's ID
  showUserProfile(user.id);
  
  // If the showUserProfile function requires the user to exist in the users array,
  // we might need to temporarily add the logged-in user to that array if not already there
  if (!users.some(u => u.id === user.id)) {
    // Store the original users array
    const originalUsers = [...users];
    
    // Add logged-in user temporarily
    users.push(user);
    
    // Call the function to show profile
    showUserProfile(user.id);
    
    // Restore original users array
    users = originalUsers;
  }
}

// 3. Function to initialize the account icon click event
function initializeAccountIcon() {
  // Find the account icon - adjust the selector based on your actual HTML
  const accountIcon = document.querySelector('.account-icon');
  
  if (accountIcon) {
    accountIcon.addEventListener('click', function(event) {
      event.preventDefault();
      showLoggedInUserProfile();
    });
  }
}

// 4. Alternative approach - direct method to show logged-in user profile
function showMyProfile() {
  const user = getLoggedInUser();
  
  const profileContainer = document.getElementById("profile");
  const profileIreti = document.getElementById("ireti");
  
  profileIreti.innerHTML = `
     <img class="frin" src="${user.cover}">
        <div>
          <img class="kor" src="${user.avatar}">
        </div>
        <div class="klr">
          <div class="drun">
            <div>
              <p class="spe">${user.username}</p>
            </div>
            <div>
              <img class="verify" src="pics/verifi1.png">
            </div>
          </div>
          <div class="druu">
            <div>
              <p class="rkl">${user.location}</p>
            </div>
            <div class="drum">
              <p class="swe">4</p>
              <img class="kiy" src="pics/kiddo.png">
            </div>
          </div>
          <div class="nin">
            <p class="rkl"><span class="bld">${user.following}</span> following &#183; <span class="bld">${user.followers}</span> followers</p>
          </div>
          <div class="cha">
            <p>${user.bio}</p>
          </div>
          <div class="man">
            <div class="vre">
              <button class="aasw edit-profile-btn">Edit Profile</button>
            </div>
            <div class="vre">
              <button class="aasw">Settings</button>
            </div>
          </div>
        </div>
        <div class="ewe">
          <div class="yeb">
            <img class="dee" src="pics/apps.png">
          </div>
          <div class="yeb">
           <a href="Retail-Desktop-MyAccount-Storefront.html">
            <img class="dee" src="pics/browser.png">
           </a>
          </div>
          <div class="yeb">
            <img class="dee" src="pics/bren.png">
          </div>
        </div>
        
        <div class="mansonro">
        <div class="masonri">
          <!-- Left Column -->
          <div class="column left-column">
        
          </div>

          <div class="column right-column">
            
          </div>
        </div>
      </div>
  `;
  renderUserPosts(user.id);
  
  switchPage("profile");
  
  // Render the user's posts if they have any
  if (user.posts && user.posts.length > 0) {
    renderUserPosts(user.id);
  } else {
    // Handle empty state for user with no posts
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
      column.innerHTML = '<div class="empty-posts-message"><p>No posts yet</p></div>';
    });
  }
  
  // Add event listener for edit profile button
  const editProfileBtn = document.querySelector('.edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', openEditProfileModal);
  }
}


// 5. Create a modal for editing the profile
function openEditProfileModal() {
  const user = getLoggedInUser();
  
  // Create modal if it doesn't exist
  if (!document.querySelector('.edit-profile-modal')) {
    const modal = document.createElement('div');
    modal.className = 'edit-profile-modal';
    modal.innerHTML = `
      <div class="modal-content1">
        <div class="modal-header1">
          <h2>Edit Profile</h2>
          <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="edit-username" value="${user.username}">
          </div>
          <div class="form-group">
            <label for="location">Location</label>
            <input type="text" id="edit-location" value="${user.location}">
          </div>
          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea id="edit-bio">${user.bio}</textarea>
          </div>
          <div class="form-group">
            <label>Profile Picture</label>
            <div class="upload-btn-wrapper">
              <button class="btn">Upload Image</button>
              <input type="file" id="profile-pic-upload" accept="image/*" />
            </div>
          </div>
          <div class="form-group">
            <label>Cover Photo</label>
            <div class="upload-btn-wrapper">
              <button class="btn">Upload Image</button>
              <input type="file" id="cover-pic-upload" accept="image/*" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button id="save-profile" class="save-btn">Save Changes</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for the modal
    const closeBtn = document.querySelector('.close-modal');
    closeBtn.addEventListener('click', closeEditProfileModal);
    
    const saveBtn = document.getElementById('save-profile');
    saveBtn.addEventListener('click', saveProfileChanges);
  }
  
  // Display the modal
  document.querySelector('.edit-profile-modal').style.display = 'block';
}

function closeEditProfileModal() {
  document.querySelector('.edit-profile-modal').style.display = 'none';
}

function saveProfileChanges() {
  // Get the updated values
  const username = document.getElementById('edit-username').value;
  const location = document.getElementById('edit-location').value;
  const bio = document.getElementById('edit-bio').value;
  
  // Get the current user data
  const user = getLoggedInUser();
  
  // Update the values
  user.username = username;
  user.location = location;
  user.bio = bio;
  
  // Handle file uploads (in a real app you'd upload to a server)
  // For this example, we'll just update the localStorage
  
  // Save the updated user data
  setLoggedInUser(user);
  
  // Close the modal
  closeEditProfileModal();
  
  // Refresh the profile display
  showMyProfile();
}



// 6. Initialize everything when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we have styles for the edit profile modal, if not, add them
  if (!document.getElementById('edit-profile-styles')) {
    const styles = document.createElement('style');
    styles.id = 'edit-profile-styles';
    styles.textContent = `
      .edit-profile-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
      }
      
      .modal-content1 {
        background-color: #fff;
        margin: 10% auto;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 500px;
      }
      
      .modal-header1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .close-modal {
        font-size: 24px;
        cursor: pointer;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      
      .form-group input, .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .form-group textarea {
        height: 100px;
      }
      
      .upload-btn-wrapper {
        position: relative;
        overflow: hidden;
        display: inline-block;
      }
      
      .btn {
        border: 1px solid #ccc;
        color: #555;
        background-color: white;
        padding: 8px 20px;
        border-radius: 4px;
        font-weight: bold;
      }
      
      .upload-btn-wrapper input[type=file] {
        font-size: 100px;
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
        cursor: pointer;
      }
      
      .save-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .empty-posts-message {
        text-align: center;
        padding: 20px;
        background-color: #f8f8f8;
        border-radius: 8px;
        margin: 10px 0;
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Find the account icon
  const accountIcons = document.querySelectorAll('.account-icon, .profile-icon, .me-icon');
  
  accountIcons.forEach(icon => {
    if (icon) {
      icon.addEventListener('click', function(event) {
        event.preventDefault();
        showMyProfile();
      });
    }
  });



  // For testing - create a default user if none exists
  if (!localStorage.getItem('loggedInUser')) {
    setLoggedInUser({
      id: 999,
      username: "CurrentUser",
      avatar: "pics/default-avatar.png", 
      cover: "pics/default-cover.jpg",
      location: "Lagos, Nigeria",
      bio: "This is my profile! I love sharing content about technology and design.",
      following: 245,
      followers: 1023,
      posts: []
    });
  }
});

 
 renderHomepage();