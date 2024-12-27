
document.addEventListener('DOMContentLoaded', () => {
    // Prevent right click
    document.addEventListener('contextmenu', event => {
        event.preventDefault();
    });

    // Prevent dragging of images
    document.querySelectorAll('img, video').forEach(element => {
        element.addEventListener('dragstart', event => {
            event.preventDefault();
        });
    });


    // Video autoplay
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.play();
            else entry.target.pause();
        });
    });

    document.querySelectorAll('video').forEach(video => {
        observer.observe(video);
    });
});
  