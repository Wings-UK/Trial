const users = [
    {
      id: 1,
      username: "@reddcinema",
      name: "Redd Cinema",
      cover: "pics/pico9.png",
      avatar: "pics/koreangirls.jpg",
      bio: "Film lover & storyteller. I just vibe on here sometimes.. I'm a girl of course.🎬✨",
      followers: 1204,
      following: 340,
      location: "Los Angeles, CA"
    },
    {
      id: 2,
      username: "@lena",
      name: "Lena Marie",
      cover: "pics/pico5.webp",
      avatar: "pics/memo4.jpg",
      bio: "Dancing through life 💃 | Coffee addict | We love niggas that pay for shit ☕",
      followers: 896,
      following: 512,
      location: "New York, NY"
    }
];

const posts = [
    {
      id: 1,
      userId: 1,  // Refers to user with id 1 (@reddcinema)
      timestamp: "3 mins ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/20.jpg",
      content: "Right y'all, I’ve been dating a 36 year old for almost 6 months. I turn 20 in 5 days. How do I tell my parents about it? Have I mentioned he lives 5 states away? 💀💀",
    },
    {
      id: 2,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/pico7.webp",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    }
];



function renderHomepage() {
    const postContainer = document.getElementById("flyer");

    posts.forEach(post => {
        const user = users.find(u => u.id === post.userId); // Find user by ID

        if (!user) return; // Skip if no user found (shouldn't happen)

        const postHTML = `
            <div class="poster">
                <div class="cust-name"> 
                    <div class="heading">
                        <div class="small-photo1">
                            <a class="lino" onclick="showUserProfile(${user.id})">
                                <img class="small-photo" src="${user.avatar}" loading="lazy">
                            </a>
                        </div>
                        <div class="pos">
                            <div>
                                <div class="link-wrapper">
                                    <a class="home-click" onclick="showUserProfile(${user.id})">
                                        <div class="post1">
                                            <div class="jerr">
                                                <p class="jerry">${user.username}</p>
                                            </div>
                                            <div>
                                                <img class="verify" src="pics/verifi1.png">
                                            </div>
                                        </div>
                                    </a>
                                </div> 
                            </div>     
                            <div class="comp1">
                                <div class="cll">
                                    <p class="time">${post.timestamp}</p>
                                    <div class="tool">
                                        <p>7.23pm &#183; Sept 23, 2024 </p>
                                    </div> 
                                </div>
                            </div>
                        </div> 
                    </div>
                    <div class="dots">
                        <img class="dot" src="pics/duta.png">
                        <div class="tool">
                            <p>More</p>
                        </div> 
                    </div>      
                </div>
                <div class="laptop1">
                    <img class="laptop" src="${post.image}" loading="lazy">
                </div>
                <div class="tir">
                    <p class="tired">${post.content}<br>
                    <a class="home-click reer see-more" onclick="showDetail(${post.id})">see more</a></p>
                </div>
                
                <div class="lefto">
                    <div class="dick">
                    <div>
                        <img class="lefti" src="pics/lefti.png">
                    </div>
                    <div>
                    <p class="viewe">View all 142 dives</p>
                    </div>
                    </div>
                    <div class="twits">
                    <div>
                        <img class="lefti" src="pics/stats.png">
                    </div>
                    <div>
                        <p class="viewe">96.8K views</p>
                    </div>
                    </div>
                </div>
                <div class="reaction">
                    <div class="lovi">
                    <div class="emoji-container">
            <div class="emoji-wrapper" data-count="0">
                <img src="pics/lovv.png" alt="Like" class="emoji" data-static="pics/lovv.png" data-animated="pics/lovv.png">
                <div class="emoji-count">560</div>
            </div>
            <div class="emoji-wrapper" data-count="0">
                <img src="pics/21[1].png" alt="Love" class="emoji" data-static="pics/21[1].png" data-animated="pics/2.gif">
                <div class="emoji-count">21</div>
            </div>
            <div class="emoji-wrapper" data-count="0">
                <img src="pics/angry.gif" alt="Laugh" class="emoji" data-static="pics/angry.gif" data-animated="pics/angr.gif">
                <div class="emoji-count">78</div>
            </div>
        </div>
                    
                        
                    <div class="share1">
                        <div>
                        <img class="sharo" src="pics/plu.png">
                        </div> 
                    </div>
                    </div>
                    <div class="wish1">
                    <img class="twito" src="pics/twito.png">
                    </div>            
                </div>
            </div>
        `;

        postContainer.innerHTML += postHTML;
    });
}



function showDetail(postId) {
    const postDetail = document.getElementById("meal");
    const postContent = document.getElementById("nuba");

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const user = users.find(u => u.id === post.userId);
    if (!user) return;

    postContent.innerHTML = `
        <div class="cust-name"> 
            <div class="heading">
                <div class="small-photo1">
                    <a class="lino" onclick="showUserProfile(${user.id})">
                        <img class="small-photo" src="${user.avatar}">
                    </a>
                </div>
                <div class="pos">
                    <div>
                        <div class="link-wrapper">
                            <a class="home-click" onclick="showUserProfile(${user.id})">
                                <div class="post1">
                                    <div class="jerr">
                                        <p class="jerry">${user.username}</p>
                                    </div>
                                    <div>
                                        <img class="verify" src="pics/verifi1.png">
                                    </div>
                                </div>
                            </a>
                        </div> 
                    </div>     
                    <div class="comp1">
                        <div class="cll">
                            <p class="time">${post.date}</p>
                        </div>
                    </div>
                </div> 
            </div>
       

         <div>
              <p class="foni" onclick="
                const foniElem = document.querySelector('.foni');
                
                if (foniElem.innerHTML === 'Follow') {
                  foniElem.innerHTML = 'Following';
                  foniElem.classList.add('follow')
                } else {
                  foniElem.innerHTML = 'Follow';
                  foniElem.classList.remove('follow')
                }
              ">Follow</p>
            </div>


            <div class="dots">
              <img class="dot" src="pics/duta.png">
              <div class="tool">
                <p>More</p>
              </div> 
            </div>      
          </div>
        <div class="tir">
            <p class="tiri">${post.content}<br></p>
        </div>
        <div class="swet">
            <div class="laptop1">
                <img class="lapto" src="${post.image}">
            </div>
        </div>

        <div class="lefto">
            <div class="dick">
             <div>
              <p class="viewe"><span class="werey">615</span> reactions</p>
             </div>
             <div>
              <p class="viewe"><span class="werey">9</span> echoes</p>
             </div>
            </div>
            <div class="twits">
              <div>
                <img class="lefti" src="pics/stats.png">
              </div>
              <div>
                <p class="viewe">96.8K views</p>
               </div>
            </div>
          </div>
          <div class="reaction">
            <div class="small-photo1">
              <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/man3.webp"></a>
              <div class="vrea">
                <img class="luve" src="pics/lovv.png">
              </div>
            </div>   
            
            <div class="small-photo1">
              <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/girl2.webp"></a>
              <div class="vrea">
                <img class="luve" src="pics/lovv.png">
              </div>
            </div>   

            <div class="small-photo1">
              <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/man4.jpg"></a>
              <div class="vrea">
                <img class="luve" src="pics/2.gif">
              </div>
            </div>   

            <div class="small-photo1">
              <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/mypics.jpg"></a>
              <div class="vrea">
                <img class="luve" src="pics/lovv.png">
              </div>
            </div>   

            <div class="small-photo1">
              <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="hui" src="pics/pico8.webp"></a>
              <div class="vrea">
                <img class="luve" src="pics/3.gif">
              </div>
            </div>   
          </div>
    `;

    switchPage("meal");
}



function showUserProfile(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const profileContainer = document.getElementById("profile");
    const profileIreti = document.getElementById("ireti");
    
    profileIreti.innerHTML = `
         <img class="frin" src="${user.cover}">
            <div>
              <img class="kor" src="${user.avatar}">
            </div>
            <div class="klr">
              <div class="drun">
                <div>
                  <p class="spe">${user.username}</p>
                </div>
                <div>
                  <img class="verify" src="pics/verifi1.png">
                </div>
              </div>
              <div class="druu">
                <div>
                  <p class="rkl">${user.location}</p>
                </div>
                <div class="drum">
                  <p class="swe">4</p>
                  <img class="kiy" src="pics/kiddo.png">
                </div>
              </div>
              <div class="nin">
                <p class="rkl"><span class="bld">${user.following}</span>following &#183; <span class="bld">${user.followers}</span>followers</p>
              </div>
              <div class="cha">
                <p>${user.bio}</p>
              </div>
              <div class="man">
                <div class="vre">
                  <button class="aasw">Wallet</button>
                </div>
                <div class="vre">
                  <button class="aasw">Edit Profile</button>
                </div>
              </div>
            </div>
            <div class="ewe">
              <div class="yeb">
                <img class="dee" src="pics/apps.png">
              </div>
              <div class="yeb">
               <a href="Retail-Desktop-MyAccount-Storefront.html">
                <img class="dee" src="pics/browser.png">
               </a>

              </div>
              <div class="yeb">
                <img class="dee" src="pics/bren.png">
              </div>

            </div>
            
            <div class="mansonro">
            <div class="masonri">
              <!-- Left Column -->
              <div class="column left-column">
            
              </div>
  
              <div class="column right-column">
                
              </div>
            </div>
          </div>
    `;
    
    switchPage("profile");

}



function goBack() {
    switchPage("food");
 
    setTimeout (() => {
     const savedScrollPosition = sessionStorage.getItem("scrollPosition");
 
     if (savedScrollPosition) {
         window.scrollTo(0, parseInt(savedScrollPosition));
     }
    }, 50);
 }
 
 function switchPage(pageId) {
   if (pageId !== "food" && pageId !== "profile") {
    sessionStorage.setItem("scrollPosition", window.scrollY);
   }

    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.remove("active"));

    const newPage = document.getElementById(pageId);
    newPage.classList.add("active");

    // Add history entry (only push if not the same as current state)
    if (!history.state || history.state.page !== pageId) {
        history.pushState({ page: pageId }, "", `#${pageId}`);
    }
    
    if (pageId === "food") {
      setTimeout(() => {
        const savedScrollPosition = sessionStorage.getItem("scrollPosition");
        if (savedScrollPosition) {
          window.scrollTo(0, parseInt(savedScrollPosition));
        }
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
}
 
 window.onpopstate = function (event) {
    if (event.state && event.state.page) {
        switchPage(event.state.page);
    } else {
        switchPage("food");
        history.replaceState({ page: "food" }, "", "#food"); // Ensure homepage is always in history
    }

    // Restore scroll position
    const savedScrollPosition = sessionStorage.getItem("scrollPosition");
    if (savedScrollPosition) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollPosition));
        }, 0);
    }
};
 
 document.addEventListener("DOMContentLoaded", function () {
  if (!history.state) {
     history.replaceState({ page:"food" }, "", "#food");
  }
     switchPage("food");
 });
 
 
 
 
 
 renderHomepage();