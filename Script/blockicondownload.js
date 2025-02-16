// Add this to your main JavaScript file

// 1. Disable right-click on images
document.addEventListener('contextmenu', function(event) {
    if (event.target.tagName === 'IMG') {
        event.preventDefault();
    }
}, false);

// 2. Disable drag-and-drop for images
document.addEventListener('dragstart', function(event) {
    if (event.target.tagName === 'IMG') {
        event.preventDefault();
    }
}, false);

// 3. Disable keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Prevent Ctrl+S, Ctrl+U, Ctrl+P
    if (event.ctrlKey && (event.key === 's' || event.key === 'u' || event.key === 'p')) {
        event.preventDefault();
    }
    // Prevent PrintScreen
    if (event.key === 'PrintScreen') {
        event.preventDefault();
    }
}, false);

// 4. Add invisible overlay over images
function addOverlayToImages() {
    const images = document.getElementsByTagName('IMG');
    for (let img of images) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
        `;
        img.parentElement.style.position = 'relative';
        img.parentElement.appendChild(overlay);
    }
}

// 5. Add watermark to images
function addWatermark(imageElement, text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Wait for image to load
    imageElement.onload = function() {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        
        // Draw original image
        ctx.drawImage(imageElement, 0, 0);
        
        // Add watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '20px Arial';
        ctx.fillText(text, 20, canvas.height - 20);
        
        // Replace original image with watermarked version
        imageElement.src = canvas.toDataURL();
    };
}

