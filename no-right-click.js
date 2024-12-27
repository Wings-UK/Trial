
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
  

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.masonry img');

    images.forEach(img => {
        img.loading ='lazy';
        img.closest('.masonry').classList.add('loadings');
        img.onload = function() {
            this.closest('.masonry').classList.remove('loadings');
        }
    })
})