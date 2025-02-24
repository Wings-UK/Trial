const posts = [
    {
      id: 1,
      avatar: "pics/koreangirls.jpg",
      user: "@reddcinema",
      timestamp: "3 mins ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/20.jpg",
      content: "Right y'all, I’ve been dating a 36 year old for almost 6 months. I turn 20 in 5 days. How do I tell my parents about it? Have I mentioned he lives 5 states away? 💀💀",
    },
    {
        id: 2,
        avatar: "pics/memo4.jpg",
        user: "@lena",
        timestamp: "14 hours ago",
        date: "Feb 28, 2025 3:56 PM",
        image: "pics/pico7.webp",
        content: "My guy is 18 with 0 experience, I got lil past, and it bothers him every time. I like him a lot, but what should I do ladies?",
      },
      {
        id: 3,
        avatar: "pics/pico8.webp",
        user: "@partywithme",
        timestamp: "a day ago",
        date: "Feb 28, 2025 3:56 PM",
        image: "pics/memo1.jpg",
        content: "A few years ago, my city was avoided and badmouthed, now it has become a metropolitan that everyone wants to visit. You are welcome tho",
      }
  ];



function renderHomepage() {
    const postContainer = document.getElementById("flyer");

    posts.forEach(post => {
        const postHTML = `
             <div class="poster">
          <div class="cust-name"> 
            <div class="heading">
              <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="small-photo" src="${post.avatar}" loading="lazy"></a>
                
              </div>
              <div class="pos">
                <div>
                  <div class="link-wrapper">
                    <a class="home-click">
                      <div class="post1">
                        <div class="jerr">
                          <p class="jerry">${post.user}</p>
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
            <img class="laptop" src="${post.image}" loading= "lazy">
             
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

    if (post) {
        postContent.innerHTML = `
             <div class="cust-name"> 
            <div class="heading">
              <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="small-photo" src="${post.avatar}"></a>
             
              </div>
              <div class="pos">
                <div>
                  <div class="link-wrapper">
                    <a class="home-click">
                      <div class="post1">
                        <div class="jerr">
                          <p class="jerry">${post.user}</p>
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
                    <div class="tool">
                      <p>7.23pm &#183; Sept 23, 2024 </p>
                    </div> 
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
            <p class="tiri">${post.content}<br>
            </p>
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

        window.scrollTo(0, 0);
        switchPage("meal")
        
    }
}

function hideEverything() {
    document.getElementById("food").classList.add("hidden");
    document.getElementById("meal").classList.add("hidden");
}

function goBack() {
   switchPage("food");
}

function switchPage(pageId) {
   const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active", "show", "transition");
            page.style.display = "none";
    });

    const newPage = document.getElementById(pageId);
        newPage.style.display = "block";
        newPage.classList.add("active", "transition");

        setTimeout(() => {
            newPage.classList.add("show");
        }, 10);
}


renderHomepage();