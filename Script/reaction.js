// Create the emotion spectrum reaction system
function createEmotionSpectrumSystem() {
  // Replace existing reaction system
  const reactionContainers = document.querySelectorAll('.lovi, .emoji-container');
  
  reactionContainers.forEach(container => {
    // Parent post element
    const postElement = container.closest('.poster');
    if (!postElement) return;
    
    const postId = postElement.getAttribute('data-post-id');
    
    // Create new reaction system
    const newReactionHTML = `
      <div class="emotion-spectrum-container" data-post-id="${postId}">
        <div class="spectrum-preview">
          <div class="color-dot"></div>
          <span class="emotion-label">React</span>
        </div>
        
        <div class="spectrum-popup">
          <div class="spectrum-track">
            <div class="spectrum-slider"></div>
            <div class="spectrum-intensity"></div>
          </div>
          <div class="emotion-terms">
            <span class="emotion-start">Calm</span>
            <span class="emotion-mid">Mixed</span>
            <span class="emotion-end">Intense</span>
          </div>
          <div class="emotion-display">
            <span class="current-emotion">Select your reaction</span>
            <span class="emotion-count">0</span>
          </div>
        </div>
        
        <div class="reaction-heatmap">
          <canvas class="reaction-canvas"></canvas>
          <div class="reaction-count">0 reactions</div>
        </div>
      </div>
    `;
    
    // Replace original container with new system
    container.innerHTML = newReactionHTML;
    
    // Initialize the spectrum system
    initializeEmotionSpectrum(container.querySelector('.emotion-spectrum-container'));
  });
  
  // Add necessary styles
  addEmotionSpectrumStyles();
}

// Initialize the emotion spectrum functionality for a container
function initializeEmotionSpectrum(container) {
  if (!container) return;
  
  const preview = container.querySelector('.spectrum-preview');
  const popup = container.querySelector('.spectrum-popup');
  const track = container.querySelector('.spectrum-track');
  const slider = container.querySelector('.spectrum-slider');
  const intensityBar = container.querySelector('.spectrum-intensity');
  const emotionLabel = container.querySelector('.emotion-label');
  const currentEmotion = container.querySelector('.current-emotion');
  const colorDot = container.querySelector('.color-dot');
  const heatmap = container.querySelector('.reaction-heatmap');
  const canvas = container.querySelector('.reaction-canvas');
  const reactionCount = container.querySelector('.reaction-count');
  
  // Color spectrum for emotions (from serene blue to passionate red)
  const colorSpectrum = [
    '#1e88e5', // Serene blue
    '#26c6da', // Calm cyan
    '#66bb6a', // Balanced green
    '#fdd835', // Happy yellow
    '#fb8c00', // Warm orange
    '#e53935'  // Passionate red
  ];
  
  // Emotion labels for different points on the spectrum
  const emotionLabels = [
    'Serene',      // Blue
    'Thoughtful',  // Cyan
    'Inspired',    // Green
    'Amused',      // Yellow
    'Amazed',      // Orange
    'Passionate'   // Red
  ];
  
  // Intensity adjectives
  const intensityAdjectives = [
    'Slightly',    // Level 1
    'Somewhat',    // Level 2
    'Definitely',  // Level 3
    'Very',        // Level 4
    'Extremely'    // Level 5
  ];
  
  // Set initial state
  let isOpen = false;
  let colorIndex = 0;
  let intensityLevel = 2; // Medium intensity by default
  let hasReacted = false;
  
  // Toggle reaction popup
  preview.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    
    if (isOpen) {
      popup.style.display = 'block';
      
      // Position the slider at current color
      const percent = colorIndex / (colorSpectrum.length - 1) * 100;
      slider.style.left = `${percent}%`;
      
      // Set intensity bar height
      intensityBar.style.height = `${(intensityLevel / 5) * 100}%`;
    } else {
      popup.style.display = 'none';
    }
  });
  
  // Handle click outside to close
  document.addEventListener('click', (e) => {
    if (isOpen && !container.contains(e.target)) {
      isOpen = false;
      popup.style.display = 'none';
    }
  });
  
  // Handle color spectrum track interaction
  track.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Calculate position on track
    const rect = track.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    
    // Determine color index based on position
    colorIndex = Math.min(Math.floor(position * colorSpectrum.length), colorSpectrum.length - 1);
    
    // Update slider position and color
    const percent = colorIndex / (colorSpectrum.length - 1) * 100;
    slider.style.left = `${percent}%`;
    
    // Update emotion label and color
    updateEmotionDisplay();
  });
  
  // Handle vertical intensity drag
  let isDragging = false;
  
  intensityBar.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    isDragging = true;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const rect = track.getBoundingClientRect();
    const mouseY = e.clientY;
    const trackBottom = rect.bottom;
    const trackHeight = rect.height;
    
    // Calculate intensity based on vertical position
    const fromBottom = trackBottom - mouseY;
    const percentage = Math.max(0, Math.min(1, fromBottom / trackHeight));
    
    // Update intensity level (1-5)
    intensityLevel = Math.ceil(percentage * 5);
    if (intensityLevel < 1) intensityLevel = 1;
    
    // Update intensity bar height
    intensityBar.style.height = `${percentage * 100}%`;
    
    // Update emotion display
    updateEmotionDisplay();
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // Function to update emotion display
  function updateEmotionDisplay() {
    const emotionName = emotionLabels[colorIndex];
    const intensityName = intensityAdjectives[intensityLevel - 1];
    const emotionColor = colorSpectrum[colorIndex];
    
    // Set the emotion text
    currentEmotion.textContent = `${intensityName} ${emotionName}`;
    
    // Update the color of text and track
    currentEmotion.style.color = emotionColor;
    slider.style.backgroundColor = emotionColor;
    
    // Update preview dot
    colorDot.style.backgroundColor = emotionColor;
    
    if (hasReacted) {
      emotionLabel.textContent = `${intensityName} ${emotionName}`;
      emotionLabel.style.color = emotionColor;
    }
  }
  
  // Function to submit reaction
  popup.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    
    // Submit the reaction
    const emotionName = emotionLabels[colorIndex];
    const intensityName = intensityAdjectives[intensityLevel - 1];
    const emotionColor = colorSpectrum[colorIndex];
    
    emotionLabel.textContent = `${intensityName} ${emotionName}`;
    emotionLabel.style.color = emotionColor;
    
    // Update the preview
    colorDot.style.backgroundColor = emotionColor;
    
    // Mark as reacted
    hasReacted = true;
    
    // Close the popup
    isOpen = false;
    popup.style.display = 'none';
    
    // Update reaction count
    updateReactionHeatmap(colorIndex, intensityLevel);
    
    // Animate the reaction confirmation
    animateReactionConfirmation(emotionColor);
  });
  
  // Submit button in popup for mobile users
  const submitButton = document.createElement('button');
  submitButton.className = 'emotion-submit';
  submitButton.textContent = 'React';
  popup.appendChild(submitButton);
  
  submitButton.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Submit the reaction
    const emotionName = emotionLabels[colorIndex];
    const intensityName = intensityAdjectives[intensityLevel - 1];
    const emotionColor = colorSpectrum[colorIndex];
    
    emotionLabel.textContent = `${intensityName} ${emotionName}`;
    emotionLabel.style.color = emotionColor;
    
    // Update the preview
    colorDot.style.backgroundColor = emotionColor;
    
    // Mark as reacted
    hasReacted = true;
    
    // Close the popup
    isOpen = false;
    popup.style.display = 'none';
    
    // Update reaction count
    updateReactionHeatmap(colorIndex, intensityLevel);
    
    // Animate the reaction confirmation
    animateReactionConfirmation(emotionColor);
  });
  
  // Function to animate reaction confirmation
  function animateReactionConfirmation(color) {
    const emoji = document.createElement('div');
    emoji.className = 'reaction-emoji';
    emoji.style.backgroundColor = color;
    
    container.appendChild(emoji);
    
    // Animate upward and fade
    setTimeout(() => {
      emoji.style.transform = 'translateY(-60px)';
      emoji.style.opacity = '0';
      
      // Remove after animation completes
      setTimeout(() => {
        emoji.remove();
      }, 1000);
    }, 50);
  }
  
  // Create simulated reaction data
  let simulatedReactions = {
    totalCount: Math.floor(Math.random() * 100) + 20,
    distribution: []
  };
  
  // Generate random distribution
  for (let c = 0; c < colorSpectrum.length; c++) {
    for (let i = 0; i < 5; i++) {
      const count = Math.floor(Math.random() * 10);
      if (count > 0) {
        simulatedReactions.distribution.push({
          colorIndex: c,
          intensityLevel: i + 1,
          count: count
        });
      }
    }
  }
  
  // Function to update reaction heatmap
  function updateReactionHeatmap(colorIdx, intensityLvl) {
    if (!canvas) return;
    
    // Check if this exact reaction exists
    let foundExisting = false;
    
    for (let i = 0; i < simulatedReactions.distribution.length; i++) {
      const reaction = simulatedReactions.distribution[i];
      
      if (reaction.colorIndex === colorIdx && reaction.intensityLevel === intensityLvl) {
        // Increment existing reaction
        reaction.count++;
        foundExisting = true;
        break;
      }
    }
    
    // Add new reaction if not found
    if (!foundExisting) {
      simulatedReactions.distribution.push({
        colorIndex: colorIdx,
        intensityLevel: intensityLvl,
        count: 1
      });
    }
    
    // Increment total count
    simulatedReactions.totalCount++;
    
    // Update reaction count text
    reactionCount.textContent = `${simulatedReactions.totalCount} reactions`;
    
    // Draw the heatmap
    drawHeatmap();
  }
  
  // Function to draw the heatmap visualization
  function drawHeatmap() {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = 160;
    const height = 30;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find maximum count for normalization
    let maxCount = 0;
    for (const reaction of simulatedReactions.distribution) {
      if (reaction.count > maxCount) maxCount = reaction.count;
    }
    
    // Create gradient based on color spectrum
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i < colorSpectrum.length; i++) {
      gradient.addColorStop(i / (colorSpectrum.length - 1), colorSpectrum[i]);
    }
    
    // Draw background
    ctx.fillStyle = '#f1f1f1';
    ctx.fillRect(0, 0, width, height);
    
    // Draw distribution
    for (const reaction of simulatedReactions.distribution) {
      const x = (reaction.colorIndex / (colorSpectrum.length - 1)) * width;
      const y = height - ((reaction.intensityLevel / 5) * height);
      const radius = Math.max(2, (reaction.count / maxCount) * 10);
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = colorSpectrum[reaction.colorIndex];
      ctx.fill();
    }
    
    // Draw border
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Make heatmap visible
    heatmap.style.display = 'block';
  }
  
  // Initialize the heatmap
  drawHeatmap();
}

// Add required CSS styles
function addEmotionSpectrumStyles() {
  if (document.getElementById('emotion-spectrum-styles')) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'emotion-spectrum-styles';
  
  styleElement.textContent = `
    .emotion-spectrum-container {
      position: relative;
      display: flex;
      align-items: center;
      margin: 5px 0;
    }
    
    .spectrum-preview {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 18px;
      background: #f5f5f5;
      transition: all 0.2s ease;
    }
    
    .spectrum-preview:hover {
      background: #eeeeee;
    }
    
    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #bdbdbd;
      margin-right: 6px;
      transition: all 0.3s ease;
    }
    
    .emotion-label {
      font-size: 14px;
      color: #757575;
      transition: all 0.3s ease;
    }
    
    .spectrum-popup {
      position: absolute;
      bottom: 40px;
      left: 0;
      display: none;
      width: 220px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      padding: 15px;
      z-index: 100;
    }
    
    .spectrum-track {
      position: relative;
      height: 100px;
      background: linear-gradient(to right, 
        #1e88e5, #26c6da, #66bb6a, #fdd835, #fb8c00, #e53935);
      border-radius: 6px;
      margin-bottom: 10px;
    }
    
    .spectrum-slider {
      position: absolute;
      width: 20px;
      height: 20px;
      background: #1e88e5;
      border-radius: 50%;
      top: 50%;
      left: 0%;
      transform: translate(-50%, -50%);
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 2;
    }
    
    .spectrum-intensity {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40%;
      background: rgba(255,255,255,0.25);
      border-radius: 0 0 6px 6px;
      cursor: ns-resize;
    }
    
    .emotion-terms {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 12px;
      color: #757575;
    }
    
    .emotion-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }
    
    .current-emotion {
      font-weight: 500;
      font-size: 14px;
      color: #424242;
    }
    
    .emotion-count {
      font-size: 12px;
      color: #9e9e9e;
    }
    
    .reaction-heatmap {
      margin-left: 15px;
      display: block;
    }
    
    .reaction-canvas {
      border-radius: 4px;
      display: block;
    }
    
    .reaction-count {
      font-size: 12px;
      color: #757575;
      margin-top: 4px;
      text-align: center;
    }
    
    .emotion-submit {
      display: block;
      margin: 10px auto 0;
      padding: 6px 15px;
      background: #f40752;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    
    .emotion-submit:hover {
      background: #d10643;
    }
    
    .reaction-emoji {
      position: absolute;
      left: 15px;
      bottom: 20px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      opacity: 1;
      transition: all 0.8s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Call this function to initialize the system
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(createEmotionSpectrumSystem, 1000); // Delay to ensure the page is fully loaded
});
