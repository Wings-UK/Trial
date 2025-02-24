// Function to render a post dynamically
function renderPost(post) {
    const user = getUserById(post.userId); // Fetch user details using the userId
    return `
        <div class="post" onclick="openPostDetail(${post.id})">
            <div class="post-header">
                <img class="profile-pic" src="${user.avatar}" alt="${user.username}">
                <div class="post-user">
                    <p class="username">${user.username} ${user.verified ? '<img class="verify" src="pics/verifi1.png">' : ''}</p>
                    <p class="handle">@${user.handle} · ${post.timestamp}</p>
                </div>
            </div>
            <p class="post-content">${post.content}</p>
            <img class="post-image" src="${post.image}" alt="Post Image">
            <div class="post-stats">
                <span>${post.reactions} reactions</span> · 
                <span>${post.views} views</span>
            </div>
        </div>
    `;
}

// Function to render the post detail page
function renderPostDetail(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const user = getUserById(post.userId); // Fetch user details

    const detailContainer = document.querySelector(".meal");
    const detailHTML = `
        <div class="post-detail">
            <div class="post-header">
                <img class="profile-pic" src="${user.avatar}" alt="${user.username}">
                <div class="post-user">
                    <p class="username">${user.username} ${user.verified ? '<img class="verify" src="pics/verifi1.png">' : ''}</p>
                    <p class="handle">@${user.handle} · ${post.date}</p>
                </div>
            </div>
            <p class="post-content">${post.content}</p>
            <img class="post-image" src="${post.image}" alt="Post Image">
            <div class="post-stats">
                <span>${post.reactions} reactions</span> · 
                <span>${post.views} views</span>
            </div>
        </div>
    `;

    detailContainer.innerHTML = detailHTML;
    switchPage("meal");
}

// Function to render the user profile page
function renderUserProfile(userId) {
    const user = getUserById(userId);
    if (!user) return;

    const profileContainer = document.querySelector(".rety");

    const profileHTML = `
        <img class="frin" src="${user.coverPhoto}" alt="Cover Photo">
        <div>
            <img class="kor" src="${user.avatar}" alt="Profile Picture">
        </div>
        <div class="klr">
            <div class="drun">
                <div>
                    <p class="spe">${user.username}</p>
                </div>
                ${user.verified ? '<div><img class="verify" src="pics/verifi1.png"></div>' : ''}
            </div>
            <div class="druu">
                <div>
                    <p class="rkl">@${user.handle}</p>
                </div>
                <div class="drum">
                    <p class="swe">${user.badges}</p>
                    <img class="kiy" src="pics/kiddo.png">
                </div>
            </div>
            <div class="nin">
                <p class="rkl"><span class="bld">${user.following}</span> following &#183; 
                <span class="bld">${user.followers}</span> followers</p>
            </div>
            <div class="cha">
                <p>${user.bio}</p>
            </div>
            <div class="man">
                <div class="vre"><button class="aasw">Wallet</button></div>
                <div class="vre"><button class="aasw">Edit Profile</button></div>
            </div>
        </div>
    `;

    profileContainer.innerHTML = profileHTML;
    switchPage("profile"); // Switch to the user profile page
}

// Function to open a user profile from a post click
function openUserProfile(userId) {
    renderUserProfile(userId);
}

// Function to open post details from a post click
function openPostDetail(postId) {
    renderPostDetail(postId);
}

// Initial rendering of posts
function renderAllPosts() {
    const postContainer = document.querySelector(".food");
    postContainer.innerHTML = posts.map(renderPost).join(""); // Renders all posts
}

renderAllPosts(); // Render posts when the page loads