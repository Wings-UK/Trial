function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    
    // Adjust parent container
    const container = textarea.parentElement;
    const totalHeight = textarea.scrollHeight + 60; // Add extra space for toolbar
    container.style.height = Math.min(Math.max(90, totalHeight), 300) + 'px';
}


    const textarea = document.querySelector('.comment-textarea');
    const sendButton = document.querySelector('.send-btn');

    // Function to adjust textarea height
    function adjustHeight() {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // Handle textarea input
    textarea.addEventListener('input', (e) => {
      adjustHeight();
      sendButton.disabled = !e.target.value.trim();
    });

    // Handle key press (Enter to send)
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (textarea.value.trim()) {
          sendMessage();
        }
      }
    });

    // Handle send button click
    sendButton.addEventListener('click', () => {
      if (textarea.value.trim()) {
        sendMessage();
      }
    });

    function sendMessage() {
      console.log('Sending message:', textarea.value);
      textarea.value = '';
      adjustHeight();
      sendButton.disabled = true;
    }

    // Initialize height
    adjustHeight();
    
    function addComment() {
    const commentTextarea = document.querySelector('.comment-textarea');
    const commentText = commentTextarea.value.trim();

    if (commentText === '') return; // Prevent empty comments

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const commentContainer = document.createElement("div");
    commentContainer.classList.add("comment");

    commentContainer.innerHTML = `
        <div class="comment-header">
            <img src="${loggedInUser.avatar}" class="comment-avatar">
            <p class="comment-username">${loggedInUser.username}</p>
        </div>
        <div class="comment-content">${commentText}</div>
    `;

    const postDetailContainer = document.getElementById("nuba"); // The container for the post
    postDetailContainer.appendChild(commentContainer); // Append the new comment

    commentTextarea.value = ""; // Clear the textarea after submission
}