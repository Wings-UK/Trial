
const video = document.querySelector('.laptop');

video.addEventListener('play', function() {
  video.classList.add('fullscreen'); // Add fullscreen class when video plays
});

video.addEventListener('pause', function() {
  video.classList.remove('fullscreen'); // Remove fullscreen class when video pauses
});


// Show loading bar
document.querySelector('.loading-bar').style.display = 'block';

// Hide loading bar when page is loaded
window.addEventListener('load', () => {
  document.querySelector('.loading-bar').style.display = 'none';
});