let isFullscreen = false;
let lastScrollPosition = 0;


document.addEventListener('DOMContentLoaded', function() {
    const videoContainer = document.querySelector('.video-container');
    const fullscreenContainer = document.querySelector('.fullscreen-video');
    const backButton = document.querySelector('.back-button');
    const video = document.querySelector('.video-player');
    const fullscreenVideo = document.querySelector('.fullscreen-player');
    const customControls = document.querySelector('.custom-controls');
    const progressBar = document.querySelector('.progress-bar');
    const progress = document.querySelector('.progress');
    const timeDisplay = document.querySelector('.time-display');
    const durationDisplay = document.querySelector('.duration');

    let lastTap = 0;
    let seekAmount = 10; // seconds to seek on double tap

    // Format time in MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Set video thumbnail to specific time
    video.addEventListener('loadedmetadata', function() {
        // Set thumbnail to 25% of video duration
        video.currentTime = video.duration * 0;
        // Update duration display
        durationDisplay.textContent = formatTime(video.duration);
    });

    // Prevent thumbnail from playing
    video.addEventListener('timeupdate', function() {
        if (!video.paused) {
            video.pause();
        }
    });

    // Sync both videos
    function syncVideos() {
        fullscreenVideo.currentTime = video.currentTime;
    }

    // Video container click handler (replacing play button click)
    videoContainer.addEventListener('click', function() {
        syncVideos();
        fullscreenContainer.style.display = 'block';
        backButton.style.display = 'block';
        customControls.style.display = 'block';
        fullscreenVideo.play();
        isFullscreen = true; // Set flag when entering fullscreen
        
        isFullscreen = true;
    
    // Add state to browser history
    history.pushState({ page: 'fullscreen' }, '', '');
    });

    // Double tap detection and seeking
    fullscreenContainer.addEventListener('touchstart', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        const screenWidth = window.innerWidth;
        const touchX = e.touches[0].clientX;

        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            if (touchX < screenWidth / 2) {
                // Left side - rewind
                fullscreenVideo.currentTime = Math.max(0, fullscreenVideo.currentTime - seekAmount);
            } else {
                // Right side - forward
                fullscreenVideo.currentTime = Math.min(fullscreenVideo.duration, fullscreenVideo.currentTime + seekAmount);
            }
            e.preventDefault(); // Prevent zoom
        }
        lastTap = currentTime;
    });

    // Back button handler
    backButton.addEventListener('click', function() {
        fullscreenContainer.style.display = 'none';
        backButton.style.display = 'none';
        customControls.style.display = 'none';
        fullscreenVideo.pause();
        video.currentTime = fullscreenVideo.currentTime;
        exitFullscreenMode();
        
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    });

    // Update progress bar and time display
    fullscreenVideo.addEventListener('timeupdate', function() {
        const percentage = (fullscreenVideo.currentTime / fullscreenVideo.duration) * 100;
        progress.style.width = percentage + '%';
        timeDisplay.textContent = `${formatTime(fullscreenVideo.currentTime)} / ${formatTime(fullscreenVideo.duration)}`;
    });
    
    function exitFullscreenMode() {
    fullscreenContainer.style.display = 'none';
    backButton.style.display = 'none';
    customControls.style.display = 'none';
    fullscreenVideo.pause();
    video.currentTime = fullscreenVideo.currentTime;
    isFullscreen = false;
    
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
    }
}

window.addEventListener('popstate', function(event) {
    if (isFullscreen) {
        exitFullscreenMode();
    }
});

    // Progress bar click handler
    progressBar.addEventListener('click', function(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
        fullscreenVideo.currentTime = pos * fullscreenVideo.duration;
    });

    // Show/hide controls on tap
    fullscreenContainer.addEventListener('click', function(e) {
        if (e.target === fullscreenContainer || e.target === fullscreenVideo) {
            customControls.style.display = 
                customControls.style.display === 'none' ? 'block' : 'none';
            backButton.style.display = 
                backButton.style.display === 'none' ? 'block' : 'none';
        }
    });
});

function handleVideoSize(video) {
    // Get video's natural aspect ratio
    const videoAspect = video.videoWidth / video.videoHeight;
    // Get screen/window aspect ratio
    const screenAspect = window.innerWidth / (window.innerHeight - 60); // Subtracting your 75px bottom space

    // Get video natural dimensions
    const videoNaturalHeight = video.videoHeight;
    const screenHeight = window.innerHeight - 60; // Available height

    if (videoNaturalHeight < 400) {
        // For shorter videos, maintain original height
        const calculatedHeight = (window.innerWidth / videoAspect);
        video.style.height = calculatedHeight + 'px';
        // Center vertically
        video.style.top = `${(screenHeight - calculatedHeight) / 2}px`;
    } else if (videoAspect > 1) {
        // Landscape video
        video.style.width = '100%';
        const calculatedHeight = (window.innerWidth / videoAspect);
        video.style.height = `${calculatedHeight}px`;
        // Center vertically if there's space
        if (calculatedHeight < screenHeight) {
            video.style.top = `${(screenHeight - calculatedHeight) / 2}px`;
        } else {
            video.style.top = '0';
        }
    } else {
        // Portrait video
        video.style.width = '100%';
        video.style.height = `${screenHeight}px`;
        video.style.top = '0';
    }
}



document.addEventListener('DOMContentLoaded', function() {
    const fullscreenVideo = document.querySelector('.fullscreen-player');
    
    fullscreenVideo.addEventListener('loadedmetadata', function() {
        handleVideoSize(this);
    });

    // Handle resize events
    window.addEventListener('resize', function() {
        if (fullscreenVideo.style.display !== 'none') {
            handleVideoSize(fullscreenVideo);
        }
    });
});


