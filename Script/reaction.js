let selectedEmoji = null;

        document.querySelectorAll('.emoji-wrapper').forEach(wrapper => {
            wrapper.addEventListener('click', function() {
                const emoji = this.querySelector('.emoji');
                const countDisplay = this.querySelector('.emoji-count');
                
                // If clicking the same emoji, deselect it
                if (this === selectedEmoji) {
                    // Reset classes and count
                    this.classList.remove('selected', 'background-visible');
                    let count = parseInt(this.dataset.count);
                    count--;
                    this.dataset.count = count;
                    countDisplay.textContent = count;
                    
                    // Reset to static image immediately
                    emoji.src = emoji.dataset.static;
                    
                    // Clear selected emoji
                    selectedEmoji = null;
                    return;
                }

                // Remove selection from previous emoji
                if (selectedEmoji) {
                    selectedEmoji.classList.remove('selected', 'background-visible');
                    const prevCount = selectedEmoji.querySelector('.emoji-count');
                    let count = parseInt(selectedEmoji.dataset.count);
                    count--;
                    selectedEmoji.dataset.count = count;
                    prevCount.textContent = count;
                    
                    // Reset previous emoji to static image
                    const prevEmoji = selectedEmoji.querySelector('.emoji');
                    prevEmoji.src = prevEmoji.dataset.static;
                }

                // Add selection to new emoji
                this.classList.add('selected');
                
                // Switch to animated GIF and start animation
                emoji.src = emoji.dataset.animated;
                emoji.classList.add('animating');
                
                // Update count
                let count = parseInt(this.dataset.count);
                count++;
                this.dataset.count = count;
                countDisplay.textContent = count;

                // Show background as animation starts returning to original size
                setTimeout(() => {
                    this.classList.add('background-visible');
                }, 1200);

                // Remove animation class
                setTimeout(() => {
                    emoji.classList.remove('animating');
                }, 700);

                // Switch back to static image after animation fully completes
                setTimeout(() => {
                    emoji.src = emoji.dataset.static;
                }, 1400);

                selectedEmoji = this;
            });
        });