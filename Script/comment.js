
    // Add this to your existing JavaScript code

// Keep track of comments for each post
const comments = {};

// Setup comment functionality
function setupCommentSystem() {
  const commentTextarea = document.querySelector('.comment-textarea');
  const sendButton = document.querySelector('.actions .caun[src="pics/up.svg"]');
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
    `<img class="verify-small" src="pics/very.svg">` : '';
  
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
      commentTextarea.value = `${comment.username} `;
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
      padding-bottom: 120px;
      overflow-y: auto;
    }
    
    .comment-item, .reply-item {
    border: 1px solid rgb(245, 245, 245);
      display: flex;
      margin-bottom: 5px;
      align-items: top;
      padding: 5px 15px;
      border-radius: 12px;
      transition: background-color 0.3s ease;
      animation: fadeIn 0.3s ease-in-out;
    }
    
    .comment-item:hover {
      background-color: rgb(250, 250, 250);  
    }
    
    
    .reply-item {
      margin-left: 40px; 
      max-width: calc(100% - 40px);
    }
    
    .comment-item.highlight {
      background-color: rgba(244, 7, 82, 0.1);
    }
    
    .comment-avatar {
      width: 36px;
      height: 36px;
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
      margin-bottom: 2px;
      justify-content: space-between;
    }
    
    .comment-username {
     font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    
    .verify-small {
      width: 12px;
      height: 12px;
      margin-left: 4px;
    }
    
    .comment-time {
      font-size: 12px;
      color: #777;
    }
    
    .comment-text {
     font-size: 15px;
      margin-bottom: 8px;
      line-height: 20px;
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

// ═══════════════════════════════════════════════════════════════
//  COMMENTS SYSTEM — Drop-in addition to view.js
//  ✦ Supabase-backed  ✦ Real-time  ✦ Replies  ✦ Reactions
// ═══════════════════════════════════════════════════════════════

// ── 1. INJECT STYLES ────────────────────────────────────────────
(function injectCommentStyles() {
    if (document.getElementById('comment-section-styles')) return;
    const s = document.createElement('style');
    s.id = 'comment-section-styles';
    s.textContent = `
/* ─── Google Font ─────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');

/* ─── Section Wrapper ──────────────────────────────────────── */
.cs-section {
    margin: 0;
    padding: 0 0 120px;
    font-family: 'DM Sans', sans-serif;
    background: #fff;
}

/* ─── Section Header ───────────────────────────────────────── */
.cs-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 16px 10px;
    border-top: 1px solid #f0f0f0;
}
.cs-header-title {
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    color: #111;
    letter-spacing: -0.5px;
}
.cs-header-count {
    background: #f40752;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 20px;
    padding: 2px 8px;
    letter-spacing: 0.3px;
    min-width: 22px;
    text-align: center;
}

/* ─── Sort Pills ───────────────────────────────────────────── */
.cs-sort-bar {
    display: flex;
    gap: 8px;
    padding: 0 16px 14px;
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.cs-sort-bar::-webkit-scrollbar { display: none; }
.cs-sort-pill {
    flex-shrink: 0;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 12.5px;
    font-weight: 500;
    border: 1.5px solid #e8e8e8;
    color: #666;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
}
.cs-sort-pill.active {
    border-color: #111;
    background: #111;
    color: #fff;
}

/* ─── Empty State ──────────────────────────────────────────── */
.cs-empty {
    text-align: center;
    padding: 40px 20px;
    color: #aaa;
}
.cs-empty-icon {
    font-size: 36px;
    margin-bottom: 10px;
    opacity: 0.5;
}
.cs-empty p {
    font-size: 14px;
    color: #bbb;
}

/* ─── Comment Card ─────────────────────────────────────────── */
.cs-comment {
    padding: 14px 16px 0;
    position: relative;
    animation: cs-slide-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.cs-comment.cs-reply {
    padding-left: 54px;
}
@keyframes cs-slide-in {
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
.cs-comment-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
}

/* ─── Avatar ───────────────────────────────────────────────── */
.cs-avatar-wrap {
    position: relative;
    flex-shrink: 0;
}
.cs-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
}
.cs-comment.cs-reply .cs-avatar {
    width: 28px;
    height: 28px;
}
.cs-avatar-thread {
    position: absolute;
    left: 50%;
    top: 38px;
    bottom: -14px;
    width: 1.5px;
    background: linear-gradient(to bottom, #e0e0e0, transparent);
    transform: translateX(-50%);
}

/* ─── Body ─────────────────────────────────────────────────── */
.cs-body {
    flex: 1;
    min-width: 0;
}
.cs-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 3px;
}
.cs-username {
    font-size: 13px;
    font-weight: 600;
    color: #111;
    cursor: pointer;
}
.cs-username:hover { text-decoration: underline; }
.cs-badge-author {
    font-size: 10px;
    font-weight: 700;
    background: linear-gradient(135deg, #f40752, #ff6b35);
    color: #fff;
    padding: 1px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}
.cs-time {
    font-size: 11.5px;
    color: #bbb;
    margin-left: auto;
}
.cs-text {
    font-size: 14px;
    line-height: 1.55;
    color: #222;
    white-space: pre-wrap;
    word-break: break-word;
}
.cs-mention {
    color: #f40752;
    font-weight: 500;
}

/* ─── Actions Row ──────────────────────────────────────────── */
.cs-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
    padding-bottom: 14px;
}
.cs-action-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #999;
    cursor: pointer;
    transition: color 0.2s ease;
    user-select: none;
    background: none;
    border: none;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
}
.cs-action-btn:hover { color: #333; }
.cs-action-btn svg { width: 15px; height: 15px; }

/* ─── Like Button ──────────────────────────────────────────── */
.cs-like-btn.liked { color: #f40752; }
.cs-like-btn.liked svg path { stroke: #f40752; fill: #f40752; }
@keyframes cs-like-pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.5); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); }
}
.cs-like-btn.animate svg { animation: cs-like-pop 0.4s ease; }

/* ─── Reply Button ─────────────────────────────────────────── */
.cs-reply-btn:hover { color: #f40752; }

/* ─── Delete Button ────────────────────────────────────────── */
.cs-delete-btn:hover { color: #f40752; }

/* ─── Replies Toggle ───────────────────────────────────────── */
.cs-replies-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0 10px 54px;
    font-size: 12.5px;
    font-weight: 600;
    color: #888;
    cursor: pointer;
    transition: color 0.2s;
}
.cs-replies-toggle:hover { color: #f40752; }
.cs-replies-toggle::before {
    content: '';
    width: 24px;
    height: 1.5px;
    background: currentColor;
    display: block;
}
.cs-replies-list {
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ─── Inline Reply Box ─────────────────────────────────────── */
.cs-inline-reply {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 8px 16px 12px 54px;
    animation: cs-slide-in 0.2s ease;
}
.cs-inline-reply textarea {
    flex: 1;
    border: 1.5px solid #e8e8e8;
    border-radius: 20px;
    padding: 8px 14px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    resize: none;
    outline: none;
    line-height: 1.5;
    min-height: 38px;
    max-height: 120px;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: #fafafa;
    color: #111;
}
.cs-inline-reply textarea:focus {
    border-color: #111;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}
.cs-inline-reply-send {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #111;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    flex-shrink: 0;
    margin-top: 2px;
}
.cs-inline-reply-send:hover { background: #f40752; transform: scale(1.05); }
.cs-inline-reply-send:active { transform: scale(0.95); }
.cs-inline-reply-send svg { width: 15px; height: 15px; }

/* ─── Load More ────────────────────────────────────────────── */
.cs-load-more {
    text-align: center;
    padding: 16px;
}
.cs-load-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 22px;
    border: 1.5px solid #e0e0e0;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    cursor: pointer;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s ease;
}
.cs-load-more-btn:hover {
    border-color: #111;
    color: #111;
}

/* ─── Skeleton ─────────────────────────────────────────────── */
.cs-skeleton-comment {
    padding: 14px 16px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
}
.cs-sk-circle {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: #f0f0f0;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
}
.cs-sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.cs-sk-line {
    height: 12px; border-radius: 6px; background: #f0f0f0;
    position: relative; overflow: hidden;
}
.cs-sk-line.short { width: 40%; }
.cs-sk-line.medium { width: 70%; }
.cs-sk-line.long { width: 90%; }
.cs-sk-circle::after, .cs-sk-line::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: cs-shimmer 1.4s infinite;
}
@keyframes cs-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* ─── Divider ──────────────────────────────────────────────── */
.cs-divider {
    height: 1px;
    background: #f5f5f5;
    margin: 0 16px;
}

/* ─── Reaction Chips on post-level ────────────────────────── */
.cs-post-reactions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 4px 16px 14px;
}
.cs-react-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border-radius: 16px;
    border: 1.5px solid #f0f0f0;
    font-size: 12.5px;
    color: #555;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
}
.cs-react-chip:hover { border-color: #ccc; background: #fafafa; }
.cs-react-chip.active { border-color: #f40752; background: #fff5f7; color: #f40752; font-weight: 600; }
.cs-react-chip span:first-child { font-size: 15px; }

/* ─── New comment toast ────────────────────────────────────── */
.cs-new-toast {
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #111;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 20px;
    border-radius: 20px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 9999;
    white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
}
.cs-new-toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
`;
    document.head.appendChild(s);
})();

// ── 2. SUPABASE TABLE SETUP INSTRUCTIONS ───────────────────────
// Run this SQL in your Supabase SQL editor once:
/*
CREATE TABLE IF NOT EXISTS comments (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id   uuid        REFERENCES comments(id) ON DELETE CASCADE,
    content     text        NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
    like_count  integer     NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comment_likes (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id  uuid        NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE(comment_id, user_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);

-- Function to increment/decrement comment like count
CREATE OR REPLACE FUNCTION increment_comment_like(cid uuid, delta integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    UPDATE comments SET like_count = GREATEST(0, like_count + delta) WHERE id = cid;
END;
$$;

-- Function to increment post comment_count
CREATE OR REPLACE FUNCTION increment_post_comment_count(pid uuid, delta integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    UPDATE posts SET comment_count = GREATEST(0, comment_count + delta) WHERE id = pid;
END;
$$;

-- Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public comments viewable" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public comment likes viewable" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can like comments" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike comments" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
*/

// ── 3. MAIN COMMENT ENGINE ──────────────────────────────────────

const CommentSection = {
    postId: null,
    postAuthorId: null,
    comments: [],
    commentLimit: 10,
    commentOffset: 0,
    hasMore: false,
    sort: 'newest',    // 'newest' | 'oldest' | 'top'
    realtimeChannel: null,
    likedCommentIds: new Set(),

    // ── Bootstrap ──────────────────────────────────────────────
    async mount(postId, postAuthorId, containerSelector = '#nuba') {
        this.postId = postId;
        this.postAuthorId = postAuthorId;
        this.comments = [];
        this.commentOffset = 0;
        this.hasMore = false;
        this.likedCommentIds = new Set();

        const parent = document.querySelector(containerSelector);
        if (!parent) return;

        // Remove any existing section
        parent.querySelector('.cs-section')?.remove();

        const section = document.createElement('div');
        section.className = 'cs-section';
        section.id = 'cs-main';
        parent.appendChild(section);

        // Render skeleton immediately
        this._renderSkeleton(section);

        // Fetch likes by current user
        await this._fetchMyLikes();

        // Load first batch
        await this._loadComments(section);

        // Subscribe to real-time
        this._subscribeRealtime(section);

        // Wire up the existing submit button
        this._wireExistingCommentBox(postId);
    },

    // ── Wire existing comment box ───────────────────────────────
    _wireExistingCommentBox(postId) {
        // Override the global submitComment
        window.submitComment = async () => {
            const textarea = document.querySelector('.comment-textarea');
            if (!textarea) return;
            const text = textarea.value.trim();
            if (!text) return;

            textarea.disabled = true;
            try {
                await this.submitComment(postId, text);
                textarea.value = '';
                textarea.style.height = 'auto';
                this._showToast('💬 Comment posted!');
            } catch (e) {
                console.error('submitComment error', e);
                alert('Could not post comment. Please try again.');
            } finally {
                textarea.disabled = false;
                textarea.focus();
            }
        };

        // Enter key support (shift+enter = newline)
        const textarea = document.querySelector('.comment-textarea');
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    window.submitComment();
                }
            });
        }
    },

    // ── Fetch my liked comment IDs ──────────────────────────────
    async _fetchMyLikes() {
        if (!currentUserId) return;
        const { data } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_id', currentUserId);
        if (data) data.forEach(r => this.likedCommentIds.add(r.comment_id));
    },

    // ── Load comments from Supabase ────────────────────────────
    async _loadComments(section, append = false) {
        let query = supabase
            .from('comments')
            .select(`
                id, content, created_at, like_count, parent_id, user_id,
                user:users(id, username, avatar)
            `)
            .eq('post_id', this.postId)
            .is('parent_id', null);

        if (this.sort === 'newest') query = query.order('created_at', { ascending: false });
        else if (this.sort === 'oldest') query = query.order('created_at', { ascending: true });
        else if (this.sort === 'top') query = query.order('like_count', { ascending: false });

        query = query.range(this.commentOffset, this.commentOffset + this.commentLimit - 1);

        const { data, error } = await query;
        if (error) { console.error('Comments load error', error); return; }

        this.hasMore = data.length === this.commentLimit;
        this.commentOffset += data.length;

        if (!append) this.comments = data;
        else this.comments.push(...data);

        this._render(section, append);
    },

    // ── Submit a new top-level comment ─────────────────────────
    async submitComment(postId, content) {
        if (!currentUserId) throw new Error('Not logged in');
        if (!content.trim()) return;

        const { data, error } = await supabase.from('comments').insert({
            post_id: postId,
            user_id: currentUserId,
            content: content.trim(),
        }).select(`
            id, content, created_at, like_count, parent_id, user_id,
            user:users(id, username, avatar)
        `).single();

        if (error) throw error;

        // Increment post comment_count
        await supabase.rpc('increment_post_comment_count', { pid: postId, delta: 1 });

        return data;
    },

    // ── Submit a reply ─────────────────────────────────────────
    async submitReply(postId, parentId, content, replyInput) {
        if (!currentUserId) { alert('Please sign in to reply'); return; }
        if (!content.trim()) return;

        replyInput.disabled = true;
        const { data, error } = await supabase.from('comments').insert({
            post_id: postId,
            user_id: currentUserId,
            parent_id: parentId,
            content: content.trim(),
        }).select(`
            id, content, created_at, like_count, parent_id, user_id,
            user:users(id, username, avatar)
        `).single();

        replyInput.disabled = false;

        if (error) { console.error('Reply error', error); return; }

        await supabase.rpc('increment_post_comment_count', { pid: postId, delta: 1 });

        // Inject reply into DOM
        this._injectReply(data, parentId);
        this._showToast('↩ Reply sent!');
        return data;
    },

    // ── Toggle like on a comment ───────────────────────────────
    async toggleCommentLike(commentId, btn, countEl) {
        if (!currentUserId) { alert('Sign in to like'); return; }

        const liked = this.likedCommentIds.has(commentId);
        const count = parseInt(countEl.textContent || '0', 10);
        const newLiked = !liked;
        const newCount = newLiked ? count + 1 : Math.max(0, count - 1);

        // Optimistic
        this.likedCommentIds[newLiked ? 'add' : 'delete'](commentId);
        btn.classList.toggle('liked', newLiked);
        btn.classList.add('animate');
        setTimeout(() => btn.classList.remove('animate'), 500);
        countEl.textContent = newCount || '';

        try {
            if (newLiked) {
                await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: currentUserId });
            } else {
                await supabase.from('comment_likes').delete()
                    .eq('comment_id', commentId).eq('user_id', currentUserId);
            }
            await supabase.rpc('increment_comment_like', { cid: commentId, delta: newLiked ? 1 : -1 });
        } catch (e) {
            // Revert
            this.likedCommentIds[newLiked ? 'delete' : 'add'](commentId);
            btn.classList.toggle('liked', !newLiked);
            countEl.textContent = count || '';
        }
    },

    // ── Delete a comment ───────────────────────────────────────
    async deleteComment(commentId, el) {
        if (!confirm('Delete this comment?')) return;
        const { error } = await supabase.from('comments').delete().eq('id', commentId);
        if (error) { console.error('Delete error', error); return; }

        await supabase.rpc('increment_post_comment_count', { pid: this.postId, delta: -1 });

        // Animate out
        el.style.transition = 'opacity 0.3s, transform 0.3s';
        el.style.opacity = '0';
        el.style.transform = 'scale(0.95)';
        setTimeout(() => el.remove(), 320);

        // Update count badge
        this._updateCountBadge(-1);
    },

    // ── Fetch replies for a comment ────────────────────────────
    async fetchReplies(parentId) {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                id, content, created_at, like_count, parent_id, user_id,
                user:users(id, username, avatar)
            `)
            .eq('post_id', this.postId)
            .eq('parent_id', parentId)
            .order('created_at', { ascending: true });
        if (error) return [];
        return data || [];
    },

    // ── Real-time subscription ──────────────────────────────────
    _subscribeRealtime(section) {
        if (this.realtimeChannel) supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = supabase
            .channel(`comments:${this.postId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'comments',
                filter: `post_id=eq.${this.postId}`,
            }, async (payload) => {
                const newComment = payload.new;
                if (newComment.user_id === currentUserId) return; // already added optimistically

                // Fetch user data for the new comment
                const { data: userData } = await supabase
                    .from('users').select('id, username, avatar').eq('id', newComment.user_id).single();
                newComment.user = userData || { username: '@unknown', avatar: 'pics/default-avatar.png' };

                if (!newComment.parent_id) {
                    // Top-level: prepend if sort=newest
                    if (this.sort === 'newest') {
                        this.comments.unshift(newComment);
                        const list = section.querySelector('.cs-list');
                        if (list) list.prepend(this._buildCard(newComment));
                        this._updateCountBadge(1);
                        this._showToast('💬 New comment!');
                    }
                } else {
                    // Reply: inject if visible
                    this._injectReply(newComment, newComment.parent_id);
                }
            })
            .subscribe();
    },

    // ── Render skeleton ────────────────────────────────────────
    _renderSkeleton(section) {
        section.innerHTML = `
            <div class="cs-header">
                <div class="cs-header-title">Replies</div>
            </div>
            ${[1,2,3].map(() => `
                <div class="cs-skeleton-comment">
                    <div class="cs-sk-circle"></div>
                    <div class="cs-sk-lines">
                        <div class="cs-sk-line short"></div>
                        <div class="cs-sk-line long"></div>
                        <div class="cs-sk-line medium"></div>
                    </div>
                </div>
            `).join('')}
        `;
    },

    // ── Main render ────────────────────────────────────────────
    _render(section, append = false) {
        const totalText = this.comments.length + (this.hasMore ? '+' : '');

        if (!append) {
            section.innerHTML = `
                <div class="cs-header">
                    <div class="cs-header-title">Replies</div>
                    <div class="cs-header-count" id="cs-count">${totalText}</div>
                </div>
                <div class="cs-sort-bar">
                    <div class="cs-sort-pill ${this.sort==='newest'?'active':''}" data-sort="newest">Newest</div>
                    <div class="cs-sort-pill ${this.sort==='oldest'?'active':''}" data-sort="oldest">Oldest</div>
                    <div class="cs-sort-pill ${this.sort==='top'?'active':''}" data-sort="top">Top</div>
                </div>
                <div class="cs-list" id="cs-list"></div>
                <div class="cs-load-more" id="cs-load-more" style="display:none">
                    <button class="cs-load-more-btn">Show more replies ↓</button>
                </div>
            `;

            // Sort pill listeners
            section.querySelectorAll('.cs-sort-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    this.sort = pill.dataset.sort;
                    this.commentOffset = 0;
                    this.comments = [];
                    this._loadComments(section, false);
                });
            });

            // Load more
            const loadMoreBtn = section.querySelector('.cs-load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => this._loadComments(section, true));
            }
        }

        const list = section.querySelector('#cs-list') || section.querySelector('.cs-list');
        if (!list) return;

        if (this.comments.length === 0 && !append) {
            list.innerHTML = `
                <div class="cs-empty">
                    <div class="cs-empty-icon">💬</div>
                    <p>No replies yet. Be the first!</p>
                </div>
            `;
        } else {
            const frag = document.createDocumentFragment();
            const startIndex = append ? this.comments.length - (this.commentOffset - (this.commentOffset - this.comments.length + (this.hasMore ? this.commentLimit : this.comments.length % this.commentLimit || this.commentLimit))) : 0;

            const toRender = append
                ? this.comments.slice(-Math.min(this.commentLimit, this.comments.length))
                : this.comments;

            toRender.forEach((c, i) => {
                const card = this._buildCard(c);
                card.style.animationDelay = `${i * 0.06}s`;
                frag.appendChild(card);
            });
            if (!append) list.innerHTML = '';
            list.appendChild(frag);
        }

        // Show/hide load more
        const loadMore = section.querySelector('#cs-load-more');
        if (loadMore) loadMore.style.display = this.hasMore ? 'block' : 'none';

        // Update count
        const badge = section.querySelector('#cs-count');
        if (badge) badge.textContent = totalText;
    },

    // ── Build a single comment card ─────────────────────────────
    _buildCard(comment) {
        const isAuthor = comment.user_id === this.postAuthorId;
        const isOwn    = comment.user_id === currentUserId;
        const isLiked  = this.likedCommentIds.has(comment.id);
        const ago      = formatTimeSince(comment.created_at);
        const avatar   = comment.user?.avatar || 'pics/default-avatar.png';
        const username = comment.user?.username || '@unknown';

        const card = document.createElement('div');
        card.className = 'cs-comment';
        card.dataset.commentId = comment.id;

        // thread line placeholder — real height set after replies load
        card.innerHTML = `
            <div class="cs-comment-row">
                <div class="cs-avatar-wrap">
                    <img class="cs-avatar" src="${avatar}"
                         onerror="this.src='pics/default-avatar.png'"
                         onclick="${isOwn ? 'showMyProfile()' : `showProfile('${comment.user_id}')`}">
                    <div class="cs-avatar-thread" id="thread-${comment.id}" style="display:none"></div>
                </div>
                <div class="cs-body">
                    <div class="cs-meta">
                        <span class="cs-username"
                              onclick="${isOwn ? 'showMyProfile()' : `showProfile('${comment.user_id}')`}">${username}</span>
                        ${isAuthor ? '<span class="cs-badge-author">Author</span>' : ''}
                        <span class="cs-time">${ago}</span>
                    </div>
                    <div class="cs-text">${this._parseText(comment.content)}</div>
                    <div class="cs-actions">
                        <button class="cs-action-btn cs-like-btn ${isLiked ? 'liked' : ''}"
                                data-comment-id="${comment.id}">
                            <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span class="cs-like-count">${comment.like_count || ''}</span>
                        </button>
                        <button class="cs-action-btn cs-reply-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            Reply
                        </button>
                        ${isOwn ? `
                        <button class="cs-action-btn cs-delete-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                            </svg>
                        </button>` : ''}
                    </div>
                </div>
            </div>
            <div class="cs-replies-area" id="replies-area-${comment.id}"></div>
        `;

        // ── Like ────────────────────────────────────────────────
        const likeBtn  = card.querySelector('.cs-like-btn');
        const countEl  = card.querySelector('.cs-like-count');
        likeBtn.addEventListener('click', () => this.toggleCommentLike(comment.id, likeBtn, countEl));

        // ── Reply ───────────────────────────────────────────────
        const replyBtn = card.querySelector('.cs-reply-btn');
        const repliesArea = card.querySelector(`#replies-area-${comment.id}`);
        let repliesLoaded = false;
        let replyBoxOpen = false;

        replyBtn.addEventListener('click', async () => {
            if (!repliesLoaded) {
                await this._loadAndShowReplies(comment.id, repliesArea, card);
                repliesLoaded = true;
            }
            replyBoxOpen = !replyBoxOpen;
            if (replyBoxOpen) this._showInlineReply(comment.id, username, repliesArea);
            else repliesArea.querySelector('.cs-inline-reply')?.remove();
        });

        // ── Delete ──────────────────────────────────────────────
        card.querySelector('.cs-delete-btn')?.addEventListener('click', () => this.deleteComment(comment.id, card));

        return card;
    },

    // ── Load & render replies ───────────────────────────────────
    async _loadAndShowReplies(parentId, repliesArea, card) {
        const replies = await this.fetchReplies(parentId);
        if (!replies.length) return;

        // Show thread line
        card.querySelector(`#thread-${parentId}`)?.setAttribute('style', 'display:block');

        const toggle = document.createElement('div');
        toggle.className = 'cs-replies-toggle';
        toggle.textContent = `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`;

        const list = document.createElement('div');
        list.className = 'cs-replies-list';
        list.id = `replies-list-${parentId}`;
        list.style.maxHeight = '0px';

        replies.forEach(r => {
            const replyCard = this._buildReplyCard(r);
            list.appendChild(replyCard);
        });

        let expanded = false;
        toggle.addEventListener('click', () => {
            expanded = !expanded;
            list.style.maxHeight = expanded ? list.scrollHeight + 'px' : '0px';
            toggle.textContent = expanded
                ? `Hide ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
                : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`;
        });

        repliesArea.prepend(list);
        repliesArea.prepend(toggle);
    },

    // ── Build a reply card ──────────────────────────────────────
    _buildReplyCard(reply) {
        const isOwn   = reply.user_id === currentUserId;
        const isLiked = this.likedCommentIds.has(reply.id);
        const avatar  = reply.user?.avatar || 'pics/default-avatar.png';
        const username = reply.user?.username || '@unknown';
        const ago     = formatTimeSince(reply.created_at);

        const card = document.createElement('div');
        card.className = 'cs-comment cs-reply';
        card.dataset.commentId = reply.id;
        card.innerHTML = `
            <div class="cs-comment-row">
                <div class="cs-avatar-wrap">
                    <img class="cs-avatar" src="${avatar}"
                         onerror="this.src='pics/default-avatar.png'"
                         onclick="${isOwn ? 'showMyProfile()' : `showProfile('${reply.user_id}')`}">
                </div>
                <div class="cs-body">
                    <div class="cs-meta">
                        <span class="cs-username"
                              onclick="${isOwn ? 'showMyProfile()' : `showProfile('${reply.user_id}')`}">${username}</span>
                        <span class="cs-time">${ago}</span>
                    </div>
                    <div class="cs-text">${this._parseText(reply.content)}</div>
                    <div class="cs-actions">
                        <button class="cs-action-btn cs-like-btn ${isLiked ? 'liked' : ''}" data-comment-id="${reply.id}">
                            <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span class="cs-like-count">${reply.like_count || ''}</span>
                        </button>
                        ${isOwn ? `
                        <button class="cs-action-btn cs-delete-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                            </svg>
                        </button>` : ''}
                    </div>
                </div>
            </div>
        `;

        const likeBtn = card.querySelector('.cs-like-btn');
        const countEl = card.querySelector('.cs-like-count');
        likeBtn.addEventListener('click', () => this.toggleCommentLike(reply.id, likeBtn, countEl));
        card.querySelector('.cs-delete-btn')?.addEventListener('click', () => this.deleteComment(reply.id, card));

        return card;
    },

    // ── Inline reply box ────────────────────────────────────────
    _showInlineReply(parentId, parentUsername, repliesArea) {
        repliesArea.querySelector('.cs-inline-reply')?.remove();

        const wrap = document.createElement('div');
        wrap.className = 'cs-inline-reply';

        const myAvatar = document.getElementById('usero')?.src || 'pics/default-avatar.png';
        wrap.innerHTML = `
            <img class="cs-avatar" src="${myAvatar}" onerror="this.src='pics/default-avatar.png'">
            <textarea placeholder="Reply to ${parentUsername}…" rows="1"></textarea>
            <button class="cs-inline-reply-send" title="Send reply">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
            </button>
        `;

        const ta   = wrap.querySelector('textarea');
        const btn  = wrap.querySelector('.cs-inline-reply-send');

        // Auto-resize textarea
        ta.addEventListener('input', () => {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
        });

        ta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                btn.click();
            }
        });

        btn.addEventListener('click', async () => {
            const text = ta.value.trim();
            if (!text) return;
            await this.submitReply(this.postId, parentId, text, ta);
            ta.value = '';
            ta.style.height = 'auto';
        });

        repliesArea.appendChild(wrap);
        requestAnimationFrame(() => ta.focus());
    },

    // ── Inject a reply card directly into DOM ───────────────────
    _injectReply(reply, parentId) {
        const area = document.getElementById(`replies-area-${parentId}`);
        if (!area) return;

        let list = document.getElementById(`replies-list-${parentId}`);
        if (!list) {
            // Create toggle + list if not already there
            const toggle = document.createElement('div');
            toggle.className = 'cs-replies-toggle';
            list = document.createElement('div');
            list.className = 'cs-replies-list';
            list.id = `replies-list-${parentId}`;
            list.style.maxHeight = 'none';
            area.prepend(list);
            area.prepend(toggle);
        }

        const card = this._buildReplyCard(reply);
        list.appendChild(card);
        list.style.maxHeight = 'none';

        // Update toggle text
        const toggle = area.querySelector('.cs-replies-toggle');
        if (toggle) {
            const count = list.querySelectorAll('.cs-reply').length;
            toggle.textContent = `${count} ${count === 1 ? 'reply' : 'replies'}`;
        }

        this._updateCountBadge(1);
    },

    // ── Update count badge ──────────────────────────────────────
    _updateCountBadge(delta) {
        const badge = document.getElementById('cs-count');
        if (!badge) return;
        const current = parseInt(badge.textContent.replace('+', ''), 10) || 0;
        badge.textContent = current + delta;
    },

    // ── Parse @mentions and make them pink ─────────────────────
    _parseText(text) {
        if (!text) return '';
        return text.replace(/(@\w+)/g, '<span class="cs-mention">$1</span>');
    },

    // ── Toast notification ──────────────────────────────────────
    _showToast(message) {
        let toast = document.getElementById('cs-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'cs-new-toast';
            toast.id = 'cs-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    },
};

// ── 4. PATCH showDetail() to mount CommentSection after render ──
// Save reference to original showDetail
const _originalShowDetail = showDetail;

window.showDetail = async function(postId) {
    await _originalShowDetail(postId);

    // Wait a tick for nuba to be populated
    await new Promise(r => setTimeout(r, 0));

    // Grab the post's author id from the rendered nuba
    const nuba = document.getElementById('nuba');
    const postEl = nuba?.querySelector('[data-post-id]');
    const authorId = postEl ? null : null; // We'll fetch from Supabase below

    // Get author id from Supabase
    let postAuthorId = null;
    try {
        const { data } = await supabase.from('posts').select('user_id').eq('id', postId).single();
        postAuthorId = data?.user_id || null;
    } catch(_) {}

    // Mount the comment section
    await CommentSection.mount(postId, postAuthorId, '#nuba');
};

