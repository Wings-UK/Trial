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
    },
    {

      id: 3,
      username: "@nomsa",
      name: "Lena Marie",
      cover: "pics/d.jpg",
      avatar: "pics/b.jpg",
      bio: "Dancing through life 💃 | Coffee addict | We love niggas that pay for shit ☕",
      followers: 63,
      following: 556,
      location: "Madras, OR"
    }
];

const posts = [
    {
      id: 1,
      userId: 1,  // Refers to user with id 1 (@reddcinema)
      timestamp: "11 mins ago",
      video: "pics/single.mp4",
      date: "Feb 28, 2025 3:56 PM",
      content: "Right y'all, I’ve been dating a 36 year old for almost 6 months. I turn 20 in 5 days. How do I tell my parents about it? Have I mentioned he lives 5 states away? 💀💀",
    },
    {
      id: 2,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "6 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/a.jpg",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
    {
      id: 3,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "4 mins ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/e.jpg",
      content: "So as a prank, I started texting my best friend on one of those text numbers pretending to be this dube she was in love with but he did her dirty. And this girl is sooo excited that now I feel guilty😭 should I tell or just stop texting and pretend it never happened please help.",
    },
    {
      id: 4,
      userId: 1,  // Refers to user with id 2 (@lena)
      timestamp: "an hour ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/f.jpg",
      content: "do you guys think that how a child turns out is 100% the parents fault or do you think that no matter how good someone may parent their child they may still turn out bad because that's just who they are?",
    },
    {
      id: 5,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "just now",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/g.jpg",
      content: "I get back to my hotel and realize housekeeping cleaned room and stole my damn cocaine and I just called down to the front desk and asked for it... the lady was like your what? “my bag of cocaine sweetie”... they got me fucked up if they think I ain’t gonna ask for my shit.",
    },
    {
      id: 6,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "4 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/h.jpg",
      content: "I had my daughter today at 10:29am it was very long and emotional labor but it was worth every second she’s perfect 💞 her registry is still available please contribute if you can me and her both have a long road ahead of us. Thank you everyone who did what they could💕💕",
    },
    {
      id: 7,
      userId: 1,  // Refers to user with id 2 (@lena)
      timestamp: "2 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/i.jpg",
      content: "So yall I been dating this girl. (A stud) and she went back to the previous girl she was dating & kinda like tryna have us both. She been with her these past few days. & im tryna see the exact words to say to get her over here so I can sneak my key back from her?😩",
    },
    {
      id: 8,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "9 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/j.jpg",
      content: "why do mothers treat they daughters like they the scum? me & my momma can’t seem to get along at all why i get off a 10 FUCKING HOUR SHIFT OVERNIGHT TO BE EXACT & my “ ROOM” that i pay for monthly which i share w a fucking 12 years old and all my shit is scatter? bro im pissed",
    },
    {
      id: 9,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "3 mins ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/k.jpg",
      content: "I don't think many people talk about the beauty of ageing, especially with grey hair. I want to age beautifully old with grey hair. I feel like some ppl have such a big fear of ageing to the point where they will try their hardest to look young which is kinda sad",
    },
    {
      id: 10,
      userId: 1,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/pico7.webp",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
    {
      id: 11,
      userId: 2,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/pico7.webp",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
    {
      id: 12,
      userId: 3,  // Refers to user with id 2 (@lena)
      timestamp: "14 hours ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/pico7.webp",
      content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
    },
  
];



function renderHomepage() {
    const postContainer = document.getElementById("flyer");

    posts.forEach(post => {
        const user = users.find(u => u.id === post.userId); // Find user by ID

        if (!user) return; // Skip if no user found (shouldn't happen)
        const textLimit = (post.image || post.video) ? 150 : 300;

        // Determine if the post has a video
        const hasVideo = post.video ? true : false;
        const hasImage = post.image ? true : false;

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
                
                ${hasImage ? `
                <div class="laptop1">
                    <img class="laptop" src="${post.image}" loading="lazy">
                </div>
                ` : ''}
                
                ${hasVideo ? `
                <div class="video-container">
                    <div class="video-container laptop1">
                        <video class="video-player laptop" preload="metadata" poster="${post.videoPoster || ''}">
                            <source src="${post.video}" type="video/mp4">
                        </video>
                        <div class="play-icon"></div>
                        <div class="duration">0:00</div>
                    </div>
                </div>

                <div class="fullscreen-video">
                    <img class="back-button" src="pics/backa.png">
                    <video class="fullscreen-player">
                        <source src="${post.video}" type="video/mp4">
                    </video>
                    
                    <div class="custom-controls">
                        <div class="tiktok">
                            <div class="gretu">
                                <img class="tuk" src="pics/lovv.png">
                                <div>
                                    <p class="icun">${post.likes || 358}</p>
                                </div>
                            </div>
                            <div class="gretu">
                                <img class="tuk" src="pics/chat.png">
                                <div>
                                    <p class="icun">${post.comments || 36}</p>
                                </div>
                            </div>
                            <div class="gretu">
                                <img class="tuk" src="pics/repost.png">
                                <div>
                                    <p class="icun">${post.reposts || 0}</p>
                                </div>
                            </div>
                            <div class="gretu">
                                <img class="tuk" src="pics/naira.png">
                                <div>
                                    <p class="icun">${post.donations || 8}</p>
                                </div>
                            </div>
                        </div>
                        <div class="cust-name intro"> 
                            <div class="heading">
                                <div class="small-photo1">
                                
                                    <img class="fuck" src="${user.avatar}" onclick="showUserProfile(${user.id})">
                                    
                                </div>
                                <div class="pos">
                                    <div>
                                        <div class="link-wrapper">
                                            <a class="home-click" onclick="showUserProfile(${user.id})">
                                                <div class="post1">
                                                    <div class="jerr">
                                                        <p class="jerry bigg">${user.username}</p>
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
                                            <p class="brite">${post.timestamp}</p>
                                            <div class="tool">
                                                <p>7.23pm &#183; Sept 23, 2024 </p>
                                            </div> 
                                        </div>
                                    </div>
                                </div> 
                            </div>
                            <div class="marhun">
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
                        </div>
                        <div class="tirr bordu">
                            <p class="tired">${shortenText(post.content, 50, true)}</p>
                        </div>
                        
                        <div class="progress-bar">
                            <div class="progress"></div>
                        </div>
                        <div class="time-display">0:00 / 0:00</div>
                    </div>
                    <div class="yese"></div>
                    
                    <div class="commont">
                        <input class="haja" placeholder="Say something...">
                    </div>
                </div>
                ` : ''}
                
                <div class="tir" onclick="showDetail(${post.id})">
                    <p class="tired">${shortenText(post.content, textLimit, true)}</p>
                </div>
                
                <div class="lefto">
                    <div class="dick">
                        <div>
                            <img class="lefti" src="pics/lefti.png">
                        </div>
                        <div>
                            <p class="viewe">View all ${post.diveCount || 142} dives</p>
                        </div>
                    </div>
                    <div class="twits">
                        <div>
                            <img class="lefti" src="pics/stats.png">
                        </div>
                        <div>
                            <p class="viewe">${post.views || '96.8K'} views</p>
                        </div>
                    </div>
                </div>
                <div class="reaction">
                    <div class="lovi">
                        <div class="emoji-container">
                            <div class="emoji-wrapper" data-count="0">
                                <img src="pics/lovv.png" alt="Like" class="emoji" data-static="pics/lovv.png" data-animated="pics/lovv.png">
                                <div class="emoji-count">${post.likeCount || 560}</div>
                            </div>
                            <div class="emoji-wrapper" data-count="0">
                                <img src="pics/21[1].png" alt="Love" class="emoji" data-static="pics/21[1].png" data-animated="pics/2.gif">
                                <div class="emoji-count">${post.loveCount || 21}</div>
                            </div>
                            <div class="emoji-wrapper" data-count="0">
                                <img src="pics/angry.gif" alt="Laugh" class="emoji" data-static="pics/angry.gif" data-animated="pics/angr.gif">
                                <div class="emoji-count">${post.angryCount || 78}</div>
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

    // Initialize video functionality after rendering posts
    initializeVideoPlayers();
}



function showDetail(postId) {
    const postDetail = document.getElementById("meal");
    const postContent = document.getElementById("nuba");

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const user = users.find(u => u.id === post.userId);
    if (!user) return;
    
    const commentTextarea = document.querySelector('.comment-textarea');
    if (commentTextarea) {
        commentTextarea.placeholder = `Reply to ${user.username}...`;
    }

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
        ${post.image ? `
        <div class="swet">
            <div class="laptop1">
                <img class="lapto" src="${post.image}">
            </div>
        </div>
        ` : ''}
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
                  <button class="aasw">Follow</button>
                </div>
                <div class="vre">
                  <button class="aasw">1 : 1</button>
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
    renderUserPosts(userId);

}
function renderUserPosts(userId) {
    const userPosts = posts.filter(post => post.userId === userId);
    const leftColumn = document.querySelector(".left-column");
    const rightColumn = document.querySelector(".right-column");
    

    if (!leftColumn || !rightColumn) return;

  

    userPosts.forEach((post, index) => {
      const textLimit = post.image ? 40 : 200;
        const postHTML = `
            <div class="masonry" onclick="showDetail(${post.id})">
                  ${post.image ? `
                  <img src="${post.image}">
                  ` : ''}
                  <div class="contentma">
                    <p class="partner">${shortenText(post.content, textLimit, false)}</p>
                    <div class="bioi">
                      <div class="fred">
                        <img class="brekca" src="pics/chat-pic.jpg">
                        <p class="goo">@babygirl</p>
                      </div>
                      <div class="fred">
                        <img class="pen" src="pics/lovv.png">
                        <p class="goo">2.9K</p>
                      </div>
                    </div>
                  </div>
                </div>
        `;

        if (index % 2 === 0) {
            leftColumn.innerHTML += postHTML;
        } else {
            rightColumn.innerHTML += postHTML;
        }
    });
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

function shortenText(text, limit, showSeeMore = true) {
    if (text.length <= limit) return text; // No need to shorten

    let shortened = text.slice(0, limit); // Cut at the limit
    let lastSpace = shortened.lastIndexOf(" "); // Find last space

    if (lastSpace > 0) {
        shortened = shortened.slice(0, lastSpace); // Cut at last whole word
    }

    return showSeeMore ? shortened + `...<br><span class="reer">see more</span>` : shortened + "..."; 
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