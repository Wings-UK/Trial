
    // Add this to your existing JavaScript code

// Keep track of comments for each post
const comments = {};

// Setup comment functionality
function setupCommentSystem() {
  const commentTextarea = document.querySelector('.comment-textarea');
  const sendButton = document.querySelector('.actions .caun[src="pics/arrow.png"]');
  const commentContainer = document.querySelector('.comment-container');
  
  if (!commentTextarea || !sendButton) return;
  
  // Auto-resize textarea as user types
  commentTextarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    
    // Show/hide send button based on content
    if (this.value.trim().length > 0) {
      sendButton.classList.add('active');
    } else {
      sendButton.classList.remove('active');
    }
  });
  
  // Handle comment submission
  sendButton.addEventListener('click', function() {
    submitComment();
  });
  
  // Also allow Enter key to submit (Shift+Enter for new line)
  commentTextarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  });
  
  // Create comments section if it doesn't exist
  if (!document.querySelector('.comments-section')) {
    const commentsSection = document.createElement('div');
    commentsSection.className = 'comments-section';
    commentContainer.parentNode.insertBefore(commentsSection, commentContainer);
  }
}

// Function to submit a comment
function submitComment() {
  const commentTextarea = document.querySelector('.comment-textarea');
  const commentText = commentTextarea.value.trim();
  
  if (commentText.length === 0) return;
  
  const postElement = document.querySelector('#nuba');
  const postId = postElement.querySelector('[data-post-id]')?.getAttribute('data-post-id');
  
  if (!postId) return;
  
  // Initialize comment array for this post if it doesn't exist
  if (!comments[postId]) {
    comments[postId] = [];
  }
  
  // Get current user
  const user = getLoggedInUser();
  
  // Create new comment object
  const newComment = {
    id: Date.now(), // use timestamp as unique ID
    postId: parseInt(postId),
    userId: user.id,
    username: user.username,
    userAvatar: user.avatar,
    text: commentText,
    timestamp: 'just now',
    likes: 0,
    replies: []
  };
  
  // Add to comment collection
  comments[postId].unshift(newComment);
  
  // Add to DOM
  addCommentToDOM(newComment);
  
  // Clear textarea and reset height
  commentTextarea.value = '';
  commentTextarea.style.height = 'auto';
  
  // Animate the new comment
  setTimeout(() => {
    const firstComment = document.querySelector('.comment-item');
    if (firstComment) {
      firstComment.classList.add('highlight');
      setTimeout(() => {
        firstComment.classList.remove('highlight');
      }, 1000);
    }
  }, 10);
}

// Function to add a comment to the DOM
function addCommentToDOM(comment, isReply = false, parentElement = null) {
  const commentsSection = parentElement || document.querySelector('.comments-section');
  
  if (!commentsSection) return;
  
  const commentElement = document.createElement('div');
  commentElement.className = isReply ? 'reply-item' : 'comment-item';
  commentElement.setAttribute('data-comment-id', comment.id);
  
  // Generate random engagement numbers
  const likeCount = comment.likes || Math.floor(Math.random() * 50);
  const replyCount = comment.replies?.length || 0;
  
  // Create emojis for reactions
  const reactions = [];
  const hasReactions = Math.random() > 0.5;
  
  if (hasReactions) {
    const possibleReactions = ['❤️', '👍', '😂', '🔥', '👏', '😮'];
    const reactionCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < reactionCount; i++) {
      const randIndex = Math.floor(Math.random() * possibleReactions.length);
      if (!reactions.includes(possibleReactions[randIndex])) {
        reactions.push(possibleReactions[randIndex]);
      }
    }
  }
  
  const reactionHTML = reactions.length ? 
    `<div class="comment-reactions">${reactions.join('')}</div>` : '';
  
  // Determine if verified
  const isVerified = Math.random() > 0.7;
  const verifiedBadge = isVerified ? 
    `<img class="verify-small" src="pics/verifi1.png">` : '';
  
  commentElement.innerHTML = `
    <div class="comment-avatar">
      <img src="${comment.userAvatar}" alt="Avatar">
    </div>
    <div class="comment-content">
      <div class="comment-header">
        <div class="comment-username">
          ${comment.username}
          ${verifiedBadge}
        </div>
        <div class="comment-time">${comment.timestamp}</div>
      </div>
      <div class="comment-text">${formatCommentText(comment.text)}</div>
      <div class="comment-actions">
        <div class="comment-action like-action">
          <img src="pics/lovv.png" alt="Like">
          <span>${likeCount}</span>
        </div>
        <div class="comment-action reply-action">
          <img src="pics/chat.png" alt="Reply">
          <span>Reply</span>
        </div>
        ${reactionHTML}
      </div>
    </div>
  `;
  
  // Add to beginning of comments section
  if (commentsSection.firstChild) {
    commentsSection.insertBefore(commentElement, commentsSection.firstChild);
  } else {
    commentsSection.appendChild(commentElement);
  }
  
  // Set up like functionality
  const likeAction = commentElement.querySelector('.like-action');
  likeAction.addEventListener('click', function() {
    this.classList.toggle('liked');
    const likeCountElement = this.querySelector('span');
    let count = parseInt(likeCountElement.textContent);
    
    if (this.classList.contains('liked')) {
      likeCountElement.textContent = count + 1;
    } else {
      likeCountElement.textContent = Math.max(0, count - 1);
    }
  });
  
  // Set up reply functionality
  const replyAction = commentElement.querySelector('.reply-action');
  replyAction.addEventListener('click', function() {
    const commentTextarea = document.querySelector('.comment-textarea');
    
    if (commentTextarea) {
      commentTextarea.value = `@${comment.username} `;
      commentTextarea.focus();
      
      // Scroll to textarea if needed
      window.scrollTo({
        top: commentTextarea.getBoundingClientRect().top + window.pageYOffset - 200,
        behavior: 'smooth'
      });
    }
  });
  
  return commentElement;
}

// Helper function to format comment text (handle mentions, hashtags, etc.)
function formatCommentText(text) {
  // Convert URLs to links
  text = text.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" class="comment-link">$1</a>'
  );
  
  // Convert @mentions to links
  text = text.replace(
    /(@\w+)/g, 
    '<a href="#" class="comment-mention">$1</a>'
  );
  
  // Convert #hashtags to links
  text = text.replace(
    /(#\w+)/g, 
    '<a href="#" class="comment-hashtag">$1</a>'
  );
  
  return text;
}

// Function to render existing comments for a post
function renderExistingComments(postId) {
  const commentsSection = document.querySelector('.comments-section');
  if (!commentsSection) return;
  
  // Clear existing comments
  commentsSection.innerHTML = '';
  
  // If no comments for this post, show a message
  if (!comments[postId] || comments[postId].length === 0) {
    const noCommentsElement = document.createElement('div');
    noCommentsElement.className = 'no-comments';
    noCommentsElement.innerHTML = '<p>Be the first to comment!</p>';
    commentsSection.appendChild(noCommentsElement);
    return;
  }
  
  // Add all comments for this post to the DOM
  comments[postId].forEach(comment => {
    addCommentToDOM(comment);
  });
}

// Modify your showDetail function to set up comments when a post is opened
const originalShowDetail = showDetail;
showDetail = function(postId) {
  originalShowDetail(postId);
  
  // Set up comment section after a short delay to ensure DOM is ready
  setTimeout(() => {
    setupCommentSystem();
    renderExistingComments(postId);
  }, 100);
};

// Add CSS styles for the comment system
function addCommentStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .comments-section {
     font-family: ibm plex sans, roboto;
      margin-top: 10px;
      padding-bottom: 5px;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .comment-item, .reply-item {
      display: flex;
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 12px;
      transition: background-color 0.3s ease;
      animation: fadeIn 0.3s ease-in-out;
    }
    
    .reply-item {
      margin-left: 40px;
      max-width: calc(100% - 40px);
    }
    
    .comment-item.highlight {
      background-color: rgba(244, 7, 82, 0.1);
    }
    
    .comment-avatar {
      width: 35px;
      height: 35px;
      border-radius: 8px;
      overflow: hidden;
      margin-right: 10px;
      flex-shrink: 0;
    }
    
    .comment-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .comment-content {
      flex: 1;
    }
    
    .comment-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    
    .comment-username {
     font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    
    .verify-small {
      width: 14px;
      height: 14px;
      margin-left: 4px;
    }
    
    .comment-time {
      font-size: 12px;
      color: #777;
    }
    
    .comment-text {
     font-size: 16px;
      margin-bottom: 8px;
      line-height: 21px;
      word-break: break-word;
    }
    
    .comment-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .comment-action {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      font-size: 13px;
      color: #555;
    }
    
    .comment-action img {
      width: 16px;
      height: 16px;
      opacity: 0.7;
      transition: all 0.2s ease;
    }
    
    .comment-action:hover img {
      opacity: 1;
      transform: scale(1.1);
    }
    
    .comment-action.liked {
      color: #F4075A;
    }
    
    .comment-action.liked img {
      opacity: 1;
      filter: hue-rotate(300deg) saturate(1.5);
    }
    
    .comment-reactions {
      display: flex;
      margin-left: auto;
      font-size: 14px;
    }
    
    .comment-textarea {
      transition: height 0.2s ease;
      resize: none;
      overflow: hidden;
    }
    
    .comment-container .actions .caun[src="pics/arrow.png"] {
      opacity: 0.5;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .comment-container .actions .caun[src="pics/arrow.png"].active {
      opacity: 1;
      transform: scale(1.1);
    }
    
    .comment-container .actions .caun[src="pics/arrow.png"]:hover {
      opacity: 1;
      transform: scale(1.1);
    }
    
    .comment-link, .comment-mention, .comment-hashtag {
      text-decoration: none;
    }
    
    .comment-link {
      color: #1DA1F2;
    }
    
    .comment-mention {
      color: #F4075A;
      font-weight: 500;
    }
    
    .comment-hashtag {
      color: #1DA1F2;
      font-weight: 500;
    }
    
    .no-comments {
      text-align: center;
      padding: 20px;
      color: #777;
      font-style: italic;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Call this when the document is ready
document.addEventListener('DOMContentLoaded', function() {
  addCommentStyles();
  
  // Create some sample comments for posts
  posts.forEach(post => {
    comments[post.id] = generateSampleComments(post.id, 0);
  });
});

// Generate random sample comments for testing
function generateSampleComments(postId, count) {
  const sampleComments = [];
  const commentCount = count || Math.floor(Math.random() * 5);
  
  const sampleUsers = [
    { id: 100, username: "@sarah_j", avatar: "pics/girl2.webp" },
    { id: 101, username: "@tech_guy", avatar: "pics/man3.webp" },
    { id: 102, username: "@music_lover", avatar: "pics/man4.jpg" },
    { id: 103, username: "@fitness_freak", avatar: "pics/pico8.webp" },
    { id: 104, username: "@art_enthusiast", avatar: "pics/mypics.jpg" }
  ];
  
  const sampleTexts = [
    "This is so relatable! 😂",
    "I completely agree with you on this one.",
    "Have you tried the alternative approach? It might work better!",
    "This made my day! Thanks for sharing 🙌",
    "I had a similar experience last month. It's challenging!",
    "Not sure if I agree, but interesting perspective!",
    "First time seeing something like this. Very cool!",
    "Can you share more details about this? I'm curious.",
    "This is exactly what I needed to see today 💯",
    "Mind blown! 🤯 Never thought about it this way before."
  ];
  
  const sampleTimes = [
    "2 minutes ago",
    "5 minutes ago",
    "15 minutes ago",
    "an hour ago",
    "2 hours ago",
    "yesterday",
    "2 days ago"
  ];
  
  for (let i = 0; i < commentCount; i++) {
    const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    const time = sampleTimes[Math.floor(Math.random() * sampleTimes.length)];
    const likes = Math.floor(Math.random() * 50);
    
    sampleComments.push({
      id: postId * 1000 + i,
      postId: postId,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      text: text,
      timestamp: time,
      likes: likes,
      replies: []
    });
  }
  
  return sampleComments;
}

document.addEventListener('DOMContentLoaded', function() {
    addCommentStyles(); // Add CSS for comments
});